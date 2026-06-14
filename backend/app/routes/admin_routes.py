from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.models import College, User, UserPreference, user_wishlist, Course, EntranceExam
from app.auth import create_access_token
from app.config import settings
from pydantic import BaseModel
import csv
import io
import random
import hashlib
import time
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

router = APIRouter(prefix="/admin", tags=["Admin"])


def _admin_password_hash() -> str:
    return hashlib.sha256(settings.ADMIN_PASSWORD.encode()).hexdigest()

# In-memory OTP store (in production, use Redis)
_otp_store: dict = {}  # {email: {"otp": str, "expires": float}}


class AdminLoginRequest(BaseModel):
    email: str
    password: str


class AdminOTPVerifyRequest(BaseModel):
    email: str
    otp: str


def _send_otp_email(to_email: str, otp: str) -> bool:
    """Send OTP to admin email via Gmail SMTP."""
    if not settings.SMTP_PASSWORD:
        print("⚠️ SMTP_PASSWORD not set in .env - cannot send email")
        return False
    try:
        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_EMAIL
        msg['To'] = to_email
        msg['Subject'] = f'🔐 CollegeSathi Admin OTP: {otp}'
        
        body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <div style="max-width: 400px; margin: 0 auto; text-align: center;">
                <h2 style="color: #4f46e5;">CollegeSathi Admin Access</h2>
                <p style="color: #6b7280;">Your one-time verification code is:</p>
                <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1f2937; margin: 20px 0; padding: 16px; background: #f3f4f6; border-radius: 12px;">
                    {otp}
                </div>
                <p style="color: #9ca3af; font-size: 14px;">This code expires in 5 minutes. Do not share it with anyone.</p>
            </div>
        </body>
        </html>
        """
        msg.attach(MIMEText(body, 'html'))
        
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(settings.SMTP_EMAIL, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_EMAIL, to_email, msg.as_string())
        
        print(f"✅ OTP email sent to {to_email}")
        return True
    except Exception as e:
        print(f"⚠️ Email sending failed: {e}")
        return False


@router.post("/login")
def admin_login(data: AdminLoginRequest):
    """Step 1: Verify admin email + password, then send OTP via email."""
    email = data.email.strip().lower()
    admin_email = settings.ADMIN_EMAIL.strip().lower()

    if email != admin_email:
        raise HTTPException(status_code=401, detail="Invalid admin credentials")

    password_hash = hashlib.sha256(data.password.encode()).hexdigest()
    if password_hash != _admin_password_hash():
        raise HTTPException(status_code=401, detail="Invalid admin credentials")

    # Generate OTP
    otp = str(random.randint(100000, 999999))
    _otp_store[admin_email] = {"otp": otp, "expires": time.time() + 300}  # 5 min expiry

    # Send OTP via email
    email_sent = _send_otp_email(settings.ADMIN_EMAIL, otp)

    if email_sent:
        return {"message": "OTP sent to your email address", "email": admin_email}
    else:
        # Fallback: if email fails, still allow (show in console for dev)
        print(f"\n🔐 Admin OTP for {settings.ADMIN_EMAIL}: {otp}\n")
        return {
            "message": "OTP generated (email delivery failed — use fallback code below)",
            "email": admin_email,
            "otp_hint": otp,
        }


@router.post("/verify-otp")
def admin_verify_otp(data: AdminOTPVerifyRequest):
    """Step 2: Verify OTP and return admin token."""
    email = data.email.strip().lower()
    admin_email = settings.ADMIN_EMAIL.strip().lower()

    if email != admin_email:
        raise HTTPException(status_code=401, detail="Invalid admin email")

    stored = _otp_store.get(admin_email)
    if not stored:
        raise HTTPException(status_code=401, detail="No OTP found. Please login again.")

    if time.time() > stored["expires"]:
        del _otp_store[admin_email]
        raise HTTPException(status_code=401, detail="OTP expired. Please login again.")

    if data.otp.strip() != stored["otp"]:
        raise HTTPException(status_code=401, detail="Invalid OTP")

    # Clear OTP
    del _otp_store[admin_email]
    
    # Create admin token
    token = create_access_token({"sub": 0, "role": "admin", "email": settings.ADMIN_EMAIL})
    return {"access_token": token, "role": "admin"}


@router.get("/export/colleges")
def export_colleges_csv(db: Session = Depends(get_db)):
    """Export all colleges data as CSV."""
    colleges = db.query(College).options(
        joinedload(College.courses),
        joinedload(College.exams_accepted),
    ).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Name", "State", "City", "College Type", "NIRF Ranking", "NAAC Grade",
        "Established Year", "Admission Status", "Application Start", "Application End",
        "Fee Min (₹)", "Fee Max (₹)", "Total Seats", "Courses", "Exams Accepted",
        "Website", "Application URL", "Notification PDF"
    ])

    for c in colleges:
        courses_str = "; ".join([f"{co.short_name or co.name} ({co.level})" for co in c.courses])
        exams_str = "; ".join([e.short_name for e in c.exams_accepted])
        writer.writerow([
            c.id, c.name, c.state, c.city, c.college_type, c.nirf_ranking, c.naac_grade,
            c.established_year, c.admission_status,
            c.application_start_date.strftime("%Y-%m-%d") if c.application_start_date else "",
            c.application_end_date.strftime("%Y-%m-%d") if c.application_end_date else "",
            c.fee_min, c.fee_max, c.total_seats, courses_str, exams_str,
            c.website, c.application_url, c.notification_pdf_url
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=colleges.csv"}
    )


@router.get("/export/users")
def export_users_csv(db: Session = Depends(get_db)):
    """Export all users data as CSV."""
    users = db.query(User).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Name", "Email", "Phone", "Google ID", "Created At"])

    for u in users:
        writer.writerow([
            u.id, u.name, u.email, u.phone, u.google_id,
            u.created_at.strftime("%Y-%m-%d %H:%M") if u.created_at else ""
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=users.csv"}
    )


@router.get("/export/wishlists")
def export_wishlists_csv(db: Session = Depends(get_db)):
    """Export user-college wishlist preferences as CSV."""
    users = db.query(User).options(joinedload(User.wishlist)).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["User ID", "User Name", "User Email", "College ID", "College Name", "State", "College Type"])

    for u in users:
        for c in u.wishlist:
            writer.writerow([u.id, u.name, u.email, c.id, c.name, c.state, c.college_type])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=user_wishlists.csv"}
    )


@router.get("/stats")
def get_admin_stats(db: Session = Depends(get_db)):
    """Get dashboard stats for admin."""
    total_colleges = db.query(College).count()
    total_users = db.query(User).count()
    total_courses = db.query(Course).count()
    total_exams = db.query(EntranceExam).count()

    open_colleges = db.query(College).filter(College.admission_status == "Open").count()
    closing_soon = db.query(College).filter(College.admission_status == "Closing Soon").count()

    # Colleges by type
    from sqlalchemy import func
    type_counts = db.query(College.college_type, func.count(College.id)).group_by(College.college_type).all()
    state_counts = db.query(College.state, func.count(College.id)).group_by(College.state).order_by(func.count(College.id).desc()).limit(10).all()
    status_counts = db.query(College.admission_status, func.count(College.id)).group_by(College.admission_status).all()

    return {
        "total_colleges": total_colleges,
        "total_users": total_users,
        "total_courses": total_courses,
        "total_exams": total_exams,
        "open_colleges": open_colleges,
        "closing_soon": closing_soon,
        "by_type": {t: c for t, c in type_counts},
        "by_state_top10": {s: c for s, c in state_counts},
        "by_status": {s: c for s, c in status_counts},
    }


@router.get("/colleges")
def list_all_colleges_admin(
    page: int = 1,
    per_page: int = 50,
    db: Session = Depends(get_db),
):
    """Get paginated college list for admin table view."""
    total = db.query(College).count()
    colleges = db.query(College).options(
        joinedload(College.courses),
        joinedload(College.exams_accepted),
    ).offset((page - 1) * per_page).limit(per_page).all()

    return {
        "colleges": [
            {
                "id": c.id,
                "name": c.name,
                "state": c.state,
                "city": c.city,
                "college_type": c.college_type,
                "nirf_ranking": c.nirf_ranking,
                "naac_grade": c.naac_grade,
                "admission_status": c.admission_status,
                "application_url": c.application_url,
                "fee_min": c.fee_min,
                "fee_max": c.fee_max,
                "total_seats": c.total_seats,
                "courses_count": len(c.courses),
                "exams": [e.short_name for e in c.exams_accepted],
                "has_edits": bool(c.admin_edited_fields and c.admin_edited_fields != "[]"),
            }
            for c in colleges
        ],
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": (total + per_page - 1) // per_page,
    }


@router.get("/users")
def list_all_users_admin(
    page: int = 1,
    per_page: int = 50,
    db: Session = Depends(get_db),
):
    """Get paginated user list for admin table view."""
    total = db.query(User).count()
    users = db.query(User).options(joinedload(User.wishlist)).offset((page - 1) * per_page).limit(per_page).all()

    return {
        "users": [
            {
                "id": u.id,
                "name": u.name,
                "email": u.email,
                "phone": u.phone,
                "created_at": u.created_at.isoformat() if u.created_at else None,
                "wishlist_count": len(u.wishlist),
            }
            for u in users
        ],
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": (total + per_page - 1) // per_page,
    }


class AdminCollegeUpdate(BaseModel):
    name: str | None = None
    state: str | None = None
    city: str | None = None
    college_type: str | None = None
    established_year: int | None = None
    nirf_ranking: int | None = None
    naac_grade: str | None = None
    website: str | None = None
    description: str | None = None
    admission_status: str | None = None
    application_start_date: str | None = None
    application_end_date: str | None = None
    application_url: str | None = None
    notification_pdf_url: str | None = None
    fee_min: int | None = None
    fee_max: int | None = None
    total_seats: int | None = None


@router.get("/colleges/{college_id}")
def get_college_admin(college_id: int, db: Session = Depends(get_db)):
    """Get full college details for admin editing."""
    college = db.query(College).options(
        joinedload(College.courses),
        joinedload(College.exams_accepted),
    ).filter(College.id == college_id).first()
    
    if not college:
        raise HTTPException(status_code=404, detail="College not found")
    
    import json
    edited_fields = json.loads(college.admin_edited_fields or "[]")
    
    return {
        "id": college.id,
        "name": college.name,
        "state": college.state,
        "city": college.city,
        "college_type": college.college_type,
        "established_year": college.established_year,
        "nirf_ranking": college.nirf_ranking,
        "naac_grade": college.naac_grade,
        "website": college.website,
        "description": college.description,
        "admission_status": college.admission_status,
        "application_start_date": college.application_start_date.isoformat() if college.application_start_date else None,
        "application_end_date": college.application_end_date.isoformat() if college.application_end_date else None,
        "application_url": college.application_url,
        "notification_pdf_url": college.notification_pdf_url,
        "fee_min": college.fee_min,
        "fee_max": college.fee_max,
        "total_seats": college.total_seats,
        "admin_edited_fields": edited_fields,
        "courses": [{"id": c.id, "name": c.name, "level": c.level} for c in college.courses],
        "exams": [{"id": e.id, "short_name": e.short_name, "name": e.name} for e in college.exams_accepted],
    }


@router.put("/colleges/{college_id}")
def update_college_admin(college_id: int, data: AdminCollegeUpdate, db: Session = Depends(get_db)):
    """Update college fields. Tracks which fields were manually edited by admin."""
    college = db.query(College).filter(College.id == college_id).first()
    if not college:
        raise HTTPException(status_code=404, detail="College not found")
    
    import json
    from datetime import datetime
    
    edited_fields = json.loads(college.admin_edited_fields or "[]")
    updated_data = data.model_dump(exclude_none=True)
    
    for field, value in updated_data.items():
        # Handle date fields
        if field in ("application_start_date", "application_end_date") and value:
            try:
                value = datetime.fromisoformat(value)
            except (ValueError, TypeError):
                continue
        
        setattr(college, field, value)
        
        # Track this field as admin-edited
        if field not in edited_fields:
            edited_fields.append(field)
    
    college.admin_edited_fields = json.dumps(edited_fields)
    db.commit()
    db.refresh(college)
    
    return {"message": f"Updated {len(updated_data)} fields", "edited_fields": edited_fields}

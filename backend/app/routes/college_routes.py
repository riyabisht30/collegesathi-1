from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_, func
from typing import Optional, List
from app.database import get_db
from app.models.models import College, Course, EntranceExam, college_courses, college_exams
from app.schemas import CollegeListResponse, CollegeDetailResponse, PaginatedCollegesResponse, CollegeFilters

router = APIRouter(prefix="/colleges", tags=["Colleges"])


@router.get("", response_model=PaginatedCollegesResponse)
def list_colleges(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    states: Optional[str] = Query(None, description="Comma-separated states"),
    course_levels: Optional[str] = Query(None, description="Comma-separated: UG,PG,PhD"),
    streams: Optional[str] = Query(None, description="Comma-separated streams"),
    college_types: Optional[str] = Query(None, description="Comma-separated: Government,Private,Deemed"),
    exams: Optional[str] = Query(None, description="Comma-separated exam short names"),
    fee_min: Optional[int] = Query(None),
    fee_max: Optional[int] = Query(None),
    admission_status: Optional[str] = Query(None, description="Comma-separated statuses"),
    search: Optional[str] = Query(None),
    sort_by: str = Query("nirf_ranking", description="nirf_ranking, fee_min, name, admission_status"),
    sort_order: str = Query("asc", description="asc or desc"),
    db: Session = Depends(get_db),
):
    query = db.query(College).options(
        joinedload(College.courses),
        joinedload(College.exams_accepted),
    )

    # Apply filters
    if search:
        query = query.filter(
            or_(
                College.name.ilike(f"%{search}%"),
                College.city.ilike(f"%{search}%"),
                College.state.ilike(f"%{search}%"),
            )
        )

    if states:
        state_list = [s.strip() for s in states.split(",")]
        query = query.filter(College.state.in_(state_list))

    if college_types:
        type_list = [t.strip() for t in college_types.split(",")]
        query = query.filter(College.college_type.in_(type_list))

    if course_levels:
        level_list = [l.strip() for l in course_levels.split(",")]
        query = query.join(College.courses).filter(Course.level.in_(level_list))

    if streams:
        stream_list = [s.strip() for s in streams.split(",")]
        query = query.join(College.courses).filter(Course.stream.in_(stream_list))

    if exams:
        exam_list = [e.strip() for e in exams.split(",")]
        query = query.join(College.exams_accepted).filter(EntranceExam.short_name.in_(exam_list))

    if fee_min is not None:
        query = query.filter(College.fee_min >= fee_min)
    if fee_max is not None:
        query = query.filter(College.fee_max <= fee_max)

    if admission_status:
        status_list = [s.strip() for s in admission_status.split(",")]
        query = query.filter(College.admission_status.in_(status_list))

    # Count total before pagination
    total = query.distinct().count()

    # Sort
    sort_column = getattr(College, sort_by, College.nirf_ranking)
    if sort_order == "desc":
        query = query.order_by(sort_column.desc().nullslast())
    else:
        query = query.order_by(sort_column.asc().nullslast())

    # Paginate
    colleges = query.distinct().offset((page - 1) * per_page).limit(per_page).all()
    total_pages = (total + per_page - 1) // per_page

    return PaginatedCollegesResponse(
        colleges=[CollegeListResponse.model_validate(c) for c in colleges],
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages,
    )


@router.get("/{college_id}", response_model=CollegeDetailResponse)
def get_college(college_id: int, db: Session = Depends(get_db)):
    college = (
        db.query(College)
        .options(
            joinedload(College.courses),
            joinedload(College.exams_accepted),
            joinedload(College.cutoffs),
            joinedload(College.admission_rounds),
        )
        .filter(College.id == college_id)
        .first()
    )
    if not college:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="College not found")
    return CollegeDetailResponse.model_validate(college)


@router.get("/filters/options")
def get_filter_options(db: Session = Depends(get_db)):
    """Get all available filter options for the frontend dropdowns."""
    states = db.query(College.state).distinct().order_by(College.state).all()
    college_types = db.query(College.college_type).distinct().all()
    courses = db.query(Course).all()
    exams = db.query(EntranceExam).all()
    
    streams = db.query(Course.stream).distinct().all()
    levels = db.query(Course.level).distinct().all()

    return {
        "states": [s[0] for s in states],
        "college_types": [t[0] for t in college_types],
        "streams": [s[0] for s in streams],
        "course_levels": [l[0] for l in levels],
        "exams": [{"short_name": e.short_name, "name": e.name} for e in exams],
    }

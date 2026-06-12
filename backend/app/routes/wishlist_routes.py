from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, College, user_wishlist
from app.schemas import WishlistToggleRequest, WishlistResponse, CollegeListResponse
from app.auth import require_auth
from sqlalchemy.orm import joinedload

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])


@router.get("", response_model=list[CollegeListResponse])
def get_wishlist(user: User = Depends(require_auth), db: Session = Depends(get_db)):
    """Get all wishlisted colleges for the current user."""
    user_with_wishlist = (
        db.query(User)
        .options(joinedload(User.wishlist).joinedload(College.courses))
        .filter(User.id == user.id)
        .first()
    )
    return [CollegeListResponse.model_validate(c) for c in user_with_wishlist.wishlist]


@router.post("/toggle")
def toggle_wishlist(
    data: WishlistToggleRequest,
    user: User = Depends(require_auth),
    db: Session = Depends(get_db),
):
    """Add or remove a college from wishlist."""
    college = db.query(College).filter(College.id == data.college_id).first()
    if not college:
        raise HTTPException(status_code=404, detail="College not found")

    # Check if already wishlisted
    user_obj = db.query(User).options(joinedload(User.wishlist)).filter(User.id == user.id).first()
    
    if college in user_obj.wishlist:
        user_obj.wishlist.remove(college)
        db.commit()
        return {"status": "removed", "college_id": data.college_id}
    else:
        user_obj.wishlist.append(college)
        db.commit()
        return {"status": "added", "college_id": data.college_id}


@router.get("/ids", response_model=WishlistResponse)
def get_wishlist_ids(user: User = Depends(require_auth), db: Session = Depends(get_db)):
    """Get just the IDs of wishlisted colleges (for UI state)."""
    user_obj = db.query(User).options(joinedload(User.wishlist)).filter(User.id == user.id).first()
    return WishlistResponse(college_ids=[c.id for c in user_obj.wishlist])

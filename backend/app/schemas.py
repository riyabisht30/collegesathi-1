from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
import json


# ---- Auth Schemas ----
class UserCreate(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    name: Optional[str] = None
    password: Optional[str] = None


class UserLogin(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None


class GoogleAuthRequest(BaseModel):
    token: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserResponse(BaseModel):
    id: int
    email: Optional[str]
    phone: Optional[str]
    name: Optional[str]
    avatar_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ---- College Schemas ----
class CourseResponse(BaseModel):
    id: int
    name: str
    short_name: Optional[str]
    level: str
    stream: str
    duration_years: Optional[float]

    class Config:
        from_attributes = True


class ExamResponse(BaseModel):
    id: int
    name: str
    short_name: str
    level: str
    stream: str

    class Config:
        from_attributes = True


class CutoffResponse(BaseModel):
    id: int
    year: int
    round_number: int
    category: str
    cutoff_score: Optional[float]
    cutoff_rank: Optional[int]
    cutoff_percentile: Optional[float]

    class Config:
        from_attributes = True


class AdmissionRoundResponse(BaseModel):
    id: int
    round_name: str
    round_number: int
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    status: str
    description: Optional[str]

    class Config:
        from_attributes = True


class CollegeListResponse(BaseModel):
    id: int
    name: str
    short_name: Optional[str]
    state: str
    city: str
    college_type: str
    nirf_ranking: Optional[int]
    naac_grade: Optional[str]
    admission_status: str
    application_end_date: Optional[datetime]
    fee_min: Optional[int]
    fee_max: Optional[int]
    total_seats: Optional[int]
    logo_url: Optional[str]
    courses: List[CourseResponse] = []
    exams_accepted: List[ExamResponse] = []

    class Config:
        from_attributes = True


class CollegeDetailResponse(CollegeListResponse):
    address: Optional[str]
    established_year: Optional[int]
    website: Optional[str]
    description: Optional[str]
    application_start_date: Optional[datetime]
    application_url: Optional[str]
    notification_pdf_url: Optional[str]
    admin_edited_fields: List[str] = []
    cutoffs: List[CutoffResponse] = []
    admission_rounds: List[AdmissionRoundResponse] = []

    @field_validator('admin_edited_fields', mode='before')
    @classmethod
    def parse_edited_fields(cls, v):
        if isinstance(v, str):
            return json.loads(v) if v else []
        return v or []


class PaginatedCollegesResponse(BaseModel):
    colleges: List[CollegeListResponse]
    total: int
    page: int
    per_page: int
    total_pages: int


# ---- Filter Schemas ----
class CollegeFilters(BaseModel):
    states: Optional[List[str]] = None
    course_levels: Optional[List[str]] = None  # UG, PG, PhD
    streams: Optional[List[str]] = None
    college_types: Optional[List[str]] = None
    exams: Optional[List[str]] = None
    fee_min: Optional[int] = None
    fee_max: Optional[int] = None
    admission_status: Optional[List[str]] = None
    search: Optional[str] = None
    sort_by: Optional[str] = "nirf_ranking"  # nirf_ranking, fee_min, name
    sort_order: Optional[str] = "asc"


# ---- Recommendation Schemas ----
class QuestionnaireRequest(BaseModel):
    preferred_states: List[str] = []
    course_level: str  # UG, PG, PhD
    streams: List[str] = []
    budget_max: Optional[int] = None
    entrance_exams: List[str] = []  # exam short names
    exam_scores: Optional[dict] = {}  # {"JEE_MAINS": 95.5, "NEET": 650}
    college_type: List[str] = []  # Government, Private, Deemed
    preferred_city: Optional[str] = None


class RecommendationResponse(BaseModel):
    colleges: List[CollegeListResponse]
    total_matches: int
    criteria_summary: dict


# ---- Wishlist Schemas ----
class WishlistToggleRequest(BaseModel):
    college_id: int


class WishlistResponse(BaseModel):
    college_ids: List[int]

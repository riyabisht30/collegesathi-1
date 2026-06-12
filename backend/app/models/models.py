from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Table, Text, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


# Association tables
user_wishlist = Table(
    "user_wishlist",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE")),
    Column("college_id", Integer, ForeignKey("colleges.id", ondelete="CASCADE")),
)

college_courses = Table(
    "college_courses",
    Base.metadata,
    Column("college_id", Integer, ForeignKey("colleges.id", ondelete="CASCADE")),
    Column("course_id", Integer, ForeignKey("courses.id", ondelete="CASCADE")),
)

college_exams = Table(
    "college_exams",
    Base.metadata,
    Column("college_id", Integer, ForeignKey("colleges.id", ondelete="CASCADE")),
    Column("exam_id", Integer, ForeignKey("entrance_exams.id", ondelete="CASCADE")),
)


class CourseLevel(str, enum.Enum):
    UG = "UG"
    PG = "PG"
    PHD = "PhD"
    DIPLOMA = "Diploma"


class CollegeType(str, enum.Enum):
    GOVERNMENT = "Government"
    PRIVATE = "Private"
    DEEMED = "Deemed"
    AUTONOMOUS = "Autonomous"


class AdmissionStatus(str, enum.Enum):
    UPCOMING = "Upcoming"
    OPEN = "Open"
    CLOSING_SOON = "Closing Soon"
    CLOSED = "Closed"
    COUNSELLING = "Counselling"
    SPOT_ROUND = "Spot Round"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    phone = Column(String, unique=True, nullable=True)
    name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=True)
    google_id = Column(String, unique=True, nullable=True)
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    wishlist = relationship("College", secondary=user_wishlist, back_populates="wishlisted_by")
    preferences = relationship("UserPreference", back_populates="user", uselist=False)


class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    preferred_states = Column(JSON, default=[])
    preferred_course_level = Column(String, nullable=True)
    preferred_streams = Column(JSON, default=[])
    budget_min = Column(Integer, nullable=True)
    budget_max = Column(Integer, nullable=True)
    entrance_exams = Column(JSON, default=[])
    preferred_college_type = Column(JSON, default=[])
    
    user = relationship("User", back_populates="preferences")


class College(Base):
    __tablename__ = "colleges"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    short_name = Column(String, nullable=True)
    state = Column(String, nullable=False, index=True)
    city = Column(String, nullable=False)
    address = Column(Text, nullable=True)
    college_type = Column(String, nullable=False, index=True)
    established_year = Column(Integer, nullable=True)
    nirf_ranking = Column(Integer, nullable=True)
    naac_grade = Column(String, nullable=True)
    website = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    
    # Admission details
    admission_status = Column(String, default=AdmissionStatus.UPCOMING.value)
    application_start_date = Column(DateTime, nullable=True)
    application_end_date = Column(DateTime, nullable=True)
    application_url = Column(String, nullable=True)
    notification_pdf_url = Column(String, nullable=True)
    
    # Fees
    fee_min = Column(Integer, nullable=True)  # in INR per year
    fee_max = Column(Integer, nullable=True)
    
    # Seats
    total_seats = Column(Integer, nullable=True)
    
    # Admin tracking - JSON list of field names manually edited by admin
    admin_edited_fields = Column(Text, nullable=True, default="[]")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    courses = relationship("Course", secondary=college_courses, back_populates="colleges")
    exams_accepted = relationship("EntranceExam", secondary=college_exams, back_populates="colleges")
    cutoffs = relationship("Cutoff", back_populates="college")
    admission_rounds = relationship("AdmissionRound", back_populates="college")
    wishlisted_by = relationship("User", secondary=user_wishlist, back_populates="wishlist")


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    short_name = Column(String, nullable=True)
    level = Column(String, nullable=False, index=True)  # UG, PG, PhD
    stream = Column(String, nullable=False, index=True)  # Science, Commerce, Arts, Engineering, Medical
    duration_years = Column(Float, nullable=True)
    
    colleges = relationship("College", secondary=college_courses, back_populates="courses")


class EntranceExam(Base):
    __tablename__ = "entrance_exams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    short_name = Column(String, nullable=False, unique=True)
    level = Column(String, nullable=False)  # UG, PG
    stream = Column(String, nullable=False)
    conducting_body = Column(String, nullable=True)
    
    colleges = relationship("College", secondary=college_exams, back_populates="exams_accepted")


class Cutoff(Base):
    __tablename__ = "cutoffs"

    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id", ondelete="CASCADE"))
    course_id = Column(Integer, ForeignKey("courses.id"))
    exam_id = Column(Integer, ForeignKey("entrance_exams.id"), nullable=True)
    year = Column(Integer, nullable=False)
    round_number = Column(Integer, default=1)
    category = Column(String, default="General")  # General, OBC, SC, ST, EWS
    cutoff_score = Column(Float, nullable=True)
    cutoff_rank = Column(Integer, nullable=True)
    cutoff_percentile = Column(Float, nullable=True)
    
    college = relationship("College", back_populates="cutoffs")


class AdmissionRound(Base):
    __tablename__ = "admission_rounds"

    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id", ondelete="CASCADE"))
    round_name = Column(String, nullable=False)  # Round 1, Spot Round, etc.
    round_number = Column(Integer, default=1)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    status = Column(String, default=AdmissionStatus.UPCOMING.value)
    description = Column(Text, nullable=True)
    
    college = relationship("College", back_populates="admission_rounds")

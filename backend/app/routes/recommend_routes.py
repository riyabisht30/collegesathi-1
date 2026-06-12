from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_
from app.database import get_db
from app.models.models import College, Course, EntranceExam, Cutoff
from app.schemas import QuestionnaireRequest, RecommendationResponse, CollegeListResponse

router = APIRouter(prefix="/recommend", tags=["Recommendations"])


@router.post("", response_model=RecommendationResponse)
def get_recommendations(data: QuestionnaireRequest, db: Session = Depends(get_db)):
    """
    Monzy-style recommendation engine.
    Returns 50-100 best colleges based on questionnaire answers.
    Scoring: each matching criteria adds points.
    """
    query = db.query(College).options(
        joinedload(College.courses),
        joinedload(College.exams_accepted),
        joinedload(College.cutoffs),
    )

    # Base filters (hard constraints)
    if data.course_level:
        query = query.join(College.courses).filter(Course.level == data.course_level)

    if data.streams:
        query = query.join(College.courses).filter(Course.stream.in_(data.streams))

    if data.budget_max:
        query = query.filter(
            or_(College.fee_max <= data.budget_max, College.fee_max.is_(None))
        )

    if data.entrance_exams:
        query = query.join(College.exams_accepted).filter(
            EntranceExam.short_name.in_(data.entrance_exams)
        )

    if data.preferred_states:
        query = query.filter(College.state.in_(data.preferred_states))

    if data.college_type:
        query = query.filter(College.college_type.in_(data.college_type))

    colleges = query.distinct().all()

    # Score each college
    scored_colleges = []
    for college in colleges:
        score = 0
        reasons = []

        # NIRF ranking bonus
        if college.nirf_ranking:
            if college.nirf_ranking <= 10:
                score += 50
                reasons.append("Top 10 NIRF")
            elif college.nirf_ranking <= 50:
                score += 30
                reasons.append("Top 50 NIRF")
            elif college.nirf_ranking <= 100:
                score += 20
                reasons.append("Top 100 NIRF")

        # NAAC grade bonus
        if college.naac_grade:
            grade_scores = {"A++": 40, "A+": 35, "A": 30, "B++": 20, "B+": 15, "B": 10}
            score += grade_scores.get(college.naac_grade, 0)
            if college.naac_grade in grade_scores:
                reasons.append(f"NAAC {college.naac_grade}")

        # State match bonus
        if data.preferred_states and college.state in data.preferred_states:
            score += 15
            reasons.append("Preferred state")

        # College type match
        if data.college_type and college.college_type in data.college_type:
            score += 10
            reasons.append(f"{college.college_type} college")

        # Fee affordability bonus
        if data.budget_max and college.fee_max:
            if college.fee_max <= data.budget_max * 0.5:
                score += 20
                reasons.append("Well within budget")
            elif college.fee_max <= data.budget_max * 0.8:
                score += 10
                reasons.append("Within budget")

        # Admission status bonus (open > upcoming > closed)
        if college.admission_status == "Open":
            score += 25
            reasons.append("Applications open now")
        elif college.admission_status == "Closing Soon":
            score += 20
            reasons.append("Closing soon - apply fast!")
        elif college.admission_status == "Upcoming":
            score += 10

        # Cutoff-based scoring (if exam scores provided)
        if data.exam_scores:
            for cutoff in college.cutoffs:
                exam = db.query(EntranceExam).filter(EntranceExam.id == cutoff.exam_id).first()
                if exam and exam.short_name in data.exam_scores:
                    student_score = data.exam_scores[exam.short_name]
                    if cutoff.cutoff_percentile and student_score >= cutoff.cutoff_percentile:
                        score += 30
                        reasons.append(f"You meet {exam.short_name} cutoff")
                    elif cutoff.cutoff_score and student_score >= cutoff.cutoff_score:
                        score += 30
                        reasons.append(f"You meet {exam.short_name} cutoff")

        scored_colleges.append((college, score, reasons))

    # Sort by score descending, take top 100
    scored_colleges.sort(key=lambda x: x[1], reverse=True)
    top_colleges = scored_colleges[:100]

    return RecommendationResponse(
        colleges=[CollegeListResponse.model_validate(c[0]) for c in top_colleges],
        total_matches=len(scored_colleges),
        criteria_summary={
            "course_level": data.course_level,
            "states": data.preferred_states,
            "streams": data.streams,
            "budget": data.budget_max,
            "exams": data.entrance_exams,
        },
    )

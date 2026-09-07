from app.services.exam_service import exam_service
from app.schemas.mock_exam import ExamQuestionResponse

def test_band_score_mapping():
    """Verify band score and CEFR estimation for various percentage tiers."""
    band, cefr = exam_service.estimate_band_score(95.0)
    assert "C1" in band and cefr == "C1"

    band, cefr = exam_service.estimate_band_score(82.0)
    assert "B2" in band and cefr == "B2"

    band, cefr = exam_service.estimate_band_score(55.0)
    assert "B1" in band and cefr == "B1"

    band, cefr = exam_service.estimate_band_score(25.0)
    assert "A1" in band and cefr == "A1"

def test_score_calculation():
    """Verify correct answer evaluation and category breakdown."""
    questions = [
        ExamQuestionResponse(
            id="q1",
            source_type="grammar",
            topic_category_fa="گرامر زمان‌ها",
            prompt_fa="Test",
            options=["went", "go"],
            correct_answer="went",
            explanation_fa="Exp",
        ),
        ExamQuestionResponse(
            id="q2",
            source_type="vocabulary",
            topic_category_fa="واژگان سفر",
            prompt_fa="Test 2",
            options=["Airport", "Station"],
            correct_answer="Airport",
            explanation_fa="Exp 2",
        ),
    ]

    user_answers = {"q1": "went", "q2": "Station"}
    score_pct, correct, wrong, unans, cat_scores = exam_service.calculate_scores(questions, user_answers)

    assert score_pct == 50.0
    assert correct == 1
    assert wrong == 1
    assert unans == 0
    assert len(cat_scores) == 2

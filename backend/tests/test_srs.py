from app.services.srs_service import srs_service

def test_sm2_initial_review_success():
    """Verify first successful review (rating 4/Easy) resets interval to 1 day and increases reps."""
    reps, interval, ef, next_rev, state = srs_service.calculate_sm2(
        rating=4,
        repetitions=0,
        interval=1,
        ease_factor=2.5,
    )
    assert reps == 1
    assert interval == 1
    assert ef >= 2.5
    assert state == "review"

def test_sm2_second_review_success():
    """Verify second successful review sets interval to 6 days."""
    reps, interval, ef, next_rev, state = srs_service.calculate_sm2(
        rating=5,
        repetitions=1,
        interval=1,
        ease_factor=2.5,
    )
    assert reps == 2
    assert interval == 6
    assert ef > 2.5
    assert state == "review"

def test_sm2_failed_review_resets_repetition():
    """Verify failure (rating 1) resets repetitions to 0, sets interval to 1, and marks as learning."""
    reps, interval, ef, next_rev, state = srs_service.calculate_sm2(
        rating=1,
        repetitions=4,
        interval=15,
        ease_factor=2.5,
    )
    assert reps == 0
    assert interval == 1
    assert state == "learning"

def test_sm2_minimum_ease_factor_bound():
    """Verify ease factor never drops below 1.3."""
    reps, interval, ef, next_rev, state = srs_service.calculate_sm2(
        rating=1,
        repetitions=0,
        interval=1,
        ease_factor=1.3,
    )
    assert ef == 1.3

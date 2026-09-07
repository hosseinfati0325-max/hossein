from datetime import datetime, timedelta, timezone
from typing import Tuple

class SrsService:
    """SuperMemo SM-2 Spaced Repetition Algorithm Implementation."""

    @staticmethod
    def calculate_sm2(
        rating: int,  # 1 to 5
        repetitions: int,
        interval: int,
        ease_factor: float
    ) -> Tuple[int, int, float, datetime, str]:
        """
        Calculates updated (repetitions, interval_days, ease_factor, next_review_date, state).
        Rating scale:
        1: Complete blackout / Again
        2: Hard
        3: Good / with difficulty
        4: Easy / confident
        5: Perfect / immediate recall
        """
        now = datetime.now(timezone.utc)

        if rating < 3:
            # Failed / needs immediate re-learning
            new_repetitions = 0
            new_interval = 1
            new_state = "learning"
        else:
            # Successful recall
            if repetitions == 0:
                new_interval = 1
            elif repetitions == 1:
                new_interval = 6
            else:
                new_interval = int(round(interval * ease_factor))

            new_repetitions = repetitions + 1
            new_state = "mastered" if new_interval >= 21 else "review"

        # Calculate new Ease Factor (min 1.3)
        # EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
        q = rating
        new_ef = ease_factor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
        new_ef = max(1.3, round(new_ef, 2))

        next_review = now + timedelta(days=new_interval)
        return new_repetitions, new_interval, new_ef, next_review, new_state

srs_service = SrsService()

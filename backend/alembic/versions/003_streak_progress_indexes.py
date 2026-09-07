"""003 Composite Indexes on user_id and created_at for Streak and Progress Queries

Revision ID: 003_streak_progress_indexes
Revises: 002_composite_indexes_optimization
Create Date: 2026-09-07 15:52:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "003_streak_progress_indexes"
down_revision: Union[str, None] = "002_composite_indexes_optimization"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. Composite index for Learning Progress queries by user_id and created_at
    # Enables lightning-fast daily streak calculation, active study days, and chronologically ordered progress retrieval
    op.create_index(
        "ix_learning_progress_user_created",
        "learning_progress",
        ["user_id", "created_at"],
        unique=False
    )

    # 2. Composite index on exam_attempts for user_id and created_at
    # Directly accelerates streak activity verification and temporal progress tracking
    op.create_index(
        "ix_exam_attempts_user_created",
        "exam_attempts",
        ["user_id", "created_at"],
        unique=False
    )

    # 3. Composite index on flashcards for user_id and created_at
    # Accelerates weekly card acquisition velocity calculations
    op.create_index(
        "ix_flashcards_user_created",
        "flashcards",
        ["user_id", "created_at"],
        unique=False
    )

    # 4. Composite index on ai_conversations for user_id and created_at
    # Speeds up daily active chat streaks
    op.create_index(
        "ix_ai_conversations_user_created",
        "ai_conversations",
        ["user_id", "created_at"],
        unique=False
    )

def downgrade() -> None:
    op.drop_index("ix_ai_conversations_user_created", table_name="ai_conversations")
    op.drop_index("ix_flashcards_user_created", table_name="flashcards")
    op.drop_index("ix_exam_attempts_user_created", table_name="exam_attempts")
    op.drop_index("ix_learning_progress_user_created", table_name="learning_progress")

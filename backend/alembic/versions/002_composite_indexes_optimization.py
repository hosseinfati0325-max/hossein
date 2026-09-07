"""002 Composite Indexes, Verification, and Soft Delete Optimization

Revision ID: 002_composite_indexes_optimization
Revises: 001_initial_schema
Create Date: 2026-09-07 14:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "002_composite_indexes_optimization"
down_revision: Union[str, None] = "001_initial_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. Verification columns on users table
    op.add_column("users", sa.Column("is_verified", sa.Boolean(), nullable=False, server_default=sa.text("false")))
    op.add_column("users", sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True))

    # 2. High-performance composite indexes for SM-2 Spaced Repetition Due queries
    # Query pattern: WHERE user_id = :uid AND language = :lang AND is_deleted = false AND next_review_date <= :now
    op.create_index(
        "ix_flashcards_due_queue",
        "flashcards",
        ["user_id", "language", "is_deleted", "next_review_date"],
        unique=False
    )

    # 3. Composite index for Learning Progress queries by unit and completion
    # Query pattern: WHERE user_id = :uid AND language = :lang AND unit_id = :unit_id
    op.create_index(
        "ix_learning_progress_lookup",
        "learning_progress",
        ["user_id", "language", "unit_id"],
        unique=False
    )

    # 4. Composite index for Vocabulary Progress mastery lookups
    op.create_index(
        "ix_vocab_progress_user_lang_mastery",
        "vocabulary_progress",
        ["user_id", "language", "mastery_percent"],
        unique=False
    )

    # 5. Composite index for Exam Attempts historical performance
    # Query pattern: WHERE user_id = :uid AND exam_id = :eid ORDER BY created_at DESC
    op.create_index(
        "ix_exam_attempts_user_exam_created",
        "exam_attempts",
        ["user_id", "exam_id", "created_at"],
        unique=False
    )

    # 6. Composite index for Soft-Delete and active user lookups
    op.create_index(
        "ix_users_active_lookup",
        "users",
        ["email", "is_active", "is_deleted"],
        unique=False
    )

def downgrade() -> None:
    op.drop_index("ix_users_active_lookup", table_name="users")
    op.drop_index("ix_exam_attempts_user_exam_created", table_name="exam_attempts")
    op.drop_index("ix_vocab_progress_user_lang_mastery", table_name="vocabulary_progress")
    op.drop_index("ix_learning_progress_lookup", table_name="learning_progress")
    op.drop_index("ix_flashcards_due_queue", table_name="flashcards")
    op.drop_column("users", "verified_at")
    op.drop_column("users", "is_verified")

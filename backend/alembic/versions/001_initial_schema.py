"""001 Initial Schema for LinguaPulse Production Database

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-08-29 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. users table
    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("phone_number", sa.String(length=50), nullable=True),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("is_admin", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("role", sa.String(length=50), nullable=False, server_default=sa.text("'student'")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_id", "users", ["id"])

    # 2. profiles table
    op.create_table(
        "profiles",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("first_name", sa.String(length=100), nullable=False, server_default="زبان‌آموز"),
        sa.Column("last_name", sa.String(length=100), nullable=False, server_default=""),
        sa.Column("display_name", sa.String(length=200), nullable=False, server_default="زبان‌آموز کوشا"),
        sa.Column("avatar", sa.String(length=255), nullable=False, server_default="🦁"),
        sa.Column("target_language", sa.String(length=10), nullable=False, server_default="en"),
        sa.Column("explanation_language", sa.String(length=10), nullable=False, server_default="fa"),
        sa.Column("current_level", sa.String(length=10), nullable=False, server_default="A1"),
        sa.Column("xp", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("level", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("streak", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("last_active_date", sa.String(length=20), nullable=True),
        sa.Column("hearts", sa.Integer(), nullable=False, server_default="5"),
        sa.Column("max_hearts", sa.Integer(), nullable=False, server_default="5"),
        sa.Column("gems", sa.Integer(), nullable=False, server_default="100"),
        sa.Column("league", sa.String(length=20), nullable=False, server_default="bronze"),
        sa.Column("league_rank", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("league_xp", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("daily_study_time_seconds", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("total_words_learned", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("speaking_score_average", sa.Float(), nullable=False, server_default="85.0"),
        sa.Column("placement_test_done", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("placement_score", sa.Float(), nullable=True),
        sa.Column("meta_info", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_profiles_target_language", "profiles", ["target_language"])
    op.create_index("ix_profiles_current_level", "profiles", ["current_level"])
    op.create_index("ix_profiles_xp", "profiles", ["xp"])

    # 3. user_settings table
    op.create_table(
        "user_settings",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("theme", sa.String(length=20), nullable=False, server_default="system"),
        sa.Column("color_theme", sa.String(length=20), nullable=False, server_default="emerald"),
        sa.Column("font_size", sa.String(length=20), nullable=False, server_default="medium"),
        sa.Column("sound_effects", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("haptic_feedback", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("tts_speed", sa.Float(), nullable=False, server_default="1.0"),
        sa.Column("auto_play_audio", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("explanation_language", sa.String(length=10), nullable=False, server_default="fa"),
        sa.Column("daily_goal_minutes", sa.Integer(), nullable=False, server_default="15"),
        sa.Column("notifications_enabled", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("daily_reminder_hour", sa.Integer(), nullable=False, server_default="21"),
        sa.Column("offline_mode_preferred", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )

    # 4. grammar_modules table
    op.create_table(
        "grammar_modules",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("language", sa.String(length=10), nullable=False, server_default="en"),
        sa.Column("level", sa.String(length=10), nullable=False, server_default="A1"),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("title_fa", sa.String(length=200), nullable=False),
        sa.Column("description_fa", sa.Text(), nullable=True),
        sa.Column("order_index", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )

    # 5. grammar_lessons table
    op.create_table(
        "grammar_lessons",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("module_id", sa.String(length=36), sa.ForeignKey("grammar_modules.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("title_fa", sa.String(length=200), nullable=False),
        sa.Column("level", sa.String(length=10), nullable=False, server_default="A1"),
        sa.Column("explanation_fa", sa.Text(), nullable=False),
        sa.Column("explanation_en", sa.Text(), nullable=True),
        sa.Column("formula", sa.String(length=255), nullable=True),
        sa.Column("examples", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("common_mistakes", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("exercises", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("order_index", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )

    # 6. vocabulary_sets table
    op.create_table(
        "vocabulary_sets",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("language", sa.String(length=10), nullable=False, server_default="en"),
        sa.Column("level", sa.String(length=10), nullable=False, server_default="A1"),
        sa.Column("category", sa.String(length=100), nullable=False),
        sa.Column("title_fa", sa.String(length=200), nullable=False),
        sa.Column("title_native", sa.String(length=200), nullable=False),
        sa.Column("description_fa", sa.Text(), nullable=True),
        sa.Column("icon_name", sa.String(length=50), nullable=False, server_default="BookOpen"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )

    # 7. vocabulary_words table
    op.create_table(
        "vocabulary_words",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("set_id", sa.String(length=36), sa.ForeignKey("vocabulary_sets.id", ondelete="CASCADE"), nullable=False),
        sa.Column("word", sa.String(length=150), nullable=False),
        sa.Column("translation_fa", sa.String(length=200), nullable=False),
        sa.Column("phonetic", sa.String(length=100), nullable=True),
        sa.Column("part_of_speech", sa.String(length=50), nullable=True),
        sa.Column("example_target", sa.Text(), nullable=True),
        sa.Column("example_fa", sa.Text(), nullable=True),
        sa.Column("difficulty", sa.String(length=20), nullable=False, server_default="easy"),
        sa.Column("audio_url", sa.String(length=255), nullable=True),
        sa.Column("image_url", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )

    # 8. flashcards table (SM-2 SRS)
    op.create_table(
        "flashcards",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("language", sa.String(length=10), nullable=False, server_default="en"),
        sa.Column("front_text", sa.String(length=200), nullable=False),
        sa.Column("back_text_fa", sa.String(length=255), nullable=False),
        sa.Column("back_text_en", sa.String(length=255), nullable=True),
        sa.Column("phonetic", sa.String(length=100), nullable=True),
        sa.Column("part_of_speech", sa.String(length=50), nullable=True),
        sa.Column("example_target", sa.Text(), nullable=True),
        sa.Column("example_fa", sa.Text(), nullable=True),
        sa.Column("category", sa.String(length=100), nullable=False, server_default="General"),
        sa.Column("image_url", sa.String(length=255), nullable=True),
        sa.Column("interval", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("repetitions", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("ease_factor", sa.Float(), nullable=False, server_default="2.5"),
        sa.Column("next_review_date", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("last_reviewed_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("state", sa.String(length=20), nullable=False, server_default="new"),
        sa.Column("total_reviews", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("successful_reviews", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("ease_factor >= 1.3", name="check_min_ease_factor"),
        sa.CheckConstraint("interval >= 1", name="check_min_interval"),
    )
    op.create_index("ix_flashcards_user_next_review", "flashcards", ["user_id", "next_review_date"])

    # 9. exams table
    op.create_table(
        "exams",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("language", sa.String(length=10), nullable=False, server_default="en"),
        sa.Column("level", sa.String(length=10), nullable=False, server_default="B1"),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("subtitle_fa", sa.String(length=255), nullable=True),
        sa.Column("duration_minutes", sa.Integer(), nullable=False, server_default="30"),
        sa.Column("total_questions", sa.Integer(), nullable=False, server_default="20"),
        sa.Column("is_mock", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("band_description_fa", sa.Text(), nullable=True),
        sa.Column("icon", sa.String(length=50), nullable=False, server_default="Award"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )

    # 10. exam_questions table
    op.create_table(
        "exam_questions",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("exam_id", sa.String(length=36), sa.ForeignKey("exams.id", ondelete="SET NULL"), nullable=True),
        sa.Column("language", sa.String(length=10), nullable=False, server_default="en"),
        sa.Column("level", sa.String(length=10), nullable=False, server_default="B1"),
        sa.Column("source_type", sa.String(length=50), nullable=False, server_default="grammar"),
        sa.Column("topic_category_fa", sa.String(length=150), nullable=False),
        sa.Column("prompt_fa", sa.Text(), nullable=False),
        sa.Column("prompt_target", sa.Text(), nullable=True),
        sa.Column("target_audio_text", sa.String(length=255), nullable=True),
        sa.Column("options", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("correct_answer", sa.String(length=255), nullable=False),
        sa.Column("explanation_fa", sa.Text(), nullable=False),
        sa.Column("phonetic", sa.String(length=100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )

    # 11. exam_attempts table
    op.create_table(
        "exam_attempts",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("exam_id", sa.String(length=36), sa.ForeignKey("exams.id", ondelete="SET NULL"), nullable=True),
        sa.Column("language", sa.String(length=10), nullable=False, server_default="en"),
        sa.Column("level", sa.String(length=10), nullable=False, server_default="B1"),
        sa.Column("is_mock", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("score_percent", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("estimated_band_score", sa.String(length=50), nullable=True),
        sa.Column("correct_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("wrong_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("unanswered_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("total_questions", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("time_spent_seconds", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("grammar_score_percent", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("vocab_score_percent", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("strengths_fa", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("weaknesses_fa", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("actionable_plan_fa", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("ai_breakdown", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )

    # 12. exam_answers table
    op.create_table(
        "exam_answers",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("attempt_id", sa.String(length=36), sa.ForeignKey("exam_attempts.id", ondelete="CASCADE"), nullable=False),
        sa.Column("question_id", sa.String(length=36), sa.ForeignKey("exam_questions.id", ondelete="SET NULL"), nullable=True),
        sa.Column("selected_answer", sa.String(length=255), nullable=True),
        sa.Column("correct_answer", sa.String(length=255), nullable=False),
        sa.Column("is_correct", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("time_spent_seconds", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )

    # 13. learning_progress table
    op.create_table(
        "learning_progress",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("language", sa.String(length=10), nullable=False, server_default="en"),
        sa.Column("unit_id", sa.String(length=50), nullable=False),
        sa.Column("lesson_id", sa.String(length=50), nullable=False),
        sa.Column("is_completed", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("crown_level", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("score_percent", sa.Float(), nullable=False, server_default="100.0"),
        sa.Column("xp_earned", sa.Integer(), nullable=False, server_default="20"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("user_id", "lesson_id", name="uq_user_lesson_progress"),
    )

    # 14. vocabulary_progress table
    op.create_table(
        "vocabulary_progress",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("language", sa.String(length=10), nullable=False, server_default="en"),
        sa.Column("word_id", sa.String(length=36), sa.ForeignKey("vocabulary_words.id", ondelete="CASCADE"), nullable=True),
        sa.Column("word_text", sa.String(length=150), nullable=False),
        sa.Column("mastery_percent", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("times_practiced", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("mistake_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("user_id", "word_text", "language", name="uq_user_word_progress"),
    )

    # 15. grammar_progress table
    op.create_table(
        "grammar_progress",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("language", sa.String(length=10), nullable=False, server_default="en"),
        sa.Column("topic_key", sa.String(length=100), nullable=False),
        sa.Column("topic_title_fa", sa.String(length=200), nullable=False),
        sa.Column("mastery_percent", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("times_tested", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("mistake_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("user_id", "topic_key", "language", name="uq_user_grammar_progress"),
    )

    # 16. ai_conversations and ai_messages tables
    op.create_table(
        "ai_conversations",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("target_language", sa.String(length=10), nullable=False, server_default="en"),
        sa.Column("mode", sa.String(length=50), nullable=False, server_default="chat"),
        sa.Column("scenario_id", sa.String(length=100), nullable=True),
        sa.Column("title", sa.String(length=200), nullable=False, server_default="گفتگو با استاد هوشمند"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        "ai_messages",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("conversation_id", sa.String(length=36), sa.ForeignKey("ai_conversations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("sender", sa.String(length=20), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("translation_fa", sa.Text(), nullable=True),
        sa.Column("corrections", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("suggestions", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("audio_url", sa.String(length=255), nullable=True),
        sa.Column("provider_name", sa.String(length=50), nullable=True),
        sa.Column("model_name", sa.String(length=100), nullable=True),
        sa.Column("tokens_used", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )

    # 17. achievements and user_achievements tables
    op.create_table(
        "achievements",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("key", sa.String(length=50), nullable=False, unique=True),
        sa.Column("title_fa", sa.String(length=100), nullable=False),
        sa.Column("description_fa", sa.String(length=255), nullable=False),
        sa.Column("icon", sa.String(length=50), nullable=False, server_default="Award"),
        sa.Column("category", sa.String(length=50), nullable=False, server_default="streak"),
        sa.Column("tier", sa.String(length=20), nullable=False, server_default="bronze"),
        sa.Column("max_progress", sa.Integer(), nullable=False, server_default="10"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        "user_achievements",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("achievement_id", sa.String(length=36), sa.ForeignKey("achievements.id", ondelete="CASCADE"), nullable=False),
        sa.Column("progress", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_unlocked", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("user_id", "achievement_id", name="uq_user_achievement"),
    )

def downgrade() -> None:
    op.drop_table("user_achievements")
    op.drop_table("achievements")
    op.drop_table("ai_messages")
    op.drop_table("ai_conversations")
    op.drop_table("grammar_progress")
    op.drop_table("vocabulary_progress")
    op.drop_table("learning_progress")
    op.drop_table("exam_answers")
    op.drop_table("exam_attempts")
    op.drop_table("exam_questions")
    op.drop_table("exams")
    op.drop_table("flashcards")
    op.drop_table("vocabulary_words")
    op.drop_table("vocabulary_sets")
    op.drop_table("grammar_lessons")
    op.drop_table("grammar_modules")
    op.drop_table("user_settings")
    op.drop_table("profiles")
    op.drop_table("users")

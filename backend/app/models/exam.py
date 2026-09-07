from sqlalchemy import Column, String, Integer, Float, Boolean, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.models.base import TimeStampedModel

class Exam(TimeStampedModel):
    __tablename__ = "exams"

    language = Column(String(10), default="en", nullable=False, index=True)
    level = Column(String(10), default="B1", nullable=False, index=True)  # A1 to C2
    title = Column(String(255), nullable=False)
    subtitle_fa = Column(String(255), nullable=True)
    duration_minutes = Column(Integer, default=30, nullable=False)
    total_questions = Column(Integer, default=20, nullable=False)
    is_mock = Column(Boolean, default=False, nullable=False, index=True)
    band_description_fa = Column(Text, nullable=True)
    icon = Column(String(50), default="Award", nullable=False)

    questions = relationship("ExamQuestion", back_populates="exam", cascade="all, delete-orphan")
    attempts = relationship("ExamAttempt", back_populates="exam", cascade="all, delete-orphan")

class ExamQuestion(TimeStampedModel):
    __tablename__ = "exam_questions"

    exam_id = Column(String(36), ForeignKey("exams.id", ondelete="SET NULL"), nullable=True, index=True)
    language = Column(String(10), default="en", nullable=False, index=True)
    level = Column(String(10), default="B1", nullable=False, index=True)
    source_type = Column(String(50), default="grammar", nullable=False, index=True)  # grammar, vocabulary, curriculum
    topic_category_fa = Column(String(150), nullable=False, index=True)  # e.g. "گرامر: زمان گذشته", "واژگان: سفر"
    prompt_fa = Column(Text, nullable=False)
    prompt_target = Column(Text, nullable=True)
    target_audio_text = Column(String(255), nullable=True)
    options = Column(JSON, default=list, nullable=False)  # list of 4 options
    correct_answer = Column(String(255), nullable=False)
    explanation_fa = Column(Text, nullable=False)
    phonetic = Column(String(100), nullable=True)

    exam = relationship("Exam", back_populates="questions")
    answers = relationship("ExamAnswer", back_populates="question")

class ExamAttempt(TimeStampedModel):
    __tablename__ = "exam_attempts"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    exam_id = Column(String(36), ForeignKey("exams.id", ondelete="SET NULL"), nullable=True, index=True)
    language = Column(String(10), default="en", nullable=False, index=True)
    level = Column(String(10), default="B1", nullable=False)
    is_mock = Column(Boolean, default=True, nullable=False)
    
    score_percent = Column(Float, default=0.0, nullable=False)
    estimated_band_score = Column(String(50), nullable=True)
    correct_count = Column(Integer, default=0, nullable=False)
    wrong_count = Column(Integer, default=0, nullable=False)
    unanswered_count = Column(Integer, default=0, nullable=False)
    total_questions = Column(Integer, default=0, nullable=False)
    time_spent_seconds = Column(Integer, default=0, nullable=False)

    grammar_score_percent = Column(Float, default=0.0, nullable=False)
    vocab_score_percent = Column(Float, default=0.0, nullable=False)
    
    strengths_fa = Column(JSON, default=list, nullable=False)
    weaknesses_fa = Column(JSON, default=list, nullable=False)
    actionable_plan_fa = Column(JSON, default=list, nullable=False)
    ai_breakdown = Column(JSON, default=dict, nullable=False)

    user = relationship("User", back_populates="exam_attempts")
    exam = relationship("Exam", back_populates="attempts")
    answers = relationship("ExamAnswer", back_populates="attempt", cascade="all, delete-orphan")

class ExamAnswer(TimeStampedModel):
    __tablename__ = "exam_answers"

    attempt_id = Column(String(36), ForeignKey("exam_attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(String(36), ForeignKey("exam_questions.id", ondelete="SET NULL"), nullable=True, index=True)
    selected_answer = Column(String(255), nullable=True)
    correct_answer = Column(String(255), nullable=False)
    is_correct = Column(Boolean, default=False, nullable=False, index=True)
    time_spent_seconds = Column(Integer, default=0, nullable=False)

    attempt = relationship("ExamAttempt", back_populates="answers")
    question = relationship("ExamQuestion", back_populates="answers")

from sqlalchemy import Column, String, Integer, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.models.base import TimeStampedModel

class GrammarModule(TimeStampedModel):
    __tablename__ = "grammar_modules"

    language = Column(String(10), default="en", nullable=False, index=True)
    level = Column(String(10), default="A1", nullable=False, index=True)  # A1 to C2
    title = Column(String(200), nullable=False)
    title_fa = Column(String(200), nullable=False)
    description_fa = Column(Text, nullable=True)
    order_index = Column(Integer, default=0, nullable=False)

    lessons = relationship("GrammarLesson", back_populates="module", cascade="all, delete-orphan")

class GrammarLesson(TimeStampedModel):
    __tablename__ = "grammar_lessons"

    module_id = Column(String(36), ForeignKey("grammar_modules.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    title_fa = Column(String(200), nullable=False)
    level = Column(String(10), default="A1", nullable=False)
    explanation_fa = Column(Text, nullable=False)
    explanation_en = Column(Text, nullable=True)
    formula = Column(String(255), nullable=True)
    examples = Column(JSON, default=list, nullable=False)  # [{target: str, persian: str, audio: str}]
    common_mistakes = Column(JSON, default=list, nullable=False)  # [{wrong: str, correct: str, reason_fa: str}]
    exercises = Column(JSON, default=list, nullable=False)
    order_index = Column(Integer, default=0, nullable=False)

    module = relationship("GrammarModule", back_populates="lessons")

class VocabularySet(TimeStampedModel):
    __tablename__ = "vocabulary_sets"

    language = Column(String(10), default="en", nullable=False, index=True)
    level = Column(String(10), default="A1", nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)  # travel, business, food, daily
    title_fa = Column(String(200), nullable=False)
    title_native = Column(String(200), nullable=False)
    description_fa = Column(Text, nullable=True)
    icon_name = Column(String(50), default="BookOpen", nullable=False)

    words = relationship("VocabularyWord", back_populates="vocabulary_set", cascade="all, delete-orphan")

class VocabularyWord(TimeStampedModel):
    __tablename__ = "vocabulary_words"

    set_id = Column(String(36), ForeignKey("vocabulary_sets.id", ondelete="CASCADE"), nullable=False, index=True)
    word = Column(String(150), nullable=False, index=True)
    translation_fa = Column(String(200), nullable=False)
    phonetic = Column(String(100), nullable=True)
    part_of_speech = Column(String(50), nullable=True)  # noun, verb, adj, adv
    example_target = Column(Text, nullable=True)
    example_fa = Column(Text, nullable=True)
    difficulty = Column(String(20), default="easy", nullable=False)
    audio_url = Column(String(255), nullable=True)
    image_url = Column(String(255), nullable=True)

    vocabulary_set = relationship("VocabularySet", back_populates="words")

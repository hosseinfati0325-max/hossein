from sqlalchemy import Column, String, Integer, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.models.base import TimeStampedModel

class AIConversation(TimeStampedModel):
    __tablename__ = "ai_conversations"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    target_language = Column(String(10), default="en", nullable=False, index=True)
    mode = Column(String(50), default="chat", nullable=False, index=True)  # chat, roleplay, writing, pronunciation
    scenario_id = Column(String(100), nullable=True)
    title = Column(String(200), default="گفتگو با استاد هوشمند", nullable=False)

    user = relationship("User", back_populates="ai_conversations")
    messages = relationship("AIMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="AIMessage.created_at")

class AIMessage(TimeStampedModel):
    __tablename__ = "ai_messages"

    conversation_id = Column(String(36), ForeignKey("ai_conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    sender = Column(String(20), nullable=False)  # user, assistant, system
    text = Column(Text, nullable=False)
    translation_fa = Column(Text, nullable=True)
    corrections = Column(JSON, default=list, nullable=False)
    suggestions = Column(JSON, default=list, nullable=False)
    audio_url = Column(String(255), nullable=True)
    provider_name = Column(String(50), nullable=True)  # gemini, openai, claude
    model_name = Column(String(100), nullable=True)
    tokens_used = Column(Integer, default=0, nullable=False)

    conversation = relationship("AIConversation", back_populates="messages")

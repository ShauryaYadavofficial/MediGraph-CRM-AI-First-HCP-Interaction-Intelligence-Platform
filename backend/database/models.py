from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
    Float,
    Enum as SAEnum,
)
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from database.connection import Base


class InteractionType(str, enum.Enum):
    VISIT = "visit"
    CALL = "call"
    EMAIL = "email"
    CONFERENCE = "conference"
    WEBINAR = "webinar"


class InteractionStatus(str, enum.Enum):
    DRAFT = "draft"
    COMPLETED = "completed"
    FOLLOW_UP_REQUIRED = "follow_up_required"


class SentimentLabel(str, enum.Enum):
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"


class HCP(Base):
    __tablename__ = "hcps"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    specialty = Column(String(255))
    hospital = Column(String(255))
    email = Column(String(255), unique=True, index=True)
    phone = Column(String(50))
    territory = Column(String(100))
    tier = Column(String(10))  # A, B, C
    created_at = Column(DateTime, default=datetime.utcnow)

    interactions = relationship("Interaction", back_populates="hcp")


class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)
    hcp_id = Column(Integer, ForeignKey("hcps.id"), nullable=False)
    interaction_type = Column(SAEnum(InteractionType), nullable=False)
    status = Column(
        SAEnum(InteractionStatus), default=InteractionStatus.DRAFT
    )
    date = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer)
    location = Column(String(255))
    products_discussed = Column(Text)  # comma-separated
    notes = Column(Text)
    ai_summary = Column(Text)
    sentiment_score = Column(Float)
    sentiment_label = Column(SAEnum(SentimentLabel))
    next_steps = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    hcp = relationship("HCP", back_populates="interactions")
    follow_ups = relationship("FollowUp", back_populates="interaction")


class FollowUp(Base):
    __tablename__ = "follow_ups"

    id = Column(Integer, primary_key=True, index=True)
    interaction_id = Column(
        Integer, ForeignKey("interactions.id"), nullable=False
    )
    scheduled_date = Column(DateTime, nullable=False)
    activity_type = Column(String(100))
    description = Column(Text)
    status = Column(String(50), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)

    interaction = relationship("Interaction", back_populates="follow_ups")
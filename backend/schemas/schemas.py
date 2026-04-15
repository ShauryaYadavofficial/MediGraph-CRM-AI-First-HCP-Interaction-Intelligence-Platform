from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum


class InteractionTypeEnum(str, Enum):
    VISIT = "visit"
    CALL = "call"
    EMAIL = "email"
    CONFERENCE = "conference"
    WEBINAR = "webinar"


class InteractionStatusEnum(str, Enum):
    DRAFT = "draft"
    COMPLETED = "completed"
    FOLLOW_UP_REQUIRED = "follow_up_required"


# ── HCP Schemas ──────────────────────────────────────────────
class HCPBase(BaseModel):
    name: str
    specialty: Optional[str] = None
    hospital: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    territory: Optional[str] = None
    tier: Optional[str] = None


class HCPCreate(HCPBase):
    pass


class HCPResponse(HCPBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ── Interaction Schemas ───────────────────────────────────────
class InteractionCreate(BaseModel):
    hcp_id: int
    interaction_type: InteractionTypeEnum
    date: datetime
    duration_minutes: Optional[int] = None
    location: Optional[str] = None
    products_discussed: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[InteractionStatusEnum] = InteractionStatusEnum.DRAFT


class InteractionUpdate(BaseModel):
    interaction_type: Optional[InteractionTypeEnum] = None
    date: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    location: Optional[str] = None
    products_discussed: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[InteractionStatusEnum] = None
    next_steps: Optional[str] = None


class InteractionResponse(BaseModel):
    id: int
    hcp_id: int
    interaction_type: str
    status: str
    date: datetime
    duration_minutes: Optional[int]
    location: Optional[str]
    products_discussed: Optional[str]
    notes: Optional[str]
    ai_summary: Optional[str]
    sentiment_score: Optional[float]
    sentiment_label: Optional[str]
    next_steps: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ── Follow-up Schemas ─────────────────────────────────────────
class FollowUpCreate(BaseModel):
    interaction_id: int
    scheduled_date: datetime
    activity_type: str
    description: Optional[str] = None


class FollowUpResponse(FollowUpCreate):
    id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ── Chat Schemas ──────────────────────────────────────────────
class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    hcp_id: Optional[int] = None
    interaction_id: Optional[int] = None


class ChatResponse(BaseModel):
    reply: str
    interaction_id: Optional[int] = None
    action_taken: Optional[str] = None
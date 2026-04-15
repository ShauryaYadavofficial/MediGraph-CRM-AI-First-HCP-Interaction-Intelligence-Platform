from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database.connection import get_db
from database import models
from schemas.schemas import (
    InteractionCreate,
    InteractionUpdate,
    InteractionResponse,
    ChatRequest,
    ChatResponse,
)
from agents.hcp_agent import run_agent

router = APIRouter(prefix="/api/interactions", tags=["Interactions"])


@router.get("/", response_model=List[InteractionResponse])
def list_interactions(
    hcp_id: int = None,
    status: str = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Interaction)
    if hcp_id:
        query = query.filter(models.Interaction.hcp_id == hcp_id)
    if status:
        query = query.filter(models.Interaction.status == status)
    return query.order_by(models.Interaction.date.desc()).all()


@router.get("/{interaction_id}", response_model=InteractionResponse)
def get_interaction(interaction_id: int, db: Session = Depends(get_db)):
    interaction = (
        db.query(models.Interaction)
        .filter(models.Interaction.id == interaction_id)
        .first()
    )
    if not interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    return interaction


@router.post("/", response_model=InteractionResponse)
def create_interaction(
    data: InteractionCreate, db: Session = Depends(get_db)
):
    hcp = db.query(models.HCP).filter(models.HCP.id == data.hcp_id).first()
    if not hcp:
        raise HTTPException(status_code=404, detail="HCP not found")

    interaction = models.Interaction(**data.model_dump())
    db.add(interaction)
    db.commit()
    db.refresh(interaction)
    return interaction


@router.put("/{interaction_id}", response_model=InteractionResponse)
def update_interaction(
    interaction_id: int,
    data: InteractionUpdate,
    db: Session = Depends(get_db),
):
    interaction = (
        db.query(models.Interaction)
        .filter(models.Interaction.id == interaction_id)
        .first()
    )
    if not interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(interaction, field, value)

    db.commit()
    db.refresh(interaction)
    return interaction


@router.delete("/{interaction_id}")
def delete_interaction(interaction_id: int, db: Session = Depends(get_db)):
    interaction = (
        db.query(models.Interaction)
        .filter(models.Interaction.id == interaction_id)
        .first()
    )
    if not interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    db.delete(interaction)
    db.commit()
    return {"message": "Interaction deleted successfully"}


@router.post("/chat", response_model=ChatResponse)
async def chat_with_agent(request: ChatRequest):
    """
    Conversational interface for logging interactions via the
    LangGraph AI agent.
    """
    try:
        messages = [m.model_dump() for m in request.messages]
        result = await run_agent(
            messages=messages,
            hcp_id=request.hcp_id,
        )
        return ChatResponse(
            reply=result["reply"],
            action_taken=result.get("action_taken"),
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Agent error: {str(e)}",
        )
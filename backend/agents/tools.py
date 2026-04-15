import json
from datetime import datetime
from typing import Optional, Union
from langchain_core.tools import tool
from sqlalchemy.orm import Session
from database.connection import SessionLocal
from database import models


def get_db_session() -> Session:
    return SessionLocal()


def _coerce_int(val, field_name: str):
    """Force-convert a value to int, raise clear error if impossible."""
    if val is None:
        raise ValueError(f"{field_name} is required and must be an integer.")
    try:
        return int(val)
    except (ValueError, TypeError):
        raise ValueError(
            f"{field_name} must be an integer ID, got: '{val}'. "
            f"Please look up the actual numeric ID first."
        )


def _coerce_date(val: str) -> datetime:
    """
    Parse ISO date strings. Falls back to utcnow() for vague
    values like 'current date and time' or 'today'.
    """
    if not val:
        return datetime.utcnow()
    vague = ["current", "today", "now", "date and time"]
    if any(v in val.lower() for v in vague):
        return datetime.utcnow()
    try:
        return datetime.fromisoformat(val)
    except ValueError:
        return datetime.utcnow()


# ── Tool 1: Log Interaction ───────────────────────────────────
@tool
def log_interaction(
    hcp_id: Union[int, str],
    interaction_type: str,
    date: str,
    notes: str,
    products_discussed: Optional[str] = None,
    location: Optional[str] = None,
    duration_minutes: Optional[Union[int, str]] = None,
) -> str:
    """
    Log a new interaction with an HCP.

    IMPORTANT:
    - hcp_id MUST be a numeric integer (e.g. 1, 2, 3).
      Use get_hcp_profile or list HCPs to find the correct ID first.
    - date MUST be an ISO 8601 string (e.g. 2026-04-15T10:00:00).
      If the user says 'today' or 'now', use the current UTC datetime.
    - interaction_type must be one of: visit, call, email,
      conference, webinar.

    Args:
        hcp_id: Numeric ID of the HCP (integer).
        interaction_type: Type of interaction.
        date: ISO 8601 datetime string.
        notes: Detailed notes about the interaction.
        products_discussed: Comma-separated products discussed.
        location: Location of the interaction.
        duration_minutes: Duration in minutes (integer).
    """
    db = get_db_session()
    try:
        hcp_id = _coerce_int(hcp_id, "hcp_id")
        interaction_date = _coerce_date(date)
        if duration_minutes is not None:
            try:
                duration_minutes = int(duration_minutes)
            except (ValueError, TypeError):
                duration_minutes = None

        hcp = db.query(models.HCP).filter(models.HCP.id == hcp_id).first()
        if not hcp:
            return json.dumps(
                {
                    "error": f"HCP with ID {hcp_id} not found.",
                    "hint": "Use get_hcp_profile or check available HCP IDs.",
                }
            )

        new_interaction = models.Interaction(
            hcp_id=hcp_id,
            interaction_type=interaction_type,
            date=interaction_date,
            notes=notes,
            products_discussed=products_discussed,
            location=location,
            duration_minutes=duration_minutes,
            status="draft",
        )
        db.add(new_interaction)
        db.commit()
        db.refresh(new_interaction)

        return json.dumps(
            {
                "success": True,
                "interaction_id": new_interaction.id,
                "message": (
                    f"Interaction with {hcp.name} logged successfully. "
                    f"Interaction ID: {new_interaction.id}"
                ),
                "hcp_name": hcp.name,
                "date_logged": interaction_date.isoformat(),
            }
        )
    except ValueError as ve:
        return json.dumps({"error": str(ve)})
    except Exception as e:
        db.rollback()
        return json.dumps({"error": str(e)})
    finally:
        db.close()


# ── Tool 2: Edit Interaction ──────────────────────────────────
@tool
def edit_interaction(
    interaction_id: Union[int, str],
    notes: Optional[str] = None,
    products_discussed: Optional[str] = None,
    location: Optional[str] = None,
    duration_minutes: Optional[Union[int, str]] = None,
    status: Optional[str] = None,
    next_steps: Optional[str] = None,
    interaction_type: Optional[str] = None,
    date: Optional[str] = None,
) -> str:
    """
    Edit/update an existing HCP interaction record.
    Only the fields provided will be updated.

    IMPORTANT:
    - interaction_id MUST be a numeric integer (e.g. 1, 2, 3).
    - status must be one of: draft, completed, follow_up_required.

    Args:
        interaction_id: Numeric ID of the interaction (integer).
        notes: Updated notes.
        products_discussed: Updated comma-separated products.
        location: Updated location.
        duration_minutes: Updated duration in minutes (integer).
        status: Updated status string.
        next_steps: Updated next steps.
        interaction_type: Updated interaction type.
        date: Updated ISO 8601 datetime string.
    """
    db = get_db_session()
    try:
        interaction_id = _coerce_int(interaction_id, "interaction_id")
        if duration_minutes is not None:
            try:
                duration_minutes = int(duration_minutes)
            except (ValueError, TypeError):
                duration_minutes = None

        interaction = (
            db.query(models.Interaction)
            .filter(models.Interaction.id == interaction_id)
            .first()
        )
        if not interaction:
            return json.dumps(
                {"error": f"Interaction ID {interaction_id} not found."}
            )

        if notes is not None:
            interaction.notes = notes
        if products_discussed is not None:
            interaction.products_discussed = products_discussed
        if location is not None:
            interaction.location = location
        if duration_minutes is not None:
            interaction.duration_minutes = duration_minutes
        if status is not None:
            interaction.status = status
        if next_steps is not None:
            interaction.next_steps = next_steps
        if interaction_type is not None:
            interaction.interaction_type = interaction_type
        if date is not None:
            interaction.date = _coerce_date(date)

        interaction.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(interaction)

        return json.dumps(
            {
                "success": True,
                "interaction_id": interaction_id,
                "message": f"Interaction {interaction_id} updated successfully.",
            }
        )
    except ValueError as ve:
        return json.dumps({"error": str(ve)})
    except Exception as e:
        db.rollback()
        return json.dumps({"error": str(e)})
    finally:
        db.close()


# ── Tool 3: Get HCP Profile ───────────────────────────────────
@tool
def get_hcp_profile(hcp_id: Union[int, str]) -> str:
    """
    Retrieve a complete profile of an HCP including their recent
    interaction history, tier, specialty, and hospital affiliation.
    Use this first to find the correct numeric HCP ID before logging.

    Args:
        hcp_id: Numeric ID of the HCP (integer).
    """
    db = get_db_session()
    try:
        hcp_id = _coerce_int(hcp_id, "hcp_id")

        hcp = db.query(models.HCP).filter(models.HCP.id == hcp_id).first()
        if not hcp:
            all_hcps = db.query(models.HCP).limit(10).all()
            return json.dumps(
                {
                    "error": f"HCP with ID {hcp_id} not found.",
                    "available_hcps": [
                        {"id": h.id, "name": h.name, "specialty": h.specialty}
                        for h in all_hcps
                    ],
                }
            )

        recent_interactions = (
            db.query(models.Interaction)
            .filter(models.Interaction.hcp_id == hcp_id)
            .order_by(models.Interaction.date.desc())
            .limit(5)
            .all()
        )

        return json.dumps(
            {
                "hcp": {
                    "id": hcp.id,
                    "name": hcp.name,
                    "specialty": hcp.specialty,
                    "hospital": hcp.hospital,
                    "email": hcp.email,
                    "phone": hcp.phone,
                    "territory": hcp.territory,
                    "tier": hcp.tier,
                },
                "total_interactions": len(recent_interactions),
                "recent_interactions": [
                    {
                        "id": i.id,
                        "type": i.interaction_type,
                        "date": i.date.isoformat(),
                        "status": i.status,
                        "products": i.products_discussed,
                        "sentiment": i.sentiment_label,
                        "ai_summary": i.ai_summary,
                    }
                    for i in recent_interactions
                ],
            }
        )
    except ValueError as ve:
        return json.dumps({"error": str(ve)})
    except Exception as e:
        return json.dumps({"error": str(e)})
    finally:
        db.close()


# ── Tool 4: Schedule Follow-Up ────────────────────────────────
@tool
def schedule_followup(
    interaction_id: Union[int, str],
    scheduled_date: str,
    activity_type: str,
    description: Optional[str] = None,
) -> str:
    """
    Schedule a follow-up activity for an HCP interaction.

    IMPORTANT:
    - interaction_id MUST be a numeric integer.
    - scheduled_date MUST be an ISO 8601 string
      (e.g. 2026-04-20T10:00:00).
    - activity_type should be one of: call, visit, email,
      send_sample, send_literature.

    Args:
        interaction_id: Numeric ID of the interaction (integer).
        scheduled_date: ISO 8601 datetime for the follow-up.
        activity_type: Type of follow-up activity.
        description: Additional details.
    """
    db = get_db_session()
    try:
        interaction_id = _coerce_int(interaction_id, "interaction_id")
        followup_date = _coerce_date(scheduled_date)

        interaction = (
            db.query(models.Interaction)
            .filter(models.Interaction.id == interaction_id)
            .first()
        )
        if not interaction:
            return json.dumps(
                {"error": f"Interaction ID {interaction_id} not found."}
            )

        followup = models.FollowUp(
            interaction_id=interaction_id,
            scheduled_date=followup_date,
            activity_type=activity_type,
            description=description,
            status="pending",
        )
        db.add(followup)
        interaction.status = "follow_up_required"
        db.commit()
        db.refresh(followup)

        return json.dumps(
            {
                "success": True,
                "followup_id": followup.id,
                "message": (
                    f"Follow-up scheduled for "
                    f"{followup_date.strftime('%B %d, %Y')}. "
                    f"Activity: {activity_type}"
                ),
                "interaction_status_updated": "follow_up_required",
            }
        )
    except ValueError as ve:
        return json.dumps({"error": str(ve)})
    except Exception as e:
        db.rollback()
        return json.dumps({"error": str(e)})
    finally:
        db.close()


# ── Tool 5: Analyze Interaction Sentiment ────────────────────
@tool
def analyze_and_summarize_interaction(
    interaction_id: Union[int, str],
) -> str:
    """
    Analyze the sentiment of an interaction's notes and generate
    an AI summary with suggested next steps.

    IMPORTANT: interaction_id MUST be a numeric integer.

    Args:
        interaction_id: Numeric ID of the interaction (integer).
    """
    db = get_db_session()
    try:
        interaction_id = _coerce_int(interaction_id, "interaction_id")

        interaction = (
            db.query(models.Interaction)
            .filter(models.Interaction.id == interaction_id)
            .first()
        )
        if not interaction:
            return json.dumps(
                {"error": f"Interaction ID {interaction_id} not found."}
            )

        if not interaction.notes:
            return json.dumps(
                {"error": "No notes found for this interaction to analyze."}
            )

        notes = interaction.notes.lower()
        positive_keywords = [
            "interested", "positive", "enthusiastic", "agreed",
            "willing", "good", "great", "excellent", "prescribed",
            "recommend",
        ]
        negative_keywords = [
            "not interested", "refused", "competitor", "concern",
            "doubt", "won't", "no", "busy", "declined",
        ]

        pos_count = sum(1 for w in positive_keywords if w in notes)
        neg_count = sum(1 for w in negative_keywords if w in notes)
        total = pos_count + neg_count

        if total == 0:
            score = 0.5
            label = "neutral"
        else:
            score = pos_count / total
            label = (
                "positive" if score >= 0.6
                else "negative" if score < 0.4
                else "neutral"
            )

        hcp = (
            db.query(models.HCP)
            .filter(models.HCP.id == interaction.hcp_id)
            .first()
        )

        summary = (
            f"Interaction with {hcp.name if hcp else 'Unknown HCP'} "
            f"on {interaction.date.strftime('%B %d, %Y')} via "
            f"{interaction.interaction_type}. "
            f"Products discussed: {interaction.products_discussed or 'N/A'}. "
            f"Overall tone was {label}."
        )

        next_steps_map = {
            "positive": (
                "Schedule a follow-up visit within 2 weeks. "
                "Send product literature and samples."
            ),
            "neutral": (
                "Send additional clinical data. "
                "Schedule a follow-up call within 1 month."
            ),
            "negative": (
                "Consult manager on objection handling. "
                "Wait 4–6 weeks before re-engaging."
            ),
        }

        interaction.ai_summary = summary
        interaction.sentiment_score = round(score, 2)
        interaction.sentiment_label = label
        interaction.next_steps = next_steps_map[label]
        interaction.status = "completed"
        db.commit()

        return json.dumps(
            {
                "success": True,
                "interaction_id": interaction_id,
                "sentiment_score": round(score, 2),
                "sentiment_label": label,
                "ai_summary": summary,
                "next_steps": next_steps_map[label],
                "message": "Interaction analyzed and updated successfully.",
            }
        )
    except ValueError as ve:
        return json.dumps({"error": str(ve)})
    except Exception as e:
        db.rollback()
        return json.dumps({"error": str(e)})
    finally:
        db.close()


ALL_TOOLS = [
    log_interaction,
    edit_interaction,
    get_hcp_profile,
    schedule_followup,
    analyze_and_summarize_interaction,
]
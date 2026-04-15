from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database.connection import get_db
from database import models
from schemas.schemas import HCPCreate, HCPResponse

router = APIRouter(prefix="/api/hcp", tags=["HCP"])


@router.get("/", response_model=List[HCPResponse])
def list_hcps(
    search: str = None,
    territory: str = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.HCP)
    if search:
        query = query.filter(
            models.HCP.name.ilike(f"%{search}%")
            | models.HCP.email.ilike(f"%{search}%")
            | models.HCP.hospital.ilike(f"%{search}%")
        )
    if territory:
        query = query.filter(models.HCP.territory == territory)
    return query.all()


@router.get("/{hcp_id}", response_model=HCPResponse)
def get_hcp(hcp_id: int, db: Session = Depends(get_db)):
    hcp = db.query(models.HCP).filter(models.HCP.id == hcp_id).first()
    if not hcp:
        raise HTTPException(status_code=404, detail="HCP not found")
    return hcp


@router.post("/", response_model=HCPResponse)
def create_hcp(hcp_data: HCPCreate, db: Session = Depends(get_db)):
    hcp = models.HCP(**hcp_data.model_dump())
    db.add(hcp)
    db.commit()
    db.refresh(hcp)
    return hcp


@router.post("/seed", tags=["Dev"])
def seed_hcps(db: Session = Depends(get_db)):
    """Seed sample HCP data for development."""
    sample_hcps = [
        {
            "name": "Dr. Sarah Mitchell",
            "specialty": "Cardiology",
            "hospital": "Apollo Hospitals",
            "email": "s.mitchell@apollo.com",
            "phone": "+91-9876543210",
            "territory": "Mumbai",
            "tier": "A",
        },
        {
            "name": "Dr. Rajesh Kumar",
            "specialty": "Oncology",
            "hospital": "Tata Memorial Hospital",
            "email": "r.kumar@tatamemorial.com",
            "phone": "+91-9876543211",
            "territory": "Mumbai",
            "tier": "A",
        },
        {
            "name": "Dr. Priya Sharma",
            "specialty": "Diabetology",
            "hospital": "Fortis Healthcare",
            "email": "p.sharma@fortis.com",
            "phone": "+91-9876543212",
            "territory": "Delhi",
            "tier": "B",
        },
        {
            "name": "Dr. Anil Verma",
            "specialty": "Pulmonology",
            "hospital": "AIIMS Delhi",
            "email": "a.verma@aiims.com",
            "phone": "+91-9876543213",
            "territory": "Delhi",
            "tier": "A",
        },
        {
            "name": "Dr. Meena Iyer",
            "specialty": "Nephrology",
            "hospital": "Manipal Hospital",
            "email": "m.iyer@manipal.com",
            "phone": "+91-9876543214",
            "territory": "Bangalore",
            "tier": "B",
        },
    ]
    created = []
    for hcp_data in sample_hcps:
        existing = (
            db.query(models.HCP)
            .filter(models.HCP.email == hcp_data["email"])
            .first()
        )
        if not existing:
            hcp = models.HCP(**hcp_data)
            db.add(hcp)
            created.append(hcp_data["name"])
    db.commit()
    return {"seeded": created, "message": f"{len(created)} HCPs created."}
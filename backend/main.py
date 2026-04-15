from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from database.connection import engine
from database import models
from routers import hcp, interactions

load_dotenv()

# Create all tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HCP CRM API",
    description="AI-First CRM for Healthcare Professional Interactions",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(
        ","
    ),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(hcp.router)
app.include_router(interactions.router)


@app.get("/")
def root():
    return {
        "message": "HCP CRM API is running",
        "docs": "/docs",
        "version": "1.0.0",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}
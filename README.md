HCP CRM – AI-First Interaction Management System
An advanced, AI-powered CRM module designed for Life Sciences field representatives. This system allows users to log and manage Healthcare Professional (HCP) interactions through either a Structured Form or an Autonomous AI Agent built with LangGraph and Groq.
🚀 Key Features
Dual-Mode Logging: Switch between traditional forms and a conversational chat interface.
LangGraph AI Agent: An autonomous agent that uses 5 custom tools to manage database records.
Sentiment Analysis: Automatically detects HCP sentiment (Positive/Neutral/Negative) from interaction notes.
Intelligent Summarization: Generates clinical summaries and suggests next steps for the sales rep.
Robust Error Handling: Custom coercion logic to ensure the AI always submits correct data types (Integers/Dates) to the database.
🛠 Tech Stack
Frontend: React, Redux Toolkit (State Management), Lucide Icons.
Backend: Python 3.11+, FastAPI, SQLAlchemy (ORM).
AI/LLM: LangGraph (Agent Framework), Groq (llama-3.3-70b-versatile).
Database: PostgreSQL.
📋 Prerequisites
Before starting, ensure you have the following installed:
Node.js (v18 or higher)
Python (3.10 or higher)
PostgreSQL (Running on your local machine)
Groq API Key (Get it from console.groq.com)
⚙️ Installation & Setup
1. Database Setup
Create a new database in PostgreSQL:
code
SQL
CREATE DATABASE hcp_crm;
2. Backend Setup
Navigate to the backend folder, create a virtual environment, and install dependencies:
code
Bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
Create a .env file in the backend/ directory:
code
Env
GROQ_API_KEY=your_api_key_here
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/hcp_crm
ALLOWED_ORIGINS=http://localhost:3000
3. Initialize & Seed Data
The system includes a seeding script to populate your database with sample Doctors (HCPs):
code
Bash
# Start the server
uvicorn main:app --reload

# In a new terminal (or use your browser), run the seed endpoint:
# http://localhost:8000/api/hcp/seed
4. Frontend Setup
Navigate to the frontend folder and install packages:
code
Bash
cd frontend
npm install
npm start
🤖 How to Operate the AI Agent
The system features 5 core tools that the LangGraph agent can use:
log_interaction: Creates a new record.
edit_interaction: Modifies existing logs.
get_hcp_profile: Fetches doctor history and IDs.
schedule_followup: Sets up reminders (calls/visits).
analyze_and_summarize_interaction: Runs AI sentiment analysis.
Usage Example:
Imagine you just finished a meeting with Dr. Sarah Mitchell.
Search: In the UI, search for "Sarah". You will see she has HCP ID: 1.
Open AI Chat Agent: Switch to the "AI Chat Agent" tab.
Chat Prompt: Type the following:
"I just had a 15-minute visit with Dr. Sarah (ID 1) at Apollo Hospital. We discussed Cardivex. She was very positive and agreed to prescribe it to her heart patients."
AI Action:
The AI calls log_interaction using ID 1.
It converts "now" into a proper timestamp.
It extracts "Cardivex" as the product.
Refinement: Tell the AI:
"Summarize that interaction and schedule a follow-up call for next Tuesday."
Result: The AI will update the status to "Completed", generate a sentiment-based summary, and create a new follow-up task automatically.
📁 Project Structure
code
Text
hcp-crm/
├── backend/
│   ├── agents/      # LangGraph Agent logic & Tools
│   ├── database/    # Models and Connection
│   ├── routers/     # API Endpoints
│   └── main.py      # Entry point
└── frontend/
    ├── src/
    │   ├── components/ # UI Components (Chat/Form)
    │   ├── store/      # Redux Toolkit Slices
    │   └── services/   # Axios API Config
    └── package.json
📄 License
This project is submitted as part of the Technical Assignment for the Python Developer Role.
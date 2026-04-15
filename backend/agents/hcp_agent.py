import os
from typing import List
from dotenv import load_dotenv
from langchain_groq import ChatGroq
# line ~5: change this import
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langgraph.prebuilt import create_react_agent
from agents.tools import ALL_TOOLS

load_dotenv()

SYSTEM_PROMPT = """You are an AI assistant for a Life Sciences CRM,
helping pharmaceutical field reps log HCP interactions.

STRICT RULES — follow these exactly:
1. hcp_id, interaction_id, followup_id must ALWAYS be real integers
   (e.g. 1, 2, 3). NEVER pass names or descriptions as IDs.
2. date fields must ALWAYS be ISO 8601 strings like 2026-04-15T10:30:00.
   If the user says 'today' or 'now', convert it to the actual current
   UTC datetime string yourself before calling the tool.
3. duration_minutes must be an integer (e.g. 30), never a string.
4. If you do not know the HCP's numeric ID, call get_hcp_profile with
   a known ID, or ask the user for the ID before proceeding.
5. interaction_type must be one of: visit, call, email,
   conference, webinar.
6. status must be one of: draft, completed, follow_up_required.

Available tools:
1. log_interaction                    – Log a new HCP interaction
2. edit_interaction                   – Edit an existing interaction
3. get_hcp_profile                    – Retrieve HCP profile + history
4. schedule_followup                  – Schedule a follow-up activity
5. analyze_and_summarize_interaction  – Sentiment analysis + AI summary

Be concise and professional. Confirm every action taken.
"""


def get_llm():
    return ChatGroq(
        model="llama-3.3-70b-versatile",  # ← changed from gemma2-9b-it because it is decommitioned
        api_key=os.getenv("GROQ_API_KEY"),
        temperature=0.3,
        max_tokens=2048,
    )


def get_agent():
    llm = get_llm()
    agent = create_react_agent(
        model=llm,
        tools=ALL_TOOLS,
        state_modifier=SYSTEM_PROMPT,
    )
    return agent


async def run_agent(messages: list, hcp_id: int = None) -> dict:
    agent = get_agent()

    formatted_messages = []
    for msg in messages:
        if msg["role"] == "user":
            content = msg["content"]
            if hcp_id and len(formatted_messages) == 0:
                content = f"[Context: HCP ID = {hcp_id}]\n{content}"
            formatted_messages.append(HumanMessage(content=content))
        elif msg["role"] == "assistant":
            from langchain_core.messages import AIMessage
            formatted_messages.append(AIMessage(content=msg["content"]))

    result = await agent.ainvoke({"messages": formatted_messages})

    last_message = result["messages"][-1]
    reply = last_message.content

    action_taken = None
    for msg in result["messages"]:
        if hasattr(msg, "name"):
            action_taken = msg.name
            break

    return {
        "reply": reply,
        "action_taken": action_taken,
    }
"""SkillSeed FastAPI backend.

Endpoints (all under /api):
- GET  /api/health
- GET  /api/profile?device_id=...              -> get or create device growth profile
- PATCH /api/profile                            -> update profile fields
- POST /api/nova/chat                           -> Claude Sonnet 4.5 chat with Nova; returns reply + optional cards
- POST /api/nova/stt                            -> Whisper transcription (multipart audio upload)
- POST /api/nova/tts                            -> OpenAI TTS -> base64 mp3
- GET  /api/careers                             -> list careers (optional ?category=)
- GET  /api/careers/{career_id}                 -> career detail
- GET  /api/skills                              -> list future-skills tracks
- GET  /api/missions?device_id=...              -> list missions with completion status
- POST /api/missions/{mission_id}/complete      -> mark complete, add growth points
- GET  /api/discover/questions                  -> conversational assessment questions
- POST /api/discover/analyze                    -> answers -> Growth Profile analysis (Claude)
"""

import os
import json
import uuid
import tempfile
import logging
from pathlib import Path
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pydantic import BaseModel, Field

from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.llm.openai.speech_to_text import OpenAISpeechToText
from emergentintegrations.llm.openai.text_to_speech import OpenAITextToSpeech

from seed_data import CAREERS, SKILLS, MISSIONS, DISCOVER_QUESTIONS

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("skillseed")

app = FastAPI(title="SkillSeed API")
api = APIRouter(prefix="/api")

# --------------------- Models ---------------------

class ProfileIn(BaseModel):
    device_id: str
    name: Optional[str] = None
    age: Optional[int] = None
    interests: Optional[List[str]] = None
    learning_style: Optional[str] = None
    strengths: Optional[List[str]] = None
    growth_profile_summary: Optional[str] = None
    growth_points: Optional[int] = None
    streak: Optional[int] = None
    onboarded: Optional[bool] = None


class Profile(BaseModel):
    device_id: str
    name: str = ""
    age: Optional[int] = None
    interests: List[str] = []
    learning_style: str = ""
    strengths: List[str] = []
    growth_profile_summary: str = ""
    growth_points: int = 0
    streak: int = 0
    completed_missions: List[str] = []
    onboarded: bool = False
    created_at: str = ""


class ChatMessageIn(BaseModel):
    device_id: str
    session_id: Optional[str] = None
    message: str
    profile_context: Optional[Dict[str, Any]] = None


class TTSIn(BaseModel):
    text: str
    voice: str = "nova"
    speed: float = 1.0


class DiscoverAnalyzeIn(BaseModel):
    device_id: str
    answers: List[Dict[str, str]]  # [{"q": "...", "a": "..."}]


class MissionCompleteIn(BaseModel):
    device_id: str


# --------------------- Helpers ---------------------

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


async def _get_or_create_profile(device_id: str) -> Dict[str, Any]:
    doc = await db.profiles.find_one({"device_id": device_id}, {"_id": 0})
    if doc:
        return doc
    profile = Profile(device_id=device_id, created_at=_now_iso()).dict()
    await db.profiles.insert_one({**profile})
    # re-fetch without _id
    doc = await db.profiles.find_one({"device_id": device_id}, {"_id": 0})
    return doc


def _nova_system_prompt(profile: Dict[str, Any]) -> str:
    name = profile.get("name") or "friend"
    interests = ", ".join(profile.get("interests", [])) or "not yet known"
    strengths = ", ".join(profile.get("strengths", [])) or "not yet known"
    style = profile.get("learning_style") or "not yet known"
    points = profile.get("growth_points", 0)
    completed = len(profile.get("completed_missions", []))
    return f"""You are Nova, a warm, curious, encouraging AI growth companion for school students (ages 11-16).
You are NOT a teacher, NOT a chatbot, and NEVER corporate. You feel like a smart, kind elder sibling.
Your job is to help {name} discover who they are — their interests, strengths, dreams — before deciding what they want to become.

Student context (use this naturally, don't repeat it back):
- Name: {name}
- Interests: {interests}
- Strengths: {strengths}
- Learning style: {style}
- Growth points: {points}, Missions completed: {completed}

Rules for every reply:
1. Keep replies SHORT and conversational (2-4 sentences max, like a text message from a friend).
2. Ask ONE thoughtful follow-up question when appropriate. Never a wall of text.
3. Never lecture. Never sound like a textbook.
4. Reference the student's context naturally when it fits.
5. Be genuinely curious and playful.

CRITICAL OUTPUT FORMAT — respond ONLY with valid minified JSON matching this schema:
{{
  "reply": "<Nova's spoken message>",
  "cards": [
    {{"type": "career", "id": "<career_id from list>", "reason": "why this fits"}},
    {{"type": "mission", "id": "<mission_id from list>", "reason": "why this fits"}},
    {{"type": "skill", "id": "<skill_id from list>", "reason": "why this fits"}}
  ]
}}

Include cards ONLY when they genuinely help the student. Empty array [] is perfectly fine most of the time.
Available career ids: engineer, doctor, lawyer, teacher, creator, founder, designer, freelancer, ai_engineer, prompt_engineer, ai_researcher, musician, writer, game_designer, filmmaker.
Available mission ids: m_dream_app, m_ai_image, m_interview_grand, m_explain_ai, m_solve_problem, m_60s_video, m_save_50, m_teach_friend.
Available skill ids: ai_literacy, financial_literacy, communication, coding, creativity.

Return ONLY the JSON — no markdown, no code fences, no prose outside the JSON."""


def _extract_json(text: str) -> Optional[Dict[str, Any]]:
    """Extract JSON object from a possibly-wrapped LLM response."""
    if not text:
        return None
    t = text.strip()
    # strip code fences
    if t.startswith("```"):
        t = t.strip("`")
        if t.lower().startswith("json"):
            t = t[4:]
        t = t.strip()
    # find outermost {...}
    start = t.find("{")
    end = t.rfind("}")
    if start == -1 or end == -1:
        return None
    try:
        return json.loads(t[start:end + 1])
    except Exception:
        return None


# --------------------- Routes: Health & Profile ---------------------

@api.get("/health")
async def health():
    return {"status": "ok", "service": "skillseed", "time": _now_iso()}


@api.get("/profile", response_model=Profile)
async def get_profile(device_id: str):
    doc = await _get_or_create_profile(device_id)
    return Profile(**doc)


@api.patch("/profile", response_model=Profile)
async def patch_profile(payload: ProfileIn):
    await _get_or_create_profile(payload.device_id)
    updates = {k: v for k, v in payload.dict().items() if v is not None and k != "device_id"}
    if updates:
        await db.profiles.update_one({"device_id": payload.device_id}, {"$set": updates})
    doc = await db.profiles.find_one({"device_id": payload.device_id}, {"_id": 0})
    return Profile(**doc)


# --------------------- Routes: Nova (chat + STT + TTS) ---------------------

@api.post("/nova/chat")
async def nova_chat(payload: ChatMessageIn):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(500, "EMERGENT_LLM_KEY not configured")
    profile = await _get_or_create_profile(payload.device_id)
    session_id = payload.session_id or f"{payload.device_id}-default"

    # Load prior history for this session
    history_docs = await db.nova_messages.find(
        {"device_id": payload.device_id, "session_id": session_id},
        {"_id": 0, "role": 1, "content": 1, "created_at": 1},
    ).sort("created_at", 1).to_list(50)

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=_nova_system_prompt(profile),
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")

    # Re-hydrate: emergentintegrations LlmChat doesn't have manual seed for history,
    # so we prepend a compact summary if history exists.
    if history_docs:
        summary_lines = []
        for m in history_docs[-10:]:
            role = m.get("role", "user")
            content = (m.get("content", "") or "")[:280]
            summary_lines.append(f"{role.upper()}: {content}")
        preface = "Recent conversation so far:\n" + "\n".join(summary_lines) + "\n\nNow the student says:\n"
        prompt_text = preface + payload.message
    else:
        prompt_text = payload.message

    try:
        raw = await chat.send_message(UserMessage(text=prompt_text))
    except Exception as e:
        logger.exception("Nova chat failed")
        raise HTTPException(502, f"Nova unavailable: {e}")

    parsed = _extract_json(raw) or {"reply": (raw or "").strip() or "Hmm, tell me more!", "cards": []}
    reply_text = parsed.get("reply") or "Tell me more."
    cards_raw = parsed.get("cards") or []

    # Enrich cards with data from seed
    enriched: List[Dict[str, Any]] = []
    career_by_id = {c["id"]: c for c in CAREERS}
    mission_by_id = {m["id"]: m for m in MISSIONS}
    skill_by_id = {s["id"]: s for s in SKILLS}
    for c in cards_raw:
        t = (c or {}).get("type")
        cid = (c or {}).get("id")
        reason = (c or {}).get("reason", "")
        if t == "career" and cid in career_by_id:
            enriched.append({"type": "career", "data": career_by_id[cid], "reason": reason})
        elif t == "mission" and cid in mission_by_id:
            enriched.append({"type": "mission", "data": mission_by_id[cid], "reason": reason})
        elif t == "skill" and cid in skill_by_id:
            enriched.append({"type": "skill", "data": skill_by_id[cid], "reason": reason})

    # Persist history
    now = _now_iso()
    await db.nova_messages.insert_many([
        {"device_id": payload.device_id, "session_id": session_id, "role": "user",
         "content": payload.message, "created_at": now},
        {"device_id": payload.device_id, "session_id": session_id, "role": "assistant",
         "content": reply_text, "cards": enriched, "created_at": now},
    ])

    return {"reply": reply_text, "cards": enriched, "session_id": session_id}


@api.get("/nova/history")
async def nova_history(device_id: str, session_id: Optional[str] = None):
    q: Dict[str, Any] = {"device_id": device_id}
    if session_id:
        q["session_id"] = session_id
    docs = await db.nova_messages.find(q, {"_id": 0}).sort("created_at", 1).to_list(200)
    return {"messages": docs}


@api.post("/nova/stt")
async def nova_stt(file: UploadFile = File(...), language: Optional[str] = Form(None)):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(500, "EMERGENT_LLM_KEY not configured")
    # persist to a temp file (Whisper client accepts a path or a file object)
    suffix = ""
    if file.filename and "." in file.filename:
        suffix = "." + file.filename.rsplit(".", 1)[-1]
    if not suffix:
        suffix = ".m4a"
    try:
        raw_bytes = await file.read()
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(raw_bytes)
            tmp_path = tmp.name
        stt = OpenAISpeechToText(api_key=EMERGENT_LLM_KEY)
        with open(tmp_path, "rb") as fh:
            result = await stt.transcribe(file=fh, model="whisper-1", language=language)
        # Result can be dict-like or object with .text
        text = ""
        if isinstance(result, dict):
            text = result.get("text", "") or ""
        else:
            text = getattr(result, "text", "") or str(result)
        return {"text": text.strip()}
    except Exception as e:
        logger.exception("STT failed")
        raise HTTPException(502, f"Transcription failed: {e}")
    finally:
        try:
            os.unlink(tmp_path)  # type: ignore
        except Exception:
            pass


@api.post("/nova/tts")
async def nova_tts(payload: TTSIn):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(500, "EMERGENT_LLM_KEY not configured")
    try:
        tts = OpenAITextToSpeech(api_key=EMERGENT_LLM_KEY)
        b64 = await tts.generate_speech_base64(
            text=payload.text[:1000],
            model="tts-1",
            voice=payload.voice,  # "nova"
            speed=payload.speed,
            response_format="mp3",
        )
        return {"audio_base64": b64, "mime": "audio/mpeg"}
    except Exception as e:
        logger.exception("TTS failed")
        raise HTTPException(502, f"Speech generation failed: {e}")


# --------------------- Routes: Content (Careers / Skills / Missions) ---------------------

@api.get("/careers")
async def list_careers(category: Optional[str] = None):
    items = CAREERS
    if category and category != "all":
        items = [c for c in CAREERS if c["category"] == category]
    return {"items": items}


@api.get("/careers/{career_id}")
async def get_career(career_id: str):
    for c in CAREERS:
        if c["id"] == career_id:
            return c
    raise HTTPException(404, "Career not found")


@api.get("/skills")
async def list_skills():
    return {"items": SKILLS}


@api.get("/skills/{skill_id}")
async def get_skill(skill_id: str):
    for s in SKILLS:
        if s["id"] == skill_id:
            return s
    raise HTTPException(404, "Skill not found")


@api.get("/missions")
async def list_missions(device_id: str):
    profile = await _get_or_create_profile(device_id)
    completed = set(profile.get("completed_missions", []))
    items = [{**m, "completed": m["id"] in completed} for m in MISSIONS]
    return {"items": items}


@api.get("/missions/{mission_id}")
async def get_mission(mission_id: str, device_id: str):
    profile = await _get_or_create_profile(device_id)
    completed = set(profile.get("completed_missions", []))
    for m in MISSIONS:
        if m["id"] == mission_id:
            return {**m, "completed": m["id"] in completed}
    raise HTTPException(404, "Mission not found")


@api.post("/missions/{mission_id}/complete")
async def complete_mission(mission_id: str, payload: MissionCompleteIn):
    mission = next((m for m in MISSIONS if m["id"] == mission_id), None)
    if not mission:
        raise HTTPException(404, "Mission not found")
    profile = await _get_or_create_profile(payload.device_id)
    completed = list(profile.get("completed_missions", []))
    already = mission_id in completed
    updates: Dict[str, Any] = {}
    points_gained = 0
    if not already:
        completed.append(mission_id)
        points_gained = int(mission.get("growth_points", 0))
        updates["completed_missions"] = completed
        updates["growth_points"] = int(profile.get("growth_points", 0)) + points_gained
        updates["streak"] = int(profile.get("streak", 0)) + 1
        await db.profiles.update_one({"device_id": payload.device_id}, {"$set": updates})
    doc = await db.profiles.find_one({"device_id": payload.device_id}, {"_id": 0})
    return {
        "mission": mission,
        "already_completed": already,
        "points_gained": points_gained,
        "profile": doc,
    }


# --------------------- Routes: Discover ---------------------

@api.get("/discover/questions")
async def discover_questions():
    return {"items": DISCOVER_QUESTIONS}


@api.post("/discover/analyze")
async def discover_analyze(payload: DiscoverAnalyzeIn):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(500, "EMERGENT_LLM_KEY not configured")
    qa_block = "\n".join([f"Q: {a.get('q','')}\nA: {a.get('a','')}" for a in payload.answers])

    system = """You are Nova, an AI growth companion for students ages 11-16.
Analyze the student's answers and return a beautiful Growth Profile.

Return ONLY minified JSON — no markdown, no code fences:
{
  "headline": "<a short 6-10 word poetic identity line like 'An Analytical Explorer who loves building things'>",
  "learning_style": "<one of: Analytical, Creative, Social, Hands-on, Reflective, or a blend like 'Analytical + Creative'>",
  "strengths": ["<3-5 short one-word strengths>"],
  "interests": ["<3-5 short interest tags>"],
  "summary": "<2-3 warm sentences describing who this student is and what fits them>",
  "career_matches": ["<3-4 career_ids from: engineer, doctor, lawyer, teacher, creator, founder, designer, freelancer, ai_engineer, prompt_engineer, ai_researcher, musician, writer, game_designer, filmmaker>"],
  "recommended_skills": ["<2-3 skill_ids from: ai_literacy, financial_literacy, communication, coding, creativity>"]
}
Be warm, specific, and never generic."""

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"discover-{payload.device_id}-{uuid.uuid4().hex[:8]}",
        system_message=system,
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")

    try:
        raw = await chat.send_message(UserMessage(text=f"Student's answers:\n{qa_block}"))
    except Exception as e:
        logger.exception("Discover analyze failed")
        raise HTTPException(502, f"Analysis failed: {e}")

    parsed = _extract_json(raw) or {}
    if not parsed:
        parsed = {
            "headline": "A curious, growing mind",
            "learning_style": "Blend",
            "strengths": ["Curiosity", "Focus", "Creativity"],
            "interests": ["Ideas", "Making things"],
            "summary": "You're just getting started — and that's exactly the best place to be. Let's explore together.",
            "career_matches": ["creator", "founder", "designer"],
            "recommended_skills": ["ai_literacy", "creativity"],
        }

    # Persist onto profile
    updates = {
        "growth_profile_summary": parsed.get("summary", ""),
        "learning_style": parsed.get("learning_style", ""),
        "strengths": parsed.get("strengths", []),
        "interests": parsed.get("interests", []),
        "onboarded": True,
    }
    await db.profiles.update_one({"device_id": payload.device_id}, {"$set": updates}, upsert=False)

    # Enrich matches
    career_by_id = {c["id"]: c for c in CAREERS}
    skill_by_id = {s["id"]: s for s in SKILLS}
    parsed["career_matches_data"] = [career_by_id[c] for c in parsed.get("career_matches", []) if c in career_by_id]
    parsed["recommended_skills_data"] = [skill_by_id[s] for s in parsed.get("recommended_skills", []) if s in skill_by_id]

    return parsed


# --------------------- Mount ---------------------

app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def _shutdown():
    client.close()

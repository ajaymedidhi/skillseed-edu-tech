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

import os
import json
from google import genai
from google.genai import types

class UserMessage:
    def __init__(self, text):
        self.text = text

class LlmChat:
    def __init__(self, api_key, session_id, system_message):
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY")
        self.system_message = system_message
        self.client = genai.Client(api_key=self.api_key)
        self.model = "gemini-2.5-flash"

    def with_model(self, vendor, model):
        # We always use gemini model
        self.model = "gemini-2.5-flash"
        return self

    async def send_message(self, message: UserMessage):
        prompt = f"System: {self.system_message}\n\nUser: {message.text}\n\nOutput JSON strictly formatted with a 'reply' string field and a 'cards' array field."
        try:
            response = await self.client.aio.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            return response.text
        except Exception as e:
            print(f"Gemini Error: {e}")
            return json.dumps({"reply": f"Gemini API Error: {str(e)}", "cards": []})

class OpenAISpeechToText:
    def __init__(self, api_key):
        pass
    async def transcribe(self, file, model, language):
        return {"text": "This is a mocked transcription."}

class OpenAITextToSpeech:
    def __init__(self, api_key):
        pass
    async def generate_speech_base64(self, text, model, voice, speed, response_format):
        return "mock_base64_audio_data"

from seed_data import CAREERS, SKILLS, MISSIONS, DISCOVER_QUESTIONS, TRAITS

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

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
    # Emotional-continuity fields
    trait_scores: Dict[str, int] = {}
    memory_notes: List[str] = []
    milestones: List[Dict[str, Any]] = []


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
    traits = profile.get("trait_scores", {}) or {}
    top_traits = ", ".join([f"{t}={traits.get(t,0)}" for t in ["curiosity","creativity","confidence","communication","leadership","resilience"]])
    memory = profile.get("memory_notes", []) or []
    memory_block = ""
    if memory:
        memory_block = "\n\nWhat you remember about them (from past days — reference naturally, do NOT dump verbatim):\n" + "\n".join([f"- {m}" for m in memory[-8:]])

    return f"""You are Nova, a warm, curious, encouraging AI growth companion for school students (ages 11-16).
You are NOT a teacher, NOT a chatbot, and NEVER corporate. You feel like a smart, kind elder sibling.
Your relationship with this student is long-term. You grow with them across years.

Student context (use naturally — do NOT recite):
- Name: {name}
- Interests: {interests}
- Strengths: {strengths}
- Learning style: {style}
- Growth points: {points}, Missions completed: {completed}
- Trait scores (0-100): {top_traits}{memory_block}

Rules for every reply:
1. Keep replies SHORT and conversational (2-4 sentences max, like a text message from a friend).
2. Ask ONE thoughtful follow-up question when appropriate. Never a wall of text.
3. Never lecture. Never sound like a textbook. Never say "As your AI".
4. When something you remember from a past day fits, reference it gently ("last time you said…", "the anime thing you told me about…"). Don't force it.
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
    if not GEMINI_API_KEY:
        raise HTTPException(500, "GEMINI_API_KEY not configured")
    profile = await _get_or_create_profile(payload.device_id)
    session_id = payload.session_id or f"{payload.device_id}-default"

    # Load prior history for this session
    history_docs = await db.nova_messages.find(
        {"device_id": payload.device_id, "session_id": session_id},
        {"_id": 0, "role": 1, "content": 1, "created_at": 1},
    ).sort("created_at", 1).to_list(50)

    chat = LlmChat(
        api_key=GEMINI_API_KEY,
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


class DailyIn(BaseModel):
    device_id: str
    force: bool = False


@api.post("/nova/daily")
async def nova_daily(payload: DailyIn):
    """Proactive Nova briefing for today — personalized, cached per day per device.

    Returns:
      {
        greeting: str,             # 1-line warm hello, references student
        thought: str,              # 2-3 sentence "Nova is thinking about you" note
        spark: str,                # a provocative curiosity question
        suggested_prompt: str,     # a chip the student can tap to talk to Nova
        mission_id: str | null,    # today's suggested mission id
        career_id: str | null,     # a career worth exploring today
        skill_id: str | null,      # a future-skill to nudge
        vibe: str                  # one of: curious, playful, focused, cozy, adventurous
      }
    """
    if not GEMINI_API_KEY:
        raise HTTPException(500, "GEMINI_API_KEY not configured")
    profile = await _get_or_create_profile(payload.device_id)
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    if not payload.force:
        cached = await db.daily_briefs.find_one(
            {"device_id": payload.device_id, "date": today}, {"_id": 0},
        )
        if cached:
            return cached.get("brief", {})

    name = profile.get("name") or "friend"
    interests = ", ".join(profile.get("interests", [])) or "still discovering"
    strengths = ", ".join(profile.get("strengths", [])) or "still discovering"
    style = profile.get("learning_style") or "curious"
    done = profile.get("completed_missions", [])
    streak = profile.get("streak", 0)

    system = f"""You are Nova, the growth companion of {name}, a student.
It is a new day. You've been thinking about them. Write a WARM, HUMAN, PROACTIVE daily briefing.
Their profile: interests={interests}; strengths={strengths}; style={style}; streak={streak} days; missions_done={len(done)}.
Never sound corporate. Never say 'as your AI'. Talk like a curious elder sibling with a beautiful mind.

Return ONLY minified JSON matching this schema — no markdown, no code fences, no extra prose:
{{
  "greeting": "<one warm short line, may address by name>",
  "thought": "<2-3 sentence proactive note — something you've been thinking about them, or a small observation>",
  "spark": "<a single provocative curiosity question, 8-16 words>",
  "suggested_prompt": "<one very short chip text (max 5 words) they can tap to reply to you>",
  "mission_id": "<one of: m_dream_app, m_ai_image, m_interview_grand, m_explain_ai, m_solve_problem, m_60s_video, m_save_50, m_teach_friend or null>",
  "career_id": "<one of: engineer, doctor, lawyer, teacher, creator, founder, designer, freelancer, ai_engineer, prompt_engineer, ai_researcher, musician, writer, game_designer, filmmaker or null>",
  "skill_id": "<one of: ai_literacy, financial_literacy, communication, coding, creativity or null>",
  "vibe": "<one of: curious, playful, focused, cozy, adventurous>"
}}
Pick mission/career/skill that align with their interests. Do NOT repeat something already in missions_done.
Be specific. Be surprising. Be kind."""

    chat = LlmChat(
        api_key=GEMINI_API_KEY,
        session_id=f"daily-{payload.device_id}-{today}",
        system_message=system,
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")

    try:
        raw = await chat.send_message(UserMessage(text=f"Today's date is {today}. Give me my briefing for {name}."))
    except Exception as e:
        logger.exception("Daily briefing failed")
        raise HTTPException(502, f"Daily briefing failed: {e}")

    parsed = _extract_json(raw) or {}
    if not parsed.get("greeting"):
        parsed = {
            "greeting": f"Hey {name}.",
            "thought": "I was thinking about you this morning. Ready to plant something new today?",
            "spark": "What is one small thing you're curious about right now?",
            "suggested_prompt": "Tell me more",
            "mission_id": None,
            "career_id": None,
            "skill_id": None,
            "vibe": "curious",
        }

    # persist
    await db.daily_briefs.update_one(
        {"device_id": payload.device_id, "date": today},
        {"$set": {"brief": parsed, "updated_at": _now_iso()}},
        upsert=True,
    )
    return parsed


@api.post("/nova/stt")
async def nova_stt(file: UploadFile = File(...), language: Optional[str] = Form(None)):
    if not GEMINI_API_KEY:
        raise HTTPException(500, "GEMINI_API_KEY not configured")
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
        stt = OpenAISpeechToText(api_key=GEMINI_API_KEY)
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
    if not GEMINI_API_KEY:
        raise HTTPException(500, "GEMINI_API_KEY not configured")
    try:
        tts = OpenAITextToSpeech(api_key=GEMINI_API_KEY)
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


@api.get("/traits")
async def list_traits():
    return {"items": TRAITS}


class NovaMemoryIn(BaseModel):
    device_id: str


@api.post("/nova/memory")
async def nova_memory(payload: NovaMemoryIn):
    """Summarize recent Nova conversations into 3-6 concise memory notes.

    These notes become part of Nova's system prompt so she references them
    naturally on future days — the core of emotional continuity.
    """
    if not GEMINI_API_KEY:
        raise HTTPException(500, "GEMINI_API_KEY not configured")
    profile = await _get_or_create_profile(payload.device_id)
    # Grab the most recent 40 messages across sessions
    docs = await db.nova_messages.find(
        {"device_id": payload.device_id},
        {"_id": 0, "role": 1, "content": 1, "created_at": 1},
    ).sort("created_at", -1).to_list(40)
    docs = list(reversed(docs))
    if not docs:
        return {"notes": profile.get("memory_notes", [])}

    transcript = "\n".join([f"{d.get('role','user').upper()}: {(d.get('content','') or '')[:400]}" for d in docs])
    prior = profile.get("memory_notes", []) or []
    prior_block = "\n".join([f"- {p}" for p in prior[-8:]]) if prior else "(none yet)"

    system = """You are Nova, keeping a private notebook about a young student you mentor.
Your job is to distill what you now know about them into 4-6 SHORT memory notes.
Each note should be 8-16 words, first-person from Nova's perspective ("They love...", "They said...", "They tend to...").
Focus on: what excites them, what they're afraid of, what they told you they want to try, patterns you noticed.
NEVER include boring meta ("they said hi", "we chatted about missions").
Return ONLY minified JSON: {"notes": ["...", "...", ...]}"""

    user_text = (
        f"Existing notes:\n{prior_block}\n\n"
        f"Recent conversation transcript:\n{transcript}\n\n"
        "Merge existing + new signal into 4-6 fresh notes."
    )

    chat = LlmChat(
        api_key=GEMINI_API_KEY,
        session_id=f"memory-{payload.device_id}-{uuid.uuid4().hex[:6]}",
        system_message=system,
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")
    try:
        raw = await chat.send_message(UserMessage(text=user_text))
    except Exception as e:
        logger.exception("Memory summarize failed")
        raise HTTPException(502, f"Memory summarize failed: {e}")
    parsed = _extract_json(raw) or {}
    notes = [str(n).strip() for n in (parsed.get("notes") or []) if str(n).strip()]
    if not notes:
        notes = prior
    else:
        notes = notes[:6]
    await db.profiles.update_one({"device_id": payload.device_id}, {"$set": {"memory_notes": notes}})
    return {"notes": notes}


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
    trait_deltas: Dict[str, int] = {}
    new_milestones: List[Dict[str, Any]] = []

    if not already:
        completed.append(mission_id)
        points_gained = int(mission.get("growth_points", 0))
        updates["completed_missions"] = completed
        updates["growth_points"] = int(profile.get("growth_points", 0)) + points_gained
        updates["streak"] = int(profile.get("streak", 0)) + 1

        # Trait impacts + milestone detection
        traits_prev: Dict[str, int] = dict(profile.get("trait_scores", {}) or {})
        traits_next = dict(traits_prev)
        impacts = mission.get("trait_impacts", {}) or {}
        THRESHOLDS = [20, 40, 60, 80, 100]
        trait_meta = {t["id"]: t for t in TRAITS}
        for trait_id, delta in impacts.items():
            before = int(traits_prev.get(trait_id, 0))
            after = min(100, before + int(delta))
            traits_next[trait_id] = after
            trait_deltas[trait_id] = after - before
            crossed = [th for th in THRESHOLDS if before < th <= after]
            for th in crossed:
                meta = trait_meta.get(trait_id, {})
                new_milestones.append({
                    "type": "trait_milestone",
                    "trait_id": trait_id,
                    "trait_name": meta.get("name", trait_id.title()),
                    "trait_emoji": meta.get("emoji", "✨"),
                    "level": th,
                    "achieved_at": _now_iso(),
                    "message": _milestone_message(meta.get("name", trait_id.title()), th),
                })
        updates["trait_scores"] = traits_next
        if new_milestones:
            all_ms = list(profile.get("milestones", []) or [])
            all_ms.extend(new_milestones)
            updates["milestones"] = all_ms

        await db.profiles.update_one({"device_id": payload.device_id}, {"$set": updates})
    doc = await db.profiles.find_one({"device_id": payload.device_id}, {"_id": 0})
    return {
        "mission": mission,
        "already_completed": already,
        "points_gained": points_gained,
        "trait_deltas": trait_deltas,
        "new_milestones": new_milestones,
        "profile": doc,
    }


def _milestone_message(trait_name: str, level: int) -> str:
    """Emotional milestone messages — not XP popups."""
    lc = trait_name.lower()
    if level == 25:
        return f"Your {lc} is finding its shape. This is where it starts to feel like yours."
    if level == 50:
        return f"You're halfway to fully owning your {lc}. People will start to notice."
    if level == 75:
        return f"Your {lc} is a signature now. It's how people describe you."
    if level == 100:
        return f"You've mastered your {lc}. Not perfect — the real kind: lived-in and yours."
    return f"Your {lc} grew today."


# --------------------- Routes: Discover ---------------------

@api.get("/discover/questions")
async def discover_questions():
    return {"items": DISCOVER_QUESTIONS}


@api.post("/discover/analyze")
async def discover_analyze(payload: DiscoverAnalyzeIn):
    if not GEMINI_API_KEY:
        raise HTTPException(500, "GEMINI_API_KEY not configured")
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
        api_key=GEMINI_API_KEY,
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

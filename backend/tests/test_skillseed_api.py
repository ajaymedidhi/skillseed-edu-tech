"""SkillSeed backend regression tests."""
import time
import uuid
import base64
import pytest


# ------------- Health -------------
def test_health(api_client, base_url):
    r = api_client.get(f"{base_url}/api/health", timeout=15)
    assert r.status_code == 200
    body = r.json()
    assert body.get("status") == "ok"
    assert body.get("service") == "skillseed"


# ------------- Profile -------------
class TestProfile:
    def test_profile_auto_create(self, api_client, base_url, device_id):
        r = api_client.get(f"{base_url}/api/profile", params={"device_id": device_id}, timeout=15)
        assert r.status_code == 200, r.text
        p = r.json()
        assert p["device_id"] == device_id
        assert p["name"] == ""
        assert p["growth_points"] == 0
        assert p["streak"] == 0
        assert p["onboarded"] is False

    def test_profile_patch(self, api_client, base_url, device_id):
        # ensure profile exists
        api_client.get(f"{base_url}/api/profile", params={"device_id": device_id}, timeout=15)
        r = api_client.patch(f"{base_url}/api/profile",
                             json={"device_id": device_id, "name": "Riya", "age": 13, "onboarded": True},
                             timeout=15)
        assert r.status_code == 200, r.text
        p = r.json()
        assert p["name"] == "Riya"
        assert p["age"] == 13
        assert p["onboarded"] is True
        # Verify persisted
        r2 = api_client.get(f"{base_url}/api/profile", params={"device_id": device_id}, timeout=15)
        assert r2.json()["name"] == "Riya"


# ------------- Careers -------------
class TestCareers:
    def test_list_all(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/careers", timeout=15)
        assert r.status_code == 200
        items = r.json()["items"]
        assert len(items) == 15
        for it in items:
            assert "id" in it and "name" in it and "category" in it

    def test_filter_ai(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/careers", params={"category": "ai"}, timeout=15)
        assert r.status_code == 200
        items = r.json()["items"]
        assert len(items) >= 1
        assert all(c["category"] == "ai" for c in items)

    def test_get_single(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/careers/ai_engineer", timeout=15)
        assert r.status_code == 200
        assert r.json()["id"] == "ai_engineer"


# ------------- Skills -------------
def test_skills_list(api_client, base_url):
    r = api_client.get(f"{base_url}/api/skills", timeout=15)
    assert r.status_code == 200
    items = r.json()["items"]
    assert len(items) == 5


# ------------- Missions -------------
class TestMissions:
    def test_missions_list(self, api_client, base_url, device_id):
        r = api_client.get(f"{base_url}/api/missions", params={"device_id": device_id}, timeout=15)
        assert r.status_code == 200
        items = r.json()["items"]
        assert len(items) == 8
        for m in items:
            assert isinstance(m.get("completed"), bool)

    def test_mission_complete_and_idempotent(self, api_client, base_url):
        did = f"TEST_{uuid.uuid4().hex[:12]}"
        # ensure profile created
        api_client.get(f"{base_url}/api/profile", params={"device_id": did}, timeout=15)
        r1 = api_client.post(f"{base_url}/api/missions/m_dream_app/complete",
                             json={"device_id": did}, timeout=15)
        assert r1.status_code == 200, r1.text
        b1 = r1.json()
        assert b1["already_completed"] is False
        assert b1["points_gained"] == 30
        assert b1["profile"]["growth_points"] == 30
        assert b1["profile"]["streak"] == 1

        r2 = api_client.post(f"{base_url}/api/missions/m_dream_app/complete",
                             json={"device_id": did}, timeout=15)
        assert r2.status_code == 200
        b2 = r2.json()
        assert b2["already_completed"] is True
        assert b2["points_gained"] == 0
        assert b2["profile"]["growth_points"] == 30
        assert b2["profile"]["streak"] == 1


# ------------- Discover -------------
class TestDiscover:
    def test_questions(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/discover/questions", timeout=15)
        assert r.status_code == 200
        items = r.json()["items"]
        assert len(items) == 4
        for q in items:
            assert q.get("id") and q.get("prompt") and isinstance(q.get("options"), list)

    def test_analyze(self, api_client, base_url):
        did = f"TEST_{uuid.uuid4().hex[:12]}"
        # ensure profile
        api_client.get(f"{base_url}/api/profile", params={"device_id": did}, timeout=15)
        payload = {
            "device_id": did,
            "answers": [
                {"q": "When you have free time, what pulls you in the most?",
                 "a": "Building or fixing things"},
                {"q": "What kind of problems light you up?",
                 "a": "Technical or logical puzzles"},
                {"q": "How do you learn best?",
                 "a": "By doing and building"},
            ],
        }
        r = api_client.post(f"{base_url}/api/discover/analyze", json=payload, timeout=90)
        assert r.status_code == 200, r.text
        j = r.json()
        for key in ["headline", "learning_style", "strengths", "interests", "summary",
                    "career_matches", "recommended_skills", "career_matches_data",
                    "recommended_skills_data"]:
            assert key in j, f"missing {key}"
        assert isinstance(j["strengths"], list) and len(j["strengths"]) >= 1
        assert isinstance(j["career_matches_data"], list) and len(j["career_matches_data"]) >= 1

        # Verify profile updated
        p = api_client.get(f"{base_url}/api/profile", params={"device_id": did}, timeout=15).json()
        assert p["onboarded"] is True
        assert p["learning_style"] == j["learning_style"]
        assert p["strengths"] == j["strengths"]
        assert p["interests"] == j["interests"]


# ------------- Nova Chat + TTS -------------
class TestNova:
    def test_chat_multi_turn(self, api_client, base_url):
        did = f"TEST_{uuid.uuid4().hex[:12]}"
        api_client.get(f"{base_url}/api/profile", params={"device_id": did}, timeout=15)
        sess = f"sess-{uuid.uuid4().hex[:8]}"
        r1 = api_client.post(f"{base_url}/api/nova/chat",
                             json={"device_id": did, "session_id": sess,
                                   "message": "Hi Nova! My name is Arjun and I love robots."},
                             timeout=60)
        assert r1.status_code == 200, r1.text
        b1 = r1.json()
        assert isinstance(b1.get("reply"), str) and len(b1["reply"]) > 0
        assert isinstance(b1.get("cards"), list)
        assert b1.get("session_id") == sess

        # 2nd turn - Nova should remember context
        r2 = api_client.post(f"{base_url}/api/nova/chat",
                             json={"device_id": did, "session_id": sess,
                                   "message": "What career could fit me based on what I just told you?"},
                             timeout=60)
        assert r2.status_code == 200, r2.text
        b2 = r2.json()
        assert len(b2["reply"]) > 0
        # Cards may exist
        for c in b2.get("cards", []):
            assert c.get("type") in ("career", "mission", "skill")
            assert "data" in c

    def test_tts(self, api_client, base_url):
        r = api_client.post(f"{base_url}/api/nova/tts",
                            json={"text": "Hello Nova", "voice": "nova"}, timeout=60)
        assert r.status_code == 200, r.text
        j = r.json()
        assert j.get("mime") == "audio/mpeg"
        b64 = j.get("audio_base64", "")
        assert len(b64) > 500
        # decode to ensure valid base64
        try:
            base64.b64decode(b64[:200] + "==")
        except Exception as e:
            pytest.fail(f"invalid base64: {e}")

    def test_stt_missing_file_returns_422(self, api_client, base_url):
        # No file uploaded - FastAPI should return 422
        r = api_client.post(f"{base_url}/api/nova/stt", timeout=15,
                            headers={"Content-Type": "application/json"})
        assert r.status_code in (400, 422), f"got {r.status_code} {r.text}"

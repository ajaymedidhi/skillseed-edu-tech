# SkillSeed — Product Requirements

## Vision
SkillSeed is an AI-powered growth companion for school students (Classes 6–10). It combines a voice-first AI mentor "Nova" (Claude Sonnet 4.5), career/future-skills discovery, and daily growth missions. Feels like a premium AI-native consumer app — not an edtech LMS.

Tagline: **Planting Skills. Growing Futures.**

## Tech Stack
- **Frontend:** React Native (Expo Router, TypeScript), react-native-reanimated, react-native-svg, expo-blur, expo-audio, expo-linear-gradient, react-native-keyboard-controller, lucide-react-native
- **Backend:** FastAPI + MongoDB (motor)
- **AI:** Claude Sonnet 4.5 (chat), OpenAI Whisper (STT), OpenAI TTS voice="nova" — all via `emergentintegrations` + Emergent Universal LLM Key

## Screens (Expo Router)
- `/` Splash → routes to onboarding or tabs
- `/onboarding` Nova voice intro + name/age
- `/(tabs)` Tabs: Home, Explore, Grow, Profile
- `/nova` Modal chat with voice + dynamic content cards
- `/discover` Conversational assessment
- `/growth-profile` Shareable result card
- `/career/[id]`, `/mission/[id]`, `/mission-complete` (modal)

## Backend Endpoints (`/api/*`)
- `GET /health`
- `GET /profile?device_id=` · `PATCH /profile`
- `POST /nova/chat` (Claude Sonnet 4.5 → JSON with `reply` + enriched `cards`)
- `POST /nova/stt` (multipart audio → Whisper transcript)
- `POST /nova/tts` (text → base64 mp3, voice="nova")
- `GET /nova/history`
- `GET /careers[?category=]` · `GET /careers/{id}`
- `GET /skills`
- `GET /missions?device_id=` · `POST /missions/{id}/complete`
- `GET /discover/questions` · `POST /discover/analyze`

## Data Model (MongoDB)
- `profiles` — one doc per device_id (name, age, interests, learning_style, strengths, growth_profile_summary, growth_points, streak, completed_missions, onboarded)
- `nova_messages` — chat history per (device_id, session_id)

## Design Tokens
- Emerald `#10B981` primary, Indigo `#6366F1` secondary, Sky Blue `#38BDF8` accent, Amber `#FBBF24` achievement
- Radius 20–28px, generous spacing, glassmorphism nav, gradient hero cards, spring animations

## Auth
None — local device profile only (UUID stored via `@/src/utils/storage`).

## Known limitations
- Voice recording/playback works on native devices (Expo Go / builds), not in web preview (no mic in headless browser).
- Confetti + Nova celebrating animation triggers on mission completion.

// SkillSeed API client. All calls go through EXPO_PUBLIC_BACKEND_URL/api/*.
const BASE = (process.env.EXPO_PUBLIC_BACKEND_URL || '').replace(/\/$/, '');

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${BASE}/api${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

export type Profile = {
  device_id: string;
  name: string;
  age: number | null;
  interests: string[];
  learning_style: string;
  strengths: string[];
  growth_profile_summary: string;
  growth_points: number;
  streak: number;
  completed_missions: string[];
  onboarded: boolean;
  created_at: string;
};

export type Career = {
  id: string; name: string; category: string; emoji: string;
  tagline: string; day_in_life: string; skills: string[]; starter_mission: string;
};

export type Skill = { id: string; name: string; emoji: string; description: string; milestones: string[] };

export type Mission = {
  id: string; title: string; emoji: string; difficulty: string;
  duration_min: number; growth_points: number; description: string; completed?: boolean;
};

export type NovaCard =
  | { type: 'career'; data: Career; reason: string }
  | { type: 'mission'; data: Mission; reason: string }
  | { type: 'skill'; data: Skill; reason: string };

export type NovaReply = { reply: string; cards: NovaCard[]; session_id: string };

export type NovaDailyBrief = {
  greeting: string;
  thought: string;
  spark: string;
  suggested_prompt: string;
  mission_id: string | null;
  career_id: string | null;
  skill_id: string | null;
  vibe: 'curious' | 'playful' | 'focused' | 'cozy' | 'adventurous';
};

export type GrowthProfileResult = {
  headline: string;
  learning_style: string;
  strengths: string[];
  interests: string[];
  summary: string;
  career_matches: string[];
  recommended_skills: string[];
  career_matches_data: Career[];
  recommended_skills_data: Skill[];
};

export const api = {
  getProfile: (device_id: string) =>
    request<Profile>(`/profile?device_id=${encodeURIComponent(device_id)}`),
  patchProfile: (payload: Partial<Profile> & { device_id: string }) =>
    request<Profile>(`/profile`, { method: 'PATCH', body: JSON.stringify(payload) }),

  novaChat: (payload: { device_id: string; session_id?: string; message: string }) =>
    request<NovaReply>(`/nova/chat`, { method: 'POST', body: JSON.stringify(payload) }),
  novaDaily: (device_id: string, force = false) =>
    request<NovaDailyBrief>(`/nova/daily`, { method: 'POST', body: JSON.stringify({ device_id, force }) }),
  novaTTS: (payload: { text: string; voice?: string; speed?: number }) =>
    request<{ audio_base64: string; mime: string }>(`/nova/tts`, {
      method: 'POST', body: JSON.stringify(payload),
    }),
  novaSTT: async (audioUri: string): Promise<{ text: string }> => {
    const form = new FormData();
    const filename = audioUri.split('/').pop() || 'audio.m4a';
    const match = /\.(\w+)$/.exec(filename);
    const ext = (match ? match[1] : 'm4a').toLowerCase();
    const mime = ext === 'wav' ? 'audio/wav' : ext === 'mp3' ? 'audio/mpeg' : 'audio/m4a';
    // @ts-ignore React Native FormData accepts { uri, name, type }
    form.append('file', { uri: audioUri, name: filename, type: mime });
    const res = await fetch(`${BASE}/api/nova/stt`, { method: 'POST', body: form as any });
    if (!res.ok) throw new Error(`STT HTTP ${res.status}: ${await res.text().catch(() => '')}`);
    return res.json();
  },

  listCareers: (category?: string) =>
    request<{ items: Career[] }>(`/careers${category ? `?category=${category}` : ''}`),
  getCareer: (id: string) => request<Career>(`/careers/${id}`),

  listSkills: () => request<{ items: Skill[] }>(`/skills`),

  listMissions: (device_id: string) =>
    request<{ items: Mission[] }>(`/missions?device_id=${encodeURIComponent(device_id)}`),
  getMission: (id: string, device_id: string) =>
    request<Mission>(`/missions/${id}?device_id=${encodeURIComponent(device_id)}`),
  completeMission: (id: string, device_id: string) =>
    request<{ mission: Mission; already_completed: boolean; points_gained: number; profile: Profile }>(
      `/missions/${id}/complete`, { method: 'POST', body: JSON.stringify({ device_id }) },
    ),

  discoverQuestions: () =>
    request<{ items: { id: string; prompt: string; options: string[] }[] }>(`/discover/questions`),
  discoverAnalyze: (payload: { device_id: string; answers: { q: string; a: string }[] }) =>
    request<GrowthProfileResult>(`/discover/analyze`, { method: 'POST', body: JSON.stringify(payload) }),
};

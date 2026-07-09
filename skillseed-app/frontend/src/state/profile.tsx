import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { storage } from '@/src/utils/storage';
import { api, Profile } from '@/src/api/client';

// Simple uuid v4 without extra deps (RFC4122)
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

type ProfileCtx = {
  profile: Profile | null;
  deviceId: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
  patch: (updates: Partial<Profile>) => Promise<void>;
};

const Ctx = createContext<ProfileCtx | null>(null);

const DEVICE_ID_KEY = 'skillseed.device_id';

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let id = await storage.getItem<string>(DEVICE_ID_KEY, '');
      if (!id) {
        id = uuidv4();
        await storage.setItem(DEVICE_ID_KEY, id);
      }
      setDeviceId(id);
      try {
        const p = await api.getProfile(id);
        setProfile(p);
      } catch (e) {
        console.warn('Failed to load profile', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const refresh = useCallback(async () => {
    if (!deviceId) return;
    try {
      const p = await api.getProfile(deviceId);
      setProfile(p);
    } catch (e) {
      console.warn('refresh failed', e);
    }
  }, [deviceId]);

  const patch = useCallback(async (updates: Partial<Profile>) => {
    if (!deviceId) return;
    try {
      const p = await api.patchProfile({ device_id: deviceId, ...updates });
      setProfile(p);
    } catch (e) {
      console.warn('patch failed', e);
    }
  }, [deviceId]);

  return (
    <Ctx.Provider value={{ profile, deviceId, loading, refresh, patch }}>
      {children}
    </Ctx.Provider>
  );
}

export function useProfile() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useProfile must be used inside ProfileProvider');
  return c;
}

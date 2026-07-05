// Voice interaction hook: record via expo-audio, transcribe via backend, play back TTS.
// Handles microphone permission with a graceful fallback + retry.

import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import {
  AudioModule,
  RecordingPresets,
  useAudioPlayer,
  useAudioRecorder,
  useAudioRecorderState,
  setAudioModeAsync,
} from 'expo-audio';
import { File, Directory, Paths } from 'expo-file-system';
import { api } from '@/src/api/client';

export type MicPermission = 'granted' | 'denied' | 'undetermined';

// A tiny 0.05s silent MP3 keeps the native player initialized cleanly
// without spamming errors when we haven't loaded a real source yet.
const SILENT_MP3_URI =
  'data:audio/mpeg;base64,SUQzAwAAAAAAJlRTU0UAAAAJAAABTGF2ZjU4LjEyLjEwMAAAA' +
  'AAAAAAAAAAAAP/7kGQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/////////////////////////';

export function useNovaVoice() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const [permission, setPermission] = useState<MicPermission>('undetermined');
  const [transcribing, setTranscribing] = useState(false);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  // Persistent player, initialized with a harmless silent source.
  // We swap the real source imperatively via player.replace().
  const player = useAudioPlayer({ uri: SILENT_MP3_URI });
  const pendingPlayRef = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const status = await AudioModule.getRecordingPermissionsAsync();
        setPermission(status.granted ? 'granted' : (status.canAskAgain ? 'undetermined' : 'denied'));
      } catch {
        setPermission('undetermined');
      }
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });
      } catch {}
    })();
  }, []);

  // Playback status listener: play as soon as the new source finishes loading,
  // and update `speaking` when playback finishes.
  useEffect(() => {
    if (!player) return;
    const sub = player.addListener?.('playbackStatusUpdate', (s: any) => {
      if (pendingPlayRef.current && s?.isLoaded && !s?.playing) {
        pendingPlayRef.current = false;
        try {
          player.seekTo?.(0);
          player.play?.();
        } catch (e) {
          console.warn('deferred play failed', e);
          setSpeaking(false);
        }
      }
      if (s?.didJustFinish) {
        setSpeaking(false);
      }
    });
    return () => sub?.remove?.();
  }, [player]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const res = await AudioModule.requestRecordingPermissionsAsync();
      const granted = !!res.granted;
      setPermission(granted ? 'granted' : (res.canAskAgain ? 'undetermined' : 'denied'));
      return granted;
    } catch {
      setPermission('denied');
      return false;
    }
  }, []);

  const startRecording = useCallback(async (): Promise<boolean> => {
    if (permission !== 'granted') {
      const ok = await requestPermission();
      if (!ok) return false;
    }
    try {
      await recorder.prepareToRecordAsync();
      recorder.record();
      return true;
    } catch (e) {
      console.warn('startRecording failed', e);
      return false;
    }
  }, [permission, recorder, requestPermission]);

  const stopAndTranscribe = useCallback(async (): Promise<string | null> => {
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) return null;
      setTranscribing(true);
      const { text } = await api.novaSTT(uri);
      try {
        const rec = new File(uri);
        if (rec.exists) rec.delete();
      } catch {}
      return text || null;
    } catch (e) {
      console.warn('stopAndTranscribe failed', e);
      return null;
    } finally {
      setTranscribing(false);
    }
  }, [recorder]);

  const cancelRecording = useCallback(async () => {
    try {
      if (recorderState.isRecording) await recorder.stop();
    } catch {}
  }, [recorder, recorderState.isRecording]);

  const speak = useCallback(async (text: string) => {
    if (!text?.trim() || !player) return;
    setTtsLoading(true);
    try {
      // Stop any in-flight playback first
      try { player.pause?.(); } catch {}

      const { audio_base64 } = await api.novaTTS({ text, voice: 'nova' });

      // Build a playable source for the current platform.
      let source: { uri: string };
      if (Platform.OS === 'web') {
        source = { uri: `data:audio/mpeg;base64,${audio_base64}` };
      } else {
        const dir = new Directory(Paths.cache, 'nova');
        if (!dir.exists) dir.create({ intermediates: true });
        const file = new File(dir, `tts_${Date.now()}.mp3`);
        file.write(audio_base64, { encoding: 'base64' });
        source = { uri: file.uri };
      }

      // Imperatively swap the source. `play()` will be triggered inside the
      // playbackStatusUpdate listener as soon as `isLoaded` becomes true —
      // this avoids the "played before loaded" silence bug on native.
      pendingPlayRef.current = true;
      setSpeaking(true);
      try {
        player.replace(source);
      } catch (e) {
        console.warn('player.replace failed', e);
        pendingPlayRef.current = false;
        setSpeaking(false);
      }

      // Safety fallback: if the listener didn't fire within 800ms, try playing anyway.
      setTimeout(() => {
        if (pendingPlayRef.current) {
          pendingPlayRef.current = false;
          try {
            player.seekTo?.(0);
            player.play?.();
          } catch (e) {
            console.warn('fallback play failed', e);
            setSpeaking(false);
          }
        }
      }, 800);
    } catch (e) {
      console.warn('speak failed', e);
      setSpeaking(false);
    } finally {
      setTtsLoading(false);
    }
  }, [player]);

  const stopSpeaking = useCallback(() => {
    try { player?.pause?.(); } catch {}
    pendingPlayRef.current = false;
    setSpeaking(false);
  }, [player]);

  return {
    permission,
    requestPermission,
    isRecording: !!recorderState.isRecording,
    startRecording,
    stopAndTranscribe,
    cancelRecording,
    transcribing,
    speak,
    stopSpeaking,
    speaking,
    ttsLoading,
  };
}

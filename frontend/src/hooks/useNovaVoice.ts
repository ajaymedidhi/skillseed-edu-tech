// Voice interaction hook: record via expo-audio, transcribe via backend, and play back TTS.
// Handles microphone permission with a graceful fallback + retry.

import { useCallback, useEffect, useState } from 'react';
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

export function useNovaVoice() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const [permission, setPermission] = useState<MicPermission>('undetermined');
  const [transcribing, setTranscribing] = useState(false);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  // Persistent audio player used for TTS playback
  const [playerUri, setPlayerUri] = useState<string | null>(null);
  const player = useAudioPlayer(playerUri ? { uri: playerUri } : null);

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

  useEffect(() => {
    if (!player) return;
    const sub = player.addListener?.('playbackStatusUpdate', (s: any) => {
      if (s?.didJustFinish) setSpeaking(false);
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
    if (!text?.trim()) return;
    setTtsLoading(true);
    try {
      const { audio_base64 } = await api.novaTTS({ text, voice: 'nova' });
      // Write base64 to a temp file so expo-audio can play it via file URI (native).
      // On web, fall back to a data URI since File API isn't available.
      let uri: string;
      try {
        const dir = new Directory(Paths.cache, 'nova');
        if (!dir.exists) dir.create({ intermediates: true });
        const file = new File(dir, `tts_${Date.now()}.mp3`);
        file.write(audio_base64, { encoding: 'base64' });
        uri = file.uri;
      } catch {
        uri = `data:audio/mpeg;base64,${audio_base64}`;
      }
      setPlayerUri(uri);
      setSpeaking(true);
      // Give the player a tick to load the new source, then play
      setTimeout(() => {
        try {
          player?.seekTo?.(0);
          player?.play?.();
        } catch {}
      }, 80);
    } catch (e) {
      console.warn('speak failed', e);
      setSpeaking(false);
    } finally {
      setTtsLoading(false);
    }
  }, [player]);

  const stopSpeaking = useCallback(() => {
    try { player?.pause?.(); } catch {}
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

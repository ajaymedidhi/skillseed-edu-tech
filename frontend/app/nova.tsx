// Nova voice + chat screen — the AI centerpiece.
// Big orb top, dynamic content cards inline, big mic FAB at bottom, keyboard-aware text input as fallback.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView, TextInput,
  Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Mic, MicOff, X, Send, ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import NovaOrb, { NovaState } from '@/src/components/NovaOrb';
import { useTheme } from '@/src/theme/ThemeContext';
import { useProfile } from '@/src/state/profile';
import { useNovaVoice } from '@/src/hooks/useNovaVoice';
import { api, NovaCard, NovaReply } from '@/src/api/client';

type Message = {
  id: string; role: 'user' | 'assistant'; text: string; cards?: NovaCard[];
};

export default function NovaScreen() {
  const { colors, spacing, radius, type } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ prefill?: string }>();
  const { deviceId } = useProfile();
  const voice = useNovaVoice();
  const scrollRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);

  const novaState: NovaState = useMemo(() => {
    if (voice.isRecording) return 'listening';
    if (voice.transcribing || sending || voice.ttsLoading) return 'thinking';
    if (voice.speaking) return 'speaking';
    return 'idle';
  }, [voice.isRecording, voice.transcribing, sending, voice.ttsLoading, voice.speaking]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || !deviceId) return;
    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);
    try {
      const res: NovaReply = await api.novaChat({
        device_id: deviceId, message: text.trim(), session_id: sessionId,
      });
      setSessionId(res.session_id);
      const asstMsg: Message = { id: `a-${Date.now()}`, role: 'assistant', text: res.reply, cards: res.cards };
      setMessages((prev) => [...prev, asstMsg]);
      voice.speak(res.reply);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { id: `err-${Date.now()}`, role: 'assistant', text: "Sorry — I couldn't reach my brain. Try once more?" },
      ]);
    } finally {
      setSending(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }, [deviceId, sessionId, voice]);

  // Prefill message from home chips
  useEffect(() => {
    if (params.prefill && messages.length === 0) {
      send(String(params.prefill));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onMicPress = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (voice.isRecording) {
      const text = await voice.stopAndTranscribe();
      if (text) send(text);
    } else {
      voice.stopSpeaking();
      const ok = await voice.startRecording();
      if (!ok && voice.permission === 'denied') {
        // Ask user to open settings
        // We just show a message in the chat
        setMessages((prev) => [
          ...prev,
          {
            id: `perm-${Date.now()}`,
            role: 'assistant',
            text: "I need microphone access to hear you. Tap here to open Settings and enable it.",
          },
        ]);
      }
    }
  }, [voice, send]);

  return (
    <SafeAreaView style={[styles.wrap, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior="padding"
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={[styles.header, { paddingHorizontal: spacing.lg }]}>
          <Text style={[type.h3, { color: colors.textPrimary }]}>Nova</Text>
          <Pressable
            testID="nova-close-btn"
            onPress={() => { voice.stopSpeaking(); voice.cancelRecording(); router.back(); }}
            hitSlop={12}
          >
            <X color={colors.textPrimary} size={24} strokeWidth={2.2} />
          </Pressable>
        </View>

        {/* Orb */}
        <View style={styles.orbWrap}>
          <NovaOrb size={180} state={novaState} />
          <Text style={[type.small, { color: colors.textSecondary, marginTop: 6, letterSpacing: 1 }]}>
            {novaState === 'listening' && 'LISTENING…'}
            {novaState === 'thinking' && 'THINKING…'}
            {novaState === 'speaking' && 'SPEAKING…'}
            {novaState === 'idle' && 'TAP MIC OR TYPE'}
          </Text>
        </View>

        {/* Message list */}
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.lg,
            gap: 12,
          }}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 && (
            <Animated.View entering={FadeIn.duration(500)} style={{ alignItems: 'center', paddingVertical: 20 }}>
              <Text style={[type.body, { color: colors.textSecondary, textAlign: 'center' }]}>
                Ask me anything. About you, careers, life, curiosity.
              </Text>
            </Animated.View>
          )}
          {messages.map((m, i) => (
            <Animated.View key={m.id} entering={FadeInUp.duration(300)}>
              {m.role === 'user' ? (
                <View style={{ alignItems: 'flex-end' }}>
                  <View style={[styles.userBubble, { backgroundColor: colors.primary, borderRadius: radius.md }]}>
                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: '500' }}>{m.text}</Text>
                  </View>
                </View>
              ) : (
                <View>
                  <View style={[styles.novaBubble, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md }]}>
                    <Text style={[type.body, { color: colors.textPrimary }]}>{m.text}</Text>
                  </View>
                  {m.cards && m.cards.length > 0 && (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ gap: 10, paddingVertical: 12, paddingRight: 20 }}
                      style={{ marginTop: 4 }}
                    >
                      {m.cards.map((c, idx) => (
                        <NovaCardView key={`${m.id}-${idx}`} card={c} />
                      ))}
                    </ScrollView>
                  )}
                </View>
              )}
            </Animated.View>
          ))}
          {sending && (
            <View style={{ alignItems: 'center', paddingVertical: 8 }}>
              <ActivityIndicator color={colors.primary} />
            </View>
          )}
        </ScrollView>

        {/* Input row: text input + mic FAB */}
        <View style={[styles.inputRow, { paddingHorizontal: spacing.lg, paddingBottom: 8, gap: 10 }]}>
          <TextInput
            testID="nova-text-input"
            value={input}
            onChangeText={setInput}
            placeholder="Type to Nova…"
            placeholderTextColor={colors.textTertiary}
            style={[
              styles.textInput,
              { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary, borderRadius: radius.full },
            ]}
            returnKeyType="send"
            onSubmitEditing={() => send(input)}
            editable={!sending && !voice.isRecording}
          />
          {input.trim().length > 0 ? (
            <Pressable
              testID="nova-send-btn"
              onPress={() => send(input)}
              style={({ pressed }) => [
                styles.mic,
                { backgroundColor: colors.primary, transform: [{ scale: pressed ? 0.95 : 1 }] },
              ]}
            >
              <Send color="#fff" size={22} strokeWidth={2.4} />
            </Pressable>
          ) : (
            <Pressable
              testID="nova-mic-btn"
              onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})}
              onPress={onMicPress}
              style={({ pressed }) => [
                styles.mic,
                {
                  backgroundColor: voice.isRecording ? '#EF4444' : colors.primary,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                  shadowColor: voice.isRecording ? '#EF4444' : colors.primary,
                },
              ]}
            >
              {voice.isRecording ? (
                <MicOff color="#fff" size={22} strokeWidth={2.4} />
              ) : (
                <Mic color="#fff" size={22} strokeWidth={2.4} />
              )}
            </Pressable>
          )}
        </View>

        {voice.permission === 'denied' && (
          <Pressable
            testID="nova-open-settings-btn"
            onPress={() => Linking.openSettings()}
            style={{ paddingHorizontal: spacing.lg, paddingBottom: 8 }}
          >
            <Text style={[type.small, { color: colors.primary, textAlign: 'center' }]}>
              Enable microphone in Settings →
            </Text>
          </Pressable>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function NovaCardView({ card }: { card: NovaCard }) {
  const { colors, radius, type } = useTheme();
  const router = useRouter();
  const bg = card.type === 'career' ? colors.secondarySoft : card.type === 'mission' ? colors.primarySoft : colors.surface;
  const accent = card.type === 'career' ? colors.secondary : card.type === 'mission' ? colors.primary : colors.accent;
  const label = card.type === 'career' ? 'CAREER' : card.type === 'mission' ? 'MISSION' : 'SKILL';
  const title = (card as any).data?.name || (card as any).data?.title || '';
  const emoji = (card as any).data?.emoji || '✨';
  const onPress = () => {
    if (card.type === 'career') router.push(`/career/${card.data.id}`);
    else if (card.type === 'mission') router.push(`/mission/${card.data.id}`);
    else router.push('/(tabs)/explore');
  };
  return (
    <Pressable
      testID={`nova-card-${card.type}-${(card as any).data?.id}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.novaCard,
        { backgroundColor: bg, borderRadius: radius.lg, borderColor: colors.border, transform: [{ scale: pressed ? 0.98 : 1 }] },
      ]}
    >
      <Text style={{ fontSize: 34 }}>{emoji}</Text>
      <Text style={[type.caption, { color: accent, marginTop: 8 }]}>{label}</Text>
      <Text style={[type.h3, { color: colors.textPrimary, marginTop: 4 }]} numberOfLines={2}>
        {title}
      </Text>
      {card.reason ? (
        <Text style={[type.small, { color: colors.textSecondary, marginTop: 6 }]} numberOfLines={3}>
          {card.reason}
        </Text>
      ) : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}>
        <Text style={[type.small, { color: accent, fontWeight: '700' }]}>Open</Text>
        <ArrowRight color={accent} size={14} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  header: {
    height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  orbWrap: { alignItems: 'center', paddingVertical: 10 },
  userBubble: { paddingHorizontal: 16, paddingVertical: 12, maxWidth: '82%' },
  novaBubble: { borderWidth: 1, paddingHorizontal: 16, paddingVertical: 12, maxWidth: '92%' },
  novaCard: { width: 220, padding: 16, borderWidth: 1 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  textInput: {
    flex: 1, borderWidth: 1, paddingHorizontal: 20, paddingVertical: 14, fontSize: 15,
  },
  mic: {
    width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
});

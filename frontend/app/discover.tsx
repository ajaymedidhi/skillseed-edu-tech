// Discover — conversational assessment. One question at a time, animated transitions.
// Nova speaks each question, user picks an option (or types a custom answer), then Nova analyzes.

import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { X, ArrowRight, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import NovaOrb, { NovaState } from '@/src/components/NovaOrb';
import { useTheme } from '@/src/theme/ThemeContext';
import { useProfile } from '@/src/state/profile';
import { useNovaVoice } from '@/src/hooks/useNovaVoice';
import { api } from '@/src/api/client';

type Question = { id: string; prompt: string; options: string[] };

export default function Discover() {
  const { colors, spacing, radius, type } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { deviceId, refresh } = useProfile();
  const voice = useNovaVoice();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<{ q: string; a: string }[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [novaState, setNovaState] = useState<NovaState>('idle');

  useEffect(() => {
    api.discoverQuestions().then((r) => setQuestions(r.items)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!questions.length) return;
    const q = questions[idx];
    if (!q) return;
    setNovaState('speaking');
    voice.speak(q.prompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, questions.length]);

  useEffect(() => {
    if (voice.speaking) setNovaState('speaking');
    else if (analyzing || voice.ttsLoading) setNovaState('thinking');
    else setNovaState('idle');
  }, [voice.speaking, voice.ttsLoading, analyzing]);

  const q = questions[idx];

  const next = async () => {
    if (!selected || !q) return;
    Haptics.selectionAsync().catch(() => {});
    const newAnswers = [...answers, { q: q.prompt, a: selected }];
    setAnswers(newAnswers);
    setSelected(null);
    if (idx + 1 < questions.length) {
      setIdx(idx + 1);
    } else {
      // analyze
      if (!deviceId) return;
      setAnalyzing(true);
      voice.stopSpeaking();
      try {
        await api.discoverAnalyze({ device_id: deviceId, answers: newAnswers });
        await refresh();
        router.replace('/growth-profile');
      } catch (e) {
        setAnalyzing(false);
      }
    }
  };

  if (!questions.length) {
    return (
      <SafeAreaView style={[styles.wrap, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  if (analyzing) {
    return (
      <SafeAreaView style={[styles.wrap, { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }]}>
        <NovaOrb size={180} state="thinking" />
        <Text style={[type.h2, { color: colors.textPrimary, marginTop: 24, textAlign: 'center', paddingHorizontal: 40 }]}>
          Reading between the lines…
        </Text>
        <Text style={[type.body, { color: colors.textSecondary, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 }]}>
          Nova is crafting your Growth Profile.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.wrap, { backgroundColor: colors.background }]} edges={['top', 'bottom']} testID="discover-screen">
      <View style={[styles.header, { paddingHorizontal: spacing.lg }]}>
        <Pressable
          testID="discover-close-btn"
          onPress={() => { voice.stopSpeaking(); router.back(); }}
          hitSlop={12}
        >
          <X color={colors.textPrimary} size={24} strokeWidth={2.2} />
        </Pressable>
        <Text style={[type.small, { color: colors.textSecondary, fontWeight: '700' }]}>
          {idx + 1} / {questions.length}
        </Text>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: colors.primary, width: `${((idx + 1) / questions.length) * 100}%` },
          ]}
        />
      </View>

      <View style={styles.orbWrap}>
        <NovaOrb size={140} state={novaState} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <Animated.Text
          key={`q-${idx}`}
          entering={FadeInDown.duration(500)}
          exiting={FadeOut.duration(200)}
          style={[type.h2, { color: colors.textPrimary, textAlign: 'left' }]}
        >
          {q.prompt}
        </Animated.Text>

        <View style={{ marginTop: spacing.lg, gap: 10 }}>
          {q.options.map((opt, i) => {
            const active = selected === opt;
            return (
              <Animated.View key={opt} entering={FadeInDown.delay(150 + i * 60).duration(400)}>
                <Pressable
                  testID={`discover-option-${i}`}
                  onPress={() => { Haptics.selectionAsync().catch(() => {}); setSelected(opt); }}
                  style={({ pressed }) => [
                    styles.option,
                    {
                      backgroundColor: active ? colors.primarySoft : colors.surface,
                      borderColor: active ? colors.primary : colors.border,
                      borderRadius: radius.md,
                      transform: [{ scale: pressed ? 0.99 : 1 }],
                    },
                  ]}
                >
                  <Text style={[type.bodyLg, { color: colors.textPrimary, flex: 1 }]}>{opt}</Text>
                  {active && (
                    <View style={[styles.checkDot, { backgroundColor: colors.primary }]}>
                      <Check color="#fff" size={14} strokeWidth={3} />
                    </View>
                  )}
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: 12 }}>
        <Pressable
          testID="discover-next-btn"
          onPress={next}
          disabled={!selected}
          style={({ pressed }) => [
            styles.nextBtn,
            {
              backgroundColor: colors.primary,
              borderRadius: radius.lg,
              opacity: !selected ? 0.4 : pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
        >
          <Text style={styles.nextBtnText}>
            {idx + 1 === questions.length ? 'Finish' : 'Next'}
          </Text>
          <ArrowRight color="#fff" size={20} strokeWidth={2.5} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  header: { height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressBg: { height: 4, width: '100%' },
  progressFill: { height: 4 },
  orbWrap: { alignItems: 'center', paddingVertical: 20 },
  option: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, paddingHorizontal: 18, paddingVertical: 16, gap: 12,
  },
  checkDot: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  nextBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 18,
  },
  nextBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});

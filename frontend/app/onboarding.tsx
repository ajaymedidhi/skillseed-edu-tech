// Onboarding: Nova introduces herself with voice + a light 2-question flow.
// User picks a name and confirms — then off to Discover (or Home).

import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, TextInput, ScrollView, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import NovaOrb, { NovaState } from '@/src/components/NovaOrb';
import { useTheme } from '@/src/theme/ThemeContext';
import { useProfile } from '@/src/state/profile';
import { useNovaVoice } from '@/src/hooks/useNovaVoice';

const STEPS = [
  { key: 'welcome', novaLine: "Hi. I'm Nova. I'm going to be your growth companion. What should I call you?" },
  { key: 'age', novaLine: "Nice to meet you. Quick one — how old are you? Just so I know how to hang out with you." },
  { key: 'ready', novaLine: "Perfect. Ready for a tiny discovery chat? It's not a test — just me getting to know you." },
] as const;

export default function Onboarding() {
  const { colors, spacing, radius, type } = useTheme();
  const router = useRouter();
  const { patch, deviceId } = useProfile();
  const voice = useNovaVoice();

  const [stepIdx, setStepIdx] = useState(0);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [novaState, setNovaState] = useState<NovaState>('idle');

  const step = STEPS[stepIdx];

  useEffect(() => {
    // Speak Nova's line for each step. Non-blocking.
    setNovaState('speaking');
    voice.speak(step.novaLine).finally(() => {
      // orb returns to idle after speaking; useNovaVoice.speaking flag handles it
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIdx]);

  useEffect(() => {
    if (voice.speaking) setNovaState('speaking');
    else if (voice.ttsLoading) setNovaState('thinking');
    else setNovaState('idle');
  }, [voice.speaking, voice.ttsLoading]);

  const goNext = async () => {
    Haptics.selectionAsync().catch(() => {});
    if (step.key === 'welcome') {
      if (!name.trim()) return;
      setStepIdx(1);
    } else if (step.key === 'age') {
      setStepIdx(2);
    } else {
      // ready — save profile then head to Discover
      voice.stopSpeaking();
      await patch({ name: name.trim(), age: age ? Number(age) : null });
      router.replace('/discover');
    }
  };

  const skipToHome = async () => {
    voice.stopSpeaking();
    await patch({ name: name.trim() || 'friend', age: age ? Number(age) : null, onboarded: true });
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={[styles.wrap, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeIn.duration(500)} style={styles.orbWrap}>
          <NovaOrb size={200} state={novaState} />
        </Animated.View>

        <Animated.Text
          key={`line-${stepIdx}`}
          entering={FadeInDown.duration(500)}
          style={[type.h2, { color: colors.textPrimary, textAlign: 'center', marginTop: spacing.lg }]}
        >
          {step.novaLine}
        </Animated.Text>

        <View style={{ marginTop: spacing.xl, gap: spacing.md }}>
          {step.key === 'welcome' && (
            <TextInput
              testID="onboarding-name-input"
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={colors.textTertiary}
              autoFocus
              returnKeyType="next"
              onSubmitEditing={goNext}
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                  borderRadius: radius.md,
                },
              ]}
            />
          )}
          {step.key === 'age' && (
            <TextInput
              testID="onboarding-age-input"
              value={age}
              onChangeText={(v) => setAge(v.replace(/[^0-9]/g, '').slice(0, 2))}
              placeholder="Your age (optional)"
              placeholderTextColor={colors.textTertiary}
              keyboardType="number-pad"
              returnKeyType="done"
              onSubmitEditing={goNext}
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                  borderRadius: radius.md,
                },
              ]}
            />
          )}
          {step.key === 'ready' && (
            <Text style={[type.body, { color: colors.textSecondary, textAlign: 'center' }]}>
              Takes about 60 seconds. I promise.
            </Text>
          )}

          <Pressable
            testID="onboarding-next-btn"
            onPress={goNext}
            disabled={step.key === 'welcome' && !name.trim()}
            style={({ pressed }) => [
              styles.primaryBtn,
              {
                backgroundColor: colors.primary,
                borderRadius: radius.lg,
                opacity: (step.key === 'welcome' && !name.trim()) ? 0.5 : pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            {voice.ttsLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>
                {step.key === 'ready' ? "Let's go" : 'Continue'}
              </Text>
            )}
          </Pressable>

          {step.key === 'ready' && (
            <Pressable
              testID="onboarding-skip-btn"
              onPress={skipToHome}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, alignItems: 'center', paddingVertical: 12 })}
            >
              <Text style={[type.small, { color: colors.textSecondary }]}>Maybe later — take me home</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  orbWrap: { alignItems: 'center', marginTop: 24 },
  input: {
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 18,
    fontWeight: '500',
  },
  primaryBtn: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});

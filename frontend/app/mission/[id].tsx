// Mission detail + complete flow.

import { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, Check, Sparkles, Clock, Zap } from 'lucide-react-native';

import { useTheme } from '@/src/theme/ThemeContext';
import { useProfile } from '@/src/state/profile';
import { api, Mission } from '@/src/api/client';

export default function MissionDetail() {
  const { colors, spacing, radius, type } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { deviceId, refresh } = useProfile();
  const [mission, setMission] = useState<Mission | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id || !deviceId) return;
    api.getMission(String(id), deviceId).then(setMission).catch(() => {});
  }, [id, deviceId]);

  const complete = useCallback(async () => {
    if (!mission || !deviceId) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setBusy(true);
    try {
      const r = await api.completeMission(mission.id, deviceId);
      await refresh();
      router.replace({
        pathname: '/mission-complete',
        params: {
          missionId: mission.id,
          points: String(r.points_gained),
          title: mission.title,
          emoji: mission.emoji,
        },
      });
    } finally {
      setBusy(false);
    }
  }, [mission, deviceId, refresh, router]);

  if (!mission) {
    return (
      <SafeAreaView style={[styles.wrap, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.wrap, { backgroundColor: colors.background }]} edges={['top', 'bottom']} testID="mission-detail">
      <View style={[styles.header, { paddingHorizontal: spacing.lg }]}>
        <Pressable testID="mission-back-btn" onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft color={colors.textPrimary} size={24} strokeWidth={2.2} />
        </Pressable>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 120 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(500)} style={{ alignItems: 'flex-start', gap: 12 }}>
          <View style={styles.emojiHero}>
            <Text style={{ fontSize: 80 }}>{mission.emoji}</Text>
          </View>
          <Text style={[type.caption, { color: colors.textSecondary }]}>DAILY MISSION</Text>
          <Text style={[type.h1, { color: colors.textPrimary }]}>{mission.title}</Text>
          <Text style={[type.bodyLg, { color: colors.textSecondary }]}>{mission.description}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.metaRow}>
          <View style={[styles.metaChip, { backgroundColor: colors.primarySoft }]}>
            <Sparkles color={colors.primary} size={14} strokeWidth={2.4} />
            <Text style={[styles.metaText, { color: colors.primary }]}>+{mission.growth_points} pts</Text>
          </View>
          <View style={[styles.metaChip, { backgroundColor: colors.secondarySoft }]}>
            <Clock color={colors.secondary} size={14} strokeWidth={2.4} />
            <Text style={[styles.metaText, { color: colors.secondary }]}>{mission.duration_min} min</Text>
          </View>
          <View style={[styles.metaChip, { backgroundColor: colors.surfaceMuted }]}>
            <Zap color={colors.textSecondary} size={14} strokeWidth={2.4} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{mission.difficulty}</Text>
          </View>
        </Animated.View>

        {mission.completed && (
          <Animated.View entering={FadeInDown.delay(300).duration(500)} style={[styles.doneCard, { backgroundColor: colors.primarySoft, borderRadius: radius.md }]}>
            <View style={[styles.checkDot, { backgroundColor: colors.primary }]}>
              <Check color="#fff" size={16} strokeWidth={3} />
            </View>
            <Text style={[type.bodyLg, { color: colors.primary, fontWeight: '700' }]}>Completed. Nice one.</Text>
          </Animated.View>
        )}
      </ScrollView>

      {!mission.completed && (
        <View style={{ padding: spacing.lg }}>
          <Pressable
            testID="mission-complete-btn"
            onPress={complete}
            disabled={busy}
            style={({ pressed }) => [
              styles.primaryBtn,
              {
                backgroundColor: colors.primary,
                borderRadius: radius.lg,
                opacity: busy ? 0.7 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>Mark complete</Text>
            )}
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  header: { height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  emojiHero: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center' },
  metaRow: { flexDirection: 'row', gap: 8, marginTop: 20, flexWrap: 'wrap' },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  metaText: { fontSize: 13, fontWeight: '700' },
  doneCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, marginTop: 24 },
  checkDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  primaryBtn: { paddingVertical: 18, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});

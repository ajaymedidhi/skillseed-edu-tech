// Grow — personal evolution, not points.
// Hero: growing plant metaphor + Nova's evolving observations about the student.
// Then: today's mission first, then rest of the missions timeline.

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import Svg, { Path, Defs, LinearGradient as SvgLG, Stop, Circle } from 'react-native-svg';
import { Check, Flame, Sparkles, TrendingUp } from 'lucide-react-native';

import { useTheme } from '@/src/theme/ThemeContext';
import { useProfile } from '@/src/state/profile';
import { api, Mission, NovaDailyBrief } from '@/src/api/client';

function GrowingPlant({ level, size = 200, color }: { level: number; size?: number; color: string }) {
  const clamped = Math.max(0, Math.min(6, level));
  const heights = [20, 50, 85, 120, 150, 180, 210];
  const stemH = heights[clamped];
  const cx = size / 2;
  return (
    <Svg width={size} height={size + 40}>
      <Defs>
        <SvgLG id="stem" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="1" />
          <Stop offset="1" stopColor={color} stopOpacity="0.4" />
        </SvgLG>
      </Defs>
      {/* soil */}
      <Path
        d={`M${cx - 60},${size + 10} Q${cx},${size + 40} ${cx + 60},${size + 10} L${cx + 55},${size + 20} Q${cx},${size + 32} ${cx - 55},${size + 20} Z`}
        fill="#3F2E1E"
      />
      {/* stem */}
      <Path
        d={`M${cx},${size + 10} L${cx},${size + 10 - stemH}`}
        stroke="url(#stem)"
        strokeWidth={6}
        strokeLinecap="round"
      />
      {/* seed / sprout for level 0 */}
      {clamped === 0 && <Circle cx={cx} cy={size + 6} r={7} fill="#8B5E3C" />}
      {clamped >= 2 && <Circle cx={cx - 20} cy={size + 10 - stemH * 0.55} r={14} fill={color} opacity={0.85} />}
      {clamped >= 3 && <Circle cx={cx + 22} cy={size + 10 - stemH * 0.7} r={16} fill={color} opacity={0.85} />}
      {clamped >= 4 && <Circle cx={cx - 24} cy={size + 10 - stemH * 0.82} r={18} fill={color} opacity={0.9} />}
      {clamped >= 5 && <Circle cx={cx + 26} cy={size + 10 - stemH * 0.92} r={20} fill={color} opacity={0.95} />}
      {clamped >= 1 && (
        <Circle cx={cx} cy={size + 10 - stemH} r={clamped >= 5 ? 22 : 12} fill="#FBBF24" opacity={0.95} />
      )}
    </Svg>
  );
}

const STAGES = ['Seed', 'Sprout', 'Seedling', 'Sapling', 'Young tree', 'Blooming', 'Flourishing'];

export default function Grow() {
  const { colors, spacing, radius, type } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, deviceId, refresh } = useProfile();

  const [missions, setMissions] = useState<Mission[]>([]);
  const [brief, setBrief] = useState<NovaDailyBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!deviceId) return;
    await Promise.all([
      api.listMissions(deviceId).then((r) => setMissions(r.items)).catch(() => {}),
      api.novaDaily(deviceId, false).then(setBrief).catch(() => {}),
    ]);
  }, [deviceId]);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  useFocusEffect(useCallback(() => { load(); refresh(); }, [load, refresh]));

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([load(), refresh()]);
    setRefreshing(false);
  };

  const doneCount = missions.filter((m) => m.completed).length;
  const level = Math.min(6, doneCount);
  const stageLabel = STAGES[level];
  const nextStage = STAGES[Math.min(6, level + 1)];
  const missionsToNext = Math.max(0, (level + 1) - doneCount);

  const suggestedMission = useMemo(() => {
    if (brief?.mission_id) {
      const m = missions.find((mm) => mm.id === brief.mission_id && !mm.completed);
      if (m) return m;
    }
    return missions.find((m) => !m.completed) || null;
  }, [brief, missions]);

  const otherMissions = useMemo(
    () => missions.filter((m) => !suggestedMission || m.id !== suggestedMission.id),
    [missions, suggestedMission],
  );

  const novaNote = useMemo(() => {
    if (brief?.thought) return brief.thought;
    if (doneCount === 0) return "You're a seed with all the code inside you already. Let's plant the first one.";
    if (doneCount < 3) return "You're showing up. That's the whole trick — the ones who grow are just the ones who don't stop.";
    if (doneCount < 6) return "You're building a rhythm. I can see the person you're becoming clearer every day.";
    return "You're flourishing. Whatever you touch now grows faster because of who you already are.";
  }, [brief, doneCount]);

  return (
    <SafeAreaView style={[styles.wrap, { backgroundColor: colors.background }]} edges={['top']} testID="grow-screen">
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 120 + insets.bottom }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <Text style={[type.small, { color: colors.textSecondary, letterSpacing: 1 }]}>GROW</Text>
        <Text style={[type.h1, { color: colors.textPrimary, marginTop: 2 }]}>
          You are becoming.
        </Text>

        {/* Plant + stage */}
        <Animated.View entering={FadeIn.duration(500)}>
          <View style={[styles.dashCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
            <View style={{ alignItems: 'center' }}>
              <GrowingPlant level={level} color={colors.primary} />
            </View>
            <Text style={[type.caption, { color: colors.textSecondary, textAlign: 'center' }]}>YOUR STAGE</Text>
            <Text style={[type.h2, { color: colors.textPrimary, textAlign: 'center', marginTop: 2 }]}>
              {stageLabel}
            </Text>
            {level < 6 ? (
              <Text style={[type.small, { color: colors.textSecondary, textAlign: 'center', marginTop: 4 }]}>
                {missionsToNext} more {missionsToNext === 1 ? 'mission' : 'missions'} until {nextStage.toLowerCase()}
              </Text>
            ) : (
              <Text style={[type.small, { color: colors.primary, textAlign: 'center', marginTop: 4, fontWeight: '700' }]}>
                You bloomed.
              </Text>
            )}

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Flame color={colors.achievement} size={16} strokeWidth={2.5} />
                <Text style={[type.h3, { color: colors.textPrimary }]}>{profile?.streak ?? 0}</Text>
                <Text style={[type.small, { color: colors.textSecondary }]}>streak</Text>
              </View>
              <View style={styles.stat}>
                <Sparkles color={colors.primary} size={16} strokeWidth={2.5} />
                <Text style={[type.h3, { color: colors.textPrimary }]}>{profile?.growth_points ?? 0}</Text>
                <Text style={[type.small, { color: colors.textSecondary }]}>points</Text>
              </View>
              <View style={styles.stat}>
                <TrendingUp color={colors.secondary} size={16} strokeWidth={2.5} />
                <Text style={[type.h3, { color: colors.textPrimary }]}>{doneCount}</Text>
                <Text style={[type.small, { color: colors.textSecondary }]}>done</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Nova's note on the student */}
        <Animated.View entering={FadeInDown.delay(150).duration(500)} style={{ marginTop: 20 }}>
          <Pressable
            testID="grow-nova-note"
            onPress={() => router.push('/nova')}
            style={({ pressed }) => [
              styles.novaNote,
              { backgroundColor: colors.secondarySoft, borderRadius: radius.lg, transform: [{ scale: pressed ? 0.98 : 1 }] },
            ]}
          >
            <View style={styles.novaNoteHeader}>
              <View style={[styles.novaPill, { backgroundColor: colors.secondary }]}>
                <Sparkles color="#fff" size={11} strokeWidth={2.6} />
                <Text style={styles.novaPillText}>NOVA ON YOU</Text>
              </View>
            </View>
            <Text style={[styles.novaNoteText, { color: colors.textPrimary }]}>
              {novaNote}
            </Text>
          </Pressable>
        </Animated.View>

        {/* Suggested next */}
        {suggestedMission ? (
          <Animated.View entering={FadeInDown.delay(250).duration(500)} style={{ marginTop: 24 }}>
            <Text style={[type.caption, { color: colors.textSecondary, marginBottom: 10 }]}>{"NOVA’S PICK FOR TODAY"}</Text>
            <Pressable
              testID={`grow-suggested-${suggestedMission.id}`}
              onPress={() => router.push(`/mission/${suggestedMission.id}`)}
              style={({ pressed }) => [
                styles.suggested,
                {
                  backgroundColor: colors.primary,
                  borderRadius: radius.lg,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
            >
              <Text style={{ fontSize: 40 }}>{suggestedMission.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.suggestedTitle}>{suggestedMission.title}</Text>
                <Text style={styles.suggestedDesc} numberOfLines={2}>{suggestedMission.description}</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                  <View style={styles.whiteBadge}>
                    <Text style={styles.whiteBadgeText}>+{suggestedMission.growth_points} pts</Text>
                  </View>
                  <View style={styles.whiteBadge}>
                    <Text style={styles.whiteBadgeText}>{suggestedMission.duration_min} min</Text>
                  </View>
                </View>
              </View>
            </Pressable>
          </Animated.View>
        ) : null}

        {/* Other missions */}
        <Text style={[type.caption, { color: colors.textSecondary, marginTop: 24, marginBottom: 10 }]}>{"ALL MISSIONS"}</Text>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <View style={{ gap: 12 }}>
            {otherMissions.map((m, i) => (
              <Animated.View key={m.id} entering={FadeInDown.delay(i * 40).duration(400)}>
                <Pressable
                  testID={`mission-card-${m.id}`}
                  onPress={() => router.push(`/mission/${m.id}`)}
                  style={({ pressed }) => [
                    styles.missionCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderRadius: radius.lg,
                      opacity: m.completed ? 0.65 : 1,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    },
                  ]}
                >
                  <View style={styles.missionEmoji}><Text style={{ fontSize: 34 }}>{m.emoji}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={[type.h3, { color: colors.textPrimary }]}>{m.title}</Text>
                    <Text style={[type.small, { color: colors.textSecondary, marginTop: 4 }]} numberOfLines={2}>
                      {m.description}
                    </Text>
                    <View style={styles.metaRow}>
                      <View style={[styles.badge, { backgroundColor: colors.primarySoft }]}>
                        <Text style={[styles.badgeText, { color: colors.primary }]}>+{m.growth_points}</Text>
                      </View>
                      <View style={[styles.badge, { backgroundColor: colors.secondarySoft }]}>
                        <Text style={[styles.badgeText, { color: colors.secondary }]}>{m.duration_min} min</Text>
                      </View>
                      <View style={[styles.badge, { backgroundColor: colors.surfaceMuted }]}>
                        <Text style={[styles.badgeText, { color: colors.textSecondary }]}>{m.difficulty}</Text>
                      </View>
                    </View>
                  </View>
                  {m.completed && (
                    <View style={[styles.doneBadge, { backgroundColor: colors.primary }]}>
                      <Check size={14} color="#fff" strokeWidth={3} />
                    </View>
                  )}
                </Pressable>
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  dashCard: { marginTop: 20, padding: 20, borderWidth: 1 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(148,163,184,0.15)', paddingTop: 16 },
  stat: { alignItems: 'center', gap: 4 },
  novaNote: { padding: 20 },
  novaNoteHeader: { flexDirection: 'row', alignItems: 'center' },
  novaPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
  },
  novaPillText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  novaNoteText: { fontSize: 17, fontWeight: '600', lineHeight: 24, marginTop: 12, letterSpacing: -0.2 },
  suggested: {
    padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16,
    shadowColor: '#10B981', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 4,
  },
  suggestedTitle: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  suggestedDesc: { color: 'rgba(255,255,255,0.9)', fontSize: 13, marginTop: 4, lineHeight: 18 },
  whiteBadge: { backgroundColor: 'rgba(255,255,255,0.22)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  whiteBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  missionCard: {
    borderWidth: 1, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  missionEmoji: { width: 54, height: 54, alignItems: 'center', justifyContent: 'center' },
  metaRow: { flexDirection: 'row', gap: 6, marginTop: 10 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  doneBadge: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});

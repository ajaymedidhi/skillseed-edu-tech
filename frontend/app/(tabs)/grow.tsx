// Grow — Daily Missions feed + Growth Dashboard (growing plant metaphor).

import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { Check, Flame, Sparkles } from 'lucide-react-native';

import { useTheme } from '@/src/theme/ThemeContext';
import { useProfile } from '@/src/state/profile';
import { api, Mission } from '@/src/api/client';

function GrowingPlant({ level, size = 200, color }: { level: number; size?: number; color: string }) {
  // level 0-6 controls how tall the plant is
  const clamped = Math.max(0, Math.min(6, level));
  const heights = [10, 40, 75, 110, 140, 170, 200];
  const stemH = heights[clamped];
  const cx = size / 2;
  return (
    <Svg width={size} height={size + 40}>
      <Defs>
        <LinearGradient id="stem" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="1" />
          <Stop offset="1" stopColor={color} stopOpacity="0.4" />
        </LinearGradient>
      </Defs>
      {/* soil ellipse */}
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
      {/* leaves as growth progresses */}
      {clamped >= 2 && <Circle cx={cx - 20} cy={size + 10 - stemH * 0.55} r={14} fill={color} opacity={0.85} />}
      {clamped >= 3 && <Circle cx={cx + 22} cy={size + 10 - stemH * 0.7} r={16} fill={color} opacity={0.85} />}
      {clamped >= 4 && <Circle cx={cx - 24} cy={size + 10 - stemH * 0.82} r={18} fill={color} opacity={0.9} />}
      {clamped >= 5 && <Circle cx={cx + 26} cy={size + 10 - stemH * 0.92} r={20} fill={color} opacity={0.95} />}
      {/* bud/flower at top */}
      {clamped >= 1 && (
        <Circle cx={cx} cy={size + 10 - stemH} r={clamped >= 5 ? 22 : 12} fill="#FBBF24" opacity={0.95} />
      )}
    </Svg>
  );
}

export default function Grow() {
  const { colors, spacing, radius, type } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, deviceId, refresh } = useProfile();

  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!deviceId) return;
    try {
      const r = await api.listMissions(deviceId);
      setMissions(r.items);
    } catch {}
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
  const level = Math.min(6, Math.floor(doneCount / 1)); // 1 mission = 1 plant level for demo

  return (
    <SafeAreaView style={[styles.wrap, { backgroundColor: colors.background }]} edges={['top']} testID="grow-screen">
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 120 + insets.bottom }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <Text style={[type.small, { color: colors.textSecondary, letterSpacing: 1 }]}>GROW</Text>
        <Text style={[type.h1, { color: colors.textPrimary, marginTop: 2 }]}>Your growth</Text>

        {/* Growing plant dashboard */}
        <View
          style={[
            styles.dashCard,
            { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg },
          ]}
        >
          <View style={{ alignItems: 'center' }}>
            <GrowingPlant level={level} color={colors.primary} />
          </View>
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
              <Text style={[type.h3, { color: colors.textPrimary }]}>{doneCount}</Text>
              <Text style={[type.small, { color: colors.textSecondary }]}>done</Text>
            </View>
          </View>
        </View>

        <Text style={[type.caption, { color: colors.textSecondary, marginTop: 24, marginBottom: 10 }]}>
          MISSIONS
        </Text>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <View style={{ gap: 12 }}>
            {missions.map((m, i) => (
              <Animated.View key={m.id} entering={FadeInDown.delay(i * 50).duration(400)}>
                <Pressable
                  testID={`mission-card-${m.id}`}
                  onPress={() => router.push(`/mission/${m.id}`)}
                  style={({ pressed }) => [
                    styles.missionCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderRadius: radius.lg,
                      opacity: m.completed ? 0.7 : 1,
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
                        <Text style={[styles.badgeText, { color: colors.primary }]}>
                          +{m.growth_points}
                        </Text>
                      </View>
                      <View style={[styles.badge, { backgroundColor: colors.secondarySoft }]}>
                        <Text style={[styles.badgeText, { color: colors.secondary }]}>
                          {m.duration_min} min
                        </Text>
                      </View>
                      <View style={[styles.badge, { backgroundColor: colors.surfaceMuted }]}>
                        <Text style={[styles.badgeText, { color: colors.textSecondary }]}>
                          {m.difficulty}
                        </Text>
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
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 12 },
  stat: { alignItems: 'center', gap: 4 },
  missionCard: {
    borderWidth: 1, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  missionEmoji: { width: 54, height: 54, alignItems: 'center', justifyContent: 'center' },
  metaRow: { flexDirection: 'row', gap: 6, marginTop: 10 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  doneBadge: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});

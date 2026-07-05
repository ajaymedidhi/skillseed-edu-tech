// Home — Nova is the hero. Big animated orb, voice CTA, suggested chips, today's mission.

import { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Mic, ArrowRight, Flame, Sparkles } from 'lucide-react-native';

import NovaOrb from '@/src/components/NovaOrb';
import { useTheme } from '@/src/theme/ThemeContext';
import { useProfile } from '@/src/state/profile';
import { api, Mission } from '@/src/api/client';

const SUGGESTED_CHIPS = [
  'What career fits me?',
  'Help me pick a mission',
  'Explain AI to me',
  'I want to try something new',
];

export default function Home() {
  const { colors, spacing, radius, type } = useTheme();
  const router = useRouter();
  const { profile, deviceId } = useProfile();
  const insets = useSafeAreaInsets();

  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deviceId) return;
    api.listMissions(deviceId)
      .then((r) => setMissions(r.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [deviceId]);

  const todaysMission = useMemo(() => missions.find((m) => !m.completed) || missions[0], [missions]);
  const completedCount = missions.filter((m) => m.completed).length;

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const openNova = (prefill?: string) => {
    router.push({ pathname: '/nova', params: prefill ? { prefill } : {} });
  };

  return (
    <SafeAreaView style={[styles.wrap, { backgroundColor: colors.background }]} edges={['top']} testID="home-screen">
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 120 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <Animated.View entering={FadeInDown.duration(500)}>
          <Text style={[type.small, { color: colors.textSecondary, letterSpacing: 1 }]}>
            {greeting.toUpperCase()}
          </Text>
          <Text style={[type.h1, { color: colors.textPrimary, marginTop: 4 }]}>
            {profile?.name ? `Hi, ${profile.name}` : 'Hi there'}
          </Text>
        </Animated.View>

        {/* Nova hero */}
        <Animated.View entering={FadeIn.duration(700)} style={styles.novaHero}>
          <NovaOrb size={240} state="idle" />
          <Text style={[type.h3, { color: colors.textPrimary, marginTop: spacing.base, textAlign: 'center' }]}>
            Nova is here.
          </Text>
          <Text style={[type.body, { color: colors.textSecondary, textAlign: 'center', marginTop: 6 }]}>
            Tap the mic and just talk — about anything.
          </Text>
        </Animated.View>

        {/* Voice CTA */}
        <Animated.View entering={FadeInDown.delay(150).duration(500)}>
          <Pressable
            testID="home-nova-voice-btn"
            onPress={() => openNova()}
            style={({ pressed }) => [
              styles.novaBtn,
              {
                backgroundColor: colors.primary,
                borderRadius: radius.full,
                shadowColor: colors.primary,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}
          >
            <Mic color="#fff" size={22} strokeWidth={2.4} />
            <Text style={styles.novaBtnText}>Talk to Nova</Text>
          </Pressable>
        </Animated.View>

        {/* Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingHorizontal: 4, paddingVertical: 16 }}
          style={{ marginHorizontal: -spacing.lg, paddingHorizontal: spacing.lg, marginTop: 4 }}
        >
          {SUGGESTED_CHIPS.map((c, i) => (
            <Animated.View key={c} entering={FadeInDown.delay(200 + i * 60).duration(400)}>
              <Pressable
                testID={`home-chip-${i}`}
                onPress={() => openNova(c)}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderRadius: radius.full,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                ]}
              >
                <Text style={[type.small, { color: colors.textPrimary }]}>{c}</Text>
              </Pressable>
            </Animated.View>
          ))}
        </ScrollView>

        {/* Today's mission */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={{ marginTop: spacing.lg }}>
          <Text style={[type.caption, { color: colors.textSecondary, marginBottom: 10 }]}>
            {"TODAY\u2019S MISSION"}
          </Text>
          {loading || !todaysMission ? (
            <View style={[styles.missionCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <Pressable
              testID="home-today-mission"
              onPress={() => router.push(`/mission/${todaysMission.id}`)}
              style={({ pressed }) => [
                styles.missionCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.lg,
                  shadowColor: colors.shadow,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
            >
              <View style={styles.missionEmoji}>
                <Text style={{ fontSize: 40 }}>{todaysMission.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[type.h3, { color: colors.textPrimary }]}>{todaysMission.title}</Text>
                <Text
                  style={[type.small, { color: colors.textSecondary, marginTop: 6 }]}
                  numberOfLines={2}
                >
                  {todaysMission.description}
                </Text>
                <View style={styles.missionMeta}>
                  <View style={[styles.badge, { backgroundColor: colors.primarySoft }]}>
                    <Sparkles size={12} color={colors.primary} strokeWidth={2.5} />
                    <Text style={[styles.badgeText, { color: colors.primary }]}>
                      +{todaysMission.growth_points} pts
                    </Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: colors.secondarySoft }]}>
                    <Text style={[styles.badgeText, { color: colors.secondary }]}>
                      {todaysMission.duration_min} min
                    </Text>
                  </View>
                </View>
              </View>
              <ArrowRight color={colors.textSecondary} size={22} />
            </Pressable>
          )}
        </Animated.View>

        {/* Growth summary strip */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)} style={{ marginTop: spacing.lg }}>
          <View style={[styles.statsRow]}>
            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md }]}>
              <Flame size={18} color={colors.achievement} strokeWidth={2.5} />
              <Text style={[type.h2, { color: colors.textPrimary, marginTop: 4 }]}>
                {profile?.streak ?? 0}
              </Text>
              <Text style={[type.small, { color: colors.textSecondary }]}>day streak</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md }]}>
              <Sparkles size={18} color={colors.primary} strokeWidth={2.5} />
              <Text style={[type.h2, { color: colors.textPrimary, marginTop: 4 }]}>
                {profile?.growth_points ?? 0}
              </Text>
              <Text style={[type.small, { color: colors.textSecondary }]}>growth pts</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md }]}>
              <Text style={[type.h2, { color: colors.textPrimary, marginTop: 4 }]}>
                {completedCount}
              </Text>
              <Text style={[type.small, { color: colors.textSecondary }]}>missions done</Text>
            </View>
          </View>
        </Animated.View>

        {/* Explore prompt */}
        <Animated.View entering={FadeInDown.delay(500).duration(500)} style={{ marginTop: spacing.lg }}>
          <Pressable
            testID="home-explore-cta"
            onPress={() => router.push('/(tabs)/explore')}
            style={({ pressed }) => [
              styles.exploreCard,
              {
                backgroundColor: colors.secondarySoft,
                borderRadius: radius.lg,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[type.caption, { color: colors.secondary }]}>EXPLORE</Text>
              <Text style={[type.h3, { color: colors.textPrimary, marginTop: 6 }]}>
                Careers, future skills, and stories
              </Text>
              <Text style={[type.small, { color: colors.textSecondary, marginTop: 4 }]}>
                Find what makes you come alive.
              </Text>
            </View>
            <ArrowRight color={colors.secondary} size={26} />
          </Pressable>
        </Animated.View>

        {/* Redo Discover */}
        {profile?.growth_profile_summary ? (
          <Animated.View entering={FadeInDown.delay(600).duration(500)} style={{ marginTop: spacing.md }}>
            <Pressable
              testID="home-view-profile"
              onPress={() => router.push('/growth-profile')}
              style={({ pressed }) => ({ paddingVertical: 14, alignItems: 'center', opacity: pressed ? 0.6 : 1 })}
            >
              <Text style={[type.small, { color: colors.textSecondary }]}>
                See your Growth Profile →
              </Text>
            </Pressable>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.delay(600).duration(500)} style={{ marginTop: spacing.md }}>
            <Pressable
              testID="home-start-discover"
              onPress={() => router.push('/discover')}
              style={({ pressed }) => ({ paddingVertical: 14, alignItems: 'center', opacity: pressed ? 0.6 : 1 })}
            >
              <Text style={[type.small, { color: colors.primary, fontWeight: '700' }]}>
                Discover your Growth Profile →
              </Text>
            </Pressable>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  novaHero: { alignItems: 'center', marginTop: 24, marginBottom: 20 },
  novaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 10,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 6,
  },
  novaBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
  },
  missionCard: {
    borderWidth: 1,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 2,
  },
  missionEmoji: { width: 60, height: 60, alignItems: 'center', justifyContent: 'center' },
  missionMeta: { flexDirection: 'row', gap: 8, marginTop: 10 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, padding: 16, borderWidth: 1, alignItems: 'flex-start' },
  exploreCard: {
    flexDirection: 'row', alignItems: 'center', padding: 20, gap: 12,
  },
});

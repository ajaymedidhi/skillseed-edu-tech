// Home — a CONVERSATION, not a dashboard.
// Layout: Nova speaks first (dynamic daily brief). One primary "reply" chip.
// Below: a Curiosity Spark card, then a personalized Next Step card, then a quiet growth strip.
// Everything is generated per-day from /api/nova/daily.

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Mic, Sparkles, Flame, ArrowRight, MessageCircle, Sprout } from 'lucide-react-native';

import NovaOrb from '@/src/components/NovaOrb';
import { useTheme } from '@/src/theme/ThemeContext';
import { useProfile } from '@/src/state/profile';
import { api, Mission, Career, Skill, NovaDailyBrief } from '@/src/api/client';

const VIBE_GRADIENT: Record<string, [string, string, string]> = {
  curious:     ['#6366F1', '#38BDF8', '#10B981'],
  playful:     ['#F472B6', '#FBBF24', '#38BDF8'],
  focused:     ['#0F172A', '#334155', '#10B981'],
  cozy:        ['#F97316', '#FBBF24', '#F472B6'],
  adventurous: ['#10B981', '#38BDF8', '#6366F1'],
};

export default function Home() {
  const { colors, spacing, radius, type, scheme } = useTheme();
  const router = useRouter();
  const { profile, deviceId } = useProfile();
  const insets = useSafeAreaInsets();

  const [brief, setBrief] = useState<NovaDailyBrief | null>(null);
  const [briefLoading, setBriefLoading] = useState(true);
  const [mission, setMission] = useState<Mission | null>(null);
  const [career, setCareer] = useState<Career | null>(null);
  const [skill, setSkill] = useState<Skill | null>(null);

  const loadBrief = useCallback(async (force = false) => {
    if (!deviceId) return;
    setBriefLoading(true);
    try {
      const b = await api.novaDaily(deviceId, force);
      setBrief(b);
      // enrich referenced items
      const jobs: Promise<any>[] = [];
      if (b.mission_id) jobs.push(api.getMission(b.mission_id, deviceId).then(setMission).catch(() => {}));
      if (b.career_id)  jobs.push(api.getCareer(b.career_id).then(setCareer).catch(() => {}));
      if (b.skill_id) {
        jobs.push(api.listSkills().then((r) => {
          const s = r.items.find((x) => x.id === b.skill_id) || null;
          setSkill(s);
        }).catch(() => {}));
      }
      await Promise.all(jobs);
    } catch (e) {
      // fail-soft: leave brief null; UI shows a graceful fallback
    } finally {
      setBriefLoading(false);
    }
  }, [deviceId]);

  useEffect(() => { loadBrief(false); }, [loadBrief]);
  useFocusEffect(useCallback(() => { loadBrief(false); }, [loadBrief]));

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const gradient = VIBE_GRADIENT[brief?.vibe || 'curious'];

  const openNova = (prefill?: string) => {
    router.push({ pathname: '/nova', params: prefill ? { prefill } : {} });
  };

  return (
    <SafeAreaView style={[styles.wrap, { backgroundColor: colors.background }]} edges={['top']} testID="home-screen">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header — logo + subtle time */}
        <View style={[styles.topBar, { paddingHorizontal: spacing.lg }]}>
          <View style={styles.brandRow}>
            <Image source={require('../../assets/images/logo.png')} style={styles.brandLogo} />
            <Text style={[type.h3, { color: colors.textPrimary, letterSpacing: -0.4 }]}>SkillSeed</Text>
          </View>
          <Text style={[type.small, { color: colors.textTertiary, letterSpacing: 1 }]}>
            {greeting.toUpperCase()}
          </Text>
        </View>

        {/* Nova speaks first — the conversational hero */}
        <Animated.View entering={FadeIn.duration(500)} style={{ paddingHorizontal: spacing.lg, marginTop: 8 }}>
          <View
            style={[styles.novaCard, { borderRadius: radius.lg, borderColor: colors.border, backgroundColor: colors.surface }]}
            testID="home-nova-card"
          >
            <LinearGradient
              colors={gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.novaCardGradient, { borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg }]}
            >
              <View style={styles.orbInline}>
                <NovaOrb size={110} state="idle" />
              </View>
              <Text style={styles.novaSays}>NOVA</Text>
            </LinearGradient>

            <View style={{ padding: spacing.lg, gap: 10 }}>
              {briefLoading ? (
                <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                  <ActivityIndicator color={colors.primary} />
                  <Text style={[type.small, { color: colors.textSecondary, marginTop: 10 }]}>
                    Nova is gathering her thoughts…
                  </Text>
                </View>
              ) : brief ? (
                <>
                  <Text style={[type.h2, { color: colors.textPrimary }]} testID="home-brief-greeting">
                    {brief.greeting}
                  </Text>
                  <Text style={[type.bodyLg, { color: colors.textSecondary }]}>
                    {brief.thought}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={[type.h2, { color: colors.textPrimary }]}>
                    Hey {profile?.name || 'friend'}.
                  </Text>
                  <Text style={[type.bodyLg, { color: colors.textSecondary }]}>
                    Ready to plant something new today?
                  </Text>
                </>
              )}

              {/* Reply chip + mic */}
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                <Pressable
                  testID="home-reply-chip"
                  onPress={() => openNova(brief?.suggested_prompt || 'Tell me more')}
                  style={({ pressed }) => [
                    styles.replyChip,
                    {
                      backgroundColor: colors.primary,
                      borderRadius: radius.full,
                      flex: 1,
                      transform: [{ scale: pressed ? 0.97 : 1 }],
                    },
                  ]}
                >
                  <MessageCircle color="#fff" size={16} strokeWidth={2.5} />
                  <Text style={styles.replyChipText} numberOfLines={1}>
                    {brief?.suggested_prompt || 'Talk to Nova'}
                  </Text>
                </Pressable>
                <Pressable
                  testID="home-nova-voice-btn"
                  onPress={() => openNova()}
                  style={({ pressed }) => [
                    styles.micIconBtn,
                    { backgroundColor: colors.surfaceMuted, borderColor: colors.border, transform: [{ scale: pressed ? 0.95 : 1 }] },
                  ]}
                >
                  <Mic color={colors.textPrimary} size={20} strokeWidth={2.4} />
                </Pressable>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Curiosity Spark */}
        {brief?.spark ? (
          <Animated.View entering={FadeInDown.delay(150).duration(500)} style={{ paddingHorizontal: spacing.lg, marginTop: 16 }}>
            <Pressable
              testID="home-spark-card"
              onPress={() => openNova(brief.spark)}
              style={({ pressed }) => [
                styles.sparkCard,
                {
                  backgroundColor: colors.secondarySoft,
                  borderRadius: radius.lg,
                  transform: [{ scale: pressed ? 0.99 : 1 }],
                },
              ]}
            >
              <View style={styles.sparkHeader}>
                <View style={[styles.sparkPill, { backgroundColor: colors.secondary }]}>
                  <Sparkles color="#fff" size={12} strokeWidth={2.5} />
                  <Text style={styles.sparkPillText}>CURIOSITY SPARK</Text>
                </View>
              </View>
              <Text style={[styles.sparkText, { color: colors.textPrimary }]}>
                {brief.spark}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 }}>
                <Text style={[type.small, { color: colors.secondary, fontWeight: '700' }]}>
                  Answer Nova
                </Text>
                <ArrowRight color={colors.secondary} size={14} />
              </View>
            </Pressable>
          </Animated.View>
        ) : null}

        {/* Next step — one clear action */}
        {mission ? (
          <Animated.View entering={FadeInDown.delay(250).duration(500)} style={{ paddingHorizontal: spacing.lg, marginTop: 16 }}>
            <Text style={[type.caption, { color: colors.textSecondary, marginBottom: 10, marginLeft: 2 }]}>
              {"YOUR NEXT STEP"}
            </Text>
            <Pressable
              testID="home-today-mission"
              onPress={() => router.push(`/mission/${mission.id}`)}
              style={({ pressed }) => [
                styles.stepCard,
                {
                  backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
            >
              <View style={styles.stepEmoji}>
                <Text style={{ fontSize: 42 }}>{mission.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[type.h3, { color: colors.textPrimary }]}>{mission.title}</Text>
                <Text style={[type.small, { color: colors.textSecondary, marginTop: 4 }]} numberOfLines={2}>
                  {mission.description}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                  <View style={[styles.badge, { backgroundColor: colors.primarySoft }]}>
                    <Sparkles size={11} color={colors.primary} strokeWidth={2.5} />
                    <Text style={[styles.badgeText, { color: colors.primary }]}>+{mission.growth_points} pts</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: colors.secondarySoft }]}>
                    <Text style={[styles.badgeText, { color: colors.secondary }]}>{mission.duration_min} min</Text>
                  </View>
                </View>
              </View>
              <ArrowRight color={colors.textSecondary} size={20} />
            </Pressable>
          </Animated.View>
        ) : null}

        {/* Nova's picks — career + skill of the day */}
        {(career || skill) ? (
          <Animated.View entering={FadeInDown.delay(350).duration(500)} style={{ marginTop: 20 }}>
            <Text style={[type.caption, { color: colors.textSecondary, marginBottom: 10, marginLeft: spacing.lg + 2 }]}>
              {"NOVA’S PICKS FOR YOU"}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingHorizontal: spacing.lg, paddingRight: 32 }}
            >
              {career ? (
                <Pressable
                  testID={`home-pick-career-${career.id}`}
                  onPress={() => router.push(`/career/${career.id}`)}
                  style={({ pressed }) => [
                    styles.pickCard,
                    { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, transform: [{ scale: pressed ? 0.98 : 1 }] },
                  ]}
                >
                  <Text style={{ fontSize: 36 }}>{career.emoji}</Text>
                  <Text style={[type.caption, { color: colors.secondary, marginTop: 10 }]}>CAREER</Text>
                  <Text style={[type.h3, { color: colors.textPrimary, marginTop: 4 }]} numberOfLines={1}>
                    {career.name}
                  </Text>
                  <Text style={[type.small, { color: colors.textSecondary, marginTop: 6 }]} numberOfLines={3}>
                    {career.tagline}
                  </Text>
                </Pressable>
              ) : null}
              {skill ? (
                <Pressable
                  testID={`home-pick-skill-${skill.id}`}
                  onPress={() => router.push('/(tabs)/explore')}
                  style={({ pressed }) => [
                    styles.pickCard,
                    { backgroundColor: colors.primarySoft, borderRadius: radius.lg, borderColor: 'transparent', transform: [{ scale: pressed ? 0.98 : 1 }] },
                  ]}
                >
                  <Text style={{ fontSize: 36 }}>{skill.emoji}</Text>
                  <Text style={[type.caption, { color: colors.primary, marginTop: 10 }]}>SKILL</Text>
                  <Text style={[type.h3, { color: colors.textPrimary, marginTop: 4 }]} numberOfLines={1}>
                    {skill.name}
                  </Text>
                  <Text style={[type.small, { color: colors.textSecondary, marginTop: 6 }]} numberOfLines={3}>
                    {skill.description}
                  </Text>
                </Pressable>
              ) : null}
            </ScrollView>
          </Animated.View>
        ) : null}

        {/* Quiet growth strip */}
        <Animated.View entering={FadeInDown.delay(450).duration(500)} style={{ paddingHorizontal: spacing.lg, marginTop: 24 }}>
          <Pressable
            testID="home-growth-strip"
            onPress={() => router.push('/(tabs)/grow')}
            style={({ pressed }) => [
              styles.growthStrip,
              { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, transform: [{ scale: pressed ? 0.98 : 1 }] },
            ]}
          >
            <View style={[styles.growthIcon, { backgroundColor: colors.primarySoft }]}>
              <Sprout size={18} color={colors.primary} strokeWidth={2.5} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[type.small, { color: colors.textSecondary }]}>Your growth</Text>
              <View style={{ flexDirection: 'row', gap: 14, marginTop: 4 }}>
                <View style={styles.miniStat}>
                  <Flame size={14} color={colors.achievement} strokeWidth={2.5} />
                  <Text style={[type.small, { color: colors.textPrimary, fontWeight: '700' }]}>
                    {profile?.streak ?? 0} day streak
                  </Text>
                </View>
                <View style={styles.miniStat}>
                  <Sparkles size={14} color={colors.primary} strokeWidth={2.5} />
                  <Text style={[type.small, { color: colors.textPrimary, fontWeight: '700' }]}>
                    {profile?.growth_points ?? 0} pts
                  </Text>
                </View>
              </View>
            </View>
            <ArrowRight color={colors.textSecondary} size={18} />
          </Pressable>
        </Animated.View>

        {/* Growth Profile quick link */}
        {profile?.growth_profile_summary ? (
          <Pressable
            testID="home-view-profile"
            onPress={() => router.push('/growth-profile')}
            style={({ pressed }) => ({ paddingVertical: 18, alignItems: 'center', opacity: pressed ? 0.6 : 1, marginTop: 4 })}
          >
            <Text style={[type.small, { color: colors.textSecondary }]}>
              See your Growth Profile →
            </Text>
          </Pressable>
        ) : (
          <Pressable
            testID="home-start-discover"
            onPress={() => router.push('/discover')}
            style={({ pressed }) => ({ paddingVertical: 18, alignItems: 'center', opacity: pressed ? 0.6 : 1, marginTop: 4 })}
          >
            <Text style={[type.small, { color: colors.primary, fontWeight: '700' }]}>
              Discover your Growth Profile →
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  topBar: {
    paddingTop: 8, paddingBottom: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandLogo: { width: 36, height: 36 },

  novaCard: {
    borderWidth: 1, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 18, elevation: 3,
  },
  novaCardGradient: {
    paddingTop: 20, paddingBottom: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  orbInline: { marginBottom: 4 },
  novaSays: {
    color: 'rgba(255,255,255,0.95)', fontSize: 11, fontWeight: '800',
    letterSpacing: 3, marginTop: 4, marginBottom: 6,
  },

  replyChip: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, paddingHorizontal: 18, gap: 8,
  },
  replyChipText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  micIconBtn: {
    width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },

  sparkCard: { padding: 20 },
  sparkHeader: { flexDirection: 'row', alignItems: 'center' },
  sparkPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
  },
  sparkPillText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  sparkText: { fontSize: 22, fontWeight: '700', lineHeight: 30, marginTop: 12, letterSpacing: -0.3 },

  stepCard: {
    borderWidth: 1, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  stepEmoji: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },

  pickCard: {
    width: 200, padding: 18, borderWidth: 1,
  },

  growthStrip: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 16, borderWidth: 1,
  },
  growthIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  miniStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});

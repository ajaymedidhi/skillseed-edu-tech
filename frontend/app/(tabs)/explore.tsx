// Explore — a curiosity engine, not a career list.
// Top: Spark of the Day (dynamic) inviting a conversation.
// Then: careers filtered by chip row + Skill Journeys (visual paths).

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, Sparkles } from 'lucide-react-native';

import { useTheme } from '@/src/theme/ThemeContext';
import { useProfile } from '@/src/state/profile';
import { api, Career, Skill, NovaDailyBrief } from '@/src/api/client';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'traditional', label: 'Traditional' },
  { id: 'modern', label: 'Modern' },
  { id: 'ai', label: 'AI' },
  { id: 'creative', label: 'Creative' },
];

export default function Explore() {
  const { colors, spacing, radius, type } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { deviceId } = useProfile();

  const [careers, setCareers] = useState<Career[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [brief, setBrief] = useState<NovaDailyBrief | null>(null);
  const [cat, setCat] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const jobs: Promise<any>[] = [
      api.listCareers().then((c) => setCareers(c.items)).catch(() => {}),
      api.listSkills().then((s) => setSkills(s.items)).catch(() => {}),
    ];
    if (deviceId) {
      jobs.push(api.novaDaily(deviceId, false).then(setBrief).catch(() => {}));
    }
    await Promise.all(jobs);
  }, [deviceId]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = useMemo(
    () => (cat === 'all' ? careers : careers.filter((c) => c.category === cat)),
    [cat, careers],
  );

  return (
    <SafeAreaView style={[styles.wrap, { backgroundColor: colors.background }]} edges={['top']} testID="explore-screen">
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
        <Text style={[type.small, { color: colors.textSecondary, letterSpacing: 1 }]}>EXPLORE</Text>
        <Text style={[type.h1, { color: colors.textPrimary, marginTop: 2 }]}>Follow your curiosity</Text>
      </View>

      {/* Category chips row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: 8,
          paddingHorizontal: spacing.lg,
          paddingVertical: 16,
          alignItems: 'center',
        }}
        style={{ height: 56, flexGrow: 0, marginTop: 4 }}
      >
        {CATEGORIES.map((c) => {
          const active = cat === c.id;
          return (
            <Pressable
              key={c.id}
              testID={`explore-chip-${c.id}`}
              onPress={() => setCat(c.id)}
              style={({ pressed }) => [
                styles.catChip,
                {
                  backgroundColor: active ? colors.primary : colors.surface,
                  borderColor: active ? colors.primary : colors.border,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              <Text style={{ color: active ? '#fff' : colors.textPrimary, fontWeight: '700', fontSize: 13 }}>
                {c.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingTop: 4, paddingBottom: 120 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Spark of the Day hero — only in "all" view */}
        {cat === 'all' && brief?.spark ? (
          <Animated.View entering={FadeIn.duration(500)}>
            <Pressable
              testID="explore-spark-hero"
              onPress={() => router.push({ pathname: '/nova', params: { prefill: brief.spark } })}
              style={({ pressed }) => [
                styles.spark, { borderRadius: radius.lg, transform: [{ scale: pressed ? 0.99 : 1 }] },
              ]}
            >
              <LinearGradient
                colors={['#6366F1', '#38BDF8', '#10B981']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={{ padding: 24 }}>
                <View style={styles.sparkPill}>
                  <Sparkles color="#fff" size={12} strokeWidth={2.6} />
                  <Text style={styles.sparkPillText}>SPARK OF THE DAY</Text>
                </View>
                <Text style={styles.sparkQ}>{brief.spark}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16 }}>
                  <Text style={styles.sparkCta}>Explore with Nova</Text>
                  <ArrowRight color="#fff" size={16} />
                </View>
              </View>
            </Pressable>
          </Animated.View>
        ) : null}

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            <Text style={[type.caption, { color: colors.textSecondary, marginTop: brief?.spark && cat === 'all' ? 24 : 0, marginBottom: 10 }]}>
              {"PATHS TO EXPLORE"}
            </Text>
            <View style={{ gap: 12 }}>
              {filtered.map((c, i) => (
                <Animated.View key={c.id} entering={FadeInDown.delay(i * 30).duration(400)}>
                  <Pressable
                    testID={`career-card-${c.id}`}
                    onPress={() => router.push(`/career/${c.id}`)}
                    style={({ pressed }) => [
                      styles.careerCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        borderRadius: radius.lg,
                        transform: [{ scale: pressed ? 0.98 : 1 }],
                      },
                    ]}
                  >
                    <View style={styles.emojiCircle}>
                      <Text style={{ fontSize: 32 }}>{c.emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[type.h3, { color: colors.textPrimary }]}>{c.name}</Text>
                      <Text style={[type.small, { color: colors.textSecondary, marginTop: 4 }]} numberOfLines={2}>
                        {c.tagline}
                      </Text>
                    </View>
                    <ArrowRight color={colors.textSecondary} size={20} />
                  </Pressable>
                </Animated.View>
              ))}
            </View>

            {/* Future skills tracks */}
            <View style={{ marginTop: 28 }}>
              <Text style={[type.caption, { color: colors.textSecondary, marginBottom: 12 }]}>
                {"SKILL JOURNEYS"}
              </Text>
              <View style={{ gap: 12 }}>
                {skills.map((s, i) => (
                  <Animated.View key={s.id} entering={FadeIn.delay(i * 60).duration(400)}>
                    <View
                      style={[
                        styles.skillCard,
                        { backgroundColor: colors.secondarySoft, borderRadius: radius.lg },
                      ]}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <Text style={{ fontSize: 28 }}>{s.emoji}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={[type.h3, { color: colors.textPrimary }]}>{s.name}</Text>
                          <Text style={[type.small, { color: colors.textSecondary, marginTop: 2 }]}>
                            {s.description}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.skillTree}>
                        {s.milestones.map((m, mi) => (
                          <View key={mi} style={styles.milestone}>
                            <View
                              style={[
                                styles.milestoneDot,
                                { backgroundColor: mi === 0 ? colors.primary : colors.surface, borderColor: colors.primary },
                              ]}
                            />
                            <Text style={[type.small, { color: colors.textPrimary, flex: 1 }]} numberOfLines={1}>
                              {m}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </Animated.View>
                ))}
              </View>
            </View>

            {/* Ask Nova footer CTA */}
            <Pressable
              testID="explore-ask-nova"
              onPress={() => router.push('/nova')}
              style={({ pressed }) => [
                styles.askNova,
                { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, transform: [{ scale: pressed ? 0.98 : 1 }] },
              ]}
            >
              <Sparkles color={colors.primary} size={18} strokeWidth={2.5} />
              <Text style={[type.bodyLg, { color: colors.textPrimary, flex: 1 }]}>
                {"Not sure? Ask Nova."}
              </Text>
              <ArrowRight color={colors.textSecondary} size={18} />
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  catChip: {
    height: 36, flexShrink: 0, borderWidth: 1,
    paddingHorizontal: 16, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
  },
  spark: {
    overflow: 'hidden',
    shadowColor: '#6366F1', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 18, elevation: 6,
  },
  sparkPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.25)', alignSelf: 'flex-start',
  },
  sparkPillText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  sparkQ: { color: '#fff', fontSize: 24, fontWeight: '800', lineHeight: 32, marginTop: 14, letterSpacing: -0.4 },
  sparkCta: { color: '#fff', fontSize: 14, fontWeight: '700' },

  careerCard: {
    borderWidth: 1, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  emojiCircle: {
    width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(16,185,129,0.08)',
  },
  skillCard: { padding: 18 },
  skillTree: { marginTop: 14, gap: 8 },
  milestone: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  milestoneDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2 },

  askNova: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 16, borderWidth: 1, marginTop: 24,
  },
});

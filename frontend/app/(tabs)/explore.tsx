// Explore — Careers (with category chips) + Future Skills sections.

import { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { ArrowRight } from 'lucide-react-native';

import { useTheme } from '@/src/theme/ThemeContext';
import { api, Career, Skill } from '@/src/api/client';

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

  const [careers, setCareers] = useState<Career[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [cat, setCat] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.listCareers(), api.listSkills()])
      .then(([c, s]) => {
        setCareers(c.items);
        setSkills(s.items);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => (cat === 'all' ? careers : careers.filter((c) => c.category === cat)),
    [cat, careers],
  );

  return (
    <SafeAreaView style={[styles.wrap, { backgroundColor: colors.background }]} edges={['top']} testID="explore-screen">
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
        <Text style={[type.small, { color: colors.textSecondary, letterSpacing: 1 }]}>EXPLORE</Text>
        <Text style={[type.h1, { color: colors.textPrimary, marginTop: 2 }]}>Find your path</Text>
      </View>

      {/* Category chips row — sticky above list */}
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
              <Text
                style={{
                  color: active ? '#fff' : colors.textPrimary,
                  fontWeight: '700',
                  fontSize: 13,
                }}
              >
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
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            <View style={{ gap: 12 }}>
              {filtered.map((c, i) => (
                <Animated.View key={c.id} entering={FadeInDown.delay(i * 40).duration(400)}>
                  <Pressable
                    testID={`career-card-${c.id}`}
                    onPress={() => router.push(`/career/${c.id}`)}
                    style={({ pressed }) => [
                      styles.careerCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        borderRadius: radius.lg,
                        shadowColor: colors.shadow,
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
                FUTURE SKILLS TRACKS
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
  careerCard: {
    borderWidth: 1, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14,
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 10, elevation: 1,
  },
  emojiCircle: {
    width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(16,185,129,0.08)',
  },
  skillCard: { padding: 18 },
  skillTree: { marginTop: 14, gap: 8 },
  milestone: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  milestoneDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2 },
});

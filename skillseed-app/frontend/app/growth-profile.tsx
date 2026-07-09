// Growth Profile — the shareable, beautiful result card.

import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Sparkles, ArrowRight } from 'lucide-react-native';

import { useTheme } from '@/src/theme/ThemeContext';
import { useProfile } from '@/src/state/profile';
import { api, Career, Skill } from '@/src/api/client';

export default function GrowthProfile() {
  const { colors, spacing, radius, type, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile } = useProfile();
  const [careers, setCareers] = useState<Career[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reuse the summary from profile; also load related content based on interests
    Promise.all([api.listCareers(), api.listSkills()])
      .then(([c, s]) => {
        setCareers(c.items);
        setSkills(s.items);
      })
      .finally(() => setLoading(false));
  }, []);

  const gradientColors = scheme === 'dark'
    ? [colors.secondary, colors.primary, colors.accent]
    : [colors.secondary, colors.primary, colors.accent];

  const strengths = profile?.strengths || [];
  const interests = profile?.interests || [];
  const headline = strengths.length
    ? `A ${profile?.learning_style || 'Curious'} mind who loves ${interests.slice(0, 2).join(' & ') || 'exploring'}.`
    : 'Your Growth Profile';

  return (
    <SafeAreaView style={[styles.wrap, { backgroundColor: colors.background }]} edges={['top', 'bottom']} testID="growth-profile-screen">
      <View style={[styles.header, { paddingHorizontal: spacing.lg }]}>
        <Pressable testID="growth-profile-back" onPress={() => { if (router.canGoBack()) { router.back(); } else { router.replace('/'); } }} hitSlop={12}>
          <ArrowLeft color={colors.textPrimary} size={24} strokeWidth={2.2} />
        </Pressable>
        <Text style={[type.small, { color: colors.textSecondary, fontWeight: '700' }]}>
          YOUR GROWTH PROFILE
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero card — the shareable one */}
        <Animated.View entering={FadeIn.duration(600)}>
          <View style={[styles.heroCard, { borderRadius: radius.lg }]}>
            <LinearGradient
              colors={gradientColors as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.heroInner}>
              <Text style={styles.heroBrand}>SKILLSEED · GROWTH PROFILE</Text>
              <Text style={styles.heroName}>{profile?.name || 'You'}</Text>
              <Text style={styles.heroHeadline}>{headline}</Text>
              <View style={styles.heroTagRow}>
                {(strengths.length ? strengths : ['Curious', 'Growing']).slice(0, 4).map((s) => (
                  <View key={s} style={styles.heroTag}>
                    <Text style={styles.heroTagText}>{s}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.heroFooter}>
                <Sparkles color="#FFF" size={14} strokeWidth={2.4} />
                <Text style={styles.heroFooterText}>Planting Skills. Growing Futures.</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Summary */}
        {profile?.growth_profile_summary ? (
          <Animated.View entering={FadeInDown.delay(200).duration(500)} style={{ marginTop: 24 }}>
            <Text style={[type.caption, { color: colors.textSecondary, marginBottom: 8 }]}>WHO YOU ARE</Text>
            <Text style={[type.bodyLg, { color: colors.textPrimary }]}>
              {profile.growth_profile_summary}
            </Text>
          </Animated.View>
        ) : null}

        {/* Interests */}
        {interests.length > 0 && (
          <Animated.View entering={FadeInDown.delay(300).duration(500)} style={{ marginTop: 20 }}>
            <Text style={[type.caption, { color: colors.textSecondary, marginBottom: 8 }]}>WHAT LIGHTS YOU UP</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {interests.map((i) => (
                <View key={i} style={[styles.softTag, { backgroundColor: colors.secondarySoft, borderRadius: 999 }]}>
                  <Text style={[type.small, { color: colors.secondary, fontWeight: '700' }]}>{i}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Matches */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)} style={{ marginTop: 24 }}>
          <Text style={[type.caption, { color: colors.textSecondary, marginBottom: 10 }]}>CAREERS TO EXPLORE</Text>
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <View style={{ gap: 10 }}>
              {careers.slice(0, 5).map((c) => (
                <Pressable
                  key={c.id}
                  testID={`growth-career-${c.id}`}
                  onPress={() => router.push(`/career/${c.id}`)}
                  style={({ pressed }) => [
                    styles.matchRow,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderRadius: radius.md,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    },
                  ]}
                >
                  <Text style={{ fontSize: 28 }}>{c.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[type.h3, { color: colors.textPrimary }]}>{c.name}</Text>
                    <Text style={[type.small, { color: colors.textSecondary }]} numberOfLines={1}>
                      {c.tagline}
                    </Text>
                  </View>
                  <ArrowRight color={colors.textSecondary} size={18} />
                </Pressable>
              ))}
            </View>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).duration(500)} style={{ marginTop: 20 }}>
          <Text style={[type.caption, { color: colors.textSecondary, marginBottom: 10 }]}>SKILLS TO GROW</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {skills.slice(0, 3).map((s) => (
              <View key={s.id} style={[styles.softTag, { backgroundColor: colors.primarySoft, borderRadius: 999 }]}>
                <Text style={[type.small, { color: colors.primary, fontWeight: '700' }]}>
                  {s.emoji} {s.name}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <View style={{ marginTop: 32 }}>
          <Pressable
            testID="growth-profile-continue"
            onPress={() => router.replace('/mission/first')}
            style={({ pressed }) => [
              styles.primaryBtn,
              { backgroundColor: colors.primary, borderRadius: radius.lg, transform: [{ scale: pressed ? 0.98 : 1 }] },
            ]}
          >
            <Text style={styles.primaryBtnText}>Start your first mission</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  header: { height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroCard: {
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 8,
  },
  heroInner: { padding: 28, gap: 12 },
  heroBrand: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  heroName: { color: '#fff', fontSize: 32, fontWeight: '800', letterSpacing: -0.5, marginTop: 4 },
  heroHeadline: { color: 'rgba(255,255,255,0.95)', fontSize: 20, fontWeight: '600', lineHeight: 28, marginTop: 4 },
  heroTagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  heroTag: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6,
  },
  heroTagText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  heroFooter: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 24,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', paddingTop: 16,
  },
  heroFooterText: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  softTag: { paddingHorizontal: 12, paddingVertical: 6 },
  matchRow: {
    borderWidth: 1, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  primaryBtn: { paddingVertical: 18, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});

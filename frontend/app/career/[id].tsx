// Career detail — rich view with "day in the life", skills, and starter mission.

import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, Sparkles } from 'lucide-react-native';

import { useTheme } from '@/src/theme/ThemeContext';
import { api, Career } from '@/src/api/client';

export default function CareerDetail() {
  const { colors, spacing, radius, type } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [career, setCareer] = useState<Career | null>(null);

  useEffect(() => {
    if (!id) return;
    api.getCareer(String(id)).then(setCareer).catch(() => {});
  }, [id]);

  if (!career) {
    return (
      <SafeAreaView style={[styles.wrap, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  const gradient = (
    career.category === 'ai' ? [colors.secondary, colors.accent] :
    career.category === 'creative' ? [colors.achievement, colors.primary] :
    career.category === 'modern' ? [colors.primary, colors.secondary] :
    [colors.accent, colors.primary]
  );

  return (
    <SafeAreaView style={[styles.wrap, { backgroundColor: colors.background }]} edges={['top']} testID="career-detail">
      <View style={[styles.header, { paddingHorizontal: spacing.lg }]}>
        <Pressable testID="career-back-btn" onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft color={colors.textPrimary} size={24} strokeWidth={2.2} />
        </Pressable>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <Animated.View entering={FadeInDown.duration(500)} style={{ marginHorizontal: spacing.lg }}>
          <View style={[styles.hero, { borderRadius: radius.lg }]}>
            <LinearGradient
              colors={gradient as any}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={{ padding: 24, alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 60 }}>{career.emoji}</Text>
              <Text style={styles.heroTitle}>{career.name}</Text>
              <Text style={styles.heroTag}>{career.tagline}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Day in the life */}
        <View style={{ padding: spacing.lg, gap: 20 }}>
          <Animated.View entering={FadeInDown.delay(150).duration(500)}>
            <Text style={[type.caption, { color: colors.textSecondary, marginBottom: 8 }]}>A DAY IN THE LIFE</Text>
            <Text style={[type.bodyLg, { color: colors.textPrimary }]}>{career.day_in_life}</Text>
          </Animated.View>

          {/* Skills */}
          <Animated.View entering={FadeInDown.delay(250).duration(500)}>
            <Text style={[type.caption, { color: colors.textSecondary, marginBottom: 10 }]}>{"SKILLS YOU\u2019LL BUILD"}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {career.skills.map((s) => (
                <View
                  key={s}
                  style={[styles.tag, { backgroundColor: colors.primarySoft, borderRadius: 999 }]}
                >
                  <Text style={[type.small, { color: colors.primary, fontWeight: '700' }]}>{s}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Starter mission */}
          <Animated.View entering={FadeInDown.delay(350).duration(500)}>
            <Text style={[type.caption, { color: colors.textSecondary, marginBottom: 10 }]}>YOUR STARTER MISSION</Text>
            <View
              style={[
                styles.missionCard,
                { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg },
              ]}
            >
              <Sparkles color={colors.primary} size={22} strokeWidth={2.4} />
              <Text style={[type.bodyLg, { color: colors.textPrimary, flex: 1 }]}>
                {career.starter_mission}
              </Text>
            </View>
          </Animated.View>

          {/* Ask Nova */}
          <Animated.View entering={FadeInDown.delay(450).duration(500)}>
            <Pressable
              testID="career-ask-nova"
              onPress={() => router.push({ pathname: '/nova', params: { prefill: `Tell me more about being a ${career.name.toLowerCase()}` } })}
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: colors.primary, borderRadius: radius.lg, transform: [{ scale: pressed ? 0.98 : 1 }] },
              ]}
            >
              <Text style={styles.primaryBtnText}>Ask Nova about this</Text>
            </Pressable>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  header: { height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hero: {
    overflow: 'hidden', marginTop: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.18, shadowRadius: 18, elevation: 6,
  },
  heroTitle: { color: '#fff', fontSize: 32, fontWeight: '800', letterSpacing: -0.5, marginTop: 12 },
  heroTag: { color: 'rgba(255,255,255,0.95)', fontSize: 16, fontWeight: '500', marginTop: 6, lineHeight: 22 },
  tag: { paddingHorizontal: 12, paddingVertical: 6 },
  missionCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderWidth: 1, padding: 18 },
  primaryBtn: { paddingVertical: 18, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});

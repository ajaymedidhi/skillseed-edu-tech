// Mission completion — celebrates trait growth + emotional milestones instead of XP.

import { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, {
  FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import NovaOrb from '@/src/components/NovaOrb';
import { useTheme } from '@/src/theme/ThemeContext';

const { width: W, height: H } = Dimensions.get('window');

const CONFETTI = Array.from({ length: 22 }).map((_, i) => ({
  id: i,
  x: Math.random() * W,
  color: ['#10B981', '#6366F1', '#38BDF8', '#FBBF24'][i % 4],
  delay: Math.random() * 400,
}));

function ConfettiPiece({ x, color, delay }: { x: number; color: string; delay: number }) {
  const ty = useSharedValue(-40);
  const rot = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 200 }));
    ty.value = withDelay(delay, withTiming(H * 0.6 + Math.random() * H * 0.3, { duration: 1400 }));
    rot.value = withDelay(delay, withTiming(360 + Math.random() * 360, { duration: 1400 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: ty.value }, { rotateZ: `${rot.value}deg` }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x,
          top: 0,
          width: 10,
          height: 14,
          borderRadius: 3,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

const TRAIT_META: Record<string, { name: string; emoji: string; color: string }> = {
  curiosity:     { name: 'Curiosity',     emoji: '🔭', color: '#38BDF8' },
  creativity:    { name: 'Creativity',    emoji: '🎨', color: '#F472B6' },
  confidence:    { name: 'Confidence',    emoji: '✨', color: '#FBBF24' },
  communication: { name: 'Communication', emoji: '🗣️', color: '#10B981' },
  leadership:    { name: 'Leadership',    emoji: '🧭', color: '#6366F1' },
  resilience:    { name: 'Resilience',    emoji: '🌱', color: '#A855F7' },
};

export default function MissionComplete() {
  const { colors, spacing, radius, type } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{
    title?: string; emoji?: string; traits?: string; milestones?: string; reflection?: string;
  }>();

  const traitDeltas: Record<string, number> = params.traits ? JSON.parse(String(params.traits)) : {};
  const milestones: { trait_id: string; trait_name: string; trait_emoji: string; level: number; message: string }[] =
    params.milestones ? JSON.parse(String(params.milestones)) : [];
  const reflection = params.reflection ? String(params.reflection) : null;

  useEffect(() => {
    (async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {}), 250);
    })();
  }, []);

  const scale = useSharedValue(0.3);
  useEffect(() => {
    scale.value = withDelay(400, withSpring(1, { damping: 8, stiffness: 160 }));
  }, []);
  const scaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const hasMilestone = milestones.length > 0;

  return (
    <SafeAreaView style={[styles.wrap, { backgroundColor: colors.background }]} edges={['top', 'bottom']} testID="mission-complete-screen">
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {CONFETTI.map((c) => <ConfettiPiece key={c.id} x={c.x} color={c.color} delay={c.delay} />)}
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 24 }}>
        <View style={styles.headerBlock}>
          <Animated.View entering={FadeIn.duration(500)}>
            <NovaOrb size={170} state="celebrating" />
          </Animated.View>

          <Animated.Text
            entering={FadeInDown.delay(150).duration(500)}
            style={[type.caption, { color: colors.primary, marginTop: 20 }]}
          >
            {hasMilestone ? 'A MILESTONE' : 'YOU JUST GREW'}
          </Animated.Text>

          <Animated.Text
            entering={FadeInDown.delay(250).duration(500)}
            style={[type.h1, { color: colors.textPrimary, textAlign: 'center', paddingHorizontal: 20, marginTop: 8 }]}
          >
            {params.emoji || '🌱'}  {params.title || 'You grew today'}
          </Animated.Text>
        </View>

        {/* Milestone hero (if any) */}
        {hasMilestone ? (
          <Animated.View style={[styles.milestoneCard, scaleStyle, { backgroundColor: colors.primary, borderRadius: radius.lg }]}>
            <Text style={{ fontSize: 40 }}>{milestones[0].trait_emoji}</Text>
            <Text style={styles.milestoneLevel}>{milestones[0].trait_name.toUpperCase()} · LEVEL {milestones[0].level}</Text>
            <Text style={styles.milestoneMsg}>{milestones[0].message}</Text>
          </Animated.View>
        ) : null}

        {/* Trait boosts */}
        {Object.keys(traitDeltas).length > 0 ? (
          <Animated.View entering={FadeInDown.delay(400).duration(500)} style={{ marginTop: 24 }}>
            <Text style={[type.caption, { color: colors.textSecondary, marginBottom: 12, textAlign: 'center' }]}>
              WHAT GREW IN YOU
            </Text>
            <View style={{ gap: 10 }}>
              {Object.entries(traitDeltas).map(([tid, delta]) => {
                const meta = TRAIT_META[tid];
                if (!meta || delta <= 0) return null;
                return (
                  <View
                    key={tid}
                    style={[
                      styles.traitRow,
                      { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md },
                    ]}
                  >
                    <Text style={{ fontSize: 26 }}>{meta.emoji}</Text>
                    <Text style={[type.bodyLg, { color: colors.textPrimary, flex: 1, fontWeight: '600' }]}>
                      {meta.name}
                    </Text>
                    <View style={[styles.deltaPill, { backgroundColor: meta.color }]}>
                      <Text style={styles.deltaPillText}>+{delta}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </Animated.View>
        ) : null}

        {/* Reflection prompt from Nova */}
        {reflection ? (
          <Animated.View
            entering={FadeInDown.delay(550).duration(500)}
            style={[styles.reflection, { backgroundColor: colors.secondarySoft, borderRadius: radius.lg }]}
          >
            <Text style={[type.caption, { color: colors.secondary }]}>NOVA ASKS</Text>
            <Text style={[type.bodyLg, { color: colors.textPrimary, marginTop: 8 }]}>
              {reflection}
            </Text>
            <Pressable
              testID="mission-complete-reflect"
              onPress={() => router.replace({ pathname: '/nova', params: { prefill: reflection } })}
              style={({ pressed }) => [
                styles.reflectBtn,
                { backgroundColor: colors.secondary, borderRadius: 999, transform: [{ scale: pressed ? 0.98 : 1 }] },
              ]}
            >
              <Text style={styles.reflectBtnText}>Tell Nova</Text>
            </Pressable>
          </Animated.View>
        ) : (
          <Animated.Text
            entering={FadeInDown.delay(550).duration(500)}
            style={[type.body, { color: colors.textSecondary, textAlign: 'center', paddingHorizontal: 24, marginTop: 24 }]}
          >
            Your seed just grew a little taller. Keep going — this is how great skills are planted.
          </Animated.Text>
        )}
      </ScrollView>

      <View style={{ padding: spacing.lg, gap: 10 }}>
        <Pressable
          testID="mission-complete-continue"
          onPress={() => router.replace('/(tabs)/grow')}
          style={({ pressed }) => [
            styles.primaryBtn,
            { backgroundColor: colors.primary, borderRadius: radius.lg, transform: [{ scale: pressed ? 0.98 : 1 }] },
          ]}
        >
          <Text style={styles.primaryBtnText}>See my growth</Text>
        </Pressable>
        <Pressable
          testID="mission-complete-home"
          onPress={() => router.replace('/(tabs)')}
          style={({ pressed }) => ({ paddingVertical: 12, alignItems: 'center', opacity: pressed ? 0.6 : 1 })}
        >
          <Text style={[type.small, { color: colors.textSecondary, fontWeight: '600' }]}>Back to home</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  headerBlock: { alignItems: 'center', paddingTop: 12 },

  milestoneCard: {
    marginTop: 24, padding: 24, alignItems: 'center',
    shadowColor: '#10B981', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.35, shadowRadius: 20, elevation: 8,
  },
  milestoneLevel: { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginTop: 10 },
  milestoneMsg: { color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center', marginTop: 8, lineHeight: 24, letterSpacing: -0.2 },

  traitRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 14, borderWidth: 1,
  },
  deltaPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  deltaPillText: { color: '#fff', fontSize: 13, fontWeight: '800' },

  reflection: { padding: 20, marginTop: 24 },
  reflectBtn: { alignSelf: 'flex-start', paddingHorizontal: 18, paddingVertical: 10, marginTop: 14 },
  reflectBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  primaryBtn: { paddingVertical: 18, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});

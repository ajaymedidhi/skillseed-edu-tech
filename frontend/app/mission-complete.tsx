// Mission completion celebration — the moneymaker moment.
// Nova celebrates state, particles pop, points animate up.

import { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
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

export default function MissionComplete() {
  const { colors, spacing, radius, type } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ points?: string; title?: string; emoji?: string }>();
  const points = Number(params.points || 0);

  useEffect(() => {
    // Haptic celebration
    (async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {}), 250);
    })();
  }, []);

  const pointsScale = useSharedValue(0.3);
  useEffect(() => {
    pointsScale.value = withDelay(400, withSpring(1, { damping: 8, stiffness: 160 }));
  }, []);
  const pointsStyle = useAnimatedStyle(() => ({ transform: [{ scale: pointsScale.value }] }));

  return (
    <SafeAreaView style={[styles.wrap, { backgroundColor: colors.background }]} edges={['top', 'bottom']} testID="mission-complete-screen">
      {/* Confetti layer */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {CONFETTI.map((c) => (
          <ConfettiPiece key={c.id} x={c.x} color={c.color} delay={c.delay} />
        ))}
      </View>

      <View style={styles.center}>
        <Animated.View entering={FadeIn.duration(500)}>
          <NovaOrb size={200} state="celebrating" />
        </Animated.View>

        <Animated.Text entering={FadeInDown.delay(150).duration(500)} style={[type.caption, { color: colors.primary, marginTop: 24 }]}>
          MISSION COMPLETE
        </Animated.Text>

        <Animated.Text
          entering={FadeInDown.delay(250).duration(500)}
          style={[type.h1, { color: colors.textPrimary, textAlign: 'center', paddingHorizontal: 30, marginTop: 8 }]}
        >
          {params.emoji || '🌱'}  {params.title || 'You grew today'}
        </Animated.Text>

        <Animated.View style={[styles.pointsWrap, pointsStyle]}>
          <View style={[styles.pointsPill, { backgroundColor: colors.primary, borderRadius: 999 }]}>
            <Text style={styles.pointsText}>+{points} growth points</Text>
          </View>
        </Animated.View>

        <Animated.Text entering={FadeInDown.delay(500).duration(500)} style={[type.body, { color: colors.textSecondary, textAlign: 'center', paddingHorizontal: 40, marginTop: 16 }]}>
          Your seed just grew a little taller. Keep going — this is how great skills are planted.
        </Animated.Text>
      </View>

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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pointsWrap: { marginTop: 24 },
  pointsPill: { paddingVertical: 12, paddingHorizontal: 24 },
  pointsText: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  primaryBtn: { paddingVertical: 18, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});

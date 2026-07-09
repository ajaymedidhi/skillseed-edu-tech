// Nova — the animated AI companion orb.
// States: idle (soft breathing), listening (pulse rings), thinking (rapid spin), speaking (waveform), celebrating (particles pop).
// Renderer: react-native-svg + react-native-reanimated for 60fps animations.

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  Easing,
  cancelAnimation,
  useAnimatedProps,
} from 'react-native-reanimated';
import { useTheme } from '@/src/theme/ThemeContext';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export type NovaState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'celebrating';

type Props = { size?: number; state?: NovaState };

export default function NovaOrb({ size = 220, state = 'idle' }: Props) {
  const { colors } = useTheme();
  const breath = useSharedValue(1);
  const wobbleY = useSharedValue(0);
  const ring1 = useSharedValue(0);
  const ring2 = useSharedValue(0);
  const ring3 = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scalePop = useSharedValue(1);

  // Idle breathing + gentle float — always on
  useEffect(() => {
    breath.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
        withTiming(1.0, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
    );
    wobbleY.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
        withTiming(6, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
    );
    return () => {
      cancelAnimation(breath);
      cancelAnimation(wobbleY);
    };
  }, [breath, wobbleY]);

  // Per-state animations
  useEffect(() => {
    cancelAnimation(ring1);
    cancelAnimation(ring2);
    cancelAnimation(ring3);
    cancelAnimation(rotate);

    if (state === 'listening' || state === 'speaking') {
      ring1.value = 0;
      ring2.value = 0;
      ring3.value = 0;
      ring1.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.out(Easing.quad) }), -1, false);
      ring2.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.out(Easing.quad) }), -1, false);
      ring3.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.out(Easing.quad) }), -1, false);
      // stagger via delay implicit through withSequence
    } else if (state === 'thinking') {
      rotate.value = withRepeat(withTiming(360, { duration: 1400, easing: Easing.linear }), -1, false);
    } else if (state === 'celebrating') {
      scalePop.value = withSequence(
        withSpring(1.2, { damping: 8, stiffness: 180 }),
        withSpring(1, { damping: 10 }),
      );
    }
  }, [state, ring1, ring2, ring3, rotate, scalePop]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: wobbleY.value }, { scale: breath.value * scalePop.value }],
  }));

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${rotate.value}deg` }],
  }));

  // Halo rings props
  const ringProps1 = useAnimatedProps(() => ({
    r: (size / 2) * (0.5 + ring1.value * 0.55),
    opacity: 0.5 * (1 - ring1.value),
  } as any));
  const ringProps2 = useAnimatedProps(() => ({
    r: (size / 2) * (0.5 + ring2.value * 0.75),
    opacity: 0.35 * (1 - ring2.value),
  } as any));
  const ringProps3 = useAnimatedProps(() => ({
    r: (size / 2) * (0.5 + ring3.value * 0.95),
    opacity: 0.22 * (1 - ring3.value),
  } as any));

  const S = size;
  const cx = S / 2;
  const cy = S / 2;

  const glowA = colors.novaGlowA;
  const glowB = colors.novaGlowB;
  const glowC = colors.novaGlowC;

  return (
    <View style={[styles.wrap, { width: S, height: S }]} pointerEvents="none">
      {/* Voice rings — visible during listening/speaking */}
      {(state === 'listening' || state === 'speaking') && (
        <Svg width={S} height={S} style={StyleSheet.absoluteFill}>
          <AnimatedCircle cx={cx} cy={cy} stroke={glowB} strokeWidth={2} fill="none" animatedProps={ringProps1} />
          <AnimatedCircle cx={cx} cy={cy} stroke={glowA} strokeWidth={2} fill="none" animatedProps={ringProps2} />
          <AnimatedCircle cx={cx} cy={cy} stroke={glowC} strokeWidth={2} fill="none" animatedProps={ringProps3} />
        </Svg>
      )}

      {/* Main orb with soft gradient — breathes + floats */}
      <Animated.View style={[StyleSheet.absoluteFill, containerStyle]}>
        <Svg width={S} height={S}>
          <Defs>
            <RadialGradient id="orb" cx="50%" cy="45%" r="55%" fx="45%" fy="40%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.95} />
              <Stop offset="30%" stopColor={glowB} stopOpacity={0.9} />
              <Stop offset="65%" stopColor={glowA} stopOpacity={0.85} />
              <Stop offset="100%" stopColor={glowC} stopOpacity={0.75} />
            </RadialGradient>
            <RadialGradient id="halo" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={glowA} stopOpacity={0.35} />
              <Stop offset="100%" stopColor={glowA} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          {/* soft halo */}
          <Circle cx={cx} cy={cy} r={S * 0.48} fill="url(#halo)" />
          {/* orb */}
          <Circle cx={cx} cy={cy} r={S * 0.32} fill="url(#orb)" />
          {/* inner highlight */}
          <Circle cx={cx - S * 0.08} cy={cy - S * 0.1} r={S * 0.08} fill="#FFFFFF" opacity={0.55} />
        </Svg>
      </Animated.View>

      {/* Thinking spinner overlay */}
      {state === 'thinking' && (
        <Animated.View style={[StyleSheet.absoluteFill, rotateStyle]}>
          <Svg width={S} height={S}>
            <G>
              <Circle cx={cx + S * 0.32} cy={cy} r={5} fill={glowA} opacity={0.9} />
              <Circle cx={cx - S * 0.32} cy={cy} r={4} fill={glowB} opacity={0.7} />
              <Circle cx={cx} cy={cy + S * 0.32} r={3} fill={glowC} opacity={0.6} />
            </G>
          </Svg>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});

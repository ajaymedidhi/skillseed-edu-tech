// Trait Ring — animated circular progress ring for a single growth trait.

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue, useAnimatedProps, withTiming, Easing,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  value: number;             // 0-100
  color: string;
  size?: number;
  strokeWidth?: number;
  emoji: string;
  label: string;
  labelColor: string;
  bg: string;
};

export default function TraitRing({
  value, color, size = 100, strokeWidth = 8, emoji, label, labelColor, bg,
}: Props) {
  const clamped = Math.max(0, Math.min(100, value || 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(clamped / 100, { duration: 1000, easing: Easing.out(Easing.cubic) });
  }, [clamped, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  } as any));

  return (
    <View style={[styles.wrap, { width: size + 20 }]}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
          <Circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke={bg} strokeWidth={strokeWidth} fill="none"
          />
          <AnimatedCircle
            cx={size / 2} cy={size / 2} r={radius}
            stroke={color} strokeWidth={strokeWidth} fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            animatedProps={animatedProps}
            strokeLinecap="round"
          />
        </Svg>
        <View style={StyleSheet.absoluteFillObject}>
          <View style={styles.center}>
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={[styles.value, { color: labelColor }]}>{Math.round(clamped)}</Text>
          </View>
        </View>
      </View>
      <Text style={[styles.label, { color: labelColor }]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 6 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 22, marginBottom: 2 },
  value: { fontSize: 14, fontWeight: '800' },
  label: { fontSize: 12, fontWeight: '700', letterSpacing: 0.2 },
});

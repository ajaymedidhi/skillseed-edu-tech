import { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';

import NovaOrb from '@/src/components/NovaOrb';
import { useProfile } from '@/src/state/profile';
import { useTheme } from '@/src/theme/ThemeContext';

export default function Index() {
  const router = useRouter();
  const { profile, loading } = useProfile();
  const { colors } = useTheme();

  useEffect(() => {
    if (loading) return;
    const t = setTimeout(() => {
      if (profile?.onboarded) router.replace('/(tabs)');
      else router.replace('/onboarding');
    }, 1400);
    return () => clearTimeout(t);
  }, [loading, profile, router]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} testID="splash-screen">
      <Animated.View entering={FadeIn.duration(600)} style={styles.center}>
        <NovaOrb size={180} state="idle" />
        <Text style={[styles.title, { color: colors.textPrimary }]}>SkillSeed</Text>
        <Text style={[styles.tag, { color: colors.textSecondary }]}>
          Planting Skills. Growing Futures.
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center', gap: 24 },
  title: { fontSize: 34, fontWeight: '800', letterSpacing: -0.8 },
  tag: { fontSize: 15, fontWeight: '500' },
});

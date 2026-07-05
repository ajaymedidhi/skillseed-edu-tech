import { useEffect } from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

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
    }, 1600);
    return () => clearTimeout(t);
  }, [loading, profile, router]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} testID="splash-screen">
      <Animated.View entering={FadeIn.duration(700)} style={styles.center}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Animated.Text entering={FadeInUp.delay(300).duration(600)} style={[styles.title, { color: colors.textPrimary }]}>
          SkillSeed
        </Animated.Text>
        <Animated.Text entering={FadeInUp.delay(450).duration(600)} style={[styles.tag, { color: colors.textSecondary }]}>
          Planting Skills. Growing Futures.
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center', gap: 20 },
  logo: { width: 160, height: 160 },
  title: { fontSize: 36, fontWeight: '800', letterSpacing: -0.8 },
  tag: { fontSize: 15, fontWeight: '500' },
});

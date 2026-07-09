// Journey — visualizes the student's progress through chapters.

import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Check, Lock } from 'lucide-react-native';

import { useTheme } from '@/src/theme/ThemeContext';
import { useProfile } from '@/src/state/profile';

const CHAPTERS = [
  { id: '1', title: 'Discover Yourself', emoji: '🌱', description: 'Find out what makes you tick.', status: 'completed' },
  { id: '2', title: 'Meet AI', emoji: '🤖', description: 'Learn to use Nova as your co-pilot.', status: 'active' },
  { id: '3', title: 'Explore Careers', emoji: '🚀', description: 'See where your skills can take you.', status: 'locked' },
  { id: '4', title: 'Build Projects', emoji: '🎨', description: 'Create something real.', status: 'locked' },
  { id: '5', title: 'Future Ready', emoji: '🌍', description: 'Prepare for the world.', status: 'locked' },
];

export default function Journey() {
  const { colors, spacing, radius, type } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile } = useProfile();

  return (
    <SafeAreaView style={[styles.wrap, { backgroundColor: colors.background }]} edges={['top']} testID="journey-screen">
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 120 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[type.small, { color: colors.textSecondary, letterSpacing: 1 }]}>JOURNEY</Text>
        <Text style={[type.h1, { color: colors.textPrimary, marginTop: 2 }]}>Your Chapters</Text>
        <Text style={[type.body, { color: colors.textSecondary, marginTop: 8, marginBottom: 24 }]}>
          Every great story happens one chapter at a time.
        </Text>

        <View style={styles.timeline}>
          <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
          
          {CHAPTERS.map((ch, i) => (
            <Animated.View key={ch.id} entering={FadeInDown.delay(i * 100).duration(500)} style={styles.chapterNode}>
              <View style={[
                styles.chapterIcon, 
                { 
                  backgroundColor: ch.status === 'completed' ? colors.primary : ch.status === 'active' ? colors.surface : colors.surfaceMuted,
                  borderColor: ch.status === 'active' ? colors.primary : colors.border
                }
              ]}>
                {ch.status === 'completed' ? (
                  <Check color="#fff" size={20} strokeWidth={3} />
                ) : ch.status === 'locked' ? (
                  <Lock color={colors.textTertiary} size={20} strokeWidth={2.5} />
                ) : (
                  <Text style={{ fontSize: 24 }}>{ch.emoji}</Text>
                )}
              </View>

              <Pressable 
                style={({pressed}) => [
                  styles.chapterCard, 
                  { 
                    backgroundColor: colors.surface, 
                    borderColor: ch.status === 'active' ? colors.primary : colors.border,
                    opacity: ch.status === 'locked' ? 0.6 : 1,
                    transform: [{scale: pressed && ch.status !== 'locked' ? 0.98 : 1}]
                  }
                ]}
                onPress={() => {
                  if (ch.status === 'active') {
                    // Navigate to current chapter overview or continue
                  }
                }}
              >
                <Text style={[type.caption, { color: ch.status === 'active' ? colors.primary : colors.textSecondary, marginBottom: 4 }]}>
                  CHAPTER {i + 1}
                </Text>
                <Text style={[type.h3, { color: colors.textPrimary }]}>{ch.title}</Text>
                <Text style={[type.small, { color: colors.textSecondary, marginTop: 4 }]}>{ch.description}</Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  timeline: {
    position: 'relative',
    paddingLeft: 24,
    marginTop: 10,
  },
  timelineLine: {
    position: 'absolute',
    left: 48,
    top: 20,
    bottom: 20,
    width: 2,
  },
  chapterNode: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  chapterIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  chapterCard: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
  }
});

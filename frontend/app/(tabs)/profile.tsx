// Profile / You — shows name, growth profile summary if any, and settings.

import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronRight, RotateCcw, Sparkles, Flame } from 'lucide-react-native';

import { useTheme } from '@/src/theme/ThemeContext';
import { useProfile } from '@/src/state/profile';

export default function ProfileScreen() {
  const { colors, spacing, radius, type } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile } = useProfile();

  return (
    <SafeAreaView style={[styles.wrap, { backgroundColor: colors.background }]} edges={['top']} testID="profile-screen">
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 120 + insets.bottom }}
      >
        <Text style={[type.small, { color: colors.textSecondary, letterSpacing: 1 }]}>YOU</Text>
        <Text style={[type.h1, { color: colors.textPrimary, marginTop: 2 }]}>
          {profile?.name || 'friend'}
        </Text>
        {profile?.learning_style ? (
          <Text style={[type.body, { color: colors.textSecondary, marginTop: 6 }]}>
            {profile.learning_style} learner
          </Text>
        ) : null}

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.stat, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md }]}>
            <Flame color={colors.achievement} size={18} strokeWidth={2.5} />
            <Text style={[type.h2, { color: colors.textPrimary, marginTop: 2 }]}>{profile?.streak ?? 0}</Text>
            <Text style={[type.small, { color: colors.textSecondary }]}>streak</Text>
          </View>
          <View style={[styles.stat, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md }]}>
            <Sparkles color={colors.primary} size={18} strokeWidth={2.5} />
            <Text style={[type.h2, { color: colors.textPrimary, marginTop: 2 }]}>{profile?.growth_points ?? 0}</Text>
            <Text style={[type.small, { color: colors.textSecondary }]}>growth pts</Text>
          </View>
        </View>

        {/* Growth Profile card */}
        {profile?.growth_profile_summary ? (
          <Pressable
            testID="profile-view-growth"
            onPress={() => router.push('/growth-profile')}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: colors.secondarySoft,
                borderRadius: radius.lg,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            <Text style={[type.caption, { color: colors.secondary }]}>YOUR GROWTH PROFILE</Text>
            <Text style={[type.h3, { color: colors.textPrimary, marginTop: 8 }]} numberOfLines={3}>
              {profile.growth_profile_summary}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 6 }}>
              <Text style={[type.small, { color: colors.secondary, fontWeight: '700' }]}>View full profile</Text>
              <ChevronRight color={colors.secondary} size={16} />
            </View>
          </Pressable>
        ) : (
          <Pressable
            testID="profile-start-discover"
            onPress={() => router.push('/discover')}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: colors.primarySoft,
                borderRadius: radius.lg,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            <Text style={[type.caption, { color: colors.primary }]}>NEXT STEP</Text>
            <Text style={[type.h3, { color: colors.textPrimary, marginTop: 8 }]}>
              Discover your Growth Profile
            </Text>
            <Text style={[type.small, { color: colors.textSecondary, marginTop: 6 }]}>
              A 60-second chat with Nova to figure out who you are.
            </Text>
          </Pressable>
        )}

        {/* Interests */}
        {profile?.interests?.length ? (
          <View style={{ marginTop: 20 }}>
            <Text style={[type.caption, { color: colors.textSecondary, marginBottom: 10 }]}>INTERESTS</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {profile.interests.map((i) => (
                <View
                  key={i}
                  style={[
                    styles.tag,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <Text style={[type.small, { color: colors.textPrimary }]}>{i}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Redo Discover */}
        <Pressable
          testID="profile-redo-discover"
          onPress={() => router.push('/discover')}
          style={({ pressed }) => [
            styles.row,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.md,
              transform: [{ scale: pressed ? 0.98 : 1 }],
              marginTop: 20,
            },
          ]}
        >
          <RotateCcw color={colors.textSecondary} size={18} strokeWidth={2.4} />
          <Text style={[type.bodyLg, { color: colors.textPrimary, flex: 1 }]}>Retake Discovery</Text>
          <ChevronRight color={colors.textSecondary} size={18} />
        </Pressable>

        <View style={{ alignItems: 'center', marginTop: 32 }}>
          <Text style={[type.small, { color: colors.textTertiary }]}>SkillSeed · v1.0</Text>
          <Text style={[type.small, { color: colors.textTertiary, marginTop: 4 }]}>Planting Skills. Growing Futures.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  stat: { flex: 1, borderWidth: 1, padding: 16 },
  card: { padding: 20, marginTop: 20 },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderRadius: 999 },
  row: {
    borderWidth: 1, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
});

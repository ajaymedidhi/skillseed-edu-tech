// Home — Nova's daily guidance. Not a dashboard.
// Top priority is a conversational introduction to Today's Mission.

import { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'react-native-router-flux';
// Wait, Expo router! 
import { useRouter as useExpoRouter, useFocusEffect as useExpoFocus } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Mic, ArrowRight, MessageCircle, Route, Compass, Target } from 'lucide-react-native';

import NovaOrb from '@/src/components/NovaOrb';
import { useTheme } from '@/src/theme/ThemeContext';
import { useProfile } from '@/src/state/profile';
import { api, Mission, NovaDailyBrief } from '@/src/api/client';

export default function Home() {
  const { colors, spacing, radius, type } = useTheme();
  const router = useExpoRouter();
  const { profile, deviceId } = useProfile();
  const insets = useSafeAreaInsets();

  const [brief, setBrief] = useState<NovaDailyBrief | null>(null);
  const [briefLoading, setBriefLoading] = useState(true);
  const [mission, setMission] = useState<Mission | null>(null);

  const loadBrief = useCallback(async (force = false) => {
    if (!deviceId) return;
    setBriefLoading(true);
    try {
      const b = await api.novaDaily(deviceId, force);
      setBrief(b);
      if (b.mission_id) {
        const m = await api.getMission(b.mission_id, deviceId);
        setMission(m);
      } else {
        // Fallback to fetch any mission
        const res = await api.listMissions(deviceId);
        const m = res.items.find(x => !x.completed);
        if (m) setMission(m);
      }
    } catch (e) {
      // fail-soft
    } finally {
      setBriefLoading(false);
    }
  }, [deviceId]);

  useEffect(() => { loadBrief(false); }, [loadBrief]);
  useExpoFocus(useCallback(() => { loadBrief(false); }, [loadBrief]));

  const openNova = (prefill?: string) => {
    router.push({ pathname: '/nova', params: prefill ? { prefill } : {} });
  };

  const handleMissionPress = () => {
    if (!mission) return;
    // Launch directly into AI lab if it's a creation mission (mock logic for now based on title)
    if (mission.title.toLowerCase().includes('spark') || mission.title.toLowerCase().includes('create')) {
      router.push(`/ai-lab/mission/${mission.id}/create`);
    } else {
      router.push(`/mission/${mission.id}`);
    }
  };

  return (
    <SafeAreaView style={[styles.wrap, { backgroundColor: colors.background }]} edges={['top']} testID="home-screen">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.topBar, { paddingHorizontal: spacing.lg }]}>
          <Image source={require('../../assets/images/logo.png')} style={styles.brandLogo} />
        </View>

        {/* 1 & 2. Nova's Greeting & Today's Mission */}
        <Animated.View entering={FadeIn.duration(500)} style={{ paddingHorizontal: spacing.lg, marginTop: 8 }}>
          <View style={[styles.novaCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
            
            <View style={styles.novaHeader}>
              <NovaOrb size={70} state="idle" />
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={[type.h2, { color: colors.textPrimary }]}>
                  {briefLoading ? 'Thinking...' : brief?.greeting || `Hi ${profile?.name || 'friend'}.`}
                </Text>
              </View>
            </View>

            <View style={{ padding: 20 }}>
              <Text style={[type.bodyLg, { color: colors.textSecondary, marginBottom: 24, lineHeight: 24 }]}>
                {briefLoading 
                  ? 'I am preparing something for you today.' 
                  : (mission ? `I've prepared a mission specifically for you today. ${mission.description}` : 'You have no active missions right now. Talk to me to explore more!')
                }
              </Text>

              {mission && (
                <Pressable
                  onPress={handleMissionPress}
                  style={({ pressed }) => [
                    styles.missionBtn,
                    { backgroundColor: colors.primary, borderRadius: radius.lg, transform: [{ scale: pressed ? 0.98 : 1 }] }
                  ]}
                >
                  <Text style={{ fontSize: 24 }}>{mission.emoji}</Text>
                  <Text style={[type.bodyLg, { color: '#fff', fontWeight: '700', marginLeft: 12 }]}>Start Today's Mission</Text>
                </Pressable>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Action Menu (Hierarchical) */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: 24, gap: 12 }}>
          
          {/* 3. Continue Journey */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <Pressable
              onPress={() => router.push('/(tabs)/journey')}
              style={({ pressed }) => [styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
            >
              <View style={[styles.iconBox, { backgroundColor: colors.primarySoft }]}>
                <Route color={colors.primary} size={20} strokeWidth={2.5} />
              </View>
              <Text style={[type.bodyLg, { color: colors.textPrimary, flex: 1, fontWeight: '600' }]}>Continue Journey</Text>
              <ArrowRight color={colors.textSecondary} size={18} />
            </Pressable>
          </Animated.View>

          {/* 4. Talk with Nova */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Pressable
              onPress={() => openNova()}
              style={({ pressed }) => [styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
            >
              <View style={[styles.iconBox, { backgroundColor: colors.secondarySoft }]}>
                <MessageCircle color={colors.secondary} size={20} strokeWidth={2.5} />
              </View>
              <Text style={[type.bodyLg, { color: colors.textPrimary, flex: 1, fontWeight: '600' }]}>Talk with Nova</Text>
              <ArrowRight color={colors.textSecondary} size={18} />
            </Pressable>
          </Animated.View>

          {/* 5. Explore Careers */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <Pressable
              onPress={() => router.push('/(tabs)/explore')}
              style={({ pressed }) => [styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
            >
              <View style={[styles.iconBox, { backgroundColor: colors.surfaceMuted }]}>
                <Compass color={colors.textPrimary} size={20} strokeWidth={2.5} />
              </View>
              <Text style={[type.bodyLg, { color: colors.textPrimary, flex: 1, fontWeight: '600' }]}>Explore Careers</Text>
              <ArrowRight color={colors.textSecondary} size={18} />
            </Pressable>
          </Animated.View>

          {/* 6. My Progress */}
          <Animated.View entering={FadeInDown.delay(400).duration(400)}>
            <Pressable
              onPress={() => router.push('/(tabs)/profile')}
              style={({ pressed }) => [styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
            >
              <View style={[styles.iconBox, { backgroundColor: colors.surfaceMuted }]}>
                <Target color={colors.textPrimary} size={20} strokeWidth={2.5} />
              </View>
              <Text style={[type.bodyLg, { color: colors.textPrimary, flex: 1, fontWeight: '600' }]}>My Progress</Text>
              <ArrowRight color={colors.textSecondary} size={18} />
            </Pressable>
          </Animated.View>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  topBar: {
    paddingTop: 8, paddingBottom: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  brandLogo: { width: 36, height: 36 },

  novaCard: {
    borderWidth: 1, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 18, elevation: 3,
  },
  novaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  missionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  }
});

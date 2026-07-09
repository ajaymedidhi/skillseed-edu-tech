import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Sparkles, ArrowRight, Star, Palette, BookOpen, Music, Video, Zap, Shield, Briefcase, Wand2 } from 'lucide-react-native';
import { useTheme } from '@/src/theme/ThemeContext';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function NovaStudioTab() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Mock User Progress
  const userLevel = "Explorer";
  const experimentsCompleted = 12;

  const worlds = [
    {
      id: 'world-1',
      title: 'World 1: Meet AI',
      color: '#6366F1', // Indigo
      icon: <Zap color="#FFF" size={24} />,
      missions: ['What is AI?', 'AI Around You', 'AI Myths']
    },
    {
      id: 'world-2',
      title: 'World 2: Create with AI',
      color: '#EC4899', // Pink
      icon: <Palette color="#FFF" size={24} />,
      missions: ['Images', 'Stories', 'Music', 'Videos', 'Comics']
    },
    {
      id: 'world-3',
      title: 'World 3: Prompting',
      color: '#10B981', // Emerald
      icon: <Wand2 color="#FFF" size={24} />,
      missions: ['Beginner Prompts', 'Better Prompts', 'Creative Prompts']
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100 },
        ]}
      >
        {/* HERO SECTION */}
        <Animated.View entering={FadeInUp.duration(600)} style={styles.hero}>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Nova Studio</Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            Create. Experiment. Build with AI.
          </Text>

          <View style={[styles.statsContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Level</Text>
              <Text style={[styles.statValue, { color: colors.primary }]}>{userLevel}</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Creations</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{experimentsCompleted}</Text>
            </View>
          </View>
        </Animated.View>

        {/* TODAY'S MISSION */}
        <Animated.View entering={FadeInUp.duration(600).delay(200)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Mission</Text>
          <TouchableOpacity 
            style={[styles.dailyCard, { backgroundColor: '#4F46E5' }]} // Vibrant purple/indigo
            onPress={() => router.push(`/nova-studio/mission/daily/discover`)}
          >
            <View style={styles.dailyCardHeader}>
              <View style={styles.dailyBadge}>
                <Star color="#F59E0B" size={14} fill="#F59E0B" />
                <Text style={styles.dailyBadgeText}>Daily Challenge</Text>
              </View>
              <Text style={styles.dailyTime}>5 min</Text>
            </View>
            
            <Text style={styles.dailyTitle}>Design your dream classroom</Text>
            <Text style={styles.dailyDesc}>Use AI image generation to completely reimagine where you learn.</Text>
            
            <View style={styles.dailyFooter}>
              <View style={styles.careerBadge}>
                <Text style={styles.careerText}>Career: AI Architect</Text>
              </View>
              <View style={styles.playButton}>
                <ArrowRight color="#4F46E5" size={20} />
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* AI SANDBOX */}
        <Animated.View entering={FadeInUp.duration(600).delay(300)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>AI Sandbox</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>Freely experiment and create anything.</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sandboxScroll}>
            {['Generate Images', 'Write Stories', 'Brainstorm', 'Summarize'].map((item, index) => (
              <TouchableOpacity key={index} style={[styles.sandboxItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Wand2 color={colors.primary} size={24} style={{ marginBottom: 8 }} />
                <Text style={[styles.sandboxText, { color: colors.text }]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* LEARNING PATHS (WORLDS) */}
        <Animated.View entering={FadeInUp.duration(600).delay(400)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Learning Paths</Text>
          
          {worlds.map((world, index) => (
            <View key={world.id} style={[styles.worldCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.worldHeader}>
                <View style={[styles.worldIcon, { backgroundColor: world.color }]}>
                  {world.icon}
                </View>
                <Text style={[styles.worldTitle, { color: colors.text }]}>{world.title}</Text>
              </View>
              
              <View style={styles.missionList}>
                {world.missions.map((mission, mIndex) => (
                  <TouchableOpacity 
                    key={mIndex} 
                    style={[styles.missionItem, { borderBottomColor: mIndex === world.missions.length - 1 ? 'transparent' : colors.border }]}
                    onPress={() => router.push(`/nova-studio/mission/${world.id}-${mIndex}/discover`)}
                  >
                    <Text style={[styles.missionText, { color: colors.text }]}>{mission}</Text>
                    <ArrowRight color={colors.textTertiary} size={16} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  hero: {
    marginBottom: 32,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 18,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: '100%',
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  dailyCard: {
    borderRadius: 24,
    padding: 24,
    marginTop: 12,
  },
  dailyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dailyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dailyBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  dailyTime: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '600',
  },
  dailyTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  dailyDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  dailyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  careerBadge: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  careerText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sandboxScroll: {
    paddingRight: 24,
    gap: 12,
  },
  sandboxItem: {
    width: 120,
    height: 120,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  sandboxText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  worldCard: {
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  worldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.02)', // slight tint
  },
  worldIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  worldTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  missionList: {
    paddingHorizontal: 16,
  },
  missionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  missionText: {
    fontSize: 15,
    fontWeight: '500',
  },
});

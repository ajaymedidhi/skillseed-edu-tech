import React, { useEffect, useContext, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Lightbulb, ArrowRight, Sparkles } from 'lucide-react-native';
import { useTheme } from '@/src/theme/ThemeContext';
import { MissionContext } from '../_layout';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { missionData } from '@/src/data/missionData';

export default function DiscoverStep() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { setNovaMessage } = useContext(MissionContext);

  const mission = useMemo(() => {
    const key = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : 'default';
    return missionData[key] || missionData['default'];
  }, [id]);

  useEffect(() => {
    setNovaMessage(mission.discover.nova);
  }, [mission]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
          <Lightbulb color={colors.primary} size={48} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{mission.title}</Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(600).delay(200)} style={styles.chatBubbleContainer}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Sparkles color="#FFF" size={20} />
        </View>
        <View style={[styles.chatBubble, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.chatText, { color: colors.text }]}>
            {mission.discover.chat1}
          </Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(600).delay(400)} style={styles.chatBubbleContainer}>
        <View style={[styles.avatar, { backgroundColor: 'transparent' }]} />
        <View style={[styles.chatBubble, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.chatText, { color: colors.text }]}>
            {mission.discover.chat2}
          </Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(600).delay(600)} style={{ marginTop: 24, width: '100%' }}>
        <TouchableOpacity 
          style={[styles.nextButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push(`/nova-studio/mission/${id}/try`)}
        >
          <Text style={styles.nextButtonText}>Let's Experiment</Text>
          <ArrowRight color="#FFF" size={20} />
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 150,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  chatBubbleContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  chatBubble: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    borderTopLeftRadius: 4,
    borderWidth: 1,
  },
  chatText: {
    fontSize: 16,
    lineHeight: 24,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    width: '100%',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
});

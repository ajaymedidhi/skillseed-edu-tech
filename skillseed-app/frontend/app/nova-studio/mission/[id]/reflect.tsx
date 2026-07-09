import React, { useEffect, useContext, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CheckCircle2, Briefcase, Home, Send } from 'lucide-react-native';
import { useTheme } from '@/src/theme/ThemeContext';
import { MissionContext } from '../_layout';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { missionData } from '@/src/data/missionData';

export default function ReflectStep() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { setNovaMessage } = useContext(MissionContext);

  const mission = useMemo(() => {
    const key = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : 'default';
    return missionData[key] || missionData['default'];
  }, [id]);

  const [reflection, setReflection] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setNovaMessage("What surprised you today? Did the AI give you what you expected?");
  }, [id]);

  const careerName = mission.reflect.career;

  const handleSubmit = () => {
    if (reflection.trim()) {
      setSubmitted(true);
      setNovaMessage("That's a great insight! Reflection is how we truly grow. You've completed today's mission.");
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: colors.success + '20' }]}>
          <CheckCircle2 color={colors.success} size={48} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Mission Complete!</Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(600).delay(200)} style={[styles.card, { backgroundColor: colors.primary, borderColor: colors.primary }]}>
        <View style={styles.cardHeader}>
          <Briefcase color="#FFF" size={24} />
          <Text style={[styles.cardTitle, { color: '#FFF' }]}>Career Connection</Text>
        </View>
        
        <Text style={[styles.body, { color: 'rgba(255,255,255,0.9)' }]}>
          What you just did is exactly what an <Text style={{ fontWeight: '800', color: '#FFF' }}>{careerName}</Text> does!
        </Text>
        <Text style={[styles.body, { color: 'rgba(255,255,255,0.8)', marginTop: 12 }]}>
          People in this career use these skills every day to build amazing apps, create art, and solve big problems. 
          Keep practicing, and this could be you!
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(600).delay(400)} style={[styles.reflectionBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.reflectionTitle, { color: colors.text }]}>Reflect with Nova</Text>
        
        {!submitted ? (
          <View>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              value={reflection}
              onChangeText={setReflection}
              placeholder="What surprised you the most?"
              placeholderTextColor={colors.textTertiary}
              multiline
            />
            <TouchableOpacity 
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Share Thoughts</Text>
              <Send color="#FFF" size={16} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.submittedBox, { backgroundColor: colors.success + '10' }]}>
            <Text style={[styles.submittedText, { color: colors.success }]}>Reflection Saved!</Text>
          </View>
        )}
      </Animated.View>

      {submitted && (
        <Animated.View entering={FadeInUp.duration(600)}>
          <TouchableOpacity 
            style={[styles.homeButton, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
            onPress={() => router.replace('/(tabs)/nova-studio')}
          >
            <Home color={colors.text} size={20} />
            <Text style={[styles.homeButtonText, { color: colors.text }]}>Return to Studio</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
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
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
  },
  card: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    width: '100%',
    marginBottom: 32,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginLeft: 8,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  reflectionBox: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 32,
  },
  reflectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  submitButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  submittedBox: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submittedText: {
    fontWeight: '700',
    fontSize: 16,
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 30,
    width: '100%',
    justifyContent: 'center',
  },
  homeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
});

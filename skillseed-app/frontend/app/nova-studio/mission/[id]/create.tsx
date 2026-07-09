import React, { useEffect, useContext, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Save, ArrowRight, FolderHeart, Sparkles } from 'lucide-react-native';
import { useTheme } from '@/src/theme/ThemeContext';
import { MissionContext } from '../_layout';
import Animated, { FadeInUp, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { missionData } from '@/src/data/missionData';

export default function CreateStep() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { setNovaMessage } = useContext(MissionContext);

  const mission = useMemo(() => {
    const key = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : 'default';
    return missionData[key] || missionData['default'];
  }, [id]);

  const [prompt, setPrompt] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setNovaMessage("Time to shine! Create your final masterpiece. It will automatically save to your Portfolio.");
  }, [mission]);

  const handleSave = () => {
    if (!prompt.trim()) {
      Alert.alert("Wait!", "You need to write something before saving.");
      return;
    }
    // Mock save action
    setIsSaved(true);
    setNovaMessage("Amazing work! I've added this to your Portfolio.");
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Animated.View entering={FadeInDown.duration(600)}>
        <Text style={[styles.title, { color: colors.text }]}>Your Project</Text>
        <Text style={[styles.instructions, { color: colors.textSecondary }]}>
          {mission.create.instructions}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(600).delay(200)} style={[styles.playground, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
          value={prompt}
          onChangeText={setPrompt}
          placeholder={mission.create.placeholder}
          placeholderTextColor={colors.textTertiary}
          multiline
          editable={!isSaved}
        />
        
        {!isSaved ? (
          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSave}
          >
            <Sparkles color="#FFF" size={20} />
            <Text style={styles.saveButtonText}>Create & Save</Text>
          </TouchableOpacity>
        ) : (
          <Animated.View entering={ZoomIn.duration(500)} style={[styles.savedBadge, { backgroundColor: colors.success + '20', borderColor: colors.success }]}>
            <FolderHeart color={colors.success} size={24} />
            <Text style={[styles.savedBadgeText, { color: colors.success }]}>Saved to Portfolio!</Text>
          </Animated.View>
        )}
      </Animated.View>

      {isSaved && (
        <Animated.View entering={FadeInUp.duration(600)}>
          <TouchableOpacity 
            style={[styles.nextButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push(`/nova-studio/mission/${id}/reflect`)}
          >
            <Text style={styles.nextButtonText}>Reflect</Text>
            <ArrowRight color="#FFF" size={20} />
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
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  instructions: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
  },
  playground: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    fontSize: 16,
    minHeight: 150,
    marginBottom: 24,
    textAlignVertical: 'top',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: '800',
    marginLeft: 8,
    fontSize: 18,
  },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  savedBadgeText: {
    fontWeight: '800',
    marginLeft: 12,
    fontSize: 18,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 30,
    width: '100%',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    marginRight: 8,
  },
});

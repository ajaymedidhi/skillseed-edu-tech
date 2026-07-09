import React, { useEffect, useContext, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Play, ArrowRight, Wand2 } from 'lucide-react-native';
import { useTheme } from '@/src/theme/ThemeContext';
import { MissionContext } from '../_layout';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { missionData } from '@/src/data/missionData';

export default function TryStep() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { setNovaMessage } = useContext(MissionContext);

  const mission = useMemo(() => {
    const key = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : 'default';
    return missionData[key] || missionData['default'];
  }, [id]);

  const stylesList = mission.try.styles;

  const [promptBase, setPromptBase] = useState(mission.try.baseIdea);
  const [style, setStyle] = useState(stylesList[0]);
  const [result, setResult] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setNovaMessage("Tap the buttons below to change the style, then see what happens!");
  }, [id]);

  const handleTest = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setResult(`✨ [MOCK IMAGE RESULT]\nImagine a beautiful, high-resolution image of a ${style} ${promptBase.toLowerCase()} with glowing lights and advanced technology.`);
      setIsGenerating(false);
      setNovaMessage("Whoa, look at that! Changing one word completely changes the result.");
    }, 1000);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Animated.View entering={FadeInUp.duration(600)}>
        <Text style={[styles.title, { color: colors.text }]}>Experiment</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Build your prompt piece by piece.
        </Text>
      </Animated.View>
      
      <Animated.View entering={FadeInUp.duration(600).delay(200)} style={[styles.playground, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Base Idea:</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
          value={promptBase}
          onChangeText={setPromptBase}
        />
        
        <Text style={[styles.label, { color: colors.textSecondary, marginTop: 16 }]}>Pick a Style:</Text>
        <View style={styles.chipContainer}>
          {stylesList.map((s) => (
            <TouchableOpacity 
              key={s}
              style={[
                styles.chip, 
                { 
                  backgroundColor: style === s ? colors.primary : colors.background,
                  borderColor: style === s ? colors.primary : colors.border 
                }
              ]}
              onPress={() => setStyle(s)}
            >
              <Text style={[styles.chipText, { color: style === s ? '#FFF' : colors.text }]}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.finalPromptBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[styles.finalPromptTitle, { color: colors.textSecondary }]}>Final Prompt:</Text>
          <Text style={[styles.finalPromptText, { color: colors.text }]}>A {style} {promptBase.toLowerCase()}</Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.testButton, { backgroundColor: colors.primary }]}
          onPress={handleTest}
          disabled={isGenerating}
        >
          <Wand2 color="#FFF" size={20} />
          <Text style={styles.testButtonText}>{isGenerating ? "Generating..." : "Generate"}</Text>
        </TouchableOpacity>

        {result && (
          <Animated.View entering={FadeInUp.duration(400)} style={[styles.resultBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.resultText, { color: colors.primary }]}>{result}</Text>
          </Animated.View>
        )}
      </Animated.View>

      {result && (
        <Animated.View entering={FadeInUp.duration(600)}>
          <TouchableOpacity 
            style={[styles.nextButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push(`/nova-studio/mission/${id}/create`)}
          >
            <Text style={styles.nextButtonText}>Ready to Create</Text>
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
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  playground: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontWeight: '600',
    fontSize: 14,
  },
  finalPromptBox: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  finalPromptTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  finalPromptText: {
    fontSize: 18,
    fontWeight: '600',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  testButtonText: {
    color: '#FFF',
    fontWeight: '700',
    marginLeft: 8,
    fontSize: 18,
  },
  resultBox: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  resultText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
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

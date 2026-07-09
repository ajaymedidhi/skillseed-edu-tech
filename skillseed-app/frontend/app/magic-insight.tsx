// Magic Insight — An emotional transition before revealing the growth profile.
// Nova delivers a personalized, magical insight based on the user's answers.

import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';

import NovaOrb from '@/src/components/NovaOrb';
import { useTheme } from '@/src/theme/ThemeContext';
import { useProfile } from '@/src/state/profile';
import { useNovaVoice } from '@/src/hooks/useNovaVoice';

export default function MagicInsight() {
  const { colors, spacing, radius, type } = useTheme();
  const router = useRouter();
  const { profile } = useProfile();
  const voice = useNovaVoice();

  const [step, setStep] = useState(0);

  const interestA = profile?.interests?.[0] || 'exploring new ideas';
  const interestB = profile?.interests?.[1] || 'learning';
  const strength = profile?.strengths?.[0] || 'curiosity';

  const lines = [
    "I've been thinking about your answers...",
    `It's really interesting. You seem to naturally blend a love for ${interestA} with ${interestB}.`,
    `And you have this underlying ${strength} that ties it all together.`,
    "Let me show you what I see."
  ];

  useEffect(() => {
    let isMounted = true;
    
    const playSequence = async () => {
      for (let i = 0; i < lines.length; i++) {
        if (!isMounted) return;
        setStep(i);
        await voice.speak(lines[i]);
        // slight pause between lines
        await new Promise(r => setTimeout(r, 800));
      }
      
      if (isMounted) {
        // Transition to growth profile after the last line
        router.replace('/growth-profile');
      }
    };

    playSequence();

    return () => {
      isMounted = false;
      voice.stopSpeaking();
    };
  }, []);

  return (
    <SafeAreaView style={[styles.wrap, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.center}>
        <Animated.View entering={FadeIn.duration(1000)} style={styles.orbWrap}>
          <NovaOrb size={220} state={voice.speaking ? 'speaking' : 'idle'} />
        </Animated.View>

        <Animated.Text
          key={`insight-${step}`}
          entering={FadeInDown.duration(600)}
          exiting={FadeOut.duration(400)}
          style={[type.h2, { color: colors.textPrimary, textAlign: 'center', marginTop: 40, paddingHorizontal: spacing.xl }]}
        >
          {lines[step]}
        </Animated.Text>
      </View>
      
      <Pressable 
        onPress={() => { voice.stopSpeaking(); router.replace('/growth-profile'); }}
        style={styles.skipBtn}
      >
        <Text style={[type.small, { color: colors.textSecondary }]}>Skip</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  orbWrap: { alignItems: 'center' },
  skipBtn: {
    padding: 20,
    alignItems: 'center',
  }
});

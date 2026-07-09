import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Volume2, VolumeX, Sparkles } from 'lucide-react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { useTheme } from '@/src/theme/ThemeContext';

export default function NovaGuide({ message }: { message: string }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [isMuted, setIsMuted] = useState(false);

  return (
    <Animated.View 
      entering={FadeInUp.duration(500)} 
      exiting={FadeOutDown.duration(300)}
      style={[
        styles.container, 
        { 
          backgroundColor: colors.surface, 
          borderColor: colors.border,
          paddingBottom: Math.max(16, insets.bottom),
        }
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
        <Sparkles color="#FFF" size={24} />
      </View>
      
      <View style={styles.bubble}>
        <Text style={[styles.text, { color: colors.text }]}>
          {message}
        </Text>
      </View>

      <TouchableOpacity 
        onPress={() => setIsMuted(!isMuted)} 
        style={[styles.audioBtn, { backgroundColor: colors.background }]}
      >
        {isMuted ? (
          <VolumeX color={colors.textSecondary} size={20} />
        ) : (
          <Volume2 color={colors.primary} size={20} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bubble: {
    flex: 1,
  },
  text: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
  audioBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
});

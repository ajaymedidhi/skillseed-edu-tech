import React, { createContext, useContext, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from '@/src/theme/ThemeContext';
import NovaGuide from '@/components/AILab/NovaGuide';

export const MissionContext = createContext<{
  setNovaMessage: (message: string) => void;
}>({
  setNovaMessage: () => {},
});

export default function MissionLayout() {
  const { colors } = useTheme();
  const [novaMessage, setNovaMessage] = useState("Hi! I'm Nova.");

  return (
    <MissionContext.Provider value={{ setNovaMessage }}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack
          screenOptions={{
            headerShown: true,
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerShadowVisible: false,
            headerBackTitleVisible: false,
          }}
        >
          <Stack.Screen name="[id]/discover" options={{ title: 'Discover' }} />
          <Stack.Screen name="[id]/try" options={{ title: 'Try It Out' }} />
          <Stack.Screen name="[id]/create" options={{ title: 'Create' }} />
          <Stack.Screen name="[id]/reflect" options={{ title: 'Reflect' }} />
        </Stack>

        <View style={styles.novaContainer}>
          <NovaGuide message={novaMessage} />
        </View>
      </View>
    </MissionContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  novaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
});

import {
    Poppins_400Regular,
    Poppins_700Bold
} from '@expo-google-fonts/poppins';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { BibleProvider } from './context/BibleProvider';
import { ThemeProvider, useThemeContext } from './context/ThemeProvider';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function Layout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <BibleProvider>
          <ThemedRoot />
        </BibleProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function ThemedRoot() {
  const { theme } = useThemeContext();
  return (
    <PaperProvider theme={theme}>
      <RootLayoutNav />
    </PaperProvider>
  );
} 
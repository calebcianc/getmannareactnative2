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

function RootLayout() {
  const { theme } = useThemeContext();
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
    <PaperProvider theme={theme}>
      <Stack screenOptions={{ headerShown: false }} />
    </PaperProvider>
  );
}

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <BibleProvider>
          <RootLayout />
        </BibleProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
} 
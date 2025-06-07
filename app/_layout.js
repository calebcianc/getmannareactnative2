import { Poppins_400Regular, Poppins_700Bold, useFonts } from '@expo-google-fonts/poppins';
import { Slot, SplashScreen } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { BibleProvider } from './context/BibleProvider';
import { ThemeProvider, useThemeContext } from './context/ThemeProvider';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { theme } = useThemeContext();
  return (
    <PaperProvider theme={theme}>
      <BibleProvider>
        <Slot />
      </BibleProvider>
    </PaperProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider>
      <RootLayoutNav />
    </ThemeProvider>
  );
} 
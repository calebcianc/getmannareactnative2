import { Poppins_400Regular, Poppins_700Bold, useFonts } from '@expo-google-fonts/poppins';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { MD3LightTheme, PaperProvider, configureFonts } from 'react-native-paper';

SplashScreen.preventAutoHideAsync();

const fontConfig = {
  customVariant: {
    fontFamily: 'Poppins_400Regular',
    fontWeight: 'normal',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
};

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1F1F1F',
    onPrimary: '#FFFFFF',
    primaryContainer: '#CCCCCC',
    onPrimaryContainer: '#000000',

    secondary: '#666666',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#AAAAAA',
    onSecondaryContainer: '#000000',

    tertiary: '#8e8e93',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#BBBBBB',
    onTertiaryContainer: '#000000',

    background: '#FFFFFF',
    onBackground: '#000000',

    surface: '#FFFFFF',
    onSurface: '#000000',
    surfaceVariant: '#E0E0E0',
    onSurfaceVariant: '#000000',

    outline: '#B0B0B0',
    outlineVariant: '#D0D0D0',

    error: '#B00020',
    onError: '#FFFFFF',
    errorContainer: '#F2B8B5',
    onErrorContainer: '#370B0E',

    inversePrimary: '#444444',
    inverseOnSurface: '#FFFFFF',

    shadow: '#000000',
    surfaceDisabled: 'rgba(0,0,0,0.12)',
    onSurfaceDisabled: 'rgba(0,0,0,0.38)',
    backdrop: 'transparent',
  },
  fonts: configureFonts({ config: fontConfig }),
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <PaperProvider theme={theme}>
      <Slot />
    </PaperProvider>
  );
} 
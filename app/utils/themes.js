import { MD3DarkTheme, MD3LightTheme, configureFonts } from 'react-native-paper';

const fontConfig = {
  customVariant: {
    fontFamily: 'Poppins_400Regular',
    fontWeight: 'normal',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
};

export const LightTheme = {
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

export const DarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#FFFFFF',
    onPrimary: '#1F1F1F',
    primaryContainer: '#333333',
    onPrimaryContainer: '#FFFFFF',

    secondary: '#CCCCCC',
    onSecondary: '#1F1F1F',
    secondaryContainer: '#555555',
    onSecondaryContainer: '#FFFFFF',

    tertiary: '#B0B0B0',
    onTertiary: '#1F1F1F',
    tertiaryContainer: '#444444',
    onTertiaryContainer: '#FFFFFF',

    background: '#121212',
    onBackground: '#FFFFFF',

    surface: '#1E1E1E',
    onSurface: '#FFFFFF',
    surfaceVariant: '#2C2C2C',
    onSurfaceVariant: '#FFFFFF',

    outline: '#808080',
    outlineVariant: '#A0A0A0',

    error: '#CF6679',
    onError: '#1F1F1F',
    errorContainer: '#B00020',
    onErrorContainer: '#F2B8B5',

    inversePrimary: '#CCCCCC',
    inverseOnSurface: '#1F1F1F',

    shadow: '#000000',
    surfaceDisabled: 'rgba(255,255,255,0.12)',
    onSurfaceDisabled: 'rgba(255,255,255,0.38)',
    backdrop: 'transparent',
  },
  fonts: configureFonts({ config: fontConfig }),
}; 
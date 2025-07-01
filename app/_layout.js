// Import Google Fonts (Poppins) for consistent typography across the app
import {
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

// Import Expo font loading hook to handle custom fonts
import { useFonts } from "expo-font";

// Import Expo Router's Stack component for navigation
import { Stack } from "expo-router";

// Import splash screen utilities to control app startup experience
import * as SplashScreen from "expo-splash-screen";

// Import React hooks and utilities for state management and effects
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// Import gesture handler root view for touch interactions
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Import Paper provider for Material Design theming
import { PaperProvider } from "react-native-paper";

// Import custom bottom sheet component for verse selection interface

// Import Bible context for managing Bible data and state
import { BibleProvider, useBible } from "./context/BibleProvider";

// Import theme context for managing app appearance (light/dark mode)
import { ThemeProvider, useThemeContext } from "./context/ThemeProvider";

// Create a React Context to manage bottom sheet state globally across the app
// This allows any component to show/hide the bottom sheet and pass data to it
const BottomSheetContext = createContext();

// Custom hook to easily access bottom sheet functionality from any component
export function useBottomSheet() {
  return useContext(BottomSheetContext);
}

// Prevent the splash screen from auto-hiding until fonts are loaded
// This ensures a smooth transition from splash to main app
SplashScreen.preventAutoHideAsync();

// Main navigation component that sets up the app's routing structure
// Uses Expo Router's Stack navigator with tabs as the main screen
function RootLayoutNav() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

// Component that manages the global bottom sheet state and provides context
// This component wraps the entire app to make bottom sheet functionality available everywhere
function BottomSheetManager({ children }) {
  // Get the closeHistoryView function from Bible context
  const { closeHistoryView } = useBible();

  // State to track bottom sheet visibility and data (selected verses, book, chapter)
  const [bottomSheetState, setBottomSheetState] = useState({
    visible: false,
    selectedVerses: [],
    book: null,
    chapter: null,
    openInHistoryView: false,
  });

  // Function to show the bottom sheet with specific parameters (verses, book, chapter)
  const showBottomSheet = useCallback((params) => {
    setBottomSheetState({ ...params, visible: true });
  }, []);

  // Function to hide the bottom sheet and reset its state
  // Also closes the history view when bottom sheet is dismissed
  const hideBottomSheet = useCallback(() => {
    setBottomSheetState({
      visible: false,
      selectedVerses: [],
      book: null,
      chapter: null,
      openInHistoryView: false,
    });
    closeHistoryView();
  }, [closeHistoryView]);

  // Provide bottom sheet context to all child components
  // Render the actual bottom sheet component with current state
  return (
    <BottomSheetContext.Provider
      value={{
        showBottomSheet,
        hideBottomSheet,
        bottomSheetState,
      }}
    >
      {children}
    </BottomSheetContext.Provider>
  );
}

// Main layout component that initializes the app and sets up all providers
// This is the root component that wraps the entire application
export default function Layout() {
  // Load custom fonts (Poppins) and track loading state
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  // Hide splash screen once fonts are loaded to ensure smooth app startup
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Don't render anything until fonts are loaded to prevent layout issues
  if (!fontsLoaded) {
    return null;
  }

  // Wrap the entire app with necessary providers in the correct order:
  // 1. GestureHandlerRootView - enables touch gestures throughout the app
  // 2. ThemeProvider - provides theme context (light/dark mode)
  // 3. BibleProvider - provides Bible data and functionality
  // 4. BottomSheetManager - provides bottom sheet functionality
  // 5. ThemedRoot - applies the theme and renders navigation
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <BibleProvider>
          <BottomSheetManager>
            <ThemedRoot />
          </BottomSheetManager>
        </BibleProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

// Component that applies the current theme to the app using React Native Paper
// This ensures all components use consistent theming (colors, typography, etc.)
function ThemedRoot() {
  // Get the current theme from theme context
  const { theme } = useThemeContext();

  // Wrap the navigation with PaperProvider to apply Material Design theming
  return (
    <PaperProvider theme={theme}>
      <RootLayoutNav />
    </PaperProvider>
  );
}

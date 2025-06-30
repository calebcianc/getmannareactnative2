import {
  Poppins_400Regular,
  Poppins_700Bold
} from '@expo-google-fonts/poppins';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import GorhomBottomSheet from './components/GorhomBottomSheet';
import { BibleProvider } from './context/BibleProvider';
import { ThemeProvider, useThemeContext } from './context/ThemeProvider';

// Context to control the GorhomBottomSheet globally
const BottomSheetContext = createContext();

export function useBottomSheet() {
  return useContext(BottomSheetContext);
}

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

  const [bottomSheetState, setBottomSheetState] = useState({
    visible: false,
    selectedVerses: [],
    book: null,
    chapter: null,
    openInHistoryView: false,
  });

  const showBottomSheet = useCallback((params) => {
    setBottomSheetState({ ...params, visible: true });
  }, []);
  const hideBottomSheet = useCallback(() => {
    setBottomSheetState((prev) => ({ ...prev, visible: false }));
  }, []);

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
          <BottomSheetContext.Provider value={{
            showBottomSheet,
            hideBottomSheet,
            bottomSheetState,
          }}>
            <ThemedRoot />
            <GorhomBottomSheet
              visible={bottomSheetState.visible}
              onDismiss={hideBottomSheet}
              selectedVerses={bottomSheetState.selectedVerses}
              book={bottomSheetState.book}
              chapter={bottomSheetState.chapter}
              openInHistoryView={bottomSheetState.openInHistoryView}
            />
          </BottomSheetContext.Provider>
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
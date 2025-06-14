import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { DarkTheme, LightTheme } from "../../utils/themes";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState("system"); // 'light', 'dark', or 'system'
  const [isDarkTheme, setIsDarkTheme] = useState(systemColorScheme === "dark");

  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const savedThemeMode = await AsyncStorage.getItem("themeMode");
        if (savedThemeMode) {
          setThemeMode(savedThemeMode);
        }
      } catch (error) {
        console.error("Failed to load theme mode from storage", error);
      }
    };
    loadThemeMode();
  }, []);

  useEffect(() => {
    if (themeMode === "system") {
      setIsDarkTheme(systemColorScheme === "dark");
    } else {
      setIsDarkTheme(themeMode === "dark");
    }
  }, [themeMode, systemColorScheme]);

  const setThemeModeAndUpdateStorage = async (mode) => {
    try {
      await AsyncStorage.setItem("themeMode", mode);
      setThemeMode(mode);
    } catch (error) {
      console.error("Failed to save theme mode to storage", error);
    }
  };

  const toggleTheme = () => {
    const newThemeMode = isDarkTheme ? "light" : "dark";
    setThemeModeAndUpdateStorage(newThemeMode);
  };

  const theme = isDarkTheme ? DarkTheme : LightTheme;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDarkTheme,
        themeMode,
        setThemeMode: setThemeModeAndUpdateStorage,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);

export default ThemeProvider;

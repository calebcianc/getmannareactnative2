import React from 'react';
import { StyleSheet, View } from 'react-native';
import { List, SegmentedButtons, Text, useTheme } from 'react-native-paper';
import { useThemeContext } from '../context/ThemeProvider';

export default function SettingsScreen() {
  const { themeMode, setThemeMode } = useThemeContext();
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <List.Section>
        <List.Subheader>Appearance</List.Subheader>
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          <Text variant="bodyMedium" style={{ marginBottom: 8 }}>Theme</Text>
          <SegmentedButtons
            value={themeMode}
            onValueChange={setThemeMode}
            buttons={[
              {
                value: 'light',
                label: 'Light',
              },
              {
                value: 'dark',
                label: 'Dark',
              },
              {
                value: 'system',
                label: 'System',
              },
            ]}
          />
        </View>
      </List.Section>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { List, Switch, useTheme } from 'react-native-paper';
import { useThemeContext } from '../context/ThemeProvider';

export default function SettingsScreen() {
  const { isDarkTheme, toggleTheme } = useThemeContext();
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <List.Section>
        <List.Subheader>Appearance</List.Subheader>
        <List.Item
          title="Dark Mode"
          right={() => <Switch value={isDarkTheme} onValueChange={toggleTheme} />}
        />
      </List.Section>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 
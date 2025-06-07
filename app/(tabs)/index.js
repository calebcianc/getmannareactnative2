import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from 'react-native-paper';

export default function HomeScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Welcome Home</Text>
    </View>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    title: {
      fontSize: 24,
      color: theme.colors.onBackground,
      fontFamily: 'Poppins_400Regular',
    },
  }); 
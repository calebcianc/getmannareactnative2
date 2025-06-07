import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Modal, Portal, Text, useTheme } from 'react-native-paper';

export default function SelectionModal({
  visible,
  onDismiss,
  title,
  children,
}) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    modalContainer: {
      backgroundColor: theme.colors.background,
      padding: 20,
      margin: 20,
      borderRadius: 8,
      maxHeight: '80%',
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      color: theme.colors.onSurface,
    },
  });

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <View>
          <Text style={styles.title}>{title}</Text>
          {children}
        </View>
      </Modal>
    </Portal>
  );
} 
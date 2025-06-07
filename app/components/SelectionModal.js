import React from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, Modal, Portal, Text, useTheme } from 'react-native-paper';

const getStyles = (theme) =>
  StyleSheet.create({
    modalContainer: {
      backgroundColor: theme.colors.background,
      padding: 20,
      margin: 20,
      borderRadius: 8,
      maxHeight: '80%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    closeButton: {
      margin: -8, // to counteract the default margin of IconButton
    },
  });

export default function SelectionModal({
  visible,
  onDismiss,
  title,
  children,
}) {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <IconButton
            icon="close"
            onPress={onDismiss}
            style={styles.closeButton}
          />
        </View>
        {children}
      </Modal>
    </Portal>
  );
} 
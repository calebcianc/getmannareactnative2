import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Card, List, Modal, Portal, Title } from 'react-native-paper';

export default function SelectionModal({
  visible,
  onDismiss,
  title,
  data,
  onSelect,
  renderItem,
  children,
}) {
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.container}
      >
        <Card style={styles.card}>
          <View style={styles.header}>
            <Title style={styles.title}>{title}</Title>
            <Pressable style={styles.closeButton} onPress={onDismiss}>
              <MaterialIcons name="close" size={24} color="#666" />
            </Pressable>
          </View>
          <Card.Content style={styles.cardContent}>
            {children || (
              <FlatList
                data={data}
                keyExtractor={(item, index) => item.id || index.toString()}
                renderItem={({ item }) =>
                  renderItem ? (
                    renderItem(item)
                  ) : (
                    <List.Item
                      title={item.name}
                      onPress={() => onSelect(item)}
                    />
                  )
                }
              />
            )}
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  cardContent: {
    flexShrink: 1,
  },
}); 
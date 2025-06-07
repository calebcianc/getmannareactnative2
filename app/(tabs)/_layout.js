import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Appbar, SegmentedButtons } from 'react-native-paper';
import { BibleProvider, useBible } from '../context/BibleProvider';

function BibleHeader() {
  const {
    selectedBook,
    selectedChapter,
    selectedTranslation,
    setBookModalVisible,
    setTranslationModalVisible,
    isBookModalVisible,
    isTranslationModalVisible,
  } = useBible();
  const [value, setValue] = useState('');

  useEffect(() => {
    if (!isBookModalVisible && !isTranslationModalVisible) {
      setValue('');
    }
  }, [isBookModalVisible, isTranslationModalVisible]);

  return (
    <Appbar.Header
      style={{
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        justifyContent: 'space-between',
      }}
    >
      <View style={{  paddingHorizontal: 8 }}>
        <SegmentedButtons
          value={value}
          onValueChange={(newValue) => {
            setValue(newValue);
            if (newValue === 'book') {
              setBookModalVisible(true);
            } else if (newValue === 'translation') {
              setTranslationModalVisible(true);
            }
          }}
          buttons={[
            {
              value: 'book',
              label: selectedBook ? `${selectedBook.name} ${selectedChapter}` : 'Select Book',
              disabled: isTranslationModalVisible,
              style: {
                flex: 1.5,
              },
            },
            {
              value: 'translation',
              label: selectedTranslation,
              disabled: isBookModalVisible,
              style: {
                flex: 1,
              },
            },
          ]}
        />
      </View>
      <View style={{ flexDirection: 'row' }}>
        <Appbar.Action icon="magnify" onPress={() => {}} />
        <Appbar.Action icon="dots-vertical" onPress={() => {}} />
      </View>
    </Appbar.Header>
  );
}

export default function TabsLayout() {
  return (
    <BibleProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#1F1F1F',
          tabBarInactiveTintColor: '#8e8e93',
          tabBarStyle: {
            height: 80,
            paddingTop: 10,
            paddingBottom: 15,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="home" size={28} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="bible"
          options={{
            title: 'Bible',
            headerShown: true,
            header: () => <BibleHeader />,
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="book" size={28} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="settings" size={28} color={color} />
            ),
          }}
        />
      </Tabs>
    </BibleProvider>
  );
} 
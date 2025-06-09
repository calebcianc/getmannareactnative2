import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import {
    Appbar,
    Divider,
    IconButton,
    Menu,
    SegmentedButtons,
    useTheme,
} from 'react-native-paper';
import { useBible } from '../context/BibleProvider';
import { useThemeContext } from '../context/ThemeProvider';

function BibleHeader() {
  const {
    selectedBook,
    selectedChapter,
    selectedTranslation,
    setBookModalVisible,
    setTranslationModalVisible,
    isBookModalVisible,
    isTranslationModalVisible,
    increaseFontSize,
    decreaseFontSize,
    increaseLineHeight,
    decreaseLineHeight,
  } = useBible();
  const [value, setValue] = useState('');
  const { toggleTheme, isDarkTheme } = useThemeContext();
  const theme = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  useEffect(() => {
    if (!isBookModalVisible && !isTranslationModalVisible) {
      setValue('');
    }
  }, [isBookModalVisible, isTranslationModalVisible]);

  return (
    <Appbar.Header
      style={{
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.outlineVariant,
        justifyContent: 'space-between',
      }}
    >
      <View style={{ paddingHorizontal: 8 }}>
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
              label: selectedBook
                ? `${selectedBook.name} ${selectedChapter}`
                : 'Select Book',
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
        <Appbar.Action
          icon={isDarkTheme ? 'white-balance-sunny' : 'moon-waning-crescent'}
          onPress={toggleTheme}
        />
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={<Appbar.Action icon="format-font" onPress={openMenu} />}
          style={{ marginTop: 40 }}
          contentStyle={{
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
          }}
        >
          <View style={{ paddingVertical: 8 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                alignItems: 'center',
              }}
            >
              <IconButton
                icon="format-font-size-decrease"
                onPress={decreaseFontSize}
              />
              <IconButton
                icon="format-font-size-increase"
                onPress={increaseFontSize}
              />
            </View>
            <Divider style={{ marginVertical: 8 }} />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                alignItems: 'center',
              }}
            >
              <IconButton
                icon="arrow-collapse-vertical"
                onPress={decreaseLineHeight}
              />
              <IconButton
                icon="arrow-expand-vertical"
                onPress={increaseLineHeight}
              />
            </View>
          </View>
        </Menu>
      </View>
    </Appbar.Header>
  );
}

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.tertiary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outlineVariant,
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
  );
} 
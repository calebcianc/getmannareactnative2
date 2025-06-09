import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, View, useWindowDimensions } from 'react-native';
import {
  Appbar,
  Button,
  Divider,
  IconButton,
  List,
  Menu,
  Text,
  useTheme,
} from 'react-native-paper';
import { useBible } from '../context/BibleProvider';
import { useThemeContext } from '../context/ThemeProvider';

function BibleHeader() {
  const {
    selectedBook,
    setSelectedBook,
    selectedChapter,
    setSelectedChapter,
    selectedTranslation,
    setSelectedTranslation,
    increaseFontSize,
    decreaseFontSize,
    increaseLineHeight,
    decreaseLineHeight,
    books,
    translations,
    setScrollPosition,
  } = useBible();
  const { height } = useWindowDimensions();
  const { toggleTheme, isDarkTheme } = useThemeContext();
  const theme = useTheme();
  const [fontMenuVisible, setFontMenuVisible] = useState(false);
  const [bookMenuVisible, setBookMenuVisible] = useState(false);
  const [translationMenuVisible, setTranslationMenuVisible] = useState(false);
  const [tempSelectedBook, setTempSelectedBook] = useState(null);

  const openFontMenu = () => setFontMenuVisible(true);
  const closeFontMenu = () => setFontMenuVisible(false);

  const openBookMenu = () => setBookMenuVisible(true);
  const closeBookMenu = () => {
    setBookMenuVisible(false);
    setTempSelectedBook(null);
  }

  const openTranslationMenu = () => setTranslationMenuVisible(true);
  const closeTranslationMenu = () => setTranslationMenuVisible(false);

  const onSelectBook = (book) => {
    setTempSelectedBook(book);
  };

  const onSelectChapter = (chapter) => {
    setSelectedBook(tempSelectedBook);
    setScrollPosition(0);
    setSelectedChapter(chapter);
    closeBookMenu();
  };

  const onSelectTranslation = (translation) => {
    setSelectedTranslation(translation.short_name);
    closeTranslationMenu();
  };

  const renderChapterItem = ({ item }) => (
    <Pressable
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        margin: 5,
        borderRadius: 8,
        backgroundColor: theme.colors.surfaceVariant,
      }}
      onPress={() => onSelectChapter(item)}
    >
      <Text style={{
        fontSize: 16,
        fontWeight: '500',
        color: theme.colors.onSurfaceVariant,
      }}>{item}</Text>
    </Pressable>
  );

  return (
    <Appbar.Header
      style={{
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.outlineVariant,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 }}>
          <Menu
            visible={bookMenuVisible}
            onDismiss={closeBookMenu}
            anchor={
              <Button
                onPress={openBookMenu}
                disabled={translationMenuVisible}
                mode="outlined"
                style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRightWidth: 0.5 }}
              >
                {selectedBook ? `${selectedBook.name} ${selectedChapter}` : 'Select Book'}
              </Button>
            }
            style={{ marginTop: 40, width: '90%', }}
            contentStyle={{
              backgroundColor: theme.colors.surface,
              borderRadius: 12,
            }}
          >
            {!tempSelectedBook ? (
              <View style={{ maxHeight: height * 0.5 }}>
                <FlatList
                  key="book-list"
                  data={books}
                  keyExtractor={(item) => item.bookid.toString()}
                  renderItem={({ item }) => (
                    <List.Item title={item.name} onPress={() => onSelectBook(item)} />
                  )}
                />
              </View>
            ) : (
              <View style={{ maxHeight: height * 0.7 }}>
                 <Menu.Item title={tempSelectedBook.name} onPress={() => setTempSelectedBook(null)} />
                 <Divider />
                <FlatList
                  key="chapter-list"
                  data={Array.from(
                    { length: tempSelectedBook.chapters || 0 },
                    (_, i) => i + 1
                  )}
                  renderItem={renderChapterItem}
                  keyExtractor={(item) => item.toString()}
                  numColumns={5}
                  contentContainerStyle={{ padding: 10, }}
                />
              </View>
            )}
          </Menu>

          <Menu
            visible={translationMenuVisible}
            onDismiss={closeTranslationMenu}
            anchor={
              <Button
                onPress={openTranslationMenu}
                disabled={bookMenuVisible}
                mode="outlined"
                style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderLeftWidth: 0.5 }}
              >
                {selectedTranslation}
              </Button>
            }
            style={{ marginTop: 40, width: 290 }}
            contentStyle={{
              backgroundColor: theme.colors.surface,
              borderRadius: 12,
            }}
          >
            <FlatList
              data={translations}
              keyExtractor={(item) => item.short_name}
              renderItem={({ item }) => (
                <List.Item
                  title={`${item.short_name} - ${item.full_name}`}
                  onPress={() => onSelectTranslation(item)}
                />
              )}
            />
          </Menu>
        </View>

        <View style={{ flexDirection: 'row' }}>
          <Appbar.Action icon="magnify" onPress={() => {}} />
          <Appbar.Action
            icon={isDarkTheme ? 'white-balance-sunny' : 'moon-waning-crescent'}
            onPress={toggleTheme}
          />
          <Menu
            visible={fontMenuVisible}
            onDismiss={closeFontMenu}
            anchor={<Appbar.Action icon="format-font" onPress={openFontMenu} />}
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
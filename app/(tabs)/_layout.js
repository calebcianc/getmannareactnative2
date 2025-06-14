import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, View, useWindowDimensions } from "react-native";
import {
  Appbar,
  Button,
  Divider,
  IconButton,
  Menu,
  Portal,
  Text,
  useTheme,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BookName } from "../components/BookName";
import { useBible } from "../context/BibleProvider";
import { useThemeContext } from "../context/ThemeProvider";

const MaterialIcon =
  (name) =>
  ({ size, color }) =>
    <MaterialIcons name={name} size={size} color={color} />;

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

  const searchIcon = useCallback(MaterialIcon("search"), []);
  const themeIcon = useCallback(
    MaterialIcon(isDarkTheme ? "wb-sunny" : "dark-mode"),
    [isDarkTheme]
  );
  const moreVertIcon = useCallback(MaterialIcon("more-vert"), []);
  const textDecreaseIcon = useCallback(MaterialIcon("text-decrease"), []);
  const textIncreaseIcon = useCallback(MaterialIcon("text-increase"), []);
  const unfoldLessIcon = useCallback(MaterialIcon("unfold-less"), []);
  const unfoldMoreIcon = useCallback(MaterialIcon("unfold-more"), []);
  const backIcon = useCallback(MaterialIcon("arrow-back"), []);

  const openFontMenu = () => setFontMenuVisible(true);
  const closeFontMenu = () => setFontMenuVisible(false);

  const openBookMenu = () => setBookMenuVisible(true);
  const closeBookMenu = () => {
    setBookMenuVisible(false);
    setTempSelectedBook(null);
  };

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
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
        margin: 5,
        borderRadius: 8,
        backgroundColor: theme.colors.surfaceVariant,
      }}
      onPress={() => onSelectChapter(item)}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: "500",
          color: theme.colors.onSurfaceVariant,
        }}
      >
        {item}
      </Text>
    </Pressable>
  );

  const renderBookItem = ({ item }) => (
    <Pressable
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
        margin: 5,
        borderRadius: 8,
        backgroundColor: theme.colors.surfaceVariant,
      }}
      onPress={() => onSelectBook(item)}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: "500",
          color: theme.colors.onSurfaceVariant,
          textAlign: "center",
        }}
      >
        {item.name}
      </Text>
    </Pressable>
  );

  const renderTranslationItem = ({ item }) => (
    <Pressable
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
        margin: 5,
        borderRadius: 8,
        backgroundColor: theme.colors.surfaceVariant,
      }}
      onPress={() => onSelectTranslation(item)}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: "500",
          color: theme.colors.onSurfaceVariant,
          textAlign: "center",
        }}
      >
        {item.short_name}
      </Text>
    </Pressable>
  );

  const bookButtonStyle = {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderRightWidth: 0.5,
  };
  const translationButtonStyle = {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderLeftWidth: 0.5,
  };
  const buttonLabelStyle = {
    fontSize: 16,
    fontWeight: "600",
  };

  return (
    <Appbar.Header
      style={{
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.outlineVariant,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          flex: 1,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 8,
          }}
        >
          <Menu
            visible={bookMenuVisible}
            onDismiss={closeBookMenu}
            anchor={
              <Button
                onPress={openBookMenu}
                disabled={translationMenuVisible}
                // mode="outlined"
                style={bookButtonStyle}
                labelStyle={buttonLabelStyle}
              >
                {selectedBook ? (
                  <BookName
                    book={selectedBook}
                    chapter={selectedChapter}
                    style={buttonLabelStyle}
                  />
                ) : (
                  "Select Book"
                )}
              </Button>
            }
            style={{ marginTop: 52, width: "90%" }}
            contentStyle={{
              backgroundColor: theme.colors.surface,
              borderRadius: 12,
            }}
          >
            {!tempSelectedBook ? (
              <View style={{ maxHeight: height * 0.7 }}>
                <FlatList
                  key="book-list"
                  data={books}
                  keyExtractor={(item) => item.bookid.toString()}
                  renderItem={renderBookItem}
                  numColumns={2}
                  contentContainerStyle={{ padding: 10 }}
                />
              </View>
            ) : (
              <View style={{ maxHeight: height * 0.7 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <IconButton
                    icon={backIcon}
                    onPress={() => setTempSelectedBook(null)}
                  />
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color: theme.colors.onSurface,
                    }}
                  >
                    {tempSelectedBook.name}
                  </Text>
                </View>
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
                  contentContainerStyle={{ padding: 10 }}
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
                // disabled={bookMenuVisible}
                // mode="outlined"
                style={translationButtonStyle}
                labelStyle={buttonLabelStyle}
              >
                {selectedTranslation}
              </Button>
            }
            style={{ marginTop: 52 }}
            contentStyle={{
              backgroundColor: theme.colors.surface,
              borderRadius: 12,
            }}
          >
            <View style={{ maxHeight: height * 0.7 }}>
              <FlatList
                key="translation-list"
                data={translations}
                keyExtractor={(item) => item.short_name}
                renderItem={renderTranslationItem}
                numColumns={2}
                contentContainerStyle={{ padding: 10 }}
              />
            </View>
          </Menu>
        </View>

        <View style={{ flexDirection: "row" }}>
          <Appbar.Action icon={searchIcon} onPress={() => {}} />
          <Appbar.Action onPress={toggleTheme} icon={themeIcon} />
          <Menu
            visible={fontMenuVisible}
            onDismiss={closeFontMenu}
            anchor={
              <Appbar.Action icon={moreVertIcon} onPress={openFontMenu} />
            }
            style={{ marginTop: 40 }}
            contentStyle={{
              backgroundColor: theme.colors.surface,
              borderRadius: 12,
            }}
          >
            <View style={{ paddingVertical: 8 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-evenly",
                  alignItems: "center",
                }}
              >
                <IconButton
                  icon={textDecreaseIcon}
                  onPress={decreaseFontSize}
                />
                <IconButton
                  icon={textIncreaseIcon}
                  onPress={increaseFontSize}
                />
              </View>
              <Divider style={{ marginVertical: 8 }} />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-evenly",
                  alignItems: "center",
                }}
              >
                <IconButton
                  icon={unfoldLessIcon}
                  onPress={decreaseLineHeight}
                />
                <IconButton
                  icon={unfoldMoreIcon}
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
  const insets = useSafeAreaInsets();

  return (
    <Portal.Host>
      <Tabs
        screenOptions={{
          header: (props) =>
            props.route.name === "bible" ? <BibleHeader /> : null,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.tertiary,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopWidth: 1,
            borderTopColor: theme.colors.outlineVariant,
            height: 55 + insets.bottom,
            paddingBottom: insets.bottom,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size, focused }) => (
              <MaterialIcons
                name={focused ? "home" : "home"}
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="bible"
          options={{
            title: "Bible",
            tabBarIcon: ({ color, size, focused }) => (
              <MaterialIcons
                name={focused ? "book" : "book"}
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color, size, focused }) => (
              <MaterialIcons
                name={focused ? "settings" : "settings"}
                size={size}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </Portal.Host>
  );
}

import BottomSheet, { BottomSheetFlatList, BottomSheetTextInput } from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { decode } from "html-entities";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import MarkdownDisplay from "react-native-markdown-display";
import {
    IconButton,
    Text,
    useTheme
} from "react-native-paper";
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { expoundVerse } from "../../utils/gemini";
import SkeletonLoader from "./SkeletonLoader";

const GorhomBottomSheet = ({
  visible,
  onDismiss,
  selectedVerses,
  book,
  chapter,
  openInHistoryView,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(theme, insets);
  const bottomSheetRef = useRef(null);

  const [conversation, setConversation] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [viewMode, setViewMode] = useState("chat");
  const [chatHistory, setChatHistory] = useState([]);
  const [activeVerseRef, setActiveVerseRef] = useState("");
  const [isNewChat, setIsNewChat] = useState(true);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [overlayOpacity] = useState(new Animated.Value(0));

  const snapPoints = useMemo(() => ["80%"], []);

  useEffect(() => {
    if (visible) {
      Animated.timing(overlayOpacity, {
        toValue: 0.5,
        duration: 250,
        useNativeDriver: true,
      }).start();
      bottomSheetRef.current?.expand();
    } else {
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const historyJson = await AsyncStorage.getItem("chatHistory");
        if (historyJson) {
          setChatHistory(JSON.parse(historyJson));
        }
      } catch (e) {
        console.error("Failed to load chat history.", e);
      }
    };
    loadHistory();
  }, []);

  const getVerseRange = () => {
    if (!selectedVerses || selectedVerses.length === 0) return "";
    const firstVerse = selectedVerses[0].verse;
    const lastVerse = selectedVerses[selectedVerses.length - 1].verse;
    if (firstVerse === lastVerse) {
      return `${firstVerse}`;
    }
    return `${firstVerse}-${lastVerse}`;
  };

  const title = `Expound on ${activeVerseRef}`;

  useEffect(() => {
    if (openInHistoryView) {
      setViewMode("history");
      return;
    }
    if (visible && isNewChat) {
      const verseRef = `${book?.name} ${chapter}:${getVerseRange()}`;
      setActiveVerseRef(verseRef);
      const verseText = selectedVerses
        .map((v) => decode(v.text.replace(/<[^>]+>/g, "")))
        .join(" ");
      const prompt = `Expound\n\n"${verseText}"\n\n${verseRef}`;
      const initialConversation = [{ role: "user", content: prompt }];
      setConversation(initialConversation);
      handleResponse(initialConversation, true, verseRef);
    }
  }, [visible, isNewChat, openInHistoryView]);

  const saveChat = useCallback(
    async (chatToSave, ref) => {
      try {
        const newChat = {
          id: Date.now(),
          verseRef: ref,
          conversation: chatToSave,
          timestamp: new Date().toISOString(),
        };
        setCurrentChatId(newChat.id);
        const updatedHistory = [newChat, ...chatHistory];
        setChatHistory(updatedHistory);
        await AsyncStorage.setItem(
          "chatHistory",
          JSON.stringify(updatedHistory)
        );
      } catch (e) {
        console.error("Failed to save chat.", e);
      }
    },
    [chatHistory]
  );

  const updateChat = useCallback(
    async (chatToUpdate) => {
      if (!currentChatId) return;
      try {
        const updatedHistory = chatHistory.map((chat) =>
          chat.id === currentChatId
            ? { ...chat, conversation: chatToUpdate }
            : chat
        );
        setChatHistory(updatedHistory);
        await AsyncStorage.setItem(
          "chatHistory",
          JSON.stringify(updatedHistory)
        );
      } catch (e) {
        console.error("Failed to update chat.", e);
      }
    },
    [chatHistory, currentChatId]
  );

  const handleResponse = async (
    currentConversation,
    isFirst = false,
    verseRef = ""
  ) => {
    setIsStreaming(true);
    setConversation((prev) => [...prev, { role: "model", content: "" }]);
    try {
      const result = await expoundVerse({ conversation: currentConversation });
      const resultText = result.text;
      const finalConversation = [
        ...currentConversation,
        { role: "model", content: resultText },
      ];
      setConversation(finalConversation);

      if (isFirst && isNewChat) {
        saveChat(finalConversation, verseRef || activeVerseRef);
      } else if (!isNewChat) {
        updateChat(finalConversation);
      }
    } catch (error) {
      setConversation((prev) => {
        const newConversation = [...prev];
        const lastMessage = newConversation[newConversation.length - 1];
        lastMessage.content +=
          "Failed to get response. Please check your API key and network connection.";
        return newConversation;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSelectChat = (chat) => {
    setConversation(chat.conversation);
    setActiveVerseRef(chat.verseRef);
    setCurrentChatId(chat.id);
    setIsNewChat(false);
    setViewMode("chat");
  };

  const renderHistoryItem = ({ item }) => (
    <Pressable
      onPress={() => handleSelectChat(item)}
      style={styles.historyItem}
    >
      <View style={styles.historyItemContent}>
        <Text style={styles.historyItemTitle}>{item.verseRef}</Text>
      </View>
    </Pressable>
  );

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const newMessage = { role: "user", content: inputValue.trim() };
    const updatedConversation = [...conversation, newMessage];
    setConversation(updatedConversation);
    setInputValue("");
    handleResponse(updatedConversation);
  };

  // Only reset isNewChat, viewMode, and currentChatId when selection changes
  useEffect(() => {
    setIsNewChat(true);
    setViewMode("chat");
    setCurrentChatId(null);
    // Do NOT clear conversation or activeVerseRef here
  }, [selectedVerses, book, chapter]);

  if (!visible) {
    return null;
  }

  return (
    <>
      {/* Scrim overlay */}
      <Animated.View
        pointerEvents={visible ? 'auto' : 'none'}
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: 'rgba(0,0,0,0.5)',
            opacity: overlayOpacity,
          },
        ]}
      >
        <Pressable style={{ flex: 1 }} onPress={onDismiss} />
      </Animated.View>
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        onChange={(index) => {
          if (index === -1) {
            onDismiss();
          }
        }}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: theme.colors.surface }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.onSurfaceVariant }}
        style={[styles.sheetContainer, { zIndex: 1001 }]}
        keyboardBehavior="interactive"
      >
        <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: theme.colors.surface }}>
          <View style={[styles.header, { paddingHorizontal: 16 }]}>
            {viewMode === "chat" ? (
              <IconButton
                icon="history"
                size={24}
                onPress={() => setViewMode("history")}
                style={styles.headerIcon}
              />
            ) : (
              <IconButton
                icon="arrow-left"
                size={24}
                onPress={() => setViewMode("chat")}
                style={styles.headerIcon}
              />
            )}
            <Text style={styles.title} numberOfLines={1}>
              {viewMode === "chat" ? title : "Chat History"}
            </Text>
            <IconButton
              icon="close"
              size={24}
              onPress={onDismiss}
              style={styles.headerIcon}
            />
          </View>
          <View style={styles.contentContainerWithPadding}>
            {viewMode === "chat" ? (
              <BottomSheetFlatList
                data={conversation}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.messageContainer,
                      item.role === "user"
                        ? [
                            styles.userMessageContainer,
                            {
                              backgroundColor: theme.dark
                                ? 'rgba(255,255,255,0.08)'
                                : '#F3F3F3',
                            },
                          ]
                        : styles.modelMessageContainer,
                    ]}
                  >
                    {item.role === "user" ? (
                      <Text style={styles.userMessageText}>{item.content}</Text>
                    ) : (
                      <MarkdownDisplay style={{ body: styles.responseText }}>
                        {item.content}
                      </MarkdownDisplay>
                    )}
                  </View>
                )}
                ListFooterComponent={
                  isStreaming ? (
                    <View style={{ marginVertical: 10 }}>
                      <SkeletonLoader count={3} />
                    </View>
                  ) : null
                }
                contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 16 }}
              />
            ) : (
              <BottomSheetFlatList
                data={chatHistory}
                renderItem={renderHistoryItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 16 }}
              />
            )}
          </View>
          <View style={[styles.inputContainer, { marginHorizontal: 8 }]}> 
            <BottomSheetTextInput
              style={styles.textInput}
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="Type your message..."
              onSubmitEditing={handleSend}
              returnKeyType="send"
              editable={!isStreaming}
            />
            <IconButton
              icon="send"
              size={24}
              onPress={handleSend}
              disabled={!inputValue.trim() || isStreaming}
            />
          </View>
        </SafeAreaView>
      </BottomSheet>
    </>
  );
};

const getStyles = (theme, insets) =>
  StyleSheet.create({
    contentContainer: {
      padding: 16,
    },
    contentContainerWithPadding: {
      flex: 1,
      paddingHorizontal: 8,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    headerIcon: {
      margin: 0,
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.colors.onSurface,
      textAlign: "center",
      flex: 1,
    },
    messageContainer: {
      maxWidth: "95%",
      marginBottom: 12,
    },
    userMessageContainer: {
      backgroundColor: theme.colors.surface,
      alignSelf: "flex-end",
      padding: 12,
      borderRadius: 12,
    },
    modelMessageContainer: {
      alignSelf: "flex-start",
    },
    userMessageText: {
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
    },
    responseText: {
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.onSurface,
    },
    historyItem: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
    },
    historyItemContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    historyItemTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.colors.onSurface,
      flexShrink: 1,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      padding: 8,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
    },
    textInput: {
      flex: 1,
      fontSize: 16,
      paddingVertical: 10,
      paddingHorizontal: 16,
      backgroundColor: theme.dark ? 'rgba(255,255,255,0.08)' : '#F3F3F3',
      borderRadius: 24,
      marginRight: 8,
      borderWidth: 0,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 2,
      elevation: 1,
    },
    sheetContainer: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      overflow: 'hidden',
      // iOS shadow
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.18,
      shadowRadius: 12,
      // Android elevation
      elevation: 16,
      borderTopWidth: 1,
      borderColor: theme.colors.outlineVariant || theme.colors.outline,
      backgroundColor: theme.colors.surface,
    },
  });

export default GorhomBottomSheet;
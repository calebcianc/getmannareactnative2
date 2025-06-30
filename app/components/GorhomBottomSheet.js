import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { decode } from "html-entities";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Pressable, StyleSheet, View } from "react-native";
import {
    IconButton,
    Text,
    useTheme
} from "react-native-paper";
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
  const styles = getStyles(theme);
  const bottomSheetRef = useRef(null);

  const [conversation, setConversation] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [viewMode, setViewMode] = useState("chat");
  const [chatHistory, setChatHistory] = useState([]);
  const [activeVerseRef, setActiveVerseRef] = useState("");
  const [isNewChat, setIsNewChat] = useState(true);
  const [currentChatId, setCurrentChatId] = useState(null);

  const snapPoints = useMemo(() => ["50%", "90%"], []);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.expand();
    } else {
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

  if (!visible) {
    return null;
  }

  return (
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
    >
      <View style={styles.header}>
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
      {viewMode === "chat" ? (
        <BottomSheetFlatList
          data={conversation}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageContainer,
                item.role === "user"
                  ? styles.userMessageContainer
                  : styles.modelMessageContainer,
              ]}
            >
              <Text
                style={
                  item.role === "user"
                    ? styles.userMessageText
                    : styles.responseText
                }
              >
                {item.content}
              </Text>
            </View>
          )}
          ListFooterComponent={
            isStreaming ? (
              <View style={{ marginVertical: 10 }}>
                <SkeletonLoader count={3} />
              </View>
            ) : null
          }
        />
      ) : (
        <BottomSheetFlatList
          data={chatHistory}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
    </BottomSheet>
  );
};

const getStyles = (theme) =>
  StyleSheet.create({
    contentContainer: {
      padding: 16,
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
      backgroundColor: theme.colors.surfaceVariant,
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
  });

export default GorhomBottomSheet;
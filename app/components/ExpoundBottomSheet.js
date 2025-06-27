import AsyncStorage from "@react-native-async-storage/async-storage";
import { decode } from "html-entities";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  Swipeable,
} from "react-native-gesture-handler";
import MarkdownDisplay from "react-native-markdown-display";
import {
  IconButton,
  Modal,
  Portal,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { expoundVerse } from "../../utils/gemini";
import SkeletonLoader from "./SkeletonLoader";

const ExpoundBottomSheet = ({
  visible,
  onDismiss,
  selectedVerses,
  book,
  chapter,
  openInHistoryView,
}) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { height } = useWindowDimensions();
  const [conversation, setConversation] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [viewMode, setViewMode] = useState("chat"); // 'chat' or 'history'
  const [chatHistory, setChatHistory] = useState([]);
  const [activeVerseRef, setActiveVerseRef] = useState("");
  const [isNewChat, setIsNewChat] = useState(true);
  const [currentChatId, setCurrentChatId] = useState(null);
  const scrollViewRef = useRef(null);
  const userMessageToScrollRef = useRef(null);
  const messageRefs = useRef([]);
  const headerRef = useRef(null);
  const translateY = useSharedValue(height);
  const animatedProgress = useSharedValue(0);
  const startY = useSharedValue(0);

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

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      translateY.value = Math.max(0, startY.value + event.translationY);
    })
    .onEnd((event) => {
      const snapPointHalf = height * 0.45;
      const closeThreshold = height * 0.7;
      const projectedY = translateY.value + 0.1 * event.velocityY;
      if (projectedY > closeThreshold) {
        runOnJS(onDismiss)();
        return;
      }
      const snapPoints = [0, snapPointHalf];
      const closestSnapPoint = snapPoints.reduce((prev, curr) =>
        Math.abs(curr - projectedY) < Math.abs(prev - projectedY) ? curr : prev
      );
      translateY.value = withSpring(closestSnapPoint, {
        damping: 15,
        stiffness: 100,
      });
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const backdropAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(animatedProgress.value, [0, 1], [0, 0.5]),
      display: animatedProgress.value === 0 ? "none" : "flex",
    };
  });

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
    if (visible) {
      translateY.value = withSpring(0, { damping: 15 });
      animatedProgress.value = withTiming(1);
    } else {
      translateY.value = withTiming(height, { duration: 300 });
      animatedProgress.value = withTiming(0);
      // Reset state on close, but keep history loaded
      setConversation([]);
      setNewMessage("");
      setViewMode("chat");
      setIsNewChat(true);
      setCurrentChatId(null);
      setActiveVerseRef("");
    }
  }, [visible]);

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
        runOnJS(saveChat)(finalConversation, verseRef || activeVerseRef);
      } else if (!isNewChat) {
        runOnJS(updateChat)(finalConversation);
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

  const handleSendMessage = () => {
    if (newMessage.trim() === "" || isStreaming) return;
    const prompt = newMessage.trim();
    const newConversation = [
      ...conversation,
      { role: "user", content: prompt },
    ];
    messageRefs.current = messageRefs.current.slice(0, newConversation.length);
    userMessageToScrollRef.current = newConversation.length - 1;
    setConversation(newConversation);
    setNewMessage("");
    handleResponse(newConversation);
  };

  const handleDeleteChat = async (chatId) => {
    try {
      const updatedHistory = chatHistory.filter((chat) => chat.id !== chatId);
      setChatHistory(updatedHistory);
      await AsyncStorage.setItem("chatHistory", JSON.stringify(updatedHistory));
    } catch (e) {
      console.error("Failed to delete chat.", e);
    }
  };

  const handleSelectChat = (chat) => {
    setConversation(chat.conversation);
    setActiveVerseRef(chat.verseRef);
    setCurrentChatId(chat.id);
    setIsNewChat(false);
    setViewMode("chat");
  };

  const handleDismiss = () => {
    onDismiss();
  };

  const renderHistoryItem = ({ item }) => {
    const renderRightActions = (progress, dragX) => {
      const trans = dragX.interpolate({
        inputRange: [-80, 0],
        outputRange: [0, 80],
        extrapolate: "clamp",
      });
      return (
        <TouchableOpacity
          onPress={() => handleDeleteChat(item.id)}
          style={styles.deleteButton}
        >
          <Animated.Text
            style={[
              styles.deleteButtonText,
              {
                transform: [{ translateX: trans }],
              },
            ]}
          >
            Delete
          </Animated.Text>
        </TouchableOpacity>
      );
    };

    const date = new Date(item.timestamp);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    return (
      <Swipeable renderRightActions={renderRightActions}>
        <Pressable
          onPress={() => handleSelectChat(item)}
          style={styles.historyItem}
        >
          <View style={styles.historyItemContent}>
            <Text style={styles.historyItemTitle}>{item.verseRef}</Text>
            <Text style={styles.historyItemDate}>{formattedDate}</Text>
          </View>
        </Pressable>
      </Swipeable>
    );
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: "black" },
            backdropAnimatedStyle,
          ]}
        >
          <Pressable onPress={handleDismiss} style={StyleSheet.absoluteFill} />
        </Animated.View>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.container, animatedStyle]}>
            <View style={styles.handle} />
            <View style={styles.header} ref={headerRef}>
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
                onPress={handleDismiss}
                style={styles.headerIcon}
              />
            </View>
            {viewMode === "chat" ? (
              <ScrollView
                style={styles.responseContainer}
                ref={scrollViewRef}
                contentContainerStyle={styles.scrollContentContainer}
              >
                {conversation.map((message, index) => {
                  const messageRef = React.createRef();
                  return (
                    <View
                      key={index}
                      ref={(el) => (messageRefs.current[index] = el)}
                      style={[
                        styles.messageContainer,
                        message.role === "user"
                          ? styles.userMessageContainer
                          : styles.modelMessageContainer,
                      ]}
                      onLayout={(event) => {
                        if (userMessageToScrollRef.current === index) {
                          setTimeout(() => {
                            const layout = event.nativeEvent.layout;
                            scrollViewRef.current?.scrollTo({
                              y: layout.y,
                              animated: true,
                            });
                            userMessageToScrollRef.current = null;
                          }, 100);
                        }
                      }}
                    >
                      {message.role === "model" ? (
                        <MarkdownDisplay
                          style={{
                            body: styles.responseText,
                            heading1: {
                              fontSize: 22,
                              fontWeight: "bold",
                              marginBottom: 10,
                            },
                            strong: { fontWeight: "bold" },
                          }}
                        >
                          {message.content}
                        </MarkdownDisplay>
                      ) : (
                        <Text style={styles.userMessageText}>
                          {message.content}
                        </Text>
                      )}
                    </View>
                  );
                })}
                {isStreaming &&
                  conversation[conversation.length - 1]?.role === "model" && (
                    <View style={{ marginVertical: 10 }}>
                      <SkeletonLoader count={5} />
                    </View>
                  )}
              </ScrollView>
            ) : (
              <FlatList
                data={chatHistory}
                renderItem={renderHistoryItem}
                keyExtractor={(item) => item.id.toString()}
                style={styles.responseContainer}
              />
            )}
            {viewMode === "chat" && (
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={newMessage}
                  onChangeText={setNewMessage}
                  placeholder="Ask a follow up question..."
                  mode="flat"
                  dense
                  // multiline
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                  backgroundColor="transparent"
                  onSubmitEditing={handleSendMessage}
                />
                <IconButton
                  icon="send"
                  onPress={handleSendMessage}
                  disabled={isStreaming || newMessage.trim() === ""}
                />
              </View>
            )}
          </Animated.View>
        </GestureDetector>
      </Modal>
    </Portal>
  );
};

const getStyles = (theme) =>
  StyleSheet.create({
    modalContainer: {
      justifyContent: "flex-end",
      height: "100%",
      width: "100%",
    },
    container: {
      backgroundColor: theme.colors.surface,
      padding: 16,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      height: "90%",
      paddingTop: 24,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.onSurfaceVariant,
      alignSelf: "center",
      position: "absolute",
      top: 10,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
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
    },
    userMessageContainer: {
      backgroundColor: theme.colors.surfaceVariant,
      alignSelf: "flex-end",
      padding: 12,
      borderRadius: 12,
    },
    modelMessageContainer: {
      alignSelf: "flex-start",
      paddingTop: 12,
    },
    userMessageText: {
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
    },
    responseContainer: {
      flex: 1,
      marginBottom: 16,
    },
    scrollContentContainer: {},
    responseText: {
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.onSurface,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.outline,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 28,
    },
    textInput: {
      flex: 1,
      backgroundColor: "transparent",
      paddingVertical: 0,
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
    historyItemDate: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    deleteButton: {
      backgroundColor: "red",
      justifyContent: "center",
      alignItems: "flex-end",
      paddingRight: 20,
      width: 80,
    },
    deleteButtonText: {
      color: "white",
      fontWeight: "bold",
    },
  });

export default ExpoundBottomSheet;

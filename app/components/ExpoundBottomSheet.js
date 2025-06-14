import { decode } from "html-entities";
import React, { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import MarkdownDisplay from "react-native-markdown-display";
import {
  ActivityIndicator,
  IconButton,
  Modal,
  Portal,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { expoundVerse } from "../utils/gemini";

const ExpoundBottomSheet = ({
  visible,
  onDismiss,
  selectedVerses,
  book,
  chapter,
}) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { height } = useWindowDimensions();
  const [conversation, setConversation] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollViewRef = useRef(null);
  const translateY = useSharedValue(height);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
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

  const verseRef = `${book?.name} ${chapter}:${getVerseRange()}`;
  const title = `Expound on ${verseRef}`;

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 15 });
      const verseText = selectedVerses
        .map((v) => decode(v.text.replace(/<[^>]+>/g, "")))
        .join(" ");
      const prompt = `Expound\n\n"${verseText}"\n\n${verseRef}`;
      const initialConversation = [{ role: "user", content: prompt }];
      setConversation(initialConversation);
      handleStreamResponse(prompt);
    } else {
      translateY.value = withTiming(height, { duration: 300 });
      setConversation([]);
      setNewMessage("");
    }
  }, [visible, height]);

  const handleStreamResponse = async (prompt) => {
    setIsStreaming(true);
    setConversation((prev) => [...prev, { role: "model", content: "" }]);
    try {
      const stream = await expoundVerse({ prompt });
      for await (const chunk of stream) {
        const chunkText = chunk.text();
        setConversation((prev) => {
          const newConversation = [...prev];
          const lastMessage = newConversation[newConversation.length - 1];
          lastMessage.content += chunkText;
          return newConversation;
        });
        scrollViewRef.current?.scrollToEnd({ animated: true });
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
    if (newMessage.trim() === "") return;
    const prompt = newMessage.trim();
    setConversation((prev) => [...prev, { role: "user", content: prompt }]);
    setNewMessage("");
    handleStreamResponse(prompt);
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <Animated.View style={[styles.container, animatedStyle]}>
          <View style={styles.header}>
            <IconButton
              icon="history"
              size={24}
              onPress={() => {
                /* Handle past chats view */
              }}
              style={styles.headerIcon}
            />
            <Text style={styles.title}>{title}</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={onDismiss}
              style={styles.headerIcon}
            />
          </View>
          <ScrollView
            style={styles.responseContainer}
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContentContainer}
          >
            {conversation.map((message, index) => (
              <View
                key={index}
                style={[
                  styles.messageContainer,
                  message.role === "user"
                    ? styles.userMessageContainer
                    : styles.modelMessageContainer,
                ]}
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
                  <Text style={styles.userMessageText}>{message.content}</Text>
                )}
              </View>
            ))}
            {isStreaming &&
              conversation[conversation.length - 1]?.role === "model" && (
                <ActivityIndicator
                  animating={true}
                  style={{ marginVertical: 10 }}
                />
              )}
          </ScrollView>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Ask a follow up question..."
              mode="flat"
              dense
              multiline
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              backgroundColor="transparent"
            />
            <IconButton
              icon="send"
              onPress={handleSendMessage}
              disabled={isStreaming || newMessage.trim() === ""}
            />
          </View>
        </Animated.View>
      </Modal>
    </Portal>
  );
};

const getStyles = (theme) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    container: {
      backgroundColor: theme.colors.surface,
      padding: 16,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      height: "90%",
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
  });

export default ExpoundBottomSheet;

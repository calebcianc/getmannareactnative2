import { decode } from "html-entities";
import React, { useEffect, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
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
}) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { height } = useWindowDimensions();
  const [conversation, setConversation] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollViewRef = useRef(null);
  const userMessageToScrollRef = useRef(null);
  const messageRefs = useRef([]);
  const headerRef = useRef(null);
  const translateY = useSharedValue(height);
  const animatedProgress = useSharedValue(0);
  const startY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      translateY.value = Math.max(0, startY.value + event.translationY);
    })
    .onEnd(() => {
      if (translateY.value > height * 0.3) {
        runOnJS(onDismiss)();
      } else {
        translateY.value = withSpring(0, { damping: 15 });
      }
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

  const verseRef = `${book?.name} ${chapter}:${getVerseRange()}`;
  const title = `Expound on ${verseRef}`;

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 15 });
      animatedProgress.value = withTiming(1);
      const verseText = selectedVerses
        .map((v) => decode(v.text.replace(/<[^>]+>/g, "")))
        .join(" ");
      const prompt = `Expound\n\n"${verseText}"\n\n${verseRef}`;
      const initialConversation = [{ role: "user", content: prompt }];
      setConversation(initialConversation);
      handleResponse(initialConversation);
    } else {
      translateY.value = withTiming(height, { duration: 300 });
      animatedProgress.value = withTiming(0);
      setConversation([]);
      setNewMessage("");
    }
  }, [visible, height]);

  const handleResponse = async (currentConversation) => {
    setIsStreaming(true);
    setConversation((prev) => [...prev, { role: "model", content: "" }]);
    try {
      const result = await expoundVerse({ conversation: currentConversation });
      const resultText = result.text;
      setConversation((prev) => {
        const newConversation = [...prev];
        const lastMessage = newConversation[newConversation.length - 1];
        lastMessage.content = resultText;
        return newConversation;
      });
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

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: "black" },
            backdropAnimatedStyle,
          ]}
        >
          <Pressable onPress={onDismiss} style={StyleSheet.absoluteFill} />
        </Animated.View>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.container, animatedStyle]}>
            <View style={styles.handle} />
            <View style={styles.header} ref={headerRef}>
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

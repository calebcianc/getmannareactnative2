import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { ActivityIndicator, IconButton, Modal, Portal, Text, TextInput, useTheme } from 'react-native-paper';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { startChat, streamGeminiResponseFromChat } from '../utils/gemini';

const ExpoundBottomSheet = ({ visible, onDismiss, selectedVerses, book, chapter }) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { height } = useWindowDimensions();
  const [conversationText, setConversationText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const chatRef = useRef(null);
  const scrollViewRef = useRef(null);
  const translateY = useSharedValue(height);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const getVerseRange = () => {
    if (!selectedVerses || selectedVerses.length === 0) return '';
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
      chatRef.current = startChat();
      const initialPrompt = `Expound on ${verseRef}`;
      handleStreamResponse(initialPrompt);
    } else {
      translateY.value = withTiming(height, { duration: 300 });
      setConversationText('');
      setFollowUpQuestion('');
    }
  }, [visible, height]);

  const handleStreamResponse = async (prompt) => {
    setIsStreaming(true);
    let currentResponse = '';
    try {
      const stream = await streamGeminiResponseFromChat(chatRef.current, prompt);
      for await (const chunk of stream) {
        const chunkText = chunk.text();
        currentResponse += chunkText;
        setConversationText((prev) => prev + chunkText);
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }
    } catch (error) {
      setConversationText((prev) => prev + 'Failed to get response. Please check your API key and network connection.');
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSendFollowUp = () => {
    if (followUpQuestion.trim() === '' || isStreaming) return;
    const prompt = followUpQuestion;
    setConversationText((prev) => prev + `\n\n**You:** ${prompt}\n\n**Gemini:** `);
    setFollowUpQuestion('');
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
            <Text style={styles.responseText}>{conversationText}</Text>
            {isStreaming && (
              <ActivityIndicator animating={true} style={{ marginVertical: 10 }} />
            )}
          </ScrollView>
          <View style={styles.inputContainer}>
            {/* <IconButton icon="add" size={24} onPress={() => {}} /> */}
            <View style={styles.textInputWrapper}>
              <TextInput
                placeholder="Ask a follow-up question"
                style={styles.textInput}
                value={followUpQuestion}
                onChangeText={setFollowUpQuestion}
                onSubmitEditing={handleSendFollowUp}
                disabled={isStreaming}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                placeholderTextColor={theme.colors.onSurfaceVariant}
              />
              <IconButton
                icon="send"
                size={20}
                onPress={handleSendFollowUp}
                disabled={followUpQuestion.trim() === '' || isStreaming}
                style={styles.sendButton}
                // containerColor={theme.colors.primary}
                iconColor={theme.colors.primary}
              />
            </View>
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
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    container: {
      backgroundColor: theme.colors.surface,
      padding: 16,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      height: '90%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    headerIcon: {
      margin: 0,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      textAlign: 'center',
      flex: 1,
    },
    responseContainer: {
      flex: 1,
      marginBottom: 16,
    },
    scrollContentContainer: {
      paddingBottom: 20,
    },
    responseText: {
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.onSurface,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingBottom: 10,
    },
    textInputWrapper: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      paddingHorizontal: 8,
      marginLeft: 8,
    },
    textInput: {
      flex: 1,
      backgroundColor: 'transparent',
      paddingHorizontal: 8,
      height: 48,
    },
    sendButton: {
      margin: 4,
    },
  });

export default ExpoundBottomSheet; 
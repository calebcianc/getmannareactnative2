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
  }, [visible, height, translateY]);

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
          <IconButton
            icon="close"
            size={24}
            onPress={onDismiss}
            style={styles.closeButton}
          />
          <Text style={styles.title}>{title}</Text>
          <ScrollView style={styles.responseContainer} ref={scrollViewRef}>
            <Text>{conversationText}</Text>
            {isStreaming && <ActivityIndicator animating={true} style={{ marginVertical: 10 }} />}
          </ScrollView>
          <View style={styles.inputContainer}>
            <TextInput
              mode="outlined"
              placeholder="Ask a follow-up question"
              style={styles.textInput}
              value={followUpQuestion}
              onChangeText={setFollowUpQuestion}
              onSubmitEditing={handleSendFollowUp}
              disabled={isStreaming}
              outlineStyle={{ borderRadius: 24 }}
            />
            <IconButton
              icon="send"
              size={24}
              onPress={handleSendFollowUp}
              disabled={followUpQuestion.trim() === '' || isStreaming}
              style={styles.sendButton}
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
      justifyContent: 'flex-end',
      backgroundColor: 'transparent',
    },
    container: {
      backgroundColor: theme.colors.surfaceVariant,
      padding: 20,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      height: '80%', // Adjust as needed
    },
    closeButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      zIndex: 1,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      color: theme.colors.onSurfaceVariant,
      paddingRight: 40, // Avoid overlapping with the close button
    },
    responseContainer: {
      flex: 1,
      marginBottom: 20,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    textInput: {
      flex: 1,
      backgroundColor: theme.colors.surface,
    },
    sendButton: {
      marginLeft: 8,
    },
  });

export default ExpoundBottomSheet; 
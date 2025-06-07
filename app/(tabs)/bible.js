import { decode } from 'html-entities';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import {
  FAB,
  List,
  Paragraph,
  Portal,
  Text,
  useTheme,
} from 'react-native-paper';
import SelectionModal from '../components/SelectionModal';
import { useBible } from '../context/BibleProvider';

const toSuperscript = (str) => {
  const superscripts = {
    '0': '⁰',
    '1': '¹',
    '2': '²',
    '3': '³',
    '4': '⁴',
    '5': '⁵',
    '6': '⁶',
    '7': '⁷',
    '8': '⁸',
    '9': '⁹',
  };
  return String(str)
    .split('')
    .map((char) => superscripts[char] || char)
    .join('');
};

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    loader: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 100,
    },
    paragraph: {
      fontSize: 18,
      lineHeight: 28,
      marginBottom: 16,
      color: theme.colors.onBackground,
    },
    verseNumber: {
      fontWeight: 'bold',
      color: theme.colors.tertiary,
    },
    fabLeft: {
      position: 'absolute',
      margin: 20,
      left: 0,
      bottom: 0,
      borderRadius: 28,
      elevation: 0,
      backgroundColor: theme.colors.surfaceVariant,
    },
    fabRight: {
      position: 'absolute',
      margin: 20,
      right: 0,
      bottom: 0,
      borderRadius: 28,
      elevation: 0,
      backgroundColor: theme.colors.surfaceVariant,
    },
    chaptersContainer: {
      paddingVertical: 10,
    },
    chapterItemContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      margin: 5,
      borderRadius: 8,
      backgroundColor: theme.colors.surfaceVariant,
    },
    chapterItem: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.onSurfaceVariant,
    },
  });

export default function BibleScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);
  const {
    loading,
    verses,
    selectedBook,
    setSelectedBook,
    selectedChapter,
    setSelectedChapter,
    setSelectedTranslation,
    isBookModalVisible,
    setBookModalVisible,
    isTranslationModalVisible,
    setTranslationModalVisible,
    books,
    translations,
    scrollPosition,
    setScrollPosition,
  } = useBible();

  const [tempSelectedBook, setTempSelectedBook] = useState(null);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (!loading && scrollViewRef.current) {
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ y: scrollPosition, animated: false });
        }
      }, 100);
    }
  }, [loading]);

  const handleNextChapter = () => {
    if (selectedBook && selectedChapter < selectedBook.chapters) {
      setScrollPosition(0);
      setSelectedChapter(selectedChapter + 1);
    }
  };

  const handlePrevChapter = () => {
    if (selectedChapter > 1) {
      setScrollPosition(0);
      setSelectedChapter(selectedChapter - 1);
    }
  };

  const onSelectBook = (book) => {
    setTempSelectedBook(book);
  };
  
  const onSelectChapter = (chapter) => {
    setSelectedBook(tempSelectedBook);
    setScrollPosition(0);
    setSelectedChapter(chapter);
    setBookModalVisible(false);
    setTempSelectedBook(null);
  };

  const onSelectTranslation = (translation) => {
    setSelectedTranslation(translation.short_name);
    setTranslationModalVisible(false);
  };

  const renderChapterItem = ({ item }) => (
    <Pressable
      style={styles.chapterItemContainer}
      onPress={() => onSelectChapter(item)}
    >
      <Text style={styles.chapterItem}>{item}</Text>
    </Pressable>
  );

  const closeBookSelectionModal = () => {
    setBookModalVisible(false);
    setTempSelectedBook(null);
  };

  let bookModalContent;
  if (!tempSelectedBook) {
    bookModalContent = (
      <FlatList
        key="book-list"
        data={books}
        keyExtractor={(item) => item.bookid.toString()}
        renderItem={({ item }) => (
          <List.Item title={item.name} onPress={() => onSelectBook(item)} />
        )}
      />
    );
  } else {
    bookModalContent = (
      <FlatList
        key="chapter-list"
        data={Array.from(
          { length: tempSelectedBook.chapters || 0 },
          (_, i) => i + 1
        )}
        renderItem={renderChapterItem}
        keyExtractor={(item) => item.toString()}
        numColumns={5}
        contentContainerStyle={styles.chaptersContainer}
      />
    );
  }

  return (
    <Portal.Host>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {loading ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : (
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.content}
            onScroll={(e) => setScrollPosition(e.nativeEvent.contentOffset.y)}
            scrollEventThrottle={16}
          >
            <Paragraph style={styles.paragraph}>
              {verses.map((verse, index) => (
                <Text key={verse.verse}>
                  {index > 0 && ' '}
                  <Text style={styles.verseNumber}>
                    {toSuperscript(verse.verse)}{' '}
                  </Text>
                  {decode(verse.text.replace(/<[^>]+>/g, ''))}
                </Text>
              ))}
            </Paragraph>
          </ScrollView>
        )}
        <FAB
          icon="arrow-left"
          style={styles.fabLeft}
          onPress={handlePrevChapter}
          disabled={loading || selectedChapter === 1}
        />
        <FAB
          icon="arrow-right"
          style={styles.fabRight}
          onPress={handleNextChapter}
          disabled={loading || !selectedBook || selectedChapter === selectedBook.chapters}
        />
        <SelectionModal
          visible={isBookModalVisible}
          onDismiss={closeBookSelectionModal}
          title={!tempSelectedBook ? 'Select Book' : `Select Chapter for ${tempSelectedBook.name}`}
        >
          {bookModalContent}
        </SelectionModal>

        <SelectionModal
          visible={isTranslationModalVisible}
          onDismiss={() => setTranslationModalVisible(false)}
          title="Select Translation"
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
        </SelectionModal>
      </View>
    </Portal.Host>
  );
} 
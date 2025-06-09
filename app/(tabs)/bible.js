import { decode } from 'html-entities';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import {
  FAB,
  IconButton,
  Paragraph,
  Portal,
  Text,
  useTheme
} from 'react-native-paper';
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
    selectedVerse: {
      backgroundColor: theme.dark
        ? 'rgba(255, 255, 255, 0.12)'
        : 'rgba(0, 0, 0, 0.08)',
      borderRadius: 6,
      textDecorationLine: 'underline',
      textDecorationStyle: 'dotted',
      textDecorationColor: theme.colors.onSurface,
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
    selectionOptionsBar: {
      position: 'absolute',
      bottom: 20,
      left: 20,
      right: 20,
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems: 'center',
      paddingVertical: 4,
      borderRadius: 28,
      backgroundColor: theme.colors.surfaceVariant,
      elevation: 4,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.outline,
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
    books,
    scrollPosition,
    setScrollPosition,
    fontSize,
    lineHeight,
    fontFamily,
  } = useBible();

  const [selectedVerses, setSelectedVerses] = useState([]);
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

  const handleVersePress = (verse) => {
    setSelectedVerses((prevSelectedVerses) => {
      const isSelected = prevSelectedVerses.some(
        (v) => v.verse === verse.verse
      );
      if (isSelected) {
        return prevSelectedVerses.filter((v) => v.verse !== verse.verse);
      } else {
        const newSelectedVerses = [...prevSelectedVerses, verse];
        newSelectedVerses.sort((a, b) => a.verse - b.verse);
        return newSelectedVerses;
      }
    });
  };

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
            <Paragraph
              style={[
                styles.paragraph,
                { fontSize, lineHeight, fontFamily },
              ]}
            >
              {verses.map((verse, index) => {
                const isSelected = selectedVerses.some(
                  (v) => v.verse === verse.verse
                );

                return (
                  <Text
                    key={verse.verse}
                    style={isSelected ? styles.selectedVerse : {}}
                    onPress={() => handleVersePress(verse)}
                  >
                    {index > 0 && ' '}
                    <Text style={styles.verseNumber}>
                      {toSuperscript(verse.verse)}{' '}
                    </Text>
                    {decode(verse.text.replace(/<[^>]+>/g, ''))}
                  </Text>
                );
              })}
            </Paragraph>
          </ScrollView>
        )}
        {selectedVerses.length > 0 ? (
          <View style={styles.selectionOptionsBar}>
            <IconButton icon="content-copy" onPress={() => {}} />
            <IconButton icon="share-variant" onPress={() => {}} />
            <IconButton icon="bookmark-outline" onPress={() => {}} />
            <IconButton icon="close" onPress={() => setSelectedVerses([])} />
          </View>
        ) : (
          <>
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
              disabled={
                loading ||
                !selectedBook ||
                selectedChapter === selectedBook.chapters
              }
            />
          </>
        )}
      </View>
    </Portal.Host>
  );
} 
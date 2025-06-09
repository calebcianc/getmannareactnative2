import { MaterialIcons } from '@expo/vector-icons';
import { decode } from 'html-entities';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  FAB,
  Menu,
  Paragraph,
  Text,
  useTheme
} from 'react-native-paper';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import ExpoundBottomSheet from '../components/ExpoundBottomSheet';
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
      paddingBottom: 200,
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
      paddingBottom: 12,
      paddingTop: 24,
      borderRadius: 28,
      backgroundColor: theme.colors.surfaceVariant,
      elevation: 4,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.outline,
    },
    pullDownHandle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.onSurfaceVariant,
      alignSelf: 'center',
      position: 'absolute',
      top: 10,
    },
    actionsScrollView: {
      paddingHorizontal: 8,
      marginTop: 12,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 10,
      marginHorizontal: 4,
    },
    actionButtonText: {
      marginLeft: 8,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    expoundButtonContainer: {
      marginHorizontal: 12,
    },
    expoundButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    expoundButtonText: {
      marginLeft: 8,
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      flexShrink: 1,
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
    headerButtonText: {
      fontSize: 18,
      fontWeight: '600',
    },
    headerRight: {
      flexDirection: 'row',
    },
  });

const BibleScreen = () => {
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
    selectedTranslation,
  } = useBible();

  const [selectedVerses, setSelectedVerses] = useState([]);
  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [isHighlightMenuVisible, setHighlightMenuVisible] = useState(false);
  const scrollViewRef = useRef(null);
  const translateY = useSharedValue(0);
  const startY = useSharedValue(0);

  const dismiss = () => {
    setSelectedVerses([]);
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      translateY.value = startY.value + event.translationY;
    })
    .onEnd(() => {
      if (translateY.value > 100) {
        translateY.value = withTiming(500, {}, () => {
          runOnJS(dismiss)();
        });
      } else {
        translateY.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  useEffect(() => {
    if (selectedVerses.length === 0) {
      translateY.value = 0; // Reset position when selection is cleared
    }
  }, [selectedVerses]);

  useEffect(() => {
    setSelectedVerses([]);
  }, [selectedBook, selectedChapter, selectedTranslation]);

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

  const flingLeft = Gesture.Fling()
    .direction(Gesture.RIGHT)
    .onEnd(handlePrevChapter);
  const flingRight = Gesture.Fling()
    .direction(Gesture.LEFT)
    .onEnd(handleNextChapter);

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

  const showBottomSheet = () => setBottomSheetVisible(true);
  const hideBottomSheet = () => {
    setBottomSheetVisible(false);
    setSelectedVerses([]);
  };

  const openHighlightMenu = () => setHighlightMenuVisible(true);
  const closeHighlightMenu = () => setHighlightMenuVisible(false);

  const getVerseRange = (verses) => {
    if (!verses || verses.length === 0) return '';
    const verseNumbers = verses.map((v) => v.verse);

    if (verseNumbers.length === 1) {
      return verseNumbers[0];
    }

    const ranges = [];
    let start = verseNumbers[0];
    let end = verseNumbers[0];

    for (let i = 1; i < verseNumbers.length; i++) {
      if (verseNumbers[i] === end + 1) {
        end = verseNumbers[i];
      } else {
        if (start === end) {
          ranges.push(start.toString());
        } else {
          ranges.push(`${start}-${end}`);
        }
        start = verseNumbers[i];
        end = verseNumbers[i];
      }
    }

    if (start === end) {
      ranges.push(start.toString());
    } else {
      ranges.push(`${start}-${end}`);
    }

    return ranges.join(', ');
  };

  const verseRef = `${selectedBook?.name} ${selectedChapter}:${getVerseRange(selectedVerses)}`;
  const expoundText = `Expound on ${verseRef}`;

  const firstRowActions = [
    {
      label: 'Highlight',
      icon: 'highlight',
      onPress: openHighlightMenu,
      menu: (
        <Menu
          visible={isHighlightMenuVisible}
          onDismiss={closeHighlightMenu}
          anchor={
            <Pressable style={styles.actionButton} onPress={openHighlightMenu}>
              <MaterialIcons name="highlight" size={20} color={theme.colors.onSurface} />
              <Text style={styles.actionButtonText}>Highlight</Text>
            </Pressable>
          }
        >
          <Menu.Item onPress={() => {}} title="Yellow" leadingIcon={() => <View style={{width: 16, height: 16, borderRadius: 8, backgroundColor: 'yellow'}} />} />
          <Menu.Item onPress={() => {}} title="Blue" leadingIcon={() => <View style={{width: 16, height: 16, borderRadius: 8, backgroundColor: 'lightblue'}} />} />
          <Menu.Item onPress={() => {}} title="Green" leadingIcon={() => <View style={{width: 16, height: 16, borderRadius: 8, backgroundColor: 'lightgreen'}} />} />
        </Menu>
      ),
    },
    { label: 'Notes', icon: 'edit-note', onPress: () => {} },
    { label: 'Copy', icon: 'content-copy', onPress: () => {} },
    { label: 'Share', icon: 'share', onPress: () => {} },
    { label: 'Bookmark', icon: 'bookmark-border', onPress: () => {} },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <GestureDetector gesture={Gesture.Simultaneous(flingLeft, flingRight)}>
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
        </GestureDetector>
      )}
      {selectedVerses.length > 0 ? (
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.selectionOptionsBar, animatedStyle]}>
            <View style={styles.pullDownHandle} />

            <View style={styles.expoundButtonContainer}>
              <Pressable style={styles.expoundButton} onPress={showBottomSheet}>
                <MaterialIcons name="manage-search" size={24} color={theme.colors.onSurface} />
                <Text style={styles.expoundButtonText} numberOfLines={1} ellipsizeMode="tail">{expoundText}</Text>
              </Pressable>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionsScrollView}>
              {firstRowActions.map((action, index) =>
                action.menu ? (
                  action.menu
                ) : (
                  <Pressable key={index} style={styles.actionButton} onPress={action.onPress}>
                    <MaterialIcons name={action.icon} size={20} color={theme.colors.onSurface} />
                    <Text style={styles.actionButtonText}>{action.label}</Text>
                  </Pressable>
                )
              )}
            </ScrollView>
          </Animated.View>
        </GestureDetector>
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
      <ExpoundBottomSheet
        visible={isBottomSheetVisible}
        onDismiss={hideBottomSheet}
        selectedVerses={selectedVerses}
        book={selectedBook}
        chapter={selectedChapter}
      />
    </View>
  );
}

export default BibleScreen; 
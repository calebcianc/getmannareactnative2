import { MaterialIcons } from "@expo/vector-icons";
import { decode } from "html-entities";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { FAB, IconButton, Paragraph, Text, TextInput, useTheme } from "react-native-paper";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import ColorPicker from "../components/ColorPicker";
// import ExpoundBottomSheet from "../components/ExpoundBottomSheet";
import { useBottomSheet } from "../_layout";
import { useBible } from "../context/BibleProvider";

const HIGHLIGHT_COLORS = {
  yellow: '#FFD700',
  blue: '#87CEEB',
  green: '#90EE90',
  pink: '#FFB6C1',
  orange: '#FFA500',
  purple: '#DDA0DD',
};

const toSuperscript = (str) => {
  const superscripts = {
    0: "⁰",
    1: "¹",
    2: "²",
    3: "³",
    4: "⁴",
    5: "⁵",
    6: "⁶",
    7: "⁷",
    8: "⁸",
    9: "⁹",
  };
  return String(str)
    .split("")
    .map((char) => superscripts[char] || char)
    .join("");
};

const getStyles = (theme, marginSize = 20) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    loader: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    content: {
      paddingHorizontal: marginSize,
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
      fontWeight: "bold",
      color: theme.colors.tertiary,
    },
    selectedVerse: {
      backgroundColor: theme.dark
        ? "rgba(255, 255, 255, 0.12)"
        : "rgba(0, 0, 0, 0.08)",
      borderRadius: 6,
      textDecorationLine: "underline",
      textDecorationStyle: "dotted",
      textDecorationColor: theme.colors.onSurface,
    },
    highlightedVerse: {
      borderRadius: 6,
      paddingHorizontal: 2,
      paddingVertical: 1,
    },
    fabLeft: {
      position: "absolute",
      margin: 15,
      left: 0,
      bottom: 0,
      borderRadius: 28,
      elevation: 0,
      backgroundColor: theme.colors.surfaceVariant,
    },
    fabRight: {
      position: "absolute",
      margin: 15,
      right: 0,
      bottom: 0,
      borderRadius: 28,
      elevation: 0,
      backgroundColor: theme.colors.surfaceVariant,
    },
    selectionOptionsBar: {
      position: "absolute",
      bottom: 15,
      left: 15,
      right: 15,
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
      alignSelf: "center",
      position: "absolute",
      top: 10,
    },
    actionsScrollView: {
      paddingHorizontal: 8,
      marginTop: 12,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 10,
      marginHorizontal: 4,
    },
    actionButtonText: {
      marginLeft: 8,
      fontWeight: "bold",
      color: theme.colors.onSurface,
    },
    expoundButtonContainer: {
      marginHorizontal: 12,
      width: '95%',
      alignSelf: 'center',
      justifyContent: 'center',
      alignItems: 'center',
      display: 'flex',
    },
    expoundButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 12,
      width: '100%',
      height: '100%',
    },
    expoundButtonText: {
      marginLeft: 8,
      fontSize: 18,
      fontWeight: "bold",
      color: theme.colors.onSurface,
      flexShrink: 1,
    },
    highlightButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.primary,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 10,
      marginHorizontal: 4,
    },
    highlightButtonText: {
      marginLeft: 8,
      fontWeight: "bold",
      color: theme.colors.onPrimary,
    },
    chaptersContainer: {
      paddingVertical: 10,
    },
    chapterItemContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 12,
      margin: 5,
      borderRadius: 8,
      backgroundColor: theme.colors.surfaceVariant,
    },
    chapterItem: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.colors.onSurfaceVariant,
    },
    headerButtonText: {
      fontSize: 18,
      fontWeight: "600",
    },
    headerRight: {
      flexDirection: "row",
    },
  });

const NOTES_LIST_MAX_HEIGHT = Dimensions.get('window').height * 0.4;
const NOTE_LINE_HEIGHT = 20;
const NOTE_MAX_HEIGHT = NOTE_LINE_HEIGHT * 5;

const BibleScreen = () => {
  const theme = useTheme();
  const { marginSize, ...bibleContext } = useBible();
  const styles = getStyles(theme, marginSize);
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
    isHistoryViewOpen,
    closeHistoryView,
    highlights,
    addHighlight,
    removeHighlight,
    getHighlight,
    getVerseKey,
    addHighlightBatch,
    removeHighlightBatch,
    notes,
    addNotes,
    getNotesForVerses,
  } = bibleContext;

  const [selectedVerses, setSelectedVerses] = useState([]);
  const [isHighlightMenuVisible, setHighlightMenuVisible] = useState(false);
  const [isHighlightMode, setIsHighlightMode] = useState(false);
  const [selectedHighlightColor, setSelectedHighlightColor] = useState(null);
  const [isNotesMode, setIsNotesMode] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [editingNote, setEditingNote] = useState(null);
  const scrollViewRef = useRef(null);
  const translateY = useSharedValue(0);
  const startY = useSharedValue(0);
  const noteInputRef = useRef(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const animatedKeyboardHeight = useSharedValue(0);
  const { showBottomSheet } = useBottomSheet();

  const dismiss = () => {
    setSelectedVerses([]);
    setIsHighlightMode(false);
    setSelectedHighlightColor(null);
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
    if (isHistoryViewOpen) {
      showBottomSheet({
        selectedVerses,
        book: selectedBook,
        chapter: selectedChapter,
        openInHistoryView: isHistoryViewOpen,
      });
    }
  }, [isHistoryViewOpen]);

  useEffect(() => {
    setSelectedVerses([]);
  }, [selectedBook, selectedChapter, selectedTranslation]);

  useEffect(() => {
    if (!loading && scrollViewRef.current) {
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({
            y: scrollPosition,
            animated: false,
          });
        }
      }, 100);
    }
  }, [loading]);

  useEffect(() => {
    const onKeyboardShow = (e) => {
      const height = e.endCoordinates ? e.endCoordinates.height : 0;
      setKeyboardHeight(height);
      animatedKeyboardHeight.value = withTiming(height, { duration: 250 });
    };
    const onKeyboardHide = () => {
      setKeyboardHeight(0);
      animatedKeyboardHeight.value = withTiming(0, { duration: 250 });
    };
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, onKeyboardShow);
    const hideSub = Keyboard.addListener(hideEvent, onKeyboardHide);
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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

  const openHighlightMenu = () => setHighlightMenuVisible(true);
  const closeHighlightMenu = () => setHighlightMenuVisible(false);

  // Helper to clear all modes
  const clearAllModes = () => {
    setIsHighlightMode(false);
    setIsNotesMode(false);
    setSelectedHighlightColor(null);
    setNoteText("");
  };

  const toggleHighlightMode = () => {
    if (isHighlightMode) {
      setIsHighlightMode(false);
      setSelectedHighlightColor(null);
    } else {
      clearAllModes();
      setIsHighlightMode(true);
    }
  };

  const handleNotesPress = () => {
    if (isNotesMode) {
      setIsNotesMode(false);
      setNoteText("");
    } else {
      clearAllModes();
      setIsNotesMode(true);
      setTimeout(() => {
        noteInputRef.current?.focus();
      }, 100);
    }
  };

  // Stateless actions
  const handleCopyPress = () => {
    clearAllModes();
    // ...copy logic here
  };
  const handleSharePress = () => {
    clearAllModes();
    // ...share logic here
  };
  const handleBookmarkPress = () => {
    clearAllModes();
    // ...bookmark logic here
  };

  // Highlight functions
  const handleColorSelect = async (color) => {
    if (!selectedVerses.length) return;
    
    // Batch update highlights for all selected verses
    const verseKeys = selectedVerses.map(verse => 
      getVerseKey(selectedBook.bookid, selectedChapter, verse.verse)
    );
    
    // Create a new highlights object
    const newHighlights = { ...highlights };
    verseKeys.forEach(verseKey => {
      newHighlights[verseKey] = color;
    });
    
    // Update state and AsyncStorage once
    await addHighlightBatch(newHighlights);
    setSelectedHighlightColor(color);
    setTimeout(() => {
      setIsHighlightMode(false);
      setSelectedVerses([]);
    }, 500);
  };

  const handleRemoveHighlight = async () => {
    if (!selectedVerses.length) return;
    
    const verseKeys = selectedVerses.map(verse => 
      getVerseKey(selectedBook.bookid, selectedChapter, verse.verse)
    );
    
    // Batch remove highlight from all selected verses
    await removeHighlightBatch(verseKeys);
    setIsHighlightMode(false);
    setSelectedVerses([]);
  };

  const getVerseHighlight = (verse) => {
    const verseKey = getVerseKey(selectedBook.bookid, selectedChapter, verse.verse);
    return getHighlight(verseKey);
  };

  const hasExistingHighlight = () => {
    return selectedVerses.some(verse => getVerseHighlight(verse));
  };

  const getExistingHighlightColor = () => {
    const highlightedVerse = selectedVerses.find(verse => getVerseHighlight(verse));
    return highlightedVerse ? getVerseHighlight(highlightedVerse) : null;
  };

  const getVerseRange = (verses) => {
    if (!verses || verses.length === 0) return "";
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

    return ranges.join(", ");
  };

  const verseRef = `${selectedBook?.name} ${selectedChapter}:${getVerseRange(
    selectedVerses
  )}`;
  const expoundText = `Expound on ${verseRef}`;

  const handleCloseNotes = () => {
    setIsNotesMode(false);
    setNoteText("");
  };

  // Edit note handler
  const handleEditNote = (note) => {
    setNoteText(note.text);
    setEditingNote(note);
    setTimeout(() => {
      noteInputRef.current?.focus();
    }, 100);
  };

  // Delete note handler
  const handleDeleteNote = async (note) => {
    // Remove this note from all selected verses that have this note text
    const verseKeysToDelete = selectedVerseKeys.filter(
      (key) => notes[key] && notes[key].text === note.text
    );
    await addNotes(verseKeysToDelete, "");
  };

  // Update handleSaveNote to support editing
  const handleSaveNote = async () => {
    if (!selectedVerses.length || !noteText.trim()) {
      setIsNotesMode(false);
      setNoteText("");
      setEditingNote(null);
      return;
    }
    const verseKeys = selectedVerses.map(verse => getVerseKey(selectedBook.bookid, selectedChapter, verse.verse));
    await addNotes(verseKeys, noteText.trim());
    setIsNotesMode(false);
    setNoteText("");
    setEditingNote(null);
  };

  // Format date helper
  const formatNoteDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Get notes for selected verses
  const selectedVerseKeys = selectedVerses.map(verse => getVerseKey(selectedBook.bookid, selectedChapter, verse.verse));
  const notesForSelected = getNotesForVerses(selectedVerseKeys);

  const firstRowActions = [
    {
      label: "Highlight",
      icon: "highlight",
      onPress: toggleHighlightMode,
      isSelected: isHighlightMode,
    },
    { label: "Notes", icon: "edit-note", onPress: handleNotesPress, isSelected: isNotesMode },
    { label: "Copy", icon: "content-copy", onPress: handleCopyPress, isSelected: false },
    { label: "Share", icon: "share", onPress: handleSharePress, isSelected: false },
    { label: "Bookmark", icon: "bookmark-border", onPress: handleBookmarkPress, isSelected: false },
  ];

  // Animated style for expound container
  const keyboardAvoidingStyle = useAnimatedStyle(() => ({
    bottom: animatedKeyboardHeight.value > 0 ? animatedKeyboardHeight.value - 90 : 15,
  }));

  const handleExpoundPress = () => {
    showBottomSheet({
      selectedVerses,
      book: selectedBook,
      chapter: selectedChapter,
      openInHistoryView: isHistoryViewOpen,
    });
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
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
              style={[styles.paragraph, { fontSize, lineHeight, fontFamily }]}
            >
              {verses.map((verse, index) => {
                const isSelected = selectedVerses.some(
                  (v) => v.verse === verse.verse
                );
                const highlightColor = getVerseHighlight(verse);
                const verseKey = getVerseKey(selectedBook.bookid, selectedChapter, verse.verse);
                const hasNote = !!notes[verseKey] && !!notes[verseKey].text;

                return (
                  <Text
                    key={verse.verse}
                    style={[
                      isSelected ? styles.selectedVerse : {},
                      highlightColor && {
                        ...styles.highlightedVerse,
                        backgroundColor: HIGHLIGHT_COLORS[highlightColor],
                      },
                    ]}
                    onPress={() => handleVersePress(verse)}
                  >
                    {index > 0 && " "}
                    <Text style={styles.verseNumber}>
                      {toSuperscript(verse.verse)}{" "}
                      {hasNote && (
                        <MaterialIcons name="edit-note" size={14} color={theme.colors.primary} />
                      )}
                    </Text>
                    {decode(verse.text.replace(/<[^>]+>/g, ""))}
                  </Text>
                );
              })}
            </Paragraph>
          </ScrollView>
        </GestureDetector>
      )}
      {selectedVerses.length > 0 ? (
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.selectionOptionsBar, animatedStyle, keyboardAvoidingStyle]}>
            <View style={styles.pullDownHandle} />

            <View
              style={[
                styles.expoundButtonContainer,
                !isNotesMode && { minHeight: 64, height: 64 },
              ]}
            >
              {isHighlightMode ? (
                <ColorPicker
                  onColorSelect={handleColorSelect}
                  onRemoveHighlight={handleRemoveHighlight}
                  selectedColor={selectedHighlightColor}
                  hasExistingHighlight={hasExistingHighlight()}
                  existingColor={getExistingHighlightColor()}
                />
              ) : isNotesMode ? (
                <View style={{ width: '100%' }}>
                  {notesForSelected.length > 0 && (
                    <ScrollView style={{ marginBottom: 8, maxHeight: NOTES_LIST_MAX_HEIGHT }}>
                      {notesForSelected.map((note, idx) => (
                        <View key={idx} style={{ backgroundColor: theme.colors.surfaceVariant, borderRadius: 10, padding: 10, marginBottom: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <View style={{ flex: 1 }}>
                            <ScrollView style={{ maxHeight: NOTE_MAX_HEIGHT }}>
                              <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 15, lineHeight: NOTE_LINE_HEIGHT }} numberOfLines={5}>
                                {note.text}
                              </Text>
                            </ScrollView>
                            <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12, marginTop: 2, opacity: 0.7 }}>{formatNoteDate(note.date)}</Text>
                          </View>
                          <View style={{ flexDirection: 'row', marginLeft: 8 }}>
                            <IconButton icon="pencil" size={18} onPress={() => handleEditNote(note)} />
                            <IconButton icon="delete" size={18} onPress={() => handleDeleteNote(note)} />
                          </View>
                        </View>
                      ))}
                    </ScrollView>
                  )}
                  <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                    <TextInput
                      ref={noteInputRef}
                      value={noteText}
                      onChangeText={setNoteText}
                      placeholder="Write a note..."
                      style={{ flex: 1, backgroundColor: 'transparent' }}
                      autoFocus
                      underlineColor="transparent"
                      activeUnderlineColor="transparent"
                    />
                    {noteText.length > 0 ? (
                      <>
                        <IconButton icon="close" onPress={handleCloseNotes} />
                        <IconButton icon="check" onPress={handleSaveNote} />
                      </>
                    ) : (
                      <IconButton icon="close" onPress={handleCloseNotes} />
                    )}
                  </View>
                </View>
              ) : (
                <Pressable style={styles.expoundButton} onPress={handleExpoundPress}>
                  <MaterialIcons
                    name="manage-search"
                    size={24}
                    color={theme.colors.onSurface}
                  />
                  <Text
                    style={styles.expoundButtonText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {expoundText}
                  </Text>
                </Pressable>
              )}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.actionsScrollView}
            >
              {firstRowActions.map((action) => (
                <Pressable
                  key={action.label}
                  style={[
                    styles.actionButton,
                    action.isSelected && styles.highlightButton,
                  ]}
                  onPress={action.onPress}
                >
                  <MaterialIcons
                    name={action.icon}
                    size={20}
                    color={
                      action.isSelected
                        ? theme.colors.onPrimary
                        : theme.colors.onSurface
                    }
                  />
                  <Text
                    style={[
                      styles.actionButtonText,
                      action.isSelected && styles.highlightButtonText,
                    ]}
                  >
                    {action.label}
                  </Text>
                </Pressable>
              ))}
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
    </View>
  );
};

export default BibleScreen;

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { PROTESTANT_BOOKS } from "../../utils/bible";

const BibleContext = createContext();

const ALLOWED_TRANSLATIONS = [
  { short_name: "ESV", full_name: "English Standard Version" },
  { short_name: "KJV", full_name: "King James Version" },
  { short_name: "NASB", full_name: "New American Standard Bible" },
  { short_name: "NIV", full_name: "New International Version" },
  { short_name: "NKJV", full_name: "New King James Version" },
  { short_name: "NLT", full_name: "New Living Translation" },
  { short_name: "YLT", full_name: "Young's Literal Translation" },
];

export function useBible() {
  return useContext(BibleContext);
}

export function BibleProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState([]);
  const [selectedTranslation, setSelectedTranslation] = useState("NLT");
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [verses, setVerses] = useState([]);
  const [isBookModalVisible, setBookModalVisible] = useState(false);
  const [isTranslationModalVisible, setTranslationModalVisible] =
    useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(28);
  const [fontFamily, setFontFamily] = useState(undefined);

  // State to hold initial values from storage
  const [initialState, setInitialState] = useState(null);

  const FONT_SIZE_STEP = 1;
  const LINE_HEIGHT_STEP = 2;

  const increaseFontSize = () => setFontSize((prev) => prev + FONT_SIZE_STEP);
  const decreaseFontSize = () => setFontSize((prev) => prev - FONT_SIZE_STEP);
  const increaseLineHeight = () =>
    setLineHeight((prev) => prev + LINE_HEIGHT_STEP);
  const decreaseLineHeight = () =>
    setLineHeight((prev) => prev - LINE_HEIGHT_STEP);

  // 1. Load settings from storage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settingsString = await AsyncStorage.getItem("bibleSettings");
        if (settingsString) {
          const settings = JSON.parse(settingsString);
          setInitialState(settings);
          // Apply non-book-related settings immediately
          if (settings.selectedTranslation)
            setSelectedTranslation(settings.selectedTranslation);
          if (settings.fontSize) setFontSize(settings.fontSize);
          if (settings.lineHeight) setLineHeight(settings.lineHeight);
        }
      } catch (e) {
        console.error("Failed to load bible settings.", e);
      } finally {
        setLoading(false); // Stop loading after attempting to read from storage
      }
    };
    loadSettings();
  }, []);

  // 2. Save settings whenever they change
  useEffect(() => {
    const saveSettings = async () => {
      // Don't save during initial loading or if book isn't set yet
      if (loading || !selectedBook) return;
      try {
        const settings = {
          selectedTranslation,
          selectedBookId: selectedBook?.bookid,
          selectedChapter,
          fontSize,
          lineHeight,
        };
        const settingsString = JSON.stringify(settings);
        await AsyncStorage.setItem("bibleSettings", settingsString);
      } catch (e) {
        console.error("Failed to save bible settings.", e);
      }
    };
    saveSettings();
  }, [
    selectedTranslation,
    selectedBook,
    selectedChapter,
    fontSize,
    lineHeight,
    loading,
  ]);

  // 3. Fetch books when translation changes
  useEffect(() => {
    if (!selectedTranslation) return;
    setLoading(true);
    fetch(`https://bolls.life/get-books/${selectedTranslation}/`)
      .then((response) => response.json())
      .then((data) => {
        const filteredBooks = data.filter((b) =>
          PROTESTANT_BOOKS.includes(b.name)
        );
        setBooks(filteredBooks);

        if (filteredBooks.length > 0) {
          let bookToSet = selectedBook;
          let chapterToSet = selectedChapter;

          // If we have initial settings, try to apply them
          if (initialState) {
            const foundBook = filteredBooks.find(
              (b) => b.bookid === initialState.selectedBookId
            );
            if (foundBook) {
              bookToSet = foundBook;
              chapterToSet =
                initialState.selectedChapter > foundBook.chapters
                  ? foundBook.chapters
                  : initialState.selectedChapter;
            } else {
              bookToSet = filteredBooks[0];
              chapterToSet = 1;
            }
            setInitialState(null); // Clear initial state after applying it
          } else if (
            !selectedBook ||
            !books.some((b) => b.bookid === selectedBook.bookid)
          ) {
            // If no book is selected or the selected book is not in the new translation, default to the first book
            bookToSet = filteredBooks[0];
            chapterToSet = 1;
          }

          setSelectedBook(bookToSet);
          setSelectedChapter(chapterToSet);
        }
      })
      .catch((error) => console.error("Failed to fetch books:", error))
      .finally(() => setLoading(false));
  }, [selectedTranslation]);

  // 4. Fetch verses when book or chapter changes
  useEffect(() => {
    if (selectedBook) {
      setLoading(true);
      fetch(
        `https://bolls.life/get-text/${selectedTranslation}/${selectedBook.bookid}/${selectedChapter}/`
      )
        .then((response) => response.json())
        .then(setVerses)
        .catch((error) => console.error("Failed to fetch verses:", error))
        .finally(() => setLoading(false));
    }
  }, [selectedBook, selectedChapter, selectedTranslation]);

  const value = {
    loading,
    translations: ALLOWED_TRANSLATIONS,
    books,
    selectedTranslation,
    setSelectedTranslation,
    selectedBook,
    setSelectedBook,
    selectedChapter,
    setSelectedChapter,
    verses,
    isBookModalVisible,
    setBookModalVisible,
    isTranslationModalVisible,
    setTranslationModalVisible,
    scrollPosition,
    setScrollPosition,
    fontSize,
    lineHeight,
    fontFamily,
    increaseFontSize,
    decreaseFontSize,
    increaseLineHeight,
    decreaseLineHeight,
  };

  return (
    <BibleContext.Provider value={value}>{children}</BibleContext.Provider>
  );
}

export default BibleProvider;

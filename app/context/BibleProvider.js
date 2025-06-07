import React, { createContext, useContext, useEffect, useState } from 'react';
import { PROTESTANT_BOOKS } from '../utils/bible';

const BibleContext = createContext();

const ALLOWED_TRANSLATIONS = [
  { short_name: 'ESV', full_name: 'English Standard Version' },
  { short_name: 'KJV', full_name: 'King James Version' },
  { short_name: 'NASB', full_name: 'New American Standard Bible' },
  { short_name: 'NIV', full_name: 'New International Version' },
  { short_name: 'NKJV', full_name: 'New King James Version' },
  { short_name: 'NLT', full_name: 'New Living Translation' },
  { short_name: 'YLT', full_name: "Young's Literal Translation" },
];

export function useBible() {
  return useContext(BibleContext);
}

export function BibleProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState([]);
  const [selectedTranslation, setSelectedTranslation] = useState('NLT');
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [verses, setVerses] = useState([]);
  const [isBookModalVisible, setBookModalVisible] = useState(false);
  const [isTranslationModalVisible, setTranslationModalVisible] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    if (selectedTranslation) {
      setLoading(true);
      fetch(`https://bolls.life/get-books/${selectedTranslation}/`)
        .then((response) => response.json())
        .then((data) => {
          const filteredBooks = data.filter((b) =>
            PROTESTANT_BOOKS.includes(b.name)
          );
          setBooks(filteredBooks);
          if (filteredBooks.length > 0) {
            if (selectedBook) {
              const newBookData = filteredBooks.find(
                (b) => b.name === selectedBook.name
              );
              if (newBookData) {
                if (selectedChapter > newBookData.chapters) {
                  setSelectedChapter(newBookData.chapters);
                }
                setSelectedBook(newBookData);
              } else {
                setSelectedBook(filteredBooks[0]);
                setSelectedChapter(1);
              }
            } else {
              setSelectedBook(filteredBooks[0]);
              setSelectedChapter(1);
            }
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error('Failed to fetch books:', error);
          setLoading(false);
        });
    }
  }, [selectedTranslation]);

  useEffect(() => {
    if (selectedBook) {
      setLoading(true);
      fetch(
        `https://bolls.life/get-text/${selectedTranslation}/${selectedBook.bookid}/${selectedChapter}/`
      )
        .then((response) => response.json())
        .then((data) => {
          setVerses(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
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
  };

  return (
    <BibleContext.Provider value={value}>{children}</BibleContext.Provider>
  );
} 
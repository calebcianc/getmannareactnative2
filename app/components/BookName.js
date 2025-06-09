import { Text } from 'react-native-paper';

export const BookName = ({ book, chapter, style }) => {
  const maxLength = 11;
  const displayName =
    book.name.length > maxLength
      ? book.name.substring(0, maxLength) + '...'
      : book.name;

  return (
    <Text style={style}>
      {displayName} {chapter}
    </Text>
  );
};

export default BookName; 
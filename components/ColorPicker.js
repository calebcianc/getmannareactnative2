import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

const HIGHLIGHT_COLORS = [
  { name: 'Yellow', color: '#FFD700', value: 'yellow' },
  { name: 'Blue', color: '#87CEEB', value: 'blue' },
  { name: 'Green', color: '#90EE90', value: 'green' },
  { name: 'Pink', color: '#FFB6C1', value: 'pink' },
  { name: 'Orange', color: '#FFA500', value: 'orange' },
  { name: 'Purple', color: '#DDA0DD', value: 'purple' },
];

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 0,
      marginHorizontal: 12,
      width: '100%',
      height: '100%',
    },
    colorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 4,
    },
    colorButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 2,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    selectedColorButton: {
      borderColor: theme.colors.onSurface,
    },
    removeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.errorContainer,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 8,
    },
    colorText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      marginLeft: 8,
    },
  });

const ColorPicker = ({ 
  onColorSelect, 
  onRemoveHighlight, 
  selectedColor, 
  hasExistingHighlight,
  existingColor 
}) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      {HIGHLIGHT_COLORS.map((colorOption) => {
        const isExistingColor = hasExistingHighlight && existingColor === colorOption.value;
        const isSelected = selectedColor === colorOption.value;
        
        // If this is the existing highlight color, clicking removes the highlight
        const handlePress = isExistingColor
          ? onRemoveHighlight
          : () => onColorSelect(colorOption.value);
        
        return (
          <View key={colorOption.value} style={styles.colorContainer}>
            <Pressable
              style={[
                styles.colorButton,
                { backgroundColor: colorOption.color },
                (isSelected || isExistingColor) && styles.selectedColorButton,
              ]}
              onPress={handlePress}
            >
              {isSelected && (
                <MaterialIcons 
                  name="check" 
                  size={16} 
                  color={theme.colors.onSurface} 
                />
              )}
              {isExistingColor && !isSelected && (
                <MaterialIcons 
                  name="close" 
                  size={16} 
                  color={theme.colors.error} 
                />
              )}
            </Pressable>
          </View>
        );
      })}
    </View>
  );
};

export default ColorPicker; 
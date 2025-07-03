import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import { IconButton, Text, TextInput, useTheme } from "react-native-paper";
import Animated from "react-native-reanimated";
import ColorPicker from "./ColorPicker";

const NOTES_LIST_MAX_HEIGHT = 200;
const NOTE_LINE_HEIGHT = 20;
const NOTE_MAX_HEIGHT = NOTE_LINE_HEIGHT * 5;

export function SelectionBar({
  animatedStyle,
  keyboardAvoidingStyle,
  panGesture,
  isHighlightMode,
  isNotesMode,
  notesForSelected,
  formatNoteDate,
  handleEditNote,
  handleDeleteNote,
  noteInputRef,
  noteText,
  setNoteText,
  handleCloseNotes,
  handleSaveNote,
  handleExpoundPress,
  expoundText,
  firstRowActions,
  handleColorSelect,
  handleRemoveHighlight,
  selectedHighlightColor,
  hasExistingHighlight,
  getExistingHighlightColor,
}) {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.selectionOptionsBar,
          animatedStyle,
          keyboardAvoidingStyle,
        ]}
      >
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
            <View style={{ width: "100%" }}>
              {notesForSelected.length > 0 && (
                <ScrollView
                  style={{
                    marginBottom: 8,
                    maxHeight: NOTES_LIST_MAX_HEIGHT,
                  }}
                >
                  {notesForSelected.map((note, idx) => (
                    <View
                      key={idx}
                      style={{
                        backgroundColor: theme.colors.surfaceVariant,
                        borderRadius: 10,
                        padding: 10,
                        marginBottom: 4,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <ScrollView style={{ maxHeight: NOTE_MAX_HEIGHT }}>
                          <Text
                            style={{
                              color: theme.colors.onSurfaceVariant,
                              fontSize: 15,
                              lineHeight: NOTE_LINE_HEIGHT,
                            }}
                            numberOfLines={5}
                          >
                            {note.text}
                          </Text>
                        </ScrollView>
                        <Text
                          style={{
                            color: theme.colors.onSurfaceVariant,
                            fontSize: 12,
                            marginTop: 2,
                            opacity: 0.7,
                          }}
                        >
                          {formatNoteDate(note.date)}
                        </Text>
                      </View>
                      <View style={{ flexDirection: "row", marginLeft: 8 }}>
                        <IconButton
                          icon="pencil"
                          size={18}
                          onPress={() => handleEditNote(note)}
                        />
                        <IconButton
                          icon="delete"
                          size={18}
                          onPress={() => handleDeleteNote(note)}
                        />
                      </View>
                    </View>
                  ))}
                </ScrollView>
              )}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <TextInput
                  ref={noteInputRef}
                  value={noteText}
                  onChangeText={setNoteText}
                  placeholder="Write a note..."
                  style={{ flex: 1, backgroundColor: "transparent" }}
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
            <Pressable
              style={styles.expoundButton}
              onPress={handleExpoundPress}
            >
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
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
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
      width: "95%",
      alignSelf: "center",
      justifyContent: "center",
      alignItems: "center",
      display: "flex",
    },
    expoundButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 12,
      width: "100%",
      height: "100%",
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
  });

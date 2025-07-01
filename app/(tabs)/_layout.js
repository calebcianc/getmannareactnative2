import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Appbar, Portal, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BibleHeader } from "../../components/BibleHeader";
import GorhomBottomSheet from "../../components/GorhomBottomSheet";
import { useBottomSheet } from "../_layout";

export default function TabsLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { bottomSheetState, hideBottomSheet } = useBottomSheet();

  return (
    <Portal.Host>
      <Tabs
        screenOptions={{
          header: (props) =>
            props.route.name === "bible" ? (
              <Appbar.Header
                style={{
                  backgroundColor: theme.colors.surface,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.outlineVariant,
                }}
              >
                <BibleHeader />
              </Appbar.Header>
            ) : null,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.tertiary,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopWidth: 1,
            borderTopColor: theme.colors.outlineVariant,
            height: 55 + insets.bottom,
            paddingBottom: insets.bottom,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size, focused }) => (
              <MaterialIcons
                name={focused ? "home" : "home"}
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="bible"
          options={{
            title: "Bible",
            tabBarIcon: ({ color, size, focused }) => (
              <MaterialIcons
                name={focused ? "book" : "book"}
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color, size, focused }) => (
              <MaterialIcons
                name={focused ? "settings" : "settings"}
                size={size}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
      <GorhomBottomSheet
        visible={bottomSheetState.visible}
        onDismiss={hideBottomSheet}
        selectedVerses={bottomSheetState.selectedVerses}
        book={bottomSheetState.book}
        chapter={bottomSheetState.chapter}
        openInHistoryView={bottomSheetState.openInHistoryView}
      />
    </Portal.Host>
  );
}

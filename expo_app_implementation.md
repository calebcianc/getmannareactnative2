# 🌿 Expo + React Native Paper App Scaffold

A single-file implementation guide for an Expo app featuring:

* Latest Expo CLI command
* React Native Paper (Material 3)
* Poppins Google Font
* Bottom‑tab navigation (Home, Bible, Settings)
* Nature‑inspired colour palette

---

## Initialize the project

```bash
npx create-expo-app@latest . --yes
```

---

## Install dependencies

```bash
npm install   react-native-paper react-native-safe-area-context   @react-navigation/native @react-navigation/bottom-tabs   react-native-screens react-native-gesture-handler react-native-reanimated   react-native-vector-icons @expo/vector-icons   @expo-google-fonts/poppins expo-font expo-app-loading
```

---

## `App.js`

```jsx
import React from 'react';
import AppLoading from 'expo-app-loading';
import { useFonts, Poppins_400Regular } from '@expo-google-fonts/poppins';
import { PaperProvider, MD3LightTheme, configureFonts } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import MyTabs from './src/navigation/MyTabs';

const fontConfig = {
  default: {
    regular: { fontFamily: 'Poppins_400Regular', fontWeight: 'normal' },
  },
};

const theme = {
  ...MD3LightTheme,
  colors: {
    primary:  '#4CAF50',  // grass
    secondary:'#8BC34A',  // lighter grass
    background:'#E3F2FD', // sky
    surface:  '#FFFFFF',
    onPrimary:'#FFFFFF',
    onSecondary:'#263238',
    onBackground:'#263238',
    onSurface:'#263238',
  },
  fonts: configureFonts({ config: fontConfig }),
};

export default function App() {
  const [fontsLoaded] = useFonts({ Poppins_400Regular });
  if (!fontsLoaded) return <AppLoading />;

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <MyTabs />
      </NavigationContainer>
    </PaperProvider>
  );
}
```

---

## `src/navigation/MyTabs.js`

```jsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import BibleScreen from '../screens/BibleScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function MyTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Bible"
        component={BibleScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="book-open-page-variant" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="cog" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
```

---

## `src/screens/HomeScreen.js`

```jsx
import React from 'react';
import { ImageBackground, StyleSheet, View, Text } from 'react-native';

export default function HomeScreen() {
  return (
    <ImageBackground
      source={require('../../assets/bg.png')}  // pixel‑art background
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.center}>
        <Text style={styles.title}>Welcome Home</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, color: '#263238', fontFamily: 'Poppins_400Regular' },
});
```

> Copy `HomeScreen.js` to create placeholder files for `BibleScreen.js` and `SettingsScreen.js`.

---

## Colour palette (hex)

| Token        | Value   | Notes              |
|--------------|---------|--------------------|
| **Sky**      | #90CAF9 | background accent  |
| **Grass**    | #81C784 | primary tint       |
| **Ground**   | #6D4C41 | dark brown accent  |
| **Accent**   | #FFB300 | sun / highlight    |
| **Text**     | #263238 | on‑surface colour  |

---

## Project structure

```
.
├── assets/
│   └── bg.png
├── src/
│   ├── navigation/
│   │   └── MyTabs.js
│   └── screens/
│       ├── HomeScreen.js
│       ├── BibleScreen.js
│       └── SettingsScreen.js
├── App.js
└── package.json
```

---

## Run the app

```bash
npm start
```

Enjoy building your nature‑inspired Expo application!
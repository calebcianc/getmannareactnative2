import React, { useEffect } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { useTheme } from "react-native-paper";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const SkeletonLoader = ({ count = 3, height = 20 }) => {
  const theme = useTheme();
  const styles = getStyles(theme, height);
  const { width: screenWidth } = useWindowDimensions();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      progress.value,
      [0, 1],
      [-screenWidth, screenWidth],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.skeletonItem}>
          <Animated.View style={[styles.shimmer, animatedStyle]} />
        </View>
      ))}
    </View>
  );
};

const getStyles = (theme, height) =>
  StyleSheet.create({
    container: {
      paddingVertical: 10,
    },
    skeletonItem: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 4,
      height: height,
      marginBottom: 10,
      overflow: "hidden",
      width: "100%",
    },
    shimmer: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(255,255,255,0.2)",
    },
  });

export default SkeletonLoader;

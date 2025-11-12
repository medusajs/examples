import { Colors } from "@/constants/theme";
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

export function ProductSkeleton() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const skeletonColor = colorScheme === 'dark' ? '#333' : '#e0e0e0';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Main Image Skeleton with Pagination Dots */}
      <View style={styles.imageContainer}>
        <Animated.View
          style={[
            styles.imageSkeleton,
            { backgroundColor: skeletonColor, opacity },
          ]}
        />
        <View style={styles.pagination}>
          {[1, 2, 3].map((i) => (
            <Animated.View
              key={i}
              style={[
                styles.paginationDot,
                { backgroundColor: skeletonColor, opacity },
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.content}>
        {/* Title Skeleton */}
        <Animated.View
          style={[
            styles.titleSkeleton,
            { backgroundColor: skeletonColor, opacity },
          ]}
        />

        {/* Description Skeleton - 3 lines */}
        <View style={styles.descriptionContainer}>
          <Animated.View
            style={[
              styles.descriptionLine,
              { backgroundColor: skeletonColor, opacity, width: '100%' },
            ]}
          />
          <Animated.View
            style={[
              styles.descriptionLine,
              { backgroundColor: skeletonColor, opacity, width: '90%' },
            ]}
          />
          <Animated.View
            style={[
              styles.descriptionLine,
              { backgroundColor: skeletonColor, opacity, width: '70%' },
            ]}
          />
        </View>

        {/* Price Skeleton */}
        <Animated.View
          style={[
            styles.priceSkeleton,
            { backgroundColor: skeletonColor, opacity },
          ]}
        />

        {/* Options Skeleton */}
        <View style={styles.optionsContainer}>
          <Animated.View
            style={[
              styles.optionTitleSkeleton,
              { backgroundColor: skeletonColor, opacity },
            ]}
          />
          <View style={styles.optionButtons}>
            {[1, 2, 3].map((i) => (
              <Animated.View
                key={i}
                style={[
                  styles.optionButtonSkeleton,
                  { backgroundColor: skeletonColor, opacity },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Quantity Skeleton */}
        <View style={styles.quantityContainer}>
          <Animated.View
            style={[
              styles.quantityLabelSkeleton,
              { backgroundColor: skeletonColor, opacity },
            ]}
          />
          <View style={styles.quantityControls}>
            <Animated.View
              style={[
                styles.quantityButtonSkeleton,
                { backgroundColor: skeletonColor, opacity },
              ]}
            />
            <Animated.View
              style={[
                styles.quantityValueSkeleton,
                { backgroundColor: skeletonColor, opacity },
              ]}
            />
            <Animated.View
              style={[
                styles.quantityButtonSkeleton,
                { backgroundColor: skeletonColor, opacity },
              ]}
            />
          </View>
        </View>

        {/* Add to Cart Button Skeleton */}
        <Animated.View
          style={[
            styles.buttonSkeleton,
            { backgroundColor: skeletonColor, opacity },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  imageSkeleton: {
    width: '100%',
    height: 400,
  },
  pagination: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    padding: 20,
  },
  titleSkeleton: {
    height: 32,
    width: '70%',
    borderRadius: 4,
    marginBottom: 12,
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  descriptionLine: {
    height: 16,
    borderRadius: 4,
    marginBottom: 8,
  },
  priceSkeleton: {
    height: 36,
    width: '40%',
    borderRadius: 4,
    marginBottom: 24,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionTitleSkeleton: {
    height: 20,
    width: '30%',
    borderRadius: 4,
    marginBottom: 12,
  },
  optionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButtonSkeleton: {
    height: 40,
    width: 80,
    borderRadius: 8,
  },
  quantityContainer: {
    marginBottom: 32,
  },
  quantityLabelSkeleton: {
    height: 20,
    width: '25%',
    borderRadius: 4,
    marginBottom: 12,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButtonSkeleton: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  quantityValueSkeleton: {
    width: 30,
    height: 20,
    borderRadius: 4,
    marginHorizontal: 20,
  },
  buttonSkeleton: {
    height: 48,
    borderRadius: 8,
    marginTop: 8,
  },
});


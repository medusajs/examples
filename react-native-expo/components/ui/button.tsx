import { Colors } from "@/constants/theme";
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary";
  loading?: boolean;
}

export function Button({
  title,
  variant = "primary",
  loading = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const isPrimary = variant === "primary";
  const isDisabled = disabled || loading;
  
  // Primary button: white background with dark text in dark mode, tint background with white text in light mode
  const primaryBgColor = colorScheme === 'dark' ? '#fff' : colors.tint;
  const primaryTextColor = colorScheme === 'dark' ? '#000' : '#fff';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isPrimary ? { backgroundColor: primaryBgColor } : styles.secondaryButton,
        isDisabled && styles.disabled,
        style,
      ]}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? primaryTextColor : colors.tint} />
      ) : (
        <Text
          style={[
            styles.text,
            isPrimary ? { color: primaryTextColor } : { color: colors.tint },
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.5,
  },
});


import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatPrice } from "@/lib/format-price";
import type { HttpTypes } from "@medusajs/types";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CartItemProps {
  item: HttpTypes.StoreCartLineItem;
  currencyCode?: string;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

export const CartItem = React.memo(function CartItem({ item, currencyCode, onUpdateQuantity, onRemove }: CartItemProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const thumbnail = item.thumbnail || item.variant?.product?.thumbnail;
  const total = item.subtotal || 0;

  return (
    <View style={[styles.container, { borderBottomColor: colors.icon + "30" }]}>
      <Image
        source={{ uri: thumbnail || "https://via.placeholder.com/80" }}
        style={[styles.image, { backgroundColor: colors.imagePlaceholder }]}
        contentFit="cover"
      />
      <View style={styles.content}>
        <View style={styles.info}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {item.product_title || item.title}
          </Text>
          {item.variant_title && (
            <Text style={[styles.variant, { color: colors.icon }]}>
              {item.variant_title}
            </Text>
          )}
          <Text style={[styles.price, { color: colors.text }]}>
            {formatPrice(total, currencyCode)}
          </Text>
        </View>
        <View style={styles.actions}>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={[styles.quantityButton, { borderColor: colors.icon }]}
              onPress={() => onUpdateQuantity(Math.max(1, item.quantity - 1))}
            >
              <Text style={[styles.quantityButtonText, { color: colors.text }]}>-</Text>
            </TouchableOpacity>
            <Text style={[styles.quantity, { color: colors.text }]}>
              {item.quantity}
            </Text>
            <TouchableOpacity
              style={[styles.quantityButton, { borderColor: colors.icon }]}
              onPress={() => onUpdateQuantity(item.quantity + 1)}
            >
              <Text style={[styles.quantityButtonText, { color: colors.text }]}>+</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
            <IconSymbol size={20} name="trash" color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  variant: {
    fontSize: 12,
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  quantity: {
    marginHorizontal: 12,
    fontSize: 14,
    fontWeight: "600",
    minWidth: 20,
    textAlign: "center",
  },
  removeButton: {
    padding: 4,
  },
});


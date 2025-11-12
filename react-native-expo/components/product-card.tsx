import { Colors } from "@/constants/theme";
import { useRegion } from "@/context/region-context";
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatPrice } from "@/lib/format-price";
import type { HttpTypes } from "@medusajs/types";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ProductCardProps {
  product: HttpTypes.StoreProduct;
}

export const ProductCard = React.memo(function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { selectedRegion } = useRegion();

  const thumbnail = product.thumbnail || product.images?.[0]?.url;
  const variant = product.variants?.[0];
  
  // Get price from calculated_price.calculated_amount
  const priceAmount = variant?.calculated_price?.calculated_amount || 0
  
  // Use selected region's currency code
  const currencyCode = selectedRegion?.currency_code;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.background }]}
      onPress={() => router.push({
        pathname: `/(home)/product/${product.id}` as any,
        params: { title: product.title }
      })}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: thumbnail || "https://via.placeholder.com/200" }}
        style={[styles.image, { backgroundColor: colors.imagePlaceholder }]}
        contentFit="cover"
      />
      <View style={styles.content}>
        <Text
          style={[styles.title, { color: colors.text }]}
          numberOfLines={2}
        >
          {product.title}
        </Text>
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: colors.tint }]}>
            {formatPrice(priceAmount, currencyCode)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 8,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  price: {
    fontSize: 14,
    fontWeight: "400",
    flex: 1,
  },
});


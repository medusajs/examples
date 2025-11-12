import { ProductImageSlider } from '@/components/product-image-slider';
import { ProductSkeleton } from '@/components/product-skeleton';
import { Button } from '@/components/ui/button';
import { Toast } from '@/components/ui/toast';
import { Colors } from '@/constants/theme';
import { useCart } from '@/context/cart-context';
import { useRegion } from '@/context/region-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatPrice } from '@/lib/format-price';
import { isVariantInStock } from '@/lib/inventory';
import { sdk } from '@/lib/sdk';
import type { HttpTypes } from '@medusajs/types';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProductDetailsScreen() {
  const { id, title } = useLocalSearchParams<{ id: string; title?: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { addToCart } = useCart();
  const { selectedRegion } = useRegion();
  const navigation = useNavigation();

  const [product, setProduct] = useState<HttpTypes.StoreProduct | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { product: fetchedProduct } = await sdk.store.product.retrieve(id, {
        fields: '*variants.calculated_price,+variants.inventory_quantity',
        region_id: selectedRegion?.id,
      });

      setProduct(fetchedProduct);
      
      // Initialize selected options with first variant's option values
      if (fetchedProduct.variants && fetchedProduct.variants.length > 0) {
        const firstVariant = fetchedProduct.variants[0];
        const initialOptions: Record<string, string> = {};
        firstVariant.options?.forEach((optionValue) => {
          if (optionValue.option_id && optionValue.value) {
            initialOptions[optionValue.option_id] = optionValue.value;
          }
        });
        setSelectedOptions(initialOptions);
      }
    } catch (err) {
      console.error('Failed to fetch product:', err);
      setError('Failed to load product. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id, selectedRegion]);

  useEffect(() => {
    if (id && selectedRegion) {
      fetchProduct();
    }
  }, [id, selectedRegion, fetchProduct]);

  // Update screen title immediately if passed as param, or when product is loaded
  useEffect(() => {
    const productTitle = title || product?.title;
    if (productTitle) {
      navigation.setOptions({
        title: productTitle,
      });
    }
  }, [title, product, navigation]);

  // Compute selected variant based on selected options
  const selectedVariant = useMemo(() => {
    if (
      !product?.variants ||
      !product.options ||
      Object.keys(selectedOptions).length !== product.options?.length
    ) {
      return;
    }

    return product.variants.find((variant) =>
      variant.options?.every(
        (optionValue) => optionValue.value === selectedOptions[optionValue.option_id!]
      )
    );
  }, [selectedOptions, product]);

  // Check if we should show options UI
  // Hide if there's only one option with one value (or all options have only one value each)
  const shouldShowOptions = useMemo(() => {
    if (!product?.options || product.options.length === 0) {
      return false;
    }
    // Show options only if at least one option has more than one value
    return product.options.some((option) => (option.values?.length ?? 0) > 1);
  }, [product]);

  // Get all images from product
  const images = useMemo(() => {
    const productImages = product?.images?.map(img => img.url).filter(Boolean) || [];
    // If no images, use thumbnail or fallback
    if (productImages.length === 0 && product?.thumbnail) {
      return [product.thumbnail];
    }
    return productImages.length > 0 ? productImages : [];
  }, [product]);

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      setToastMessage(shouldShowOptions ? 'Please select all options' : 'Variant not available');
      setToastVisible(true);
      return;
    }

    try {
      setAddingToCart(true);
      await addToCart(selectedVariant.id, quantity);
      setToastMessage('Product added to cart!');
      setToastVisible(true);
    } catch {
      setToastMessage('Failed to add product to cart');
      setToastVisible(true);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return <ProductSkeleton />;
  }

  if (error || !product) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          {error || 'Product not found'}
        </Text>
      </View>
    );
  }

  // Get price from calculated_price.calculated_amount
  const priceAmount = selectedVariant?.calculated_price?.calculated_amount || 0;
  
  // Use selected region's currency code
  const currencyCode = selectedRegion?.currency_code;

  // Check if selected variant is in stock
  const isInStock = isVariantInStock(selectedVariant);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <ProductImageSlider images={images} />

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{product.title}</Text>
        
        {product.description && (
          <Text style={[styles.description, { color: colors.icon }]}>
            {product.description}
          </Text>
        )}

        <View style={styles.priceContainer}>
          <Text style={[styles.price, { color: colors.tint }]}>
            {formatPrice(priceAmount, currencyCode)}
          </Text>
          {!isInStock && (
            <View style={[styles.stockBadge, { backgroundColor: colors.error }]}>
              <Text style={styles.outOfStockText}>Out of Stock</Text>
            </View>
          )}
          {isInStock && selectedVariant?.inventory_quantity !== undefined && 
           selectedVariant.inventory_quantity! <= 10 && 
           selectedVariant.manage_inventory !== false && (
            <View style={[styles.stockBadge, { backgroundColor: colors.warning }]}>
              <Text style={styles.lowStockText}>
                Only {selectedVariant.inventory_quantity} left
              </Text>
            </View>
          )}
        </View>

        {shouldShowOptions && (
          <View style={styles.optionsSection}>
            {product.options?.map((option) => (
              <View key={option.id} style={styles.optionGroup}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {option.title}
                </Text>
                <View style={styles.optionValues}>
                  {option.values?.map((optionValue) => {
                    const isSelected = selectedOptions[option.id!] === optionValue.value;
                    return (
                      <TouchableOpacity
                        key={optionValue.id}
                        style={[
                          styles.optionButton,
                          {
                            backgroundColor: isSelected
                              ? colors.tint + '20'
                              : 'transparent',
                            borderColor: isSelected
                              ? colors.tint
                              : colors.icon + '30',
                          },
                        ]}
                        onPress={() => {
                          setSelectedOptions((prev) => ({
                            ...prev,
                            [option.id!]: optionValue.value!,
                          }));
                        }}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            {
                              color: isSelected ? colors.tint : colors.text,
                              fontWeight: isSelected ? '600' : '400',
                            },
                          ]}
                        >
                          {optionValue.value}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.quantitySection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quantity</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={[styles.quantityButton, { borderColor: colors.icon }]}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Text style={[styles.quantityButtonText, { color: colors.text }]}>-</Text>
            </TouchableOpacity>
            <Text style={[styles.quantity, { color: colors.text }]}>{quantity}</Text>
            <TouchableOpacity
              style={[styles.quantityButton, { borderColor: colors.icon }]}
              onPress={() => setQuantity(quantity + 1)}
            >
              <Text style={[styles.quantityButtonText, { color: colors.text }]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Button
          title={isInStock ? "Add to Cart" : "Out of Stock"}
          onPress={handleAddToCart}
          loading={addingToCart}
          disabled={!isInStock}
          style={styles.addButton}
        />
      </View>
      
      <Toast
        message={toastMessage}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
        type="success"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  priceContainer: {
    marginBottom: 24,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  stockBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  outOfStockText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  lowStockText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  optionsSection: {
    marginBottom: 24,
  },
  optionGroup: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  optionValues: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 14,
  },
  quantitySection: {
    marginBottom: 32,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  quantity: {
    marginHorizontal: 20,
    fontSize: 18,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center',
  },
  addButton: {
    marginTop: 8,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
});


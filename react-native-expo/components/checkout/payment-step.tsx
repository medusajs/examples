import { Loading } from '@/components/loading';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatPrice } from '@/lib/format-price';
import { getPaymentProviderInfo } from '@/lib/payment-providers';
import type { HttpTypes } from '@medusajs/types';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PaymentStepProps {
  cart: HttpTypes.StoreCart;
  paymentProviders: HttpTypes.StorePaymentProvider[];
  selectedPaymentProvider: string | null;
  loading: boolean;
  onSelectProvider: (providerId: string) => void;
  onBack: () => void;
  onPlaceOrder: () => void;
}

export function PaymentStep({
  cart,
  paymentProviders,
  selectedPaymentProvider,
  loading,
  onSelectProvider,
  onBack,
  onPlaceOrder,
}: PaymentStepProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Select Payment Method
      </Text>

      {loading ? (
        <Loading />
      ) : paymentProviders.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.icon }]}>
          No payment providers available
        </Text>
      ) : (
        paymentProviders.map((provider) => {
          const providerInfo = getPaymentProviderInfo(provider.id);
          const isSelected = selectedPaymentProvider === provider.id;
          
          return (
            <TouchableOpacity
              key={provider.id}
              style={[
                styles.optionCard,
                {
                  backgroundColor: isSelected ? colors.tint + '20' : 'transparent',
                  borderColor: isSelected ? colors.tint : colors.icon + '30',
                },
              ]}
              onPress={() => onSelectProvider(provider.id)}
            >
              <View style={styles.optionContent}>
                <IconSymbol
                  size={24}
                  name={providerInfo.icon as any}
                  color={isSelected ? colors.tint : colors.icon}
                />
                <Text
                  style={[
                    styles.optionTitle,
                    {
                      color: isSelected ? colors.tint : colors.text,
                    },
                  ]}
                >
                  {providerInfo.title}
                </Text>
              </View>
              {isSelected && (
                <Text style={{ color: colors.tint, fontSize: 20 }}>✓</Text>
              )}
            </TouchableOpacity>
          );
        })
      )}

      <View style={[styles.summary, { borderColor: colors.icon + '30' }]}>
        <Text style={[styles.summaryTitle, { color: colors.text }]}>
          Order Summary
        </Text>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.text }]}>Subtotal</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {formatPrice(cart.item_subtotal || 0, cart.currency_code)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.text }]}>Discount</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {(cart.discount_total || 0) > 0 ? '-' : ''}{formatPrice(cart.discount_total || 0, cart.currency_code)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.text }]}>Shipping</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {formatPrice(cart.shipping_total || 0, cart.currency_code)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.text }]}>Tax</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {formatPrice(cart.tax_total || 0, cart.currency_code)}
          </Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow, { borderTopColor: colors.border }]}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
          <Text style={[styles.totalValue, { color: colors.tint }]}>
            {formatPrice(cart.total, cart.currency_code)}
          </Text>
        </View>
      </View>
        </View>
      </View>

      <View style={[styles.buttonContainer, { backgroundColor: colors.background, borderTopColor: colors.icon + '30' }]}>
        <View style={styles.buttonRow}>
          <Button
            title="Back"
            variant="secondary"
            onPress={onBack}
            style={styles.halfButton}
          />
          <Button
            title="Place Order"
            onPress={onPlaceOrder}
            loading={loading}
            disabled={!selectedPaymentProvider}
            style={styles.halfButton}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  optionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  summary: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfButton: {
    flex: 1,
  },
});


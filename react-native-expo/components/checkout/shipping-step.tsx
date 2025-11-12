import { Loading } from '@/components/loading';
import { Button } from '@/components/ui/button';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatPrice } from '@/lib/format-price';
import type { HttpTypes } from '@medusajs/types';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ShippingStepProps {
  shippingOptions: HttpTypes.StoreCartShippingOption[];
  selectedShippingOption: string | null;
  currencyCode?: string;
  loading: boolean;
  onSelectOption: (optionId: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export function ShippingStep({
  shippingOptions,
  selectedShippingOption,
  currencyCode,
  loading,
  onSelectOption,
  onBack,
  onNext,
}: ShippingStepProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Select Shipping Method
      </Text>

      {loading ? (
        <Loading />
      ) : shippingOptions.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.icon }]}>
          No shipping options available
        </Text>
      ) : (
        shippingOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionCard,
              {
                backgroundColor:
                  selectedShippingOption === option.id
                    ? colors.tint + '20'
                    : 'transparent',
                borderColor:
                  selectedShippingOption === option.id
                    ? colors.tint
                    : colors.icon + '30',
              },
            ]}
            onPress={() => onSelectOption(option.id)}
          >
            <View style={styles.optionInfo}>
              <Text
                style={[
                  styles.optionTitle,
                  {
                    color:
                      selectedShippingOption === option.id
                        ? colors.tint
                        : colors.text,
                  },
                ]}
              >
                {option.name}
              </Text>
              <Text style={[styles.optionPrice, { color: colors.text }]}>
                {formatPrice(option.amount, currencyCode)}
              </Text>
            </View>
            {selectedShippingOption === option.id && (
              <Text style={{ color: colors.tint, fontSize: 20 }}>✓</Text>
            )}
          </TouchableOpacity>
        ))
      )}
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
            title="Continue"
            onPress={onNext}
            loading={loading}
            disabled={!selectedShippingOption}
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
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionPrice: {
    fontSize: 14,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfButton: {
    flex: 1,
  },
});


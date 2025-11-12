import { Colors } from "@/constants/theme";
import { useRegion } from "@/context/region-context";
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { HttpTypes } from "@medusajs/types";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface RegionSelectorProps {
  onRegionChange?: () => void;
}

interface CountryWithRegion {
  countryCode: string;
  countryName: string;
  region: HttpTypes.StoreRegion;
  currencyCode: string;
}

export function RegionSelector({ onRegionChange }: RegionSelectorProps) {
  const { regions, selectedRegion, selectedCountryCode, setSelectedRegion } = useRegion();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Flatten countries from all regions
  const countries = useMemo(() => {
    const countryList: CountryWithRegion[] = [];
    
    regions.forEach((region) => {
      if (region.countries) {
        region.countries.forEach((country) => {
          countryList.push({
            countryCode: country.iso_2 || country.id,
            countryName: country.display_name || country.name || country.iso_2 || country.id,
            region: region,
            currencyCode: region.currency_code || '',
          });
        });
      }
    });
    
    // Sort alphabetically by country name
    return countryList.sort((a, b) => a.countryName.localeCompare(b.countryName));
  }, [regions]);

  const handleSelectCountry = async (countryWithRegion: CountryWithRegion) => {
    setSelectedRegion(countryWithRegion.region, countryWithRegion.countryCode);
    onRegionChange?.();
  };

  const isCountrySelected = (countryWithRegion: CountryWithRegion) => {
    return selectedRegion?.id === countryWithRegion.region.id && 
           selectedCountryCode === countryWithRegion.countryCode;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Select Country</Text>
      {countries.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.icon }]}>
          No countries available
        </Text>
      ) : (
        countries.map((country) => {
          const isSelected = isCountrySelected(country);
          
          return (
            <TouchableOpacity
              key={`${country.region.id}-${country.countryCode}`}
              style={[
                styles.countryItem,
                {
                  backgroundColor: isSelected ? colors.tint + "20" : "transparent",
                  borderColor: colors.icon + "30",
                },
              ]}
              onPress={() => handleSelectCountry(country)}
            >
              <View style={styles.countryInfo}>
                <Text
                  style={[
                    styles.countryName,
                    {
                      color: isSelected ? colors.tint : colors.text,
                      fontWeight: isSelected ? "600" : "400",
                    },
                  ]}
                >
                  {country.countryName}
                </Text>
                <Text style={[styles.currencyCode, { color: colors.icon }]}>
                  {country.currencyCode.toUpperCase()}
                </Text>
              </View>
              {isSelected && (
                <Text style={{ color: colors.tint, fontSize: 18 }}>✓</Text>
              )}
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: 16,
    marginBottom: 4,
  },
  currencyCode: {
    fontSize: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 20,
  },
});


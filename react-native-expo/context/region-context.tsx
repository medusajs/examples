import { sdk } from "@/lib/sdk";
import type { HttpTypes } from "@medusajs/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface RegionContextType {
  regions: HttpTypes.StoreRegion[];
  selectedRegion: HttpTypes.StoreRegion | null;
  selectedCountryCode: string | null;
  setSelectedRegion: (region: HttpTypes.StoreRegion, countryCode: string) => void;
  loading: boolean;
  error: string | null;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

const REGION_STORAGE_KEY = "selected_region_id";
const COUNTRY_STORAGE_KEY = "selected_country_code";

export function RegionProvider({ children }: { children: ReactNode }) {
  const [regions, setRegions] = useState<HttpTypes.StoreRegion[]>([]);
  const [selectedRegion, setSelectedRegionState] = useState<HttpTypes.StoreRegion | null>(null);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRegions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { regions: fetchedRegions } = await sdk.store.region.list();
      setRegions(fetchedRegions);

      // Load saved region and country or use first region's first country
      const savedRegionId = await AsyncStorage.getItem(REGION_STORAGE_KEY);
      const savedCountryCode = await AsyncStorage.getItem(COUNTRY_STORAGE_KEY);
      
      const regionToSelect = savedRegionId
        ? fetchedRegions.find((r) => r.id === savedRegionId) || fetchedRegions[0]
        : fetchedRegions[0];

      if (regionToSelect) {
        setSelectedRegionState(regionToSelect);
        await AsyncStorage.setItem(REGION_STORAGE_KEY, regionToSelect.id);
        
        // Set country code - use saved one if it exists in the region, otherwise use first country
        const countryCodeToSelect = savedCountryCode && 
          regionToSelect.countries?.some(c => (c.iso_2 || c.id) === savedCountryCode)
          ? savedCountryCode
          : regionToSelect.countries?.[0]?.iso_2 || regionToSelect.countries?.[0]?.id || null;
        
        setSelectedCountryCode(countryCodeToSelect);
        if (countryCodeToSelect) {
          await AsyncStorage.setItem(COUNTRY_STORAGE_KEY, countryCodeToSelect);
        }
      }
    } catch (err) {
      console.error("Failed to load regions:", err);
      setError("Failed to load regions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load regions on mount
  useEffect(() => {
    loadRegions();
  }, []);

  const setSelectedRegion = async (region: HttpTypes.StoreRegion, countryCode: string) => {
    setSelectedRegionState(region);
    setSelectedCountryCode(countryCode);
    await AsyncStorage.setItem(REGION_STORAGE_KEY, region.id);
    await AsyncStorage.setItem(COUNTRY_STORAGE_KEY, countryCode);
  };

  return (
    <RegionContext.Provider
      value={{
        regions,
        selectedRegion,
        selectedCountryCode,
        setSelectedRegion,
        loading,
        error,
      }}
    >
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error("useRegion must be used within a RegionProvider");
  }
  return context;
}


import Medusa from "@medusajs/js-sdk";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const MEDUSA_BACKEND_URL =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_MEDUSA_URL ||
  process.env.EXPO_PUBLIC_MEDUSA_URL ||
  "http://localhost:9000";

const MEDUSA_PUBLISHABLE_API_KEY = 
  Constants.expoConfig?.extra?.EXPO_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY ||
  process.env.EXPO_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY ||
  "";

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: __DEV__,
  auth: {
    type: "jwt",
    jwtTokenStorageMethod: "custom",
    storage: AsyncStorage,
  },
  publishableKey: MEDUSA_PUBLISHABLE_API_KEY,
});


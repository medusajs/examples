import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { CartProvider } from '@/context/cart-context';
import { RegionProvider } from '@/context/region-context';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RegionProvider>
          <CartProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
              <Stack.Screen
                name="checkout"
                options={{
                  headerShown: true,
                  title: 'Checkout',
                  presentation: 'card',
                  headerBackButtonDisplayMode: "minimal",
                }}
              />
              <Stack.Screen
                name="order-confirmation/[id]"
                options={{
                  headerShown: true,
                  title: 'Order Confirmed',
                  headerLeft: () => null,
                  gestureEnabled: false,
                  headerBackVisible: false,
                }}
              />
            </Stack>
            <StatusBar style="auto" />
          </CartProvider>
        </RegionProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

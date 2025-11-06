import { useColorScheme } from '@/hooks/use-color-scheme';
import { DrawerActions } from '@react-navigation/native';
import { Stack, useNavigation } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';

export default function CartStackLayout() {
  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Stack
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen 
        name="index"
        options={{
          title: 'Cart',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              style={{ height: 36, width: 36, display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <IconSymbol size={28} name="line.3.horizontal" color={colors.icon} />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}
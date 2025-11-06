import { Drawer } from 'expo-router/drawer';

import { DrawerContent } from '@/components/drawer-content';

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerPosition: 'left',
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: 'Home',
          title: 'Shop',
        }}
      />
    </Drawer>
  );
}


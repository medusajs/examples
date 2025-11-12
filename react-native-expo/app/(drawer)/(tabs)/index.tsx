import { Redirect } from 'expo-router';
import React from 'react';

const MainScreen = () => {
  return <Redirect href="/(drawer)/(tabs)/(home)" />;
};

export default MainScreen;

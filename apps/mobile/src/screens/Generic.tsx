import React from 'react';
import { View, Text } from 'react-native';

export default function GenericScreen({ route }: any) {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-black">
      <Text className="text-xl text-black dark:text-white font-bold">Generic Screen</Text>
    </View>
  );
}

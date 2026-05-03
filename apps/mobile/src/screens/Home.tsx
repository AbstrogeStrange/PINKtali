import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen({ navigation }: any) {
  const dummyData = [1, 2, 3, 4, 5, 6];

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <Text className="text-xl font-bold text-black dark:text-white">StreamVerse</Text>
      </View>
      <FlatList
        data={dummyData}
        keyExtractor={(item) => item.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            className="mb-4"
            onPress={() => navigation.navigate('Watch', { videoId: item })}
          >
            <View className="w-full h-56 bg-gray-300 dark:bg-gray-800" />
            <View className="p-3 flex-row">
              <View className="h-10 w-10 rounded-full bg-gray-400 mr-3" />
              <View className="flex-1">
                <Text className="font-semibold text-black dark:text-white line-clamp-2">
                  Amazing Mobile Video Title #{item}
                </Text>
                <Text className="text-gray-500 text-xs mt-1">
                  Channel Name • 1M views • 2 days ago
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

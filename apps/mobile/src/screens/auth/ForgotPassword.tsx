import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen({ navigation }: any) {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black px-6 justify-center">
      <View className="items-center mb-10">
        <Text className="text-2xl font-bold text-black dark:text-white">Reset Password</Text>
      </View>

      <View className="space-y-4">
        <TextInput 
          placeholder="Email address"
          className="w-full bg-gray-100 dark:bg-gray-900 text-black dark:text-white p-4 rounded-xl"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TouchableOpacity className="w-full bg-blue-600 p-4 rounded-xl items-center mt-4">
          <Text className="text-white font-bold text-lg">Send Link</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.goBack()} className="items-center mt-8">
        <Text className="text-blue-500 font-medium">Back to sign in</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
// import * as AuthSession from 'expo-auth-session';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    const hasToken = await SecureStore.getItemAsync('accessToken');
    if (!hasToken) return;

    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (hasHardware && isEnrolled) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock StreamVerse',
        fallbackLabel: 'Use Passcode',
      });
      if (result.success) {
        navigation.replace('MainTabs');
      }
    }
  };

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Fields cannot be empty');
    
    // API logic mock
    await SecureStore.setItemAsync('accessToken', 'mock_token_123');
    navigation.replace('MainTabs');
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black px-6 justify-center">
      <View className="items-center mb-10">
        <Text className="text-3xl font-bold text-black dark:text-white">StreamVerse</Text>
        <Text className="text-gray-500 mt-2">Sign in to your account</Text>
      </View>

      <View className="space-y-4">
        <TextInput 
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          className="w-full bg-gray-100 dark:bg-gray-900 text-black dark:text-white p-4 rounded-xl"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput 
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="w-full bg-gray-100 dark:bg-gray-900 text-black dark:text-white p-4 rounded-xl"
        />
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} className="items-end mt-2">
           <Text className="text-blue-500 font-medium">Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleLogin}
          className="w-full bg-blue-600 p-4 rounded-xl items-center mt-6"
        >
          <Text className="text-white font-bold text-lg">Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity className="w-full border border-gray-300 dark:border-gray-700 p-4 rounded-xl items-center mt-4">
          <Text className="text-black dark:text-white font-medium">Continue with Google</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-center mt-10">
        <Text className="text-gray-500">Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text className="text-blue-500 font-bold">Sign up</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

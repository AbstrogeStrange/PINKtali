import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen({ navigation }: any) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black px-6 justify-center">
      <View className="items-center mb-10">
        <Text className="text-3xl font-bold text-black dark:text-white">Join StreamVerse</Text>
        <Text className="text-gray-500 mt-2">Step {step} of 2</Text>
      </View>

      <View className="space-y-4">
        {step === 1 ? (
          <>
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
            <TouchableOpacity 
              onPress={() => setStep(2)}
              className="w-full bg-blue-600 p-4 rounded-xl items-center mt-6"
            >
              <Text className="text-white font-bold text-lg">Continue</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput 
              placeholder="Display Name"
              value={displayName}
              onChangeText={setDisplayName}
              className="w-full bg-gray-100 dark:bg-gray-900 text-black dark:text-white p-4 rounded-xl"
            />
            <View className="flex-row gap-4 mt-6">
              <TouchableOpacity onPress={() => setStep(1)} className="flex-1 border border-gray-300 dark:border-gray-700 p-4 rounded-xl items-center">
                 <Text className="text-black dark:text-white font-bold">Back</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => console.log('Registering...')} className="flex-1 bg-blue-600 p-4 rounded-xl items-center">
                 <Text className="text-white font-bold text-lg">Sign Up</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

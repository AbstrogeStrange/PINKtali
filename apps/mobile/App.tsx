import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// Auth screen imports
import LoginScreen from './src/screens/auth/Login';
import RegisterScreen from './src/screens/auth/Register';
import ForgotPasswordScreen from './src/screens/auth/ForgotPassword';

// Placeholder screen imports
import HomeScreen from './src/screens/Home';
import WatchScreen from './src/screens/Watch';
import ShortsScreen from './src/screens/Generic';
import SubscriptionsScreen from './src/screens/Generic';
import LibraryScreen from './src/screens/Generic';
import ProfileScreen from './src/screens/Generic';
import ChannelScreen from './src/screens/Generic';
import SearchScreen from './src/screens/Generic';
import StudioScreen from './src/screens/Generic';
import SettingsScreen from './src/screens/Generic';
import UploadScreen from './src/screens/Generic';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Shorts" component={ShortsScreen} />
      <Tab.Screen name="Upload" component={UploadScreen} options={{ presentation: 'modal' }} />
      <Tab.Screen name="Subscriptions" component={SubscriptionsScreen} />
      <Tab.Screen name="Library" component={LibraryScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
          {/* Auth Stack */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          
          {/* Main App */}
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="Watch" component={WatchScreen} />
          <Stack.Screen name="Channel" component={ChannelScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Studio" component={StudioScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

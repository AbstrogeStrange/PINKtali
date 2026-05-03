import { Tabs } from 'expo-router';
import { View, Text, Pressable, StyleSheet, useColorScheme } from 'react-native';
import { Home, Zap, BookOpen, PlaySquare } from 'lucide-react-native';
import { Colors } from '@/constants/theme';

function UploadFAB() {
  return (
    <View style={styles.fabWrap}>
      <View style={styles.fab}>
        <Text style={styles.fabPlus}>+</Text>
      </View>
    </View>
  );
}

export default function TabLayout() {
  const scheme = useColorScheme();
  const C = scheme === 'dark' ? Colors.dark : Colors.light;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: C.bg,
          borderTopColor: C.border,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: Colors.brand,
        tabBarInactiveTintColor: C.textMuted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '500' },
      }}
    >
      <Tabs.Screen name="index"         options={{ title: 'Home',          tabBarIcon: ({ color }) => <Home size={22} color={color} /> }} />
      <Tabs.Screen name="shorts/index"  options={{ title: 'Shorts',        tabBarIcon: ({ color }) => <Zap  size={22} color={color} /> }} />
      <Tabs.Screen name="upload/index"  options={{ title: '', tabBarIcon: () => <UploadFAB />, tabBarLabel: () => null }} />
      <Tabs.Screen name="subscriptions/index" options={{ title: 'Subscriptions', tabBarIcon: ({ color }) => <PlaySquare size={22} color={color} /> }} />
      <Tabs.Screen name="library/index" options={{ title: 'Library',       tabBarIcon: ({ color }) => <BookOpen size={22} color={color} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  fabWrap: { alignItems: 'center', justifyContent: 'center', width: 44, height: 44 },
  fab: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.brand, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.brand, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  fabPlus: { color: '#FFF', fontSize: 24, fontWeight: '700', lineHeight: 26 },
});

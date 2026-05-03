import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, useColorScheme
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, ChevronRight, Moon, Bell, Shield, Wifi, LogOut } from 'lucide-react-native';
import { Colors, Spacing, FontSize, Radius } from '@/constants/theme';
import { useAuthStore } from '@/store';

const MENU_ITEMS = [
  { label: 'Notifications',  icon: Bell,    href: '/settings/notifications' },
  { label: 'Privacy',        icon: Shield,  href: '/settings/privacy' },
  { label: 'Data & Storage', icon: Wifi,    href: '/settings/data' },
];

function SettingRow({ icon: Icon, label, onPress, right }: any) {
  const scheme = useColorScheme();
  const C = scheme === 'dark' ? Colors.dark : Colors.light;
  return (
    <TouchableOpacity onPress={onPress} style={[styles.row, { borderBottomColor: C.border }]}>
      <View style={[styles.iconWrap, { backgroundColor: C.surface }]}>
        <Icon size={18} color={Colors.brand} />
      </View>
      <Text style={[styles.rowLabel, { color: C.text }]}>{label}</Text>
      {right ?? <ChevronRight size={18} color={C.textMuted} />}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const scheme = useColorScheme();
  const C = scheme === 'dark' ? Colors.dark : Colors.light;
  const { logout, user } = useAuthStore();

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: C.bg }]} edges={['top']}>
      <View style={[styles.appBar, { borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => router.back()}><ChevronLeft size={24} color={C.text} /></TouchableOpacity>
        <Text style={[styles.heading, { color: C.text }]}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Profile card */}
        <TouchableOpacity style={[styles.profileCard, { backgroundColor: C.surface }]} onPress={() => router.push('/profile')}>
          <View style={[styles.avatar, { backgroundColor: Colors.brand }]}>
            <Text style={styles.avatarLetter}>{(user?.displayName ?? 'C')[0]}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.profileName, { color: C.text }]}>{user?.displayName ?? 'Creator'}</Text>
            <Text style={[styles.profileEmail, { color: C.textMuted }]}>{user?.email ?? 'creator@streamverse.app'}</Text>
            <Text style={{ color: Colors.brand, fontSize: FontSize.xs, fontWeight: '600', marginTop: 2 }}>Manage account →</Text>
          </View>
        </TouchableOpacity>

        {/* Appearance */}
        <Text style={[styles.sectionTitle, { color: C.textMuted }]}>Appearance</Text>
        <View style={[styles.row, { borderBottomColor: C.border }]}>
          <View style={[styles.iconWrap, { backgroundColor: C.surface }]}><Moon size={18} color={Colors.brand} /></View>
          <Text style={[styles.rowLabel, { color: C.text }]}>Dark Mode</Text>
          <Switch value={scheme === 'dark'} onValueChange={() => {}} trackColor={{ true: Colors.brand, false: C.surfaceHover }} />
        </View>

        {/* Settings items */}
        <Text style={[styles.sectionTitle, { color: C.textMuted }]}>Preferences</Text>
        {MENU_ITEMS.map(item => (
          <SettingRow key={item.label} icon={item.icon} label={item.label} onPress={() => {}} />
        ))}

        {/* Sign out */}
        <Text style={[styles.sectionTitle, { color: C.textMuted }]}>Account</Text>
        <TouchableOpacity onPress={() => { logout(); router.replace('/'); }}
          style={[styles.row, { borderBottomColor: C.border }]}>
          <View style={[styles.iconWrap, { backgroundColor: '#ff000015' }]}>
            <LogOut size={18} color="#ef4444" />
          </View>
          <Text style={[styles.rowLabel, { color: '#ef4444' }]}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: C.textMuted }]}>StreamVerse v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appBar:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  heading:     { fontSize: FontSize.lg, fontWeight: '700' },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, margin: Spacing.lg, padding: Spacing.lg, borderRadius: Radius.xl },
  avatar:      { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarLetter:{ color: '#fff', fontSize: FontSize.xl, fontWeight: '800' },
  profileName: { fontSize: FontSize.md, fontWeight: '700' },
  profileEmail:{ fontSize: FontSize.xs, marginTop: 2 },
  sectionTitle:{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.sm, fontSize: FontSize.xs, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  row:         { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  iconWrap:    { width: 36, height: 36, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  rowLabel:    { flex: 1, fontSize: FontSize.sm, fontWeight: '500' },
  version:     { textAlign: 'center', fontSize: FontSize.xs, marginTop: Spacing['3xl'] },
});

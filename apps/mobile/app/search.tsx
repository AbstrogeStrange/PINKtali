import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Image, useColorScheme, FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, X, Clock } from 'lucide-react-native';
import { router } from 'expo-router';
import { VideoCard, type VideoData } from '@/components/VideoCard';
import { Colors, Spacing, FontSize, Radius } from '@/constants/theme';

const RECENT_SEARCHES = ['react 19 tutorial','next.js app router','typescript generics','css grid layout'];

const fakeResults = (q: string): VideoData[] =>
  Array.from({ length: 10 }, (_, i) => ({
    id: `sr-${i}`, title: `"${q}" — Result #${i+1}: Tutorial`,
    channelName: ['TechBro','DesignPro'][i%2], channelHandle: ['techbro','designpro'][i%2],
    viewCount: Math.floor(10_000+Math.random()*3_000_000),
    publishedAt: new Date(Date.now()-i*5*86400000).toISOString(),
    duration: `${Math.floor(4+Math.random()*40)}:${String(Math.floor(Math.random()*60)).padStart(2,'0')}`,
  }));

const TABS = ['All', 'Videos', 'Channels', 'Shorts'];

export default function SearchScreen() {
  const scheme = useColorScheme();
  const C = scheme === 'dark' ? Colors.dark : Colors.light;
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const submit = () => {
    if (query.trim()) setSubmitted(query.trim());
  };

  const results = submitted ? fakeResults(submitted) : [];

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: C.bg }]} edges={['top']}>
      {/* Search bar */}
      <View style={[styles.searchRow, { borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <X size={22} color={C.text} />
        </TouchableOpacity>
        <View style={[styles.inputWrap, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Search size={16} color={C.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={submit}
            placeholder="Search videos, channels..."
            placeholderTextColor={C.textMuted}
            style={[styles.input, { color: C.text }]}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setSubmitted(''); }}>
              <X size={16} color={C.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {!submitted ? (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: Spacing.lg }}>
          <Text style={[styles.sectionTitle, { color: C.textMuted }]}>Recent searches</Text>
          {RECENT_SEARCHES.map(s => (
            <TouchableOpacity key={s} onPress={() => { setQuery(s); setSubmitted(s); }}
              style={[styles.recentRow, { borderBottomColor: C.border }]}>
              <Clock size={16} color={C.textMuted} />
              <Text style={[styles.recentText, { color: C.text }]}>{s}</Text>
              <TouchableOpacity><X size={14} color={C.textMuted} /></TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          {/* Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.tabBar, { borderBottomColor: C.border }]} contentContainerStyle={{ paddingHorizontal: Spacing.lg, gap: Spacing.sm }}>
            {TABS.map(tab => (
              <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}
                style={[styles.tab, activeTab===tab && { borderBottomWidth: 2, borderBottomColor: Colors.brand }]}>
                <Text style={[styles.tabText, { color: activeTab===tab ? Colors.brand : C.textMuted }]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <FlatList
            data={results}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={{ paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl }}>
                <VideoCard video={item} />
              </View>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1 },
  searchRow:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  inputWrap:  { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderRadius: Radius.full, borderWidth: 1, paddingHorizontal: Spacing.md, height: 40 },
  input:      { flex: 1, fontSize: FontSize.sm, padding: 0 },
  sectionTitle:{ fontSize: FontSize.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.md },
  recentRow:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  recentText: { flex: 1, fontSize: FontSize.sm },
  tabBar:     { borderBottomWidth: StyleSheet.hairlineWidth, maxHeight: 50 },
  tab:        { paddingHorizontal: 4, paddingVertical: 13 },
  tabText:    { fontSize: FontSize.sm, fontWeight: '600' },
});

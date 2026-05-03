import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity,
  Dimensions, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HISTORY_KEY = 'streamverse_search_history';

type Tab = 'All' | 'Videos' | 'Shorts' | 'Channels';

const TABS: Tab[] = ['All', 'Videos', 'Shorts', 'Channels'];

const mockResults = Array.from({ length: 10 }, (_, i) => ({
  id: `r${i}`,
  type: i % 5 === 0 ? 'channel' : 'video',
  title: `Result ${i + 1}: Search Match`,
  channel: `Channel ${i}`,
  views: Math.floor(Math.random() * 500_000),
}));

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('All');
  const [hasSearched, setHasSearched] = useState(false);

  const loadHistory = useCallback(async () => {
    const saved = await AsyncStorage.getItem(HISTORY_KEY);
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const saveToHistory = async (q: string) => {
    const newHistory = [q, ...history.filter(h => h !== q)].slice(0, 10);
    setHistory(newHistory);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  };

  const removeHistory = (item: string) => {
    const newHistory = history.filter(h => h !== item);
    setHistory(newHistory);
    AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  };

  const handleSearch = async (q: string) => {
    if (!q.trim()) return;
    setQuery(q);
    await saveToHistory(q);
    // In prod: call /api/v1/search?q=...&type=...
    setResults(mockResults);
    setHasSearched(true);
  };

  const filteredResults = results.filter(r => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Videos') return r.type === 'video';
    if (activeTab === 'Shorts') return r.type === 'short';
    if (activeTab === 'Channels') return r.type === 'channel';
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchRow}>
        <View style={styles.inputWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.input}
            placeholder="Search..."
            placeholderTextColor="#666"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => handleSearch(query)}
            returnKeyType="search"
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setHasSearched(false); }}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* History or Results */}
      {!hasSearched ? (
        <FlatList
          data={history}
          keyExtractor={(item) => item}
          ListHeaderComponent={history.length > 0 ? <Text style={styles.sectionTitle}>Recent Searches</Text> : null}
          renderItem={({ item }) => (
            <View style={styles.historyItem}>
              <TouchableOpacity style={styles.historyText} onPress={() => handleSearch(item)}>
                <Text style={styles.clockIcon}>🕐</Text>
                <Text style={styles.historyLabel}>{item}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => removeHistory(item)} style={styles.removeBtn}>
                <Text style={styles.removeText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <>
          {/* Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar}>
            {TABS.map(tab => (
              <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={[styles.tab, activeTab === tab && styles.activeTab]}>
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <FlatList
            data={filteredResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.resultCard}>
                <View style={styles.thumbnail} />
                <View style={styles.resultInfo}>
                  <Text style={styles.resultTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.resultMeta}>{item.channel} · {(item.views / 1000).toFixed(0)}K views</Text>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingBottom: 80 }}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  searchRow: { flexDirection: 'row', padding: 12, gap: 10 },
  inputWrapper: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#222', borderRadius: 12, paddingHorizontal: 12
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  input: { flex: 1, paddingVertical: 10, color: 'white', fontSize: 15 },
  clearBtn: { color: '#888', fontSize: 16, padding: 4 },
  sectionTitle: { color: '#888', fontSize: 12, fontWeight: '700', letterSpacing: 1, marginTop: 8, marginBottom: 4, paddingHorizontal: 16 },
  historyItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1e1e1e' },
  historyText: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  clockIcon: { fontSize: 16 },
  historyLabel: { color: 'white', fontSize: 14 },
  removeBtn: { padding: 6 },
  removeText: { color: '#555', fontSize: 14 },
  tabBar: { borderBottomWidth: 1, borderBottomColor: '#222', flexGrow: 0 },
  tab: { paddingHorizontal: 18, paddingVertical: 12, marginHorizontal: 2 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#ff0000' },
  tabText: { color: '#888', fontWeight: '600', fontSize: 14 },
  activeTabText: { color: 'white' },
  resultCard: { flexDirection: 'row', padding: 12, gap: 12, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  thumbnail: { width: 120, aspectRatio: 16 / 9, backgroundColor: '#333', borderRadius: 8 },
  resultInfo: { flex: 1, justifyContent: 'center' },
  resultTitle: { color: 'white', fontWeight: '500', fontSize: 14, marginBottom: 4 },
  resultMeta: { color: '#888', fontSize: 12 }
});

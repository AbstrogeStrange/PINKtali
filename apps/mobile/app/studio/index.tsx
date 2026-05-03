import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, BarChart2, Eye, TrendingUp, DollarSign, Play } from 'lucide-react-native';
import { Colors, Spacing, FontSize, Radius } from '@/constants/theme';

const fmt = (n: number) => n >= 1_000_000 ? `${(n/1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n/1_000).toFixed(0)}K` : String(n);

const KPIS = [
  { label: 'Views (28d)',     value: '89.4K',  icon: Eye,       color: '#3b82f6' },
  { label: 'Watch Hrs',      value: '4,820',   icon: Play,      color: '#8b5cf6' },
  { label: 'Subscribers',    value: '+1,240',  icon: TrendingUp,color: '#22c55e' },
  { label: 'Est. Revenue',   value: '$268',    icon: DollarSign,color: '#f59e0b' },
];

const VIDEOS = Array.from({ length: 6 }, (_, i) => ({
  id: `sv${i}`, title: `Video Title #${i+1}: Tutorial`, views: Math.floor(1000+Math.random()*50000),
  status: ['LIVE','LIVE','PROCESSING','LIVE','DRAFT','LIVE'][i] as string,
  revenue: `$${(Math.random()*80).toFixed(2)}`,
}));

const statusColor = (s: string) => ({ LIVE: '#22c55e', PROCESSING: '#f59e0b', DRAFT: '#6b7280' }[s] ?? '#6b7280');

export default function StudioScreen() {
  const scheme = useColorScheme();
  const C = scheme === 'dark' ? Colors.dark : Colors.light;

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: C.bg }]} edges={['top']}>
      <View style={[styles.appBar, { borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => router.back()}><ChevronLeft size={24} color={C.text} /></TouchableOpacity>
        <Text style={[styles.heading, { color: C.text }]}>Studio</Text>
        <TouchableOpacity onPress={() => router.push('/studio/analytics')}>
          <BarChart2 size={22} color={Colors.brand} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.xl, paddingBottom: 80 }}>
        {/* KPI Cards */}
        <View style={styles.kpiGrid}>
          {KPIS.map(k => (
            <View key={k.label} style={[styles.kpiCard, { backgroundColor: C.surface, borderColor: C.border }]}>
              <k.icon size={18} color={k.color} />
              <Text style={[styles.kpiValue, { color: C.text }]}>{k.value}</Text>
              <Text style={[styles.kpiLabel, { color: C.textMuted }]}>{k.label}</Text>
            </View>
          ))}
        </View>

        {/* Videos */}
        <View>
          <Text style={[styles.sectionTitle, { color: C.text }]}>Your Videos</Text>
          <View style={{ gap: Spacing.md }}>
            {VIDEOS.map(v => (
              <View key={v.id} style={[styles.videoRow, { backgroundColor: C.surface, borderColor: C.border }]}>
                <View style={[styles.thumb, { backgroundColor: Colors.gradients[v.id.charCodeAt(0)%4][0] }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.videoTitle, { color: C.text }]} numberOfLines={2}>{v.title}</Text>
                  <Text style={[styles.videoMeta, { color: C.textMuted }]}>{fmt(v.views)} views · {v.revenue}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusColor(v.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: statusColor(v.status) }]}>{v.status}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appBar:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  heading:      { fontSize: FontSize.lg, fontWeight: '700' },
  kpiGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  kpiCard:      { width: '47%', padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, gap: 4 },
  kpiValue:     { fontSize: FontSize.xl, fontWeight: '800', marginTop: 4 },
  kpiLabel:     { fontSize: FontSize.xs },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.md },
  videoRow:     { flexDirection: 'row', gap: Spacing.md, padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, alignItems: 'center' },
  thumb:        { width: 72, aspectRatio: 16/9, borderRadius: Radius.sm },
  videoTitle:   { fontSize: FontSize.sm, fontWeight: '600', marginBottom: 4 },
  videoMeta:    { fontSize: FontSize.xs },
  statusBadge:  { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  statusText:   { fontSize: 10, fontWeight: '700' },
});

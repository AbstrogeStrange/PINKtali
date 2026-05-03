'use client';

import { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, AreaChart, Area, ComposedChart
} from 'recharts';

// ── Mock Data ─────────────────────────────────────────────────────────────────
const days28 = Array.from({ length: 28 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - (27 - i));
  return {
    date: `${d.getMonth()+1}/${d.getDate()}`,
    views: Math.floor(800 + Math.random() * 1600),
    watchHours: Math.floor(40 + Math.random() * 120),
    impressions: Math.floor(4000 + Math.random() * 6000),
    ctr: parseFloat((3 + Math.random() * 5).toFixed(1))
  };
});

const realtimeHours = Array.from({ length: 48 }, (_, i) => ({
  hour: `${String(i % 24).padStart(2,'0')}:00`,
  views: Math.floor(20 + Math.random() * 180)
}));

const ageData = [
  { range: '13-17', pct: 8 }, { range: '18-24', pct: 32 }, { range: '25-34', pct: 35 },
  { range: '35-44', pct: 16 }, { range: '45-54', pct: 6 }, { range: '55+', pct: 3 }
];
const genderData = [{ name: 'Male', value: 68 }, { name: 'Female', value: 28 }, { name: 'Other', value: 4 }];
const GENDER_COLORS = ['#3b82f6', '#ec4899', '#a78bfa'];

const deviceData = [
  { name: 'Mobile', value: 58 }, { name: 'Desktop', value: 32 },
  { name: 'Tablet', value: 6 }, { name: 'TV', value: 4 }
];
const DEVICE_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'];

const topVideos = Array.from({ length: 8 }, (_, i) => ({
  id: `v${i}`, title: `Video Title ${i + 1}: An In-Depth Tutorial`,
  views: Math.floor(5000 + Math.random() * 50000),
  watchHours: Math.floor(200 + Math.random() * 3000),
  ctr: `${(3 + Math.random() * 5).toFixed(1)}%`,
  avgView: `${Math.floor(3 + Math.random() * 8)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
  sparkline: Array.from({ length: 7 }, () => Math.floor(Math.random() * 500))
}));

const trafficSources = [
  { source: 'Browse features', views: 34200, pct: 38 },
  { source: 'Search', views: 22100, pct: 25 },
  { source: 'Suggested', views: 18400, pct: 20 },
  { source: 'External', views: 8900, pct: 10 },
  { source: 'Direct', views: 5300, pct: 6 },
];

const monthlyRevenue = [
  { month: 'Nov', ads: 90, memberships: 60, superThanks: 12 },
  { month: 'Dec', ads: 145, memberships: 80, superThanks: 25 },
  { month: 'Jan', ads: 180, memberships: 120, superThanks: 18 },
  { month: 'Feb', ads: 210, memberships: 130, superThanks: 30 },
  { month: 'Mar', ads: 195, memberships: 150, superThanks: 55 },
  { month: 'Apr', ads: 247, memberships: 180, superThanks: 40 },
];

// ── Shared Components ─────────────────────────────────────────────────────────
const KPI = ({ label, value, sub, color = 'text-foreground' }: any) => (
  <div className="rounded-xl border bg-card p-5">
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
    {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
  </div>
);

const ChartCard = ({ title, children, action }: any) => (
  <div className="rounded-xl border bg-card p-5">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</h3>
      {action}
    </div>
    {children}
  </div>
);

const TABS = ['Overview', 'Reach', 'Audience', 'Revenue', 'Videos'];
const PERIODS = ['7d', '28d', '90d', '365d', 'Lifetime'];

// ── Main Analytics Page ───────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [tab, setTab] = useState('Overview');
  const [period, setPeriod] = useState('28d');
  const [videoSort, setVideoSort] = useState<'views' | 'watchHours'>('views');

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Channel Analytics</h1>
        <select value={period} onChange={e => setPeriod(e.target.value)}
          className="bg-card border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary">
          {PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Tabs */}
      <div className="border-b flex gap-6 overflow-x-auto">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`pb-3 text-sm font-medium whitespace-nowrap ${tab === t ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === 'Overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <KPI label="Views"           value="89.4K"   sub="↑ 12% vs prev" color="text-foreground" />
            <KPI label="Watch Time (h)"  value="4,820"   sub="↑ 8% vs prev"  color="text-blue-500" />
            <KPI label="Subs Gained"     value="+1,240"  sub="Active subs"    color="text-emerald-500" />
            <KPI label="Subs Lost"       value="−182"    sub=""               color="text-red-500" />
            <KPI label="Net Subs"        value="+1,058"  sub=""               color="text-foreground" />
            <KPI label="Est. Revenue"    value="$268"    sub="55% share"      color="text-amber-500" />
          </div>

          <ChartCard title="Views & Watch Time" action={
            <button className="text-xs text-primary hover:underline">Export CSV</button>
          }>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={days28} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} interval={4} />
                <YAxis yAxisId="left"  tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area yAxisId="left"  type="monotone" dataKey="views"      fill="rgba(59,130,246,0.1)" stroke="#3b82f6" strokeWidth={2} name="Views" />
                <Line yAxisId="right" type="monotone" dataKey="watchHours" stroke="#a78bfa" strokeWidth={2} dot={false} name="Watch Hours" />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Realtime */}
          <ChartCard title="Realtime — Last 48 Hours">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-medium text-emerald-600">47 viewers watching now</span>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={realtimeHours} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} interval={7} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                <Area type="monotone" dataKey="views" fill="rgba(34,197,94,0.15)" stroke="#22c55e" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* ── Reach ── */}
      {tab === 'Reach' && (
        <div className="space-y-6">
          <ChartCard title="Impressions vs Views vs CTR">
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={days28} margin={{ top: 5, right: 30, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} interval={4} />
                <YAxis yAxisId="left"  tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" unit="%" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar     yAxisId="left"  dataKey="impressions" fill="rgba(59,130,246,0.3)" name="Impressions" />
                <Line    yAxisId="left"  type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} dot={false} name="Views" />
                <Line    yAxisId="right" type="monotone" dataKey="ctr" stroke="#f59e0b" strokeWidth={2} dot={false} name="CTR %" />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Traffic Sources">
            <div className="space-y-3 mt-2">
              {trafficSources.map(t => (
                <div key={t.source} className="flex items-center gap-3">
                  <span className="text-sm w-36 shrink-0">{t.source}</span>
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${t.pct}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-16 text-right">{t.views.toLocaleString()}</span>
                  <span className="text-xs font-medium w-8 text-right">{t.pct}%</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      )}

      {/* ── Audience ── */}
      {tab === 'Audience' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChartCard title="Age Distribution">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={ageData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                <XAxis type="number" unit="%" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="range" type="category" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} formatter={(v: any) => [`${v}%`]} />
                <Bar dataKey="pct" fill="#3b82f6" radius={[0,4,4,0]} name="Viewers" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Gender">
            <div className="flex items-center justify-around pt-4">
              <PieChart width={180} height={180}>
                <Pie data={genderData} cx={90} cy={90} innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {genderData.map((_, i) => <Cell key={i} fill={GENDER_COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v: any) => [`${v}%`]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              </PieChart>
              <div className="space-y-2">
                {genderData.map((g, i) => (
                  <div key={g.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ background: GENDER_COLORS[i] }} />
                    <span>{g.name}</span>
                    <span className="text-muted-foreground ml-1">{g.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Devices">
            <div className="flex items-center justify-around pt-4">
              <PieChart width={180} height={180}>
                <Pie data={deviceData} cx={90} cy={90} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {deviceData.map((_, i) => <Cell key={i} fill={DEVICE_COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v: any) => [`${v}%`]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              </PieChart>
              <div className="space-y-2">
                {deviceData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ background: DEVICE_COLORS[i] }} />
                    <span>{d.name}</span>
                    <span className="text-muted-foreground ml-1">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Top Countries">
            <div className="space-y-3 mt-2">
              {[
                { flag: '🇺🇸', country: 'United States', views: '28,400' },
                { flag: '🇮🇳', country: 'India', views: '12,000' },
                { flag: '🇬🇧', country: 'United Kingdom', views: '8,200' },
                { flag: '🇨🇦', country: 'Canada', views: '5,100' },
                { flag: '🇦🇺', country: 'Australia', views: '4,200' },
              ].map(c => (
                <div key={c.country} className="flex items-center justify-between">
                  <span className="text-sm">{c.flag} {c.country}</span>
                  <span className="text-sm text-muted-foreground">{c.views}</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      )}

      {/* ── Revenue ── */}
      {tab === 'Revenue' && (
        <ChartCard title="Monthly Revenue Breakdown" action={
          <button className="text-xs text-primary hover:underline">Export CSV</button>
        }>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyRevenue} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} formatter={(v: any) => [`$${v}`]} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="ads"         name="Ad Revenue"   stackId="a" fill="#3b82f6" />
              <Bar dataKey="memberships" name="Memberships"  stackId="a" fill="#8b5cf6" />
              <Bar dataKey="superThanks" name="Super Thanks" stackId="a" fill="#f59e0b" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* ── Videos ── */}
      {tab === 'Videos' && (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Top Videos</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Sort by:</span>
              <select value={videoSort} onChange={e => setVideoSort(e.target.value as any)}
                className="text-xs bg-muted border rounded px-2 py-1 outline-none">
                <option value="views">Views</option>
                <option value="watchHours">Watch Hours</option>
              </select>
              <button className="text-xs text-primary hover:underline ml-2">Export CSV</button>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr>
                {['Video', 'Views', 'Watch Hrs', 'Avg View', 'CTR', 'Trend'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...topVideos].sort((a,b) => b[videoSort] - a[videoSort]).map(v => (
                <tr key={v.id} className="border-t hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-11 bg-muted rounded shrink-0" />
                      <span className="text-sm line-clamp-2">{v.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-medium">{v.views.toLocaleString()}</td>
                  <td className="px-5 py-3">{v.watchHours.toLocaleString()}</td>
                  <td className="px-5 py-3">{v.avgView}</td>
                  <td className="px-5 py-3 text-emerald-600">{v.ctr}</td>
                  <td className="px-5 py-3">
                    {/* Mini sparkline */}
                    <svg width="60" height="24" viewBox={`0 0 60 24`}>
                      <polyline
                        points={v.sparkline.map((val, i) => `${(i / 6) * 60},${24 - (val / 500) * 24}`).join(' ')}
                        fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                      />
                    </svg>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

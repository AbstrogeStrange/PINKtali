'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// Metric card
function MetricCard({ label, value, delta, color }: { label: string; value: string; delta?: string; color: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col gap-2">
      <p className="text-sm text-white/50">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {delta && <p className="text-xs text-emerald-400">{delta}</p>}
    </div>
  );
}

// Generate mock chart data for last 30 days
const chartData = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  return {
    date: `${d.getMonth() + 1}/${d.getDate()}`,
    impressions: Math.floor(3000 + Math.random() * 8000),
    spend: parseFloat((Math.random() * 150 + 50).toFixed(2)),
  };
});

const mockCampaigns = [
  { id: 'c1', name: 'Spring React Tutorial Promo', status: 'ACTIVE', budget: 500, spent: 247, impressions: 18200, ctr: '2.1%' },
  { id: 'c2', name: 'SaaS Product Launch',         status: 'PAUSED', budget: 1000, spent: 812, impressions: 44000, ctr: '3.4%' },
  { id: 'c3', name: 'Brand Awareness Q2',           status: 'DRAFT',  budget: 250,  spent: 0,   impressions: 0,     ctr: '—'   },
];

const statusColor = (s: string) => ({
  ACTIVE: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  PAUSED: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  DRAFT:  'text-white/40 bg-white/5 border-white/10',
}[s] ?? '');

export default function AdsDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Ad Dashboard</h1>
          <p className="text-sm text-white/40 mt-1">Last 30 days performance overview</p>
        </div>
        <a href="/ads/campaigns/new"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors">
          + New Campaign
        </a>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Impressions" value="62,200"  delta="↑ 18% vs last month" color="text-white" />
        <MetricCard label="Total Views"        value="38,100"  delta="↑ 12% vs last month" color="text-blue-400" />
        <MetricCard label="Total Spend"        value="$1,059"  delta="$247 this week"       color="text-purple-400" />
        <MetricCard label="Avg CTR"            value="2.8%"    delta="Industry avg: 1.2%"   color="text-emerald-400" />
      </div>

      {/* Chart */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-6">Daily Impressions & Spend</h2>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} tickLine={false} axisLine={false} interval={4} />
            <YAxis yAxisId="left" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
              labelStyle={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}
              itemStyle={{ color: 'white', fontSize: 12 }}
            />
            <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
            <Line yAxisId="left"  type="monotone" dataKey="impressions" stroke="#60a5fa" strokeWidth={2} dot={false} name="Impressions" />
            <Line yAxisId="right" type="monotone" dataKey="spend"       stroke="#a78bfa" strokeWidth={2} dot={false} name="Spend ($)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Campaign Table */}
      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Campaigns</h2>
          <span className="text-xs text-white/30">{mockCampaigns.length} campaigns</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              {['Campaign', 'Status', 'Budget', 'Spent', 'Impressions', 'CTR', ''].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockCampaigns.map(c => (
              <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 text-white font-medium">{c.name}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${statusColor(c.status)}`}>{c.status}</span>
                </td>
                <td className="px-6 py-4 text-white/70">${c.budget}</td>
                <td className="px-6 py-4 text-white/70">${c.spent}</td>
                <td className="px-6 py-4 text-white/70">{c.impressions.toLocaleString()}</td>
                <td className="px-6 py-4 text-emerald-400 font-mono">{c.ctr}</td>
                <td className="px-6 py-4">
                  <a href={`/ads/campaigns/${c.id}`} className="text-blue-400 hover:text-blue-300 text-xs">View →</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

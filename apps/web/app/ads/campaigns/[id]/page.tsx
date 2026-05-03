'use client';

import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer 
} from 'recharts';

const dailyData = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  return {
    date: `${d.getMonth()+1}/${d.getDate()}`,
    impressions: Math.floor(400 + Math.random() * 1200),
    clicks: Math.floor(8 + Math.random() * 60),
    spend: parseFloat((Math.random() * 25 + 8).toFixed(2)),
  };
});

const mock = {
  id: 'c1',
  name: 'Spring React Tutorial Promo',
  status: 'ACTIVE',
  budget: 500,
  spent: 247.80,
  impressions: 18200,
  clicks: 382,
  ctr: '2.1%',
  startDate: '2026-04-01',
  endDate: '2026-06-30',
  format: 'PRE_ROLL',
  countries: ['US', 'CA', 'GB'],
};

export default function CampaignDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <a href="/ads/dashboard" className="text-white/40 hover:text-white text-sm transition-colors">← Dashboard</a>
          </div>
          <h1 className="text-2xl font-bold text-white">{mock.name}</h1>
          <p className="text-sm text-white/40 mt-1">{mock.startDate} → {mock.endDate} · {mock.format}</p>
        </div>
        <div className="flex gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full border bg-emerald-400/10 border-emerald-400/30 text-emerald-400">{mock.status}</span>
          <button className="px-4 py-1.5 rounded-xl text-sm border border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10 transition-colors">Pause</button>
          <a href={`/api/v1/ads/campaigns/${params.id}/report`} 
            className="px-4 py-1.5 rounded-xl text-sm border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-colors">
            Export CSV ↓
          </a>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ['Impressions', mock.impressions.toLocaleString(), 'text-white'],
          ['Clicks', mock.clicks.toLocaleString(), 'text-blue-400'],
          ['Spend', `$${mock.spent}`, 'text-purple-400'],
          ['CTR', mock.ctr, 'text-emerald-400'],
        ].map(([label, value, color]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs text-white/40 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-sm text-white/50 mb-4">Daily Impressions</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} tickLine={false} axisLine={false} interval={6} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }} itemStyle={{ color: 'white', fontSize: 12 }} />
              <Bar dataKey="impressions" fill="#3b82f6" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-sm text-white/50 mb-4">Daily Spend ($)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} tickLine={false} axisLine={false} interval={6} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }} itemStyle={{ color: 'white', fontSize: 12 }} />
              <Line type="monotone" dataKey="spend" stroke="#a78bfa" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Stats Table */}
      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Daily Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {['Date', 'Impressions', 'Clicks', 'CTR', 'Spend'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dailyData.slice().reverse().slice(0, 10).map((row, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-6 py-3 text-white/70 font-mono text-xs">{row.date}</td>
                  <td className="px-6 py-3 text-white">{row.impressions.toLocaleString()}</td>
                  <td className="px-6 py-3 text-blue-400">{row.clicks}</td>
                  <td className="px-6 py-3 text-emerald-400">{((row.clicks / row.impressions) * 100).toFixed(1)}%</td>
                  <td className="px-6 py-3 text-purple-400">${row.spend}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

'use client';

import { Users, Video, Eye, Clock, DollarSign, TrendingUp } from 'lucide-react';

const KPI = ({ icon: Icon, label, value, sub, color }: any) => (
  <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 flex items-start gap-4">
    <div className={`p-2.5 rounded-lg ${color} bg-opacity-15`}>
      <Icon size={20} className={color.replace('bg-', 'text-')} />
    </div>
    <div>
      <p className="text-xs text-zinc-500 mb-0.5">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
    </div>
  </div>
);

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Platform Overview</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPI icon={Users}     label="MAU"                value="2.4M"    sub="↑ 8% vs last month"  color="bg-blue-500" />
        <KPI icon={Users}     label="DAU"                value="124K"    sub="↑ 3% vs yesterday"   color="bg-indigo-500" />
        <KPI icon={Users}     label="New Today"          value="1,842"   sub="This week: 11,200"    color="bg-emerald-500" />
        <KPI icon={Video}     label="Total Videos"       value="1.24M"   sub="+4,200 today"         color="bg-orange-500" />
        <KPI icon={Clock}     label="Watch Hours Today"  value="88,400"  sub="Avg 42 min/user"      color="bg-purple-500" />
        <KPI icon={DollarSign} label="Platform Revenue"  value="$48.2K"  sub="This month"           color="bg-yellow-500" />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Recent Reports</h3>
          <div className="space-y-3">
            {[
              { title: 'Spam video flagged', type: 'SPAM', time: '2m ago', severity: 'low' },
              { title: 'Hate speech detected', type: 'HATE_SPEECH', time: '14m ago', severity: 'high' },
              { title: 'Copyright claim filed', type: 'COPYRIGHT', time: '31m ago', severity: 'medium' },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-zinc-800 last:border-0">
                <div>
                  <p className="text-sm font-medium">{r.title}</p>
                  <p className="text-xs text-zinc-500">{r.type} · {r.time}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${
                  r.severity === 'high'   ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                  r.severity === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                                            'bg-zinc-700 text-zinc-400 border-zinc-600'}`}>
                  {r.severity.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Ad Creatives Pending Review</h3>
          <div className="space-y-3">
            {[
              { name: 'Spring Sale Promo', advertiser: 'BrandCo', format: 'PRE_ROLL' },
              { name: 'SaaS Product Demo', advertiser: 'TechStart', format: 'MID_ROLL' },
              { name: 'App Install Campaign', advertiser: 'AppCo', format: 'SHORTS' },
            ].map((a, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-zinc-800 last:border-0">
                <div>
                  <p className="text-sm font-medium">{a.name}</p>
                  <p className="text-xs text-zinc-500">{a.advertiser} · {a.format}</p>
                </div>
                <div className="flex gap-2">
                  <button className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-lg hover:bg-emerald-500/20 transition-colors">Approve</button>
                  <button className="text-xs bg-red-500/10 text-red-400 border border-red-500/30 px-3 py-1 rounded-lg hover:bg-red-500/20 transition-colors">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

const SUPER_THANKS_AMOUNTS = [0.99, 2, 5, 10, 20, 50, 100, 500];

// Mock data
const monthlyData = [
  { month: 'Nov', ads: 90,  memberships: 60,  superThanks: 12 },
  { month: 'Dec', ads: 145, memberships: 80,  superThanks: 25 },
  { month: 'Jan', ads: 180, memberships: 120, superThanks: 18 },
  { month: 'Feb', ads: 210, memberships: 130, superThanks: 30 },
  { month: 'Mar', ads: 195, memberships: 150, superThanks: 55 },
  { month: 'Apr', ads: 247, memberships: 180, superThanks: 40 },
];

const revenueRows = [
  { month: 'April 2026', ads: '$247.80', memberships: '$180.00', superThanks: '$40.00', fee: '$213.66', net: '$254.14', status: 'PAID' },
  { month: 'March 2026', ads: '$195.20', memberships: '$150.00', superThanks: '$55.00', fee: '$165.11', net: '$235.09', status: 'PAID' },
  { month: 'Feb 2026',   ads: '$210.40', memberships: '$130.00', superThanks: '$30.00', fee: '$165.22', net: '$205.18', status: 'PAID' },
];

const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    PAID:    'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    FAILED:  'bg-red-500/10 text-red-400 border-red-500/30',
  };
  return map[s] ?? '';
};

// Mock eligibility data
const eligibility = { eligible: true, subscriberCount: 12400, watchHoursLast12Months: 6200, shortsViewsLast90Days: 2_400_000 };
const stripeConnected = true;

export default function MonetizationPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'tiers' | 'payouts'>('overview');

  return (
    <div className="p-6 space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Monetization</h1>
          <p className="text-muted-foreground text-sm mt-1">Track your revenue, manage memberships, and connect Stripe</p>
        </div>
        <div className="flex items-center gap-2">
          {eligibility.eligible
            ? <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium"><CheckCircle size={16} /> Monetization Active</span>
            : <span className="flex items-center gap-1.5 text-sm text-yellow-600 font-medium"><AlertCircle size={16} /> Not Eligible</span>
          }
        </div>
      </div>

      {/* Stripe Connect CTA */}
      {!stripeConnected && (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-5 flex items-center justify-between">
          <div>
            <p className="font-semibold text-yellow-300">Connect Stripe to receive payouts</p>
            <p className="text-sm text-yellow-300/60 mt-1">Required before your first payout can be processed</p>
          </div>
          <button className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-white/90 transition-colors">
            <ExternalLink size={14} /> Connect Stripe
          </button>
        </div>
      )}

      {/* Eligibility Requirements */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Subscribers', value: eligibility.subscriberCount.toLocaleString(), target: '1,000', met: eligibility.subscriberCount >= 1000 },
          { label: 'Watch Hours (12mo)', value: `${eligibility.watchHoursLast12Months.toLocaleString()} hrs`, target: '4,000', met: eligibility.watchHoursLast12Months >= 4000 },
          { label: 'Shorts Views (90d)', value: `${(eligibility.shortsViewsLast90Days / 1_000_000).toFixed(1)}M`, target: '10M', met: eligibility.shortsViewsLast90Days >= 10_000_000 },
        ].map(item => (
          <div key={item.label} className={`rounded-xl border p-4 ${item.met ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-muted bg-muted/20'}`}>
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className="text-2xl font-bold mt-1">{item.value}</p>
            <p className={`text-xs mt-1 ${item.met ? 'text-emerald-500' : 'text-muted-foreground'}`}>
              {item.met ? '✓ Requirement met' : `Target: ${item.target}`}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b flex gap-6">
        {(['overview', 'tiers', 'payouts'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`pb-3 text-sm font-medium capitalize ${activeTab === t ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground'}`}>
            {t === 'tiers' ? 'Membership Tiers' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="rounded-xl border bg-card p-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-5">Monthly Revenue Breakdown</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, fontSize: 12 }}
                  formatter={(v: any) => [`$${v}`, '']}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="ads" name="Ad Revenue" stackId="a" fill="#3b82f6" radius={[0,0,0,0]} />
                <Bar dataKey="memberships" name="Memberships" stackId="a" fill="#8b5cf6" />
                <Bar dataKey="superThanks" name="Super Thanks" stackId="a" fill="#f59e0b" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Revenue History</h3>
              <button className="text-xs text-primary hover:underline">Export CSV</button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr>
                  {['Month', 'Ad Revenue', 'Memberships', 'Super Thanks', 'Platform Fee', 'Net Payout', 'Status'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {revenueRows.map((r, i) => (
                  <tr key={i} className="border-t hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5 font-medium">{r.month}</td>
                    <td className="px-5 py-3.5 text-blue-500">{r.ads}</td>
                    <td className="px-5 py-3.5 text-purple-500">{r.memberships}</td>
                    <td className="px-5 py-3.5 text-amber-500">{r.superThanks}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{r.fee}</td>
                    <td className="px-5 py-3.5 font-bold">{r.net}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${statusBadge(r.status)}`}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tiers Tab */}
      {activeTab === 'tiers' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">You can create up to 5 membership tiers</p>
            <button className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg">+ Create Tier</button>
          </div>
          {[
            { name: 'Fan', price: '$1.99/mo', emoji: '🌟', members: 124, benefits: ['Exclusive badge', 'Community posts'] },
            { name: 'Super Fan', price: '$4.99/mo', emoji: '⭐', members: 42, benefits: ['Fan benefits', 'Members-only videos', 'Custom emoji'] },
          ].map(tier => (
            <div key={tier.name} className="rounded-xl border bg-card p-5 flex items-center gap-5">
              <div className="text-4xl">{tier.emoji}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-lg">{tier.name}</h3>
                  <span className="text-sm text-muted-foreground">{tier.price}</span>
                  <span className="text-xs bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-500/20">{tier.members} members</span>
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {tier.benefits.map(b => <span key={b} className="text-xs bg-muted px-2 py-1 rounded-full">{b}</span>)}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-sm border rounded-lg hover:bg-muted transition-colors">Edit</button>
                <button className="px-3 py-1.5 text-sm border border-destructive/30 text-destructive rounded-lg hover:bg-destructive/10 transition-colors">Deactivate</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payouts Tab */}
      {activeTab === 'payouts' && (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="font-semibold">Stripe Payout History</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr>
                {['Date', 'Amount', 'Status', 'Stripe ID'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { date: 'May 01, 2026', amount: '$254.14', status: 'PAID', id: 'po_3PbXg2...' },
                { date: 'Apr 01, 2026', amount: '$235.09', status: 'PAID', id: 'po_3OaWf1...' },
              ].map((p, i) => (
                <tr key={i} className="border-t hover:bg-muted/20">
                  <td className="px-5 py-3.5">{p.date}</td>
                  <td className="px-5 py-3.5 font-bold text-emerald-600">{p.amount}</td>
                  <td className="px-5 py-3.5"><span className={`text-xs font-semibold px-2 py-1 rounded-full border ${statusBadge(p.status)}`}>{p.status}</span></td>
                  <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{p.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

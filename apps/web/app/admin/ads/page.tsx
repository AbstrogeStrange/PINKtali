'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Play } from 'lucide-react';

const mockCreatives = [
  { id: 'c1', name: 'Spring Sale Promo',    advertiser: 'BrandCo',    format: 'PRE_ROLL', budget: '$500', status: 'PENDING_REVIEW' },
  { id: 'c2', name: 'SaaS Product Demo',    advertiser: 'TechStart',  format: 'MID_ROLL', budget: '$1000', status: 'PENDING_REVIEW' },
  { id: 'c3', name: 'App Install Campaign', advertiser: 'AppCo',      format: 'SHORTS',   budget: '$250',  status: 'PENDING_REVIEW' },
  { id: 'c4', name: 'Gaming Promo',         advertiser: 'GameZone',   format: 'DISPLAY',  budget: '$750',  status: 'APPROVED' },
  { id: 'c5', name: 'Supplement Ad',        advertiser: 'HealthBrand', format: 'PRE_ROLL', budget: '$400', status: 'REJECTED' },
];

const statusColor: Record<string, string> = {
  PENDING_REVIEW: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  APPROVED:       'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  REJECTED:       'bg-red-500/10 text-red-400 border-red-500/30',
};

export default function AdminAdsPage() {
  const [creatives, setCreatives] = useState(mockCreatives);

  const act = (id: string, action: 'APPROVED' | 'REJECTED') =>
    setCreatives(prev => prev.map(c => c.id === id ? { ...c, status: action } : c));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Ad Creative Review</h1>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              {['Creative', 'Advertiser', 'Format', 'Budget', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-medium text-zinc-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {creatives.map(c => (
              <tr key={c.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-9 bg-zinc-700 rounded flex items-center justify-center">
                      <Play size={12} className="text-zinc-400" />
                    </div>
                    <span className="font-medium">{c.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-zinc-300">{c.advertiser}</td>
                <td className="px-5 py-4">
                  <span className="text-xs bg-zinc-800 px-2 py-1 rounded border border-zinc-700">{c.format}</span>
                </td>
                <td className="px-5 py-4 text-zinc-300">{c.budget}</td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${statusColor[c.status]}`}>
                    {c.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-5 py-4">
                  {c.status === 'PENDING_REVIEW' && (
                    <div className="flex gap-2">
                      <button onClick={() => act(c.id, 'APPROVED')}
                        className="flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-colors">
                        <CheckCircle size={12} /> Approve
                      </button>
                      <button onClick={() => act(c.id, 'REJECTED')}
                        className="flex items-center gap-1 text-xs bg-red-500/10 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-colors">
                        <XCircle size={12} /> Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

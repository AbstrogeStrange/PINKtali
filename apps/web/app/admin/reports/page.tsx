'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, ChevronRight } from 'lucide-react';

const mockReports = [
  { id: 'r1', type: 'HATE_SPEECH',  videoTitle: 'Controversial Video #12',  reporter: 'user42',  severity: 'high',   time: '5 min ago',  status: 'PENDING' },
  { id: 'r2', type: 'SPAM',          videoTitle: 'How to earn $1000/day',     reporter: 'user18',  severity: 'medium', time: '22 min ago', status: 'PENDING' },
  { id: 'r3', type: 'MISINFORMATION',videoTitle: 'Vaccine dangers exposed',   reporter: 'user99',  severity: 'high',   time: '1 hr ago',   status: 'PENDING' },
  { id: 'r4', type: 'COPYRIGHT',     videoTitle: 'Latest Movie Full HD',      reporter: 'auto',    severity: 'medium', time: '2 hr ago',   status: 'REVIEWING' },
  { id: 'r5', type: 'SPAM',          videoTitle: 'Get rich quick scheme',     reporter: 'user3',   severity: 'low',    time: '4 hr ago',   status: 'DISMISSED' },
];

const sevColor: Record<string, string> = {
  high:   'bg-red-500/10 text-red-400 border-red-500/30',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  low:    'bg-zinc-700 text-zinc-400 border-zinc-600',
};

const statusColor: Record<string, string> = {
  PENDING:   'text-yellow-400', REVIEWING: 'text-blue-400',
  DISMISSED: 'text-zinc-500',   RESOLVED:  'text-emerald-400',
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState(mockReports);
  const [filter, setFilter] = useState('PENDING');

  const act = (id: string, action: string) =>
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Content Reports</h1>
        <div className="flex gap-2">
          {['PENDING', 'REVIEWING', 'ALL'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${filter === s ? 'bg-blue-600 border-blue-600 text-white' : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {reports.filter(r => filter === 'ALL' || r.status === filter).map(report => (
          <div key={report.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1.5">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full border ${sevColor[report.severity]}`}>{report.severity.toUpperCase()}</span>
                  <code className="text-xs bg-zinc-800 px-2 py-0.5 rounded text-zinc-300">{report.type}</code>
                  <span className={`text-xs font-medium ${statusColor[report.status]}`}>{report.status}</span>
                </div>
                <p className="font-medium">{report.videoTitle}</p>
                <p className="text-xs text-zinc-500 mt-1">Reported by @{report.reporter} · {report.time}</p>
              </div>
              {report.status === 'PENDING' && (
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => act(report.id, 'REVIEWING')}
                    className="flex items-center gap-1.5 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-lg hover:bg-blue-500/20 transition-colors">
                    <ChevronRight size={12} /> Review
                  </button>
                  <button onClick={() => act(report.id, 'RESOLVED')}
                    className="flex items-center gap-1.5 text-xs bg-red-500/10 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-colors">
                    <AlertTriangle size={12} /> Remove
                  </button>
                  <button onClick={() => act(report.id, 'DISMISSED')}
                    className="flex items-center gap-1.5 text-xs bg-zinc-700 text-zinc-400 border border-zinc-600 px-3 py-1.5 rounded-lg hover:bg-zinc-600 transition-colors">
                    <XCircle size={12} /> Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

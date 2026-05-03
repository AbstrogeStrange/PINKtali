'use client';

import { useState } from 'react';
import { Search, Ban, Eye } from 'lucide-react';

const mockUsers = Array.from({ length: 12 }, (_, i) => ({
  id: `u${i}`, email: `user${i}@example.com`, handle: `user${i}`,
  displayName: `User ${i}`, role: i === 0 ? 'ADMIN' : i < 3 ? 'CREATOR' : 'VIEWER',
  status: i === 5 ? 'BANNED' : 'ACTIVE',
  joined: new Date(Date.now() - i * 86400000 * 12).toLocaleDateString(),
  videos: i < 3 ? Math.floor(Math.random() * 80) : 0,
  subscribers: i < 3 ? Math.floor(Math.random() * 100000) : 0
}));

const roleColor: Record<string, string> = {
  ADMIN:   'bg-red-500/10 text-red-400 border-red-500/20',
  CREATOR: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  VIEWER:  'bg-zinc-700 text-zinc-400 border-zinc-600'
};

export default function AdminUsersPage() {
  const [q, setQ] = useState('');
  const [users, setUsers] = useState(mockUsers);

  const filtered = users.filter(u =>
    u.email.includes(q) || u.handle.includes(q) || u.displayName.toLowerCase().includes(q.toLowerCase())
  );

  const toggleBan = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id
      ? { ...u, status: u.status === 'BANNED' ? 'ACTIVE' : 'BANNED' }
      : u
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Management</h1>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search users..."
            className="bg-zinc-900 border border-zinc-700 rounded-lg pl-8 pr-4 py-2 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-blue-500 w-64" />
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              {['User', 'Role', 'Status', 'Joined', 'Videos', 'Subscribers', 'Actions'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-medium text-zinc-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className={`border-b border-zinc-800/50 hover:bg-zinc-800/30 ${u.status === 'BANNED' ? 'opacity-50' : ''}`}>
                <td className="px-5 py-3.5">
                  <p className="font-medium">{u.displayName}</p>
                  <p className="text-xs text-zinc-500">@{u.handle} · {u.email}</p>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${roleColor[u.role]}`}>{u.role}</span>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${
                    u.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>{u.status}</span>
                </td>
                <td className="px-5 py-3.5 text-zinc-400 text-xs">{u.joined}</td>
                <td className="px-5 py-3.5">{u.videos}</td>
                <td className="px-5 py-3.5">{u.subscribers > 0 ? u.subscribers.toLocaleString() : '—'}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 hover:bg-zinc-700 rounded-lg transition-colors" title="View details">
                      <Eye size={14} className="text-zinc-400" />
                    </button>
                    <button onClick={() => toggleBan(u.id)} className="p-1.5 hover:bg-zinc-700 rounded-lg transition-colors" title={u.status === 'BANNED' ? 'Unban' : 'Ban'}>
                      <Ban size={14} className={u.status === 'BANNED' ? 'text-emerald-400' : 'text-red-400'} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/results?search_query=${encodeURIComponent(query.trim())}`);
  };
  return (
    <form onSubmit={submit} className="flex w-full max-w-xl items-center gap-2">
      <div className="flex-1 relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"/>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search" aria-label="Search StreamVerse"
          className="w-full pl-9 pr-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-full text-sm outline-none focus:border-[var(--brand)] placeholder:text-[var(--text-muted)] transition-colors"/>
      </div>
      <button type="submit" className="w-10 h-10 flex items-center justify-center bg-[var(--surface)] border border-[var(--border)] rounded-full hover:bg-[var(--surface-hover)] transition-colors shrink-0">
        <Search size={16}/>
      </button>
    </form>
  );
}

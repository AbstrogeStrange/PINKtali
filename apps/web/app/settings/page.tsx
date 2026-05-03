'use client';

import { useState } from 'react';
import { Shield, Eye, Bell, Play, Link, ChevronRight } from 'lucide-react';

const SECTIONS = [
  { id: 'account',       icon: Shield, label: 'Account' },
  { id: 'privacy',       icon: Eye,    label: 'Privacy' },
  { id: 'notifications', icon: Bell,   label: 'Notifications' },
  { id: 'playback',      icon: Play,   label: 'Playback' },
  { id: 'connected',     icon: Link,   label: 'Connected apps' },
];

function Toggle({ label, desc, defaultOn = false }: { label: string; desc?: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-[var(--border)] last:border-0">
      <div><p className="text-sm font-medium">{label}</p>{desc&&<p className="text-xs text-[var(--text-muted)] mt-0.5">{desc}</p>}</div>
      <button onClick={()=>setOn(!on)} className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${on?'bg-[var(--brand)]':'bg-[var(--border)]'}`}>
        <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${on?'translate-x-5':''}`}/>
      </button>
    </div>
  );
}

function Select({ label, options, defaultVal }: { label: string; options: string[]; defaultVal: string }) {
  const [val, setVal] = useState(defaultVal);
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-[var(--border)] last:border-0">
      <p className="text-sm font-medium">{label}</p>
      <select value={val} onChange={e=>setVal(e.target.value)} className="bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm outline-none">
        {options.map(o=><option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

export default function SettingsPage() {
  const [section, setSection] = useState('account');
  return (
    <div className="pb-20 md:pb-8 max-w-4xl mx-auto px-4 pt-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="flex flex-col sm:flex-row gap-6">
        <nav className="sm:w-48 shrink-0 space-y-1">
          {SECTIONS.map(s=>(
            <button key={s.id} onClick={()=>setSection(s.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-colors ${section===s.id?'bg-[var(--surface-hover)] font-semibold':'text-[var(--text-muted)] hover:bg-[var(--surface-hover)]'}`}>
              <s.icon size={16}/>{s.label}{section===s.id&&<ChevronRight size={14} className="ml-auto"/>}
            </button>
          ))}
        </nav>

        <div className="flex-1 bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6">
          {section==='account' && (
            <div className="space-y-4">
              <h2 className="text-base font-bold">Account Settings</h2>
              {[['Email Address','creator@streamverse.app'],['Display Name','TechBro']].map(([l,v])=>(
                <div key={l}><label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">{l}</label><input defaultValue={v} className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--brand)]"/></div>
              ))}
              <div className="border-t border-[var(--border)] pt-4">
                <p className="text-sm font-semibold mb-3">Change Password</p>
                <div className="space-y-3">
                  <input type="password" placeholder="Current password" className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--brand)]"/>
                  <input type="password" placeholder="New password" className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--brand)]"/>
                </div>
              </div>
              <div className="border-t border-[var(--border)] pt-4 flex items-center justify-between">
                <div><p className="text-sm font-semibold">Two-Factor Authentication</p><p className="text-xs text-[var(--text-muted)]">Add an extra layer of security</p></div>
                <button className="px-4 py-2 bg-[var(--brand)] text-white rounded-xl text-sm font-semibold">Enable 2FA</button>
              </div>
              <button className="px-5 py-2.5 bg-[var(--brand)] text-white rounded-xl text-sm font-semibold">Save Changes</button>
            </div>
          )}

          {section==='privacy' && (
            <div>
              <h2 className="text-base font-bold mb-4">Privacy Settings</h2>
              <Toggle label="Save watch history" desc="Videos you watch are saved" defaultOn={true}/>
              <Toggle label="Save search history" defaultOn={true}/>
              <Toggle label="Show subscriptions publicly" defaultOn={false}/>
              <Toggle label="Allow personalised ads" defaultOn={true}/>
              <div className="pt-4"><button className="text-sm text-[var(--brand)] font-semibold hover:underline">Request data download</button></div>
            </div>
          )}

          {section==='notifications' && (
            <div>
              <h2 className="text-base font-bold mb-4">Notification Preferences</h2>
              <Toggle label="New videos from subscriptions" defaultOn={true}/>
              <Toggle label="Live streams" defaultOn={true}/>
              <Toggle label="Community posts" defaultOn={false}/>
              <Toggle label="Comments on your videos" defaultOn={true}/>
              <Toggle label="Replies to your comments" defaultOn={true}/>
              <Toggle label="Super Thanks received" defaultOn={true}/>
              <Toggle label="Email notifications" defaultOn={true}/>
              <Toggle label="Push notifications" defaultOn={true}/>
            </div>
          )}

          {section==='playback' && (
            <div>
              <h2 className="text-base font-bold mb-4">Playback Settings</h2>
              <Select label="Default quality" options={['Auto','4K','1080p','720p','480p','360p']} defaultVal="Auto"/>
              <Toggle label="Autoplay next video" defaultOn={true}/>
              <Toggle label="Autoplay on home feed" defaultOn={false}/>
              <Select label="Captions language" options={['Off','English','Spanish','French','German','Hindi','Japanese']} defaultVal="English"/>
              <Toggle label="Always show captions" defaultOn={false}/>
              <Select label="Playback speed" options={['0.25x','0.5x','0.75x','1x','1.25x','1.5x','2x']} defaultVal="1x"/>
            </div>
          )}

          {section==='connected' && (
            <div>
              <h2 className="text-base font-bold mb-4">Connected Applications</h2>
              {[{name:'GitHub',icon:'🐙',desc:'Linked for developer sign-in',date:'Jan 12, 2025'},{name:'Google',icon:'🔵',desc:'Used for single sign-on',date:'Mar 3, 2024'}].map(app=>(
                <div key={app.name} className="flex items-center justify-between py-4 border-b border-[var(--border)] last:border-0">
                  <div className="flex items-center gap-3"><span className="text-2xl">{app.icon}</span><div><p className="text-sm font-semibold">{app.name}</p><p className="text-xs text-[var(--text-muted)]">{app.desc} · {app.date}</p></div></div>
                  <button className="px-3 py-1.5 text-xs font-medium text-red-500 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors">Revoke</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

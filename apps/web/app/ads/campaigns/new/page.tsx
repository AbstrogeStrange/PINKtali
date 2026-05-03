'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

const STEPS = ['Campaign Basics', 'Targeting', 'Creative', 'Review'];

// ── Step components ──────────────────────────────────────────────────────────
function StepBasics({ data, setData }: any) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm text-white/60 mb-1.5">Campaign Name</label>
        <input value={data.name} onChange={e => setData({ ...data, name: e.target.value })}
          placeholder="e.g. Spring Product Launch"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-blue-500 transition-colors" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-white/60 mb-1.5">Budget Type</label>
          <select value={data.budgetType} onChange={e => setData({ ...data, budgetType: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500">
            <option value="DAILY">Daily Budget</option>
            <option value="LIFETIME">Lifetime Budget</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1.5">Budget ($)</label>
          <input type="number" value={data.budget} onChange={e => setData({ ...data, budget: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-white/60 mb-1.5">Start Date</label>
          <input type="date" value={data.startDate} onChange={e => setData({ ...data, startDate: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1.5">End Date</label>
          <input type="date" value={data.endDate} onChange={e => setData({ ...data, endDate: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500" />
        </div>
      </div>
    </div>
  );
}

function StepTargeting({ data, setData }: any) {
  const countries = ['US', 'GB', 'CA', 'AU', 'IN', 'DE', 'FR', 'BR', 'JP'];
  const devices = ['DESKTOP', 'MOBILE', 'TABLET', 'TV'];
  const interests = ['Technology', 'Gaming', 'Music', 'Sports', 'Finance', 'Education'];

  const toggle = (field: string, val: string) => {
    const arr = data[field] ?? [];
    setData({ ...data, [field]: arr.includes(val) ? arr.filter((v: string) => v !== val) : [...arr, val] });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm text-white/60 mb-2">Countries</label>
        <div className="flex flex-wrap gap-2">
          {countries.map(c => (
            <button key={c} type="button" onClick={() => toggle('countries', c)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${(data.countries ?? []).includes(c) ? 'bg-blue-600 border-blue-500 text-white' : 'border-white/10 text-white/60 hover:border-white/30'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-white/60 mb-1.5">Age Min</label>
          <input type="number" min="13" max="65" value={data.ageMin ?? 18} onChange={e => setData({ ...data, ageMin: Number(e.target.value) })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1.5">Age Max</label>
          <input type="number" min="13" max="65" value={data.ageMax ?? 65} onChange={e => setData({ ...data, ageMax: Number(e.target.value) })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500" />
        </div>
      </div>

      <div>
        <label className="block text-sm text-white/60 mb-2">Devices</label>
        <div className="flex flex-wrap gap-2">
          {devices.map(d => (
            <button key={d} type="button" onClick={() => toggle('devices', d)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${(data.devices ?? []).includes(d) ? 'bg-blue-600 border-blue-500 text-white' : 'border-white/10 text-white/60 hover:border-white/30'}`}>
              {d}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-white/60 mb-2">Interest Categories</label>
        <div className="flex flex-wrap gap-2">
          {interests.map(i => (
            <button key={i} type="button" onClick={() => toggle('interests', i)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${(data.interests ?? []).includes(i) ? 'bg-blue-600 border-blue-500 text-white' : 'border-white/10 text-white/60 hover:border-white/30'}`}>
              {i}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-white/60 mb-1.5">Keywords</label>
          <textarea value={data.keywords ?? ''} onChange={e => setData({ ...data, keywords: e.target.value })}
            placeholder="react, typescript, web development..."
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-blue-500 resize-none" />
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1.5">Daily Frequency Cap</label>
          <input type="number" min="1" max="20" value={data.frequencyCap ?? 5} onChange={e => setData({ ...data, frequencyCap: Number(e.target.value) })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500" />
          <p className="text-xs text-white/30 mt-1.5">Max times a user sees this ad per day</p>
        </div>
      </div>
    </div>
  );
}

function StepCreative({ data, setData }: any) {
  const formats = ['PRE_ROLL', 'MID_ROLL', 'SHORTS', 'DISPLAY'];
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm text-white/60 mb-2">Ad Format</label>
        <div className="grid grid-cols-2 gap-2">
          {formats.map(f => (
            <button key={f} type="button" onClick={() => setData({ ...data, format: f })}
              className={`px-4 py-3 rounded-xl text-sm font-medium border text-left transition-colors ${data.format === f ? 'bg-blue-600 border-blue-500 text-white' : 'border-white/10 text-white/60 hover:border-white/30'}`}>
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-white/20 transition-colors cursor-pointer">
        <div className="text-4xl mb-3">🎬</div>
        <p className="text-white/60 text-sm mb-1">Drag & drop your video or image</p>
        <p className="text-white/30 text-xs">MP4, WebM, JPG, PNG · Max 200MB</p>
        <button className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm rounded-xl transition-colors">Browse Files</button>
      </div>

      <div>
        <label className="block text-sm text-white/60 mb-1.5">Click URL</label>
        <input type="url" value={data.clickUrl ?? ''} onChange={e => setData({ ...data, clickUrl: e.target.value })}
          placeholder="https://your-site.com/landing"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-blue-500" />
      </div>

      <div>
        <label className="block text-sm text-white/60 mb-1.5">CTA Text</label>
        <input value={data.ctaText ?? ''} onChange={e => setData({ ...data, ctaText: e.target.value })}
          placeholder="Learn More"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-blue-500" />
      </div>
    </div>
  );
}

function StepReview({ data }: any) {
  return (
    <div className="space-y-4">
      {[
        ['Campaign Name', data.name || '—'],
        ['Budget', `$${data.budget ?? 0} (${data.budgetType ?? 'DAILY'})`],
        ['Dates', `${data.startDate ?? '—'} → ${data.endDate ?? '—'}`],
        ['Countries', (data.countries ?? []).join(', ') || 'All'],
        ['Devices', (data.devices ?? []).join(', ') || 'All'],
        ['Ad Format', data.format ?? '—'],
        ['Click URL', data.clickUrl || '—'],
        ['CTA Text', data.ctaText || '—'],
      ].map(([k, v]) => (
        <div key={k} className="flex justify-between py-3 border-b border-white/5">
          <span className="text-sm text-white/40">{k}</span>
          <span className="text-sm text-white font-medium max-w-xs truncate text-right">{v}</span>
        </div>
      ))}
      <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4 mt-4">
        <p className="text-sm text-blue-300">Your campaign will be submitted for review. Once approved it will go live on the start date.</p>
      </div>
    </div>
  );
}

// ── Wizard Shell ─────────────────────────────────────────────────────────────
export default function NewCampaignPage() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<any>({ budgetType: 'DAILY', budget: 100 });

  const stepComponents = [
    <StepBasics key={0} data={data} setData={setData} />,
    <StepTargeting key={1} data={data} setData={setData} />,
    <StepCreative key={2} data={data} setData={setData} />,
    <StepReview key={3} data={data} />,
  ];

  const handleSubmit = async () => {
    const res = await fetch('/api/v1/ads/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) alert('Campaign submitted for review!');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-6">Create New Campaign</h1>

        {/* Step indicators */}
        <div className="flex items-center gap-0">
          {STEPS.map((label, i) => (
            <div key={i} className="flex-1 flex flex-col items-center relative">
              {/* connector line */}
              {i < STEPS.length - 1 && (
                <div className={`absolute top-4 left-1/2 w-full h-0.5 ${i < step ? 'bg-blue-600' : 'bg-white/10'}`} />
              )}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold z-10 relative border-2 transition-all ${
                i < step  ? 'bg-blue-600 border-blue-600 text-white' :
                i === step ? 'bg-white border-white text-black' :
                             'bg-transparent border-white/20 text-white/30'
              }`}>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span className={`text-xs mt-2 ${i === step ? 'text-white' : 'text-white/30'}`}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
        {stepComponents[step]}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
          className="px-6 py-2.5 rounded-xl text-sm font-medium border border-white/10 text-white/60 hover:text-white hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          Back
        </button>

        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep(step + 1)}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors">
            Continue →
          </button>
        ) : (
          <button onClick={handleSubmit}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors">
            Submit Campaign ✓
          </button>
        )}
      </div>
    </div>
  );
}

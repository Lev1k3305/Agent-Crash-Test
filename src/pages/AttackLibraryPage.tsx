import React from 'react';
import { Crosshair, Shield, Terminal, AlertTriangle, Layers, BookOpen } from 'lucide-react';

export const AttackLibraryPage: React.FC = () => {
  const plannedCategories = [
    {
      title: 'Direct Jailbreaks & Overrides',
      code: 'ATK-DIR-01',
      description: 'System prompt extraction, persona shifting, and unconditional approval directives.',
      payloads: 14,
    },
    {
      title: 'Indirect Cross-Domain Injection',
      code: 'ATK-IND-02',
      description: 'Malicious instructions embedded inside PDF invoices, order line items, and tracking URLs.',
      payloads: 8,
    },
    {
      title: 'Tool & Parameter Tampering',
      code: 'ATK-TOOL-03',
      description: 'Injecting negative integers into refund amounts, SQL injection payloads in customer IDs.',
      payloads: 11,
    },
    {
      title: 'Race Condition & Double Spend',
      code: 'ATK-RACE-04',
      description: 'Submitting simultaneous refund requests to defeat idempotency tokens.',
      payloads: 6,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Scope Disclaimer Banner */}
      <div className="bg-[#111722] border border-[#1E293B] rounded-2xl p-8 text-center relative overflow-hidden cyber-grid-bg">
        <div className="w-16 h-16 rounded-2xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-center text-purple-400 mx-auto mb-4 cyber-glow-purple">
          <Crosshair className="w-8 h-8 text-purple-400" />
        </div>

        <div className="inline-block px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/30 text-purple-300 text-xs font-mono mb-3">
          Status: Planned for Phase 4 (Crash Scenarios & Attack Vectors)
        </div>

        <h2 className="text-xl font-bold text-white mb-2">
          Adversarial Attack Library Catalog
        </h2>

        <p className="text-slate-400 text-sm max-w-xl mx-auto mb-6 font-normal leading-relaxed">
          The attack library will contain a curated, versioned taxonomy of adversarial attack vectors, prompt injection payloads, and business logic boundary exploits designed to test agent guardrails.
        </p>
      </div>

      {/* Planned Vector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plannedCategories.map((cat) => (
          <div key={cat.code} className="bg-[#111722] border border-slate-800 rounded-xl p-5 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <span className="text-purple-400 font-semibold">{cat.code}</span>
              <span className="text-slate-400 text-[10px] uppercase">{cat.payloads} Planned Vectors</span>
            </div>
            <h4 className="text-sm font-bold text-white mt-3">{cat.title}</h4>
            <p className="text-xs text-slate-400 mt-1">{cat.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

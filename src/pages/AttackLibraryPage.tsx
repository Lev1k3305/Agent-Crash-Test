import React, { useState } from 'react';
import { Crosshair, Shield, BookOpen, AlertTriangle, Search, Filter } from 'lucide-react';

export const AttackLibraryPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<string>('All');

  const attackTaxonomy = [
    {
      code: 'ATK-DIR-01',
      title: 'Direct Jailbreaks & Directive Overrides',
      category: 'Prompt Injection',
      risk: 'Critical',
      description: 'Techniques that override core system instructions, personas, and safety boundaries using roleplay, simulated terminal prompts, or base64 evasion.',
      examples: [
        'System prompt exfiltration via diagnostic requests',
        'Developer mode override instruction',
        'Hypothetical scenario bypass'
      ],
      vectorsCount: 14,
    },
    {
      code: 'ATK-IND-02',
      title: 'Indirect Cross-Domain Injection',
      category: 'Data Poisoning',
      risk: 'High',
      description: 'Malicious instructions embedded inside external data sources retrieved by the agent, such as invoices, customer tickets, emails, or API responses.',
      examples: [
        'Hidden instructions inside invoice PDF comments',
        'Prompt injection within shipping address field',
        'Adversarial HTML comments in CRM webhooks'
      ],
      vectorsCount: 8,
    },
    {
      code: 'ATK-TOOL-03',
      title: 'Tool & Parameter Tampering',
      category: 'Privilege Escalation',
      risk: 'High',
      description: 'Manipulating function calling arguments, negative integers in monetary transactions, or unauthorized database mutations via tool parameters.',
      examples: [
        'Negative refund amount injection',
        'SQL injection in customer lookups',
        'Unauthorized role escalation parameter'
      ],
      vectorsCount: 11,
    },
    {
      code: 'ATK-RACE-04',
      title: 'Race Conditions & Double-Spend Attacks',
      category: 'Business Logic',
      risk: 'Medium',
      description: 'Simultaneous or concurrent execution payloads designed to defeat transactional idempotency tokens and duplicate state-altering actions.',
      examples: [
        'Simultaneous refund request submission',
        'Multi-session discount code re-use',
        'Inventory lock timeout evasion'
      ],
      vectorsCount: 6,
    },
  ];

  const filtered = attackTaxonomy.filter((item) => {
    const matchesRisk = selectedRisk === 'All' || item.risk === selectedRisk;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRisk && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#131720] border border-white/[0.07] rounded-xl p-6 relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6]">
              <Crosshair className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-[#F4F5F7]">
                  Adversarial Attack Library Catalog
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.07] text-[#9299A8]">
                  Taxonomy Knowledge Base
                </span>
              </div>
              <p className="text-xs text-[#9299A8] mt-1 leading-relaxed max-w-2xl">
                Structured taxonomy of adversarial vectors, prompt injection payloads, and business logic boundary exploits designed to test agent guardrails.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 rounded-xl bg-[#131720] border border-white/[0.07]">
        <div className="flex items-center gap-1 w-full sm:w-auto">
          {(['All', 'Critical', 'High', 'Medium'] as const).map((r) => {
            const isActive = selectedRisk === r;
            return (
              <button
                key={r}
                onClick={() => setSelectedRisk(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#191E29] text-[#F4F5F7] border border-white/[0.1]'
                    : 'text-[#9299A8] hover:text-[#F4F5F7] border border-transparent'
                }`}
              >
                {r}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-[#697386] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search attack categories, codes..."
            className="w-full bg-[#0E1118] border border-white/[0.07] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#F4F5F7] placeholder-[#697386] focus:outline-none focus:border-[#8B5CF6]"
          />
        </div>
      </div>

      {/* Planned Vector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((cat) => (
          <div
            key={cat.code}
            className="bg-[#131720] border border-white/[0.07] rounded-xl p-5 hover:border-white/[0.12] transition-enterprise space-y-3"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] text-xs">
              <span className="font-mono text-[#8B5CF6] font-semibold">{cat.code}</span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                    cat.risk === 'Critical'
                      ? 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20'
                      : cat.risk === 'High'
                      ? 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20'
                      : 'bg-[#60A5FA]/10 text-[#60A5FA] border border-[#60A5FA]/20'
                  }`}
                >
                  {cat.risk} Risk
                </span>
                <span className="text-[11px] font-mono text-[#697386]">{cat.vectorsCount} Vectors</span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[#F4F5F7]">{cat.title}</h4>
              <p className="text-xs text-[#9299A8] mt-1 leading-relaxed">{cat.description}</p>
            </div>

            {/* Example Payloads */}
            <div className="p-3 rounded-lg bg-[#0E1118] border border-white/[0.04] space-y-1.5 text-xs">
              <span className="text-[10px] font-semibold text-[#697386] uppercase tracking-wider block">
                Representative Vectors:
              </span>
              {cat.examples.map((ex, i) => (
                <div key={i} className="flex items-center gap-2 text-[#9299A8] text-[11px]">
                  <span className="w-1 h-1 rounded-full bg-[#8B5CF6]" />
                  <span>{ex}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

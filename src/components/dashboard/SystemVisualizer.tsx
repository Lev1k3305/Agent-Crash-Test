import React from 'react';
import { Bot, ShoppingCart, Lock, ArrowRight, ShieldCheck, Terminal } from 'lucide-react';

export const SystemVisualizer: React.FC = () => {
  return (
    <div className="bg-[#131720] border border-white/[0.07] rounded-xl p-5">
      {/* Visual Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#9299A8]">
            Isolated Testing Topology
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.07] text-[#9299A8]">
          Architecture View
        </span>
      </div>

      {/* Topology Flow Graph */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center py-2">
        {/* 1. Test Input Node */}
        <div className="md:col-span-3 bg-[#0E1118] border border-white/[0.07] rounded-xl p-3.5">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.06] text-xs text-[#8B5CF6]">
            <span className="flex items-center gap-1.5 font-semibold">
              <Terminal className="w-3.5 h-3.5" />
              Adversarial Input
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20 font-mono">
              Payload
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-[#9299A8]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA]" />
              <span className="truncate">Directive Override</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
              <span className="truncate">Prompt Injection</span>
            </div>
          </div>
        </div>

        {/* Arrow 1 */}
        <div className="hidden md:flex md:col-span-1 justify-center items-center text-[#697386]">
          <ArrowRight className="w-4 h-4" />
        </div>

        {/* 2. Isolated Sandbox Centerpiece */}
        <div className="md:col-span-3 flex flex-col items-center justify-center p-4 rounded-xl bg-[#0E1118] border border-white/[0.07]">
          <div className="w-12 h-12 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center mb-2 text-[#8B5CF6]">
            <Bot className="w-6 h-6" />
          </div>

          <div className="text-center">
            <div className="text-sm font-semibold text-[#F4F5F7]">
              AI Agent Under Test
            </div>
            <div className="text-[11px] text-[#9299A8]">
              Target Operations Workflow
            </div>
          </div>

          <div className="mt-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[10px] text-[#9299A8]">
            <Lock className="w-3 h-3 text-[#60A5FA]" />
            <span>Isolated Sandbox</span>
          </div>
        </div>

        {/* Arrow 2 */}
        <div className="hidden md:flex md:col-span-1 justify-center items-center text-[#697386]">
          <ArrowRight className="w-4 h-4" />
        </div>

        {/* 3. Target System Node */}
        <div className="md:col-span-3 bg-[#0E1118] border border-white/[0.07] rounded-xl p-3.5">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.06] text-xs text-[#60A5FA]">
            <span className="flex items-center gap-1.5 font-semibold">
              <ShoppingCart className="w-3.5 h-3.5" />
              Target System
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#60A5FA]/10 text-[#60A5FA] border border-[#60A5FA]/20 font-mono">
              CRM State
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-[#9299A8]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA]" />
              <span className="truncate">Orders & Transactions</span>
            </div>
            <div className="flex items-center gap-2 text-[#22C55E]">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate text-[11px]">Audit Trace Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

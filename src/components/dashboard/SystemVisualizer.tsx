import React from 'react';
import { Bot, ShoppingCart, Lock, ArrowRight, ShieldCheck, Terminal, AlertTriangle } from 'lucide-react';

export const SystemVisualizer: React.FC = () => {
  return (
    <div className="bg-[#111722] border border-[#1E293B] rounded-xl p-6 relative overflow-hidden cyber-grid-bg">
      {/* Visual Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_#8b5cf6]" />
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
            Isolated Testing Topology
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30 text-purple-300">
          Phase 1 Architecture Concept
        </span>
      </div>

      {/* Topology Flow Graph */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center py-4">
        {/* 1. Test Input Node */}
        <div className="md:col-span-3 bg-[#0B0F19]/90 border border-purple-500/30 rounded-xl p-4 shadow-[0_0_20px_-5px_rgba(139,92,246,0.2)]">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs font-mono text-purple-400">
            <span className="flex items-center gap-1.5 font-semibold">
              <Terminal className="w-3.5 h-3.5" />
              &gt;_ Test Input
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/60">
              Payload
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Refund order #1042</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              <span>Scenario: Prompt Injection</span>
            </div>
            <div className="flex items-center gap-2 text-rose-400 font-semibold pt-1 border-t border-slate-800/80">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Risk Level: High</span>
            </div>
          </div>
        </div>

        {/* Arrow 1 */}
        <div className="hidden md:flex md:col-span-1 justify-center items-center text-purple-400/60">
          <ArrowRight className="w-6 h-6 animate-pulse" />
        </div>

        {/* 2. Isolated Sandbox Centerpiece */}
        <div className="md:col-span-3 relative flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-b from-purple-950/40 to-[#080B10] border-2 border-purple-500/50 shadow-[0_0_30px_-5px_rgba(139,92,246,0.3)]">
          {/* Glowing Aura Ring */}
          <div className="w-20 h-20 rounded-2xl bg-purple-600/20 border border-purple-400/50 flex items-center justify-center mb-3 relative cyber-glow-purple">
            <Bot className="w-10 h-10 text-purple-300 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#111722]" />
          </div>

          <div className="text-center">
            <div className="text-base font-bold text-white tracking-wide">
              AI AGENT
            </div>
            <div className="text-xs text-purple-400 font-mono">
              Business Operations Agent
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-900/40 border border-purple-400/40 text-[11px] font-mono text-purple-200">
            <Lock className="w-3 h-3 text-cyan-400" />
            <span>Isolated Sandbox</span>
          </div>
        </div>

        {/* Arrow 2 */}
        <div className="hidden md:flex md:col-span-1 justify-center items-center text-cyan-400/60">
          <ArrowRight className="w-6 h-6 animate-pulse" />
        </div>

        {/* 3. Target System Node */}
        <div className="md:col-span-3 bg-[#0B0F19]/90 border border-cyan-500/30 rounded-xl p-4 shadow-[0_0_20px_-5px_rgba(56,189,248,0.2)]">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs font-mono text-cyan-400">
            <span className="flex items-center gap-1.5 font-semibold">
              <ShoppingCart className="w-3.5 h-3.5" />
              Target System
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
              Mock CRM
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Orders & Customer Records</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Refund Transaction Engine</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold pt-1 border-t border-slate-800/80">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Audit Logging Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

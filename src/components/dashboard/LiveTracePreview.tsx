import React from 'react';
import { Terminal, Check, Clock, ShoppingCart, Users, RotateCcw, ShieldAlert, AlertCircle } from 'lucide-react';

export const LiveTracePreview: React.FC = () => {
  return (
    <div className="bg-[#111722] border border-[#1E293B] rounded-xl p-5 relative overflow-hidden">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between pb-3 mb-4 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
          <span className="font-bold text-white text-sm tracking-wide">
            Live Test Execution
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/40 uppercase font-semibold">
            • LIVE (PREVIEW)
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <span>Run ID: <strong className="text-white">#0024</strong></span>
          <span>Duration: <strong className="text-cyan-400">01:24</strong></span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 hidden sm:inline">
            Phase 4/5 Preview
          </span>
        </div>
      </div>

      {/* Main split preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: CRM Window Simulation */}
        <div className="lg:col-span-6 bg-[#0B0F19] border border-slate-800 rounded-lg p-3.5 text-xs font-mono">
          {/* Window dots */}
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-[11px] text-slate-400 font-medium">CRM — Orders</span>
            </div>
            <span className="text-[10px] text-slate-400">Target System</span>
          </div>

          <div className="grid grid-cols-12 gap-3">
            {/* CRM Nav */}
            <div className="col-span-4 space-y-1 pr-2 border-r border-slate-800/80 text-[11px]">
              <div className="px-2 py-1.5 rounded bg-purple-950/60 border border-purple-500/30 text-purple-300 font-semibold flex items-center gap-1.5">
                <ShoppingCart className="w-3 h-3 text-purple-400" />
                Orders
              </div>
              <div className="px-2 py-1 rounded text-slate-400 flex items-center gap-1.5">
                <Users className="w-3 h-3 text-slate-400" />
                Customers
              </div>
              <div className="px-2 py-1 rounded text-slate-400 flex items-center gap-1.5">
                <RotateCcw className="w-3 h-3 text-slate-400" />
                Refunds
              </div>
              <div className="px-2 py-1 rounded text-slate-400 flex items-center gap-1.5">
                <ShieldAlert className="w-3 h-3 text-slate-400" />
                Policies
              </div>
            </div>

            {/* CRM Order Details */}
            <div className="col-span-8 space-y-2 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">Order #1042</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] border border-emerald-800/60">
                  Completed
                </span>
              </div>
              <div className="space-y-1 text-slate-400 text-[11px]">
                <div className="flex justify-between">
                  <span>Customer</span>
                  <span className="text-white font-medium">A. Sərsembay</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount</span>
                  <span className="text-cyan-400 font-medium">₸ 24,900</span>
                </div>
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className="text-emerald-400">Delivered</span>
                </div>
                <div className="flex justify-between">
                  <span>Refund</span>
                  <span className="text-slate-400">—</span>
                </div>
              </div>

              {/* Action Button with cursor indicator */}
              <div className="pt-2 flex justify-end">
                <button 
                  disabled
                  className="px-3 py-1.5 rounded bg-purple-600/40 text-purple-200 border border-purple-500/40 text-[11px] font-medium flex items-center gap-1.5 opacity-90 cursor-not-allowed"
                >
                  <span>Process Refund</span>
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Agent Activity Terminal */}
        <div className="lg:col-span-6 bg-[#080B10] border border-slate-800 rounded-lg p-3.5 text-xs font-mono">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800/80 text-cyan-400 text-xs">
            <span className="flex items-center gap-1.5 font-semibold">
              <Terminal className="w-3.5 h-3.5" />
              &gt;_ Agent Activity (Real-time trace)
            </span>
            <span className="text-[10px] text-slate-400">Telemetry</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">[14:26:10] &gt; Navigate to /orders/1042</span>
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">[14:26:18] &gt; Read order details</span>
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">[14:26:27] &gt; Check refund policy</span>
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            </div>
            <div className="flex items-center justify-between text-cyan-300 font-semibold">
              <span className="text-cyan-400">[14:26:35] &gt; Process refund</span>
              <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin shrink-0" />
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>[14:26:41] &gt; Verify result</span>
              <span className="text-slate-600 text-xs font-mono">...</span>
            </div>
          </div>
        </div>
      </div>

      {/* Execution Timeline Step Bar */}
      <div className="mt-4 pt-3 border-t border-slate-800/80">
        <div className="grid grid-cols-5 gap-2 text-center text-[11px] font-mono">
          <div className="flex flex-col items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 mb-1" />
            <span className="text-slate-400">Initialization</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 mb-1" />
            <span className="text-slate-400">Env Setup</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_#8b5cf6] mb-1 animate-pulse" />
            <span className="text-purple-300 font-semibold">Agent Execution</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-700 mb-1" />
            <span className="text-slate-400">Evaluation</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-700 mb-1" />
            <span className="text-slate-400">Report</span>
          </div>
        </div>
      </div>
    </div>
  );
};

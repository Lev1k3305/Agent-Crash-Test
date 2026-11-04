import React from 'react';
import { Target, Sliders, Play, Search, FileText, ArrowRight } from 'lucide-react';

export const WorkflowBanner: React.FC = () => {
  const steps = [
    {
      num: '1',
      title: 'Choose Scenario',
      desc: 'Выбор сценария',
      icon: <Target className="w-4 h-4 text-purple-400" />,
    },
    {
      num: '2',
      title: 'Configure Test',
      desc: 'Настройка параметров',
      icon: <Sliders className="w-4 h-4 text-indigo-400" />,
    },
    {
      num: '3',
      title: 'Run Agent (Isolated)',
      desc: 'Запуск в Sandbox',
      icon: <Play className="w-4 h-4 text-cyan-400" />,
    },
    {
      num: '4',
      title: 'Evaluate',
      desc: 'Анализ действий',
      icon: <Search className="w-4 h-4 text-blue-400" />,
    },
    {
      num: '5',
      title: 'Get Report',
      desc: 'Отчёт с доказательствами',
      icon: <FileText className="w-4 h-4 text-emerald-400" />,
    },
  ];

  return (
    <div className="bg-[#0B0F19] border border-[#1E293B] rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase tracking-wider shrink-0">
        <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
        <span>Workflow:</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 w-full max-w-5xl">
        {steps.map((s, idx) => (
          <React.Fragment key={s.num}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#111722] border border-slate-800 flex items-center justify-center shrink-0">
                {s.icon}
              </div>
              <div className="text-left font-mono">
                <div className="text-xs font-semibold text-white">
                  {s.num}. {s.title}
                </div>
                <div className="text-[10px] text-slate-400">
                  {s.desc}
                </div>
              </div>
            </div>

            {idx < steps.length - 1 && (
              <ArrowRight className="w-4 h-4 text-slate-700 hidden lg:block shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

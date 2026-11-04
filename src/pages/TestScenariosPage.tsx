import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search, 
  ArrowRight, 
  Lock, 
  UserX, 
  CopyCheck, 
  ZapOff, 
  Scale, 
  FileWarning, 
  Plus,
  Trash2,
  RefreshCw,
  X,
  AlertTriangle
} from 'lucide-react';
import { TestScenario } from '../types';
import { fetchScenarios, createScenario, deleteScenario } from '../services/api';

export const TestScenariosPage: React.FC = () => {
  const [scenarios, setScenarios] = useState<TestScenario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'All' | 'Security' | 'Business' | 'Reliability'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScenario, setSelectedScenario] = useState<TestScenario | null>(null);

  // New scenario modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<'Security' | 'Business' | 'Reliability'>('Security');
  const [newRiskLevel, setNewRiskLevel] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('High');
  const [newDescription, setNewDescription] = useState('');
  const [newThreat, setNewThreat] = useState('');
  const [newWorkflow, setNewWorkflow] = useState('E-commerce CRM');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadScenarios = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetchScenarios();
      setScenarios(res.items);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load scenarios from SQLite database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadScenarios();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim() || !newDescription.trim()) {
      setSubmitError('Code, name, and description are required.');
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await createScenario({
        code: newCode.trim().toUpperCase(),
        name: newName.trim(),
        category: newCategory,
        risk_level: newRiskLevel,
        description: newDescription.trim(),
        detailed_threat: newThreat.trim() || undefined,
        target_workflow: newWorkflow.trim() || 'E-commerce CRM',
        is_active: true,
      });
      setIsCreateOpen(false);
      setNewCode('');
      setNewName('');
      setNewDescription('');
      setNewThreat('');
      await loadScenarios();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to save scenario to database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete test scenario "${name}"? This will also remove associated test runs.`)) {
      return;
    }
    try {
      await deleteScenario(id);
      await loadScenarios();
      if (selectedScenario?.id === id) {
        setSelectedScenario(null);
      }
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const getScenarioIcon = (code: string) => {
    if (code.startsWith('SEC')) return <Lock className="w-5 h-5 text-purple-400" />;
    if (code.startsWith('BUS')) return <UserX className="w-5 h-5 text-indigo-400" />;
    if (code.startsWith('REL')) return <CopyCheck className="w-5 h-5 text-cyan-400" />;
    return <ShieldAlert className="w-5 h-5 text-purple-400" />;
  };

  const filtered = scenarios.filter((s) => {
    const matchesCat = activeCategory === 'All' || s.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#111722] border border-slate-800 text-xs font-mono">
          {(['All', 'Security', 'Business', 'Reliability'] as const).map((cat) => {
            const count =
              cat === 'All'
                ? scenarios.length
                : scenarios.filter((s) => s.category.toLowerCase() === cat.toLowerCase()).length;
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-purple-600/40 text-white border border-purple-500/50 shadow-[0_0_10px_rgba(139,92,246,0.2)]'
                    : 'text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Controls: Search, Refresh, Add */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scenarios..."
              className="w-full bg-[#111722] border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/60"
            />
          </div>

          <button
            onClick={loadScenarios}
            disabled={isLoading}
            title="Reload from SQLite database"
            className="p-2 rounded-lg bg-[#111722] border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-purple-400' : ''}`} />
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-medium shadow-[0_0_12px_rgba(139,92,246,0.3)] transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Scenario</span>
          </button>
        </div>
      </div>

      {/* Error state */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={loadScenarios}
            className="px-2.5 py-1 rounded bg-rose-900/60 text-white hover:bg-rose-800 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading && scenarios.length === 0 && (
        <div className="p-12 text-center text-slate-400 font-mono text-xs">
          <RefreshCw className="w-6 h-6 animate-spin text-purple-400 mx-auto mb-2" />
          Loading persistent scenarios from SQLite database...
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedScenario(item)}
            className="bg-[#111722] border border-[#1E293B] rounded-xl p-5 hover:border-purple-500/50 transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-mono">
                <span className="text-purple-400 font-bold">{item.code}</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                      item.category.toLowerCase() === 'security'
                        ? 'bg-purple-950 text-purple-300 border border-purple-800/60'
                        : item.category.toLowerCase() === 'business'
                        ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/60'
                        : 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                    }`}
                  >
                    {item.category}
                  </span>
                  <button
                    onClick={(e) => handleDelete(item.id, item.name, e)}
                    title="Delete scenario from database"
                    className="text-slate-600 hover:text-rose-400 p-0.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="my-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#0B0F19] border border-slate-800 flex items-center justify-center shrink-0 group-hover:border-purple-500/40 transition-colors">
                  {getScenarioIcon(item.code)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
              <span
                className={`text-[11px] font-semibold ${
                  item.risk_level === 'Critical'
                    ? 'text-rose-400'
                    : item.risk_level === 'High'
                    ? 'text-amber-400'
                    : 'text-cyan-400'
                }`}
              >
                Risk: {item.risk_level}
              </span>
              <span className="text-purple-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 text-[11px]">
                <span>Inspect</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Scenario Detail Modal */}
      {selectedScenario && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#111722] border border-purple-500/40 rounded-2xl max-w-lg w-full p-6 relative cyber-glow-purple space-y-4 font-mono">
            <button
              onClick={() => setSelectedScenario(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs text-purple-400">
              <span className="font-bold">{selectedScenario.code}</span>
              <span>·</span>
              <span>{selectedScenario.category}</span>
              <span>·</span>
              <span className="text-cyan-400">Database ID #{selectedScenario.id}</span>
            </div>

            <h3 className="text-lg font-bold text-white">{selectedScenario.name}</h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-[#080B10] border border-slate-800">
                <div className="text-slate-400 text-[11px] uppercase mb-1">Description</div>
                <div className="text-slate-200">{selectedScenario.description}</div>
              </div>

              {selectedScenario.detailed_threat && (
                <div className="p-3 rounded-lg bg-[#080B10] border border-slate-800">
                  <div className="text-slate-400 text-[11px] uppercase mb-1">Detailed Threat Model</div>
                  <div className="text-slate-300">{selectedScenario.detailed_threat}</div>
                </div>
              )}

              <div className="p-3 rounded-lg bg-[#080B10] border border-slate-800">
                <div className="text-slate-400 text-[11px] uppercase mb-1">Target Workflow</div>
                <div className="text-cyan-400">{selectedScenario.target_workflow || 'E-commerce CRM'}</div>
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                <span>Created: {selectedScenario.created_at?.slice(0, 19).replace('T', ' ')}</span>
                <span>Active: {selectedScenario.is_active ? 'Yes' : 'No'}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSelectedScenario(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Scenario Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleCreate}
            className="bg-[#111722] border border-purple-500/40 rounded-2xl max-w-lg w-full p-6 relative cyber-glow-purple space-y-4 font-mono text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-400" />
                Add Persistent Test Scenario
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitError && (
              <div className="p-2.5 rounded bg-rose-950/60 border border-rose-500/40 text-rose-300">
                {submitError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Scenario Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SEC-03"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full bg-[#080B10] border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Category *</label>
                <select
                  value={newCategory}
                  onChange={(e: any) => setNewCategory(e.target.value)}
                  className="w-full bg-[#080B10] border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Security">Security</option>
                  <option value="Business">Business</option>
                  <option value="Reliability">Reliability</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Scenario Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. System Prompt Exfiltration"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-[#080B10] border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Risk Level</label>
                <select
                  value={newRiskLevel}
                  onChange={(e: any) => setNewRiskLevel(e.target.value)}
                  className="w-full bg-[#080B10] border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Target Workflow</label>
                <input
                  type="text"
                  value={newWorkflow}
                  onChange={(e) => setNewWorkflow(e.target.value)}
                  className="w-full bg-[#080B10] border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Description *</label>
              <textarea
                required
                rows={2}
                placeholder="Brief summary of test condition"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full bg-[#080B10] border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Detailed Threat (Optional)</label>
              <textarea
                rows={2}
                placeholder="Specific adversarial payload or exploit details"
                value={newThreat}
                onChange={(e) => setNewThreat(e.target.value)}
                className="w-full bg-[#080B10] border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 text-white font-medium cursor-pointer"
              >
                {isSubmitting ? 'Saving to SQLite...' : 'Save Scenario'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search, 
  ArrowRight, 
  Lock, 
  UserX, 
  CopyCheck, 
  Plus,
  Trash2,
  RefreshCw,
  X,
  AlertTriangle,
  ChevronRight,
  Shield
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
    if (code.startsWith('SEC')) return <Lock className="w-4 h-4 text-[#8B5CF6]" />;
    if (code.startsWith('BUS')) return <UserX className="w-4 h-4 text-[#60A5FA]" />;
    if (code.startsWith('REL')) return <CopyCheck className="w-4 h-4 text-[#22C55E]" />;
    return <ShieldAlert className="w-4 h-4 text-[#8B5CF6]" />;
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
      {/* Top Header & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-[#F4F5F7]">Test Scenarios</h2>
          <p className="text-xs text-[#9299A8] mt-0.5">
            Adversarial stress-test scenarios configured and persisted in SQLite
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={loadScenarios}
            disabled={isLoading}
            title="Reload from SQLite database"
            className="p-2 rounded-lg bg-[#131720] border border-white/[0.07] text-[#9299A8] hover:text-[#F4F5F7] transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#8B5CF6]' : ''}`} />
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-medium transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Scenario</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 rounded-xl bg-[#131720] border border-white/[0.07]">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 w-full sm:w-auto">
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
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#191E29] text-[#F4F5F7] border border-white/[0.1]'
                    : 'text-[#9299A8] hover:text-[#F4F5F7] border border-transparent'
                }`}
              >
                {cat} <span className="text-[10px] text-[#697386]">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-[#697386] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by code, name, description..."
            className="w-full bg-[#0E1118] border border-white/[0.07] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#F4F5F7] placeholder-[#697386] focus:outline-none focus:border-[#8B5CF6]"
          />
        </div>
      </div>

      {/* Error state */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={loadScenarios}
            className="px-2.5 py-1 rounded bg-[#EF4444]/20 hover:bg-[#EF4444]/30 text-white cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading && scenarios.length === 0 && (
        <div className="p-12 text-center text-[#9299A8] text-xs">
          <RefreshCw className="w-5 h-5 animate-spin text-[#8B5CF6] mx-auto mb-2" />
          Loading scenarios from SQLite...
        </div>
      )}

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedScenario(item)}
            className="bg-[#131720] border border-white/[0.07] rounded-xl p-5 hover:border-white/[0.14] transition-enterprise cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] text-xs">
                <span className="font-mono text-[#8B5CF6] font-semibold">{item.code}</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                      item.category.toLowerCase() === 'security'
                        ? 'bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20'
                        : item.category.toLowerCase() === 'business'
                        ? 'bg-[#60A5FA]/10 text-[#60A5FA] border border-[#60A5FA]/20'
                        : 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20'
                    }`}
                  >
                    {item.category}
                  </span>
                  <button
                    onClick={(e) => handleDelete(item.id, item.name, e)}
                    title="Delete scenario"
                    className="text-[#697386] hover:text-[#EF4444] p-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="my-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#0E1118] border border-white/[0.07] flex items-center justify-center shrink-0">
                  {getScenarioIcon(item.code)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-[#F4F5F7] group-hover:text-white transition-colors truncate">
                    {item.name}
                  </h3>
                  <p className="text-xs text-[#9299A8] mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
              <span
                className={`text-[11px] font-medium ${
                  item.risk_level === 'Critical'
                    ? 'text-[#EF4444]'
                    : item.risk_level === 'High'
                    ? 'text-[#F59E0B]'
                    : 'text-[#60A5FA]'
                }`}
              >
                Risk: {item.risk_level}
              </span>
              <span className="text-[#8B5CF6] group-hover:translate-x-0.5 transition-transform flex items-center gap-1 text-[11px] font-medium">
                <span>Inspect</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Scenario Detail Modal */}
      {selectedScenario && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#131720] border border-white/[0.1] rounded-xl max-w-lg w-full p-6 relative space-y-4 shadow-xl">
            <button
              onClick={() => setSelectedScenario(null)}
              className="absolute top-4 right-4 text-[#9299A8] hover:text-[#F4F5F7] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-xs text-[#8B5CF6] font-mono">
              <span className="font-semibold">{selectedScenario.code}</span>
              <span>·</span>
              <span className="text-[#9299A8]">{selectedScenario.category}</span>
              <span>·</span>
              <span className="text-[#697386]">ID #{selectedScenario.id}</span>
            </div>

            <h3 className="text-base font-semibold text-[#F4F5F7]">{selectedScenario.name}</h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-[#0E1118] border border-white/[0.06]">
                <div className="text-[#697386] text-[10px] uppercase font-medium mb-1">Description</div>
                <div className="text-[#F4F5F7] leading-relaxed">{selectedScenario.description}</div>
              </div>

              {selectedScenario.detailed_threat && (
                <div className="p-3 rounded-lg bg-[#0E1118] border border-white/[0.06]">
                  <div className="text-[#697386] text-[10px] uppercase font-medium mb-1">Detailed Threat Model</div>
                  <div className="text-[#9299A8] leading-relaxed">{selectedScenario.detailed_threat}</div>
                </div>
              )}

              <div className="p-3 rounded-lg bg-[#0E1118] border border-white/[0.06]">
                <div className="text-[#697386] text-[10px] uppercase font-medium mb-1">Target Workflow</div>
                <div className="text-[#60A5FA] font-mono">{selectedScenario.target_workflow || 'E-commerce CRM'}</div>
              </div>

              <div className="flex justify-between items-center text-[11px] text-[#697386] pt-1">
                <span>Created: {selectedScenario.created_at?.slice(0, 19).replace('T', ' ')}</span>
                <span>Active: {selectedScenario.is_active ? 'Yes' : 'No'}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedScenario(null)}
                className="px-4 py-2 rounded-lg bg-[#191E29] hover:bg-[#202736] text-[#F4F5F7] text-xs font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Scenario Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleCreate}
            className="bg-[#131720] border border-white/[0.1] rounded-xl max-w-lg w-full p-6 relative space-y-4 text-xs shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
              <h3 className="text-sm font-semibold text-[#F4F5F7] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#8B5CF6]" />
                Add Persistent Test Scenario
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-[#9299A8] hover:text-[#F4F5F7] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {submitError && (
              <div className="p-2.5 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444]">
                {submitError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#9299A8] mb-1">Scenario Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SEC-03"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full bg-[#0E1118] border border-white/[0.07] rounded-lg px-3 py-2 text-[#F4F5F7] font-mono focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>

              <div>
                <label className="block text-[#9299A8] mb-1">Category *</label>
                <select
                  value={newCategory}
                  onChange={(e: any) => setNewCategory(e.target.value)}
                  className="w-full bg-[#0E1118] border border-white/[0.07] rounded-lg px-3 py-2 text-[#F4F5F7] focus:outline-none focus:border-[#8B5CF6]"
                >
                  <option value="Security">Security</option>
                  <option value="Business">Business</option>
                  <option value="Reliability">Reliability</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[#9299A8] mb-1">Scenario Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. System Prompt Exfiltration"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-[#0E1118] border border-white/[0.07] rounded-lg px-3 py-2 text-[#F4F5F7] focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#9299A8] mb-1">Risk Level</label>
                <select
                  value={newRiskLevel}
                  onChange={(e: any) => setNewRiskLevel(e.target.value)}
                  className="w-full bg-[#0E1118] border border-white/[0.07] rounded-lg px-3 py-2 text-[#F4F5F7] focus:outline-none focus:border-[#8B5CF6]"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-[#9299A8] mb-1">Target Workflow</label>
                <input
                  type="text"
                  value={newWorkflow}
                  onChange={(e) => setNewWorkflow(e.target.value)}
                  className="w-full bg-[#0E1118] border border-white/[0.07] rounded-lg px-3 py-2 text-[#F4F5F7] focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#9299A8] mb-1">Description *</label>
              <textarea
                required
                rows={2}
                placeholder="Brief summary of test condition"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full bg-[#0E1118] border border-white/[0.07] rounded-lg px-3 py-2 text-[#F4F5F7] focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div>
              <label className="block text-[#9299A8] mb-1">Detailed Threat (Optional)</label>
              <textarea
                rows={2}
                placeholder="Specific adversarial payload or exploit details"
                value={newThreat}
                onChange={(e) => setNewThreat(e.target.value)}
                className="w-full bg-[#0E1118] border border-white/[0.07] rounded-lg px-3 py-2 text-[#F4F5F7] focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div className="pt-3 border-t border-white/[0.07] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#191E29] hover:bg-[#202736] text-[#9299A8] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium cursor-pointer"
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

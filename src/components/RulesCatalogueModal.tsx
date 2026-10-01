import React, { useState, useEffect } from 'react';
import { NlpRule } from '../types/scam.js';
import {
  BookOpen,
  Search,
  Filter,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle,
} from 'lucide-react';

export const RulesCatalogueModal: React.FC = () => {
  const [rules, setRules] = useState<NlpRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    fetch('/api/rules')
      .then((res) => res.json())
      .then((data) => {
        setRules(data.rules || []);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['ALL', ...Array.from(new Set(rules.map((r) => r.category)))];

  const filteredRules = rules.filter((rule) => {
    const matchesCat = selectedCategory === 'ALL' || rule.category === selectedCategory;
    const matchesSearch =
      rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.explanation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40">
              Heuristic Lexicon
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {rules.length} Active Production Rules
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            ScamNLP Linguistic Rule Catalogue
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Inspect the pattern engines, token dictionaries, and weight scores powering both the local fallback engine and VS Code inline diagnostics.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search rules, IDs, regex..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Rules Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400">
          <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mr-3" />
          <span>Loading detection rule matrix...</span>
        </div>
      ) : filteredRules.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800">
          No rules matched your search query.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRules.map((rule) => {
            const isError = rule.severity === 'error';
            return (
              <div
                key={rule.id}
                className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-purple-400">
                        {rule.id}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase ${
                          isError
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {rule.severity}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono text-slate-400">
                      Weight: +{rule.weight}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-200 mb-1">
                    {rule.name}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    {rule.explanation}
                  </p>

                  {/* Regex Pattern Box */}
                  <div className="p-2 rounded bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-purple-300 truncate">
                    <code>/{rule.patternDescription}/gi</code>
                  </div>
                </div>

                {/* Example Trigger */}
                {rule.examples && rule.examples.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/60">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">
                      Example Trigger:
                    </span>
                    <span className="text-xs text-slate-300 italic font-mono bg-slate-950/60 px-2 py-1 rounded block">
                      &quot;{rule.examples[0]}&quot;
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

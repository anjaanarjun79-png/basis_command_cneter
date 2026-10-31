import React, { useState } from 'react';
import { commandDocs } from '../data/commandDocs';
import {
  Command,
  Search,
  Filter,
  Copy,
  Check,
  Shield,
} from 'lucide-react';

export const CommandReferenceView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredCommands = commandDocs.filter((cmd) => {
    const matchesSearch =
      cmd.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmd.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmd.syntax.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || cmd.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Command Reference
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Curated, enterprise-safe diagnostic syntax with flags, output interpretation, and safety notes.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-medium text-[11px]">
            Read-Only Safe
          </span>
          <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-medium text-[11px]">
            State Modifying
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search commands (e.g. df, lsof, sapcontrol, r3trans)..."
            className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg pl-8.5 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="filesystem">Filesystem & Mounts</option>
            <option value="linux-resource">Linux Resources (CPU/Memory)</option>
            <option value="sap-instance">SAP Instance Controls</option>
            <option value="sap-traces">SAP Traces & DB Client</option>
            <option value="networking">Networking & Ports</option>
            <option value="ha-cluster">HA Clustering</option>
            <option value="hana">HANA Database</option>
            <option value="oracle">Oracle Database</option>
          </select>
        </div>
      </div>

      {/* Command Cards List */}
      <div className="space-y-4">
        {filteredCommands.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
          >
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
                  {item.command}
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {item.category}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {item.isReadOnly ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono">
                    READ-ONLY
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-mono">
                    STATE-MODIFYING
                  </span>
                )}
                <button
                  onClick={() => handleCopy(item.id, item.syntax)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
                  title="Copy syntax"
                >
                  {copiedId === item.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Purpose */}
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {item.purpose}
            </p>

            {/* Syntax Box */}
            <div className="bg-slate-950 text-slate-100 p-3 rounded-xl font-mono text-xs flex items-center justify-between overflow-x-auto">
              <code>{item.syntax}</code>
            </div>

            {/* Flags */}
            {item.importantFlags.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Important Flags:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {item.importantFlags.map((flag, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
                    >
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 block">
                        {flag.flag}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block leading-relaxed">
                        {flag.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Example Output & Interpretation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Simulated Output:
                </span>
                <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl text-[11px] font-mono overflow-x-auto whitespace-pre leading-relaxed border border-slate-800">
                  {item.exampleOutput}
                </pre>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Interpretation:
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed text-[11px]">
                    {item.interpretation}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 border border-amber-200/60 dark:border-amber-900/40 text-[11px] leading-relaxed">
                  <strong className="block text-amber-600 dark:text-amber-400 mb-0.5">Safety Consideration:</strong>
                  {item.productionSafety}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

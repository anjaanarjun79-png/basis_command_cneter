import React, { useState } from 'react';
import { studyArticles } from '../data/studyArticles';
import { StudyArticle } from '../types';
import {
  BookOpen,
  Search,
  Filter,
  Bookmark,
  AlertTriangle,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const StudyLibraryView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(studyArticles[0]?.id || null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredArticles = studyArticles.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.domain.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDomain = domainFilter === 'all' || art.domain === domainFilter;
    return matchesSearch && matchesDomain;
  });

  const activeArticle =
    studyArticles.find((a) => a.id === selectedArticleId) || studyArticles[0] || null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Study Library
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Technical operational articles with symptoms, diagnostic flows, and safe remediation principles.
          </p>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Article List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 space-y-2.5 shadow-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg pl-8.5 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
            >
              <option value="all">All Domains</option>
              <option value="SAP Architecture">SAP Architecture</option>
              <option value="Linux Administration">Linux Administration</option>
              <option value="SAP HANA">SAP HANA</option>
              <option value="Oracle Database">Oracle Database</option>
              <option value="High Availability">High Availability</option>
            </select>
          </div>

          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
            {filteredArticles.map((art) => {
              const isSelected = art.id === activeArticle?.id;
              const isBookmarked = bookmarkedIds.includes(art.id);
              return (
                <div
                  key={art.id}
                  onClick={() => setSelectedArticleId(art.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-800 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold uppercase">
                      {art.domain}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(art.id);
                      }}
                      className="text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
                    >
                      <Bookmark
                        className={`w-3.5 h-3.5 ${
                          isBookmarked ? 'text-amber-500 fill-amber-500' : ''
                        }`}
                      />
                    </button>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-1">
                    {art.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {art.definition}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Article Reader (8 cols) */}
        <div className="lg:col-span-8">
          {activeArticle ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
              {/* Header */}
              <div className="pb-4 border-b border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 font-medium text-[11px]">
                    {activeArticle.domain}
                  </span>
                  <button
                    onClick={() => toggleBookmark(activeArticle.id)}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-amber-500 cursor-pointer"
                  >
                    <Bookmark
                      className={`w-3.5 h-3.5 ${
                        bookmarkedIds.includes(activeArticle.id) ? 'text-amber-500 fill-amber-500' : ''
                      }`}
                    />
                    <span>{bookmarkedIds.includes(activeArticle.id) ? 'Saved' : 'Save'}</span>
                  </button>
                </div>

                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  {activeArticle.title}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  {activeArticle.definition}
                </p>
              </div>

              {/* Why it Matters in Production */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                  Production Impact & Relevance:
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeArticle.productionImpact}
                </p>
              </div>

              {/* Symptoms */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider block">
                  Common Production Symptoms:
                </span>
                <div className="space-y-1.5">
                  {activeArticle.commonSymptoms.map((sym, i) => (
                    <div key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{sym}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Diagnostic Steps */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider block">
                  Investigation & Verification Steps:
                </span>
                <div className="space-y-1.5">
                  {activeArticle.diagnosticSteps.map((step, i) => (
                    <div key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                      <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{i + 1}.</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Example Output & Interpretation */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider block">
                  Example Diagnostic Output:
                </span>
                <pre className="p-3 bg-slate-950 text-slate-200 rounded-xl text-[11px] font-mono overflow-x-auto whitespace-pre leading-relaxed border border-slate-800">
                  {activeArticle.exampleOutput}
                </pre>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong className="text-slate-900 dark:text-slate-100 block mb-0.5">Interpretation:</strong>
                  {activeArticle.outputInterpretation}
                </div>
              </div>

              {/* Safe Remediation & Common Mistakes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs pt-2">
                <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 space-y-1">
                  <span className="font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                    Common Mistakes:
                  </span>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                    {activeArticle.commonMistakes.map((m, i) => (
                      <li key={i}>• {m}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-1">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                    Safe Remediation:
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {activeArticle.safeRemediation}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              Select an article to read.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

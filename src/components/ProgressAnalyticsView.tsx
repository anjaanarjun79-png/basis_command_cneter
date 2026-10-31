import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { allCurriculumSessions } from '../data/curriculum';
import {
  BarChart3,
  Award,
  CheckCircle2,
  Clock,
  Flame,
  FileText,
  AlertTriangle,
  Save,
  BookOpen,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const ProgressAnalyticsView: React.FC = () => {
  const { metrics, progress, setActiveNav, setSelectedSessionId } = useApp();

  const [activeTab, setActiveTab] = useState<'analytics' | 'weekly-review'>('analytics');
  const [selectedReviewWeek, setSelectedReviewWeek] = useState<number>(1);
  const [weeklyNotes, setWeeklyNotes] = useState<Record<string, string>>(() => {
    try {
      const raw = localStorage.getItem('basis_command_center_weekly_notes_v1');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Compute domain breakdown for progress indicators
  const domainColors: Record<string, string> = {
    architecture: '#3b82f6', // blue
    linux: '#0284c7', // light blue
    database: '#10b981', // emerald
    abap: '#8b5cf6', // purple
    ha: '#f59e0b', // amber
    upgrades: '#ec4899', // pink
    rca: '#6366f1', // indigo
    simulations: '#06b6d4', // cyan
  };

  const domainData = Object.entries(domainColors).map(([domain, color]) => {
    const totalInDomain = allCurriculumSessions.filter((s) => s.domain === domain).length;
    const completedInDomain = allCurriculumSessions
      .filter((s) => s.domain === domain)
      .filter((s) => progress[s.id]?.completed).length;
    return {
      name: domain.toUpperCase(),
      completed: completedInDomain,
      total: totalInDomain,
      color,
    };
  });

  const handleSaveWeeklyReview = () => {
    try {
      localStorage.setItem('basis_command_center_weekly_notes_v1', JSON.stringify(weeklyNotes));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (e) {
      console.error('Failed to save weekly review', e);
    }
  };

  const currentReviewKey = (field: string) => `w${selectedReviewWeek}_${field}`;

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header with Sub-tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Progress & Skill Analytics
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real metrics derived from your completed sessions, interactive lab challenges, and audit-grade RCA reports.
          </p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Analytics & Metrics
          </button>
          <button
            onClick={() => setActiveTab('weekly-review')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'weekly-review'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Weekly Structured Review
          </button>
        </div>
      </div>

      {activeTab === 'analytics' ? (
        <div className="space-y-6">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Curriculum Progress
              </span>
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {metrics.completionPercentage}%
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                {metrics.completedSessionsCount} of {metrics.totalSessionsCount} sessions
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Active Streak
              </span>
              <div className="text-3xl font-bold text-amber-500 dark:text-amber-400">
                {metrics.streakDays} Days
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                5 days / week target
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Study Time
              </span>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {metrics.totalStudyHours} hrs
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                40 total planned hours
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                RCAs Completed
              </span>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {metrics.rcaReportsCount}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                Production-grade reports
              </p>
            </div>
          </div>

          {/* Domain Mastery Grid & Weak Topics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Domain Progress Cards */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Technical Domain Mastery
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Completed / Total
                </span>
              </div>

              <div className="space-y-4">
                {domainData.map((d) => {
                  const pct = d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0;
                  return (
                    <div key={d.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{d.name}</span>
                        <span className="font-mono text-slate-500 dark:text-slate-400 text-xs">
                          {d.completed}/{d.total} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: d.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weak Technical Topics & Diagnostic Analysis */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Topic Health & Revision Radar</span>
                </div>

                <div className="mt-4 space-y-3">
                  {metrics.weakTopics.length > 0 ? (
                    metrics.weakTopics.map((topic, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-amber-950 dark:text-amber-200 capitalize text-sm">
                            {topic.domain}
                          </span>
                          <p className="text-amber-700 dark:text-amber-400 text-xs mt-0.5">
                            Quiz accuracy below benchmark
                          </p>
                        </div>
                        <span className="text-amber-600 dark:text-amber-400 font-mono font-bold text-base">
                          {topic.accuracy}%
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold mb-1 text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        No weak topics identified yet
                      </div>
                      Continue taking knowledge checks across the 40 sessions. If your score falls below 80% in any specific domain, recommended revision modules will appear here automatically.
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
                Formula: Real score = Completed Sessions / 40. Visiting a session does not increment progress.
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Weekly Structured Review View */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                End-of-Week Retrospective & Playbook Formulation
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Reflect on each 5-day cycle to cement operational troubleshooting instincts.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Review Week:</span>
              <select
                value={selectedReviewWeek}
                onChange={(e) => setSelectedReviewWeek(Number(e.target.value))}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                  <option key={w} value={w}>
                    Week {w} Review
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-5 text-xs">
            <div>
              <label className="text-slate-800 dark:text-slate-200 font-semibold block mb-1.5">
                1. What core principles did I master this week?
              </label>
              <textarea
                rows={3}
                value={weeklyNotes[currentReviewKey('learned')] || ''}
                onChange={(e) =>
                  setWeeklyNotes({ ...weeklyNotes, [currentReviewKey('learned')]: e.target.value })
                }
                placeholder="e.g. Mastered the distinction between df block space and df -i inode exhaustion..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="text-slate-800 dark:text-slate-200 font-semibold block mb-1.5">
                2. What technical concepts or diagnostics did I find most difficult?
              </label>
              <textarea
                rows={3}
                value={weeklyNotes[currentReviewKey('difficult')] || ''}
                onChange={(e) =>
                  setWeeklyNotes({ ...weeklyNotes, [currentReviewKey('difficult')]: e.target.value })
                }
                placeholder="e.g. Pacemaker anti-colocation rules and SBD watchdog timeout calculations..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="text-slate-800 dark:text-slate-200 font-semibold block mb-1.5">
                3. Which commands do I need to practise more in the lab?
              </label>
              <textarea
                rows={2}
                value={weeklyNotes[currentReviewKey('commands')] || ''}
                onChange={(e) =>
                  setWeeklyNotes({ ...weeklyNotes, [currentReviewKey('commands')]: e.target.value })
                }
                placeholder="e.g. ss -tulnp, lsof +L1, crm resource cleanup, hdbsql M_LOG_BUFFERS..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="text-slate-800 dark:text-slate-200 font-semibold block mb-1.5">
                4. Which concepts can I now explain to another engineer without consulting notes?
              </label>
              <textarea
                rows={2}
                value={weeklyNotes[currentReviewKey('explain')] || ''}
                onChange={(e) =>
                  setWeeklyNotes({ ...weeklyNotes, [currentReviewKey('explain')]: e.target.value })
                }
                placeholder="e.g. Why restarting an SAP HANA database when /hana/log is 100% full causes startup failure..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="text-slate-800 dark:text-slate-200 font-semibold block mb-1.5">
                5. What is my primary technical focus for next week?
              </label>
              <input
                type="text"
                value={weeklyNotes[currentReviewKey('nextFocus')] || ''}
                onChange={(e) =>
                  setWeeklyNotes({ ...weeklyNotes, [currentReviewKey('nextFocus')]: e.target.value })
                }
                placeholder="e.g. High availability clustering and Enqueue Replication Server failovers..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500">
              {saveSuccess ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Weekly review saved!</span>
              ) : (
                'Review persisted in local browser storage'
              )}
            </span>
            <button
              onClick={handleSaveWeeklyReview}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-xs transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Week {selectedReviewWeek} Review</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { weekThemes, getSessionsByWeek } from '../data/curriculum';
import {
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const RoadmapView: React.FC = () => {
  const { progress, setSelectedSessionId, setActiveNav, metrics } = useApp();
  const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>({
    [metrics.currentWeek]: true,
  });

  const toggleWeek = (week: number) => {
    setExpandedWeeks((prev) => ({ ...prev, [week]: !prev[week] }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Learning Roadmap
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            40 progressive sessions structured across eight foundational and advanced production domains.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Completed
          </span>
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-indigo-600" /> In Progress
          </span>
        </div>
      </div>

      {/* Week Timeline Cards */}
      <div className="space-y-4">
        {weekThemes.map((theme) => {
          const sessions = getSessionsByWeek(theme.week);
          const completedInWeek = sessions.filter((s) => progress[s.id]?.completed).length;
          const isExpanded = !!expandedWeeks[theme.week];
          const isCurrentWeek = metrics.currentWeek === theme.week;
          const isAllDone = completedInWeek === 5;

          return (
            <div
              key={theme.week}
              className={`bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden transition-all shadow-xs ${
                isCurrentWeek
                  ? 'border-indigo-300 dark:border-indigo-700/80'
                  : 'border-slate-200/80 dark:border-slate-800'
              }`}
            >
              {/* Header Accordion Bar */}
              <div
                onClick={() => toggleWeek(theme.week)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors select-none"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      isAllDone
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                        : isCurrentWeek
                        ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    W{theme.week}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        Week {theme.week} • 5 Sessions
                      </span>
                      {isCurrentWeek && (
                        <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full">
                          Current Focus
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                      {theme.subtitle}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {completedInWeek} / 5 completed
                    </span>
                    <div className="w-24 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div
                        className="bg-indigo-600 dark:bg-indigo-500 h-full transition-all"
                        style={{ width: `${(completedInWeek / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-1 rounded-md text-slate-400">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Sessions List */}
              {isExpanded && (
                <div className="border-t border-slate-100 dark:border-slate-800/80 divide-y divide-slate-100 dark:divide-slate-800/60 bg-slate-50/40 dark:bg-slate-900/40">
                  {sessions.map((session) => {
                    const isCompleted = progress[session.id]?.completed;
                    return (
                      <div
                        key={session.id}
                        className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white dark:hover:bg-slate-800/50 transition-colors group"
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => {
                              setSelectedSessionId(session.id);
                              setActiveNav('missions');
                            }}
                            className="mt-0.5"
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50 dark:fill-emerald-950" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-indigo-600" />
                            )}
                          </button>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-mono text-slate-400 font-medium">
                                Day {session.day}
                              </span>
                              <span className="text-slate-300 dark:text-slate-700">•</span>
                              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                                <Clock className="w-3 h-3" /> ~{session.durationMinutes}m
                              </span>
                            </div>
                            <h4
                              onClick={() => {
                                setSelectedSessionId(session.id);
                                setActiveNav('missions');
                              }}
                              className="text-xs font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer mt-0.5 transition-colors"
                            >
                              {session.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                              {session.topic}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 pl-8 sm:pl-0">
                          {isCompleted && (
                            <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                              Completed
                            </span>
                          )}
                          <button
                            onClick={() => {
                              setSelectedSessionId(session.id);
                              setActiveNav('missions');
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                          >
                            <span>Open</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

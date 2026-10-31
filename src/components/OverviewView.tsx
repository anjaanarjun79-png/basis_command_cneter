import React from 'react';
import { useApp } from '../context/AppContext';
import { allCurriculumSessions, weekThemes } from '../data/curriculum';
import { labScenarios } from '../data/labScenarios';
import {
  CheckCircle2,
  Clock,
  Award,
  ArrowRight,
  Terminal,
  FileText,
  HelpCircle,
  Command,
  BookOpen,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const OverviewView: React.FC = () => {
  const { metrics, progress, setActiveNav, setSelectedSessionId, setSelectedLabScenarioId, toggleTask } = useApp();

  const nextSession =
    allCurriculumSessions.find((s) => s.id === metrics.nextRecommendedSessionId) || allCurriculumSessions[0];

  const currentSessionProgress = progress[nextSession.id];
  const isNewUser = metrics.completedSessionsCount === 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Good evening, engineer.
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Ready to solve today's SAP Basis challenge? Week {metrics.currentWeek}, Day {metrics.currentDay} is waiting.
        </p>
      </div>

      {/* Top Section: Today's Learning Card + Clean KPI Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* A. Today's Learning Card (Hero feature) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                TODAY'S MISSION • WEEK {nextSession.week}, DAY {nextSession.day}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5" />
                ~{nextSession.durationMinutes} mins
              </span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedSessionId(nextSession.id);
                  setActiveNav('missions');
                }}
              >
                {nextSession.title}
              </h2>
              <p className="text-xs text-indigo-600 dark:text-indigo-300 font-medium mt-1">
                {nextSession.topic}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                {nextSession.technicalExplanation.slice(0, 220)}...
              </p>
            </div>

            {/* Quick Task preview */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Today's Objectives ({nextSession.tasks.length} tasks)
              </span>
              <div className="space-y-1.5">
                {nextSession.tasks.slice(0, 2).map((t) => {
                  const isDone = currentSessionProgress?.completedTasks.includes(t.id);
                  return (
                    <div
                      key={t.id}
                      onClick={() => toggleTask(nextSession.id, t.id)}
                      className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer group"
                    >
                      <CheckCircle2
                        className={`w-4 h-4 transition-colors ${
                          isDone
                            ? 'text-emerald-500 fill-emerald-50 dark:fill-emerald-950'
                            : 'text-slate-300 dark:text-slate-600 group-hover:text-slate-400'
                        }`}
                      />
                      <span className={isDone ? 'line-through text-slate-400' : ''}>{t.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {currentSessionProgress?.completed ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Session completed
                </span>
              ) : (
                'Estimated time: 60 minutes'
              )}
            </span>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedSessionId(nextSession.id);
                  setActiveNav('missions');
                }}
                className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                View lesson notes
              </button>
              <button
                onClick={() => {
                  setSelectedSessionId(nextSession.id);
                  setActiveNav('missions');
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-xs transition-all cursor-pointer"
              >
                <span>Continue Learning</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* B. Progress Overview Card */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">Overall Progress</span>
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {metrics.completionPercentage}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${metrics.completionPercentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>{metrics.completedSessionsCount} of 40 sessions</span>
                <span>{40 - metrics.completedSessionsCount} remaining</span>
              </div>
            </div>

            {/* Mini Metrics Rows */}
            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">Study Time Recorded</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono">
                  {metrics.totalStudyHours} hrs
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">Quiz Accuracy</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono">
                  {metrics.quizAccuracy > 0 ? `${metrics.quizAccuracy}%` : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500 dark:text-slate-400">RCA Reports Written</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono">
                  {metrics.rcaReportsCount}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveNav('progress')}
            className="w-full mt-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer"
          >
            View detailed analytics
          </button>
        </div>
      </div>

      {/* C. Weekly Roadmap Progression (Vertical timeline) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              8-Week Curriculum Roadmap
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Click any week to view its five dedicated daily sessions.
            </p>
          </div>
          <button
            onClick={() => setActiveNav('roadmap')}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
          >
            Open full roadmap →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {weekThemes.map((w) => {
            const weekSessions = allCurriculumSessions.filter((s) => s.week === w.week);
            const completedCount = weekSessions.filter((s) => progress[s.id]?.completed).length;
            const isCurrent = metrics.currentWeek === w.week;
            const isDone = completedCount === 5;

            return (
              <div
                key={w.week}
                onClick={() => {
                  setSelectedSessionId(weekSessions[0]?.id || null);
                  setActiveNav('roadmap');
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isCurrent
                    ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-xs'
                    : isDone
                    ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10'
                    : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
                      WEEK {w.week}
                    </span>
                    {isDone ? (
                      <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                        Done
                      </span>
                    ) : isCurrent ? (
                      <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    ) : null}
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                    {w.subtitle}
                  </h4>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{completedCount}/5 sessions</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* D. Quick Actions Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => {
            setSelectedLabScenarioId(labScenarios[0].id);
            setActiveNav('lab');
          }}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all text-left shadow-xs cursor-pointer group"
        >
          <Terminal className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-2.5 group-hover:scale-105 transition-transform" />
          <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            Troubleshooting Lab
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Simulate 8 production incidents in terminal.
          </p>
        </button>

        <button
          onClick={() => setActiveNav('rca')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all text-left shadow-xs cursor-pointer group"
        >
          <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-2.5 group-hover:scale-105 transition-transform" />
          <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            RCA Notebook
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Draft and export audit-grade root cause reports.
          </p>
        </button>

        <button
          onClick={() => setActiveNav('commands')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all text-left shadow-xs cursor-pointer group"
        >
          <Command className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-2.5 group-hover:scale-105 transition-transform" />
          <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            Command Reference
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Safe diagnostic flags and output parsing.
          </p>
        </button>

        <button
          onClick={() => setActiveNav('quiz')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all text-left shadow-xs cursor-pointer group"
        >
          <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-2.5 group-hover:scale-105 transition-transform" />
          <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            Quiz Assessment
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Practice 80+ curriculum questions.
          </p>
        </button>
      </div>
    </div>
  );
};

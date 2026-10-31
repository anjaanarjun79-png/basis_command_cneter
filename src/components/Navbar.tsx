import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { allCurriculumSessions } from '../data/curriculum';
import {
  Search,
  Menu,
  Sun,
  Moon,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Command,
} from 'lucide-react';

interface NavbarProps {
  onOpenMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileSidebar }) => {
  const {
    activeNav,
    setActiveNav,
    selectedSessionId,
    setSelectedSessionId,
    settings,
    updateSettings,
    metrics,
  } = useApp();

  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Map active view to user-friendly label
  const getNavLabel = () => {
    switch (activeNav) {
      case 'overview': return 'Overview';
      case 'roadmap': return 'Learning Roadmap';
      case 'missions': return 'Daily Missions';
      case 'library': return 'Study Library';
      case 'lab': return 'Troubleshooting Lab';
      case 'quiz': return 'Quiz Center';
      case 'rca': return 'RCA Notebook';
      case 'commands': return 'Command Reference';
      case 'progress': return 'Progress & Analytics';
      case 'settings': return 'Settings';
      default: return 'Overview';
    }
  };

  const currentSession = selectedSessionId
    ? allCurriculumSessions.find((s) => s.id === selectedSessionId)
    : null;

  const toggleTheme = () => {
    // If dark -> switch to light; if light or system -> toggle
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: nextTheme });
  };

  // Quick navigation items for search command palette
  const filteredNavItems = [
    { label: 'Overview Dashboard', id: 'overview' },
    { label: 'Learning Roadmap (8 Weeks)', id: 'roadmap' },
    { label: 'Daily Mission Tasks', id: 'missions' },
    { label: 'Troubleshooting Lab (Simulations)', id: 'lab' },
    { label: 'Quiz Assessment Bank', id: 'quiz' },
    { label: 'RCA Incident Notebook', id: 'rca' },
    { label: 'Command Reference Guide', id: 'commands' },
    { label: 'Progress & Skill Analytics', id: 'progress' },
    { label: 'Settings & Data Backup', id: 'settings' },
    ...allCurriculumSessions.map((s) => ({
      label: `W${s.week}D${s.day}: ${s.title}`,
      id: 'missions',
      sessionId: s.id,
    })),
  ].filter((item) => item.label.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <>
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 select-none">
        {/* Left Side: Mobile Menu Button & Clean Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span
              onClick={() => setActiveNav('overview')}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer font-medium transition-colors"
            >
              Academy
            </span>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="text-slate-900 dark:text-slate-100 font-semibold">{getNavLabel()}</span>
            {activeNav === 'missions' && currentSession && (
              <>
                <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">/</span>
                <span className="text-slate-500 dark:text-slate-400 font-medium hidden sm:inline truncate max-w-xs">
                  Week {currentSession.week}, Day {currentSession.day}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right Side: Quick Search, Progress pill, Theme toggle */}
        <div className="flex items-center gap-3">
          {/* Quick Search Palette Trigger */}
          <button
            onClick={() => setIsCommandOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 text-xs transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search lessons or tools...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 text-[10px] font-mono border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400">
              ⌘K
            </kbd>
          </button>

          {/* Compact Progress Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              {metrics.completedSessionsCount}/40 completed
            </span>
            <span className="text-slate-400 dark:text-slate-500 text-[11px] font-mono">
              ({metrics.completionPercentage}%)
            </span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={`Switch to ${settings.theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
      </header>

      {/* Command Palette Modal */}
      {isCommandOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-start justify-center pt-20 px-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Jump to a lesson, scenario, or tool..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
              />
              <button
                onClick={() => setIsCommandOpen(false)}
                className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700"
              >
                ESC
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/40 text-xs">
              {filteredNavItems.slice(0, 10).map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveNav(item.id);
                    if ('sessionId' in item && item.sessionId) {
                      setSelectedSessionId(item.sessionId);
                    }
                    setIsCommandOpen(false);
                  }}
                  className="w-full text-left p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-200 transition-colors cursor-pointer group"
                >
                  <span className="truncate">{item.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                </button>
              ))}
              {filteredNavItems.length === 0 && (
                <div className="p-6 text-center text-slate-400 text-xs">No matching results found.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

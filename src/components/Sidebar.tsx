import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Map,
  CheckSquare,
  BookOpen,
  Terminal,
  HelpCircle,
  FileText,
  Command,
  BarChart3,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen = false,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { activeNav, setActiveNav, metrics } = useApp();

  const navGroups = [
    {
      group: 'LEARN',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'roadmap', label: 'Learning Roadmap', icon: Map, badge: `${metrics.completedSessionsCount}/40` },
        { id: 'missions', label: 'Daily Missions', icon: CheckSquare },
        { id: 'library', label: 'Study Library', icon: BookOpen },
      ],
    },
    {
      group: 'PRACTISE',
      items: [
        { id: 'lab', label: 'Troubleshooting Lab', icon: Terminal },
        { id: 'quiz', label: 'Quiz Center', icon: HelpCircle },
        { id: 'commands', label: 'Command Reference', icon: Command },
      ],
    },
    {
      group: 'TRACK',
      items: [
        { id: 'rca', label: 'RCA Notebook', icon: FileText, badge: `${metrics.rcaReportsCount}` },
        { id: 'progress', label: 'Progress & Analytics', icon: BarChart3 },
      ],
    },
  ];

  const handleNavClick = (id: string) => {
    setActiveNav(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col select-none shrink-0 transition-all duration-200 ${
          isCollapsed ? 'w-18' : 'w-60'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Area */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div
            onClick={() => handleNavClick('overview')}
            className="flex items-center gap-3 cursor-pointer group overflow-hidden"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs shadow-indigo-600/30 group-hover:bg-indigo-700 transition-colors">
              <Shield className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 block tracking-tight truncate">
                  Basis Command Center
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                  Troubleshooting Academy
                </span>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto overflow-x-hidden">
          {navGroups.map((grp) => (
            <div key={grp.group} className="space-y-1">
              {!isCollapsed && (
                <div className="px-2.5 mb-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 tracking-wider">
                  {grp.group}
                </div>
              )}
              {grp.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isCollapsed ? 'justify-center p-2.5' : 'justify-between px-2.5 py-2'
                    } ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-medium ${
                          isActive
                            ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer Area: Settings & Collapse Toggle */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
          <button
            onClick={() => handleNavClick('settings')}
            title={isCollapsed ? 'Settings' : undefined}
            className={`w-full flex items-center rounded-lg text-xs font-medium transition-all cursor-pointer ${
              isCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-2.5 py-2'
            } ${
              activeNav === 'settings'
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0 text-slate-400 dark:text-slate-500" />
            {!isCollapsed && <span>Settings</span>}
          </button>

          {/* Desktop Collapse Toggle */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex w-full items-center justify-center p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer text-xs"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

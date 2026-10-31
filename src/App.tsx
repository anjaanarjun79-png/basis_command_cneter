import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { OverviewView } from './components/OverviewView';
import { RoadmapView } from './components/RoadmapView';
import { DailyMissionsView } from './components/DailyMissionsView';
import { StudyLibraryView } from './components/StudyLibraryView';
import { TroubleshootingLabView } from './components/TroubleshootingLabView';
import { QuizCenterView } from './components/QuizCenterView';
import { RcaNotebookView } from './components/RcaNotebookView';
import { CommandReferenceView } from './components/CommandReferenceView';
import { ProgressAnalyticsView } from './components/ProgressAnalyticsView';
import { SettingsView } from './components/SettingsView';

const AppContent: React.FC = () => {
  const { activeNav } = useApp();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const renderActiveView = () => {
    switch (activeNav) {
      case 'overview':
        return <OverviewView />;
      case 'roadmap':
        return <RoadmapView />;
      case 'missions':
        return <DailyMissionsView />;
      case 'library':
        return <StudyLibraryView />;
      case 'lab':
        return <TroubleshootingLabView />;
      case 'quiz':
        return <QuizCenterView />;
      case 'rca':
        return <RcaNotebookView />;
      case 'commands':
        return <CommandReferenceView />;
      case 'progress':
        return <ProgressAnalyticsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased overflow-hidden">
      {/* Persistent Left Sidebar */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Navigation Bar */}
        <Navbar onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-slate-50/50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return <AppContent />;
}

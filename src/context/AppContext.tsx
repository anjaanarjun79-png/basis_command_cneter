import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSessionProgress, RCAReport, UserSettings } from '../types';
import {
  loadStoredProgress,
  saveStoredProgress,
  loadStoredReports,
  saveStoredReports,
  loadStoredSettings,
  saveStoredSettings,
  resetAllProgress,
} from '../services/storage';
import { allCurriculumSessions } from '../data/curriculum';
import { applyThemeVariables, ThemeMode, AccentPresetId } from '../utils/theme';

interface AppContextType {
  progress: Record<string, UserSessionProgress>;
  reports: RCAReport[];
  settings: UserSettings;
  activeNav: string;
  setActiveNav: (nav: string) => void;
  selectedSessionId: string | null;
  setSelectedSessionId: (id: string | null) => void;
  selectedLabScenarioId: string | null;
  setSelectedLabScenarioId: (id: string | null) => void;
  selectedReportId: string | null;
  setSelectedReportId: (id: string | null) => void;
  // Progress Actions
  toggleTask: (sessionId: string, taskId: string) => void;
  markSessionComplete: (sessionId: string, completed: boolean) => void;
  updateSessionNotes: (sessionId: string, notes: string) => void;
  updateConfidenceRating: (sessionId: string, rating: number) => void;
  recordStudyMinutes: (sessionId: string, minutes: number) => void;
  recordQuizScore: (sessionId: string, correct: number, total: number, answers: Record<string, number>) => void;
  // Report Actions
  saveReport: (report: RCAReport) => void;
  deleteReport: (reportId: string) => void;
  duplicateReport: (reportId: string) => void;
  // Settings Actions
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  resetProgressData: () => void;
  // Computed Metrics
  metrics: {
    completedSessionsCount: number;
    totalSessionsCount: number;
    completionPercentage: number;
    currentWeek: number;
    currentDay: number;
    streakDays: number;
    totalStudyHours: number;
    quizAccuracy: number;
    rcaReportsCount: number;
    weakTopics: { domain: string; accuracy: number }[];
    nextRecommendedSessionId: string;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<Record<string, UserSessionProgress>>({});
  const [reports, setReports] = useState<RCAReport[]>([]);
  const [settings, setSettings] = useState<UserSettings>(loadStoredSettings());
  const [activeNav, setActiveNav] = useState<string>('overview');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedLabScenarioId, setSelectedLabScenarioId] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Initialize from storage on mount
  useEffect(() => {
    const loadedProgress = loadStoredProgress();
    const loadedReports = loadStoredReports();
    const loadedSettings = loadStoredSettings();
    setProgress(loadedProgress);
    setReports(loadedReports);
    setSettings(loadedSettings);

    // Apply theme and accent variables to document root
    applyThemeVariables(
      loadedSettings.theme as ThemeMode,
      loadedSettings.accentColor as AccentPresetId,
      loadedSettings.customAccentHex
    );
  }, []);

  // Update theme and accent variables whenever settings change or system preference changes
  useEffect(() => {
    applyThemeVariables(
      settings.theme as ThemeMode,
      settings.accentColor as AccentPresetId,
      settings.customAccentHex
    );

    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        applyThemeVariables('system', settings.accentColor as AccentPresetId, settings.customAccentHex);
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings.theme, settings.accentColor, settings.customAccentHex]);

  // Save progress updates
  const updateProgressState = (newProgress: Record<string, UserSessionProgress>) => {
    setProgress(newProgress);
    saveStoredProgress(newProgress);
  };

  const getOrCreateSessionProgress = (sessionId: string): UserSessionProgress => {
    return (
      progress[sessionId] || {
        sessionId,
        completed: false,
        completedTasks: [],
        userNotes: '',
        confidenceRating: 3,
        actualStudyMinutes: 0,
      }
    );
  };

  const toggleTask = (sessionId: string, taskId: string) => {
    const current = getOrCreateSessionProgress(sessionId);
    const exists = current.completedTasks.includes(taskId);
    const updatedTasks = exists
      ? current.completedTasks.filter((t) => t !== taskId)
      : [...current.completedTasks, taskId];

    const updated = {
      ...current,
      completedTasks: updatedTasks,
    };

    updateProgressState({
      ...progress,
      [sessionId]: updated,
    });
  };

  const markSessionComplete = (sessionId: string, completed: boolean) => {
    const current = getOrCreateSessionProgress(sessionId);
    const updated = {
      ...current,
      completed,
      completedAt: completed ? new Date().toISOString() : undefined,
    };

    updateProgressState({
      ...progress,
      [sessionId]: updated,
    });
  };

  const updateSessionNotes = (sessionId: string, notes: string) => {
    const current = getOrCreateSessionProgress(sessionId);
    updateProgressState({
      ...progress,
      [sessionId]: { ...current, userNotes: notes },
    });
  };

  const updateConfidenceRating = (sessionId: string, rating: number) => {
    const current = getOrCreateSessionProgress(sessionId);
    updateProgressState({
      ...progress,
      [sessionId]: { ...current, confidenceRating: rating },
    });
  };

  const recordStudyMinutes = (sessionId: string, minutes: number) => {
    const current = getOrCreateSessionProgress(sessionId);
    updateProgressState({
      ...progress,
      [sessionId]: { ...current, actualStudyMinutes: (current.actualStudyMinutes || 0) + minutes },
    });
  };

  const recordQuizScore = (sessionId: string, correct: number, total: number, answers: Record<string, number>) => {
    const current = getOrCreateSessionProgress(sessionId);
    updateProgressState({
      ...progress,
      [sessionId]: {
        ...current,
        quizScore: { correct, total, answers },
      },
    });
  };

  // Report Actions
  const saveReport = (report: RCAReport) => {
    const exists = reports.some((r) => r.id === report.id);
    let updatedReports: RCAReport[];
    if (exists) {
      updatedReports = reports.map((r) => (r.id === report.id ? { ...report, updatedAt: new Date().toISOString() } : r));
    } else {
      updatedReports = [
        { ...report, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        ...reports,
      ];
    }
    setReports(updatedReports);
    saveStoredReports(updatedReports);
  };

  const deleteReport = (reportId: string) => {
    const updated = reports.filter((r) => r.id !== reportId);
    setReports(updated);
    saveStoredReports(updated);
    if (selectedReportId === reportId) {
      setSelectedReportId(null);
    }
  };

  const duplicateReport = (reportId: string) => {
    const source = reports.find((r) => r.id === reportId);
    if (!source) return;
    const duplicated: RCAReport = {
      ...source,
      id: 'rca-' + Date.now(),
      title: `${source.title} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [duplicated, ...reports];
    setReports(updated);
    saveStoredReports(updated);
    setSelectedReportId(duplicated.id);
  };

  // Settings
  const updateSettings = (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveStoredSettings(updated);
  };

  const resetProgressData = () => {
    resetAllProgress();
    setProgress({});
  };

  // Compute Metrics from actual state
  const completedSessionsCount = Object.values(progress).filter((p) => p.completed).length;
  const totalSessionsCount = allCurriculumSessions.length;
  const completionPercentage = Math.round((completedSessionsCount / totalSessionsCount) * 100);

  // Determine current week/day based on next incomplete session
  const nextIncompleteSession =
    allCurriculumSessions.find((s) => !progress[s.id]?.completed) || allCurriculumSessions[0];
  const currentWeek = nextIncompleteSession ? nextIncompleteSession.week : 1;
  const currentDay = nextIncompleteSession ? nextIncompleteSession.day : 1;
  const nextRecommendedSessionId = nextIncompleteSession ? nextIncompleteSession.id : 'w1d1';

  // Calculate actual study hours
  const totalStudyMinutes = Object.values(progress).reduce(
    (acc, curr) => acc + (curr.actualStudyMinutes || (curr.completed ? 60 : 0)),
    0
  );
  const totalStudyHours = Math.round((totalStudyMinutes / 60) * 10) / 10;

  // Calculate quiz accuracy
  let totalQuizQuestions = 0;
  let totalQuizCorrect = 0;
  Object.values(progress).forEach((p) => {
    if (p.quizScore) {
      totalQuizCorrect += p.quizScore.correct;
      totalQuizQuestions += p.quizScore.total;
    }
  });
  const quizAccuracy = totalQuizQuestions > 0 ? Math.round((totalQuizCorrect / totalQuizQuestions) * 100) : 0;

  // Compute domain performance / weak topics
  const domainStats: Record<string, { correct: number; total: number }> = {};
  allCurriculumSessions.forEach((s) => {
    const p = progress[s.id];
    if (p?.quizScore) {
      if (!domainStats[s.domain]) {
        domainStats[s.domain] = { correct: 0, total: 0 };
      }
      domainStats[s.domain].correct += p.quizScore.correct;
      domainStats[s.domain].total += p.quizScore.total;
    }
  });

  const weakTopics = Object.entries(domainStats)
    .map(([domain, stat]) => ({
      domain,
      accuracy: stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 100,
    }))
    .filter((item) => item.accuracy < 80)
    .sort((a, b) => a.accuracy - b.accuracy);

  // Streak estimation (based on completed dates)
  const streakDays = completedSessionsCount > 0 ? Math.min(completedSessionsCount, 5) : 0;

  return (
    <AppContext.Provider
      value={{
        progress,
        reports,
        settings,
        activeNav,
        setActiveNav,
        selectedSessionId,
        setSelectedSessionId,
        selectedLabScenarioId,
        setSelectedLabScenarioId,
        selectedReportId,
        setSelectedReportId,
        toggleTask,
        markSessionComplete,
        updateSessionNotes,
        updateConfidenceRating,
        recordStudyMinutes,
        recordQuizScore,
        saveReport,
        deleteReport,
        duplicateReport,
        updateSettings,
        resetProgressData,
        metrics: {
          completedSessionsCount,
          totalSessionsCount,
          completionPercentage,
          currentWeek,
          currentDay,
          streakDays,
          totalStudyHours,
          quizAccuracy,
          rcaReportsCount: reports.length,
          weakTopics,
          nextRecommendedSessionId,
        },
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { exportAllDataJSON, importAllDataJSON, defaultSettings } from '../services/storage';
import {
  ACCENT_PRESETS,
  AccentPresetId,
  ThemeMode,
  isValidHexColor,
} from '../utils/theme';
import {
  Settings,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Moon,
  Sun,
  Laptop,
  Clock,
  Shield,
  Save,
  Palette,
  Check,
  Copy,
  ArrowRight,
  Eye,
  Sparkles,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetProgressData } = useApp();

  const [dailyGoal, setDailyGoal] = useState<number>(settings.dailyGoalMinutes);
  const [studyDays, setStudyDays] = useState<number>(settings.preferredStudyDays);
  const [notifications, setNotifications] = useState<boolean>(settings.inAppNotifications);
  const [userLevel, setUserLevel] = useState<string>(settings.userLevel);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Custom accent color state
  const [customHexInput, setCustomHexInput] = useState<string>(
    settings.customAccentHex || '#4f46e5'
  );
  const [copiedHex, setCopiedHex] = useState<boolean>(false);

  const handleSaveSettings = () => {
    updateSettings({
      dailyGoalMinutes: dailyGoal,
      preferredStudyDays: studyDays,
      inAppNotifications: notifications,
      userLevel,
    });
    setStatusMessage({ type: 'success', text: 'Personal settings updated successfully!' });
    setTimeout(() => setStatusMessage(null), 2500);
  };

  const handleThemeModeChange = (mode: ThemeMode) => {
    updateSettings({ theme: mode });
  };

  const handleAccentChange = (accentId: AccentPresetId) => {
    updateSettings({ accentColor: accentId });
  };

  const handleCustomHexChange = (hex: string) => {
    setCustomHexInput(hex);
    if (isValidHexColor(hex)) {
      updateSettings({
        accentColor: 'custom',
        customAccentHex: hex,
      });
    }
  };

  const handleCopyHex = (hex: string) => {
    navigator.clipboard?.writeText(hex);
    setCopiedHex(true);
    setTimeout(() => setCopiedHex(false), 2000);
  };

  const handleResetAppearance = () => {
    updateSettings({
      theme: defaultSettings.theme,
      accentColor: defaultSettings.accentColor,
      customAccentHex: defaultSettings.customAccentHex,
    });
    setCustomHexInput(defaultSettings.customAccentHex || '#4f46e5');
    setStatusMessage({
      type: 'success',
      text: 'Appearance settings reset to default (Light mode, Indigo accent).',
    });
    setTimeout(() => setStatusMessage(null), 2500);
  };

  const handleExportBackup = () => {
    try {
      const dataStr = exportAllDataJSON();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `basis_command_center_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatusMessage({ type: 'success', text: 'Progress and RCA backup exported successfully!' });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch {
      setStatusMessage({ type: 'error', text: 'Failed to export backup.' });
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const contents = event.target?.result as string;
      const res = importAllDataJSON(contents);
      if (res.success) {
        setStatusMessage({ type: 'success', text: 'Backup imported! Refreshing page to reload state...' });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'Invalid backup file structure.' });
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    resetProgressData();
    setShowResetConfirm(false);
    setStatusMessage({ type: 'success', text: 'All progress reset. System initialized to Day 1.' });
    setTimeout(() => window.location.reload(), 1200);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          Settings & Local Data Management
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize your appearance mode, select signature accent colors, manage study pacing, and export portable offline JSON backups.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2.5 transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          )}
          <span className="font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DEDICATED APPEARANCE & COLOR CUSTOMIZER */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-xs space-y-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
              <Palette className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Appearance & Color Customizer
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Personalize your reading interface with light, dark, or system mode and select an accent color.
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetAppearance}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium transition-colors cursor-pointer self-start sm:self-auto"
            title="Reset theme and accent color to default"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset to Defaults</span>
          </button>
        </div>

        {/* Part A: Appearance Mode Selection */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider block">
            1. Appearance Mode
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Light Mode */}
            <button
              type="button"
              onClick={() => handleThemeModeChange('light')}
              className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                settings.theme === 'light'
                  ? 'border-indigo-600 bg-indigo-50/40 dark:bg-slate-800/80 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950'
              }`}
            >
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 shrink-0">
                <Sun className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 flex items-center justify-between">
                  <span>Light</span>
                  {settings.theme === 'light' && (
                    <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Clean, bright workspace</p>
              </div>
            </button>

            {/* Dark Mode */}
            <button
              type="button"
              onClick={() => handleThemeModeChange('dark')}
              className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                settings.theme === 'dark'
                  ? 'border-indigo-600 bg-indigo-50/40 dark:bg-slate-800/80 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950'
              }`}
            >
              <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 shrink-0">
                <Moon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 flex items-center justify-between">
                  <span>Dark</span>
                  {settings.theme === 'dark' && (
                    <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Soft charcoal surfaces</p>
              </div>
            </button>

            {/* System Mode */}
            <button
              type="button"
              onClick={() => handleThemeModeChange('system')}
              className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                settings.theme === 'system'
                  ? 'border-indigo-600 bg-indigo-50/40 dark:bg-slate-800/80 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950'
              }`}
            >
              <div className="p-2 rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 shrink-0">
                <Laptop className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 flex items-center justify-between">
                  <span>System</span>
                  {settings.theme === 'system' && (
                    <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Sync with operating system</p>
              </div>
            </button>
          </div>
        </div>

        {/* Part B: Accent Color Palette Swatches */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider block">
            2. Primary Accent Color
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ACCENT_PRESETS.map((preset) => {
              const isSelected = settings.accentColor === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleAccentChange(preset.id)}
                  className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer group ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/30 dark:bg-slate-800/80 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950'
                  }`}
                >
                  <span
                    className="w-6 h-6 rounded-lg shrink-0 flex items-center justify-center shadow-xs transition-transform group-hover:scale-105"
                    style={{ backgroundColor: preset.primaryColor }}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </span>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block truncate">
                      {preset.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block truncate">
                      {preset.primaryColor}
                    </span>
                  </div>
                </button>
              );
            })}

            {/* Custom Color Option */}
            <button
              type="button"
              onClick={() => handleAccentChange('custom')}
              className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer group ${
                settings.accentColor === 'custom'
                  ? 'border-indigo-600 bg-indigo-50/30 dark:bg-slate-800/80 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950'
              }`}
            >
              <span
                className="w-6 h-6 rounded-lg shrink-0 flex items-center justify-center shadow-xs transition-transform group-hover:scale-105"
                style={{ backgroundColor: customHexInput }}
              >
                {settings.accentColor === 'custom' && <Check className="w-3.5 h-3.5 text-white" />}
              </span>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block truncate">
                  Custom
                </span>
                <span className="text-[10px] font-mono text-slate-400 block truncate">
                  Picker
                </span>
              </div>
            </button>
          </div>

          {/* Custom Color Picker Input Drawer */}
          {settings.accentColor === 'custom' && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex flex-wrap items-center gap-4 text-xs transition-all">
              <div className="flex items-center gap-3">
                <label
                  htmlFor="customColorPicker"
                  className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 dark:border-slate-600 shadow-xs flex items-center justify-center overflow-hidden"
                  style={{ backgroundColor: customHexInput }}
                >
                  <input
                    id="customColorPicker"
                    type="color"
                    value={isValidHexColor(customHexInput) ? customHexInput : '#4f46e5'}
                    onChange={(e) => handleCustomHexChange(e.target.value)}
                    className="opacity-0 w-full h-full cursor-pointer"
                  />
                </label>
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                    Choose Custom Color
                  </span>
                  <span className="text-[11px] text-slate-400">Click swatch or type hex value</span>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <div className="relative">
                  <input
                    type="text"
                    value={customHexInput}
                    onChange={(e) => handleCustomHexChange(e.target.value)}
                    placeholder="#4f46e5"
                    maxLength={7}
                    className={`w-28 bg-white dark:bg-slate-900 border rounded-lg px-2.5 py-1.5 font-mono text-xs uppercase focus:outline-none ${
                      isValidHexColor(customHexInput)
                        ? 'border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100'
                        : 'border-rose-400 text-rose-500'
                    }`}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyHex(customHexInput)}
                  className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
                  title="Copy Hex Color"
                >
                  {copiedHex ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Part C: Live Interactive Preview Panel */}
        <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/80">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Live Interface Preview
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Updates in real time
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            {/* Sample Primary Button */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Primary Button
              </span>
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
              >
                <span>Continue Lesson</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sample Active Navigation Pill */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Active Nav Item
              </span>
              <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200/60 dark:border-indigo-900/60 shadow-2xs">
                <span>Daily Missions</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-indigo-600 text-white rounded-full font-mono">
                  W1D1
                </span>
              </div>
            </div>

            {/* Sample Progress Indicator */}
            <div className="space-y-1.5 sm:col-span-2 md:col-span-1">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex justify-between">
                <span>Progress Bar</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">75%</span>
              </span>
              <div className="w-full h-2.5 bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-indigo-600 rounded-full w-3/4 transition-all" />
              </div>
            </div>
          </div>

          {/* Sample Selected Card and Link */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Selected Card Highlight</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Accent highlights selected states while preserving neutral reading backgrounds.
              </p>
            </div>
            <a
              href="#preview"
              onClick={(e) => e.preventDefault()}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline underline-offset-2 shrink-0"
            >
              Interactive Link &rarr;
            </a>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STUDY ROUTINE PREFERENCES */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Personal Study Routine & Objectives
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure your daily time budget and pacing targets across the 8-week curriculum.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1.5">
              Daily Study Target (Minutes):
            </label>
            <input
              type="number"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
              min={15}
              max={180}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">Default: 60 minutes per session</p>
          </div>

          <div>
            <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1.5">
              Study Days per Week:
            </label>
            <input
              type="number"
              value={studyDays}
              onChange={(e) => setStudyDays(Number(e.target.value))}
              min={1}
              max={7}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">Default: 5 days / week (8-week duration)</p>
          </div>

          <div className="sm:col-span-2">
            <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1.5">
              Target Technical Profile:
            </label>
            <input
              type="text"
              value={userLevel}
              onChange={(e) => setUserLevel(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSaveSettings}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-xs transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Preferences</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. PERSISTENCE ARCHITECTURE & EXPORT/IMPORT */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Local Persistence & Backup Architecture
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            All curriculum progress, appearance preferences, and filed incident reports reside in your browser's local sandbox.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
          <p>
            <strong className="text-slate-900 dark:text-slate-100">Single-User Client Persistence:</strong> Basis Command Center is engineered with zero-tracking offline persistence for developer privacy.
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-[11px]">
            To protect against browser cache purges or migrate your academy records to another workstation, export a portable JSON backup below.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleExportBackup}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Export Full Backup (JSON)</span>
          </button>

          <label className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all cursor-pointer">
            <Upload className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Import Backup (JSON)</span>
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. DANGER ZONE */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-900/40 rounded-2xl p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Danger Zone
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Reset all academy task completions, quiz scores, and weekly notes back to zero-state. Your filed RCA reports will be preserved unless explicitly deleted in the RCA Notebook.
          </p>
        </div>

        {showResetConfirm ? (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center justify-between">
            <span className="text-xs text-rose-800 dark:text-rose-200 font-semibold">
              Are you sure? This action cannot be undone.
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer shadow-xs"
              >
                Yes, Reset All Progress
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 text-xs font-semibold transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Academy Progress</span>
          </button>
        )}
      </div>
    </div>
  );
};

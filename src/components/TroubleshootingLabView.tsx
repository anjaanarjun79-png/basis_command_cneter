import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { labScenarios, getLabScenarioById } from '../data/labScenarios';
import {
  Terminal,
  Play,
  RotateCcw,
  CheckCircle2,
  Lightbulb,
  FileText,
  Send,
  Shield,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';

export const TroubleshootingLabView: React.FC = () => {
  const { selectedLabScenarioId, setSelectedLabScenarioId } = useApp();

  const currentScenarioId = selectedLabScenarioId || labScenarios[0].id;
  const scenario = getLabScenarioById(currentScenarioId) || labScenarios[0];

  // Terminal state
  const [commandInput, setCommandInput] = useState<string>('');
  const [terminalHistory, setTerminalHistory] = useState<
    { command: string; output: string; timestamp: string }[]
  >([
    {
      command: '# Read-only diagnostic CLI session ready',
      output: `Connected to: ${scenario.ticket.system} (${scenario.ticket.environment})\nDiagnostic sandbox active. Execute standard commands (df -h, du, lsof +L1, sapcontrol, etc.) to investigate telemetry.`,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  // Guided state
  const [revealedHints, setRevealedHints] = useState<number>(0);
  const [hypothesisInput, setHypothesisInput] = useState<string>('');
  const [evidenceInput, setEvidenceInput] = useState<string>('');
  const [remediationInput, setRemediationInput] = useState<string>('');
  const [validationInput, setValidationInput] = useState<string>('');
  const [submissionResult, setSubmissionResult] = useState<{
    submitted: boolean;
    score: number;
    feedback: string[];
  } | null>(null);

  // Sync state when scenario changes
  React.useEffect(() => {
    setTerminalHistory([
      {
        command: `# Diagnostic session: ${scenario.title}`,
        output: `Ticket: ${scenario.ticket.number} (${scenario.ticket.severity})\nIssue: ${scenario.ticket.reportedIssue}\n\nEnter read-only commands to isolate the failing component.`,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
    setCommandInput('');
    setRevealedHints(0);
    setHypothesisInput('');
    setEvidenceInput('');
    setRemediationInput('');
    setValidationInput('');
    setSubmissionResult(null);
  }, [scenario.id]);

  const handleExecuteCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = commandInput.trim();
    if (!trimmed) return;

    const normalized = trimmed.toLowerCase();
    let output = '';

    if (scenario.supportedCommands[normalized]) {
      output = scenario.supportedCommands[normalized];
    } else {
      const match = Object.keys(scenario.supportedCommands).find((cmd) =>
        normalized.includes(cmd) || cmd.includes(normalized)
      );

      if (match) {
        output = scenario.supportedCommands[match];
      } else if (normalized.startsWith('rm') || normalized.startsWith('kill') || normalized.startsWith('reboot')) {
        output = `[SAFETY INTERLOCK]: Modification command "${trimmed}" blocked during diagnostic phase. Collect read-only proof before submitting remediation plan.`;
      } else {
        output = `sh: command not recognized in this lab simulation.\nTry commands like: ${Object.keys(
          scenario.supportedCommands
        )
          .slice(0, 4)
          .join(', ')}...`;
      }
    }

    setTerminalHistory((prev) => [
      ...prev,
      {
        command: trimmed,
        output,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
    setCommandInput('');
  };

  const handleSubmitInvestigation = () => {
    const executedCommands = terminalHistory.map((h) => h.command.toLowerCase());
    let score = 50;
    const feedback: string[] = [];

    const missingKeys = scenario.scoringGuide.keyCommandsNeeded.filter(
      (req) => !executedCommands.some((c) => c.includes(req.toLowerCase()))
    );

    if (missingKeys.length === 0) {
      score += 30;
      feedback.push('Thorough investigation: All key diagnostic verification commands were executed.');
    } else {
      score += 10;
      feedback.push(`Missed key verification commands: ${missingKeys.join(', ')}.`);
    }

    if (hypothesisInput.length > 20) {
      score += 10;
      feedback.push('Technical root-cause hypothesis articulated.');
    } else {
      feedback.push('Hypothesis requires more specific technical depth.');
    }

    if (remediationInput.length > 20) {
      score += 10;
      feedback.push('Safe remediation protocol provided.');
    }

    setSubmissionResult({
      submitted: true,
      score: Math.min(score, 100),
      feedback,
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header & Scenario Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            Troubleshooting Lab
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Safe simulated command-line environment with real-world incident scenarios and telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Scenario:</span>
          <select
            value={scenario.id}
            onChange={(e) => setSelectedLabScenarioId(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            {labScenarios.map((sc) => (
              <option key={sc.id} value={sc.id}>
                {sc.title} ({sc.difficulty})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Split Layout: Left Incident Details, Center Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Incident Ticket Card (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {scenario.ticket.number}
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-300 font-bold">
                {scenario.ticket.severity}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  System Context
                </span>
                <p className="text-slate-900 dark:text-slate-100 font-medium">
                  {scenario.ticket.system} • {scenario.ticket.environment}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Reported Issue
                </span>
                <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed">
                  {scenario.ticket.reportedIssue}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-rose-500 uppercase tracking-wider block mb-1">
                  Business Impact
                </span>
                <p className="text-rose-900 dark:text-rose-200 bg-rose-50/50 dark:bg-rose-950/20 p-2.5 rounded-xl border border-rose-100 dark:border-rose-900/30">
                  {scenario.ticket.businessImpact}
                </p>
              </div>
            </div>
          </div>

          {/* Investigation Hints Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Hints ({revealedHints}/{scenario.hints.length})</span>
              </div>
              {revealedHints < scenario.hints.length && (
                <button
                  onClick={() => setRevealedHints((prev) => prev + 1)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium cursor-pointer"
                >
                  Reveal hint
                </button>
              )}
            </div>

            <div className="space-y-2 text-xs">
              {revealedHints === 0 ? (
                <p className="text-slate-400 italic">
                  Run initial diagnostic commands. Reveal hints if you need guidance on what to check next.
                </p>
              ) : (
                scenario.hints.slice(0, revealedHints).map((hint, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 border border-amber-200/60 dark:border-amber-900/40 leading-relaxed"
                  >
                    <strong className="block text-amber-600 dark:text-amber-400 mb-0.5">Hint {i + 1}:</strong>
                    {hint}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Terminal Workspace (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Terminal Window (Darker workspace as specified) */}
          <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-lg flex flex-col font-mono text-xs">
            {/* Title Bar */}
            <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                </div>
                <span className="text-slate-400 text-[11px] ml-2 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  sapapp01:~ (Simulated Read-Only Shell)
                </span>
              </div>

              <button
                onClick={() =>
                  setTerminalHistory([
                    {
                      command: '# Screen buffer reset',
                      output: 'Terminal cleared. Ready for next command.',
                      timestamp: new Date().toLocaleTimeString(),
                    },
                  ])
                }
                className="text-slate-500 hover:text-slate-300 text-[11px] transition-colors cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>

            {/* Output Screen */}
            <div className="p-4 space-y-3 h-80 overflow-y-auto bg-slate-950 text-slate-300">
              {terminalHistory.map((h, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="text-indigo-400">prdadm@sapapp01:~$</span>
                      <span className="text-slate-100 font-semibold">{h.command}</span>
                    </div>
                    <span className="text-[10px] text-slate-600">{h.timestamp}</span>
                  </div>
                  <pre className="text-slate-300 text-[11px] whitespace-pre-wrap pl-4 border-l border-slate-800 leading-relaxed font-mono">
                    {h.output}
                  </pre>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleExecuteCommand}
              className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
            >
              <span className="text-indigo-400 font-semibold select-none">prdadm@sapapp01:~$</span>
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                placeholder="Enter diagnostic command (e.g. df -hT, lsof +L1, sapcontrol)..."
                className="flex-1 bg-transparent text-slate-100 placeholder-slate-600 focus:outline-none text-xs font-mono"
                autoFocus
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Play className="w-3 h-3" />
                <span>Run</span>
              </button>
            </form>
          </div>

          {/* Structured Findings & Remediation Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Hypothesis, Remediation & Scoring
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300 font-medium">1. Confirmed Root-Cause Hypothesis:</label>
                <textarea
                  rows={3}
                  value={hypothesisInput}
                  onChange={(e) => setHypothesisInput(e.target.value)}
                  placeholder="Explain the technical root cause proven by your findings..."
                  className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300 font-medium">2. Supporting Command Evidence:</label>
                <textarea
                  rows={3}
                  value={evidenceInput}
                  onChange={(e) => setEvidenceInput(e.target.value)}
                  placeholder="Cite specific outputs and metrics that prove this..."
                  className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300 font-medium">3. Safe Remediation Plan:</label>
                <textarea
                  rows={3}
                  value={remediationInput}
                  onChange={(e) => setRemediationInput(e.target.value)}
                  placeholder="Describe the steps to safely fix without causing secondary damage..."
                  className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300 font-medium">4. Post-Fix Service Validation:</label>
                <textarea
                  rows={3}
                  value={validationInput}
                  onChange={(e) => setValidationInput(e.target.value)}
                  placeholder="How will you prove complete system health before declaring open..."
                  className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSubmitInvestigation}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Findings & Evaluate</span>
              </button>
            </div>

            {/* Evaluation Score Card */}
            {submissionResult && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Investigation Evaluation
                  </span>
                  <span className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    Score: {submissionResult.score} / 100
                  </span>
                </div>

                <div className="space-y-1">
                  {submissionResult.feedback.map((f, i) => (
                    <p key={i} className="text-slate-600 dark:text-slate-300">• {f}</p>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700/80 space-y-2">
                  <div>
                    <strong className="text-slate-900 dark:text-slate-100 block mb-0.5">Verified Root Cause:</strong>
                    <p className="text-slate-600 dark:text-slate-400">{scenario.correctRootCause}</p>
                  </div>
                  <div>
                    <strong className="text-emerald-600 dark:text-emerald-400 block mb-0.5">Safe Resolution:</strong>
                    <p className="text-slate-600 dark:text-slate-400">{scenario.safeRemediation}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

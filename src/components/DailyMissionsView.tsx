import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { allCurriculumSessions, getSessionById } from '../data/curriculum';
import {
  CheckCircle2,
  Circle,
  Clock,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Terminal,
  HelpCircle,
  AlertTriangle,
  Save,
  Star,
  CheckSquare,
  FileText,
  RotateCcw,
  Copy,
  Check,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

export const DailyMissionsView: React.FC = () => {
  const {
    selectedSessionId,
    setSelectedSessionId,
    progress,
    toggleTask,
    markSessionComplete,
    updateSessionNotes,
    updateConfidenceRating,
    recordQuizScore,
    setActiveNav,
  } = useApp();

  // Current session logic
  const currentSessionId = selectedSessionId || 'w1d1';
  const session = getSessionById(currentSessionId) || allCurriculumSessions[0];
  const sessionProgress = progress[session.id] || {
    sessionId: session.id,
    completed: false,
    completedTasks: [],
    userNotes: '',
    confidenceRating: 3,
    actualStudyMinutes: 60,
  };

  // Local state for interactive knowledge check within lesson
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>(
    sessionProgress.quizScore?.answers || {}
  );
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(!!sessionProgress.quizScore);
  const [userNotes, setUserNotes] = useState<string>(sessionProgress.userNotes || '');
  const [notesSaved, setNotesSaved] = useState<boolean>(false);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  // Sync state when session changes
  React.useEffect(() => {
    setUserNotes(sessionProgress.userNotes || '');
    setSelectedAnswers(sessionProgress.quizScore?.answers || {});
    setQuizSubmitted(!!sessionProgress.quizScore);
    setNotesSaved(false);
  }, [session.id, sessionProgress.userNotes, sessionProgress.quizScore]);

  // Navigation handlers
  const currentIndex = allCurriculumSessions.findIndex((s) => s.id === session.id);
  const prevSession = currentIndex > 0 ? allCurriculumSessions[currentIndex - 1] : null;
  const nextSession = currentIndex < allCurriculumSessions.length - 1 ? allCurriculumSessions[currentIndex + 1] : null;

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleQuizSubmit = () => {
    let correctCount = 0;
    session.knowledgeCheck.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correctCount += 1;
      }
    });
    setQuizSubmitted(true);
    recordQuizScore(session.id, correctCount, session.knowledgeCheck.length, selectedAnswers);
  };

  const handleSaveNotes = () => {
    updateSessionNotes(session.id, userNotes);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  };

  const handleCopyCode = (index: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  // Clean Markdown formatter helper to avoid displaying raw markers
  const renderFormattedMarkdown = (text: string) => {
    // Process markdown sections and bold markers cleanly
    const lines = text.split('\n');
    return (
      <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
        {lines.map((line, i) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={i} className="text-sm font-bold text-slate-900 dark:text-slate-100 pt-3">
                {trimmed.replace('### ', '')}
              </h4>
            );
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h3 key={i} className="text-base font-bold text-slate-900 dark:text-slate-100 pt-3">
                {trimmed.replace('## ', '')}
              </h3>
            );
          }
          if (trimmed.startsWith('1. ') || trimmed.startsWith('2. ') || trimmed.startsWith('3. ')) {
            // Remove raw ** from text
            const clean = trimmed.replace(/\*\*/g, '');
            return (
              <div key={i} className="pl-4 border-l-2 border-indigo-200 dark:border-indigo-800 text-xs text-slate-700 dark:text-slate-300 py-1">
                {clean}
              </div>
            );
          }
          if (trimmed.startsWith('- ')) {
            const clean = trimmed.replace('- ', '').replace(/\*\*/g, '');
            return (
              <div key={i} className="flex items-start gap-2 pl-3 text-xs text-slate-600 dark:text-slate-300">
                <span className="text-indigo-500 font-bold">•</span>
                <span>{clean}</span>
              </div>
            );
          }
          if (trimmed.length === 0) return null;

          // Regular clean paragraph
          const cleanParagraph = trimmed.replace(/\*\*/g, '');
          return <p key={i} className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{cleanParagraph}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Lesson Header */}
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 font-mono">
              WEEK {session.week} • DAY {session.day}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-slate-500 dark:text-slate-400 font-mono">
              Session {currentIndex + 1} of 40
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5" />
              ~{session.durationMinutes} mins
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <button
              onClick={() => markSessionComplete(session.id, !sessionProgress.completed)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                sessionProgress.completed
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>{sessionProgress.completed ? 'Completed' : 'Mark Complete'}</span>
            </button>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          {session.title}
        </h1>
        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
          {session.topic}
        </p>
      </div>

      {/* Section 1: What You'll Learn (Objectives) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          What You'll Learn
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {session.learningObjectives.map((obj, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-1.5 shrink-0" />
              <span className="leading-relaxed">{obj}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2 & 3: Architecture & Core Concepts */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
        <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800">
          Architecture & Operational Concepts
        </h3>

        {renderFormattedMarkdown(session.technicalExplanation)}

        {/* Callout Notes */}
        <div className="space-y-2.5 pt-3">
          {session.detailedStudyNotes.map((note, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5 leading-relaxed"
            >
              <span className="font-bold text-amber-600 dark:text-amber-400 mt-0.5 shrink-0">TIP</span>
              <span>{note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Relevant Diagnostic Commands */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Relevant Commands & Transactions
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {session.toolsAndCommands.map((tool, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                  {tool.name}
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  {tool.type}
                </span>
              </div>
              {tool.syntax && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto">
                  <code>{tool.syntax}</code>
                  <button
                    onClick={() => handleCopyCode(i, tool.syntax || '')}
                    className="text-slate-400 hover:text-white shrink-0 ml-2"
                  >
                    {copiedCodeIndex === i ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                {tool.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 5: Realistic Production Incident Scenario */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Production Incident: {session.productionScenario.ticketId}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-300 text-[10px] font-mono font-bold">
            {session.productionScenario.severity}
          </span>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {session.productionScenario.title}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed">
            {session.productionScenario.description}
          </p>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1 block">
            Environment Context: {session.productionScenario.systemContext}
          </span>
        </div>

        {/* Guided Steps */}
        <div className="space-y-3 pt-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Guided Investigation Steps:
          </span>
          {session.guidedInvestigation.map((step) => (
            <div
              key={step.step}
              className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
                <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-[11px]">
                  {step.step}
                </span>
                <span>{step.title}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 pl-7 leading-relaxed">
                <strong className="text-slate-900 dark:text-slate-100">Action:</strong> {step.instruction}
              </p>
              <div className="pl-7 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40">
                  <span className="font-semibold block mb-0.5">Expected Finding:</span>
                  {step.expectedFinding}
                </div>
                <div className="p-2.5 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/40">
                  <span className="font-semibold block mb-0.5">Interpretation:</span>
                  {step.interpretation}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 6: Hands-On Exercise */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
        <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
          Hands-on Exercise: {session.handsOnTask.title}
        </h4>
        <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
          {session.handsOnTask.instructions.map((inst, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">•</span>
              <span>{inst}</span>
            </div>
          ))}
        </div>
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
          <strong className="text-slate-900 dark:text-slate-100">Deliverable:</strong> {session.handsOnTask.deliverable}
        </div>
      </div>

      {/* Section 7: Tasks Checklist */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Lesson Task Checklist
        </h4>

        <div className="space-y-2">
          {session.tasks.map((task) => {
            const isDone = sessionProgress.completedTasks.includes(task.id);
            return (
              <div
                key={task.id}
                onClick={() => toggleTask(session.id, task.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                  isDone
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2
                    className={`w-4 h-4 transition-colors ${
                      isDone ? 'text-emerald-500 fill-emerald-100 dark:fill-emerald-950' : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                  <span className={`font-medium ${isDone ? 'line-through text-slate-400' : ''}`}>
                    {task.text}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {isDone ? 'COMPLETED' : 'TO DO'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 8: Knowledge Check (Interactive) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Knowledge Check ({session.knowledgeCheck.length} Questions)
          </h4>
          {quizSubmitted && (
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
              Score: {sessionProgress.quizScore?.correct} / {session.knowledgeCheck.length}
            </span>
          )}
        </div>

        <div className="space-y-4">
          {session.knowledgeCheck.map((q, qIndex) => {
            const userAnswer = selectedAnswers[q.id];
            return (
              <div key={q.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {qIndex + 1}. {q.question}
                </p>

                <div className="space-y-2">
                  {q.options.map((opt, optIndex) => {
                    const isSelected = userAnswer === optIndex;
                    const isCorrect = q.correctAnswer === optIndex;
                    let style = 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700';

                    if (quizSubmitted) {
                      if (isCorrect) {
                        style = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200';
                      } else if (isSelected && !isCorrect) {
                        style = 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200';
                      } else {
                        style = 'bg-slate-50 dark:bg-slate-800/20 text-slate-400 border-transparent';
                      }
                    } else if (isSelected) {
                      style = 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-200';
                    }

                    return (
                      <div
                        key={optIndex}
                        onClick={() => handleAnswerSelect(q.id, optIndex)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${style}`}
                      >
                        <span>{opt}</span>
                        {quizSubmitted && isCorrect && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Correct</span>
                        )}
                        {quizSubmitted && isSelected && !isCorrect && (
                          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase">Incorrect</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {quizSubmitted && (
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    <strong className="text-slate-900 dark:text-slate-100 block mb-0.5">Explanation:</strong>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2">
          {quizSubmitted ? (
            <button
              onClick={() => {
                setQuizSubmitted(false);
                setSelectedAnswers({});
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Knowledge Check</span>
            </button>
          ) : (
            <button
              disabled={Object.keys(selectedAnswers).length < session.knowledgeCheck.length}
              onClick={handleQuizSubmit}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              Submit Answers & Check Feedback
            </button>
          )}
        </div>
      </div>

      {/* Personal Notes & Confidence */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Personal Notes & Confidence Rating
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Saved automatically in local browser storage.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Confidence:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => updateConfidenceRating(session.id, star)}
                  className="p-1 cursor-pointer"
                >
                  <Star
                    className={`w-4 h-4 transition-colors ${
                      star <= sessionProgress.confidenceRating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-300 dark:text-slate-700'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        <textarea
          value={userNotes}
          onChange={(e) => setUserNotes(e.target.value)}
          placeholder="Capture your key takeaways, commands to remember, or questions to investigate further..."
          rows={4}
          className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
        />

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-400">
            {notesSaved ? 'Notes saved successfully' : 'Click save to persist'}
          </span>
          <button
            onClick={handleSaveNotes}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Notes</span>
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
        {prevSession ? (
          <button
            onClick={() => setSelectedSessionId(prevSession.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Lesson</span>
          </button>
        ) : (
          <div />
        )}

        <button
          onClick={() => markSessionComplete(session.id, !sessionProgress.completed)}
          className={`px-5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer ${
            sessionProgress.completed
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {sessionProgress.completed ? 'Lesson Completed ✓' : 'Mark Lesson Complete'}
        </button>

        {nextSession ? (
          <button
            onClick={() => setSelectedSessionId(nextSession.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-medium transition-colors cursor-pointer"
          >
            <span>Next Lesson</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
};

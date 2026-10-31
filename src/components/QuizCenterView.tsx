import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { quizBank, QuizQuestion } from '../data/quizBank';
import {
  HelpCircle,
  CheckCircle2,
  RotateCcw,
  Filter,
  ArrowRight,
} from 'lucide-react';

export const QuizCenterView: React.FC = () => {
  const [selectedWeek, setSelectedWeek] = useState<number | 'all'>('all');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [sessionResults, setSessionResults] = useState<{
    totalAnswered: number;
    correctCount: number;
  }>({
    totalAnswered: 0,
    correctCount: 0,
  });

  const filteredQuestions = quizBank.filter((q) => {
    const matchesWeek = selectedWeek === 'all' || q.week === selectedWeek;
    const matchesDomain = selectedDomain === 'all' || q.domain === selectedDomain;
    return matchesWeek && matchesDomain;
  });

  const currentQuestion = filteredQuestions[activeQuestionIndex] || filteredQuestions[0];

  const handleSelectOption = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || !currentQuestion) return;
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    setIsAnswerSubmitted(true);

    setSessionResults((prev) => ({
      totalAnswered: prev.totalAnswered + 1,
      correctCount: isCorrect ? prev.correctCount + 1 : prev.correctCount,
    }));
  };

  const handleNextQuestion = () => {
    setIsAnswerSubmitted(false);
    setSelectedOption(null);
    if (activeQuestionIndex < filteredQuestions.length - 1) {
      setActiveQuestionIndex((prev) => prev + 1);
    } else {
      setActiveQuestionIndex(0);
    }
  };

  const accuracy =
    sessionResults.totalAnswered > 0
      ? Math.round((sessionResults.correctCount / sessionResults.totalAnswered) * 100)
      : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Quiz Assessment Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Test your knowledge across 80+ multi-layer SAP, Linux, and database questions.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl text-xs font-mono shadow-2xs">
          <div>
            <span className="text-slate-400 block text-[10px]">CURRENT RUN</span>
            <span className="text-slate-900 dark:text-slate-100 font-bold">
              {sessionResults.correctCount} / {sessionResults.totalAnswered} Correct
            </span>
          </div>
          <div className="border-l border-slate-200 dark:border-slate-800 pl-4">
            <span className="text-slate-400 block text-[10px]">ACCURACY</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">{accuracy}%</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter by Week:</span>
          </div>
          <select
            value={selectedWeek}
            onChange={(e) => {
              setSelectedWeek(e.target.value === 'all' ? 'all' : Number(e.target.value));
              setActiveQuestionIndex(0);
              setIsAnswerSubmitted(false);
              setSelectedOption(null);
            }}
            className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
          >
            <option value="all">All Weeks (80 Qs)</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
              <option key={w} value={w}>
                Week {w}
              </option>
            ))}
          </select>

          <span className="text-slate-300 dark:text-slate-700">•</span>

          <span className="text-slate-500">Domain:</span>
          <select
            value={selectedDomain}
            onChange={(e) => {
              setSelectedDomain(e.target.value);
              setActiveQuestionIndex(0);
              setIsAnswerSubmitted(false);
              setSelectedOption(null);
            }}
            className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
          >
            <option value="all">All Domains</option>
            <option value="architecture">Architecture</option>
            <option value="linux">Linux Administration</option>
            <option value="database">Database (HANA/Oracle)</option>
            <option value="abap">ABAP Engine</option>
            <option value="ha">High Availability</option>
            <option value="upgrades">Upgrades & SUM</option>
            <option value="rca">RCA Methodology</option>
            <option value="simulations">Incident Simulations</option>
          </select>
        </div>

        <span className="text-slate-400 font-mono text-[11px]">
          {filteredQuestions.length} Questions
        </span>
      </div>

      {/* Main Single Question Card */}
      {currentQuestion ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
          {/* Header Metadata */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 font-medium text-[11px]">
              Week {currentQuestion.week} • {currentQuestion.domain.toUpperCase()}
            </span>
            <span className="text-slate-400 font-mono">
              Question {activeQuestionIndex + 1} of {filteredQuestions.length}
            </span>
          </div>

          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
            {currentQuestion.question}
          </h3>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = currentQuestion.correctAnswer === idx;

              let style = 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700';

              if (isAnswerSubmitted) {
                if (isCorrect) {
                  style = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-medium';
                } else if (isSelected && !isCorrect) {
                  style = 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200';
                } else {
                  style = 'bg-slate-50 dark:bg-slate-800/20 text-slate-400 border-transparent';
                }
              } else if (isSelected) {
                style = 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-200 font-medium';
              }

              return (
                <div
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${style}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center font-mono text-[11px] font-bold text-slate-500 shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="leading-relaxed">{opt}</span>
                  </div>
                  {isAnswerSubmitted && isCorrect && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Correct</span>
                  )}
                  {isAnswerSubmitted && isSelected && !isCorrect && (
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase">Incorrect</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Explanation Callout */}
          {isAnswerSubmitted && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300 space-y-1 leading-relaxed border border-slate-100 dark:border-slate-800">
              <strong className="text-slate-900 dark:text-slate-100 block mb-0.5">Technical Explanation:</strong>
              <p>{currentQuestion.explanation}</p>
            </div>
          )}

          {/* Action Row */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {isAnswerSubmitted ? 'Review explanation before continuing' : 'Select an answer to submit'}
            </span>

            {isAnswerSubmitted ? (
              <button
                onClick={handleNextQuestion}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-semibold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                disabled={selectedOption === null}
                onClick={handleSubmitAnswer}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:pointer-events-none text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
              >
                Submit Answer
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          No questions matched the selected filters.
        </div>
      )}
    </div>
  );
};

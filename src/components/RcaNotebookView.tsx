import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RCAReport } from '../types';
import {
  FileText,
  Plus,
  Trash2,
  Copy,
  Download,
  Save,
  Search,
  CheckCircle2,
  Printer,
  ChevronRight,
} from 'lucide-react';

export const RcaNotebookView: React.FC = () => {
  const { reports, saveReport, deleteReport, duplicateReport, selectedReportId, setSelectedReportId } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const activeReport = reports.find((r) => r.id === selectedReportId) || reports[0] || null;
  const [editorData, setEditorData] = useState<RCAReport | null>(activeReport);
  const [saveBanner, setSaveBanner] = useState<boolean>(false);

  React.useEffect(() => {
    setEditorData(activeReport);
  }, [activeReport?.id]);

  const handleCreateNew = () => {
    const newReport: RCAReport = {
      id: 'rca-' + Date.now(),
      title: 'New Production Incident Report',
      sid: 'PRD',
      instance: 'D00',
      startTime: new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC',
      businessImpact: 'Business processing degraded.',
      symptoms: 'Application processes stopped or unresponsive.',
      tags: ['Linux', 'ABAP'],
      status: 'draft',
      initialEvidence: {
        sapProcess: '',
        traces: '',
        osEvidence: '',
        dbEvidence: '',
        networkCluster: '',
      },
      investigation: {
        hypotheses: '',
        supportingEvidence: '',
        contradictoryEvidence: '',
        checksPerformed: '',
        alternativeCausesRuledOut: '',
      },
      rootCause: {
        confidence: 'probable',
        technicalExplanation: '',
        contributingFactors: '',
        evidenceProvingCause: '',
      },
      resolution: {
        correctiveAction: '',
        riskAssessment: '',
        recoveryOrRollback: '',
        actualOutcome: '',
      },
      validation: {
        sapProcessesHealthy: true,
        dbConnectivityVerified: true,
        appFunctionalityVerified: true,
        monitoringStable: true,
        notes: 'SM51, SM21, and SM13 verified.',
      },
      prevention: {
        monitoringImprovements: '',
        capacityConfigChanges: '',
        followUpActions: '',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveReport(newReport);
    setSelectedReportId(newReport.id);
  };

  const handleSave = () => {
    if (!editorData) return;
    saveReport(editorData);
    setSaveBanner(true);
    setTimeout(() => setSaveBanner(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    if (!editorData) return;
    const md = `# PRODUCTION ROOT CAUSE ANALYSIS (RCA) REPORT
**Incident:** ${editorData.title}
**System:** ${editorData.sid} | **Instance:** ${editorData.instance} | **Start Time:** ${editorData.startTime}
**Status:** ${editorData.status.toUpperCase()} | **Confidence:** ${editorData.rootCause.confidence.toUpperCase()}
**Tags:** ${editorData.tags.join(', ')}

---

## 1. INCIDENT SUMMARY
- **Business Impact:** ${editorData.businessImpact}
- **Observed Symptoms:** ${editorData.symptoms}

## 2. INITIAL TELEMETRY & EVIDENCE
- **SAP Process Status:** ${editorData.initialEvidence.sapProcess}
- **Developer Traces:** ${editorData.initialEvidence.traces}
- **Operating System Evidence:** ${editorData.initialEvidence.osEvidence}
- **Database Evidence:** ${editorData.initialEvidence.dbEvidence}
- **Network / Cluster State:** ${editorData.initialEvidence.networkCluster}

## 3. INVESTIGATION & ALTERNATIVE CAUSES RULED OUT
- **Hypotheses Tested:** ${editorData.investigation.hypotheses}
- **Supporting Evidence:** ${editorData.investigation.supportingEvidence}
- **Contradictory Evidence:** ${editorData.investigation.contradictoryEvidence}
- **Checks Performed:** ${editorData.investigation.checksPerformed}
- **Alternative Causes Ruled Out:** ${editorData.investigation.alternativeCausesRuledOut}

## 4. ROOT CAUSE
- **Confidence Level:** ${editorData.rootCause.confidence}
- **Technical Explanation:** ${editorData.rootCause.technicalExplanation}
- **Contributing Factors:** ${editorData.rootCause.contributingFactors}
- **Definitive Proof:** ${editorData.rootCause.evidenceProvingCause}

## 5. RESOLUTION & CORRECTIVE ACTION
- **Action Taken:** ${editorData.resolution.correctiveAction}
- **Risk Assessment:** ${editorData.resolution.riskAssessment}
- **Rollback / Recovery:** ${editorData.resolution.recoveryOrRollback}
- **Outcome:** ${editorData.resolution.actualOutcome}

## 6. SERVICE VALIDATION
- SAP Processes Healthy: ${editorData.validation.sapProcessesHealthy ? 'YES' : 'NO'}
- DB Connectivity Verified: ${editorData.validation.dbConnectivityVerified ? 'YES' : 'NO'}
- Application Functional: ${editorData.validation.appFunctionalityVerified ? 'YES' : 'NO'}
- Monitoring Stable: ${editorData.validation.monitoringStable ? 'YES' : 'NO'}
- Validation Notes: ${editorData.validation.notes}

## 7. PREVENTIVE ACTIONS (CAPA)
- **Monitoring Improvements:** ${editorData.prevention.monitoringImprovements}
- **Configuration & Capacity Changes:** ${editorData.prevention.capacityConfigChanges}
- **Follow-up Actions:** ${editorData.prevention.followUpActions}

---
*Generated by Basis Command Center — Personal Troubleshooting Academy*
`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RCA_${editorData.sid}_${editorData.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.sid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.symptoms.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = tagFilter === 'all' || r.tags.includes(tagFilter as any);
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesTag && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            RCA Notebook
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Structured root-cause incident authoring with multi-tier evidence recording and export.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New RCA Report</span>
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Report List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 space-y-2.5 shadow-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg pl-8.5 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="all">All Tags</option>
                <option value="HANA">HANA</option>
                <option value="Oracle">Oracle</option>
                <option value="Linux">Linux</option>
                <option value="ABAP">ABAP</option>
                <option value="HA">HA</option>
                <option value="Upgrade">Upgrade</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="reviewed">Reviewed</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
            {filteredReports.map((r) => {
              const isSelected = r.id === editorData?.id;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedReportId(r.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-800 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{r.sid}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full uppercase font-medium text-[10px] ${
                          r.status === 'completed'
                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : r.status === 'reviewed'
                            ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {r.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {r.businessImpact}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-400">
                    <div className="flex items-center gap-1">
                      {r.tags.map((t) => (
                        <span key={t} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {t}
                        </span>
                      ))}
                    </div>
                    <span>{new Date(r.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Clean Editor Workspace (8 cols) */}
        <div className="lg:col-span-8">
          {editorData ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
              {/* Editor Header Toolbar */}
              <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                    {editorData.sid} / {editorData.instance}
                  </span>
                  <select
                    value={editorData.status}
                    onChange={(e) =>
                      setEditorData({ ...editorData, status: e.target.value as any })
                    }
                    className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-700 dark:text-slate-300 font-medium"
                  >
                    <option value="draft">Draft</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleDownloadMarkdown}
                    className="flex items-center gap-1 px-3 py-1 text-xs rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Markdown</span>
                  </button>

                  <button
                    onClick={() => duplicateReport(editorData.id)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Duplicate report"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {deleteConfirmId === editorData.id ? (
                    <button
                      onClick={() => {
                        deleteReport(editorData.id);
                        setDeleteConfirmId(null);
                      }}
                      className="px-2.5 py-1 text-xs rounded-lg bg-rose-600 text-white font-semibold cursor-pointer"
                    >
                      Delete?
                    </button>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(editorData.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete report"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer ml-1"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                </div>
              </div>

              {saveBanner && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Report saved successfully</span>
                </div>
              )}

              {/* Title & Metadata inputs */}
              <div className="space-y-4">
                <input
                  type="text"
                  value={editorData.title}
                  onChange={(e) => setEditorData({ ...editorData, title: e.target.value })}
                  placeholder="Report Title..."
                  className="w-full bg-transparent border-b border-slate-200 dark:border-slate-800 pb-2 text-lg font-bold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">SID / Instance:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editorData.sid}
                        onChange={(e) => setEditorData({ ...editorData, sid: e.target.value })}
                        className="w-1/2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono"
                      />
                      <input
                        type="text"
                        value={editorData.instance}
                        onChange={(e) => setEditorData({ ...editorData, instance: e.target.value })}
                        className="w-1/2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Start Time (UTC):</label>
                    <input
                      type="text"
                      value={editorData.startTime}
                      onChange={(e) => setEditorData({ ...editorData, startTime: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Confidence:</label>
                    <select
                      value={editorData.rootCause.confidence}
                      onChange={(e) =>
                        setEditorData({
                          ...editorData,
                          rootCause: { ...editorData.rootCause, confidence: e.target.value as any },
                        })
                      }
                      className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg p-2"
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="probable">Probable</option>
                      <option value="unconfirmed">Unconfirmed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Incident Summary */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider block">
                  1. Incident Summary
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-500 dark:text-slate-400 block mb-1">Business Impact:</label>
                    <textarea
                      rows={2}
                      value={editorData.businessImpact}
                      onChange={(e) => setEditorData({ ...editorData, businessImpact: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 dark:text-slate-400 block mb-1">Observed Symptoms:</label>
                    <textarea
                      rows={2}
                      value={editorData.symptoms}
                      onChange={(e) => setEditorData({ ...editorData, symptoms: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Investigation & Ruled-Out Causes */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider block">
                  2. Investigation & Hypotheses
                </span>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-500 dark:text-slate-400 block mb-1">Hypotheses Tested:</label>
                    <textarea
                      rows={2}
                      value={editorData.investigation.hypotheses}
                      onChange={(e) =>
                        setEditorData({
                          ...editorData,
                          investigation: { ...editorData.investigation, hypotheses: e.target.value },
                        })
                      }
                      className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 dark:text-slate-400 block mb-1">
                      Alternative Causes Ruled Out (Why other theories were eliminated):
                    </label>
                    <textarea
                      rows={2}
                      value={editorData.investigation.alternativeCausesRuledOut}
                      onChange={(e) =>
                        setEditorData({
                          ...editorData,
                          investigation: {
                            ...editorData.investigation,
                            alternativeCausesRuledOut: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Confirmed Root Cause */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider block">
                  3. Confirmed Root Cause
                </span>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-500 dark:text-slate-400 block mb-1">Technical Explanation:</label>
                    <textarea
                      rows={3}
                      value={editorData.rootCause.technicalExplanation}
                      onChange={(e) =>
                        setEditorData({
                          ...editorData,
                          rootCause: { ...editorData.rootCause, technicalExplanation: e.target.value },
                        })
                      }
                      className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 dark:text-slate-400 block mb-1">Definitive Proof & Artifacts:</label>
                    <textarea
                      rows={2}
                      value={editorData.rootCause.evidenceProvingCause}
                      onChange={(e) =>
                        setEditorData({
                          ...editorData,
                          rootCause: { ...editorData.rootCause, evidenceProvingCause: e.target.value },
                        })
                      }
                      className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Resolution & CAPA */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider block">
                  4. Corrective & Preventive Action Plan (CAPA)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-500 dark:text-slate-400 block mb-1">Corrective Action Taken:</label>
                    <textarea
                      rows={2}
                      value={editorData.resolution.correctiveAction}
                      onChange={(e) =>
                        setEditorData({
                          ...editorData,
                          resolution: { ...editorData.resolution, correctiveAction: e.target.value },
                        })
                      }
                      className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 dark:text-slate-400 block mb-1">Preventive Improvements:</label>
                    <textarea
                      rows={2}
                      value={editorData.prevention.monitoringImprovements}
                      onChange={(e) =>
                        setEditorData({
                          ...editorData,
                          prevention: { ...editorData.prevention, monitoringImprovements: e.target.value },
                        })
                      }
                      className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              No report selected. Click "New RCA Report" to start.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

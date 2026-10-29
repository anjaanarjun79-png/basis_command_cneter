# Basis Command Center — SAP Basis Troubleshooting Academy

A production-grade, functional web application designed to advance an operational SAP Basis Analyst into an authoritative production troubleshooter.

The academy provides structured learning, simulated diagnostic telemetry, interactive command testing, knowledge checks, and professional Root Cause Analysis (RCA) reporting across 40 daily study sessions over 8 weeks (1 hour/day, 5 days/week).

---

## 🌟 Key Application Features

1. **Persistent Operational Dashboard**:
   - Live metrics derived from actual user activity: overall completion percentage (completed sessions / 40), current week and day, study streak, study hours logged, quiz accuracy, and filed RCA count.
   - Weekly velocity chart powered by Recharts.
   - Diagnostic radar highlighting technical domains with accuracy below 80%.
   - Instant action triggers: *Continue Learning*, *Today's Mission*, and *Quick Incident Drill*.

2. **Complete 8-Week Curriculum (40 Distinct Sessions)**:
   - **Week 1**: SAP Architecture & Startup Troubleshooting (ASCS, PAS, sapstartsrv, sapcontrol, dev_disp, dev_w*, R3trans).
   - **Week 2**: Advanced Linux Troubleshooting (df -hT vs df -i inodes, lsof +L1 unlinked open descriptors, top, vmstat, ss, OOM-killer).
   - **Week 3**: SAP HANA & Oracle Database Troubleshooting (HANA MDC, Global Allocation Limit, /hana/log 100% saturation, Oracle alert logs, ORA-00257, 3-layer connectivity).
   - **Week 4**: ABAP & SAP Application Troubleshooting (ST22 dumps, SM12 lock tables, SM13 V1/V2 update failures, ST03N response time decomposition, SM58/SMQ1/SMQ2, gateway).
   - **Week 5**: High Availability & Clustering (Pacemaker/Corosync dual-ring networks, quorum, STONITH/SBD, ASCS/ERS anti-colocation -INFINITY, HANA System Replication sync vs async, maintenance mode freezes).
   - **Week 6**: Upgrades & Maintenance Troubleshooting (Software Update Manager SUM phases, isolating the first meaningful error, kernel replacement & saproot.sh, SPAM/SAINT queues, HANA hdblcm, Point of No Return rollback protocols).
   - **Week 7**: Cross-Layer Root-Cause Analysis (UTC timeline normalization, hardware saturation chains, 3-layer evidence triangulation, hypothesis elimination, audit-ready CAPA).
   - **Week 8**: Incident Simulations & Capstone Playbook (4 comprehensive scenario drills, 10-point post-maintenance validation, 4 master RCA audits, personal troubleshooting playbook).

3. **Interactive Troubleshooting Lab**:
   - Safe simulated CLI environment with realistic multi-layer telemetry.
   - Preconfigured emergency scenarios:
     1. Filesystem at 99% / Hidden Mount Data.
     2. Deleted File Held Open by Active Process (lsof +L1).
     3. PAS Dispatcher Stopped / Orphaned Shared Memory (cleanipc).
     4. Oracle Database Listener Down (lsnrctl & R3trans).
     5. HANA Log-Volume Saturation (/hana/log at 100%).
     6. High Swap Thrashing and Memory Squeeze (vmstat si/so).
     7. Repeated Cluster Resource Failure / Monitor Flapping (crm_mon).
     8. Failed Upgrade Phase in SUM (STARTSYS_PRE & core dump).
   - Guided hints, hypothesis formulation, evidence citation, and automated diagnostic scoring.

4. **Enterprise RCA Notebook**:
   - Standard 8-part RCA template: Incident Summary, Initial Evidence, Investigation & Ruled-Out Causes, Confirmed Root Cause, Resolution, Validation, and CAPA.
   - Search, tag filter (HANA, Oracle, Linux, ABAP, HA, Upgrade), duplicate, and print-friendly formatting.
   - Export individual reports as GitHub-flavored Markdown.

5. **Quiz Center (80+ Questions)**:
   - Topic-tagged questions across all 8 weeks with instant feedback and in-depth technical explanations.
   - Never reveals answers before user submission.

6. **Searchable Command Reference**:
   - Linux resources, filesystems, networking, SAP instance controls, HANA, Oracle, and clustering.
   - Clear distinction between Read-Only Safe and State Modifying commands.

7. **Weekly Retrospective Reviews**:
   - Structured 5-point weekly reflection to formulate your personal troubleshooting playbook.

---

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript.
- **Bundler & Dev Server**: Vite 8.
- **Styling**: Tailwind CSS (Dark technical theme).
- **Icons**: Lucide React.
- **Charts**: Recharts.
- **Persistence**: LocalStorage with full JSON backup export & restore.

---

## 🚀 Installation & Local Development

### Prerequisites
- Node.js (v18+ or v20+ recommended).
- npm or pnpm.

### Setup Instructions
1. Clone or open the repository directory:
   ```bash
   cd basis-command-center
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:5173/
   ```

### Production Build
```bash
npm run build
npm run preview
```

---

## 💾 Persistence & Architecture Notes

- All user state (task checklists, quiz history, personal study notes, confidence ratings, and RCA reports) is stored locally in the browser via `localStorage`.
- No paid third-party APIs or cloud subscriptions are required.
- **Data Export & Portability**: Navigate to **Settings -> Export Full Backup (JSON)** to download your complete training record and RCA library. You can restore your data at any time via **Import Backup (JSON)**.
- The state architecture is decoupled inside `src/context/AppContext.tsx` and `src/services/storage.ts`, allowing an enterprise PostgreSQL / REST backend to be integrated in future phases without rewriting UI components.

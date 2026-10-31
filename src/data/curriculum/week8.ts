import { CurriculumSession } from '../../types';

export const week8Sessions: CurriculumSession[] = [
  {
    id: 'w8d1',
    week: 8,
    day: 1,
    title: 'Incident Simulation 1: PAS Down, Database Available, Filesystem Nearly Full',
    topic: 'Comprehensive Triage Drill: Correlating Inode Capacity, Shared Memory IPC, and Dispatcher Abends',
    domain: 'simulations',
    durationMinutes: 60,
    learningObjectives: [
      'Independently triage a complex multi-symptom production outage under timed simulation conditions.',
      'Disentangle coincident symptoms (nearly full filesystem) from the true triggering cause.',
      'Execute safe command-line diagnostics without causing service regression.',
      'Formulate and prove a confirmed root-cause hypothesis with primary evidence.',
      'Author an incident report and score your diagnostic path against expert benchmarks.'
    ],
    technicalExplanation: `In Week 8, you transition from guided instruction to independent operational mastery. Every day presents a realistic production emergency.

**Today's Incident Context**:
- Production SAP ERP 6.0 on Oracle 19c.
- Primary Application Server (PAS) dispatcher terminated abruptly.
- Database reports status \`OPEN\`; other instances and direct SQL queries work.
- Host filesystem \`/usr/sap\` is at 94% capacity.
- **The Analytical Challenge**: Did the 94% filesystem cause the crash, or is it a red herring distracting you from an IPC shared memory key conflict or expired certificate?

**The Expert Diagnostic Sequence**:
1. Check process status via \`sapcontrol -nr 00 -function GetProcessList\`.
2. Inspect \`dev_disp\` developer trace for the exact abend signal and return code.
3. Check filesystem storage (\`df -hT\`) AND inode capacity (\`df -i\`).
4. Check IPC resources (\`cleanipc <NR> check\` and \`ipcs -m\`).
5. Verify database listener and connectivity (\`R3trans -d\`).`,
    detailedStudyNotes: [
      'Beware of red herrings: A filesystem at 94% is uncomfortable, but unless it reaches 100% or inodes reach 100%, it will NOT cause a process to crash. Verify whether an actual write operation failed.',
      'cleanipc utility: When an SAP instance crashes, it can leave orphaned shared memory blocks and semaphores. If disp+work tries to start with the same IPC key, it will abort with "ShmCreate failed". Run cleanipc <NR> remove to clear orphaned blocks.',
      'Use the Troubleshooting Lab: Execute this scenario live in the Interactive Troubleshooting Lab (Scenario 1 & 3).'
    ],
    toolsAndCommands: [
      { name: 'cleanipc <NR> check', type: 'command', description: 'Checks for orphaned shared memory segments and semaphores left behind after a crash.' },
      { name: 'sapcontrol -nr 00 -function GetProcessList', type: 'command', description: 'Checks instance processes.' },
      { name: 'R3trans -d', type: 'command', description: 'Tests SAP DB client connectivity.' }
    ],
    productionScenario: {
      ticketId: 'INC-2026-08801',
      severity: 'P1',
      title: 'Production Outage: PAS Dispatcher Stopped, Filesystem at 94%',
      description: 'The production dispatcher has crashed. Operations flagged a filesystem alarm on /usr/sap (94% used) and is requesting permission to delete trace files. Database is OPEN.',
      systemContext: 'PRD instance D00 on RHEL 8.8 with Oracle 19c.'
    },
    guidedInvestigation: [
      {
        step: 1,
        title: 'Run Diagnostic Suite via Troubleshooting Lab',
        instruction: 'Launch Troubleshooting Lab Scenario 3: "PAS Dispatcher Stopped / IPC Conflict".',
        expectedFinding: 'sapcontrol reports disp+work stopped with exit code 255. dev_disp reports: "*** ERROR => DpShmCreate: ShmKey 100 already exists and cannot be attached".',
        interpretation: 'The crash left orphaned shared memory segments in Linux RAM; the 94% filesystem was a harmless red herring!'
      },
      {
        step: 2,
        title: 'Inspect Orphaned IPC Resources',
        instruction: 'Execute cleanipc 00 check as prdadm.',
        expectedFinding: 'cleanipc finds 8 orphaned shared memory segments and 14 semaphores owned by deceased PID 14209.',
        interpretation: 'Confirmed: The dispatcher cannot start because its previous memory structures were not cleaned up.'
      },
      {
        step: 3,
        title: 'Safely Remove Orphaned Segments and Start PAS',
        instruction: 'Run cleanipc 00 remove, then execute sapcontrol -nr 00 -function Start.',
        expectedFinding: 'Orphaned segments removed; disp+work starts cleanly and turns GREEN.',
        interpretation: 'Root cause resolved without unnecessary or dangerous filesystem deletions.'
      }
    ],
    handsOnTask: {
      title: 'Execute Simulation 1 in the Interactive Lab',
      instructions: [
        'Complete Scenario 3 in the Troubleshooting Lab.',
        'Submit your hypothesis and remediation plan.',
        'Record the incident in the RCA Notebook.'
      ],
      deliverable: 'Completed lab simulation score and recorded RCA.'
    },
    knowledgeCheck: [
      {
        id: 'w8d1_q1',
        question: 'When an SAP instance crashes unexpectedly, what tool should be run by <sid>adm before restarting to remove orphaned shared memory and semaphores?',
        options: ['rm -rf /usr/sap', 'cleanipc <NR> remove', 'fdisk /dev/sda', 'kill -9 -1'],
        correctAnswer: 1,
        explanation: 'cleanipc <NR> remove scans for and purges stale shared memory segments and IPC semaphores associated with that instance number.'
      },
      {
        id: 'w8d1_q2',
        question: 'Why is it dangerous to immediately assume that a 94% full filesystem caused a dispatcher crash?',
        options: [
          'Because 94% full filesystems operate normally; unless the filesystem reaches 100% blocks or 100% inodes, it does not prevent writes or trigger ENOSPC crashes.',
          'Because filesystems cannot cause crashes.',
          'Because SAP does not write to disks.',
          'Because 94% is an even number.'
        ],
        correctAnswer: 0,
        explanation: 'A 94% filesystem is a warning metric, not an error. Senior engineers verify whether write operations actually failed before jumping to conclusions.'
      }
    ],
    tasks: [
      { id: 't1', text: 'Execute Simulation 1 in the Troubleshooting Lab.' },
      { id: 't2', text: 'Understand cleanipc check and remove mechanics.' },
      { id: 't3', text: 'Distinguish real failure triggers from non-fatal warning metrics.' },
      { id: 't4', text: 'Complete the Day 1 Simulation knowledge check.' }
    ]
  },
  {
    id: 'w8d2',
    week: 8,
    day: 2,
    title: 'Incident Simulation 2: HANA Log-Backup Failure vs Oracle Connectivity Outage',
    topic: 'Comparative Production Simulation: Emergency Resolution of Database Storage and Network Failures',
    domain: 'simulations',
    durationMinutes: 60,
    learningObjectives: [
      'Resolve an active database storage freeze without causing database corruption.',
      'Safely unfreeze SAP HANA when /hana/log reaches 100% due to a broken backup target.',
      'Diagnose and restore an Oracle listener outage without bouncing the database instance.',
      'Verify application recovery and ensure zero dropped transactions in SM13.',
      'Document the incident and configure permanent automated alerting thresholds.'
    ],
    technicalExplanation: `Today you execute Simulation 2, contrasting an emergency **SAP HANA Log Volume Freeze** with an **Oracle Listener Disconnection**.

**Simulation Workflow**:
1. **Scenario A (HANA)**:
   - System is frozen in \`LOG_BUFFER_WAIT\`.
   - \`/hana/log\` is 100% full.
   - You must identify why the automated log backup failed, restore the backup destination, trigger manual log flushing, and verify that the database resumes commits without an unplanned restart.

2. **Scenario B (Oracle)**:
   - Application servers cannot connect (\`R3trans\` returns 12; \`ORA-12541\`).
   - The database instance is verified to be in \`OPEN\` state.
   - You must check \`lsnrctl status\`, analyze why the listener dropped, restart the listener service, verify service registration, and validate that SAP work processes reconnect automatically.`,
    detailedStudyNotes: [
      'Golden Rule: Do not reboot a saturated database! Bouncing HANA with a full log volume aborts crash recovery.',
      'Oracle reconnect: SAP work processes automatically attempt database reconnection periodically (parameter dbs/ora/reconnect). Once the listener recovers, work processes will reconnect automatically within 60 seconds.',
      'Verify SM13: After resolving any database freeze, always check transaction SM13 for updates stuck in "Auto" or "Error" and reprocess them.'
    ],
    toolsAndCommands: [
      { name: 'DB12', type: 'transaction', description: 'DBA Backup Console in SAP GUI.' },
      { name: 'lsnrctl start', type: 'command', description: 'Starts the Oracle listener service.' },
      { name: 'SM13', type: 'transaction', description: 'Verify update task execution.' }
    ],
    productionScenario: {
      ticketId: 'INC-2026-08802',
      severity: 'P1',
      title: 'Database Outage Simulation: Storage Full vs Listener Crash',
      description: 'Execute timed drills in the Troubleshooting Lab: Scenario 4 (Oracle Listener) and Scenario 5 (HANA Log Volume).',
      systemContext: 'Production Database Tier.'
    },
    guidedInvestigation: [
      {
        step: 1,
        title: 'Launch Scenario 5 (HANA Log Volume) in Lab',
        instruction: 'Open Troubleshooting Lab -> Scenario 5.',
        expectedFinding: 'df -h shows /hana/log at 100%. backup.log reports destination unavailable.',
        interpretation: 'Redo log segments cannot be backed up, freezing all write transactions.'
      },
      {
        step: 2,
        title: 'Apply Safe Non-Destructive Remediation',
        instruction: 'Mount emergency backup storage, trigger BACKUP LOG in hdbsql.',
        expectedFinding: 'Log segments flushed to backup; /hana/log drops to 20%; transactions resume.',
        interpretation: 'Service restored with zero data loss and zero database downtime.'
      },
      {
        step: 3,
        title: 'Launch Scenario 4 (Oracle Listener) in Lab',
        instruction: 'Open Troubleshooting Lab -> Scenario 4.',
        expectedFinding: 'lsnrctl status reports "no listener"; database instance status is OPEN.',
        interpretation: 'Listener process crash; database engine intact.'
      }
    ],
    handsOnTask: {
      title: 'Complete Scenarios 4 and 5 in the Troubleshooting Lab',
      instructions: [
        'Execute both database scenarios in the Troubleshooting Lab.',
        'Document the contrasting remediation protocols.',
        'File an RCA report comparing both incidents.'
      ],
      deliverable: 'Completed lab scenarios and comparative RCA report.'
    },
    knowledgeCheck: [
      {
        id: 'w8d2_q1',
        question: 'When SAP HANA freezes due to /hana/log reaching 100%, what is the correct first action?',
        options: [
          'Reboot the server immediately.',
          'Restore or provide free disk space on the backup destination filesystem, then trigger a manual log backup to clear log segments.',
          'Delete the .log files with rm -rf.',
          'Drop the largest database table.'
        ],
        correctAnswer: 1,
        explanation: 'Freeing up the backup target allows the log backup engine to copy out closed segments, immediately releasing space on /hana/log.'
      },
      {
        id: 'w8d2_q2',
        question: 'If an Oracle listener crashes while the database instance remains OPEN, what happens to existing active database sessions?',
        options: [
          'All existing sessions crash immediately.',
          'Existing established sessions continue executing normally; only new incoming connection attempts will fail with ORA-12541 until the listener is restarted.',
          'The database datafiles are corrupted.',
          'The server loses power.'
        ],
        correctAnswer: 1,
        explanation: 'The listener only brokers the initial socket handshake. Once a session is established and handed off to a dedicated server process, the listener is no longer in the communication path.'
      }
    ],
    tasks: [
      { id: 't1', text: 'Execute Scenarios 4 and 5 in the Troubleshooting Lab.' },
      { id: 't2', text: 'Master non-destructive database storage full recovery.' },
      { id: 't3', text: 'Understand Oracle listener crash impact on active vs new sessions.' },
      { id: 't4', text: 'Complete the Day 2 Simulation knowledge check.' }
    ]
  },
  {
    id: 'w8d3',
    week: 8,
    day: 3,
    title: 'Incident Simulation 3: Severe Performance Degradation and Repeated Cluster Failover',
    topic: 'Advanced Triage Drill: Identifying Resource Flapping Root Causes and Disentangling Saturation',
    domain: 'simulations',
    durationMinutes: 60,
    learningObjectives: [
      'Triage an emergency involving concurrent performance collapse and cluster resource bouncing.',
      'Identify whether the performance degradation caused the cluster failover or vice versa.',
      'Freeze cluster flapping safely using maintenance mode properties.',
      'Track down database lock trees and slow queries throttling work processes.',
      'Validate full system stability before restoring automated cluster management.'
    ],
    technicalExplanation: `In this simulation, you confront one of the most challenging production scenarios: A massive performance slowdown that cascades into a cluster failover!

**The Cascading Incident Chain**:
1. A runaway analytical report executes an unconstrained sequential scan across 80 million rows on SAP HANA.
2. The query consumes 100% CPU and triggers massive memory allocation.
3. The host CPU and storage I/O saturate; I/O wait surges to 75%.
4. Pacemaker's periodic cluster health monitor (\`sapcontrol GetProcessList\`) takes 65 seconds to respond due to OS CPU starvation.
5. Pacemaker hits its 60-second monitor timeout and declares the node DEAD!
6. Pacemaker initiates failover and fences the primary node, abruptly dropping 1,200 active users!

**Your Mission**:
- Do not make the mistake of assuming the cluster software was at fault!
- Trace the timeline backwards to identify the initial rogue query that triggered CPU starvation and caused the cluster monitor to time out.`,
    detailedStudyNotes: [
      'Monitor timeouts vs genuine crashes: Distinguish whether the monitored process died or whether the monitor script timed out waiting for an oversubscribed operating system.',
      'Tune monitor timeouts: In production clusters hosting heavy databases, set monitor timeouts to at least 120-180 seconds to absorb transient load spikes.',
      'Implement statement memory limits: Setting statement_memory_limit prevents runaway queries from monopolizing the entire server.'
    ],
    toolsAndCommands: [
      { name: 'crm_mon -r1', type: 'command', description: 'Checks cluster resources and failure history.' },
      { name: 'crm resource maintenance <RSC> true', type: 'command', description: 'Freezes cluster failovers during crisis.' },
      { name: 'ST04', type: 'transaction', description: 'Database performance overview and expensive statements.' }
    ],
    productionScenario: {
      ticketId: 'INC-2026-08803',
      severity: 'P1',
      title: 'Performance Collapse Leading to Unplanned Cluster Failover',
      description: 'System response times surged to 45 seconds, followed 8 minutes later by an abrupt Pacemaker failover and node fencing.',
      systemContext: 'S/4HANA 2023 on 2-node Pacemaker cluster.'
    },
    guidedInvestigation: [
      {
        step: 1,
        title: 'Launch Scenario 7 in Troubleshooting Lab',
        instruction: 'Open Troubleshooting Lab -> Scenario 7.',
        expectedFinding: 'Failed action: monitor_60000 timed out after 60s. Node was fenced by SBD.',
        interpretation: 'Failover was triggered by a health probe timeout, not an SAP process abort.'
      },
      {
        step: 2,
        title: 'Investigate Cause of Monitor Delay in OS Metrics',
        instruction: 'Review vmstat and expensive SQL statements prior to failover.',
        expectedFinding: 'CPU was at 100% for 15 minutes due to custom report Z_INVENTORY_DUMP running 32 parallel threads.',
        interpretation: 'Runaway batch job starved the OS, preventing sapcontrol from answering the cluster probe within 60s.'
      },
      {
        step: 3,
        title: 'Formulate Comprehensive Prevention Plan',
        instruction: 'Document required fixes: configure statement_memory_limit, increase cluster monitor timeout to 120s, and throttle batch parallelism.',
        expectedFinding: 'Permanent safeguards prevent future performance spikes from triggering cluster failovers.',
        interpretation: 'Root cause addressed at both application and cluster configuration layers.'
      }
    ],
    handsOnTask: {
      title: 'Complete Scenario 7 and Draft RCA in Notebook',
      instructions: [
        'Execute Scenario 7 in the Troubleshooting Lab.',
        'Write the complete RCA report in the RCA Notebook.',
        'Define 3 concrete preventive action items.'
      ],
      deliverable: 'Completed lab simulation and recorded RCA.'
    },
    knowledgeCheck: [
      {
        id: 'w8d3_q1',
        question: 'How can a runaway reporting query in SAP cause an HA cluster to initiate an unexpected node failover?',
        options: [
          'The query sends an explicit "stop cluster" command to Linux.',
          'The query saturates 100% of CPU and disk I/O, causing the cluster resource monitor script to take longer than its configured timeout (e.g. 60s) to execute, which Pacemaker interprets as a node failure.',
          'The query drops the cluster configuration file.',
          'The query changes the IP address of the server.'
        ],
        correctAnswer: 1,
        explanation: 'Severe CPU or I/O starvation prevents administrative health probes from finishing within their timeout limits, triggering false-positive cluster failovers.'
      },
      {
        id: 'w8d3_q2',
        question: 'What configuration adjustment should be applied to prevent transient high-load spikes from triggering false cluster failovers?',
        options: [
          'Disable STONITH completely.',
          'Increase the cluster monitor operation timeout (e.g. from 60s to 120s or 180s) and configure resource limits (like statement_memory_limit) in the database.',
          'Uninstall Pacemaker.',
          'Delete the operating system syslog.'
        ],
        correctAnswer: 1,
        explanation: 'Tuning monitor timeouts provides resilience against transient load spikes while keeping the cluster fully protected by STONITH.'
      }
    ],
    tasks: [
      { id: 't1', text: 'Execute Scenario 7 in the Troubleshooting Lab.' },
      { id: 't2', text: 'Understand how resource starvation triggers false cluster failovers.' },
      { id: 't3', text: 'Master monitor timeout tuning and statement memory limits.' },
      { id: 't4', text: 'Complete the Day 3 Simulation knowledge check.' }
    ]
  },
  {
    id: 'w8d4',
    week: 8,
    day: 4,
    title: 'Incident Simulation 4: Failed Upgrade Phase and Post-Maintenance Validation',
    topic: 'Advanced Triage Drill: Recovering a Halting SUM Upgrade and Executing Post-Maintenance Sanity Verification',
    domain: 'simulations',
    durationMinutes: 60,
    learningObjectives: [
      'Isolate and remediate a critical failure in SUM during downtime phase execution.',
      'Execute a structured Post-Maintenance Validation protocol (SM51, SICK, ST22, SM13, SM58, RFCs, WebGUI).',
      'Verify that all background jobs and update processing resume normally after maintenance.',
      'Conduct end-user sanity sign-offs before declaring production open.',
      'Document the upgrade incident and capture lessons learned for future release cycles.'
    ],
    technicalExplanation: `The final simulation puts you in the driver's seat of an upgrade emergency: SUM halts in downtime, and you must resolve the error, complete post-processing, and execute the comprehensive **Post-Maintenance Sanity Validation Protocol**.

**The 10-Point Post-Maintenance Sanity Protocol**:
1. **SM51**: Verify all application servers are online, registered, and active.
2. **SICK**: Execute SAP Installation Consistency Check (checks profiles, codepages, kernel).
3. **SM21**: Inspect system log for startup abends or database warnings.
4. **ST22**: Confirm zero unexpected short dumps on initial user logons.
5. **SM12**: Verify lock table is clean without orphaned maintenance locks.
6. **SM13**: Confirm the update system is active (\`Update is active\`) and no backlogged errors exist.
7. **SM37**: Release suspended background batch jobs and verify job scheduler is running.
8. **SM58 / SMQ1 / SMQ2**: Verify transactional and queued RFCs are unblocked.
9. **SM59**: Perform connection tests on critical external RFC destinations.
10. **ICM / SICF / WebGUI**: Test HTTP/HTTPS ports, Fiori launchpad, and WebGUI logon.`,
    detailedStudyNotes: [
      'Never skip SICK: Transaction SICK is a simple 5-second check that validates kernel consistency and instance profile parameters. Catching errors in SICK prevents major surprises later.',
      'Release batch jobs: Remember that during maintenance, background jobs are typically suspended via report BTCTRNS1. After maintenance completes, run report BTCTRNS2 to release them!',
      'Check SM13 status: If someone forgot to reactivate the update task, users will enter orders and receive "Update system inactive" errors.'
    ],
    toolsAndCommands: [
      { name: 'SICK', type: 'transaction', description: 'SAP Installation Check: quick validation of basic system consistency.' },
      { name: 'SE38 -> BTCTRNS2', type: 'transaction', description: 'Releases batch jobs suspended prior to maintenance.' },
      { name: 'SM51', type: 'transaction', description: 'Checks all application server instances.' }
    ],
    productionScenario: {
      ticketId: 'INC-2026-08804',
      severity: 'P1',
      title: 'SUM Downtime Phase Failure - Resolve and Complete System Handover',
      description: 'Execute Troubleshooting Lab Scenario 8 (Failed Upgrade Phase). Resolve the error, complete the upgrade, and execute the full 10-point validation checklist.',
      systemContext: 'S/4HANA Upgrade Cutover.'
    },
    guidedInvestigation: [
      {
        step: 1,
        title: 'Launch Scenario 8 in Troubleshooting Lab',
        instruction: 'Open Troubleshooting Lab -> Scenario 8.',
        expectedFinding: 'SUM halted in phase MAIN_NEWVERS/STARTSYS_PRE. dev_disp reports space error.',
        interpretation: 'Instance cannot start due to work directory disk saturation during upgrade.'
      },
      {
        step: 2,
        title: 'Remediate Storage and Repeat Phase in SUM',
        instruction: 'Clean stale trace files in work directory and choose Repeat Phase in SUM.',
        expectedFinding: 'Instance starts; SUM resumes and advances cleanly to postprocessing.',
        interpretation: 'Primary failure cleared; upgrade reaches successful completion.'
      },
      {
        step: 3,
        title: 'Execute 10-Point Post-Maintenance Sanity Verification',
        instruction: 'Step through SM51, SICK, SM13, SM37 (BTCTRNS2), and WebGUI.',
        expectedFinding: 'All checks return GREEN; update system active; batch processing resumed.',
        interpretation: 'System fully verified and safe for production business opening.'
      }
    ],
    handsOnTask: {
      title: 'Execute Scenario 8 and Complete Post-Maintenance Validation',
      instructions: [
        'Complete Scenario 8 in the Troubleshooting Lab.',
        'Document the 10-point post-maintenance checklist.',
        'File the completed validation record in the RCA Notebook.'
      ],
      deliverable: 'Completed lab simulation and verified validation report.'
    },
    knowledgeCheck: [
      {
        id: 'w8d4_q1',
        question: 'Which ABAP report must be executed via SE38 after system maintenance to release background jobs that were suspended before maintenance?',
        options: ['BTCTRNS1', 'BTCTRNS2', 'RSCHECK', 'RDDNEWPP'],
        correctAnswer: 1,
        explanation: 'BTCTRNS1 suspends scheduled batch jobs prior to maintenance, and BTCTRNS2 releases them back to scheduled status once maintenance is complete.'
      },
      {
        id: 'w8d4_q2',
        question: 'What is the purpose of SAP transaction SICK?',
        options: [
          'It diagnoses physical illness in administrators.',
          'It executes the SAP Installation Consistency Check, validating basic profile parameters, codepages, and kernel consistency upon startup.',
          'It deletes expired user accounts.',
          'It orders new hardware from the vendor.'
        ],
        correctAnswer: 1,
        explanation: 'SICK (SAP Installation Consistency Check) verifies critical installation parameters, kernel prerequisites, and profile integrity.'
      }
    ],
    tasks: [
      { id: 't1', text: 'Execute Scenario 8 in the Troubleshooting Lab.' },
      { id: 't2', text: 'Master the 10-point post-maintenance validation protocol.' },
      { id: 't3', text: 'Understand BTCTRNS1 and BTCTRNS2 batch job management.' },
      { id: 't4', text: 'Complete the Day 4 Simulation knowledge check.' }
    ]
  },
  {
    id: 'w8d5',
    week: 8,
    day: 5,
    title: 'Final Academy Capstone: 40-Session Review and Personal Troubleshooting Playbook',
    topic: 'Academy Capstone: Comprehensive Curriculum Review, 4 Master RCA Audits, Personal Troubleshooting Playbook',
    domain: 'rca',
    durationMinutes: 60,
    learningObjectives: [
      'Synthesize the complete 8-week, 40-session Basis Command Center curriculum.',
      'Review and audit your 4 completed production RCA reports.',
      'Analyze your Quiz Center accuracy trends across all 8 technical domains.',
      'Formulate your personal, enduring SAP Basis Production Troubleshooting Playbook.',
      'Graduate from an operational Basis analyst to an authoritative, independent production troubleshooter.'
    ],
    technicalExplanation: `Congratulations on completing all 40 sessions of the SAP Basis Troubleshooting Academy.

**The Transformation**:
- You began with operational transaction knowledge (running SM50, checking DB12, restarting instances).
- You now command the entire multi-tier architecture:
  1. **Architecture & Startup**: sapstartsrv, ASCS/ERS dependencies, IPC shared memory allocation, message server handshakes.
  2. **Advanced Linux**: Inode exhaustion (df -i), unlinked open descriptors (lsof +L1), hidden bind-mounts, vmstat paging, ss socket diagnostics.
  3. **Databases**: HANA MDC internal memory pools (GAL), redo log backup stalls (/hana/log 100%), Oracle alert logs, tablespaces, and listener recovery.
  4. **ABAP Applications**: ST22 dump call stacks, SM12 lock tables, SM13 V1/V2 update failures, ST03N response time decomposition.
  5. **High Availability**: Pacemaker/Corosync dual-ring networks, quorum math, SBD/fencing mechanisms, anti-colocation (-INFINITY), HANA System Replication (sync vs async), maintenance mode freezes.
  6. **Upgrades & Maintenance**: SUM phase error isolation (first meaningful error), kernel patch replacement protocols (saproot.sh), SPAM/SAINT queues, HANA hdblcm fallback planning.
  7. **Cross-Layer RCA**: UTC timeline fusion, resource saturation metrics, multi-layer evidence triangulation, hypothesis elimination, and audit-ready CAPA authoring.

**Your Ongoing Playbook**:
The Command Reference, Troubleshooting Lab, Quiz Center, and RCA Notebook in this tool remain your lifetime personal workbench. Keep refining your notes, updating your commands, and tracking your real-world incident reports.`,
    detailedStudyNotes: [
      'Maintain your RCA library: Every production incident you handle in your career should be documented in your RCA Notebook. Over years, this becomes your most valuable technical asset.',
      'Continuous practice: Return to the Troubleshooting Lab monthly to keep your command-line triage reflexes sharp.',
      'Share knowledge: Teach your team. The best way to cement mastery is to mentor junior analysts in the structured triage methodology.'
    ],
    toolsAndCommands: [
      { name: 'RCA Notebook', type: 'tool', description: 'Personal incident report repository.' },
      { name: 'Command Reference', type: 'tool', description: 'Curated technical command library.' },
      { name: 'Progress Analytics', type: 'tool', description: 'Track curriculum completion and quiz mastery.' }
    ],
    productionScenario: {
      ticketId: 'CAPSTONE-FINAL-2026',
      severity: 'P1',
      title: 'Academy Capstone: Master Incident Audit and Playbook Formulation',
      description: 'Audit your completed curriculum, verify 100% course completion in Analytics, review your 4 master RCA reports, and finalize your Personal Troubleshooting Playbook.',
      systemContext: 'Basis Command Center Academy Graduation.'
    },
    guidedInvestigation: [
      {
        step: 1,
        title: 'Review Course Progress & Analytics Dashboard',
        instruction: 'Open the Progress & Analytics page from the sidebar.',
        expectedFinding: 'Verify completion status across all 8 weeks and review domain accuracy.',
        interpretation: 'Quantify your technical strengths and identify any domains requiring revision.'
      },
      {
        step: 2,
        title: 'Audit Your RCA Reports in RCA Notebook',
        instruction: 'Review your saved reports: verify that symptoms, evidence, hypotheses, root causes, and CAPA actions adhere to the 10 Golden Standards.',
        expectedFinding: '4 complete, audit-grade RCA reports stored in your personal notebook.',
        interpretation: 'Demonstrates professional competence suitable for executive presentation.'
      },
      {
        step: 3,
        title: 'Export Backup Archive of Your Learning Data',
        instruction: 'Go to Settings -> Export Progress Data and download your full JSON backup.',
        expectedFinding: 'Complete JSON archive containing your study notes, quiz scores, and RCA reports downloaded to disk.',
        interpretation: 'Your personal learning records and troubleshooting playbook are preserved.'
      }
    ],
    handsOnTask: {
      title: 'Finalize Your Personal Troubleshooting Playbook',
      instructions: [
        'Complete any unfinished daily tasks across the 40 sessions.',
        'Review the Weekly Review section for Week 8.',
        'Export your final data backup from Settings.'
      ],
      deliverable: 'A complete, graduated personal SAP Basis Troubleshooting Playbook.'
    },
    knowledgeCheck: [
      {
        id: 'w8d5_q1',
        question: 'What is the single most defining trait of a senior SAP Basis production troubleshooter?',
        options: [
          'Restarting the server as quickly as possible without collecting evidence.',
          'A structured, layered diagnostic methodology: gathering read-only evidence, proving causal order with timestamps, triangulating across tiers, and implementing permanent preventive fixes.',
          'Knowing how to type rm -rf with eyes closed.',
          'Memorizing every SAP GUI icon color.'
        ],
        correctAnswer: 1,
        explanation: 'True senior troubleshooting lies in disciplined methodology: isolating facts, proving causality with verifiable artifacts, and eliminating the root failure permanently.'
      },
      {
        id: 'w8d5_q2',
        question: 'Why should a technical RCA never state that the root cause was "Human error" or "Contractor made a mistake"?',
        options: [
          'Because contractors cannot make mistakes.',
          'True root causes are systemic: missing permissions, inadequate guardrails, lack of automated validation, poor documentation, or absent peer reviews that allowed the mistake to occur.',
          'Because HR prohibits it.',
          'Because computers do not make mistakes.'
        ],
        correctAnswer: 1,
        explanation: 'Blaming individuals fails to prevent recurrence. Systemic engineering improves guardrails, automation, and access controls so human error cannot cause catastrophic failure.'
      }
    ],
    tasks: [
      { id: 't1', text: 'Review all 8 curriculum weeks and complete outstanding session tasks.' },
      { id: 't2', text: 'Audit your 4 RCA reports in the RCA Notebook.' },
      { id: 't3', text: 'Review your Progress Analytics and domain mastery scores.' },
      { id: 't4', text: 'Export and save your full personal academy backup JSON.' }
    ]
  }
];

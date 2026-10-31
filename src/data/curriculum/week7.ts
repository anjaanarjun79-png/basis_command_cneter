import { CurriculumSession } from '../../types';

export const week7Sessions: CurriculumSession[] = [
  {
    id: 'w7d1',
    week: 7,
    day: 1,
    title: 'Constructing Incident Timelines Across Multi-Tier Logs',
    topic: 'Cross-Tier Event Fusion: SAP Traces, Linux Journal, Database Alert Logs, and Cluster Events',
    domain: 'rca',
    durationMinutes: 60,
    learningObjectives: [
      'Fuse timestamps from heterogeneous logs into a single unified chronological timeline.',
      'Normalize timezones (UTC vs Local Daylight Time) across SAP ABAP, HANA, Oracle, and Linux.',
      'Correlate system events down to the exact second to prove causal order (which event came first).',
      'Identify the trigger event that set off cascading multi-system warnings.',
      'Prevent the fallacy of attributing root cause to late-occurring secondary symptoms.'
    ],
    technicalExplanation: `The foundation of any defensible RCA is the **Chronological Event Timeline**. In multi-tier systems, the most visible failure is almost never the initiating event.

**The Multi-Tier Timeline Construction Protocol**:
1. **Timezone Normalization**:
   - Verify every log source's clock source:
     - Linux OS Syslog: Local time or UTC? (Check \`date +%Z\`).
     - SAP System Log (SM21): Server local time.
     - SAP Developer Traces: Local server time with microsecond stamp.
     - HANA Traces: UTC or local time as configured in \`global.ini\`.
     - Oracle Alert Log: UTC (default in 19c) with local offset.
   - Convert all entries into **UTC** before comparing!

2. **Event Fusion Order**:
   - Line up events in strict chronological sequence.
   - Example Analysis:
     - \`14:02:10 UTC [OS Syslog]\`: Storage path dropped on LUN 4.
     - \`14:02:15 UTC [Oracle Alert]\`: I/O error writing datafile 12. Checkpoint stalled.
     - \`14:02:22 UTC [SAP dev_w4]\`: DB-Error ORA-01115 (IO error reading block).
     - \`14:02:40 UTC [SAP SM50]\`: All 40 Dialog Work Processes entered PRIV / DB-Wait.
     - \`14:03:00 UTC [Monitoring]\`: Alert: "All SAP work processes exhausted".
   - **Conclusion**: The SAP work process exhaustion at 14:03 was NOT the cause; it was a cascading consequence of the storage path failure at 14:02:10!`,
    detailedStudyNotes: [
      'chrony / NTP synchronization: Always verify that all application, database, and storage controller nodes synchronize against the exact same NTP pool. A 5-second drift between hosts ruins timeline integrity.',
      'Watch for causality direction: If Event B happened at 10:04:12, it cannot have caused Event A which occurred at 10:04:08. Precise timelines eliminate impossible theories immediately.',
      'Include quiet periods: Documenting that "Between 08:00 and 09:30, all response times were normal (<800ms)" establishes a baseline proving the incident began abruptly.'
    ],
    toolsAndCommands: [
      { name: 'chronyc sources -v', type: 'command', description: 'Verifies NTP time synchronization status and server offset.' },
      { name: 'SM21', type: 'transaction', description: 'Central SAP system event log.' },
      { name: 'journalctl --since "..." --until "..."', type: 'command', description: 'Extracts Linux operating system events during an exact window.' }
    ],
    productionScenario: {
      ticketId: 'INC-2026-08701',
      severity: 'P1',
      title: 'Dispute Over Root Cause: Network Outage vs Database Crash',
      description: 'The network team claims the database crashed first, while the DBA claims the network switch failed first. Application servers disconnected and users were dropped.',
      systemContext: 'S/4HANA on HANA 2.0. Distributed 3-tier landscape.'
    },
    guidedInvestigation: [
      {
        step: 1,
        title: 'Extract Network Switch and Linux Sockets Logs',
        instruction: 'Review switch port logs and Linux kernel link carrier events.',
        expectedFinding: 'At 09:14:02.100 UTC, the core switch port connected to prd-hdb01 experienced link down/up flapping.',
        interpretation: 'Physical network connectivity dropped at 09:14:02.'
      },
      {
        step: 2,
        title: 'Extract HANA Database Logs Around Incident Window',
        instruction: 'Check indexserver trace for first error timestamp.',
        expectedFinding: 'At 09:14:04.220 UTC, HANA logged: "Client connection terminated unexpectedly: Broken pipe".',
        interpretation: 'The database was healthy and experienced sudden client disconnection 2.1 seconds AFTER the network switch dropped link.'
      },
      {
        step: 3,
        title: 'Synthesize Multi-Tier Timeline and Prove Root Cause',
        instruction: 'Align switch, Linux OS, HANA, and SAP dev_w* timestamps into a unified table.',
        expectedFinding: 'Switch link drop preceded all database errors and SAP disconnects by several seconds.',
        interpretation: 'Timeline indisputably proves that the network switch port flap was the root cause; database crash hypothesis ruled out.'
      }
    ],
    handsOnTask: {
      title: 'Build a Multi-Tier Incident Timeline Table',
      instructions: [
        'Take 4 separate log snippets (OS, DB, SAP, Cluster) with varying timezone formats.',
        'Normalize all timestamps to UTC.',
        'Construct a 5-column chronological incident table identifying trigger, cascade, and restoration points.'
      ],
      deliverable: 'A multi-tier timeline synthesis template.'
    },
    knowledgeCheck: [
      {
        id: 'w7d1_q1',
        question: 'Why is normalizing all log timestamps to a single reference timezone (such as UTC) mandatory before conducting root-cause analysis?',
        options: [
          'Because SAP GUI only displays in UTC.',
          'Different servers, operating systems, and databases often log in different local timezones or daylight saving offsets; without normalization, the causal sequence of events cannot be proven.',
          'To save disk storage space.',
          'Because Linux will delete logs that are not in UTC.'
        ],
        correctAnswer: 1,
        explanation: 'If a database logs in UTC while an OS logs in local EDT (UTC-4), an event occurring at 14:00 UTC looks like it happened 4 hours later than an OS event at 10:01 EDT unless normalized.'
      },
      {
        id: 'w7d1_q2',
        question: 'If an alert reports "All Dialog Work Processes exhausted in SM50" at 11:32:00, why should an engineer look for events prior to 11:32:00?',
        options: [
          'Work process exhaustion is almost always a secondary symptom of an earlier failure (e.g. database lock stall or storage freeze at 11:30:00) that blocked existing processes.',
          'Because previous logs are automatically archived.',
          'Because SAP timestamps are inverted.',
          'To see what time the server booted.'
        ],
        correctAnswer: 0,
        explanation: 'Processes do not exhaust themselves spontaneously; they get stuck waiting on an earlier upstream bottleneck, which holds them until the queue fills up.'
      }
    ],
    tasks: [
      { id: 't1', text: 'Understand timezone normalization to UTC across multi-tier logs.' },
      { id: 't2', text: 'Practice establishing causal order using sub-second timestamps.' },
      { id: 't3', text: 'Learn to separate initiating trigger events from cascading symptoms.' },
      { id: 't4', text: 'Complete the Day 1 RCA knowledge check.' }
    ]
  },
  {
    id: 'w7d2',
    week: 7,
    day: 2,
    title: 'Hardware and Resource Saturation: CPU, Memory, I/O Latency, and Swap',
    topic: 'Diagnosing Hardware Saturation Bottlenecks, I/O Wait (wa%), Memory Thrashing, and CPU Starvation',
    domain: 'rca',
    durationMinutes: 60,
    learningObjectives: [
      'Differentiate symptoms of CPU saturation, memory thrashing, I/O wait latency, and network throughput limits.',
      'Interpret disk latency metrics (await, svctm) from iostat and correlate with SAP DB request times.',
      'Analyze memory starvation chains: Free RAM drops -> Buffers evicted -> Swapping begins -> I/O wait surges -> System freezes.',
      'Diagnose virtual machine "Steal Time" (%st) in virtualized or cloud environments (Azure, AWS, VMware).',
      'Prove resource saturation root cause with quantitative metric charts.'
    ],
    technicalExplanation: `When hardware resources saturate, software components exhibit bizarre, cascading failures (timeouts, deadlocks, dropped heartbeats).

**The 4 Classical Resource Saturation Patterns**:

1. **CPU Saturation (User % vs System %)**:
   - High \`%us\` (>85%): Application code executing heavy algorithms (e.g. unindexed loops in ABAP or parallel HANA queries).
   - High \`%sy\` (>25%): Excessive kernel system calls, massive context switches, or IPC lock contention.
   - High \`%st\` (Steal Time > 5%): In cloud or virtualized VMs, the physical hypervisor CPU is oversubscribed; the host is stealing cycles from your VM!

2. **Storage I/O Saturation (%wa & await)**:
   - In \`top\`, \`%wa > 15%\` indicates the CPU is spending excessive time idle waiting for disk reads/writes.
   - Run \`iostat -x 1 5\`:
     - \`r_await\` / \`w_await\`: Total time for I/O requests. For SAP HANA data/log volumes, write latency must be **< 1.0 ms**!
     - If \`await > 20 ms\`, storage is severely bottlenecked, causing database commit freezes.

3. **Memory Saturation & Thrashing Chain**:
   - Step 1: Available physical RAM drops near zero.
   - Step 2: Linux flushes dirty buffer cache to disk.
   - Step 3: Linux begins swapping active anonymous memory pages to swap partition (\`si > 0\`, \`so > 0\` in \`vmstat\`).
   - Step 4: Swap I/O saturates the disk controller, driving \`%wa\` to 80%.
   - Step 5: Everything freezes; OOM-killer terminates processes.`,
    detailedStudyNotes: [
      'Steal Time (%st) in Cloud: If you observe high steal time in top on an Azure or AWS SAP instance, file a priority ticket with the cloud provider; the underlying physical host is overcommitted or experiencing hardware failure.',
      'Disk queue depth (avgqu-sz): If avgqu-sz is consistently high (>5 per disk) in iostat, storage requests are backing up faster than the SAN/SSD can service them.',
      'Network socket drops: Use netstat -s | grep -i "retransmitted" to detect TCP packet loss caused by saturated network links.'
    ],
    toolsAndCommands: [
      { name: 'iostat -xz 1 5', type: 'command', description: 'Reports extended disk I/O utilization, latency, and throughput per block device.' },
      { name: 'vmstat 1 5', type: 'command', description: 'Monitors process run queues, memory paging, and CPU state breakdown.' },
      { name: 'sar -q', type: 'command', description: 'Historical system activity reporter for run-queue length and load averages.' }
    ],
    productionScenario: {
      ticketId: 'INC-2026-08702',
      severity: 'P1',
      title: 'HANA Database Latency Spikes to 400ms - No High CPU Observed',
      description: 'SAP S/4HANA users experience 10-second response times. The DBA checked top and confirmed CPU usage is only 18%, concluding "the server is idle and healthy".',
      systemContext: 'HANA 2.0 on Azure M-series VM with Premium SSD v2.'
    },
    guidedInvestigation: [
      {
        step: 1,
        title: 'Inspect Extended CPU State in top and vmstat',
        instruction: 'Run vmstat 1 5 and check CPU columns.',
        expectedFinding: 'us: 4%, sy: 2%, id: 12%, wa: 82%. Runnable queue (r): 1, Blocked queue (b): 48.',
        interpretation: 'The CPU is not "idle"; 82% of its capacity is frozen waiting for disk I/O, while 48 processes are blocked in uninterruptible sleep (D-state).'
      },
      {
        step: 2,
        title: 'Check Storage I/O Latency via iostat',
        instruction: 'Run iostat -xz 1 5 and check device hosting /hana/log.',
        expectedFinding: 'Device sdc (/hana/log): %util is 100%, w_await is 68.4 ms (normal < 1.0 ms).',
        interpretation: 'The storage disk has hit IOPS or throughput throttling limits, causing redo log commits to take 68ms instead of 0.8ms.'
      },
      {
        step: 3,
        title: 'Verify Azure Disk Throttling Metrics',
        instruction: 'Check Azure Portal storage metrics for Disk Throttled Events.',
        expectedFinding: 'Provisioned IOPS was set to 5,000; active workload surged to 12,000 IOPS during heavy data load, triggering Azure throttling.',
        interpretation: 'The database host was choked by cloud disk IOPS throttling, proving the root cause is storage tier misconfiguration.'
      }
    ],
    handsOnTask: {
      title: 'Analyze iostat and vmstat Under Heavy Load',
      instructions: [
        'Examine an iostat log and identify which specific disk volume is suffering latency.',
        'Explain why a low CPU usage (%us < 10%) can coexist with a completely frozen system when I/O wait is high.',
        'Document the maximum allowable write latency for SAP HANA /hana/log volumes.'
      ],
      deliverable: 'A storage and CPU saturation diagnostic worksheet.'
    },
    knowledgeCheck: [
      {
        id: 'w7d2_q1',
        question: 'In top or vmstat output, what does an I/O Wait (%wa) value of 75% signify?',
        options: [
          'The server is 75% idle and has surplus processing power.',
          'The CPU is idle 75% of the time because it is waiting for slow or saturated disk/network storage to complete read/write operations.',
          'The server is waiting for 75 users to log in.',
          'The memory cache is 75% full.'
        ],
        correctAnswer: 1,
        explanation: '%wa indicates CPU cycles wasted waiting for outstanding disk or storage I/O requests. High wa% means storage is the bottleneck.'
      },
      {
        id: 'w7d2_q2',
        question: 'What is the standard SAP recommended maximum write latency for the SAP HANA redo log volume (/hana/log)?',
        options: ['1000 ms', '500 ms', 'Less than 1.0 millisecond', '30 seconds'],
        correctAnswer: 2,
        explanation: 'SAP HANA KPI benchmarks require write latency on the redo log volume to remain consistently below 1.0 ms to support high-throughput transactional commits.'
      }
    ],
    tasks: [
      { id: 't1', text: 'Learn to diagnose CPU state breakdown (us, sy, wa, st).' },
      { id: 't2', text: 'Understand iostat metrics (await, svctm, %util, avgqu-sz).' },
      { id: 't3', text: 'Study the memory exhaustion and swap thrashing chain.' },
      { id: 't4', text: 'Complete the Day 2 RCA knowledge check.' }
    ]
  },
  {
    id: 'w7d3',
    week: 7,
    day: 3,
    title: 'Cross-Layer Evidence Triangulation: SAP, Database, and OS Corroboration',
    topic: 'Triangulating Independent Evidence: Ensuring Hypotheses are Supported Across All 3 Tiers',
    domain: 'rca',
    durationMinutes: 60,
    learningObjectives: [
      'Master the technique of "Evidence Triangulation" across SAP, Database, and Operating System layers.',
      'Require that every valid RCA hypothesis find corroborating evidence in at least two independent tiers.',
      'Detect contradictory evidence that invalidates premature assumptions.',
      'Identify when an apparent failure in one tier is purely an artifact or reaction to an underlying tier.',
      'Formulate robust, unassailable technical RCA findings that satisfy internal auditors and architects.'
    ],
    technicalExplanation: `In multi-layer enterprise systems, single-source evidence is dangerous. An administrator who sees a message in SM21 might jump to conclusions, only to be humiliated when database traces reveal the opposite.

**The Principle of 3-Layer Evidence Triangulation**:
A root-cause hypothesis is only considered **CONFIRMED** when physical evidence from **at least two independent architectural layers** aligns without contradiction.

| Hypothesis | SAP Layer Evidence | Database Layer Evidence | OS / Hardware Layer Evidence |
|---|---|---|---|
| **Storage Failure** | dev_w* logs \`rc=28\` or \`DB-Error\` | Alert log records I/O timeout / write failure | Syslog records SCSI error or iostat reports \`await > 500ms\` |
| **Out-Of-Memory** | Dump \`TSV_TNEW_PAGE_ALLOC_FAILED\` | DB reports memory allocation error | \`dmesg\` logs Linux OOM-killer or vmstat shows swap thrash |
| **Lock Contention** | SM50 shows \`DB-Wait\`, SM12 shows lock | \`M_BLOCKED_TRANSACTIONS\` shows blocking thread | CPU is idle (\`wa=0\`, \`us<10%\`); no storage bottleneck |
| **Network Loss** | dev_disp logs \`NiConnect failed\` | DB alert log shows \`Broken pipe\` | \`journalctl\` shows link drop or \`ss\` shows connection reset |

**The Contradictory Evidence Test**:
- If an admin hypothesizes that "The database crashed due to high CPU load", but:
  - OS metrics show CPU was at 12%, AND
  - HANA alert trace shows "Terminated due to assertion failed in memory allocator",
- **The CPU hypothesis is completely contradicted and must be formally discarded!**`,
    detailedStudyNotes: [
      'Negative evidence is valuable: Proving that "There were zero hardware errors, zero network packet drops, and zero tablespace full conditions" is essential because it eliminates standard failure modes.',
      'Traceability: In your RCA report, link each statement of fact to its exact artifact: "As documented in dev_w0 line 412 and alert_PRD.log at 03:14:22 UTC".',
      'The "Blame Game" defense: When vendors or teams point fingers, triangulated multi-layer evidence objectively proves the true point of origin.'
    ],
    toolsAndCommands: [
      { name: 'ST04', type: 'transaction', description: 'Database performance and lock monitors from SAP GUI.' },
      { name: 'ST11', type: 'transaction', description: 'SAP developer traces.' },
      { name: 'dmesg -T', type: 'command', description: 'Linux kernel ring buffer with timestamps.' }
    ],
    productionScenario: {
      ticketId: 'INC-2026-08703',
      severity: 'P1',
      title: 'Disputed Incident: Out-Of-Memory vs Database Deadlock',
      description: 'The development team claims the system went down due to a database deadlock caused by Basis configuration. The Basis team suspects a memory leak from an unreleased batch program.',
      systemContext: 'S/4HANA 2022 on HANA 2.0.'
    },
    guidedInvestigation: [
      {
        step: 1,
        title: 'Check SAP Layer Evidence (ST22 & SM21)',
        instruction: 'Inspect ST22 dumps and SM21 entries at the crash timestamp 16:42:00.',
        expectedFinding: 'Zero deadlock dumps (no DEADLOCK_DETECTED). Instead, multiple TSV_TNEW_PAGE_ALLOC_FAILED dumps logged by user BATCH_DEV.',
        interpretation: 'SAP application layer indicates massive memory allocation failure, not a database deadlock.'
      },
      {
        step: 2,
        title: 'Check Database Layer Evidence (HANA Traces)',
        instruction: 'Inspect indexserver_alert_hana01.trc at 16:42:00.',
        expectedFinding: 'HANA reports: "Allocation failed: Global allocation limit reached. Process terminated child thread to recover memory".',
        interpretation: 'Database layer independently corroborates total memory exhaustion.'
      },
      {
        step: 3,
        title: 'Check OS Layer Evidence (vmstat & dmesg)',
        instruction: 'Inspect sar memory and dmesg on host prd-app01.',
        expectedFinding: 'dmesg confirms Linux kernel invoked oom-killer against runaway process PID 28109 (disp+work).',
        interpretation: 'Triangulation complete: SAP, DB, and OS evidence all prove Out-Of-Memory exhaustion; the developer deadlock theory is thoroughly debunked.'
      }
    ],
    handsOnTask: {
      title: 'Triangulate Evidence for a Multi-Tier Incident',
      instructions: [
        'Document the three required evidence sources to prove a storage outage beyond doubt.',
        'Explain how to document contradictory evidence in an RCA to officially eliminate false theories.',
        'Create an evidence triangulation matrix for a simulated network failure.'
      ],
      deliverable: 'A multi-tier evidence triangulation guide.'
    },
    knowledgeCheck: [
      {
        id: 'w7d3_q1',
        question: 'Why is evidence triangulation across at least two independent architectural tiers required before confirming an RCA root cause?',
        options: [
          'Because a single log file in isolation can show secondary reactions or misleading symptoms, while corroboration from multiple layers proves the actual causal chain.',
          'Because SAP software requires two approvals to close a ticket.',
          'To ensure the report has twice as many pages.',
          'Because Linux logs are never accurate.'
        ],
        correctAnswer: 0,
        explanation: 'Single-source logs often report cascading consequences. Corroborating evidence across application, DB, and OS tiers ensures the true trigger is confirmed.'
      },
      {
        id: 'w7d3_q2',
        question: 'If an initial hypothesis claims "Database was down", but R3trans -d connected successfully and the DB alert log shows uptime of 400 days without errors, what must be done with this hypothesis?',
        options: [
          'Keep it as confirmed.',
          'Formally reject it as contradicted by hard evidence, and pivot investigation to other layers (e.g. network or app profiles).',
          'Restart the database anyway.',
          'Delete the alert log.'
        ],
        correctAnswer: 1,
        explanation: 'Defensible RCA requires immediately eliminating hypotheses that are directly contradicted by verifiable facts.'
      }
    ],
    tasks: [
      { id: 't1', text: 'Master the 3-layer evidence triangulation framework.' },
      { id: 't2', text: 'Learn to use contradictory evidence to rule out false theories.' },
      { id: 't3', text: 'Practice linking log excerpts to claims in an RCA report.' },
      { id: 't4', text: 'Complete the Day 3 RCA knowledge check.' }
    ]
  },
  {
    id: 'w7d4',
    week: 7,
    day: 4,
    title: 'Hypothesis Testing, Ruling Out Alternative Causes, and Confidence Levels',
    topic: 'Rigorous RCA Methodology: Developing Hypotheses, Testing Against Evidence, Establishing Confidence Levels',
    domain: 'rca',
    durationMinutes: 60,
    learningObjectives: [
      'Formulate structured technical hypotheses using standard cause-and-effect format.',
      'Systematically test each hypothesis against observed evidence to prove or disprove it.',
      'Formally document alternative causes ruled out to demonstrate analytical thoroughness.',
      'Assign justified confidence levels: Confirmed (proven/reproduced), Probable (strong correlation), Unconfirmed.',
      'Defend RCA findings against technical challenges from management, developers, or vendors.'
    ],
    technicalExplanation: `An RCA that presents only one theory without discussing alternatives appears superficial. Senior architects expect a systematic demonstration of why other possibilities were investigated and eliminated.

**The Hypothesis Testing & Elimination Lifecycle**:

1. **Formulate Competing Hypotheses**:
   - For an incident where SAP instances abruptly abended:
     - *Hypothesis 1*: Storage failure caused filesystem remount read-only.
     - *Hypothesis 2*: Operating system OOM-killer terminated processes.
     - *Hypothesis 3*: Pacemaker cluster initiated an unprovoked fencing action.
     - *Hypothesis 4*: Administrator accidentally executed a stop script.

2. **Evaluate Evidence For and Against Each**:
   - *Testing H1*: \`findmnt /usr/sap\` shows filesystem is \`rw\`. \`touch /usr/sap/test\` succeeded. -> **H1 RULED OUT**.
   - *Testing H3*: \`crm_mon\` and \`/var/log/messages\` show zero fencing events; nodes remained online. -> **H3 RULED OUT**.
   - *Testing H4*: Shell audit logs (\`.bash_history\`, auditd) show no stop commands executed by \`<sid>adm\`. -> **H4 RULED OUT**.
   - *Testing H2*: \`dmesg -T\` shows \`Out of memory: Kill process 19280 (disp+work)\` at exact second of outage. \`sar -r\` shows RAM was at 99.8%. -> **H2 CONFIRMED!**

3. **Assigning Confidence Levels**:
   - **CONFIRMED**: Supported by direct primary evidence (e.g. kernel log entry, reproducible test, unambiguous error code).
   - **PROBABLE**: Strongly supported by circumstantial and temporal evidence, but exact trace line is missing (e.g. trace level was set too low).
   - **UNCONFIRMED**: Plausible explanation supported by symptoms, but insufficient data remains to eliminate other possibilities.`,
    detailedStudyNotes: [
      'Documenting ruled-out causes builds credibility: Stating in the RCA that "We thoroughly investigated hardware storage, network routes, and cluster fencing, and ruled them out based on exhibits A, B, and C" reassures leadership that no stone was left unturned.',
      'Never claim "Confirmed" without proof: Calling an unverified hunch a "Confirmed Root Cause" destroys professional credibility if the issue recurs next week.',
      'Audit trails: Ensure Linux auditd or SAP Security Audit Log (SM19/SM20) is enabled so user actions can be audited.'
    ],
    toolsAndCommands: [
      { name: 'SM20', type: 'transaction', description: 'Security Audit Log analysis: view administrative actions and transaction starts.' },
      { name: 'last -F', type: 'command', description: 'Displays system reboot history and user login/logout timestamps.' },
      { name: 'history | grep -i sap', type: 'command', description: 'Checks shell history for manual commands executed by admin.' }
    ],
    productionScenario: {
      ticketId: 'INC-2026-08704',
      severity: 'P1',
      title: 'Sudden Nightly System Outage - Suspicion of Unauthorized Human Error',
      description: 'At 01:15 UTC, the SAP production instance stopped completely. Management suspects a junior contractor logged in and ran "stopsap" by mistake.',
      systemContext: 'S/4HANA on RHEL 8.'
    },
    guidedInvestigation: [
      {
        step: 1,
        title: 'Audit User Logins and Shell History',
        instruction: 'Run last -F and check auditd logs around 01:15 UTC.',
        expectedFinding: 'Zero user logins occurred between 23:00 and 06:00. No interactive bash sessions active.',
        interpretation: 'Hypothesis of human operator running stopsap is completely ruled out.'
      },
      {
        step: 2,
        title: 'Inspect systemd Journal for Automated Unit Actions',
        instruction: 'Run journalctl --since "01:10:00" --until "01:20:00".',
        expectedFinding: 'At 01:14:58, logrotate triggered a custom script /etc/cron.daily/sap_clean containing a buggy command "killall disp+work".',
        interpretation: 'An unverified maintenance cron script placed by an OS automation tool triggered the process kill.'
      },
      {
        step: 3,
        title: 'Classify Confidence and Document Ruled-Out Theories',
        instruction: 'Document findings in RCA template with Confirmed rating.',
        expectedFinding: 'Confirmed: The kill command in /etc/cron.daily/sap_clean executed at 01:14:58 directly caused the stoppage.',
        interpretation: 'Evidence is conclusive, fully documented, and human error theory formally dismissed.'
      }
    ],
    handsOnTask: {
      title: 'Practice Hypothesis Testing and Elimination',
      instructions: [
        'Formulate 3 distinct hypotheses for a sudden database disconnection.',
        'List the specific commands and log evidence required to rule out each hypothesis.',
        'Write the "Alternative Causes Ruled Out" section of a production RCA report.'
      ],
      deliverable: 'A hypothesis testing worksheet for production RCA.'
    },
    knowledgeCheck: [
      {
        id: 'w7d4_q1',
        question: 'Under what circumstances should an RCA report assign a confidence level of "Probable" rather than "Confirmed"?',
        options: [
          'When the engineer is 100% certain and has direct log proof.',
          'When circumstantial and temporal evidence strongly point to the cause, but missing debug logs or concurrency prevent absolute, definitive proof.',
          'Whenever the incident happens on a weekend.',
          'Only when Oracle is the database.'
        ],
        correctAnswer: 1,
        explanation: 'Probable indicates strong alignment and high likelihood, but without the absolute mathematical or log-level proof required for "Confirmed".'
      },
      {
        id: 'w7d4_q2',
        question: 'Why is it valuable to include an "Alternative Causes Ruled Out" section in an enterprise RCA report?',
        options: [
          'It fills up empty space on the report.',
          'It proves to architects, auditors, and management that all plausible contributing factors were methodically investigated and disproven with hard data.',
          'It allows admins to blame other departments.',
          'It makes the incident ticket close automatically.'
        ],
        correctAnswer: 1,
        explanation: 'Documenting ruled-out causes demonstrates thorough engineering rigor and prevents stakeholders from proposing already-disproven theories.'
      }
    ],
    tasks: [
      { id: 't1', text: 'Master structured hypothesis formulation and testing.' },
      { id: 't2', text: 'Learn to define confidence levels: Confirmed, Probable, Unconfirmed.' },
      { id: 't3', text: 'Practice writing the Alternative Causes Ruled Out section.' },
      { id: 't4', text: 'Complete the Day 4 RCA knowledge check.' }
    ]
  },
  {
    id: 'w7d5',
    week: 7,
    day: 5,
    title: 'Completing a Professional Multi-Layer Root-Cause Analysis (RCA) Report',
    topic: 'End-to-End RCA Capstone: Synthesizing Evidence, Executive Summary, CAPA Action Items, and Quality Checklist',
    domain: 'rca',
    durationMinutes: 60,
    learningObjectives: [
      'Synthesize all technical findings into a polished, professional enterprise RCA report.',
      'Author an Executive Summary that explains complex technical failures clearly to non-technical business leaders.',
      'Structure the CAPA (Corrective and Preventive Actions) section with specific owners, tasks, and deadlines.',
      'Audit an RCA report against the 10 Golden Standards of Production Root-Cause Analysis.',
      'Export and archive the completed RCA in markdown and JSON formats for audit readiness.'
    ],
    technicalExplanation: `The final step of incident resolution is publishing the formal Root Cause Analysis (RCA) report. This document represents your engineering credibility.

**The 8 Required Sections of an Enterprise-Grade RCA**:
1. **Incident Summary**: SID, Instance, Start/End Time, Total Outage Duration, Business Impact (orders lost, plants stopped).
2. **Executive Summary**: 2-3 non-technical paragraphs explaining what happened, why it happened, how it was fixed, and how it will be prevented.
3. **Chronological Incident Timeline**: Tabular, UTC-normalized sequence of events from trigger to recovery.
4. **Initial Evidence & Symptoms**: Process states, developer trace snippets, OS syslog lines.
5. **Investigation & Alternative Causes Ruled Out**: Competing hypotheses tested and eliminated with supporting exhibits.
6. **Confirmed Root Cause**: The fundamental flaw that initiated the failure. Confidence level assigned.
7. **Resolution & Validation**: Corrective actions taken during crisis, risk assessment, recovery validation tests performed.
8. **Corrective & Preventive Action Plan (CAPA)**:
   - Action item description.
   - Type (Monitoring, Architecture, Housekeeping, Training).
   - Responsible Owner.
   - Target Completion Date.

**The Golden Rule of Prevention**:
A prevention item must NEVER simply be "Monitor the system more closely" or "Be more careful".
It must be a concrete architectural improvement: e.g., *"Implement automated cron script with alerting threshold at 80% inode capacity"* or *"Configure statement_memory_limit in global.ini to prevent rogue analytical queries from consuming >100GB RAM"*!`,
    detailedStudyNotes: [
      'Write for two audiences: Technical peers will scrutinize the developer traces and SQL parameters; C-level executives will read only the Executive Summary and the CAPA table. Both must be flawless.',
      'Validation proof: Always include positive proof of validation (e.g. "SM21 shows clean startup; SM04 confirms 450 users active; test order 9001 posted successfully in VA01").',
      'Use the RCA Notebook tool: Use the built-in RCA Notebook in this command center to draft, format, tag, and export your reports.'
    ],
    toolsAndCommands: [
      { name: 'RCA Notebook', type: 'tool', description: 'Built-in incident report authoring, tracking, and export suite.' },
      { name: 'SM04', type: 'transaction', description: 'Active user list: verify user sessions following service recovery.' },
      { name: 'SICK', type: 'transaction', description: 'SAP Installation Check: quick validation of basic system consistency.' }
    ],
    productionScenario: {
      ticketId: 'INC-2026-08705',
      severity: 'P1',
      title: 'Multi-Layer Capstone Incident: Storage Degradation Leading to SAP Freeze',
      description: 'Synthesize the entire week’s methodology to write the final, authoritative RCA for a complex multi-layer outage where SAN storage latency caused database archive stalls, cascading into total SAP work process exhaustion.',
      systemContext: 'Enterprise Multi-Tier Landscape (SAP NetWeaver + Oracle + Linux SAN).'
    },
    guidedInvestigation: [
      {
        step: 1,
        title: 'Review All Evidence Streams in RCA Notebook',
        instruction: 'Gather the SAN latency metrics (iostat await > 80ms), Oracle alert log (ORA-00257 archiver freeze), and SAP dev_w* traces.',
        expectedFinding: 'All artifacts are captured and aligned to UTC timestamps.',
        interpretation: 'Comprehensive evidence available across all 3 tiers.'
      },
      {
        step: 2,
        title: 'Draft the Executive Summary and Root Cause',
        instruction: 'Compose a concise technical explanation clearly separating the initiating storage defect from the cascading application symptoms.',
        expectedFinding: 'Confirmed root cause: SAN firmware bug throttled write throughput, causing archivelog destination saturation.',
        interpretation: 'Executive summary clearly explains cause and effect to leadership.'
      },
      {
        step: 3,
        title: 'Define Actionable Preventive Measures (CAPA)',
        instruction: 'Formulate 3 actionable prevention items with owners and due dates.',
        expectedFinding: '1. Storage firmware patch. 2. Automated brarchive alert at 75% threshold. 3. Secondary archive destination configuration.',
        interpretation: 'CAPA items permanently eliminate recurrence vulnerability.'
      }
    ],
    handsOnTask: {
      title: 'Complete and Export Full Production RCA in RCA Notebook',
      instructions: [
        'Open the RCA Notebook from the sidebar.',
        'Author the complete RCA report for the Week 7 Capstone Incident.',
        'Verify that all 8 sections are populated with professional-grade technical content.',
        'Export the report as Markdown and JSON backup.'
      ],
      deliverable: 'A finalized, exported production RCA report.'
    },
    knowledgeCheck: [
      {
        id: 'w7d5_q1',
        question: 'Which of the following represents a professionally acceptable Preventive Action (CAPA) in an RCA report?',
        options: [
          '"Admins should try not to let disks fill up."',
          '"Implement automated monitoring with alerts at 80% disk capacity, and configure automated log deletion cron job executing brarchive -sd every 2 hours."',
          '"Reboot the server whenever it feels slow."',
          '"Ask users to stop creating so many sales orders."'
        ],
        correctAnswer: 1,
        explanation: 'Effective preventive actions must be concrete, automated, measurable, and systemic rather than vague aspirations.'
      },
      {
        id: 'w7d5_q2',
        question: 'Why should an Executive Summary in an RCA report avoid deeply nested technical jargon?',
        options: [
          'Because executives do not know what SAP stands for.',
          'Business stakeholders and leadership need a clear, high-level understanding of business impact, root cause, and preventive investment without getting lost in kernel trace lines.',
          'Because technical terms are forbidden by ITIL.',
          'To make the report shorter.'
        ],
        correctAnswer: 1,
        explanation: 'The Executive Summary serves non-technical business leaders and directors who make budget, architecture, and governance decisions based on the report.'
      }
    ],
    tasks: [
      { id: 't1', text: 'Master the 8 required sections of an enterprise RCA report.' },
      { id: 't2', text: 'Learn to write actionable CAPA prevention items with owners and dates.' },
      { id: 't3', text: 'Draft and finalize the Capstone RCA in the RCA Notebook.' },
      { id: 't4', text: 'Complete the Week 7 summary knowledge check.' }
    ]
  }
];

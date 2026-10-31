import { CurriculumSession } from '../../types';

export const week1Sessions: CurriculumSession[] = [
  {
    id: 'w1d1',
    week: 1,
    day: 1,
    title: 'SAP Architecture and Critical Component Dependencies',
    topic: 'ASCS, PAS/AAS, Dispatcher, Work Processes, Message Server, Enqueue, SAP Host Agent, and Request Flow',
    domain: 'architecture',
    durationMinutes: 60,
    learningObjectives: [
      'Deconstruct the multi-tier SAP NetWeaver / S/4HANA application server architecture.',
      'Differentiate ASCS (Message Server + Enqueue Server) from Primary Application Server (PAS) and Additional Application Servers (AAS).',
      'Trace request life cycles from browser/GUI through SAP Web Dispatcher, PAS Dispatcher, and dedicated Work Processes (DIA, UPD, BGD, SPO).',
      'Map operating system dependencies, shared filesystems (/sapmnt, /usr/sap), and database connectivity layers.',
      'Diagnose startup dependencies and identify catastrophic single points of failure (SPOFs).'
    ],
    technicalExplanation: `The modern SAP NetWeaver AS ABAP (and S/4HANA) architecture separates central messaging and locking services from compute-heavy processing nodes.

1. **ASCS (ABAP Central Services)**:
   - **Message Server (ms)**: Coordinates communication across all application server instances, performs logon load balancing, and maintains the cluster topology. Listen ports: HTTP(S) \`8100/8101\`, internal binary \`39<instance_nr>\`, RFC \`36<instance_nr>\`.
   - **Standalone Enqueue Server (ENQ/ENQ2)**: Manages the central SAP lock table in memory to guarantee database consistency without locking entire DB rows. Without Enqueue, no SAP transaction can acquire an edit lock.

2. **Application Server Instances (PAS / AAS)**:
   - **Dispatcher (disp+work)**: Listens for user requests (via NI protocol port \`32<instance_nr>\` or HTTP/HTTPS via ICM) and delegates tasks to available Work Processes via shared memory queues.
   - **Work Processes (WPs)**:
     - **DIA (Dialog)**: Handles interactive end-user requests (maximum runtime enforced by \`rdisp/max_wprun_time\`).
     - **UPD / UP2 (Update)**: Executes asynchronous V1/V2 database commits triggered by COMMIT WORK.
     - **BGD (Background)**: Executes batch jobs scheduled via SM36/SM37.
     - **SPO (Spool)**: Formats and routes output to print daemons or PDF converters.
   - **ICM (Internet Communication Manager)**: Handles direct HTTP/HTTPS/WebSocket traffic into the instance.
   - **Gateway (gwrd)**: Enables RFC communication between SAP systems and external RFC programs.

3. **SAP Host Agent**:
   - Runs independently as root/sapadm via \`saphostexec\` on port 1128 (HTTP) and 1129 (HTTPS). Supplies hardware, OS, and SAP instance metrics to SAP Solution Manager, Focused Run, and cloud monitoring tools.`,
    detailedStudyNotes: [
      'The Enqueue Server is a critical dependency: If the Enqueue Server terminates and there is no Enqueue Replication Server (ERS) or Pacemaker cluster failover, all instances abort and lock tables are lost.',
      'Shared Filesystems: /sapmnt/<SID> must be mounted across all application servers. Instance directories (/usr/sap/<SID>/<INSTANCE>) should reside on local high-performance storage.',
      'Message Server registration: Each PAS/AAS registers itself with the Message Server at startup. If parameter rdisp/mshost or ms/http_port is misconfigured or blocked by a firewall, the application server will fail to initialize or drop out of SM51.',
      'Work process states: WAIT (idle waiting for task), RUN (actively executing ABAP), HOLD (temporarily retaining a work process for debug/RFC/exclusive access), PRIV (allocated private memory exceeding quota).'
    ],
    toolsAndCommands: [
      { name: 'SM51', type: 'transaction', description: 'Overview of all active SAP application server instances in the system landscape.' },
      { name: 'SM50', type: 'transaction', description: 'Local instance work process overview showing status, program, client, and user.' },
      { name: 'SM66', type: 'transaction', description: 'Global work process overview showing active dialog and background processes across all servers.' },
      { name: 'sapcontrol -nr <NR> -function GetProcessList', type: 'command', syntax: 'sapcontrol -nr 00 -function GetProcessList', description: 'Queries sapstartsrv for the status of disp+work, msg_server, enq_server, etc.' },
      { name: 'R3trans -d', type: 'command', syntax: 'R3trans -d', description: 'Tests direct database connectivity from the OS level without starting the SAP application.' }
    ],
    productionScenario: {
      ticketId: 'INC-2026-08101',
      severity: 'P1',
      title: 'Global SAP GUI and WebGUI Logons Refused After Maintenance',
      description: 'Users report "WSAECONNREFUSED - Connection refused" when launching SAP GUI. Web Dispatcher URL responds with 503 Service Unavailable. ASCS instance appears running at OS level, but no user can connect to PRD.',
      systemContext: 'S/4HANA 2023 on SUSE Linux Enterprise Server 15 SP5 with HANA 2.0 SPS07. ASCS instance 01, PAS instance 00.'
    },
    guidedInvestigation: [
      {
        step: 1,
        title: 'Check Instance Process Health via sapcontrol',
        instruction: 'Run sapcontrol -nr 00 -function GetProcessList on the PAS host as <sid>adm.',
        expectedFinding: 'disp+work is STOPPED or GRAY. msg_server on ASCS is GREEN.',
        interpretation: 'The ASCS message server is reachable, but the PAS dispatcher failed to stay running.'
      },
      {
        step: 2,
        title: 'Inspect Dispatcher Trace File dev_disp',
        instruction: 'Navigate to /usr/sap/<SID>/<INSTANCE>/work and inspect the latest entries in dev_disp.',
        expectedFinding: '*** ERROR => DpSysInit: NiConnect to message server failed (ms_host: prd-ascs, port: 3901)',
        interpretation: 'The dispatcher cannot establish socket communication with the central message server on port 3901.'
      },
      {
        step: 3,
        title: 'Verify Network and Firewall Port 3901',
        instruction: 'Execute nc -zv prd-ascs 3901 or curl -v telnet://prd-ascs:3901 from the PAS server.',
        expectedFinding: 'Connection timed out or connection refused.',
        interpretation: 'Network route or security group / firewall change made during maintenance blocked the internal binary communication port.'
      }
    ],
    handsOnTask: {
      title: 'Map Architecture Dependencies and Ports',
      instructions: [
        'Diagram the communication flow between SAP GUI, Web Dispatcher, ASCS, PAS, and SAP HANA.',
        'Document the port formula for SAP instances: 32<NR> for dispatcher, 33<NR> for gateway, 36<NR> for message server RFC, 39<NR> for message server internal.',
        'List 3 critical failure consequences if the Enqueue server crashes in a non-HA landscape.'
      ],
      deliverable: 'A written breakdown of the SAP port matrix and failure dependency tree.'
    },
    knowledgeCheck: [
      {
        id: 'w1d1_q1',
        question: 'Which SAP central service is solely responsible for maintaining transient SAP logical lock arguments (lock table)?',
        options: ['Message Server', 'Enqueue Server', 'Web Dispatcher', 'Internet Communication Manager (ICM)'],
        correctAnswer: 1,
        explanation: 'The Enqueue Server manages the lock table in shared memory to ensure logical lock requests (enqueues) avoid conflicting data changes.'
      },
      {
        id: 'w1d1_q2',
        question: 'If disp+work fails to start on PAS with "NiConnect to message server failed", what is the most likely initial root cause?',
        options: [
          'The database transaction log is 100% full.',
          'The PAS cannot communicate with the ASCS message server over the configured network port (e.g. 39<nr>).',
          'The developer trace dev_w0 has invalid permissions.',
          'The user has an expired SAP GUI license.'
        ],
        correctAnswer: 1,
        explanation: 'At startup, the dispatcher must register itself with the message server. If DNS, /etc/hosts, firewall rules, or message server status prevent communication on port 39<nr>, startup aborts.'
      }
    ],
    tasks: [
      { id: 't1', text: 'Review ASCS vs PAS component boundaries and work process definitions.' },
      { id: 't2', text: 'Memorize the port formulas: 32<NN>, 33<NN>, 36<NN>, 39<NN>, and 1128/1129.' },
      { id: 't3', text: 'Inspect sapcontrol GetProcessList output syntax and exit codes.' },
      { id: 't4', text: 'Complete the 2-question architectural knowledge check.' }
    ]
  },
  {
    id: 'w1d2',
    week: 1,
    day: 2,
    title: 'SAP Startup Architecture, sapstartsrv, and sapcontrol',
    topic: 'sapstartsrv, sapcontrol, Instance Profiles, Startup Sequence, Process States',
    domain: 'architecture',
    durationMinutes: 60,
    learningObjectives: [
      'Master the mechanics of sapstartsrv, the Web Service daemon controlling SAP instances.',
      'Execute and interpret sapcontrol management functions (Start, Stop, GetProcessList, GetSystemInstanceList).',
      'Analyze the SAP startup sequence: OS boot -> sapstartsrv -> ASCS -> Database -> PAS -> AAS.',
      'Understand START and DEFAULT profiles, parameter inheritance, and syntax validation.',
      'Safely verify instance state before declaring a system available for business processing.'
    ],
    technicalExplanation: `Every SAP instance is governed by \`sapstartsrv\`, an OS-level daemon started via systemd or init scripts during host startup.

1. **sapstartsrv Operating Mechanics**:
   - Listens on port \`5<instance_nr>13\` (HTTP) and \`5<instance_nr>14\` (HTTPS / SSL), as well as a local UNIX domain socket \`/tmp/.sapstream5<instance_nr>13\`.
   - Runs as user \`<sid>adm\` and reads the instance profile: \`/sapmnt/<SID>/profile/<SID>_<Instance>_<Host>\`.
   - Exposes standard SOAP API methods invoked via \`sapcontrol\` or SAP Management Console (SAP MMC / MC).

2. **Standard Startup Sequence**:
   - Step 1: Database started and verified OPEN / ACTIVE (HANA: \`HDB start\`, Oracle: \`sqlplus / as sysdba -> startup\`).
   - Step 2: ASCS instance started (\`sapcontrol -nr <ASCS_NR> -function Start\`).
   - Step 3: Enqueue and Message Server reach GREEN status.
   - Step 4: Primary Application Server (PAS) started (\`sapcontrol -nr <PAS_NR> -function Start\`).
   - Step 5: Additional Application Servers (AAS) started.

3. **sapcontrol Key Syntax**:
   \`\`\`bash
   # Check status without password via local UNIX socket
   sapcontrol -nr 00 -function GetProcessList

   # Start instance with auto-wait
   sapcontrol -nr 00 -function Start

   # Check cluster/system wide topology
   sapcontrol -nr 00 -function GetSystemInstanceList
   \`\`\`

4. **Process State Definitions in sapcontrol**:
   - **GRAY**: Stopped cleanly or not yet initiated.
   - **GREEN**: Running normally and answering health probes.
   - **YELLOW**: Starting up, shutting down, or in degraded state.
   - **RED**: Process terminated unexpectedly, abended, or failed startup prerequisites.`,
    detailedStudyNotes: [
      'Authentication: sapcontrol can be executed without password prompt when executed by <sid>adm locally on the Linux server because it connects through the local UNIX domain socket /tmp/.sapstream5<NR>13 owned by <sid>adm.',
      'Clean stop procedure: Always stop application instances (AAS first, then PAS) before stopping ASCS. Never stop the Database while application servers are still actively connected.',
      'sapstartsrv stuck state: Occasionally sapstartsrv hangs or fails to bind its port. To safely restart it: sapcontrol -nr <NR> -function RestartService or kill the specific sapstartsrv PID and allow systemd to respawn it.',
      'Parameter changes: Profile changes made in DEFAULT.PFL or instance profiles require a restart of the corresponding instance to take effect.'
    ],
    toolsAndCommands: [
      { name: 'sapcontrol -nr <NR> -function GetProcessList', type: 'command', description: 'Returns name, description, dispstatus, textstatus, pid, and elapsed time.' },
      { name: 'sapcontrol -nr <NR> -function Start', type: 'command', description: 'Initiates instance startup in background.' },
      { name: 'sapcontrol -nr <NR> -function Stop', type: 'command', description: 'Gracefully halts the instance.' },
      { name: 'sapcontrol -nr <NR> -function ParameterValue <PARAM>', type: 'command', description: 'Queries active or configured profile parameter values.' },
      { name: 'ps -ef | grep sap', type: 'command', description: 'Linux OS command to inspect running processes under sapadm and <sid>adm.' }
    ],
    productionScenario: {
      ticketId: 'INC-2026-08102',
      severity: 'P2',
      title: 'AAS02 Fails to Start Following Kernel Patch',
      description: 'Junior admin updated the SAP kernel on host prd-app02. Running "startsap" or "sapcontrol Start" appears to trigger the command, but GetProcessList immediately returns dispstatus GRAY for disp+work.',
      systemContext: 'AAS02 on RHEL 8.8. Kernel 7.89 PL 200.'
    },
    guidedInvestigation: [
      {
        step: 1,
        title: 'Check sapcontrol GetProcessList for AAS02',
        instruction: 'Execute sapcontrol -nr 02 -function GetProcessList.',
        expectedFinding: 'disp+work: dispstatus GRAY, textstatus "Stopped", exitcode 1.',
        interpretation: 'The process attempted to spawn but failed early in initialization.'
      },
      {
        step: 2,
        title: 'Review sapstartsrv Log and Start Log',
        instruction: 'Inspect /usr/sap/<SID>/<INSTANCE>/work/sapstartsrv.log and sapstart.log.',
        expectedFinding: 'Cannot execute /usr/sap/PRD/SYS/exe/run/disp+work: Permission denied.',
        interpretation: 'During the kernel copy, file permissions or ownership on the executable were modified or root setuid was missing.'
      },
      {
        step: 3,
        title: 'Inspect Permissions of Executable Files',
        instruction: 'Execute ls -l /usr/sap/PRD/SYS/exe/run/disp+work and check ownership.',
        expectedFinding: '-rwxr-xr-- owned by root:root without execute rights for <sid>adm or sapadm.',
        interpretation: 'saproot.sh was not executed after the kernel patch to set proper ownership and setuid permissions.'
      }
    ],
    handsOnTask: {
      title: 'Simulate sapcontrol Commands and Analyze Exit Codes',
      instructions: [
        'Write out the exact sapcontrol command sequence to gracefully stop an entire 3-tier SAP system.',
        'Detail why saproot.sh is required after applying an SAP kernel patch on Linux.',
        'List the default sapcontrol HTTP and HTTPS port for instance number 05.'
      ],
      deliverable: 'A standard operating procedure (SOP) document for clean SAP startup/shutdown sequences.'
    },
    knowledgeCheck: [
      {
        id: 'w1d2_q1',
        question: 'Which network port is used by default for sapstartsrv HTTPS communication on instance number 03?',
        options: ['3203', '50313', '50314', '3603'],
        correctAnswer: 2,
        explanation: 'sapstartsrv uses port 5<instance_nr>13 for HTTP and 5<instance_nr>14 for HTTPS. For instance 03, this is 50314.'
      },
      {
        id: 'w1d2_q2',
        question: 'Why does sapcontrol -nr <NR> -function GetProcessList work without a password when executed by <sid>adm locally?',
        options: [
          'It connects via an unauthenticated open telnet daemon.',
          'It communicates via a secure local UNIX domain socket (/tmp/.sapstream5<NR>13) owned by <sid>adm.',
          'The password is hardcoded in the kernel binary.',
          'Linux disables authentication for all commands starting with sap.'
        ],
        correctAnswer: 1,
        explanation: 'Local UNIX domain socket communication allows OS-level authentication based on file system user ownership (/tmp/.sapstream5<NR>13).'
      }
    ],
    tasks: [
      { id: 't1', text: 'Study sapstartsrv architecture, SOAP API, and listening ports.' },
      { id: 't2', text: 'Document the correct order of operations for multi-system maintenance.' },
      { id: 't3', text: 'Learn why saproot.sh is essential for br*tools and kernel binaries.' },
      { id: 't4', text: 'Complete the Day 2 knowledge check.' }
    ]
  },
  {
    id: 'w1d3',
    week: 1,
    day: 3,
    title: 'SAP Developer Traces, Log Timestamps, and Error Correlation',
    topic: 'dev_disp, dev_w*, dev_ms, Start Logs, Timestamp Alignment, and Systematic Correlation',
    domain: 'architecture',
    durationMinutes: 60,
    learningObjectives: [
      'Locate and navigate the SAP work directory (/usr/sap/<SID>/<INSTANCE>/work).',
      'Distinguish the roles of dev_disp, dev_w<NR>, dev_ms, dev_rd, and dev_icm.',
      'Correlate system events using UTC and local timestamps across application and OS logs.',
      'Identify critical trace keywords: "MtxInit", "DpShmCreate", "NiConnect", "DB-Error", and "ABAP Dump".',
      'Manage trace level verbosity (parameter rdisp/TRACE) safely without filling the filesystem.'
    ],
    technicalExplanation: `When an SAP component behaves unexpectedly, developer trace files in the instance \`work\` directory provide the ground truth.

1. **Developer Trace File Inventory**:
   - \`dev_disp\`: The Dispatcher trace. Logs memory allocation (IPC, SHM), work process management, message server handshake, and dispatcher abends.
   - \`dev_w<NR>\`: Work process trace (e.g. \`dev_w0\`, \`dev_w1\`). Records SQL execution, database connection handshakes, roll in/roll out, and fatal ABAP aborts.
   - \`dev_ms\`: Message Server trace (in the ASCS work directory). Logs instance registrations, heartbeats, and logon groups.
   - \`dev_rd\`: Gateway reader trace. Captures RFC authorization failures and remote destination issues.
   - \`dev_icm\`: ICM trace. Records HTTP/HTTPS port bindings, SSL handshake negotiations, and thread pooling.

2. **Timestamp Alignment & The Microsecond Rule**:
   - SAP logs record timestamps down to microsecond precision, usually formatted as \`YYYY-MM-DD HH:MM:SS.mmm\`.
   - Critical: Verify whether OS system time, database time, and SAP server time are synchronized via NTP / chrony. A 10-second skew can lead an analyst to look at the wrong trace block!

3. **Interpreting Return Codes in Traces**:
   - \`rc = 28\`: Linux ENOSPC ("No space left on device").
   - \`rc = 111\`: Linux ECONNREFUSED ("Connection refused").
   - \`rc = 110\`: Linux ETIMEDOUT ("Connection timed out").
   - \`rc = 13\`: Linux EACCES ("Permission denied").`,
    detailedStudyNotes: [
      'Rotating files: When an instance restarts, previous traces are archived to dev_disp.old, dev_w0.old, etc. Always inspect both the current and .old file when debugging startup crashes.',
      'Trace levels: Level 1 is standard production default. Level 2 and 3 should only be activated temporarily via SM50 or profile parameter rdisp/TRACE for specific troubleshooting, then set back to 1 immediately to prevent I/O saturation.',
      'Grepping traces: Use grep -E "ERROR|Error|FATAL|Dump|rc =" dev_disp to quickly isolate critical exceptions.',
      'Time zone: Always confirm whether your grep matches local time or UTC (many cloud instances run in UTC while local offices run in CET or EST).'
    ],
    toolsAndCommands: [
      { name: 'tail -n 100 dev_disp', type: 'command', description: 'Prints the last 100 lines of the dispatcher trace file.' },
      { name: 'grep -i "error" dev_w0', type: 'command', description: 'Searches for error strings in work process 0 trace.' },
      { name: 'ST11', type: 'transaction', description: 'SAP GUI transaction to view developer trace files directly from the application.' },
      { name: 'ls -lht /usr/sap/<SID>/<INSTANCE>/work', type: 'command', description: 'Lists all trace and log files sorted by modification time (newest first).' }
    ],
    productionScenario: {
      ticketId: 'INC-2026-08103',
      severity: 'P1',
      title: 'PAS Crash Immediately After Reboot - Exit Code 255',
      description: 'Following a scheduled OS kernel patching reboot, SAP instance PRD/D00 fails to start. sapcontrol reports disp+work stopped with exit code 255.',
      systemContext: 'PRD S/4HANA on Oracle 19c. Instance D00 on host sapapp01.'
    },
    guidedInvestigation: [
      {
        step: 1,
        title: 'Check the Dispatcher Developer Trace',
        instruction: 'Run tail -n 50 /usr/sap/PRD/D00/work/dev_disp.',
        expectedFinding: '*** ERROR => DpShmCreate: ShmCreate (key: 100) failed (rc = 28: No space left on device)',
        interpretation: 'The dispatcher cannot allocate shared memory or IPC resources.'
      },
      {
        step: 2,
        title: 'Check OS Filesystem and Shared Memory IPC Limits',
        instruction: 'Run df -h /usr/sap/PRD and ipcs -l to inspect IPC limits.',
        expectedFinding: 'Filesystem has 45% free space, but ipcs -l reveals kernel.shmmax is set to 32MB instead of 64GB.',
        interpretation: 'The OS reboot loaded a default /etc/sysctl.conf that lacked SAP kernel parameters!'
      },
      {
        step: 3,
        title: 'Correlate with dev_w0',
        instruction: 'Examine /usr/sap/PRD/D00/work/dev_w0.',
        expectedFinding: '*** ERROR => DpSysInit: failed to attach to dispatcher shared memory.',
        interpretation: 'The work processes cannot start because the core shared memory segment was never initialized by the dispatcher.'
      }
    ],
    handsOnTask: {
      title: 'Analyze and Correlate Startup Traces',
      instructions: [
        'Inspect a simulated dev_disp output and identify the exact line where initialization aborted.',
        'List the top 4 trace files you should examine when a work process terminates with a signal 11 (SIGSEGV).',
        'Explain how to safely change the trace level of work process 4 from 1 to 2 via SM50 without restarting the instance.'
      ],
      deliverable: 'A step-by-step trace triage checklist for production crash incidents.'
    },
    knowledgeCheck: [
      {
        id: 'w1d3_q1',
        question: 'Which transaction in SAP GUI allows an administrator to browse and read developer trace files (/usr/sap/.../work) without OS access?',
        options: ['ST03N', 'ST11', 'SM13', 'SM59'],
        correctAnswer: 1,
        explanation: 'ST11 is the standard SAP transaction to view developer trace files (dev_disp, dev_w*, dev_ms, etc.) from the application layer.'
      },
      {
        id: 'w1d3_q2',
        question: 'In dev_disp, what does the Linux return code "rc = 28" indicate during a shared memory or file creation call?',
        options: [
          'Connection refused by remote host.',
          'No space left on device (ENOSPC).',
          'Permission denied (EACCES).',
          'Operation timed out (ETIMEDOUT).'
        ],
        correctAnswer: 1,
        explanation: 'Linux errno 28 represents ENOSPC (No space left on device). In SAP shared memory creation, it indicates either disk fullness or exhausted system-wide IPC/tmpfs resources.'
      }
    ],
    tasks: [
      { id: 't1', text: 'Map the role of each developer trace file in the work directory.' },
      { id: 't2', text: 'Understand how Linux errno codes map to SAP trace entries.' },
      { id: 't3', text: 'Practice finding the root error in a multi-thousand line trace file.' },
      { id: 't4', text: 'Complete the Day 3 knowledge check.' }
    ]
  },
  {
    id: 'w1d4',
    week: 1,
    day: 4,
    title: 'Production Incident Simulation: Oracle OPEN, ASCS Up, PAS Down',
    topic: 'Hands-on Triage: Process Hierarchy, Listener Verification, R3trans Diagnostic Execution',
    domain: 'architecture',
    durationMinutes: 60,
    learningObjectives: [
      'Execute a structured triage protocol for a stopped PAS dispatcher.',
      'Differentiate database unavailability from SAP-side database client authentication or network failures.',
      'Execute and interpret R3trans -d return codes (0000, 0004, 0012, 0016).',
      'Verify Oracle listener status and local TNS alias resolution (sqlplus, lsnrctl).',
      'Identify whether the failure originated in the database layer, network security, or SAP environment.'
    ],
    technicalExplanation: `When the SAP dispatcher stops immediately upon startup, the Basis engineer must systematically isolate:
1. Is ASCS running and reachable?
2. Is the Database engine OPEN?
3. Can the SAP user environment on the PAS host reach and authenticate to the Database?

**The R3trans Diagnostic**:
The \`R3trans -d\` command is the single most definitive test for SAP-to-database connectivity:
- It creates a \`trans.log\` file in the current working directory.
- Return codes:
  - **0000**: Success. Connection established, system tables reachable.
  - **0004**: Warning. Minor syntax or non-fatal condition.
  - **0012**: Severe error. Database connection could not be established (e.g. ORA-01034, ORA-12541, HANA authentication failure).
  - **0016**: Critical error. R3trans abended or was killed by signal.

**Oracle Client Environment**:
For SAP on Oracle:
- \`ORACLE_SID\`, \`ORACLE_HOME\`, \`TNS_ADMIN\` must be correctly exported in \`<sid>adm\` environment (\`~/.dbenv.sh\` or \`~/.profile\`).
- Secure store (\`SSFS\`) or \`SAPUSER\` table credentials must match the database schema owner.`,
    detailedStudyNotes: [
      'Do not restart the database blindly: If the DBA confirms the Oracle database is OPEN and other instances or tools connect, bouncing the database creates unnecessary business downtime.',
      'Inspect trans.log: Always check the bottom of trans.log when R3trans -d returns 0012. Look for Oracle error codes: ORA-01017 (invalid username/password), ORA-12154 (TNS:could not resolve service name), or ORA-12541 (TNS:no listener).',
      'Check listener: lsnrctl status on the database host confirms if the service handler for the SAP SID is registered and accepting connections.'
    ],
    toolsAndCommands: [
      { name: 'R3trans -d', type: 'command', description: 'Executes SAP database connectivity probe and creates trans.log.' },
      { name: 'cat trans.log', type: 'command', description: 'Displays detailed database connection errors and ORA/HDB error numbers.' },
      { name: 'lsnrctl status', type: 'command', description: 'Checks Oracle listener status, listening endpoints, and registered services.' },
      { name: 'sqlplus / as sysdba', type: 'command', description: 'Connects to local Oracle instance to verify database state (OPEN).' }
    ],
    productionScenario: {
      ticketId: 'INC-2026-08104',
      severity: 'P1',
      title: 'Production ERP Down: PAS Dispatcher Stopped, Oracle Reported OPEN',
      description: 'Operations team reports that ERP instance PRD is down. The DBA verified that Oracle 19c is running and SELECT STATUS FROM V$INSTANCE reports OPEN. However, sapcontrol -nr 00 -function GetProcessList shows disp+work is Stopped.',
      systemContext: 'PRD on Oracle 19c on Red Hat Enterprise Linux 8. ASCS on prd-ascs, DB on prd-db01, PAS on prd-app01.'
    },
    guidedInvestigation: [
      {
        step: 1,
        title: 'Run R3trans -d as prdadm',
        instruction: 'Log into prd-app01 as prdadm, navigate to /tmp, and run R3trans -d.',
        expectedFinding: 'R3trans finished with return code 12.',
        interpretation: 'The SAP kernel binary cannot establish an authenticated session with the Oracle database from this application host.'
      },
      {
        step: 2,
        title: 'Inspect trans.log for Specific DB Error',
        instruction: 'Run cat /tmp/trans.log and inspect the bottom 20 lines.',
        expectedFinding: 'ORA-12541: TNS:no listener reported on connection attempt to prd-db01:1527.',
        interpretation: 'The Oracle listener on port 1527 is either stopped or blocked by firewall.'
      },
      {
        step: 3,
        title: 'Verify Listener on Database Host',
        instruction: 'Log into prd-db01 as oraprd and run lsnrctl status.',
        expectedFinding: 'TNS-12541: TNS:no listener. The listener process crashed due to an unhandled signal during log rotation.',
        interpretation: 'Although the Oracle database background processes were OPEN, incoming client connections were rejected because the listener was down.'
      }
    ],
    handsOnTask: {
      title: 'Analyze R3trans trans.log Outputs',
      instructions: [
        'Review 3 distinct trans.log snippets representing: 1. ORA-01017, 2. ORA-12541, 3. ORA-01034 (ORACLE not available).',
        'State the precise corrective action for each error without impacting active users.',
        'Document why R3trans -d should always be executed as <sid>adm and never as root.'
      ],
      deliverable: 'A documented decision tree mapping R3trans return codes to root causes and safe fixes.'
    },
    knowledgeCheck: [
      {
        id: 'w1d4_q1',
        question: 'What does a return code of 0012 from R3trans -d indicate?',
        options: [
          'Database connection was successful with 12 warnings.',
          'Database connection failed completely; investigate trans.log for the exact error.',
          'Database has 12 tables requiring reorganization.',
          'The SAP license has expired.'
        ],
        correctAnswer: 1,
        explanation: 'Return code 0012 means R3trans encountered a severe error and could not connect to the database. Detailed diagnostics are logged in trans.log.'
      },
      {
        id: 'w1d4_q2',
        question: 'If the Oracle database engine is OPEN, can SAP application servers still fail to start with database connection errors?',
        options: [
          'No; if the database is OPEN, SAP will always start.',
          'Yes; issues such as Oracle listener failure, TNS alias errors, or expired schema passwords prevent connection.',
          'Only if the ASCS instance is on Windows.',
          'Only if SM50 has fewer than 10 dialog processes.'
        ],
        correctAnswer: 1,
        explanation: 'Database instance state (OPEN) is necessary but not sufficient. Network listeners, ports, authentication credentials, and client libraries must all function correctly.'
      }
    ],
    tasks: [
      { id: 't1', text: 'Study the difference between DB engine state and DB listener state.' },
      { id: 't2', text: 'Understand all R3trans return codes (0, 4, 12, 16).' },
      { id: 't3', text: 'Analyze trans.log error structures for Oracle and HANA.' },
      { id: 't4', text: 'Complete the Day 4 knowledge check.' }
    ]
  },
  {
    id: 'w1d5',
    week: 1,
    day: 5,
    title: 'Incident Timelines, Evidence Gathering, and Professional RCA Structure',
    topic: 'Separating Symptoms from Root Causes, Hypothesis Testing, Evidence Standards, Corrective Actions',
    domain: 'rca',
    durationMinutes: 60,
    learningObjectives: [
      'Construct chronological multi-source incident timelines with millisecond accuracy.',
      'Strictly separate Symptoms, Hypotheses, Evidence, Confirmed Root Cause, and Actions.',
      'Assign confidence levels: Confirmed (100% reproducible/proven), Probable (strong correlation), Unconfirmed.',
      'Formulate preventive actions that eliminate recurrences rather than merely restarting services.',
      'Author an enterprise-grade Root Cause Analysis (RCA) report suitable for executive and technical review.'
    ],
    technicalExplanation: `A professional RCA is a legal and technical document. Senior management and audit teams evaluate Basis competence by the rigor of their RCA reports.

1. **The 5 Core Elements of Production RCA**:
   - **Symptom**: What was observed (e.g. "Users saw error 503", "disp+work terminated").
   - **Hypothesis**: Plausible technical explanations tested during triage.
   - **Evidence**: Hard artifacts (exact log lines, timestamps, core dumps, metrics) that support or invalidate a hypothesis.
   - **Root Cause**: The foundational failure that, if prevented, ensures the incident cannot recur.
   - **Corrective & Preventive Actions (CAPA)**: Permanent fixes (monitoring, automation, parameter hardening), not temporary workarounds (reboots).

2. **The Confidence Matrix**:
   - **Confirmed**: Supported by unambiguous log entries, reproducible under testing, or verified by parameter/metric correlation.
   - **Probable**: Evidence strongly points to the cause, but missing debug logs or concurrency prevent absolute proof.
   - **Unconfirmed**: No definitive evidence found; multiple potential causes remain open.

3. **Building the Chronological Timeline**:
   | Timestamp (UTC) | Source | Event / Finding |
   |---|---|---|
   | 02:45:00 | Cron | Backup script started on Oracle DB |
   | 02:51:12 | OS Syslog | Disk /oracle/PRD/oraarch filled to 100% |
   | 02:51:14 | Oracle Alert Log | ORA-00257: archiver error. Connect AS SYSDBA only until freed |
   | 02:51:30 | dev_w3 | DB-Error: ORA-00257 reported by WP 3 |
   | 02:52:00 | SM50 | All 40 Dialog Work Processes entered PRIV / DB-Wait state |
   | 02:55:00 | Monitoring | P1 Alert triggered: All work processes exhausted |`,
    detailedStudyNotes: [
      'Never confuse workaround with permanent fix: "We restarted the server" is a restoration workaround, never a root cause or permanent fix.',
      'Avoid blaming users or vague claims: Statements like "Network had a glitch" without router logs or packet captures destroy RCA credibility.',
      'Actionable prevention: Every prevention item must have an owner, a clear task (e.g. "Configure automated archivelog deletion threshold at 80% in crontab"), and a target completion date.'
    ],
    toolsAndCommands: [
      { name: 'date -u', type: 'command', description: 'Outputs current UTC time for timestamp synchronization.' },
      { name: 'journalctl -u sapstartsrv --since "1 hour ago"', type: 'command', description: 'Extracts systemd journal events for sapstartsrv within an exact window.' },
      { name: 'SM21', type: 'transaction', description: 'SAP System Log: view centralized critical system warnings, abends, and database errors.' }
    ],
    productionScenario: {
      ticketId: 'INC-2026-08105',
      severity: 'P1',
      title: 'Complete System Freeze: Work Processes in DB-Wait State',
      description: 'At 10:14 UTC, 450 concurrent users experienced freezing sessions. SM50 revealed all DIA work processes in RUN status with action "Direct Read" on table BSEG, followed by dispatcher freeze.',
      systemContext: 'ECC 6.0 on Oracle 19c. 2 Application Servers.'
    },
    guidedInvestigation: [
      {
        step: 1,
        title: 'Establish Incident Window in SM21 and dev_w*',
        instruction: 'Filter SM21 between 10:10:00 and 10:20:00 UTC.',
        expectedFinding: 'Repeated warnings: "Database error: ORA-00060 deadlock detected" followed by "Transaction Canceled".',
        interpretation: 'A deadlock occurred between parallel update tasks locking identical index partitions.'
      },
      {
        step: 2,
        title: 'Check Oracle Alert Log for ORA-00060 Trace',
        instruction: 'Inspect alert_PRD.log at 10:14:02 UTC.',
        expectedFinding: 'ORA-00060: Deadlock detected. More info in file /oracle/PRD/diag/.../trace/PRD_ora_14201.trc.',
        interpretation: 'Oracle detected cyclic graph dependency between session 142 and session 188.'
      },
      {
        step: 3,
        title: 'Identify Confirmed Root Cause',
        instruction: 'Correlate session 142 and 188 SQL statements in the trace file.',
        expectedFinding: 'Custom batch job Z_POST_ACCRUALS was running concurrently with manual billing transaction VF01 without enqueue lock protection.',
        interpretation: 'Lack of application-level enqueue lock allowed concurrent execution, causing row-level deadlocks at the Oracle DB layer.'
      }
    ],
    handsOnTask: {
      title: 'Draft a Complete Production RCA Report',
      instructions: [
        'Open the RCA Notebook in the sidebar.',
        'Create a new RCA report using the template for INC-2026-08105.',
        'Complete all sections: Incident Summary, Initial Evidence, Investigation, Root Cause, Resolution, Validation, and Prevention.'
      ],
      deliverable: 'A finalized, professional RCA saved in your personal notebook.'
    },
    knowledgeCheck: [
      {
        id: 'w1d5_q1',
        question: 'In a professional RCA, why is "Server was restarted and system came back online" unacceptable as a Root Cause?',
        options: [
          'Because restarts are forbidden by SAP AG.',
          'Restarting is a temporary restoration action; it does not explain why the failure occurred or prevent it from happening again.',
          'Because only database restarts count as root causes.',
          'Because RCA reports must only contain Linux commands.'
        ],
        correctAnswer: 1,
        explanation: 'A restart restores service availability, but the underlying flaw (memory leak, lock contention, config bug) remains untouched and will recur.'
      },
      {
        id: 'w1d5_q2',
        question: 'Which confidence level should be assigned to an RCA hypothesis when correlated log warnings exist but no definitive proof is captured?',
        options: ['Confirmed', 'Probable', 'Unconfirmed', 'Guaranteed'],
        correctAnswer: 1,
        explanation: 'Probable is the appropriate professional classification when circumstantial evidence strongly aligns, but conclusive proof or reproduction was not achievable.'
      }
    ],
    tasks: [
      { id: 't1', text: 'Master the 5 elements: Symptom, Hypothesis, Evidence, Root Cause, Prevention.' },
      { id: 't2', text: 'Practice building a chronological incident timeline table.' },
      { id: 't3', text: 'Author and save your first complete RCA in the RCA Notebook.' },
      { id: 't4', text: 'Complete the Week 1 summary knowledge check.' }
    ]
  }
];

import { CurriculumSession } from '../../types';

export const week4Sessions: CurriculumSession[] = [
  {
    id: 'w4d1',
    week: 4,
    day: 1,
    title: 'ABAP Dumps (ST22), System Log (SM21), and Time Correlation',
    topic: 'ST22 Error Analysis, SM21 Central Log, Microsecond Correlation, and Dump Categories',
    domain: 'abap',
    durationMinutes: 60,
    learningObjectives: [
      'Deconstruct the structure of an ABAP short dump in transaction ST22.',
      'Categorize short dump classes: Memory (TSV_TNEW_PAGE_ALLOC_FAILED), Timeout (TIME_OUT), Database (DBSQL_*), Program (MESSAGE_TYPE_X).',
      'Correlate an ST22 dump with the corresponding system log entries in SM21 and developer traces in ST11.',
      'Extract the active user, transaction, program name, line of source code, and contents of system fields (SY-SUBRC, SY-TABIX).',
      'Distinguish custom code defects (Z/Y namespace) from standard SAP kernel bugs or basis infrastructure failures.'
    ],
    technicalExplanation: `When an unhandled exception or critical runtime condition occurs in the ABAP virtual machine, the kernel generates an ABAP Short Dump, recorded in transaction ST22 and table \`SNAP\`.

1. **Anatomy of an ST22 Short Dump**:
   - **Header**: Error analysis, Dump date/time (microsecond precision), Client, User, Transaction, Program, Main Program.
   - **What happened?**: A plain-text description of the runtime violation.
   - **Error analysis**: In-depth explanation of the exception class or kernel fault.
   - **Source Code Extract**: The exact ABAP statement (highlighted with \`>>>\`) where execution terminated.
   - **Active Calls/Events**: The complete call stack tracing execution backwards from the crash point.
   - **Chosen Variables**: Values of local variables, structures, and internal tables at the moment of failure.

2. **Core Short Dump Archetypes**:
   - \`TSV_TNEW_PAGE_ALLOC_FAILED\`: ABAP memory manager could not allocate additional paging memory for an internal table.
   - \`TIME_OUT\`: Program exceeded the maximum execution runtime set by parameter \`rdisp/max_wprun_time\` (default 600s in DIA).
   - \`DBSQL_SQL_ERROR\`: An underlying database statement failed with a DB-specific error code (e.g. ORA-01653 or HANA 2048).
   - \`MESSAGE_TYPE_X\`: An explicit assertion or fatal condition (\`MESSAGE x... RAISE\`) coded by the developer.

3. **SM21 System Log Correlation**:
   - SM21 records instance-level and central system events: logons, work process crashes, database stalls, RFC disconnections.
   - Look for error messages prefixed by \`Q0\` (work process died), \`R4\` (database communication), or \`AB\` (transaction aborted).`,
    detailedStudyNotes: [
      'SNAP table growth: ST22 dumps are stored in database table SNAP. If an infinite loop or runaway RFC generates 50,000 dumps an hour, SNAP can grow to tens of gigabytes, impacting DB performance. Run report RSSNAPDL to clean old dumps.',
      'Identifying root cause responsibility: Check the "Active Calls/Events" stack. If the topmost call is standard SAP code (SAPL...) but was invoked by a custom Z-program passing invalid parameters, the root cause lies in the custom code!',
      'Check developer trace from ST22: Inside ST22, choosing "Environment -> Developer trace" jumps directly to the dev_w* trace file at the exact microsecond of the dump.'
    ],
    toolsAndCommands: [
      { name: 'ST22', type: 'transaction', description: 'ABAP Runtime Error Analysis: view short dumps, call stacks, and memory states.' },
      { name: 'SM21', type: 'transaction', description: 'SAP System Log: view centralized critical system warnings, abends, and database errors.' },
      { name: 'ST11', type: 'transaction', description: 'Direct developer trace browser in SAP GUI.' }
    ],
    productionScenario: {
      ticketId: 'INC-2026-08401',
      severity: 'P2',
      title: 'Users Crashing in VA01 Order Creation with TSV_TNEW_PAGE_ALLOC_FAILED',
      description: 'Customer service users in company code 1000 report that saving sales orders in transaction VA01 suddenly aborts with a red error screen. Multiple ST22 short dumps are logged.',
      systemContext: 'S/4HANA 2022 on HANA 2.0.'
    },
    guidedInvestigation: [
      {
        step: 1,
        title: 'Open ST22 and Inspect TSV_TNEW_PAGE_ALLOC_FAILED',
        instruction: 'Execute ST22, find dump TSV_TNEW_PAGE_ALLOC_FAILED, and inspect "Information on where terminated".',
        expectedFinding: 'Program: ZCL_PRICING_CUSTOM============CP, Method: CALCULATE_DISCOUNTS, Line: 142.',
        interpretation: 'The crash occurred inside a custom pricing enhancement class, not in core SAP standard code.'
      },
      {
        step: 2,
        title: 'Analyze Chosen Variables and Internal Table Sizes',
        instruction: 'Scroll to "Chosen variables" in ST22.',
        expectedFinding: 'Internal table LT_DISCOUNT_RULES has 14,800,000 rows, consuming 18GB of heap memory.',
        interpretation: 'An unconstrained SELECT * statement without a WHERE clause loaded an entire historical pricing table into private memory.'
      },
      {
        step: 3,
        title: 'Correlate with SM21 and SM50',
        instruction: 'Check SM21 for ABAP memory warnings around the same timestamp.',
        expectedFinding: 'SM21 reports: "WP entered PRIV mode due to exceeding parameter ztta/roll_extension".',
        interpretation: 'Work process exhausted roll extension, monopolized local heap, and was terminated by the memory manager to prevent server crash.'
      }
    ],
    handsOnTask: {
      title: 'Dissect an ABAP Short Dump Call Stack',
      instructions: [
        'Analyze a sample ST22 dump text and identify: 1. Main Program, 2. Exception Class, 3. Culprit Line, 4. User ID.',
        'Explain why parameter rdisp/max_wprun_time terminates dialog transactions with dump TIME_OUT.',
        'Describe how to schedule background report RSSNAPDL to automate dump housekeeping.'
      ],
      deliverable: 'A structured ABAP dump triage worksheet.'
    },
    knowledgeCheck: [
      {
        id: 'w4d1_q1',
        question: 'What is the primary cause of ABAP short dump TSV_TNEW_PAGE_ALLOC_FAILED?',
        options: [
          'The database listener on port 1527 was stopped.',
          'An internal table requested more memory than allowed by the ABAP memory management quotas or physical RAM.',
          'The user entered an incorrect password 3 times.',
          'The SAP license has expired.'
        ],
        correctAnswer: 1,
        explanation: 'TSV_TNEW_PAGE_ALLOC_FAILED occurs when an internal table attempts to expand in memory, but no further paging, roll extension, or heap memory can be allocated.'
      },
      {
        id: 'w4d1_q2',
        question: 'In ST22, how can an analyst immediately determine whether a dump was triggered by custom code or standard SAP code?',
        options: [
          'All dumps are always caused by SAP kernel bugs.',
          'Inspect the "Active Calls/Events" call stack and check if custom programs in the Z* or Y* namespace are in the execution path.',
          'Check the color of the monitor.',
          'Ask the user who ran the transaction.'
        ],
        correctAnswer: 1,
        explanation: 'The call stack displays the sequence of routines. If Z* or Y* programs or user exits are present, custom development logic is usually the initiating factor.'
      }
    ],
    tasks: [
      { id: 't1', text: 'Master ST22 sections: Header, What happened, Call stack, Variables.' },
      { id: 't2', text: 'Learn common short dumps: TSV_*, TIME_OUT, DBSQL_*, MESSAGE_TYPE_X.' },
      { id: 't3', text: 'Correlate short dumps with SM21 system log entries.' },
      { id: 't4', text: 'Complete the Day 1 ABAP knowledge check.' }
    ]
  },
  {
    id: 'w4d2',
    week: 4,
    day: 2,
    title: 'Work Processes (SM50/SM66), Locks (SM12), Updates (SM13), and Jobs (SM37)',
    topic: 'SM50 Local vs SM66 Global, Lock Table Contention (SM12), V1/V2 Update Failures (SM13), Batch Triage (SM37)',
    domain: 'abap',
    durationMinutes: 60,
    learningObjectives: [
      'Master real-time process monitoring in SM50 (local instance) and SM66 (global system).',
      'Detect and troubleshoot SAP enqueue locks in SM12, identifying lock holders and waiting sessions.',
      'Investigate V1 (critical) and V2 (non-critical) update task failures in SM13.',
      'Triage background job delays, cancellations, and long-running steps in SM37.',
      'Safely cancel runaway work processes without causing database block corruption.'
    ],
    technicalExplanation: `The heartbeat of daily SAP Basis incident handling revolves around work processes, logical locks, and update queues.

1. **Work Process States in SM50 / SM66**:
   - **WAIT**: Idle and available to accept incoming requests.
   - **RUN**: Actively executing ABAP code or processing a screen.
   - **HOLD**: Retained exclusively by a process (e.g. debugging, RFC connection, sequential read).
   - **PRIV**: Switched to private process memory; cannot be shared across other work processes until finished!

2. **Logical Lock Table Management (SM12)**:
   - When an SAP user edits a document (sales order, purchase order, material), SAP places a logical lock entry in the Enqueue lock table (managed by ASCS).
   - Lock Modes:
     - **S (Shared)**: Multiple readers can read simultaneously; no one can edit.
     - **E (Exclusive)**: Only one user can edit; readers can view.
     - **X (eXclusive cumulative)**: Cannot be shared; lock counter increments with sub-objects.
   - **Deadlock / Lock Contention**: If User A locks document 1000 and waits on 2000, while User B locks 2000 and waits on 1000, both sessions stall.

3. **Asynchronous Updates (SM13)**:
   - When an ABAP transaction completes, it issues \`COMMIT WORK\`. The dialog work process hands off the database writes to an **Update Work Process (UPD)**.
   - **V1 (Time-critical)**: Document posting, stock decrement, financial ledger writes. If V1 fails, the entire transaction is aborted and rolled back.
   - **V2 (Non-critical)**: Statistics update, search index refresh, print spool generation. Executes only after V1 succeeds.
   - Statuses in SM13: \`Auto\` (waiting), \`Error\` (update aborted; requires Basis investigation and re-posting), \`Init\`.

4. **Background Jobs (SM37)**:
   - Statuses: \`Scheduled\`, \`Released\`, \`Ready\`, \`Active\`, \`Finished\`, \`Canceled\`.
   - If jobs remain in "Ready" status: All Background (BGD) work processes are occupied!`,
    detailedStudyNotes: [
      'Canceling a work process safely: In SM50, choose "Process -> Cancel -> With Core" or "Without Core". NEVER use "Cancel with Core" in production unless requested by SAP Support for debugging, as it generates huge core dump files that fill disk.',
      'Lock deletion caution: In SM12, deleting a lock entry while the user or job is still actively running will lead to data inconsistency and database corruption. Always confirm the owning process is dead before deleting a lock.',
      'Update deactivated: If SM13 displays "Update system is deactivated", all posting in the entire SAP system is halted! Check dev_w* and SM21 to see why the update task was halted (commonly database full).'
    ],
    toolsAndCommands: [
      { name: 'SM50', type: 'transaction', description: 'Process Overview for current instance: inspect status, action, table, and CPU time.' },
      { name: 'SM66', type: 'transaction', description: 'Global Work Process Overview across all application servers in the system.' },
      { name: 'SM12', type: 'transaction', description: 'Display and manage SAP lock table entries.' },
      { name: 'SM13', type: 'transaction', description: 'Monitor and reprocess asynchronous V1 and V2 update requests.' },
      { name: 'SM37', type: 'transaction', description: 'Overview and management of background jobs.' }
    ],
    productionScenario: {
      ticketId: 'INC-2026-08402',
      severity: 'P1',
      title: 'Warehouse Shippers Blocked - SM12 Lock Table Overflow and Update Freeze',
      description: 'Warehouse operators cannot confirm outbound deliveries in VL02N with error "Lock table overflow". Meanwhile, billing documents are failing with SM13 update errors.',
      systemContext: 'S/4HANA 2023. ASCS Enqueue Server.'
    },
    guidedInvestigation: [
      {
        step: 1,
        title: 'Check Lock Table Health in SM12',
        instruction: 'Execute SM12 and choose "Extras -> Statistics".',
        expectedFinding: 'Current locks: 125,000. Maximum allowed: 125,000 (100% capacity). Parameter enq/table_size reached.',
        interpretation: 'The lock table is completely saturated, rejecting all new lock requests system-wide.'
      },
      {
        step: 2,
        title: 'Identify Culprit User or Batch Job in SM12',
        instruction: 'Filter SM12 lock entries by user and table.',
        expectedFinding: 'Batch user BATCH_EDI owns 118,000 exclusive locks on table VBAP created by job Z_BULK_DELIVERY_SYNC.',
        interpretation: 'A bulk processing job looped through 100,000 sales orders inside a single transaction without issuing COMMIT WORK to release locks.'
      },
      {
        step: 3,
        title: 'Check SM37 and Cancel Runaway Batch Job',
        instruction: 'Find the active job in SM37 and cancel it cleanly.',
        expectedFinding: 'Job canceled; lock entries on VBAP immediately released from SM12; lock count drops from 125,000 to 1,200.',
        interpretation: 'Warehouse shipping transactions in VL02N resumed immediately once lock table space was restored.'
      }
    ],
    handsOnTask: {
      title: 'Triage Work Process and Update Failures',
      instructions: [
        'Document the difference between V1 and V2 update tasks in SM13.',
        'Describe the risks of prematurely deleting a lock in SM12.',
        'List 3 reasons why background jobs might remain stuck in "Ready" status in SM37.'
      ],
      deliverable: 'A daily operational SOP for monitoring SM50, SM12, and SM13.'
    },
    knowledgeCheck: [
      {
        id: 'w4d2_q1',
        question: 'What is the danger of manually deleting an active lock entry in transaction SM12?',
        options: [
          'It reboots the application server.',
          'If the user or process is still running, another session can modify the exact same records concurrently, causing silent database corruption.',
          'It clears all user passwords.',
          'It deletes the SAP license.'
        ],
        correctAnswer: 1,
        explanation: 'SAP logical locks prevent concurrent edits on the same business entity. Forcing a lock deletion while a process is writing allows duplicate, conflicting updates.'
      },
      {
        id: 'w4d2_q2',
        question: 'In transaction SM13, what distinguishes a V1 update task from a V2 update task?',
        options: [
          'V1 updates execute on Oracle, while V2 updates execute on HANA.',
          'V1 updates are time-critical primary document postings; V2 updates are non-critical secondary updates (e.g. statistics) executed only after V1 completes.',
          'V1 updates are for dialog users, V2 updates are for background jobs.',
          'V1 updates cannot be restarted.'
        ],
        correctAnswer: 1,
        explanation: 'V1 update tasks are mission-critical synchronous database operations. V2 tasks handle statistical recalculations and secondary logging.'
      }
    ],
    tasks: [
      { id: 't1', text: 'Master work process states in SM50 (WAIT, RUN, HOLD, PRIV).' },
      { id: 't2', text: 'Understand lock modes (S, E, X) and lock table limits in SM12.' },
      { id: 't3', text: 'Study V1 vs V2 update handling in SM13.' },
      { id: 't4', text: 'Complete the Day 2 ABAP knowledge check.' }
    ]
  },
  {
    id: 'w4d3',
    week: 4,
    day: 3,
    title: 'Performance Diagnostics: ST03N Workload, ST06 OS, and ST02 Buffers',
    topic: 'ST03N Workload Analysis, Response Time Components, ST06 OS Metrics, ST02 SAP Buffer Swaps',
    domain: 'abap',
    durationMinutes: 60,
    learningObjectives: [
      'Deconstruct the SAP average dialog response time into its components: Wait time, CPU time, DB request time, Load/Gen time.',
      'Analyze transaction workload trends using ST03N across task types (Dialog, RFC, Batch).',
      'Correlate SAP application performance with operating system metrics via ST06 / OS07N.',
      'Inspect SAP shared memory buffer health (Repository, Program, Table buffers) in ST02.',
      'Identify buffer swaps and adjust buffer parameters without wasting physical memory.'
    ],
    technicalExplanation: `When users complain that "SAP is slow", an experienced Basis consultant turns immediately to ST03N to break down the **Response Time**.

1. **The Anatomy of Average Response Time (ST03N)**:
   - **Average Response Time = Wait Time + CPU Time + DB Request Time + Load & Gen Time + Roll Wait/GUI Time**.
   - **Target Benchmarks for Dialog**:
     - Total Average Response Time: \`< 1000 ms\` (1 second).
     - **Wait Time**: \`< 50 ms\`. If \`Wait Time > 100 ms\`, work processes are exhausted! Transactions are queuing waiting for a free work process.
     - **CPU Time**: Should represent ~20-40% of response time. If CPU Time is high, check for inefficient ABAP loops or OS CPU saturation.
     - **DB Request Time**: Should represent ~40-50% of response time. If DB Request Time \`> 500 ms\`, suspect missing database indexes, table scans, or lock contention.
     - **Load / Gen Time**: Should be \`< 50 ms\`. High Load/Gen time indicates program buffer flushes or transports importing into a live system.

2. **SAP Buffer Health (ST02)**:
   - SAP caches repository objects, ABAP programs, screens, and customizing tables in local shared memory buffers to avoid hitting the database.
   - **Buffer Swaps**: A swap occurs when an object must be loaded into a buffer, but there is no free space, forcing the buffer manager to evict an existing object to disk.
   - Frequent swaps in the **Program Buffer** or **Table Buffer** degrade response times dramatically.

3. **Operating System Metrics (ST06 / OS07N)**:
   - Integrates OS-level CPU utilization, page-in/page-out rates, physical memory, and disk response times directly into the SAP GUI.`,
    detailedStudyNotes: [
      'Never tune buffers blindly: Increasing buffer size in ST02 requires physical RAM. If you increase buffers beyond available RAM, the OS will swap memory to disk, causing far worse performance degradation than a buffer swap!',
      'Roll Wait Time: High roll wait time usually indicates network latency between the SAP application server and the end-user SAP GUI client, or slow WAN connections.',
      'ST03N Collector: ST03N relies on the hourly background job SAP_COLLECTOR_FOR_PERFMONITOR. If this job fails, ST03N will show missing or stale workload data.'
    ],
    toolsAndCommands: [
      { name: 'ST03N', type: 'transaction', description: 'Workload Analysis: view response times, transaction profiles, RFC profiles, and user statistics.' },
      { name: 'ST02', type: 'transaction', description: 'Buffer Tune Summary: inspect buffer hit ratios, allocated memory, and swap counts.' },
      { name: 'ST06 / OS07N', type: 'transaction', description: 'Operating System Monitoring: CPU, memory, paging, and disk performance from SAP GUI.' }
    ],
    productionScenario: {
      ticketId: 'INC-2026-08403',
      severity: 'P2',
      title: 'Users Experiencing High Latency in VA02 - Average Response Time 8.4 Seconds',
      description: 'Complaints of severe sluggishness in order modification transaction VA02. Total dialog response time jumped from 800ms to 8400ms.',
      systemContext: 'S/4HANA 2022 on HANA 2.0. 3 Application Servers.'
    },
    guidedInvestigation: [
      {
        step: 1,
        title: 'Open ST03N and Analyze Dialog Response Time Components',
        instruction: 'Execute ST03N -> Today -> Workload Overview -> Dialog.',
        expectedFinding: 'Avg Response Time: 8420 ms. Wait time: 12 ms. CPU time: 310 ms. DB Request Time: 7980 ms.',
        interpretation: 'Over 94% of the latency is consumed inside the database engine, completely exonerating the SAP application server CPU and work process queues.'
      },
      {
        step: 2,
        title: 'Inspect SQL Statements for VA02 in ST04 / DBACOCKPIT',
        instruction: 'Open ST04 -> Expensive Statements -> Filter by transaction VA02.',
        expectedFinding: 'A custom select on table VBAK executing full table scan on 40 million rows due to missing secondary index on field BSTNK.',
        interpretation: 'A developer introduced a custom enhancement that triggered unindexed sequential scans.'
      },
      {
        step: 3,
        title: 'Validate and Resolve Missing Index',
        instruction: 'Create appropriate secondary index on VBAK~Z01 via SE11 and activate.',
        expectedFinding: 'DB Request Time in ST03N drops from 7980ms to 45ms. Total response time normalizes to 420ms.',
        interpretation: 'Index creation eliminated full table scans, restoring system-wide response times.'
      }
    ],
    handsOnTask: {
      title: 'Analyze ST03N Response Time Metrics',
      instructions: [
        'Break down a sample ST03N response time profile into its 5 component parts.',
        'Explain why a high Wait Time (>200ms) indicates a work process bottleneck.',
        'Document the proper criteria for deciding whether to enlarge a table buffer in ST02.'
      ],
      deliverable: 'A performance diagnosis flowchart based on ST03N response time decomposition.'
    },
    knowledgeCheck: [
      {
        id: 'w4d3_q1',
        question: 'In transaction ST03N, if the average Dialog Wait Time exceeds 250 ms while DB Request Time is low, what is the primary bottleneck?',
        options: [
          'The database network cable is disconnected.',
          'All Dialog work processes are occupied, forcing incoming user requests to queue in dispatcher shared memory.',
          'The user has too many windows open.',
          'The SAP license has expired.'
        ],
        correctAnswer: 1,
        explanation: 'Wait time measures the delay between a request arriving at the dispatcher and an available work process picking it up. High wait time means work processes are saturated.'
      },
      {
        id: 'w4d3_q2',
        question: 'What is an SAP Buffer Swap in transaction ST02?',
        options: [
          'Memory swapped between the Linux kernel and disk swap space.',
          'An object being evicted from an SAP shared memory buffer to disk or reloaded because the buffer has run out of allocated space.',
          'A user switching terminals.',
          'A database backup operation.'
        ],
        correctAnswer: 1,
        explanation: 'In ST02, a swap represents an internal SAP shared memory buffer replacement where an object is purged due to lack of configured buffer space.'
      }
    ],
    tasks: [
      { id: 't1', text: 'Deconstruct the 5 components of SAP response time in ST03N.' },
      { id: 't2', text: 'Learn to interpret buffer swaps in ST02.' },
      { id: 't3', text: 'Correlate ST03N metrics with database and OS statistics.' },
      { id: 't4', text: 'Complete the Day 3 ABAP knowledge check.' }
    ]
  },
  {
    id: 'w4d4',
    week: 4,
    day: 4,
    title: 'RFC Connectivity, Queues (SM58, SMQ1, SMQ2), and SAP Gateway',
    topic: 'RFC Destinations (SM59), Transactional RFC (SM58), Queued RFC (SMQ1/SMQ2), and Gateway (SMGW)',
    domain: 'abap',
    durationMinutes: 60,
    learningObjectives: [
      'Configure and troubleshoot RFC destinations (Type 3 ABAP, Type T TCP/IP) in SM59.',
      'Diagnose failed asynchronous transactional RFCs (tRFC) in transaction SM58.',
      'Monitor and resolve inbound (SMQ2) and outbound (SMQ1) queued RFC (qRFC) blocks.',
      'Inspect SAP Gateway connections, registered external programs, and security ACLs (secinfo/reginfo) in SMGW.',
      'Resolve "CPIC-CALL: CMRCV : reg server not found" and RFC authorization failures.'
    ],
    technicalExplanation: `Modern SAP landscapes communicate with CRM, SCM, cloud platforms, and third-party systems via Remote Function Calls (RFC).

1. **RFC Destination Types (SM59)**:
   - **Type 3 (ABAP Connections)**: Direct connection to another SAP NetWeaver system. Requires logon credentials, client, language, and target host/instance.
   - **Type T (TCP/IP External Programs)**: Connects to external programs registered on the SAP Gateway or started by the application server (e.g. SAP Cloud Connector, tax calculation engines, barcode scanners).

2. **tRFC vs qRFC (SM58 vs SMQ1 / SMQ2)**:
   - **Transactional RFC (tRFC - SM58)**: Guarantees that an execution occurs **exactly once** in the target system using a Transaction ID (TID). Does not enforce chronological execution order. If target is unreachable, status shows \`SYSFAIL\` or \`RETRY\`.
   - **Queued RFC (qRFC - SMQ1 Outbound, SMQ2 Inbound)**: Enforces strict First-In-First-Out (FIFO) queue order.
     - **The Queue-Block Hazard**: If the first LUW (Logical Unit of Work) in a queue encounters an error (status \`SYSFAIL\` or \`STOP\`), **all subsequent messages in that queue are blocked indefinitely**!

3. **SAP Gateway Monitoring (SMGW)**:
   - Daemon \`gwrd\` listens on port \`33<instance_nr>\`.
   - Manages connections to external programs.
   - **Gateway Security Files**:
     - \`secinfo\`: Controls which users can start RFC programs from SAP.
     - \`reginfo\`: Controls which external programs can register on the SAP gateway and which internal servers can invoke them.
     - Misconfigured \`reginfo\` causes error: \`RFC callback / program registration not allowed by security rules\`.`,
    detailedStudyNotes: [
      'Unblocking SMQ2: When an inbound queue is in SYSFAIL in SMQ2, double-clicking the status reveals the underlying ST22 short dump or error message in the target client.',
      'SM58 auto-retry: Parameter rdisp/rfc_check defines retry intervals for tRFC. If SM58 shows hundreds of thousands of entries, background jobs executing RSARFCEX can overwhelm the database.',
      'Gateway trace dev_rd: Gateway connection and authorization failures are logged in the instance work directory under dev_rd.'
    ],
    toolsAndCommands: [
      { name: 'SM59', type: 'transaction', description: 'RFC Destination Management: test connection, authorization, and ping round-trip.' },
      { name: 'SM58', type: 'transaction', description: 'Transactional RFC Monitor: view and re-execute failed tRFC calls.' },
      { name: 'SMQ1', type: 'transaction', description: 'Outbound qRFC Monitor: inspect outgoing queue queues and LUWs.' },
      { name: 'SMQ2', type: 'transaction', description: 'Inbound qRFC Monitor: inspect incoming queue states.' },
      { name: 'SMGW', type: 'transaction', description: 'SAP Gateway Monitor: inspect active connections and registered programs.' }
    ],
    productionScenario: {
      ticketId: 'INC-2026-08404',
      severity: 'P1',
      title: 'Global E-Commerce Order Integration Blocked in SMQ2 Queue',
      description: 'Customer orders from the external webshop have ceased syncing to S/4HANA for 4 hours. SMQ2 reveals queue WEB_ORDER_INBOUND is in status SYSFAIL with 14,000 pending entries.',
      systemContext: 'S/4HANA 2023 on SLES 15.'
    },
    guidedInvestigation: [
      {
        step: 1,
        title: 'Inspect Inbound Queue in SMQ2',
        instruction: 'Execute SMQ2, locate queue WEB_ORDER_INBOUND, and double-click the top entry in SYSFAIL.',
        expectedFinding: 'Error text: "Customer master 904412 does not exist in Sales Org 1000".',
        interpretation: 'A single invalid order with a non-existent customer master failed business validation, halting the FIFO queue.'
      },
      {
        step: 2,
        title: 'Assess Queue FIFO Dependency',
        instruction: 'Review the subsequent 14,000 queued messages.',
        expectedFinding: 'The subsequent orders are valid, but blocked behind the single failed LUW.',
        interpretation: 'Because qRFC guarantees sequential consistency, no subsequent order can process until the blocking LUW is resolved.'
      },
      {
        step: 3,
        title: 'Safely Isolate Culprit LUW and Release Queue',
        instruction: 'Save the failed LUW to an error holding queue or cancel the single entry after developer sign-off, then choose "Activate Queue".',
        expectedFinding: 'The queue activates; 14,000 valid orders process through the pipeline within 15 minutes.',
        interpretation: 'Removing the single poison-pill entry unblocked the entire enterprise integration queue.'
      }
    ],
    handsOnTask: {
      title: 'Audit Gateway Security and Queue Architecture',
      instructions: [
        'Document the critical difference between tRFC (SM58) and qRFC (SMQ1/SMQ2).',
        'Explain how a single failed message in an inbound qRFC queue can block thousands of valid messages.',
        'Review the purpose of reginfo in secinfo security configuration files for SAP Gateway.'
      ],
      deliverable: 'An RFC and integration troubleshooting guide.'
    },
    knowledgeCheck: [
      {
        id: 'w4d4_q1',
        question: 'Why does a single failed message (SYSFAIL) in SMQ2 cause all subsequent messages in that queue to stop processing?',
        options: [
          'Because the SAP license expires immediately.',
          'qRFC enforces strict First-In-First-Out (FIFO) chronological ordering; subsequent messages cannot process until earlier dependent messages complete.',
          'Because the operating system deletes the network socket.',
          'Because SMQ2 only holds one message at a time.'
        ],
        correctAnswer: 1,
        explanation: 'Queued RFC exists specifically to preserve transactional sequence. If the head of the queue fails, subsequent dependent updates must wait to prevent out-of-order data corruption.'
      },
      {
        id: 'w4d4_q2',
        question: 'Which transaction allows an administrator to test the network connection and authorization of an external RFC destination?',
        options: ['SM59', 'SM13', 'SM12', 'ST02'],
        correctAnswer: 0,
        explanation: 'SM59 is the RFC Destination Maintenance transaction used to configure, test connection, and verify authorizations.'
      }
    ],
    tasks: [
      { id: 't1', text: 'Study RFC types in SM59 (Type 3 ABAP vs Type T TCP/IP).' },
      { id: 't2', text: 'Understand tRFC (SM58) and qRFC (SMQ1/SMQ2) error states.' },
      { id: 't3', text: 'Learn SAP Gateway architecture and reginfo/secinfo security.' },
      { id: 't4', text: 'Complete the Day 4 ABAP knowledge check.' }
    ]
  },
  {
    id: 'w4d5',
    week: 4,
    day: 5,
    title: 'End-to-End Slow Job and Slow Transaction Investigation Across SAP, DB, and OS',
    topic: 'Cross-Tier Troubleshooting: Correlating SAP Traces, DB Lock Trees, and OS Bottlenecks',
    domain: 'abap',
    durationMinutes: 60,
    learningObjectives: [
      'Execute a full cross-tier investigation for a slow background job or transaction.',
      'Prevent the common mistake of diagnosing an isolated metric without considering whole-system context.',
      'Correlate SM50 work process activity with database session monitors (DB02, ST04, HANA M_SERVICE_THREADS).',
      'Track down database lock waits and latch contention holding SAP work processes in DB-Wait.',
      'Formulate a comprehensive diagnosis proving whether latency originates in ABAP, Database, OS I/O, or External RFC.'
    ],
    technicalExplanation: `When a mission-critical billing job normally taking 20 minutes runs for 6 hours, amateur administrators guess and reboot. Senior engineers execute a structured cross-tier investigation.

**The 4-Step Cross-Tier Investigation Protocol**:

1. **Step 1: Check the SAP Application Layer (SM50 / SM66 / SM37)**:
   - Identify the exact work process executing the job.
   - What is its status?
     - \`RUN\` (Sequential read, calculating ABAP logic).
     - \`HOLD\` (Waiting for RFC reply or exclusive lock).
     - \`DB-Wait\` (Waiting for response from database query or commit).
   - What table and database action is currently listed?

2. **Step 2: Inspect the Database Layer (ST04 / DBACOCKPIT / hdbsql / sqlplus)**:
   - Map the SAP work process PID to the database session ID (SPID / Thread ID).
   - Is the DB thread actively consuming CPU, or is it blocked in a **lock wait**?
   - In HANA: Check \`M_BLOCKED_TRANSACTIONS\`.
   - In Oracle: Check \`V$SESSION_BLOCKERS\` and \`V$LOCK\`.
   - If blocked: Identify the holding session! What job or user owns the holding session?

3. **Step 3: Check the Operating System & Storage Layer (top / vmstat / iostat)**:
   - Is the database host CPU saturated?
   - Is disk storage I/O wait (\`wa%\`) elevated? Check \`iostat -x 1 5\` for disk service time (\`await > 10ms\`).

4. **Step 4: Check External Dependencies (SM58 / SMGW / Network)**:
   - Is the transaction waiting on a synchronous RFC call to a slow external cloud service or partner gateway?`,
    detailedStudyNotes: [
      'Never kill a database session blindly: If a session has modified 10 million rows and is killed, the database must roll back all 10 million rows, keeping the table locked and consuming 100% CPU for hours during rollback!',
      'Sequential Read vs Direct Read: In SM50, "Direct Read" uses primary/unique indexes. "Sequential Read" usually indicates a full table scan or range scan across millions of records.',
      'Thread tracing in HANA: Query M_SERVICE_THREADS to see the exact SQL statement and elapsed execution time for an active indexserver thread.'
    ],
    toolsAndCommands: [
      { name: 'SM50', type: 'transaction', description: 'Monitor active work process state and action.' },
      { name: 'ST04', type: 'transaction', description: 'Database performance overview, SQL cache, and lock monitors.' },
      { name: 'iostat -x 1 5', type: 'command', description: 'Measures OS disk throughput, latency, and queue depths.' },
      { name: 'M_BLOCKED_TRANSACTIONS', type: 'tool', syntax: 'SELECT * FROM SYS.M_BLOCKED_TRANSACTIONS', description: 'HANA view showing transaction lock chains and blockers.' }
    ],
    productionScenario: {
      ticketId: 'INC-2026-08405',
      severity: 'P1',
      title: 'Nightly Billing Run Z_BILLING_MASS Hanging - 6 Hours Elapsed',
      description: 'Critical batch job Z_BILLING_MASS is usually finished in 35 minutes but has been running for over 6 hours. Downstream shipping operations cannot print delivery notes.',
      systemContext: 'S/4HANA on HANA 2.0. Host prd-app01.'
    },
    guidedInvestigation: [
      {
        step: 1,
        title: 'Inspect Work Process State in SM50',
        instruction: 'Locate the BGD work process in SM50 running Z_BILLING_MASS.',
        expectedFinding: 'Work process is in status "RUN" with action "DB-Wait" on table BSEG. Elapsed time: 21,400 seconds.',
        interpretation: 'The ABAP engine is not consuming CPU; it is waiting for a response from SAP HANA.'
      },
      {
        step: 2,
        title: 'Check HANA Lock Tree via M_BLOCKED_TRANSACTIONS',
        instruction: 'Run SELECT * FROM SYS.M_BLOCKED_TRANSACTIONS in hdbsql.',
        expectedFinding: 'The thread for Z_BILLING_MASS is WAITING for record lock held by thread 4109 owned by user ACCOUNTING_01.',
        interpretation: 'The batch job is blocked waiting on an exclusive record lock held by an interactive user!'
      },
      {
        step: 3,
        title: 'Investigate Holding Session in SM04',
        instruction: 'Search SM04 for user ACCOUNTING_01.',
        expectedFinding: 'User logged in 7 hours ago to transaction FB02, opened document 190041, and left their PC locked overnight with the document in edit mode.',
        interpretation: 'An uncommitted GUI edit locked the exact financial accounting document required by the automated batch run.'
      }
    ],
    handsOnTask: {
      title: 'Construct a Cross-Tier Incident Diagnostic Tree',
      instructions: [
        'Outline the step-by-step diagnostic chain from SM50 to HANA M_BLOCKED_TRANSACTIONS to SM04.',
        'Explain why killing the blocked session would have accomplished nothing while the holding session remained open.',
        'Propose an architectural lock timeout policy to prevent user sessions from holding business locks indefinitely.'
      ],
      deliverable: 'A cross-tier slow job RCA framework.'
    },
    knowledgeCheck: [
      {
        id: 'w4d5_q1',
        question: 'When an SAP work process is in state "DB-Wait", where is the primary execution bottleneck located?',
        options: [
          'In the SAP GUI network router.',
          'In the database engine (the work process is waiting for a SQL query, commit, or lock release).',
          'In the local Linux terminal font cache.',
          'In the SAP message server.'
        ],
        correctAnswer: 1,
        explanation: 'DB-Wait indicates the work process has dispatched a database request over the network and is idle waiting for the DB to return results or complete a commit.'
      },
      {
        id: 'w4d5_q2',
        question: 'If a batch job is blocked on a database record lock, what must be done to resolve the issue?',
        options: [
          'Immediately reboot the SAP application server.',
          'Identify and resolve the HOLDING transaction or session that currently owns the lock.',
          'Delete the entire database table.',
          'Increase the number of spool processes.'
        ],
        correctAnswer: 1,
        explanation: 'In lock contention, the waiting process is a victim. You must identify the session holding the lock and have it commit, roll back, or terminate.'
      }
    ],
    tasks: [
      { id: 't1', text: 'Master the 4-step cross-tier troubleshooting protocol.' },
      { id: 't2', text: 'Learn to correlate SAP work process PIDs with database session IDs.' },
      { id: 't3', text: 'Understand database lock contention chains (blocker vs victim).' },
      { id: 't4', text: 'Complete the Week 4 summary knowledge check.' }
    ]
  }
];

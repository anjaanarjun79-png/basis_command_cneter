import { CurriculumSession } from '../../types';

export const week3Sessions: CurriculumSession[] = [
  {
    id: 'w3d1',
    week: 3,
    day: 1,
    title: 'SAP HANA Architecture, Services, Memory Allocation, and Traces',
    topic: 'Indexserver, Nameserver, System vs Tenant DB, Services, Memory Pools, and Alert Logs',
    domain: 'database',
    durationMinutes: 60,
    learningObjectives: [
      'Master SAP HANA multi-tenant database container (MDC) architecture.',
      'Differentiate the responsibilities of nameserver, indexserver, compileserver, preprocessor, and dpserver.',
      'Analyze HANA memory hierarchy: Physical RAM -> Global Allocation Limit -> Pool Memory -> Used Memory -> Column Store / Row Store.',
      'Inspect HANA developer traces (indexserver_alert_<host>.trc, nameserver_*.trc) in /usr/sap/<SID>/HDB<NR>/<host>/trace.',
      'Query HANA system views via hdbsql and HANA Cockpit (M_SERVICE_STATISTICS, M_HOST_RESOURCE_UTILIZATION).'
    ],
    technicalExplanation: `SAP HANA is an in-memory columnar relational database operating as a Multi-Tenant Database Container (MDC).

1. **Core Daemons & Services**:
   - **hdbnameserver**: Manages system topology, tenant database configuration, system replication status, and user management for SYSTEMDB. Port: \`3<instance_nr>01\`.
   - **hdbindexserver**: The primary computational workhorse of every tenant database. Contains the in-memory data engines (Column Store, Row Store), calculation engine, transaction manager, and query optimizer. Port: \`3<instance_nr>15\` (or \`3<instance_nr>40\` for tenants).
   - **hdbcompileserver**: Compiles SQLScript procedures and L-programs into machine code.
   - **hdbpreprocessor**: Analyzes and extracts unstructured text and spatial data.
   - **hdbdaemon**: Master watchdog that starts and monitors all other HANA services.

2. **HANA Memory Management Architecture**:
   - **Physical RAM**: Total hardware memory on the server.
   - **Global Allocation Limit (GAL)**: Maximum memory HANA is allowed to allocate from the OS (configured in \`global.ini\` -> \`[memorymanager] -> global_allocation_limit\`). Standard recommendation: ~90% of physical RAM.
   - **Pool Memory (Allocated Memory)**: Memory currently requested and reserved from Linux by the HANA memory manager.
   - **Used Memory**: Actual memory holding tables (Column store loaded in memory, Row store), caches, and temporary query execution structures.
   - **Free in Pool**: Memory already allocated from OS but currently idle and available for other queries.

3. **Key Diagnostic Views**:
   \`\`\`sql
   -- Check service memory and health
   SELECT SERVICE_NAME, PROCESS_ID, TOTAL_MEMORY_USED_SIZE/1024/1024 AS USED_MB,
          EFFECTIVE_ALLOCATION_LIMIT/1024/1024 AS LIMIT_MB
   FROM M_SERVICE_STATISTICS;
   \`\`\``,
    detailedStudyNotes: [
      'Tenant vs SystemDB: In MDC, each tenant database runs its own dedicated hdbindexserver process. If a tenant crashes, SYSTEMDB and other tenants remain active.',
      'Alert trace files: When HANA encounters internal memory crashes, OOMs, or assertion failures, it writes to indexserver_alert_<host>.trc. This file should be your first stop during database incidents.',
      'Column Store unload: When memory pressure occurs, HANA automatically unloads infrequently accessed column tables from RAM to disk. Row store tables MUST always reside in memory and cannot be unloaded.'
    ],
    toolsAndCommands: [
      { name: 'sapcontrol -nr <NR> -function GetProcessList', type: 'command', description: 'Checks HANA daemon and service process states.' },
      { name: 'hdbsql -i <NR> -u SYSTEM -d SYSTEMDB', type: 'command', description: 'Command-line SQL interface for SAP HANA administration.' },
      { name: 'HDB info', type: 'command', description: 'Displays running HANA processes, PIDs, and memory under <sid>adm.' },
      { name: 'DB50 / DBACOCKPIT', type: 'transaction', description: 'SAP GUI transaction for database monitoring and performance analysis.' }
    ],
    productionScenario: {
      ticketId: 'INC-2026-08301',
      severity: 'P1',
      title: 'HANA Tenant Indexserver Terminates During Month-End Reporting',
      description: 'At 11:30 UTC, users in SAP S/4HANA reported sudden disconnection with "DBSQL_SQL_ERROR". Investigation reveals tenant HDB instance indexserver crashed and is stuck in restart loop.',
      systemContext: 'HANA 2.0 SPS 06, SLES 15. 1.5TB RAM.'
    },
    guidedInvestigation: [
      {
        step: 1,
        title: 'Check HANA Process Status via HDB info',
        instruction: 'Log into HANA DB host as prdadm and run HDB info.',
        expectedFinding: 'hdbindexserver for tenant PRD has a new PID and is consuming 100% CPU in startup.',
        interpretation: 'The tenant indexserver terminated and is currently replaying redo logs from disk to rebuild memory.'
      },
      {
        step: 2,
        title: 'Inspect indexserver_alert Trace File',
        instruction: 'Search /usr/sap/PRD/HDB00/hana01/trace/indexserver_alert_hana01.trc for fatal errors.',
        expectedFinding: '[11:29:48] Fatal out of memory (OOM) error: Composite limit exceeded. Query memory limit 120GB requested 340GB.',
        interpretation: 'A runaway reporting query joined unindexed CDS views, exhausting the statement memory limit and triggering an internal OOM abort.'
      },
      {
        step: 3,
        title: 'Review Statement Memory Safeguards',
        instruction: 'Check statement_memory_limit in global.ini.',
        expectedFinding: 'statement_memory_limit was set to 0 (unlimited), allowing a single user query to consume the entire server memory pool.',
        interpretation: 'Setting statement_memory_limit protects the database from crashing due to rogue analytical queries.'
      }
    ],
    handsOnTask: {
      title: 'Analyze HANA Memory Statistics and Trace Headers',
      instructions: [
        'Query or simulate M_SERVICE_STATISTICS to calculate the percentage of memory used vs allocated.',
        'Document the difference between Column Store unloadable memory and non-unloadable Row Store memory.',
        'List the steps to identify the user and SQL statement responsible for a HANA OOM event from an OOM trace file.'
      ],
      deliverable: 'A standard troubleshooting procedure for SAP HANA memory exhaustion.'
    },
    knowledgeCheck: [
      {
        id: 'w3d1_q1',
        question: 'Which SAP HANA service hosts the SQL engine, Column Store, and Row Store for a tenant database?',
        options: ['hdbnameserver', 'hdbindexserver', 'hdbcompileserver', 'sapstartsrv'],
        correctAnswer: 1,
        explanation: 'hdbindexserver is the core database engine of an SAP HANA tenant, managing data storage, query execution, and transactions.'
      },
      {
        id: 'w3d1_q2',
        question: 'Can SAP HANA unload Row Store tables to disk when physical memory approaches its global allocation limit?',
        options: [
          'Yes; HANA unloads all tables alphabetically.',
          'No; Row Store tables must remain 100% memory resident at all times. Only Column Store tables can be unloaded.',
          'Yes; but only if the table is smaller than 1GB.',
          'Yes; if the OS swap space is configured above 64GB.'
        ],
        correctAnswer: 1,
        explanation: 'Row Store tables cannot be partially or fully unloaded; they must permanently reside in RAM. Column Store tables are columnar and can be dynamically loaded and unloaded as required.'
      }
    ],
    tasks: [
      { id: 't1', text: 'Study HANA MDC daemon responsibilities (nameserver vs indexserver).' },
      { id: 't2', text: 'Understand the HANA memory hierarchy from RAM to Used Memory.' },
      { id: 't3', text: 'Learn to read indexserver_alert trace files.' },
      { id: 't4', text: 'Complete the Day 1 Database knowledge check.' }
    ]
  },
  {
    id: 'w3d2',
    week: 3,
    day: 2,
    title: 'HANA Backups, Log Volume Saturation, and Recovery Prerequisites',
    topic: 'Data Backups vs Log Backups, Backup Catalog, Log Volume (log_mode=normal), and Disaster Recovery',
    domain: 'database',
    durationMinutes: 60,
    learningObjectives: [
      'Differentiate between HANA full data backups, differential/incremental backups, and automatic log backups.',
      'Understand how HANA redo log segments are written and automatically backed up to free log volume space.',
      'Diagnose log volume saturation (/hana/log at 100%) and resolve backup catalog locks.',
      'Analyze backup destinations (file, Backint third-party agents) and timeout thresholds.',
      'Verify backup catalog consistency and state prerequisites before initiating a database restore.'
    ],
    technicalExplanation: `In SAP HANA, data durability and point-in-time recovery are guaranteed by the combination of asynchronous savepoints and continuous redo logging.

1. **Savepoints vs Redo Logs**:
   - **Savepoint**: Every 5 minutes (default), dirty memory pages are flushed to the data volume (\`/hana/data\`).
   - **Redo Log**: Every committed database transaction is written synchronously to the active log segment in the log volume (\`/hana/log\`).

2. **The Log Volume Lifecycle & Saturation**:
   - HANA writes logs into fixed-size segments (typically 512MB or 1GB).
   - Once a segment is filled, HANA marks it as "Free for Backup".
   - When parameter \`log_mode = normal\`, the segment **cannot be overwritten** until it has been successfully copied by an automatic log backup!
   - **The Log Full Freeze**:
     - If the log backup destination (NFS share, Veeam, Commvault, Azure Backup) fills up or fails, HANA cannot back up closed segments.
     - New transactions continue filling segments until \`/hana/log\` reaches 100%.
     - **Result**: HANA database completely freezes all write operations! Any transaction attempting a COMMIT hangs indefinitely in \`LOG_BUFFER_WAIT\`.

3. **Emergency Log Volume Recovery Protocol**:
   \`\`\`sql
   -- Check log segment status
   SELECT HOST, SERVICE_NAME, TOTAL_LOG_SIZE/1024/1024 AS TOTAL_MB,
          USED_LOG_SIZE/1024/1024 AS USED_MB, FREE_LOG_SIZE/1024/1024 AS FREE_MB
   FROM M_LOG_BUFFERS;
   \`\`\`
   - Do NOT delete active \`.log\` files from \`/hana/log\` with \`rm\`! Doing so permanently corrupts the database.
   - Solution: Free space on the backup target filesystem, trigger an immediate log backup via hdbsql, or temporarily add an alternate log backup path in \`global.ini\`.`,
    detailedStudyNotes: [
      'NEVER delete files in /hana/log: Running rm on files in /hana/log will destroy uncommitted transactions and make the database impossible to restart without data loss!',
      'Backup catalog size: Over months, the backup catalog (log_backup_0_0_0_0.bak) can grow to hundreds of gigabytes if not truncated. Use BACKUP CATALOG DELETE to purge expired entries.',
      'Recovery prerequisites: To restore HANA to a specific point in time, you must have: 1. A valid data backup or snapshot prior to that time, 2. The backup catalog, and 3. An unbroken chain of log backups spanning from the data backup to the target timestamp.'
    ],
    toolsAndCommands: [
      { name: 'DB12', type: 'transaction', description: 'DBA Backup Console in SAP GUI: view data/log backup history and statuses.' },
      { name: 'df -h /hana/log /hana/data', type: 'command', description: 'Checks physical disk capacity of HANA database volumes.' },
      { name: 'hdbsql -u SYSTEM "BACKUP LOG USING FILE (\'/backup/emergency_log\')"', type: 'command', description: 'Manually triggers emergency log backup to alternate path.' }
    ],
    productionScenario: {
      ticketId: 'INC-2026-08302',
      severity: 'P1',
      title: 'HANA PRD Tenant Hanging: All Transactions Frozen in COMMIT',
      description: 'At 03:00, all SAP transactions froze. SM50 shows all DIA and UPD work processes in state "DB-Wait" with reason "Commit". HANA Studio reports Tenant Database PRD is alive but rejecting insert/update queries.',
      systemContext: 'HANA 2.0 SPS 07 on SLES 15. /hana/log size 512GB.'
    },
    guidedInvestigation: [
      {
        step: 1,
        title: 'Check Filesystem Capacity for /hana/log',
        instruction: 'Run df -h /hana/log.',
        expectedFinding: '/hana/log filesystem is at 100% (0 bytes free).',
        interpretation: 'The log volume is full, preventing the log engine from writing new redo entries.'
      },
      {
        step: 2,
        title: 'Investigate Log Backup Status in backup.log',
        instruction: 'Inspect /usr/sap/PRD/HDB00/hana01/trace/backup.log.',
        expectedFinding: 'Log backup failed: Cannot open file /backup/hana/log/log_backup_... (rc 28: No space left on device).',
        interpretation: 'The NFS backup storage partition filled up 4 hours ago, preventing automated log backups.'
      },
      {
        step: 3,
        title: 'Restore Backup Destination and Force Log Flush',
        instruction: 'Free disk space on the NFS backup target, then trigger BACKUP LOG in hdbsql.',
        expectedFinding: 'HANA immediately writes 80 queued log segments to the backup target; /hana/log drops from 100% to 22%.',
        interpretation: 'Freeing the backup destination allowed HANA to release the backed-up segments, instantly unfreezing all SAP work processes.'
      }
    ],
    handsOnTask: {
      title: 'Analyze HANA Backup Catalog and Log Chain',
      instructions: [
        'Document the critical difference between log_mode=normal and log_mode=overwrite.',
        'Explain why deleting files directly from /hana/log with "rm" is a catastrophic operational mistake.',
        'Draft an emergency procedure for redirecting log backups to a temporary mount when primary backup storage fails.'
      ],
      deliverable: 'An emergency SOP for resolving HANA log volume full conditions.'
    },
    knowledgeCheck: [
      {
        id: 'w3d2_q1',
        question: 'What happens in SAP HANA when /hana/log reaches 100% capacity under log_mode=normal?',
        options: [
          'HANA switches automatically to read-only memory mode without user impact.',
          'All database write operations freeze immediately, blocking transactions during COMMIT.',
          'HANA automatically deletes old data backups.',
          'The Linux kernel reboots the server.'
        ],
        correctAnswer: 1,
        explanation: 'Under log_mode=normal, HANA cannot overwrite unbacked-up log segments. If the disk fills, all write transactions halt to guarantee zero data loss.'
      },
      {
        id: 'w3d2_q2',
        question: 'Why must an administrator NEVER execute "rm" to delete redo log files from /hana/log?',
        options: [
          'Because the root user does not own the files.',
          'Redo log files contain uncommitted changes and disaster-recovery redo streams; deleting them permanently corrupts database consistency.',
          'Because Linux will delete the kernel.',
          'Because HANA will automatically rename them to .tmp.'
        ],
        correctAnswer: 1,
        explanation: 'Active and closed log segments in /hana/log contain transaction history that has not yet been reconciled or backed up. Deleting them corrupts the database.'
      }
    ],
    tasks: [
      { id: 't1', text: 'Understand savepoints vs continuous redo logging in SAP HANA.' },
      { id: 't2', text: 'Learn why log volume saturation freezes all write transactions.' },
      { id: 't3', text: 'Master the safe remediation steps for /hana/log 100% full.' },
      { id: 't4', text: 'Complete the Day 2 Database knowledge check.' }
    ]
  },
  {
    id: 'w3d3',
    week: 3,
    day: 3,
    title: 'Oracle Database Troubleshooting: States, Alert Log, Listener, and Tablespaces',
    topic: 'Instance vs Database State, alert_<SID>.log, lsnrctl, Tablespace Autoextend, and Archivelog Saturation',
    domain: 'database',
    durationMinutes: 60,
    learningObjectives: [
      'Master the distinction between Oracle Instance states: SHUTDOWN -> NOMOUNT -> MOUNT -> OPEN.',
      'Diagnose startup aborts using the Oracle alert log (alert_<SID>.log).',
      'Manage Oracle listener diagnostics, service registration, and TNS resolution (sqlplus, tnsping).',
      'Diagnose tablespace space exhaustion (ORA-01653, ORA-01654) and autoextend limits.',
      'Resolve archivelog destination saturation (ORA-00257) safely and verify archiver recovery.'
    ],
    technicalExplanation: `SAP systems on Oracle require deep familiarity with Oracle 19c administration and error handling.

1. **Oracle 4-Stage Startup Lifecycle**:
   - **SHUTDOWN**: No background processes or shared memory (SGA) exist.
   - **NOMOUNT**: Instance allocated in memory (SGA created, background processes PMON, SMON, DBWn, LGWR started). Reads \`spfile<SID>.ora\` or \`init<SID>.ora\`.
   - **MOUNT**: Instance locates and opens the database **control files** (\`control01.ctl\`). Datafiles and redo logs are checked but not yet accessible to users.
   - **OPEN**: All database datafiles and online redo logs are opened. Consistency is verified; users can execute transactions.

2. **The Oracle Alert Log**:
   - Location: \`/oracle/<SID>/saptrace/diag/rdbms/<sid>/<SID>/trace/alert_<SID>.log\`.
   - Records every administrative event, startup phase, checkpoint error, ORA-00600 internal crash, deadlock, and archiver hang.

3. **Common Production Incidents**:
   - **ORA-00257: archiver error**: The archive log destination (e.g. \`/oracle/<SID>/oraarch\`) is 100% full. The LGWR process cannot switch online redo logs because the archiver (ARCn) cannot copy them. Result: All database transactions freeze!
   - **ORA-01653: unable to extend table <TABLE> by <N> in tablespace <TS>**: A database tablespace has reached its physical datafile size limit or disk capacity, blocking application inserts.
   - **ORA-01034: ORACLE not available**: The Oracle instance is stopped or in NOMOUNT/MOUNT state while SAP expects OPEN.`,
    detailedStudyNotes: [
      'BR*Tools integration: In SAP on Oracle, use BR*Tools (brbackup, brarchive, brspace) for administrative maintenance. For example, brconnect -u / -c -f check checks database health.',
      'Tablespace extension: If a tablespace fills up, execute brspace -f tsextend to add a new datafile or enable autoextend on existing datafiles.',
      'Listener registration: If lsnrctl status shows "The listener supports no services", the database instance has not yet dynamically registered itself with the listener, or LOCAL_LISTENER parameter is misconfigured.'
    ],
    toolsAndCommands: [
      { name: 'sqlplus / as sysdba', type: 'command', description: 'Direct DBA console to query V$ views and manage instance state.' },
      { name: 'lsnrctl status', type: 'command', description: 'Checks Oracle listener status, port 1527, and registered service handlers.' },
      { name: 'tail -f alert_<SID>.log', type: 'command', description: 'Live monitoring of Oracle alert log for ORA- errors.' },
      { name: 'DB02', type: 'transaction', description: 'SAP GUI transaction for Tablespace and Database Storage management.' }
    ],
    productionScenario: {
      ticketId: 'INC-2026-08303',
      severity: 'P1',
      title: 'Production ERP Frozen - ORA-00257 Archiver Error',
      description: 'All SAP work processes entered DB-Wait state. SAP GUI sessions hang indefinitely on any save action. dev_w0 reports "DB-Error: ORA-00257: archiver error. Connect AS SYSDBA only until freed".',
      systemContext: 'SAP ERP 6.0 on Oracle 19c on RHEL 8.'
    },
    guidedInvestigation: [
      {
        step: 1,
        title: 'Inspect Filesystem Capacity of Archive Destination',
        instruction: 'Run df -h /oracle/PRD/oraarch.',
        expectedFinding: '/oracle/PRD/oraarch is at 100% capacity (0 MB free).',
        interpretation: 'The archiver process (ARC0) cannot write new archived redo logs.'
      },
      {
        step: 2,
        title: 'Check Oracle Alert Log for Confirmation',
        instruction: 'Inspect the bottom of alert_PRD.log.',
        expectedFinding: 'ARC0: Archival stopped; destination /oracle/PRD/oraarch is out of space. LGWR: Cannot switch redo log; all online logs require archiving.',
        interpretation: 'Confirmed: Online redo log ring buffer is full. No further commits are allowed until disk space is freed.'
      },
      {
        step: 3,
        title: 'Safely Back Up and Purge Archived Logs via brarchive',
        instruction: 'Execute brarchive -u / -c -p initPRD.sap -b -d util_file -sd.',
        expectedFinding: 'brarchive backs up old archived logs to backup storage and safely deletes them (-sd flag), freeing 80GB.',
        interpretation: 'ARC0 immediately resumes archiving; LGWR clears the redo stall; SAP work processes instantly resume normal processing.'
      }
    ],
    handsOnTask: {
      title: 'Troubleshoot Oracle Tablespace and Listener Failures',
      instructions: [
        'Document the exact sequence of Oracle instance states during startup (NOMOUNT -> MOUNT -> OPEN).',
        'Explain the risk of manually deleting archivelog files with rm vs using brarchive or RMAN.',
        'Write the brspace command syntax to extend a full tablespace PSAPSR3 by 10GB.'
      ],
      deliverable: 'A technical reference card for Oracle production database incident triage.'
    },
    knowledgeCheck: [
      {
        id: 'w3d3_q1',
        question: 'What is the root cause of Oracle error "ORA-00257: archiver error. Connect AS SYSDBA only until freed"?',
        options: [
          'The database password file is corrupted.',
          'The archive log destination disk is full, preventing the background archiver from copying filled redo logs.',
          'The SAP license in SM52 has expired.',
          'The Oracle SGA memory has leaked into swap.'
        ],
        correctAnswer: 1,
        explanation: 'ORA-00257 indicates the archivelog directory is 100% full. The database freezes all updates until disk space is restored.'
      },
      {
        id: 'w3d3_q2',
        question: 'In which Oracle instance state are database datafiles checked and opened for application access?',
        options: ['NOMOUNT', 'MOUNT', 'OPEN', 'RESTRICTED'],
        correctAnswer: 2,
        explanation: 'In the OPEN state, all datafiles and online redo logs are opened, ensuring consistency and enabling regular user and SAP application connections.'
      }
    ],
    tasks: [
      { id: 't1', text: 'Master Oracle startup phases: NOMOUNT, MOUNT, OPEN.' },
      { id: 't2', text: 'Learn to read alert_<SID>.log and isolate ORA- error codes.' },
      { id: 't3', text: 'Understand ORA-00257 archivelog saturation and safe remediation.' },
      { id: 't4', text: 'Complete the Day 3 Database knowledge check.' }
    ]
  },
  {
    id: 'w3d4',
    week: 3,
    day: 4,
    title: 'SAP-to-Database Connectivity: Separating App, Network, and DB Layers',
    topic: 'Connection Failures, DNS, Ports, DB Clients, SSFS, and Layer Isolation',
    domain: 'database',
    durationMinutes: 60,
    learningObjectives: [
      'Isolate whether a connection failure is caused by Network/DNS, Database Engine, or SAP DB-Client configuration.',
      'Test direct database connectivity using R3trans, hdbsql, sqlplus, and tnsping.',
      'Verify SAP Secure Store (SSFS) credentials and database schema user synchronization.',
      'Diagnose firewall drops, idle connection timeouts, and MTU packet size mismatches between SAP and DB tiers.',
      'Read and decode trans.log to identify the exact failing OSI layer.'
    ],
    technicalExplanation: `When an SAP application server cannot connect to its database, analysts frequently waste hours arguing whether it is an "application problem," "network problem," or "database problem."

**The Systematic 3-Layer Isolation Protocol**:

1. **Layer 1: Network & Name Resolution (OS / Infrastructure)**:
   - Can the application host resolve the DB hostname? (\`getent hosts <dbhost>\`).
   - Is the target TCP port open and reachable without firewall drop?
     - HANA: Port \`3<instance_nr>15\` or \`3<instance_nr>13\`.
     - Oracle: Port \`1527\` (standard SAP) or \`1521\`.
     - Test: \`nc -zv <dbhost> <port>\` or \`curl -v telnet://<dbhost>:<port>\`.

2. **Layer 2: Native Database Client & Authentication (DB Client)**:
   - Can the native DB utility connect from the app server using configured credentials?
     - HANA: \`hdbsql -n <dbhost>:3<instance_nr>15 -u <user> -p <pass>\`.
     - Oracle: \`sqlplus <sapuser>/<password>@<TNS_ALIAS>\` or \`tnsping <TNS_ALIAS>\`.
   - If native utility connects, the network, firewall, and database engine are 100% healthy!

3. **Layer 3: SAP Kernel & Secure Store (SAP Application)**:
   - Run \`R3trans -d\` as \`<sid>adm\`.
   - Inspect \`trans.log\`:
     - If SSFS cannot read key file (\`/usr/sap/<SID>/SYS/global/security/rsecssfs/data\`), credentials cannot be decrypted.
     - If environment variables (\`DIR_LIBRARY\`, \`dbms_type\`, \`HDB_SQL_CLIENT\`) are missing, kernel cannot load DB library.`,
    detailedStudyNotes: [
      'The "tnsping myth": tnsping only verifies that the Oracle listener responds on the remote host; it does NOT verify database authentication, tablespace health, or instance OPEN state!',
      'HANA SSFS keys: In modern SAP NetWeaver on HANA, database passwords are never stored in plain text. They are kept in the Secure Store in the File System (SSFS). Parameter rsecssfs/data_path specifies location.',
      'Idle connection timeouts: Hardware firewalls or Azure load balancers often have a 4-minute TCP idle timeout. If SAP work processes hold idle DB connections, the firewall drops the connection silently, resulting in "Connection reset by peer" during subsequent queries.'
    ],
    toolsAndCommands: [
      { name: 'R3trans -d', type: 'command', description: 'Executes standard SAP kernel database connection check and produces trans.log.' },
      { name: 'nc -zv <HOST> <PORT>', type: 'command', description: 'Tests raw TCP port reachability without protocol handshakes.' },
      { name: 'rsecssfx get DB_PASSWORD', type: 'command', description: 'Validates SSFS key access and stored database password integrity.' },
      { name: 'tnsping <ALIAS>', type: 'command', description: 'Tests Oracle TNS resolution and network roundtrip to listener.' }
    ],
    productionScenario: {
      ticketId: 'INC-2026-08304',
      severity: 'P1',
      title: 'AAS01 Fails to Connect to HANA Tenant After Security Patching',
      description: 'Following OS security updates on application server host prd-app01, the PAS instance starts normally, but AAS01 on prd-app02 fails to start with "DB connection lost".',
      systemContext: 'S/4HANA 2022 on SUSE Linux. HANA 2.0 SPS 06.'
    },
    guidedInvestigation: [
      {
        step: 1,
        title: 'Run R3trans -d on Failing AAS01 Host',
        instruction: 'Log into prd-app02 as prdadm and run R3trans -d.',
        expectedFinding: 'R3trans finished with return code 12. trans.log reveals SQL error 10709: Connect failed (connection timed out).',
        interpretation: 'AAS01 cannot reach the HANA SQL port over TCP.'
      },
      {
        step: 2,
        title: 'Probe TCP Port 30015 from AAS01 to DB Host',
        instruction: 'Run nc -zv -w 5 prd-hdb01 30015.',
        expectedFinding: 'Connection timed out (no response).',
        interpretation: 'Traffic is being blocked or dropped at the network or firewall layer.'
      },
      {
        step: 3,
        title: 'Audit Host Firewall Rules on DB Host',
        instruction: 'Check firewalld status on prd-hdb01.',
        expectedFinding: 'firewalld was enabled by the security update, and port 30015 was not added to the trusted zone for prd-app02 subnet.',
        interpretation: 'The OS security patch restarted the host firewall, blocking incoming SQL connections from the new application server subnet.'
      }
    ],
    handsOnTask: {
      title: 'Decouple Connectivity Incidents Across the 3 Layers',
      instructions: [
        'Outline a 3-step decision flow to identify whether a DB error is Network, DB Engine, or SAP Client related.',
        'Explain why tnsping returning OK does NOT guarantee that SAP can log in to the database.',
        'Detail how to configure TCP keepalive in SAP profiles to prevent firewall idle timeouts.'
      ],
      deliverable: 'A connectivity isolation cheat sheet.'
    },
    knowledgeCheck: [
      {
        id: 'w3d4_q1',
        question: 'Does a successful tnsping response confirm that an SAP application will be able to read database tables?',
        options: [
          'Yes, tnsping performs a full query on system tables.',
          'No, tnsping only proves network reachability to the Oracle listener process; it does not test authentication, database open state, or table access.',
          'Yes, provided the listener is running on port 1527.',
          'Only if executed as root.'
        ],
        correctAnswer: 1,
        explanation: 'tnsping only contacts the listener to measure network round-trip time. It does not authenticate or query the database engine.'
      },
      {
        id: 'w3d4_q2',
        question: 'Where does an SAP system on HANA securely store database schema credentials so that passwords are not exposed in plaintext files?',
        options: [
          'In /etc/passwd.',
          'In the Secure Store in the File System (SSFS).',
          'In the SAP GUI configuration file.',
          'In the dev_disp log file.'
        ],
        correctAnswer: 1,
        explanation: 'SAP NetWeaver utilizes SSFS (Secure Storage in File System) with encrypted key files to store database connection passwords securely.'
      }
    ],
    tasks: [
      { id: 't1', text: 'Master the 3-layer connectivity isolation protocol.' },
      { id: 't2', text: 'Understand R3trans return codes and trans.log interpretation.' },
      { id: 't3', text: 'Learn why tnsping cannot replace R3trans or sqlplus.' },
      { id: 't4', text: 'Complete the Day 4 Database knowledge check.' }
    ]
  },
  {
    id: 'w3d5',
    week: 3,
    day: 5,
    title: 'Database Incident Comparison: HANA Log Backup vs Oracle Connectivity',
    topic: 'Comparative Analysis: Evidence Required Before Action, Impact Comparison, Safe Remediation',
    domain: 'database',
    durationMinutes: 60,
    learningObjectives: [
      'Compare root-cause evidence requirements between SAP HANA and Oracle database incidents.',
      'Contrast recovery procedures for log volume saturation in HANA vs archivelog saturation in Oracle.',
      'Evaluate the risk of premature database restarts during storage saturation incidents.',
      'Formulate precise root-cause hypotheses supported by primary log artifacts.',
      'Draft two production-grade RCA sections comparing both database operational architectures.'
    ],
    technicalExplanation: `While SAP HANA and Oracle serve the same fundamental purpose (relational database engine for SAP), their internal architectures demand distinctly different diagnostic techniques.

**Comparative Architecture Matrix**:

| Feature / Scenario | SAP HANA 2.0 | Oracle 19c |
|---|---|---|
| **Architecture** | In-Memory, Column/Row Store, MDC | Disk-based, SGA buffer cache, RDBMS |
| **Primary Process** | \`hdbindexserver\` (Tenant) | \`oracle<SID>\` (Shadow + Background) |
| **Alert Log** | \`indexserver_alert_<host>.trc\` | \`alert_<SID>.log\` |
| **Redo Log Full** | \`/hana/log\` 100% full -> transactions freeze in COMMIT | \`/oracle/<SID>/oraarch\` 100% -> ORA-00257 archiver freeze |
| **Safe Fix for Full Log** | Free backup target storage -> trigger \`BACKUP LOG\` | Run \`brarchive\` to backup and delete (\`-sd\`) archived logs |
| **Connection Check** | \`hdbsql\` / \`R3trans -d\` | \`sqlplus\` / \`R3trans -d\` |
| **Credential Store** | SSFS (\`rsecssfx\`) | SSFS or \`SAPUSER\` table |

**The Danger of Blind Restarts**:
- If an admin restarts HANA when \`/hana/log\` is 100% full, the database **will not start**! It will abort during redo log replay because there is no space to allocate transaction restart blocks.
- If an admin restarts Oracle during ORA-00257, the instance will mount but fail to open cleanly, prolonging outage duration.
- **Golden Rule**: Always remediate underlying storage saturation before attempting any database restart!`,
    detailedStudyNotes: [
      'HANA memory reload time: Following an unplanned restart, HANA takes 30-90 minutes to reload Column Store tables into RAM as queries request them. Initial performance will be degraded until caches warm up.',
      'Oracle checkpoint stall: In Oracle, if log writer (LGWR) cannot write because redo log files cannot be archived, the database initiates a checkpoint stall, holding all buffer pins.',
      'Evidence collection: Capture disk usage (df -hT), alert logs, and process lists BEFORE applying remediation so that proof is preserved for the post-incident RCA.'
    ],
    toolsAndCommands: [
      { name: 'R3trans -d', type: 'command', description: 'SAP DB connectivity check.' },
      { name: 'df -hT', type: 'command', description: 'Filesystem block usage inspection.' },
      { name: 'hdbsql', type: 'command', description: 'HANA command line SQL client.' },
      { name: 'sqlplus', type: 'command', description: 'Oracle command line SQL client.' }
    ],
    productionScenario: {
      ticketId: 'INC-2026-08305',
      severity: 'P1',
      title: 'Dual Incident Drill: Contrast HANA Log Freeze with Oracle Listener Drop',
      description: 'You are presented with two parallel enterprise incidents. Incident A: HANA log volume saturated due to a stalled backup agent. Incident B: Oracle database open, but SAP connections fail due to listener exhaustion.',
      systemContext: 'Multi-system landscape comparison.'
    },
    guidedInvestigation: [
      {
        step: 1,
        title: 'Evaluate Incident A Evidence (HANA)',
        instruction: 'Review /hana/log usage, backup.log, and indexserver_alert trace.',
        expectedFinding: '/hana/log at 100%. backup.log reports "Connection to backup server lost".',
        interpretation: 'Root cause is external backup target unavailability leading to local log saturation.'
      },
      {
        step: 2,
        title: 'Evaluate Incident B Evidence (Oracle)',
        instruction: 'Review lsnrctl status, sqlplus local connection, and trans.log.',
        expectedFinding: 'Local sqlplus connects immediately; remote R3trans fails with ORA-12541: TNS:no listener.',
        interpretation: 'Root cause is listener process termination; database engine itself is completely intact.'
      },
      {
        step: 3,
        title: 'Formulate Divergent Remediation Plans',
        instruction: 'Determine why bouncing the database in Incident A would cause disaster while restarting the listener in Incident B is completely safe.',
        expectedFinding: 'In A, restarting HANA with 0 free log space aborts startup. In B, restarting the listener does not disrupt active DB sessions.',
        interpretation: 'Understanding database engine dependencies prevents compounding production outages.'
      }
    ],
    handsOnTask: {
      title: 'Comparative RCA Authoring in RCA Notebook',
      instructions: [
        'Open the RCA Notebook.',
        'Draft an incident report comparing a HANA log saturation incident with an Oracle ORA-00257 incident.',
        'Highlight the critical preventive controls required for both platforms.'
      ],
      deliverable: 'A comparative RCA report filed in the notebook.'
    },
    knowledgeCheck: [
      {
        id: 'w3d5_q1',
        question: 'Why is restarting an SAP HANA database when /hana/log is 100% full dangerous?',
        options: [
          'HANA will automatically delete all tenant databases.',
          'The database will fail to complete crash-recovery startup because it cannot allocate log buffers during redo replay, prolonging the outage.',
          'It changes the HANA license key.',
          'The Linux OS will wipe the /usr/sap directory.'
        ],
        correctAnswer: 1,
        explanation: 'During startup recovery, HANA must write compensation log records and transaction entries. If the log disk has 0 bytes free, the startup sequence will abort.'
      },
      {
        id: 'w3d5_q2',
        question: 'What is the primary difference in how redo logs are cleared between SAP HANA and Oracle with BR*Tools?',
        options: [
          'Oracle does not use redo logs.',
          'HANA handles automatic log backups natively via the database log backup engine; Oracle in SAP landscapes typically relies on brarchive or RMAN scheduled jobs.',
          'HANA stores redo logs in RAM only.',
          'Oracle requires an OS reboot to archive logs.'
        ],
        correctAnswer: 1,
        explanation: 'HANA automatically triggers internal log backups whenever a log segment fills or the timeout expires. Oracle requires an external tool (such as brarchive or RMAN) to back up and purge archivelogs.'
      }
    ],
    tasks: [
      { id: 't1', text: 'Compare HANA MDC architecture with Oracle 19c dedicated server model.' },
      { id: 't2', text: 'Understand why storage full conditions must be resolved prior to DB restarts.' },
      { id: 't3', text: 'Document the recovery prerequisites for point-in-time recovery on both engines.' },
      { id: 't4', text: 'Complete the Week 3 summary knowledge check.' }
    ]
  }
];

import { KnowledgeCheckQuestion } from '../types';

export interface QuizQuestion extends KnowledgeCheckQuestion {
  week: number;
  domain: string;
  difficulty: 'intermediate' | 'advanced';
}

export const quizBank: QuizQuestion[] = [
  // Week 1 Questions
  {
    id: 'quiz_w1_1',
    week: 1,
    domain: 'architecture',
    difficulty: 'intermediate',
    question: 'In SAP NetWeaver architecture, what is the critical operational consequence if the Enqueue Server crashes in a system that does NOT have an Enqueue Replication Server (ERS)?',
    options: [
      'The system automatically switches to Oracle database locks without disruption.',
      'The entire SAP instance crashes, all logical locks in memory are lost, and all active transactions are rolled back.',
      'Only background jobs are affected; dialog users can continue working.',
      'The message server takes over the lock table within 2 seconds.'
    ],
    correctAnswer: 1,
    explanation: 'The Enqueue Server manages the lock table in volatile RAM. Without ERS or cluster replication, an Enqueue crash destroys the lock table, forcing all connected instances to abort to prevent data inconsistency.',
  },
  {
    id: 'quiz_w1_2',
    week: 1,
    domain: 'architecture',
    difficulty: 'intermediate',
    question: 'On an SAP application server host, what is the default HTTP port for the sapstartsrv management daemon on instance number 02?',
    options: ['3202', '50213', '50214', '3602'],
    correctAnswer: 1,
    explanation: 'sapstartsrv listens on 5<NR>13 for HTTP and 5<NR>14 for HTTPS. For instance 02, the HTTP port is 50213.',
  },
  {
    id: 'quiz_w1_3',
    week: 1,
    domain: 'architecture',
    difficulty: 'advanced',
    question: 'When analyzing dev_disp, you observe "DpShmCreate: ShmCreate (key: 100) failed (rc = 28: No space left on device)", but df -h /usr/sap shows 50GB free. What is the root cause?',
    options: [
      'The SAP GUI license has expired.',
      'System-wide IPC shared memory limits (kernel.shmmax / shmall) or tmpfs resources are exhausted at the Linux OS level.',
      'The Oracle listener is stopped.',
      'The dev_w0 trace file is corrupt.'
    ],
    correctAnswer: 1,
    explanation: 'Linux errno 28 (ENOSPC) during shared memory allocation indicates that OS-level IPC resources or shared memory page allocations (kernel.shmmax/shmall) are saturated.',
  },
  {
    id: 'quiz_w1_4',
    week: 1,
    domain: 'architecture',
    difficulty: 'intermediate',
    question: 'What does a return code of 0012 from R3trans -d signify?',
    options: [
      'Database connection succeeded with 12 warnings.',
      'A severe database connection failure occurred; detailed database errors (such as ORA- or HDB codes) are recorded in trans.log.',
      'The database has 12 inactive tables.',
      'The SAP dispatcher has started.'
    ],
    correctAnswer: 1,
    explanation: 'Return code 0012 is the standard R3trans failure code indicating that an authenticated database session could not be established.',
  },
  {
    id: 'quiz_w1_5',
    week: 1,
    domain: 'architecture',
    difficulty: 'intermediate',
    question: 'Why does "Server was rebooted" fail as a root cause in an enterprise Root Cause Analysis (RCA) report?',
    options: [
      'Reboots are prohibited by SAP standard contracts.',
      'Rebooting is an emergency restoration workaround; it does not identify the initiating flaw or prevent future recurrence.',
      'Because only database reboots count.',
      'Because reboots delete the system log.'
    ],
    correctAnswer: 1,
    explanation: 'A reboot restores operational state, but the underlying vulnerability (memory leak, configuration flaw, runaway query) remains uncorrected.',
  },
  {
    id: 'quiz_w1_6',
    week: 1,
    domain: 'architecture',
    difficulty: 'advanced',
    question: 'Which developer trace in /usr/sap/<SID>/<INSTANCE>/work captures HTTP/HTTPS port binding and SSL/TLS certificate negotiation?',
    options: ['dev_disp', 'dev_w0', 'dev_icm', 'dev_ms'],
    correctAnswer: 2,
    explanation: 'dev_icm records all activities of the Internet Communication Manager, including socket bindings, SSL handshakes, and WebGUI requests.',
  },
  {
    id: 'quiz_w1_7',
    week: 1,
    domain: 'architecture',
    difficulty: 'intermediate',
    question: 'Which transaction in SAP GUI allows an administrator to browse developer trace files directly without OS shell access?',
    options: ['SM50', 'ST11', 'DB02', 'SM13'],
    correctAnswer: 1,
    explanation: 'ST11 is the standard transaction to view instance developer trace files (dev_disp, dev_w*, dev_icm, dev_rd).',
  },
  {
    id: 'quiz_w1_8',
    week: 1,
    domain: 'architecture',
    difficulty: 'advanced',
    question: 'If an application server fails to start with "NiConnect to message server failed (port 3901)", what should the Basis engineer check first?',
    options: [
      'Check if the Oracle alert log contains ORA-00060.',
      'Verify whether the ASCS message server is running and port 3901 is reachable without network or firewall blocks.',
      'Increase the number of dialog work processes in SM50.',
      'Reinstall the SAP GUI.'
    ],
    correctAnswer: 1,
    explanation: 'Application servers must register with the ASCS message server at startup via port 39<ASCS_NR>. Port unreachability halts dispatcher startup.',
  },
  {
    id: 'quiz_w1_9',
    week: 1,
    domain: 'architecture',
    difficulty: 'intermediate',
    question: 'What is the role of the SAP Host Agent (saphostexec)?',
    options: [
      'It manages user passwords in client 000.',
      'It runs independently as root/sapadm on ports 1128/1129 to supply host metrics, OS statistics, and instance lifecycle controls to monitoring tools.',
      'It compiles ABAP programs.',
      'It formats PDF print spools.'
    ],
    correctAnswer: 1,
    explanation: 'SAP Host Agent is an independent daemon providing standardized host and instance control/monitoring APIs.',
  },
  {
    id: 'quiz_w1_10',
    week: 1,
    domain: 'architecture',
    difficulty: 'advanced',
    question: 'In an incident timeline, why is establishing sub-second causal order across multiple logs critical?',
    options: [
      'It satisfies corporate formatting requirements.',
      'It proves whether early infrastructure events (e.g. storage drop) triggered subsequent application symptoms (e.g. work process freeze).',
      'It speeds up database queries.',
      'It allows the engineer to close the ticket without writing notes.'
    ],
    correctAnswer: 1,
    explanation: 'Without precise timestamp alignment, engineers confuse secondary symptoms with the initial trigger.',
  },

  // Week 2 Questions
  {
    id: 'quiz_w2_1',
    week: 2,
    domain: 'linux',
    difficulty: 'intermediate',
    question: 'Why would a Linux system raise "No space left on device" (errno 28) when df -h shows 40GB free on /usr/sap?',
    options: [
      'The CPU temperature is too high.',
      'The filesystem has exhausted 100% of its available inodes (df -i shows IUse% 100%).',
      'The user exceeded their printer quota.',
      'The network switch dropped packets.'
    ],
    correctAnswer: 1,
    explanation: 'Every file and directory consumes an inode. If all inodes are consumed by millions of small files, no new files can be created regardless of free disk space.',
  },
  {
    id: 'quiz_w2_2',
    week: 2,
    domain: 'linux',
    difficulty: 'advanced',
    question: 'Why does df -h continue to report 99% utilization after an admin deletes a 50GB file with "rm"?',
    options: [
      'The Linux kernel delays disk updates by 24 hours.',
      'An active running process still holds an open file descriptor to the file; disk blocks are only freed once the descriptor is closed or truncated.',
      'The file was moved to the desktop trash folder.',
      'The disk controller cache is corrupted.'
    ],
    correctAnswer: 1,
    explanation: 'In Linux, unlinking a file (rm) removes its name, but disk blocks remain allocated in the filesystem until all processes holding open file handles close them.',
  },
  {
    id: 'quiz_w2_3',
    week: 2,
    domain: 'linux',
    difficulty: 'advanced',
    question: 'How can an administrator instantly free disk space from an unlinked open file held by PID 1420 on file descriptor 8 without killing the process?',
    options: [
      'Execute kill -9 1420.',
      'Execute "> /proc/1420/fd/8" to truncate the file descriptor directly.',
      'Run umount -f /usr/sap.',
      'Run chown root /proc/1420.'
    ],
    correctAnswer: 1,
    explanation: 'Truncating the descriptor via /proc/<PID>/fd/<FD> zeroes the allocated disk blocks immediately while keeping the process running.',
  },
  {
    id: 'quiz_w2_4',
    week: 2,
    domain: 'linux',
    difficulty: 'intermediate',
    question: 'Why must an administrator always use the -x flag when running du on an SAP Linux host (e.g. du -xhd 1 /usr/sap)?',
    options: [
      'It speeds up the CPU.',
      'It restricts du strictly to the local filesystem, preventing it from traversing into remote multi-terabyte NFS mounts like /sapmnt.',
      'It prints results in hexadecimal.',
      'It deletes temporary files.'
    ],
    correctAnswer: 1,
    explanation: 'The -x flag prevents crossing mount boundaries, preventing du from crawling massive network shares.',
  },
  {
    id: 'quiz_w2_5',
    week: 2,
    domain: 'linux',
    difficulty: 'intermediate',
    question: 'In vmstat 1 5 output, what does continuous non-zero activity in the "si" (swap in) and "so" (swap out) columns indicate?',
    options: [
      'Normal network throughput.',
      'Active memory thrashing: physical RAM is saturated, forcing the OS to swap memory pages to disk, causing severe latency.',
      'Database checkpointing.',
      'SAP kernel compilation.'
    ],
    correctAnswer: 1,
    explanation: 'Active swap paging causes access latencies to jump from nanoseconds (RAM) to milliseconds (Disk), degrading performance.'
  },
  {
    id: 'quiz_w2_6',
    week: 2,
    domain: 'linux',
    difficulty: 'advanced',
    question: 'What is the "Hidden Mount Point" trap in Linux filesystem administration?',
    options: [
      'A virus that hides files in /etc.',
      'Writing data to a directory before an external filesystem is mounted over it, causing the data to become invisible to du but remain allocated on the parent filesystem.',
      'An encrypted partition that cannot be read.',
      'A broken symlink.'
    ],
    correctAnswer: 1,
    explanation: 'Mounting over a non-empty directory hides the existing files from view while keeping the parent partition space consumed.'
  },
  {
    id: 'quiz_w2_7',
    week: 2,
    domain: 'linux',
    difficulty: 'intermediate',
    question: 'Which modern Linux command replaces netstat for inspecting listening TCP sockets and owning PIDs?',
    options: ['ss -tulnp', 'ping -c 4', 'traceroute', 'ifconfig'],
    correctAnswer: 0,
    explanation: 'ss -tulnp queries kernel socket tables directly and is faster and more reliable than deprecated netstat.'
  },
  {
    id: 'quiz_w2_8',
    week: 2,
    domain: 'linux',
    difficulty: 'advanced',
    question: 'Why does the SAP kernel binary icmbnd require setuid root permissions (-rwsr-xr-x owned by root)?',
    options: [
      'To read passwords from /etc/shadow.',
      'On Linux, unprivileged users (<sid>adm) cannot bind to network ports below 1024 (e.g. HTTP 80 and HTTPS 443) without root privileges.',
      'To enable SSL encryption.',
      'To reboot the server.'
    ],
    correctAnswer: 1,
    explanation: 'Linux restricts ports < 1024 to root. icmbnd uses setuid root to bind ports 80 and 443 on behalf of the unprivileged SAP instance.'
  },
  {
    id: 'quiz_w2_9',
    week: 2,
    domain: 'linux',
    difficulty: 'intermediate',
    question: 'In top or vmstat output, what does an I/O Wait (%wa) value of 65% indicate?',
    options: [
      'The server is 65% idle with plenty of capacity.',
      'The CPU is spending 65% of its time idle waiting for disk or storage read/write operations to complete.',
      '65 users are logged into SAP.',
      'The network interface is 65% full.'
    ],
    correctAnswer: 1,
    explanation: '%wa measures wasted CPU cycles waiting for slow storage. High wa% means disk storage is the bottleneck.'
  },
  {
    id: 'quiz_w2_10',
    week: 2,
    domain: 'linux',
    difficulty: 'advanced',
    question: 'Where does the Linux kernel log Out-Of-Memory (OOM) killer invocations?',
    options: ['/usr/sap/trans/log', 'dmesg or /var/log/messages', '/etc/fstab', 'ST22'],
    correctAnswer: 1,
    explanation: 'The kernel ring buffer (dmesg -T) and /var/log/messages record all OOM-killer actions and killed process PIDs.'
  },

  // Week 3 Questions
  {
    id: 'quiz_w3_1',
    week: 3,
    domain: 'database',
    difficulty: 'intermediate',
    question: 'Which SAP HANA tenant service hosts the SQL engine, Column Store, and Row Store?',
    options: ['hdbnameserver', 'hdbindexserver', 'hdbcompileserver', 'sapstartsrv'],
    correctAnswer: 1,
    explanation: 'hdbindexserver is the core database engine of every SAP HANA tenant database.'
  },
  {
    id: 'quiz_w3_2',
    week: 3,
    domain: 'database',
    difficulty: 'advanced',
    question: 'Under log_mode=normal in SAP HANA, what happens when the filesystem /hana/log reaches 100% full?',
    options: [
      'HANA automatically switches to read-only mode and continues serving transactions.',
      'All database write transactions freeze immediately during COMMIT in LOG_BUFFER_WAIT, halting business processing.',
      'HANA automatically deletes old data backups.',
      'The Linux server reboots.'
    ],
    correctAnswer: 1,
    explanation: 'Under log_mode=normal, log segments cannot be overwritten until backed up. A full log volume halts all write commits.'
  },
  {
    id: 'quiz_w3_3',
    week: 3,
    domain: 'database',
    difficulty: 'intermediate',
    question: 'Why should an administrator NEVER execute "rm" to delete files directly from /hana/log?',
    options: [
      'Because Linux will delete the kernel.',
      'Redo log files contain active transactions and disaster-recovery redo streams; deleting them permanently corrupts database consistency.',
      'Because files will be renamed to .bak.',
      'Because HANA does not use disk files.'
    ],
    correctAnswer: 1,
    explanation: 'Deleting active or unbacked-up redo log files corrupts database transaction state, making crash recovery impossible without data loss.'
  },
  {
    id: 'quiz_w3_4',
    week: 3,
    domain: 'database',
    difficulty: 'intermediate',
    question: 'What is the root cause of Oracle error "ORA-00257: archiver error. Connect AS SYSDBA only until freed"?',
    options: [
      'The database license has expired.',
      'The archive log destination filesystem is 100% full, preventing the background archiver from copying filled online redo logs.',
      'A deadlock occurred in table BSEG.',
      'The SAP message server crashed.'
    ],
    correctAnswer: 1,
    explanation: 'ORA-00257 indicates the archivelog directory is 100% full. The database halts transactions until disk space is restored.'
  },
  {
    id: 'quiz_w3_5',
    week: 3,
    domain: 'database',
    difficulty: 'advanced',
    question: 'Does a successful tnsping output confirm that an SAP application server can log into an Oracle database and read application data?',
    options: [
      'Yes, tnsping performs a full query on system tables.',
      'No; tnsping only proves network reachability to the Oracle listener process. It does not verify credentials, database OPEN state, or table access.',
      'Yes, if the port is 1527.',
      'Only if executed as root.'
    ],
    correctAnswer: 1,
    explanation: 'tnsping tests only listener ping reachability. It does not authenticate or test database engine state.'
  },
  {
    id: 'quiz_w3_6',
    week: 3,
    domain: 'database',
    difficulty: 'intermediate',
    question: 'In SAP HANA memory hierarchy, what is the Global Allocation Limit (GAL)?',
    options: [
      'The maximum amount of disk storage HANA can use.',
      'The maximum memory limit HANA is allowed to allocate from the host operating system (configured in global.ini).',
      'The total number of users allowed.',
      'The size of the swap partition.'
    ],
    correctAnswer: 1,
    explanation: 'The Global Allocation Limit defines the maximum RAM boundary HANA can claim from the operating system.'
  },
  {
    id: 'quiz_w3_7',
    week: 3,
    domain: 'database',
    difficulty: 'advanced',
    question: 'Can SAP HANA unload Row Store tables to disk when experiencing severe physical memory pressure?',
    options: [
      'Yes, HANA unloads all tables dynamically.',
      'No; Row Store tables must remain 100% memory-resident at all times. Only Column Store tables can be partially or fully unloaded.',
      'Yes, if configured in indexserver.ini.',
      'Only tables smaller than 10MB.'
    ],
    correctAnswer: 1,
    explanation: 'Row Store tables cannot be unloaded to disk; they must permanently reside in RAM. Only Column Store tables support dynamic loading/unloading.'
  },
  {
    id: 'quiz_w3_8',
    week: 3,
    domain: 'database',
    difficulty: 'intermediate',
    question: 'Where does an SAP system on HANA securely store database credentials to prevent plain-text exposure in profile files?',
    options: [
      'In /etc/passwd.',
      'In the Secure Store in the File System (SSFS).',
      'In the dev_disp file.',
      'In the SAP GUI registry.'
    ],
    correctAnswer: 1,
    explanation: 'SAP NetWeaver utilizes SSFS (Secure Storage in File System) with encrypted key files to store DB passwords securely.'
  },
  {
    id: 'quiz_w3_9',
    week: 3,
    domain: 'database',
    difficulty: 'advanced',
    question: 'Why is restarting an SAP HANA database when /hana/log is 100% full dangerous?',
    options: [
      'HANA will automatically delete all tenant databases.',
      'The database will fail to complete crash-recovery startup because it cannot allocate log buffers during redo log replay, prolonging outage duration.',
      'It invalidates the SAP license.',
      'Linux will repartition the drive.'
    ],
    correctAnswer: 1,
    explanation: 'Crash recovery requires log buffer space to write recovery records. Restarting with a 100% full log volume aborts startup.'
  },
  {
    id: 'quiz_w3_10',
    week: 3,
    domain: 'database',
    difficulty: 'intermediate',
    question: 'Which SAP GUI transaction is the primary console for DBA Backup operations and history across HANA and Oracle?',
    options: ['SM50', 'DB12', 'SM12', 'ST03N'],
    correctAnswer: 1,
    explanation: 'DB12 is the standard DBA Backup Console in SAP GUI for monitoring data and log backups.'
  },

  // Week 4 Questions
  {
    id: 'quiz_w4_1',
    week: 4,
    domain: 'abap',
    difficulty: 'intermediate',
    question: 'What is the root cause of ABAP short dump TSV_TNEW_PAGE_ALLOC_FAILED in transaction ST22?',
    options: [
      'The database listener was stopped.',
      'An internal table requested more memory than allowed by ABAP memory management parameters or physical host RAM.',
      'The user entered an invalid password 3 times.',
      'The printer ran out of paper.'
    ],
    correctAnswer: 1,
    explanation: 'TSV_TNEW_PAGE_ALLOC_FAILED occurs when an internal table expands beyond configured roll/heap memory quotas.'
  },
  {
    id: 'quiz_w4_2',
    week: 4,
    domain: 'abap',
    difficulty: 'intermediate',
    question: 'What is the danger of manually deleting an active lock entry in transaction SM12?',
    options: [
      'It reboots the application server.',
      'If the user or batch process is still actively executing, another session can modify the exact same business records simultaneously, causing silent database corruption.',
      'It deletes all user passwords.',
      'It drops the database table.'
    ],
    correctAnswer: 1,
    explanation: 'Deleting a lock entry while a process is writing allows conflicting concurrent updates, corrupting business data integrity.'
  },
  {
    id: 'quiz_w4_3',
    week: 4,
    domain: 'abap',
    difficulty: 'intermediate',
    question: 'In transaction SM13, what distinguishes a V1 update task from a V2 update task?',
    options: [
      'V1 runs on Oracle; V2 runs on HANA.',
      'V1 updates are time-critical synchronous document postings; V2 updates are non-critical secondary updates (e.g. statistics) executed only after V1 completes.',
      'V1 updates are for dialog users; V2 are for batch jobs.',
      'V1 updates cannot be restarted.'
    ],
    correctAnswer: 1,
    explanation: 'V1 update tasks are mission-critical synchronous operations. V2 updates handle statistical recalculations and secondary logs.'
  },
  {
    id: 'quiz_w4_4',
    week: 4,
    domain: 'abap',
    difficulty: 'advanced',
    question: 'In transaction ST03N, if the average Dialog Wait Time exceeds 250 ms while DB Request Time is low, what is the primary bottleneck?',
    options: [
      'The network switch dropped packets.',
      'All Dialog work processes are occupied, forcing incoming requests to queue in dispatcher shared memory.',
      'The user has too many windows open.',
      'The database index is missing.'
    ],
    correctAnswer: 1,
    explanation: 'Wait time measures delay waiting for a free work process. High wait time indicates work process starvation.'
  },
  {
    id: 'quiz_w4_5',
    week: 4,
    domain: 'abap',
    difficulty: 'advanced',
    question: 'Why does a single failed LUW in status SYSFAIL in inbound queue SMQ2 block all subsequent messages in that queue?',
    options: [
      'The SAP license expires.',
      'qRFC enforces strict First-In-First-Out (FIFO) transactional sequence; subsequent messages cannot process until earlier dependent messages complete.',
      'Linux deletes the network socket.',
      'SMQ2 only holds 1 message.'
    ],
    correctAnswer: 1,
    explanation: 'Queued RFC guarantees strict chronological ordering to prevent out-of-order data corruption.'
  },
  {
    id: 'quiz_w4_6',
    week: 4,
    domain: 'abap',
    difficulty: 'intermediate',
    question: 'In SM50, what does it mean when a work process enters PRIV mode?',
    options: [
      'The user has privacy protection enabled.',
      'The process exceeded its roll extension quota and allocated private process heap memory; the process cannot be shared by other users until it finishes.',
      'The process is encrypted.',
      'The process is running under root.'
    ],
    correctAnswer: 1,
    explanation: 'PRIV mode ties the work process to a single user session, preventing other users from utilizing that work process.'
  },
  {
    id: 'quiz_w4_7',
    week: 4,
    domain: 'abap',
    difficulty: 'advanced',
    question: 'When an SAP work process in SM50 is in status "RUN" with action "DB-Wait", where is the primary execution bottleneck?',
    options: [
      'Inside the SAP GUI client software.',
      'Inside the database engine (the work process is idle waiting for a query result, commit, or lock release).',
      'In the local Linux terminal font cache.',
      'In the SAP message server.'
    ],
    correctAnswer: 1,
    explanation: 'DB-Wait indicates the work process has sent a SQL query to the database and is waiting for the DB engine to respond.'
  },
  {
    id: 'quiz_w4_8',
    week: 4,
    domain: 'abap',
    difficulty: 'intermediate',
    question: 'Which transaction in SAP GUI allows an administrator to test the network connection and authorization of an RFC destination?',
    options: ['SM59', 'SM13', 'SM12', 'ST02'],
    correctAnswer: 0,
    explanation: 'SM59 is the RFC Destination Maintenance transaction used to configure and test RFC connections.'
  },
  {
    id: 'quiz_w4_9',
    week: 4,
    domain: 'abap',
    difficulty: 'advanced',
    question: 'What is an SAP Buffer Swap in transaction ST02?',
    options: [
      'Memory swapped by Linux kernel to swap disk.',
      'An object being evicted from an SAP shared memory buffer to disk or reloaded because the buffer has exhausted allocated space.',
      'A user switching terminals.',
      'A database backup.'
    ],
    correctAnswer: 1,
    explanation: 'Buffer swaps in ST02 represent internal SAP shared memory buffer replacements caused by insufficient configured buffer space.'
  },
  {
    id: 'quiz_w4_10',
    week: 4,
    domain: 'abap',
    difficulty: 'intermediate',
    question: 'If transaction ST03N displays missing or empty workload data for today, what background job should you inspect in SM37?',
    options: ['SAP_COLLECTOR_FOR_PERFMONITOR', 'Z_DAILY_PURGE', 'RDDIMPDP', 'BTCTRNS2'],
    correctAnswer: 0,
    explanation: 'SAP_COLLECTOR_FOR_PERFMONITOR is the standard hourly background collector that aggregates workload statistics for ST03N.'
  },

  // Week 5 Questions
  {
    id: 'quiz_w5_1',
    week: 5,
    domain: 'ha',
    difficulty: 'intermediate',
    question: 'What is the role of Corosync in an SAP Pacemaker high-availability cluster?',
    options: [
      'It compiles ABAP code in the background.',
      'It manages inter-node network messaging, token passing, and node membership tracking.',
      'It backs up the Oracle database.',
      'It provides the GUI for SAP MMC.'
    ],
    correctAnswer: 1,
    explanation: 'Corosync manages heartbeat messaging and cluster membership, while Pacemaker acts as the cluster resource manager.'
  },
  {
    id: 'quiz_w5_2',
    week: 5,
    domain: 'ha',
    difficulty: 'advanced',
    question: 'What catastrophic risk occurs if an HA cluster experiences split-brain without working fencing (STONITH)?',
    options: [
      'Both isolated nodes may simultaneously mount shared storage and write to the database, causing irreversible data corruption.',
      'SAP GUI background color turns pink.',
      'User passwords are reset.',
      'Linux packages are downgraded.'
    ],
    correctAnswer: 0,
    explanation: 'Without fencing, both partitioned nodes believe they are the sole survivor and write conflicting data to storage simultaneously.'
  },
  {
    id: 'quiz_w5_3',
    week: 5,
    domain: 'ha',
    difficulty: 'intermediate',
    question: 'Why must SAP ASCS and ERS instances never reside on the same cluster node during steady-state production?',
    options: [
      'The SAP license prohibits it.',
      'If both run on the same server and that server crashes, both the primary lock table and its mirrored replica are lost simultaneously, bringing down the entire SAP system.',
      'They use the exact same port numbers.',
      'Linux cannot run two instances.'
    ],
    correctAnswer: 1,
    explanation: 'ERS exists solely to mirror the lock table if the ASCS node dies. Running both on one host negates failover protection.'
  },
  {
    id: 'quiz_w5_4',
    week: 5,
    domain: 'ha',
    difficulty: 'advanced',
    question: 'In SAP HANA System Replication with mode "sync", what happens if network latency between primary and secondary spikes to 500 ms?',
    options: [
      'HANA ignores latency and commits in 1 ms.',
      'Every database commit in the SAP system will take at least 500 ms, severely degrading application response times.',
      'HANA automatically deletes the secondary database.',
      'The Linux server reboots.'
    ],
    correctAnswer: 1,
    explanation: 'Synchronous replication requires that the secondary node acknowledge log receipt before the primary can commit to the application.'
  },
  {
    id: 'quiz_w5_5',
    week: 5,
    domain: 'ha',
    difficulty: 'intermediate',
    question: 'What is the immediate, safe command to stop a Pacemaker cluster from repeatedly failing over a flapping resource without stopping the application?',
    options: [
      'killall corosync',
      'Set maintenance mode (e.g. crm resource maintenance <RESOURCE> true or crm configure property maintenance-mode=true).',
      'Unplug the server power cable.',
      'Delete the Corosync configuration file.'
    ],
    correctAnswer: 1,
    explanation: 'Enabling maintenance mode instructs Pacemaker to freeze resource management in place, preventing automated restarts and failovers.'
  },
  {
    id: 'quiz_w5_6',
    week: 5,
    domain: 'ha',
    difficulty: 'advanced',
    question: 'In crm_mon, if a monitor operation fails with status "Timed Out" rather than "Not Running", what does this usually signify?',
    options: [
      'The application binary was deleted.',
      'The instance probe (e.g. sapcontrol or filesystem stat) hung or took longer than the configured timeout due to heavy storage I/O or CPU starvation.',
      'The user entered an invalid password.',
      'The cluster license has expired.'
    ],
    correctAnswer: 1,
    explanation: 'A monitor timeout indicates that the diagnostic probe script could not finish within the timeout window, often caused by I/O stalls or CPU starvation.'
  },
  {
    id: 'quiz_w5_7',
    week: 5,
    domain: 'ha',
    difficulty: 'intermediate',
    question: 'What is the difference between planned database Switchover and emergency Takeover/Failover in HANA System Replication?',
    options: [
      'A Switchover is a planned zero-data-loss role reversal; a Takeover is an emergency promotion following an unplanned crash.',
      'Switchovers require an OS reinstall.',
      'Takeovers are only supported on Oracle.',
      'There is no difference.'
    ],
    correctAnswer: 0,
    explanation: 'A Switchover cleanly reverses primary and secondary roles without downtime. A Takeover promotes the secondary after the primary dies.'
  },
  {
    id: 'quiz_w5_8',
    week: 5,
    domain: 'ha',
    difficulty: 'advanced',
    question: 'In a 2-node Pacemaker cluster, how does SBD (Storage-Based Death) prevent split-brain?',
    options: [
      'It formats the hard drive if a node stops responding.',
      'It uses a shared storage LUN and hardware watchdog timer; if a node loses heartbeats or watchdog resets, the watchdog reboots or powers off the node physically.',
      'It sends emails to the administrator.',
      'It disables Linux networking.'
    ],
    correctAnswer: 1,
    explanation: 'SBD uses a hardware watchdog and shared disk messages to self-fence a non-responsive node, guaranteeing clean isolation.'
  },
  {
    id: 'quiz_w5_9',
    week: 5,
    domain: 'ha',
    difficulty: 'intermediate',
    question: 'How do application servers (PAS/AAS) continue communicating with ASCS after it fails over to a different cluster node?',
    options: [
      'Admins must edit /etc/hosts manually on all servers.',
      'ASCS uses a Virtual/Floating IP that migrates with the instance, allowing application servers to reconnect seamlessly.',
      'Users must close and reopen SAP GUI.',
      'Application servers do not need ASCS.'
    ],
    correctAnswer: 1,
    explanation: 'A cluster-managed Virtual IP automatically follows the ASCS instance across nodes, preserving client network addressing.'
  },
  {
    id: 'quiz_w5_10',
    week: 5,
    domain: 'ha',
    difficulty: 'advanced',
    question: 'Why should an engineer avoid immediately running "crm resource cleanup" as soon as a cluster failure occurs?',
    options: [
      'Cleanup takes 24 hours to finish.',
      'Clearing failure counts without identifying and fixing the underlying cause can cause the resource to flap continuously, compounding downtime.',
      'Cleanup uninstalls Pacemaker.',
      'Only root can run cleanup.'
    ],
    correctAnswer: 1,
    explanation: 'Fail-counts exist to prevent broken resources from repeatedly failing on a bad node. You must fix the root problem before clearing the count.'
  },

  // Week 6 Questions
  {
    id: 'quiz_w6_1',
    week: 6,
    domain: 'upgrades',
    difficulty: 'intermediate',
    question: 'When SUM halts with hundreds of errors in an activation phase (e.g. ACT_UPG), which error should the Basis engineer investigate first?',
    options: [
      'The last error at the bottom of the file.',
      'The very first meaningful error reported at the top of the log, because subsequent errors are usually cascading effects of the first missing object.',
      'A random error in the middle.',
      'Errors should be ignored until SUM finishes.'
    ],
    correctAnswer: 1,
    explanation: 'In ABAP dictionary activation, if a fundamental domain or structure fails, all tables and views referencing it will fail as well. Always fix the primary initial error.'
  },
  {
    id: 'quiz_w6_2',
    week: 6,
    domain: 'upgrades',
    difficulty: 'intermediate',
    question: 'Why must both SAPEXE.SAR and SAPEXEDB.SAR be updated to the exact same patch level simultaneously during a kernel upgrade?',
    options: [
      'Because the SAP license requires it.',
      'SAPEXE contains the core engine while SAPEXEDB contains the DB interface library; mismatched patch levels result in binary ABI incompatibilities and dynamic linking crashes.',
      'Because SAPCAR will delete the files.',
      'To prevent Linux from upgrading.'
    ],
    correctAnswer: 1,
    explanation: 'The database interface shared libraries are tightly coupled to the dispatcher and work process binaries. Mixing patch levels causes crashes.'
  },
  {
    id: 'quiz_w6_3',
    week: 6,
    domain: 'upgrades',
    difficulty: 'intermediate',
    question: 'What is the specific purpose of running saproot.sh as user root after updating an SAP kernel?',
    options: [
      'It clears user passwords.',
      'It assigns root ownership and sets the setuid bit on specific binaries (such as icmbnd and brbackup) that require elevated privileges to bind ports (<1024) or access raw storage.',
      'It reboots the Linux server.',
      'It registers the system with SAP Support.'
    ],
    correctAnswer: 1,
    explanation: 'Kernel binaries like icmbnd need to bind privileged network ports (e.g. 80 and 443). saproot.sh sets the setuid root bit to grant this specific permission.'
  },
  {
    id: 'quiz_w6_4',
    week: 6,
    domain: 'upgrades',
    difficulty: 'intermediate',
    question: 'What does a transport return code of RC 8 indicate in an import log?',
    options: [
      'Total success without any warnings.',
      'An error occurred (such as syntax errors or activation failures); repository objects were not activated cleanly and require investigation.',
      'The database hard disk crashed.',
      'The user logged out.'
    ],
    correctAnswer: 1,
    explanation: 'RC 8 indicates an error where objects could not be activated or imported properly. RC 4 is a non-critical warning, while RC 12 is a fatal execution crash.'
  },
  {
    id: 'quiz_w6_5',
    week: 6,
    domain: 'upgrades',
    difficulty: 'advanced',
    question: 'If an import or SPAM queue hangs indefinitely in phase IMPORT_PROPER, what critical background job in client 000 should be checked first?',
    options: [
      'SAP_COLLECTOR_FOR_PERFMONITOR',
      'RDDIMPDP (scheduled via report RDDNEWPP)',
      'Z_PURGE_TRACES',
      'SAP_CCMS_MONI_BATCH'
    ],
    correctAnswer: 1,
    explanation: 'RDDIMPDP is the central event-triggered background transport dispatcher. If RDDIMPDP is not scheduled in client 000, tp will wait indefinitely for import steps to finish.'
  },
  {
    id: 'quiz_w6_6',
    week: 6,
    domain: 'upgrades',
    difficulty: 'advanced',
    question: 'Why is rolling back an SAP HANA database to a previous revision impossible without restoring from a backup once an upgrade completes?',
    options: [
      'Linux deletes the old executables.',
      'The upgrade modifies the internal database catalog and persistence structures; an older HANA revision cannot read or open a newer catalog version.',
      'The license key expires.',
      'hdblcm formats the hard drive.'
    ],
    correctAnswer: 1,
    explanation: 'Database catalog formats change between major revisions. Older binaries cannot process newer catalog structures, making full database restore the only valid rollback path.'
  },
  {
    id: 'quiz_w6_7',
    week: 6,
    domain: 'upgrades',
    difficulty: 'intermediate',
    question: 'What is the purpose of defining a "Point of No Return" (PoNR) before beginning an SAP upgrade downtime window?',
    options: [
      'It tells developers when to go to sleep.',
      'It establishes an absolute cut-off time beyond which the team stops debugging and immediately executes rollback to guarantee system availability for business opening.',
      'It is when the SAP license expires.',
      'It dictates when backup tapes are ejected.'
    ],
    correctAnswer: 1,
    explanation: 'The Point of No Return ensures that troubleshooting time does not encroach on the time required to safely restore the system, protecting business start of day.'
  },
  {
    id: 'quiz_w6_8',
    week: 6,
    domain: 'upgrades',
    difficulty: 'intermediate',
    question: 'What is the primary benefit of the Software Update Manager (SUM) "Shadow Instance"?',
    options: [
      'It replaces the Oracle database with MySQL.',
      'It allows heavy maintenance tasks (table conversions, dictionary activations) to run in a separate temporary schema while the production system remains fully operational, minimizing downtime.',
      'It backs up the server to tape.',
      'It automatically fixes custom ABAP code.'
    ],
    correctAnswer: 1,
    explanation: 'The shadow instance executes time-consuming upgrades in parallel with live production, drastically shrinking the downtime window required for final cutover.'
  },
  {
    id: 'quiz_w6_9',
    week: 6,
    domain: 'upgrades',
    difficulty: 'advanced',
    question: 'Why are SAN/Cloud storage volume snapshots superior to traditional tape restores for upgrade fallback planning?',
    options: [
      'Snapshots do not use any electricity.',
      'Snapshots can restore multi-terabyte database volumes in minutes rather than hours, fitting comfortably within tight maintenance rollback windows.',
      'Snapshots automatically upgrade the kernel.',
      'Snapshots eliminate the need for an SAP password.'
    ],
    correctAnswer: 1,
    explanation: 'Storage snapshots revert pointers at the block layer in minutes regardless of database size, providing a reliable, ultra-fast rollback safety net.'
  },
  {
    id: 'quiz_w6_10',
    week: 6,
    domain: 'upgrades',
    difficulty: 'intermediate',
    question: 'Which tool is used to execute SAP HANA database revision updates?',
    options: ['SPAM', 'hdblcm', 'SUM', 'SWPM'],
    correctAnswer: 1,
    explanation: 'hdblcm (HANA Database Lifecycle Manager) is the dedicated tool for installing and updating SAP HANA database software.'
  },

  // Week 7 Questions
  {
    id: 'quiz_w7_1',
    week: 7,
    domain: 'rca',
    difficulty: 'intermediate',
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
    id: 'quiz_w7_2',
    week: 7,
    domain: 'rca',
    difficulty: 'advanced',
    question: 'Why is evidence triangulation across at least two independent architectural tiers required before confirming an RCA root cause?',
    options: [
      'A single log file in isolation can show secondary reactions or misleading symptoms, while corroboration from multiple layers proves the actual causal chain.',
      'SAP software requires two approvals to close a ticket.',
      'To ensure the report has twice as many pages.',
      'Because Linux logs are never accurate.'
    ],
    correctAnswer: 0,
    explanation: 'Single-source logs often report cascading consequences. Corroborating evidence across application, DB, and OS tiers ensures the true trigger is confirmed.'
  },
  {
    id: 'quiz_w7_3',
    week: 7,
    domain: 'rca',
    difficulty: 'intermediate',
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
    id: 'quiz_w7_4',
    week: 7,
    domain: 'rca',
    difficulty: 'intermediate',
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
    id: 'quiz_w7_5',
    week: 7,
    domain: 'rca',
    difficulty: 'advanced',
    question: 'Why should a technical RCA report avoid stating that the root cause was "Human error" or "Contractor made a mistake"?',
    options: [
      'Contractors cannot make mistakes.',
      'True root causes are systemic: missing permissions, inadequate guardrails, lack of automated validation, or absent peer reviews that allowed the mistake to occur.',
      'HR prohibits it.',
      'Computers do not make mistakes.'
    ],
    correctAnswer: 1,
    explanation: 'Blaming individuals fails to prevent recurrence. Systemic engineering improves guardrails, automation, and access controls so human error cannot cause catastrophic failure.'
  },
  {
    id: 'quiz_w7_6',
    week: 7,
    domain: 'rca',
    difficulty: 'intermediate',
    question: 'What is the standard SAP recommended maximum write latency for the SAP HANA redo log volume (/hana/log)?',
    options: ['1000 ms', '500 ms', 'Consistently below 1.0 millisecond', '30 seconds'],
    correctAnswer: 2,
    explanation: 'SAP HANA KPI benchmarks require write latency on the redo log volume to remain consistently below 1.0 ms to support high-throughput transactional commits.'
  },
  {
    id: 'quiz_w7_7',
    week: 7,
    domain: 'rca',
    difficulty: 'advanced',
    question: 'If an alert reports "All Dialog Work Processes exhausted in SM50" at 11:32:00, why should an engineer look for events prior to 11:32:00?',
    options: [
      'Work process exhaustion is almost always a secondary symptom of an earlier failure (e.g. database lock stall or storage freeze at 11:30:00) that blocked existing processes.',
      'Previous logs are automatically archived.',
      'SAP timestamps are inverted.',
      'To see what time the server booted.'
    ],
    correctAnswer: 0,
    explanation: 'Processes do not exhaust themselves spontaneously; they get stuck waiting on an earlier upstream bottleneck, which holds them until the queue fills up.'
  },
  {
    id: 'quiz_w7_8',
    week: 7,
    domain: 'rca',
    difficulty: 'intermediate',
    question: 'Why is it valuable to include an "Alternative Causes Ruled Out" section in an enterprise RCA report?',
    options: [
      'It fills up empty space on the report.',
      'It proves to architects, auditors, and management that all plausible contributing factors were methodically investigated and disproven with hard data.',
      'It allows admins to blame other departments.',
      'It makes the incident ticket close automatically.'
    ],
    correctAnswer: 1,
    explanation: 'Documenting ruled-out causes demonstrates thorough engineering rigor and prevents stakeholders from proposing already-disproven theories.'
  },
  {
    id: 'quiz_w7_9',
    week: 7,
    domain: 'rca',
    difficulty: 'advanced',
    question: 'In cloud virtualized environments (Azure/AWS), what does non-zero Steal Time (%st) in top indicate?',
    options: [
      'Someone is stealing files via FTP.',
      'The underlying physical hypervisor is oversubscribed; the hypervisor is taking CPU cycles away from your virtual machine to service other workloads.',
      'The SAP license has been stolen.',
      'Disk encryption is active.'
    ],
    correctAnswer: 1,
    explanation: 'Steal time measures CPU cycles needed by the virtual machine that were withheld by the hypervisor due to physical host overcommit.'
  },
  {
    id: 'quiz_w7_10',
    week: 7,
    domain: 'rca',
    difficulty: 'intermediate',
    question: 'What is the primary audience and goal of the Executive Summary section in an RCA report?',
    options: [
      'Database administrators looking for SQL execution plans.',
      'Business leadership and management; to clearly explain business impact, initiating cause, restoration, and preventive investment without deep technical jargon.',
      'Junior developers looking for code syntax.',
      'Hardware vendors checking warranty.'
    ],
    correctAnswer: 1,
    explanation: 'The Executive Summary serves non-technical business leaders and directors who make budget, architecture, and governance decisions based on the report.'
  },

  // Week 8 Questions
  {
    id: 'quiz_w8_1',
    week: 8,
    domain: 'simulations',
    difficulty: 'intermediate',
    question: 'When an SAP instance crashes unexpectedly, what tool should be run by <sid>adm before restarting to remove orphaned shared memory and semaphores?',
    options: ['rm -rf /usr/sap', 'cleanipc <NR> remove', 'fdisk /dev/sda', 'kill -9 -1'],
    correctAnswer: 1,
    explanation: 'cleanipc <NR> remove scans for and purges stale shared memory segments and IPC semaphores associated with that instance number.'
  },
  {
    id: 'quiz_w8_2',
    week: 8,
    domain: 'simulations',
    difficulty: 'intermediate',
    question: 'Why is it dangerous to immediately assume that a 94% full filesystem caused a dispatcher crash?',
    options: [
      '94% full filesystems operate normally; unless the filesystem reaches 100% blocks or 100% inodes, it does not prevent writes or trigger ENOSPC crashes.',
      'Filesystems cannot cause crashes.',
      'SAP does not write to disks.',
      '94% is an even number.'
    ],
    correctAnswer: 0,
    explanation: 'A 94% filesystem is a warning metric, not an error. Senior engineers verify whether write operations actually failed before jumping to conclusions.'
  },
  {
    id: 'quiz_w8_3',
    week: 8,
    domain: 'simulations',
    difficulty: 'intermediate',
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
    id: 'quiz_w8_4',
    week: 8,
    domain: 'simulations',
    difficulty: 'advanced',
    question: 'If an Oracle listener crashes while the database instance remains OPEN, what happens to existing active database sessions?',
    options: [
      'All existing sessions crash immediately.',
      'Existing established sessions continue executing normally; only new incoming connection attempts will fail with ORA-12541 until the listener is restarted.',
      'The database datafiles are corrupted.',
      'The server loses power.'
    ],
    correctAnswer: 1,
    explanation: 'The listener only brokers the initial socket handshake. Once a session is established and handed off to a dedicated server process, the listener is no longer in the communication path.'
  },
  {
    id: 'quiz_w8_5',
    week: 8,
    domain: 'simulations',
    difficulty: 'advanced',
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
    id: 'quiz_w8_6',
    week: 8,
    domain: 'simulations',
    difficulty: 'intermediate',
    question: 'Which ABAP report must be executed via SE38 after system maintenance to release background jobs that were suspended before maintenance?',
    options: ['BTCTRNS1', 'BTCTRNS2', 'RSCHECK', 'RDDNEWPP'],
    correctAnswer: 1,
    explanation: 'BTCTRNS1 suspends scheduled batch jobs prior to maintenance, and BTCTRNS2 releases them back to scheduled status once maintenance is complete.'
  },
  {
    id: 'quiz_w8_7',
    week: 8,
    domain: 'simulations',
    difficulty: 'intermediate',
    question: 'What is the purpose of SAP transaction SICK?',
    options: [
      'It diagnoses physical illness in administrators.',
      'It executes the SAP Installation Consistency Check, validating basic profile parameters, codepages, and kernel consistency upon startup.',
      'It deletes expired user accounts.',
      'It orders new hardware from the vendor.'
    ],
    correctAnswer: 1,
    explanation: 'SICK (SAP Installation Consistency Check) verifies critical installation parameters, kernel prerequisites, and profile integrity.'
  },
  {
    id: 'quiz_w8_8',
    week: 8,
    domain: 'simulations',
    difficulty: 'advanced',
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
    id: 'quiz_w8_9',
    week: 8,
    domain: 'simulations',
    difficulty: 'advanced',
    question: 'What configuration adjustment should be applied to prevent transient high-load spikes from triggering false cluster failovers?',
    options: [
      'Disable STONITH completely.',
      'Increase the cluster monitor operation timeout (e.g. from 60s to 120s or 180s) and configure resource limits (like statement_memory_limit) in the database.',
      'Uninstall Pacemaker.',
      'Delete the operating system syslog.'
    ],
    correctAnswer: 1,
    explanation: 'Tuning monitor timeouts provides resilience against transient load spikes while keeping the cluster fully protected by STONITH.'
  },
  {
    id: 'quiz_w8_10',
    week: 8,
    domain: 'simulations',
    difficulty: 'intermediate',
    question: 'In SAP GUI, which transaction displays active user sessions across all application servers and allows safe messaging or session termination?',
    options: ['SM04', 'SM50', 'ST02', 'SM12'],
    correctAnswer: 0,
    explanation: 'SM04 (or AL08 globally) displays all active user sessions and allows administrators to inspect user terminals and verify activity.'
  }
];

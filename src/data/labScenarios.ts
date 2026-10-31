import { LabScenario } from '../types';

export const labScenarios: LabScenario[] = [
  {
    id: 'lab-1',
    title: 'Filesystem at 99% / Hidden Mount Data',
    difficulty: 'guided',
    category: 'Linux Storage',
    ticket: {
      number: 'INC-2026-9001',
      severity: 'P1-CRITICAL',
      system: 'PRD (S/4HANA 2023)',
      environment: 'Production Linux Host sapapp01',
      reportedIssue: 'PAS instance failed to create work files. dev_disp reports: "No space left on device". df -h shows /usr/sap at 99% full.',
      businessImpact: 'Production ERP sales order entry offline. 450 users disconnected.',
      initialStatus: 'Dispatcher stopped. Junior admin ran du -xhd 1 /usr/sap and reported du accounts for only 28GB out of 100GB.'
    },
    hints: [
      'Compare df -h with df -i to verify whether the bottleneck is block capacity or inode exhaustion.',
      'Notice the massive discrepancy between df (99GB used) and du (28GB used).',
      'Check if files are locked in memory with lsof +L1 /usr/sap.',
      'Check active mount points with findmnt or inspect whether data was written to a mount directory before the sub-mount was mounted.'
    ],
    supportedCommands: {
      'df -ht': `Filesystem      Type  Size  Used Avail Use% Mounted on
/dev/mapper/root xfs   100G   99G  1.0G  99% /usr/sap
/dev/mapper/home xfs    50G   12G   38G  24% /home
/dev/sdb1        nfs4  500G  120G  380G  24% /usr/sap/PRD/sapdata`,
      'df -h': `Filesystem      Size  Used Avail Use% Mounted on
/dev/mapper/root 100G   99G  1.0G  99% /usr/sap
/dev/mapper/home  50G   12G   38G  24% /home
/dev/sdb1        500G  120G  380G  24% /usr/sap/PRD/sapdata`,
      'df -i': `Filesystem      Inodes  IUsed   IFree IUse% Mounted on
/dev/mapper/root 52428800 621400 51807400    2% /usr/sap
/dev/mapper/home 26214400  12400 26202000    1% /home`,
      'findmnt': `TARGET                 SOURCE           FSTYPE  OPTIONS
/usr/sap               /dev/mapper/root xfs     rw,relatime
├─/usr/sap/PRD/sapdata /dev/sdb1        xfs     rw,noatime`,
      'du -xhd 1 /usr/sap': `14G     /usr/sap/PRD
12G     /usr/sap/trans
2.0G    /usr/sap/tmp
28G     /usr/sap`,
      'lsof +l1 /usr/sap': `COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
(No unlinked open file descriptors found)`,
      'mount --bind / /mnt/inspect && ls -lh /mnt/inspect/usr/sap/prd/sapdata': `total 71G
-rw-r----- 1 prdadm sapsys 35G Oct 12 02:00 old_hdb_backup_01.bak
-rw-r----- 1 prdadm sapsys 36G Oct 12 02:15 old_hdb_backup_02.bak`,
      'sapcontrol -nr 00 -function getprocesslist': `00, disp+work, Stopped, GRAY, Exitcode 255
00, ig.watchdog, Running, GREEN
00, gwrd, Stopped, GRAY`,
      'tail /usr/sap/prd/d00/work/dev_disp': `*** ERROR => DpShmCreate: ShmCreate (key: 100) failed (rc = 28: No space left on device)
*** ERROR => DpSysInit: DpShmCreate failed`
    },
    correctRootCause: 'Before the external filesystem was mounted onto /usr/sap/PRD/sapdata, 71GB of old backup files were written into the underlying local directory. When the sub-volume was mounted over it, those files became hidden to du, but remain allocated on the parent /usr/sap filesystem.',
    correctEvidence: [
      'df -h shows /usr/sap at 99% used (99GB), but du -xhd 1 /usr/sap shows only 28GB.',
      'df -i shows inodes are healthy (2% used).',
      'lsof +L1 confirms no deleted files are held open.',
      'Inspecting the underlying directory via bind mount reveals 71GB of old backup files hidden under /usr/sap/PRD/sapdata.'
    ],
    safeRemediation: 'Bind-mount the root filesystem to a temporary mount point (e.g. mount --bind / /mnt/inspect), delete or move the obsolete 71GB backup files from /mnt/inspect/usr/sap/PRD/sapdata, and unmount the temporary bind mount. Never unmount production mounts during live operations.',
    postFixValidation: 'Run df -h /usr/sap to verify used space drops from 99% to ~28%. Verify disp+work starts cleanly via sapcontrol -nr 00 -function Start.',
    scoringGuide: {
      keyCommandsNeeded: ['df -h', 'df -i', 'du -xhd 1 /usr/sap', 'findmnt'],
      pitfalls: ['Running rm -rf indiscriminately', 'Attempting to reboot without diagnosing discrepancy', 'Failing to check inodes']
    }
  },
  {
    id: 'lab-2',
    title: 'Deleted File Held Open by Active Process',
    difficulty: 'guided',
    category: 'Linux Storage',
    ticket: {
      number: 'INC-2026-9002',
      severity: 'P1-CRITICAL',
      system: 'ECC 6.0 (PRD)',
      environment: 'Production Linux Host app02',
      reportedIssue: 'Administrator ran "rm dev_disp" to free space, but df -h continues to report /usr/sap at 99%.',
      businessImpact: 'High risk of instance crash; dialog work processes failing to write trace entries.',
      initialStatus: 'Admin claims rm command completed without errors, yet disk space was not released.'
    },
    hints: [
      'In Linux, deleting a file with rm unlinks the filename from the directory, but does NOT release blocks if a running process holds the file descriptor open.',
      'Use lsof +L1 to locate unlinked open files.',
      'Check the process ID and file descriptor number.',
      'You can safely truncate the open file in-place through /proc/<PID>/fd/<FD> without restarting the process.'
    ],
    supportedCommands: {
      'df -h': `Filesystem      Size  Used Avail Use% Mounted on
/dev/sda2        80G   79G  1.0G  99% /usr/sap`,
      'du -xhd 1 /usr/sap': `12G     /usr/sap/PRD
8.0G    /usr/sap/trans
20G     /usr/sap`,
      'lsof +l1 /usr/sap': `COMMAND     PID   USER   FD   TYPE DEVICE     SIZE/OFF NODE NAME
disp+work 18420 prdadm    7w   REG    8,2  59000000000 4120 /usr/sap/PRD/D00/work/dev_disp (deleted)`,
      'ls -l /proc/18420/fd/7': `l-wx------ 1 prdadm sapsys 64 Oct 28 09:12 /proc/18420/fd/7 -> /usr/sap/PRD/D00/work/dev_disp (deleted)`,
      '> /proc/18420/fd/7': `(File descriptor truncated successfully)`,
      'sapcontrol -nr 00 -function getprocesslist': `00, disp+work, Running, GREEN
00, ig.watchdog, Running, GREEN`
    },
    correctRootCause: 'The disp+work process (PID 18420) held file descriptor 7 open to /usr/sap/PRD/D00/work/dev_disp. The file was deleted via rm, but Linux could not free the 59GB of allocated blocks while the active process kept the descriptor open.',
    correctEvidence: [
      'lsof +L1 /usr/sap shows PID 18420 holding 59GB on deleted file dev_disp.',
      'df -h reports 99% used while du accounts for only 20GB.'
    ],
    safeRemediation: 'Truncate the file descriptor directly using "> /proc/18420/fd/7" to zero out the allocated disk blocks instantly without terminating disp+work.',
    postFixValidation: 'Execute df -h /usr/sap to confirm space freed immediately. Check sapcontrol GetProcessList to confirm disp+work remains GREEN.',
    scoringGuide: {
      keyCommandsNeeded: ['df -h', 'lsof +l1 /usr/sap', '> /proc/18420/fd/7'],
      pitfalls: ['Killing disp+work with kill -9', 'Rebooting the server unnecessarily', 'Running rm again']
    }
  },
  {
    id: 'lab-3',
    title: 'PAS Dispatcher Stopped / Orphaned Shared Memory',
    difficulty: 'intermediate',
    category: 'SAP Architecture',
    ticket: {
      number: 'INC-2026-9003',
      severity: 'P1-CRITICAL',
      system: 'PRD S/4HANA',
      environment: 'PAS Host prd-app01',
      reportedIssue: 'Following a server crash, PAS instance D00 fails to start. sapcontrol reports disp+work stopped with exit code 255.',
      businessImpact: 'Production ERP offline.',
      initialStatus: 'HANA database is OPEN; ASCS is GREEN.'
    },
    hints: [
      'Inspect dev_disp in /usr/sap/<SID>/<INSTANCE>/work.',
      'Look for DpShmCreate error and return code.',
      'When an SAP instance crashes abruptly, it can leave orphaned shared memory segments and semaphores in Linux kernel RAM.',
      'Use cleanipc to check and remove orphaned segments.'
    ],
    supportedCommands: {
      'sapcontrol -nr 00 -function getprocesslist': `00, disp+work, Stopped, GRAY, Exitcode 255
00, ig.watchdog, Running, GREEN
00, gwrd, Stopped, GRAY`,
      'tail /usr/sap/prd/d00/work/dev_disp': `*** ERROR => DpShmCreate: ShmCreate (key: 100) failed (rc = 17: File exists)
*** ERROR => DpSysInit: DpShmCreate failed (rc = 17)
*** ERROR => DpMain: DpSysInit failed, terminating dispatcher`,
      'cleanipc 00 check': `cleanipc: checking for obsolete shared memory and semaphores for instance 00...
Found 6 orphaned shared memory segments (Key 100, 101, 102...) owned by dead PID 9812.
Found 12 semaphores owned by dead PID 9812.`,
      'cleanipc 00 remove': `cleanipc: removing obsolete shared memory and semaphores for instance 00...
Segment 100 removed.
Segment 101 removed.
All orphaned IPC objects cleared cleanly.`,
      'r3trans -d': `R3trans finished with return code 0000.`,
      'sapcontrol -nr 00 -function start': `Instance 00 started successfully. disp+work is GREEN.`
    },
    correctRootCause: 'The previous abnormal crash left orphaned IPC shared memory segments and semaphores attached to instance key 100 in Linux kernel memory. When disp+work started, it failed with errno 17 (File/Resource exists) because it could not re-allocate the key.',
    correctEvidence: [
      'dev_disp logs: DpShmCreate failed with rc = 17: File exists.',
      'cleanipc 00 check identified 6 orphaned shared memory segments owned by dead PID 9812.',
      'R3trans -d returned 0000, confirming the database is completely healthy.'
    ],
    safeRemediation: 'Execute "cleanipc 00 remove" as prdadm to purge orphaned shared memory segments and semaphores, then restart the instance via sapcontrol.',
    postFixValidation: 'Execute sapcontrol -nr 00 -function GetProcessList and verify disp+work reaches GREEN status and work processes enter WAIT state.',
    scoringGuide: {
      keyCommandsNeeded: ['sapcontrol -nr 00 -function getprocesslist', 'tail /usr/sap/prd/d00/work/dev_disp', 'cleanipc 00 check', 'cleanipc 00 remove'],
      pitfalls: ['Attempting to restart the database', 'Modifying profile parameters unnecessarily']
    }
  },
  {
    id: 'lab-4',
    title: 'Oracle Database Listener Down / Connectivity Failure',
    difficulty: 'intermediate',
    category: 'Oracle Database',
    ticket: {
      number: 'INC-2026-9004',
      severity: 'P1-CRITICAL',
      system: 'ECC 6.0 (PRD)',
      environment: 'Oracle 19c on Host prd-db01',
      reportedIssue: 'SAP application servers cannot connect to Oracle database. R3trans returns return code 12.',
      businessImpact: 'All SAP application servers down. Warehouse shipments halted.',
      initialStatus: 'DBA reports Oracle instance is running; SELECT STATUS FROM V$INSTANCE shows OPEN.'
    },
    hints: [
      'Examine trans.log generated by R3trans -d to see the exact ORA- error.',
      'Distinguish database instance status (OPEN) from listener status.',
      'Check lsnrctl status on the database host.',
      'Check if port 1527 is listening.'
    ],
    supportedCommands: {
      'r3trans -d': `R3trans finished with return code 0012. trans.log created.`,
      'cat trans.log': `4 ETW000  [dev trc     ,00000]  Connecting to database 'PRD'...
4 ETW000  [dev trc     ,00000]  *** ERROR => Connect to database failed: ORA-12541: TNS:no listener
4 ETW000  [dbsloci.c  ,00000]  *** ERROR => ORA-12541 occurred; connection rejected`,
      'sqlplus / as sysdba -c "select status from v\\$instance;"': `STATUS
------------
OPEN`,
      'lsnrctl status': `Connecting to (DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=prd-db01)(PORT=1527)))
TNS-12541: TNS:no listener
TNS-12560: TNS:protocol adapter error`,
      'ss -tulnp | grep :1527': `(No process listening on port 1527)`,
      'lsnrctl start': `Starting /oracle/PRD/19/bin/tnslsnr: please wait...
TNSLSNR for Linux: Version 19.0.0.0.0
Listening on: (DESCRIPTION=(ADDRESS=(PROTOCOL=tcp)(HOST=prd-db01)(PORT=1527)))
Connecting to (DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=prd-db01)(PORT=1527)))
STATUS of the LISTENER
------------------------
Alias                     LISTENER
Version                   TNSLSNR for Linux: Version 19.0.0.0.0
Services Summary...
Service "PRD" has 1 instance(s). Instance "PRD", status READY, has 1 handler(s).
The command completed successfully`,
      'nc -zv prd-db01 1527': `Connection to prd-db01 1527 port [tcp/sapdp00] succeeded!`
    },
    correctRootCause: 'The Oracle TNS Listener service on port 1527 crashed or was stopped on prd-db01. While the Oracle database background processes were OPEN, incoming client connections from SAP application servers were rejected with ORA-12541.',
    correctEvidence: [
      'trans.log reports ORA-12541: TNS:no listener.',
      'lsnrctl status returns TNS-12541: TNS:no listener.',
      'ss -tulnp confirms no socket listening on port 1527.',
      'sqlplus local connection confirms instance state is OPEN.'
    ],
    safeRemediation: 'Log in as oraprd on the database host and execute "lsnrctl start". Verify listener binds port 1527 and registers service PRD in READY status. No database restart is required.',
    postFixValidation: 'Execute R3trans -d on application servers and verify return code 0000. Verify SAP application servers reconnect.',
    scoringGuide: {
      keyCommandsNeeded: ['r3trans -d', 'cat trans.log', 'lsnrctl status', 'lsnrctl start'],
      pitfalls: ['Restarting the Oracle database instance unnecessarily', 'Modifying tnsnames.ora prematurely']
    }
  },
  {
    id: 'lab-5',
    title: 'HANA Log-Volume Saturation (/hana/log at 100%)',
    difficulty: 'intermediate',
    category: 'HANA Database',
    ticket: {
      number: 'INC-2026-9005',
      severity: 'P1-CRITICAL',
      system: 'PRD S/4HANA 2023',
      environment: 'HANA 2.0 SPS 07 on SLES 15',
      reportedIssue: 'All SAP transactions frozen in COMMIT. SM50 shows all dialog and update processes in DB-Wait. HANA rejects new writes.',
      businessImpact: 'Enterprise-wide standstill during peak order entry.',
      initialStatus: 'HANA indexserver is running, but /hana/log is reported at 100% capacity.'
    },
    hints: [
      'Check df -h /hana/log and the backup target volume.',
      'Inspect /usr/sap/<SID>/HDB<NR>/<host>/trace/backup.log.',
      'Under log_mode=normal, HANA cannot overwrite redo log segments until they are backed up.',
      'NEVER delete files in /hana/log with rm! Doing so permanently corrupts database consistency.'
    ],
    supportedCommands: {
      'df -h': `Filesystem               Size  Used Avail Use% Mounted on
/dev/mapper/hana_log     512G  512G    0G 100% /hana/log
/dev/mapper/hana_data    2.0T  1.2T  800G  60% /hana/data
/mnt/backup/nfs_log      1.0T  1.0T    0G 100% /backup/hana/log`,
      'tail -n 25 /usr/sap/prd/hdb00/hana01/trace/backup.log': `2026-10-28T08:14:12 [ERROR] BackupController: Error writing log backup file '/backup/hana/log/log_backup_0_0_1421.bak': No space left on device
2026-10-28T08:14:15 [WARN] LogSegmentManager: No free log segments available! Disk full in /hana/log. Write transactions stalled.`,
      'hdbsql -u system "select service_name, total_log_size, used_log_size, free_log_size from m_log_buffers;"': `SERVICE_NAME,TOTAL_LOG_SIZE,USED_LOG_SIZE,FREE_LOG_SIZE
indexserver,549755813888,549755813888,0`,
      'rm -rf /hana/log/*': `[BLOCKED BY LAB GUARD]: Destructive operation prohibited! Deleting active HANA redo log files permanently destroys database consistency and transaction integrity.`,
      'hdbsql -u system "backup log using file (\'/tmp/emergency_log\');"': `0 rows affected. Log backup completed successfully. 48 segments backed up.`,
      'df -h /hana/log': `Filesystem           Size  Used Avail Use% Mounted on
/dev/mapper/hana_log 512G  102G  410G  20% /hana/log`
    },
    correctRootCause: 'The NFS backup storage partition /backup/hana/log reached 100% capacity, causing automated HANA log backups to fail. Under log_mode=normal, HANA cannot overwrite unbacked-up log segments, causing /hana/log to fill to 100% and freezing all database commits.',
    correctEvidence: [
      'df -h reveals both /hana/log and /backup/hana/log at 100% capacity.',
      'backup.log reports error: "No space left on device" when writing log backup file.',
      'M_LOG_BUFFERS reports FREE_LOG_SIZE is 0 bytes.'
    ],
    safeRemediation: 'Free up or expand the backup target storage (or temporarily trigger BACKUP LOG to an alternative local path with sufficient space). Once log backups complete, HANA immediately marks the segments as reusable, dropping /hana/log usage.',
    postFixValidation: 'Verify df -h /hana/log shows free space restored (>50GB free). Verify SM50 work processes clear DB-Wait and resume processing.',
    scoringGuide: {
      keyCommandsNeeded: ['df -h', 'tail -n 25 /usr/sap/prd/hdb00/hana01/trace/backup.log'],
      pitfalls: ['Attempting to run rm in /hana/log', 'Bouncing the HANA database while log is full']
    }
  },
  {
    id: 'lab-6',
    title: 'High Swap Thrashing and Memory Squeeze',
    difficulty: 'intermediate',
    category: 'Linux Memory',
    ticket: {
      number: 'INC-2026-9006',
      severity: 'P2-HIGH',
      system: 'QAS S/4HANA',
      environment: 'Host qas-app01 (128GB RAM)',
      reportedIssue: 'Users report extreme sluggishness. Average dialog response time jumped from 450ms to 18 seconds.',
      businessImpact: 'User acceptance testing halted; batch jobs delaying release cycle.',
      initialStatus: 'top shows CPU usage around 40%, but load average is 28 on an 8-core VM.'
    },
    hints: [
      'Examine vmstat 1 5 to inspect paging (si / so columns) and CPU I/O wait (wa%).',
      'Check free -h to evaluate physical memory vs swap utilization.',
      'Identify memory-hogging processes with ps aux --sort=-rss.',
      'Determine if SAP work processes have entered PRIV mode.'
    ],
    supportedCommands: {
      'free -h': `              total        used        free      shared  buff/cache   available
Mem:           125G        121G        1.2G         18G        2.8G        2.1G
Swap:           32G         31G        800M`,
      'vmstat 1 5': `procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
 3 14  32100   1200    120   2800 4820 5200  8400  9200 1200 4500 12 18  2 68  0
 2 12  32100   1150    120   2800 5120 4900  9100  8800 1150 4200 10 16  4 70  0`,
      'ps aux --sort=-rss | head -n 10': `USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
qasadm   24102 38.2 42.1  68.2g 52.8g ?        Rl   07:00  42:10 disp+work
qasadm   24103 12.1 18.2  32.1g 22.8g ?        Sl   07:00  18:20 disp+work
qasadm   12401  2.1  4.2   8.2g  5.2g ?        S    06:00   4:10 hdbclient`,
      'top -b -n 1 | head -n 15': `top - 09:30:12 up 14 days, load average: 28.12, 24.50, 18.20
Tasks: 312 total,   2 running, 310 sleeping
%Cpu(s): 11.2 us, 17.8 sy,  0.0 ni,  2.8 id, 68.2 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem : 128000.0 total,   1200.0 free, 124000.0 used,   2800.0 buff/cache
MiB Swap:  32768.0 total,    800.0 free,  31968.0 used.   2100.0 avail Mem`
    },
    correctRootCause: 'A runaway dialog work process (PID 24102) exceeded its roll extension quota, switched to PRIV mode, and allocated 52.8GB of physical heap RAM. This exhausted available system memory, forcing the Linux kernel to swap heavily to disk (continuous si/so > 5000) and driving I/O wait (%wa) to 68%.',
    correctEvidence: [
      'free -h shows available memory down to 2.1GB and swap 31GB full.',
      'vmstat confirms severe continuous swap thrashing (si > 4800, so > 4900) and I/O wait at 68-70%.',
      'ps aux identifies PID 24102 consuming 52.8GB RSS alone.'
    ],
    safeRemediation: 'In transaction SM50, locate the work process running under PID 24102 in PRIV mode and cancel it without core dump. Then adjust parameter ztta/roll_extension and abap/heap_area_dia to prevent individual processes from monopolizing host RAM.',
    postFixValidation: 'Verify free -h shows available memory returns above 30GB. Check vmstat 1 5 to confirm swap in/out drops to 0 and %wa normalizes below 5%.',
    scoringGuide: {
      keyCommandsNeeded: ['free -h', 'vmstat 1 5', 'ps aux --sort=-rss | head -n 10'],
      pitfalls: ['Misinterpreting 40% CPU as healthy while ignoring 68% I/O wait', 'Failing to check swap activity']
    }
  },
  {
    id: 'lab-7',
    title: 'Repeated Cluster Resource Failure / Monitor Flapping',
    difficulty: 'expert',
    category: 'High Availability',
    ticket: {
      number: 'INC-2026-9007',
      severity: 'P1-CRITICAL',
      system: 'PRD ASCS/ERS Cluster',
      environment: '2-Node SLES 15 Pacemaker Cluster',
      reportedIssue: 'ASCS instance failing over repeatedly between prd-ascs01 and prd-ascs02 every 20 minutes.',
      businessImpact: 'SAP GUI users disconnected repeatedly; RFC batch links resetting.',
      initialStatus: 'Cluster administrator claims Pacemaker is defective and wants to disable the cluster.'
    },
    hints: [
      'Execute crm_mon -r1 or inspect crm_mon output to check "Failed Resource Actions".',
      'Distinguish whether the resource monitor failed with OCF_NOT_RUNNING or TIMED_OUT.',
      'Check system logs around the exact failure second to identify why the monitor took longer than its configured timeout.',
      'Freeze flapping immediately by putting the resource into maintenance mode.'
    ],
    supportedCommands: {
      'crm_mon -r1': `Stack: corosync
Current DC: prd-ascs01 (version 2.1.2) - partition with quorum
2 nodes configured, 2 expected votes
2 resource instances configured

Online: [ prd-ascs01 prd-ascs02 ]

Full List of Resources:
 * rsc_sap_ASCS00	(ocf::heartbeat:SAPInstance):	Started prd-ascs02
 * rsc_sap_ERS01	(ocf::heartbeat:SAPInstance):	Started prd-ascs01

Failed Resource Actions:
  * rsc_sap_ASCS00_monitor_30000 on prd-ascs01 'timed out' (call=42, status=Timed Out, exitreason='')
    last-rc-change='Wed Oct 28 09:20:12 2026', queued=0ms, exec=60002ms`,
      'crm resource maintenance rsc_sap_ascs00 true': `Resource 'rsc_sap_ASCS00' set to unmanaged (maintenance mode). Cluster will not move or stop this resource.`,
      'journalctl -u corosync --since "1 hour ago"': `Oct 28 09:20:12 prd-ascs01 pacemaker-execd[1410]: operation rsc_sap_ASCS00_monitor_30000 timed out after 60000ms
Oct 28 09:20:12 prd-ascs01 pacemaker-controld[1412]: Action rsc_sap_ASCS00_monitor_30000 on prd-ascs01 failed (status: Timed Out)`,
      'tail -n 25 /var/log/messages': `Oct 28 09:19:30 prd-ascs01 backup-agent[2100]: Starting daily deep scan on /sapmnt...
Oct 28 09:19:40 prd-ascs01 kernel: nfs: server prd-nas not responding, still trying
Oct 28 09:20:45 prd-ascs01 kernel: nfs: server prd-nas OK`
    },
    correctRootCause: 'A scheduled third-party backup agent performed a deep scan on the shared NFS mount /sapmnt every 20 minutes, saturating NFS I/O and causing the sapcontrol probe in the Pacemaker monitor script to stall. The monitor exceeded its 60-second timeout, causing Pacemaker to declare ASCS failed and trigger unnecessary failover.',
    correctEvidence: [
      'crm_mon reports failure: rsc_sap_ASCS00_monitor_30000 timed out after 60002ms.',
      'The instance itself did not crash; only the cluster monitor timed out.',
      '/var/log/messages shows NFS server latency and backup agent scanning /sapmnt during the exact timeout window.'
    ],
    safeRemediation: '1. Put the resource into maintenance mode (crm resource maintenance rsc_sap_ASCS00 true) to stop flapping. 2. Exclude /sapmnt from aggressive real-time backup scanning. 3. Tune cluster monitor operation timeout from 60s to 120s. 4. Run crm resource cleanup and remove maintenance mode.',
    postFixValidation: 'Execute crm_mon -r1 and verify fail-count is 0, status is clean, and no further timeouts occur over a 1-hour monitoring window.',
    scoringGuide: {
      keyCommandsNeeded: ['crm_mon -r1', 'crm resource maintenance rsc_sap_ascs00 true', 'tail -n 25 /var/log/messages'],
      pitfalls: ['Disabling STONITH', 'Rebooting nodes blindly', 'Deleting cluster configuration']
    }
  },
  {
    id: 'lab-8',
    title: 'Failed Upgrade Phase in Software Update Manager (SUM)',
    difficulty: 'expert',
    category: 'Upgrades & Maintenance',
    ticket: {
      number: 'INC-2026-9008',
      severity: 'P1-CRITICAL',
      system: 'PRD S/4HANA Upgrade',
      environment: 'SUM Downtime Execution Phase',
      reportedIssue: 'SUM halted in phase MAIN_NEWVERS/STARTSYS_PRE with error: "Severe error(s) occurred in phase MAIN_NEWVERS/STARTSYS_PRE!". Maintenance window closing.',
      businessImpact: 'Production system in downtime; 90 minutes remaining before business opening.',
      initialStatus: 'Project manager asking whether to initiate full 6-hour database restore.'
    },
    hints: [
      'Inspect the SUM master log /usr/sap/<SID>/SUM/abap/log/SAPup.log.',
      'Check the phase log specified in SAPup.log.',
      'Inspect dev_disp in the work directory for the startup failure reason.',
      'Differentiate between an unrecoverable database corruption and a simple filesystem/profile issue.'
    ],
    supportedCommands: {
      'tail /usr/sap/prd/sum/abap/log/sapup.log': `CURRENTPHASE MAIN_NEWVERS/STARTSYS_PRE
...started at 20261028041500
# Using code page 4103
..finished at 20261028041830 with status FAILED
# Error message set: 'Severe error(s) occurred in phase MAIN_NEWVERS/STARTSYS_PRE!'
# See /usr/sap/PRD/SUM/abap/log/STARTSYS.LOG for details`,
      'tail /usr/sap/prd/sum/abap/log/startsys.log': `ERROR: SAP instance PRD/D00 failed to start within timeout (600 seconds).
Process disp+work stopped with exit code 255.
Check developer trace dev_disp in /usr/sap/PRD/D00/work.`,
      'tail -n 20 /usr/sap/prd/d00/work/dev_disp': `*** ERROR => DpShmCreate: ShmCreate (key: 100) failed (rc = 28: No space left on device)
*** ERROR => DpSysInit: DpShmCreate failed
*** FATAL BATCH WORK PROCESS FAILED TO START`,
      'df -h /usr/sap': `Filesystem      Size  Used Avail Use% Mounted on
/dev/sda2        80G   80G    0M 100% /usr/sap`,
      'du -xhd 1 /usr/sap/prd/d00/work': `54G     /usr/sap/PRD/D00/work/core.18910
4.0G    /usr/sap/PRD/D00/work/dev_*
58G     /usr/sap/PRD/D00/work`,
      'rm /usr/sap/prd/d00/work/core.18910': `Removed core dump file core.18910 (54GB freed).`,
      'df -h /usr/sap after cleanup': `Filesystem      Size  Used Avail Use% Mounted on
/dev/sda2        80G   26G   54G  33% /usr/sap`
    },
    correctRootCause: 'A work process crashed during an earlier upgrade step, leaving a 54GB core dump file (core.18910) in /usr/sap/PRD/D00/work. This filled the /usr/sap filesystem to 100%, preventing the dispatcher from creating shared memory segments and causing STARTSYS_PRE to fail.',
    correctEvidence: [
      'STARTSYS.LOG directed attention to dev_disp.',
      'dev_disp reported DpShmCreate failed with rc = 28: No space left on device.',
      'df -h showed /usr/sap at 100% full (0MB free).',
      'du isolated a 54GB stale core dump file core.18910 in the work directory.'
    ],
    safeRemediation: 'Delete the obsolete 54GB core dump file (rm /usr/sap/PRD/D00/work/core.18910), verify free space is restored on /usr/sap, and choose "Repeat Phase" in the SUM browser interface. Do not initiate an unnecessary database rollback.',
    postFixValidation: 'Verify SUM successfully starts the target instance in phase STARTSYS_PRE with return code 0, and advances to subsequent phases.',
    scoringGuide: {
      keyCommandsNeeded: ['tail /usr/sap/prd/sum/abap/log/sapup.log', 'tail -n 20 /usr/sap/prd/d00/work/dev_disp', 'df -h /usr/sap', 'du -xhd 1 /usr/sap/prd/d00/work'],
      pitfalls: ['Triggering a multi-hour database restore for a simple disk-full error', 'Resetting SUM completely']
    }
  }
];

export const getLabScenarioById = (id: string): LabScenario | undefined => {
  return labScenarios.find((s) => s.id === id);
};

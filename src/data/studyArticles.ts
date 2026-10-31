import { StudyArticle } from '../types';

export const studyArticles: StudyArticle[] = [
  {
    id: 'art-sap-architecture',
    title: 'SAP NetWeaver Multi-Tier Architecture & Request Dispatching',
    domain: 'SAP Architecture',
    definition: 'The decoupled central services, application server, and database tier structure powering SAP S/4HANA and NetWeaver AS ABAP systems.',
    productionImpact: 'A failure in the central Enqueue Server or Message Server drops all connected application server instances. Understanding component boundaries prevents false diagnosis.',
    investigationMethod: 'Use sapcontrol GetProcessList, SM51, and inspect dev_disp, dev_ms, and dev_w* developer traces.',
    commonSymptoms: [
      'Users receive WSAECONNREFUSED upon SAP GUI launch.',
      'disp+work process abends immediately with exit code 255.',
      'Application server drops out of SM51 instance list.'
    ],
    diagnosticSteps: [
      'Check sapcontrol -nr <NR> -function GetProcessList for instance status.',
      'Verify ASCS Message Server and Enqueue Server are in GREEN state.',
      'Inspect /usr/sap/<SID>/<INSTANCE>/work/dev_disp for DpSysInit errors.',
      'Check port reachability: 32<NR> (dispatcher), 36<NR> (ms RFC), 39<NR> (ms internal).'
    ],
    exampleOutput: `00, disp+work, Running, GREEN
00, ig.watchdog, Running, GREEN
00, gwrd, Running, GREEN
00, icmbnd, Running, GREEN`,
    outputInterpretation: 'All daemons are GREEN. If users still cannot connect, inspect network routes, firewalls, or ICM SSL certificates.',
    commonMistakes: [
      'Restarting the entire database when only a single application server dispatcher crashed.',
      'Confusing ASCS (central services) with PAS (primary application server).'
    ],
    safeRemediation: 'Ensure ASCS is healthy before starting PAS/AAS. Fix network port blocks on port 39<ASCS_NR>. Use cleanipc to clear orphaned segments before restarts.',
    relatedSessionIds: ['w1d1', 'w1d2', 'w1d3'],
    knowledgeCheck: [
      {
        id: 'chk-art-1',
        question: 'Which central service manages the global SAP lock table in memory?',
        options: ['Message Server', 'Enqueue Server', 'Web Dispatcher', 'Gateway'],
        correctAnswer: 1,
        explanation: 'The Enqueue Server maintains logical locks in shared memory.'
      }
    ]
  },
  {
    id: 'art-linux-inodes',
    title: 'Linux Inode Exhaustion vs Disk Block Full (df -i vs df -h)',
    domain: 'Linux Administration',
    definition: 'The distinction between disk physical block storage and filesystem inode metadata tables in ext4 and XFS.',
    productionImpact: 'Exhausted inodes trigger ENOSPC (errno 28: No space left on device), halting SAP work processes, trace writing, and batch jobs, even when hundreds of gigabytes appear free.',
    investigationMethod: 'Always run df -i alongside df -hT. Use find to pinpoint directories with excessive file counts.',
    commonSymptoms: [
      'Applications report "No space left on device" while df -h shows 50GB free.',
      'touch /usr/sap/test fails with errno 28.',
      'Mail or EDI batch jobs abort.'
    ],
    diagnosticSteps: [
      'Execute df -i to view Inode Used % (IUse%).',
      'If IUse% is 100%, run: find /usr/sap -type d -exec sh -c "echo -n \\"{}\\": ; ls -1 \\"{}\\" | wc -l" \\; | sort -n -k 2 -t :',
      'Locate directories containing hundreds of thousands of stale files.',
      'Purge files safely using find -delete to avoid "Argument list too long".'
    ],
    exampleOutput: `Filesystem            Inodes   IUsed   IFree IUse% Mounted on
/dev/mapper/rootvg-sap 5242880 5242880       0  100% /usr/sap`,
    outputInterpretation: 'IUse% is 100%. Free inodes: 0. No new files, sockets, or named pipes can be created.',
    commonMistakes: [
      'Running rm * in a directory with 500,000 files, causing bash glob argument list overflow.',
      'Deleting large files to free gigabytes, which does nothing for exhausted inode tables.'
    ],
    safeRemediation: 'Use find /target/dir -type f -mtime +30 -delete to purge old files in chunks. Implement automated cron housekeeping.',
    relatedSessionIds: ['w2d1', 'w2d5'],
    knowledgeCheck: [
      {
        id: 'chk-art-2',
        question: 'Can a 0-byte empty file cause a filesystem to run out of inodes?',
        options: ['No', 'Yes, every directory entry and file consumes 1 inode regardless of byte size', 'Only on Oracle', 'Only on Windows'],
        correctAnswer: 1,
        explanation: 'Every file consumes 1 inode metadata record regardless of size.'
      }
    ]
  },
  {
    id: 'art-lsof-deleted',
    title: 'Deleted Files Held Open & Storage Accounting (df vs du Discrepancy)',
    domain: 'Linux Administration',
    definition: 'The Linux mechanism where unlinked files remain allocated on disk because active processes hold open file descriptors.',
    productionImpact: 'Admins delete multi-gigabyte log or core files with rm, but filesystem usage remains at 99%, risking immediate instance abends.',
    investigationMethod: 'Run lsof +L1 <mount_point> or inspect /proc/*/fd/* for (deleted) markers.',
    commonSymptoms: [
      'df -h shows 99% used, while du -xhd 1 shows only 30% accounted for.',
      'Disk space fails to free up after running rm on large files.'
    ],
    diagnosticSteps: [
      'Execute lsof +L1 /usr/sap to identify holding PIDs and file descriptor numbers.',
      'Verify the process holding the file in ps -ef.',
      'If process cannot be restarted, truncate descriptor: > /proc/<PID>/fd/<FD>.'
    ],
    exampleOutput: `COMMAND     PID   USER   FD   TYPE DEVICE        SIZE/OFF NODE NAME
disp+work 18420 prdadm    7w   REG    8,2 52428800000 412089 /usr/sap/PRD/D00/work/dev_disp (deleted)`,
    outputInterpretation: 'disp+work holds FD 7 open to deleted file dev_disp of size 52GB. Blocks remain locked on disk.',
    commonMistakes: [
      'Rebooting production servers to release file handles.',
      'Running kill -9 on SAP or Oracle background daemons.'
    ],
    safeRemediation: 'Truncate the descriptor in-place (> /proc/<PID>/fd/<FD>) to release blocks instantly without process restart.',
    relatedSessionIds: ['w2d2', 'w2d5'],
    knowledgeCheck: [
      {
        id: 'chk-art-3',
        question: 'How do you truncate a deleted file held by PID 500 on FD 4 without restarting the process?',
        options: ['kill -9 500', '> /proc/500/fd/4', 'rm -f /proc/500', 'reboot'],
        correctAnswer: 1,
        explanation: 'Redirecting null into the proc file descriptor zeroes the allocated disk blocks immediately.'
      }
    ]
  },
  {
    id: 'art-hana-log-volume',
    title: 'SAP HANA Log Volume Saturation & Disaster Recovery',
    domain: 'SAP HANA',
    definition: 'The condition where /hana/log reaches 100% full under log_mode=normal due to failed or stalled log backups.',
    productionImpact: 'All SAP database write transactions halt immediately during COMMIT in LOG_BUFFER_WAIT, completely freezing enterprise operations.',
    investigationMethod: 'Check df -h /hana/log, backup.log in HANA trace directory, and M_LOG_BUFFERS system view.',
    commonSymptoms: [
      'All SM50 work processes enter DB-Wait state on COMMIT.',
      'df -h /hana/log shows 100% used (0MB free).',
      'HANA Studio shows alert 28: Cannot write log buffer.'
    ],
    diagnosticSteps: [
      'Check df -h /hana/log and the backup target volume.',
      'Inspect /usr/sap/<SID>/HDB<NR>/<host>/trace/backup.log.',
      'Identify if backup target is full, network disconnected, or catalog locked.',
      'Free backup destination storage or mount temporary emergency backup storage.',
      'Trigger manual log backup: BACKUP LOG USING FILE (\'/backup/emergency\').'
    ],
    exampleOutput: `2026-10-28T08:14:12 [ERROR] BackupController: Error writing log backup file '/backup/log_backup_0_0_142.bak': No space left on device
2026-10-28T08:14:15 [WARN] LogSegmentManager: No free log segments available! Disk full in /hana/log.`,
    outputInterpretation: 'The backup destination disk is full. HANA cannot back up segments, preventing reuse and freezing transactions.',
    commonMistakes: [
      'Deleting .log files from /hana/log using rm (catastrophic database corruption!).',
      'Restarting HANA with a 100% full log disk (crash recovery startup aborts!).'
    ],
    safeRemediation: 'Restore space on the backup destination and force log backup execution. NEVER delete active redo files with rm.',
    relatedSessionIds: ['w3d2', 'w3d5'],
    knowledgeCheck: [
      {
        id: 'chk-art-4',
        question: 'What happens if you restart SAP HANA when /hana/log is 100% full?',
        options: ['HANA starts normally', 'Startup recovery aborts because redo replay cannot allocate log blocks', 'HANA uninstalls', 'Data is deleted'],
        correctAnswer: 1,
        explanation: 'Crash recovery requires log buffer space to write recovery records. Restarting with 0 free log bytes aborts startup.'
      }
    ]
  },
  {
    id: 'art-oracle-archiver',
    title: 'Oracle Database ORA-00257 Archiver Error & Storage Recovery',
    domain: 'Oracle Database',
    definition: 'The state where the Oracle archivelog destination fills to 100%, preventing the background archiver (ARCn) from copying filled online redo logs.',
    productionImpact: 'The log writer (LGWR) cannot switch online redo logs. All database update and commit transactions hang indefinitely.',
    investigationMethod: 'Check df -h /oracle/<SID>/oraarch and alert_<SID>.log for ORA-00257.',
    commonSymptoms: [
      'SM50 shows all DIA and UPD work processes in DB-Wait.',
      'dev_w* logs: DB-Error: ORA-00257: archiver error. Connect AS SYSDBA only until freed.',
      'alert_<SID>.log reports "LGWR: Cannot switch log; all logs require archiving".'
    ],
    diagnosticSteps: [
      'Check df -h on the archivelog filesystem (/oracle/<SID>/oraarch).',
      'Inspect alert_<SID>.log for ARCn errors.',
      'Execute brarchive with -sd flag to safely back up and delete archived redo logs.',
      'Verify ARCn resumes copying and LGWR clears the checkpoint stall.'
    ],
    exampleOutput: `ARC0: Archival stopped; destination /oracle/PRD/oraarch is out of space.
LGWR: Cannot switch redo log; all online logs require archiving.`,
    outputInterpretation: 'Online redo log ring buffer is full. No further transactions can commit until space is freed in the archivelog destination.',
    commonMistakes: [
      'Manually deleting archivelogs with rm, which desynchronizes the Oracle RMAN / BR*Tools catalog.',
      'Restarting Oracle while archivelog destination is 100% full.'
    ],
    safeRemediation: 'Run brarchive -u / -c -b -d util_file -sd to back up and safely delete archivelogs through the official SAP toolchain.',
    relatedSessionIds: ['w3d3', 'w3d5'],
    knowledgeCheck: [
      {
        id: 'chk-art-5',
        question: 'Which tool should be used in SAP on Oracle to safely back up and delete filled archivelogs?',
        options: ['rm -rf', 'brarchive with -sd flag', 'cleanipc', 'sapcontrol'],
        correctAnswer: 1,
        explanation: 'brarchive updates the backup catalog and safely purges archived logs only after verifying successful backup.'
      }
    ]
  },
  {
    id: 'art-pacemaker-flapping',
    title: 'Pacemaker Cluster Flapping, Monitor Timeouts, and Maintenance Mode',
    domain: 'High Availability',
    definition: 'The condition where cluster resources bounce repeatedly between nodes due to health probe timeouts rather than genuine process crashes.',
    productionImpact: 'Users are repeatedly disconnected every few minutes as the cluster moves the ASCS or Database instance back and forth.',
    investigationMethod: 'Run crm_mon -r1, inspect Failed Resource Actions, and analyze systemd journal/syslog around the exact failure second.',
    commonSymptoms: [
      'crm_mon shows failed action with status "Timed Out".',
      'Instances migrate every 15-30 minutes.',
      'High CPU or storage I/O latency observed during backup or scan windows.'
    ],
    diagnosticSteps: [
      'Freeze flapping immediately: crm resource maintenance <RESOURCE> true.',
      'Check crm_mon -1 for Failed Resource Actions.',
      'Inspect /var/log/messages for I/O stalls or high CPU that delayed the monitor script.',
      'Tune monitor timeout (e.g. from 60s to 120s).',
      'Clear fail-counts (crm resource cleanup) and disable maintenance mode.'
    ],
    exampleOutput: `Failed Resource Actions:
  * rsc_sap_ASCS00_monitor_30000 on node1 'timed out' (call=42, status=Timed Out, exec=60002ms)`,
    outputInterpretation: 'The monitor script took longer than 60 seconds to finish. The cluster assumed the node died and triggered failover.',
    commonMistakes: [
      'Disabling STONITH or cluster fencing, which risks catastrophic split-brain corruption.',
      'Clearing failure counts immediately without diagnosing the root cause, leading to continuous bouncing.'
    ],
    safeRemediation: 'Put the resource into maintenance mode during triage, tune monitor timeouts to absorb transient I/O spikes, and resolve underlying storage saturation.',
    relatedSessionIds: ['w5d1', 'w5d2', 'w5d5'],
    knowledgeCheck: [
      {
        id: 'chk-art-6',
        question: 'What is the immediate safe action to stop cluster flapping without terminating the application?',
        options: ['killall corosync', 'Set resource or cluster maintenance mode', 'Pull power cable', 'Format disks'],
        correctAnswer: 1,
        explanation: 'Maintenance mode tells Pacemaker to freeze resource management in place, preventing further failovers.'
      }
    ]
  }
];

export const getArticleById = (id: string): StudyArticle | undefined => {
  return studyArticles.find((a) => a.id === id);
};

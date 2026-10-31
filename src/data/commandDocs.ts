import { CommandDoc } from '../types';

export const commandDocs: CommandDoc[] = [
  {
    id: 'cmd-df',
    command: 'df -hT / df -i',
    category: 'filesystem',
    purpose: 'Report filesystem disk space usage, filesystem type (ext4, xfs, nfs4), and inode table capacity.',
    syntax: 'df -hT [<PATH>] / df -i [<PATH>]',
    importantFlags: [
      { flag: '-h', description: 'Human-readable sizes (MB, GB, TB).' },
      { flag: '-T', description: 'Print filesystem type (xfs, ext4, nfs).' },
      { flag: '-i', description: 'List inode usage and percentage instead of block space.' }
    ],
    exampleOutput: `Filesystem            Type  Size  Used Avail Use% Mounted on
/dev/mapper/rootvg-sap xfs   100G   42G   58G  42% /usr/sap
/dev/mapper/rootvg-hdb xfs   500G  380G  120G  76% /hana/data
nfs-nas:/sapmnt        nfs4  2.0T  850G  1.2T  42% /sapmnt`,
    interpretation: 'Use df -hT to verify physical block capacity. Always run df -i whenever an application reports ENOSPC (No space left on device) while df -h shows free space.',
    requiredPermissions: 'Read-only; executable by standard user or <sid>adm.',
    productionSafety: 'Safe. Completely non-intrusive read-only system inspection.',
    isReadOnly: true
  },
  {
    id: 'cmd-du',
    command: 'du -xhd 1',
    category: 'filesystem',
    purpose: 'Summarize directory space usage strictly within a single filesystem boundary without crossing NFS mounts.',
    syntax: 'du -xhd 1 <DIRECTORY> | sort -hr',
    importantFlags: [
      { flag: '-x', description: 'One file system only; strictly prevents du from recursing into mounted NFS or sub-mounts!' },
      { flag: '-h', description: 'Human-readable format (MB, GB).' },
      { flag: '-d 1', description: 'Max depth of 1 directory level.' }
    ],
    exampleOutput: `42G     /usr/sap
28G     /usr/sap/PRD
10G     /usr/sap/trans
4.0G    /usr/sap/tmp`,
    interpretation: 'Ranks storage consumption by directory. Omitting -x in an SAP landscape can cause du to crawl multi-terabyte NFS shares, hanging the terminal or saturating storage.',
    requiredPermissions: 'Read permission on target directories.',
    productionSafety: 'Safe when -x is included. Can incur disk I/O on massive directory trees.',
    isReadOnly: true
  },
  {
    id: 'cmd-lsof',
    command: 'lsof +L1',
    category: 'filesystem',
    purpose: 'Find files deleted from the directory tree whose blocks remain allocated on disk because active processes hold open file handles.',
    syntax: 'lsof +L1 [<MOUNT_POINT>]',
    importantFlags: [
      { flag: '+L1', description: 'Filters for files with hard link count < 1 (unlinked from directory tree).' }
    ],
    exampleOutput: `COMMAND     PID   USER   FD   TYPE DEVICE        SIZE/OFF NODE NAME
disp+work 14210 prdadm    7w   REG    8,2 52428800000 412089 /usr/sap/PRD/D00/work/dev_disp (deleted)`,
    interpretation: 'Explains the common discrepancy where df reports 99% used while du reports only 20%. The file was deleted with rm, but disp+work still holds FD 7 open.',
    requiredPermissions: 'root or <sid>adm for processes owned by the user.',
    productionSafety: 'Safe read-only diagnosis.',
    isReadOnly: true
  },
  {
    id: 'cmd-top',
    command: 'top',
    category: 'linux-resource',
    purpose: 'Real-time interactive monitoring of CPU states, load average, physical memory, swap, and top process threads.',
    syntax: 'top -b -n 1 -o %CPU / top -b -n 1 -o %MEM',
    importantFlags: [
      { flag: '-b', description: 'Batch mode for script logging.' },
      { flag: '-n 1', description: 'Take 1 single iteration.' },
      { flag: '-o %MEM', description: 'Sort processes by physical memory utilization.' }
    ],
    exampleOutput: `%Cpu(s): 18.4 us,  4.2 sy,  0.0 ni, 74.2 id,  3.2 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem : 257522.0 total,  14210.0 free, 180210.0 used,  63102.0 buff/cache
MiB Swap:  32768.0 total,  31800.0 free,    968.0 used.  71212.0 avail Mem`,
    interpretation: 'Look closely at %wa (I/O wait; >10% indicates disk bottleneck) and %st (steal time; >3% in cloud indicates VM hypervisor contention).',
    requiredPermissions: 'Any standard user.',
    productionSafety: 'Safe read-only inspection.',
    isReadOnly: true
  },
  {
    id: 'cmd-vmstat',
    command: 'vmstat 1 5',
    category: 'linux-resource',
    purpose: 'Report process queues, memory paging, block I/O, and CPU activity breakdown at 1-second intervals.',
    syntax: 'vmstat 1 5',
    importantFlags: [
      { flag: '1', description: 'Interval in seconds between reports.' },
      { flag: '5', description: 'Total number of sample intervals to capture.' }
    ],
    exampleOutput: `procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
 2  0   1200   4210    120  73102    0    0    45   120 1800 3200 22  4 74  0  0`,
    interpretation: 'Continuous positive values in "si" (swap in) and "so" (swap out) prove active memory thrashing. Non-zero "b" indicates processes blocked in uninterruptible disk sleep.',
    requiredPermissions: 'Any standard user.',
    productionSafety: 'Safe read-only diagnosis.',
    isReadOnly: true
  },
  {
    id: 'cmd-ss',
    command: 'ss -tulnp',
    category: 'networking',
    purpose: 'Inspect listening TCP/UDP sockets, port bindings, and owning processes without /proc overhead.',
    syntax: 'ss -tulnp / ss -tan state established',
    importantFlags: [
      { flag: '-t', description: 'Display TCP sockets.' },
      { flag: '-u', description: 'Display UDP sockets.' },
      { flag: '-l', description: 'Show only listening sockets.' },
      { flag: '-n', description: 'Do not resolve service names; show numeric ports (e.g. 3200 instead of sapdp00).' },
      { flag: '-p', description: 'Show process name and PID owning the socket.' }
    ],
    exampleOutput: `Netid State  Recv-Q Send-Q Local Address:Port  Peer Address:Port Process
tcp   LISTEN 0      128    0.0.0.0:3200        0.0.0.0:*         users:(("disp+work",pid=14201,fd=18))
tcp   LISTEN 0      128    0.0.0.0:50013       0.0.0.0:*         users:(("sapstartsrv",pid=1209,fd=6))`,
    interpretation: 'Modern replacement for deprecated netstat. Verifies whether dispatcher (32<NR>), gateway (33<NR>), or sapstartsrv (5<NR>13) ports are successfully bound.',
    requiredPermissions: 'Root or <sid>adm needed to view process names (-p).',
    productionSafety: 'Safe read-only command.',
    isReadOnly: true
  },
  {
    id: 'cmd-sapcontrol',
    command: 'sapcontrol -nr <NR> -function <FUNCTION>',
    category: 'sap-instance',
    purpose: 'Standard command-line interface to interact with sapstartsrv to inspect status, start, or stop SAP instances.',
    syntax: 'sapcontrol -nr <INSTANCE_NR> -function GetProcessList',
    importantFlags: [
      { flag: '-nr <NR>', description: 'Two-digit SAP instance number (e.g. 00, 01, 10).' },
      { flag: '-function <FN>', description: 'Function to call: GetProcessList, Start, Stop, GetSystemInstanceList.' }
    ],
    exampleOutput: `00, disp+work, Running, GREEN
00, ig.watchdog, Running, GREEN
00, gwrd, Running, GREEN
00, icmbnd, Running, GREEN`,
    interpretation: 'Returns color state (GREEN, YELLOW, GRAY, RED) and exit codes. Runs without password locally via UNIX domain socket /tmp/.sapstream5<NR>13 when executed as <sid>adm.',
    requiredPermissions: '<sid>adm user locally.',
    productionSafety: 'GetProcessList is safe. Start/Stop commands change system availability.',
    isReadOnly: false
  },
  {
    id: 'cmd-r3trans',
    command: 'R3trans -d',
    category: 'sap-traces',
    purpose: 'Tests SAP database client connectivity and system table reachability from the OS terminal without starting the SAP application.',
    syntax: 'R3trans -d',
    importantFlags: [
      { flag: '-d', description: 'Database connect test only.' },
      { flag: '-v', description: 'Print R3trans and DB library version.' }
    ],
    exampleOutput: `2026-10-28 10:14:00
R3trans was called as follows: R3trans -d
R3trans finished with return code 0000.`,
    interpretation: 'Return codes: 0000 = Success; 0004 = Warning; 0012 = Severe DB connection error (check trans.log for ORA- or HDB errors); 0016 = Critical crash.',
    requiredPermissions: '<sid>adm.',
    productionSafety: 'Safe read-only database probe.',
    isReadOnly: true
  },
  {
    id: 'cmd-cleanipc',
    command: 'cleanipc <NR> check / remove',
    category: 'sap-instance',
    purpose: 'Detect and purge orphaned shared memory segments and semaphores left behind after an abnormal SAP instance crash.',
    syntax: 'cleanipc <INSTANCE_NR> check / cleanipc <INSTANCE_NR> remove',
    importantFlags: [
      { flag: 'check', description: 'Lists orphaned IPC objects without deleting.' },
      { flag: 'remove', description: 'Deletes orphaned IPC objects for the instance.' }
    ],
    exampleOutput: `cleanipc: checking for obsolete shared memory and semaphores for instance 00...
Found 6 orphaned shared memory segments owned by dead PID 18210.
Segment 100 removed.
Segment 101 removed.`,
    interpretation: 'Essential step before restarting an instance that crashed with "DpShmCreate failed (rc = 17: File exists)".',
    requiredPermissions: '<sid>adm.',
    productionSafety: 'Safe when instance is stopped. Never run remove on an actively running instance!',
    isReadOnly: false
  },
  {
    id: 'cmd-crmmon',
    command: 'crm_mon -r1',
    category: 'ha-cluster',
    purpose: 'Comprehensive one-screen status snapshot of Pacemaker cluster nodes, resource allocations, and failed actions.',
    syntax: 'crm_mon -r1 / crm_mon -r1j (JSON format)',
    importantFlags: [
      { flag: '-r', description: 'Show inactive/stopped resources.' },
      { flag: '-1', description: 'Display single iteration and exit immediately (non-interactive).' }
    ],
    exampleOutput: `Stack: corosync
Current DC: prd-ascs01 (version 2.1.2) - partition with quorum
2 nodes configured, 2 expected votes
Online: [ prd-ascs01 prd-ascs02 ]

Full List of Resources:
 * rsc_sap_ASCS00	(ocf::heartbeat:SAPInstance):	Started prd-ascs01
 * rsc_sap_ERS01	(ocf::heartbeat:SAPInstance):	Started prd-ascs02`,
    interpretation: 'Look for "Failed Resource Actions" at the bottom to identify monitor timeouts or instance abends causing failover.',
    requiredPermissions: 'Any standard user or root.',
    productionSafety: 'Safe read-only cluster inspection.',
    isReadOnly: true
  },
  {
    id: 'cmd-hdbnsutil',
    command: 'hdbnsutil -sr_state',
    category: 'hana',
    purpose: 'Queries SAP HANA System Replication (HSR) mode, status, and synchronization state between primary and secondary.',
    syntax: 'hdbnsutil -sr_state',
    importantFlags: [
      { flag: '-sr_state', description: 'Dumps replication status tree.' }
    ],
    exampleOutput: `mode: sync
operation mode: logreplay
site id: 1
site name: prd-hdb01
is source system: true
overall replication status: ACTIVE
local site id: 1
secondary sites:
  site id: 2, site name: prd-hdb02, mode: sync, status: ACTIVE, sync_state: SOK`,
    interpretation: 'Verify sync_state is SOK before performing any planned maintenance or takeover. "UNKNOWN" or "ERROR" indicates replication lag or network disconnection.',
    requiredPermissions: '<sid>adm on HANA host.',
    productionSafety: 'Safe read-only command.',
    isReadOnly: true
  },
  {
    id: 'cmd-lsnrctl',
    command: 'lsnrctl status',
    category: 'oracle',
    purpose: 'Inspect status, listening ports, and registered service handlers of the Oracle TNS listener.',
    syntax: 'lsnrctl status [<LISTENER_NAME>]',
    importantFlags: [
      { flag: 'status', description: 'Prints uptime, trace level, listening endpoints, and services.' },
      { flag: 'start', description: 'Starts the listener service.' }
    ],
    exampleOutput: `Connecting to (DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=prd-db01)(PORT=1527)))
STATUS of the LISTENER
------------------------
Alias                     LISTENER
Version                   TNSLSNR for Linux: Version 19.0.0.0.0
Services Summary...
Service "PRD" has 1 instance(s). Instance "PRD", status READY, has 1 handler(s).`,
    interpretation: 'If lsnrctl status returns TNS-12541, the listener is down. If it says "supports no services", the DB instance has not registered with the listener.',
    requiredPermissions: 'ora<sid> or oracle user.',
    productionSafety: 'Safe read-only status check.',
    isReadOnly: true
  }
];

import { CurriculumSession } from '../../types';

export const week2Sessions: CurriculumSession[] = [
  {
    id: 'w2d1',
    week: 2,
    day: 1,
    title: 'Linux Filesystem and Mount Point Diagnosis',
    topic: 'df -hT, df -i, findmnt, Mount Options, du Calculation, and Filesystem Discrepancies',
    domain: 'linux',
    durationMinutes: 60,
    learningObjectives: [
      'Master the distinction between disk space utilization (blocks) and inode table capacity.',
      'Diagnose read-only filesystem remounts, NFS stale file handles, and corrupted superblocks.',
      'Utilize findmnt, blkid, and /etc/fstab to audit mount hierarchies and verify noatime/nodiratime flags.',
      'Safely execute du across mount boundaries without crossing onto remote NFS shares.',
      'Resolve "No space left on device" errors that occur when df -h shows ample free space.'
    ],
    technicalExplanation: `In enterprise Linux hosting SAP NetWeaver and SAP HANA, filesystem health is the foundation of stability.

1. **Space (Blocks) vs Inodes (Metadata)**:
   - \`df -hT\`: Displays filesystem capacity, free space in human-readable gigabytes, and filesystem type (xfs, ext4, nfs4).
   - \`df -i\`: Displays total and consumed **inodes**. Every file, directory, socket, and FIFO occupies an inode regardless of file size. A 0-byte file consumes 1 inode.
   - If a filesystem reaches 100% inode capacity (\`IUse% 100%\`), Linux raises \`ENOSPC (errno 28: No space left on device)\` even if 500GB of disk space is free!

2. **Mount Point Hierarchy & Traps**:
   - \`findmnt\`: Shows the real-time tree of active mounts, source block devices, target mountpoints, and options.
   - **The Hidden Data Trap**: If a filesystem (e.g. \`/sapmnt\`) is mounted *over* an existing local directory that already contained data, the files under the original directory become invisible to users and \`du\`, yet they still consume space on the parent root (\`/\`) filesystem!
   - Unmounting the sub-mount reveals the hidden data.

3. **Safe Storage Inspection Commands**:
   \`\`\`bash
   # Inspect human-readable sizes with filesystem type
   df -hT /usr/sap /sapmnt

   # Inspect inode utilization
   df -i /usr/sap

   # Safe du: -x stays on one filesystem (never crosses NFS mounts!)
   du -xhd 1 /usr/sap | sort -hr
   \`\`\``,
    detailedStudyNotes: [
      'Always use du -x: In SAP environments with NFS mounts (/sapmnt, /usr/sap/trans), running plain du -sh /* will cross the network into multi-terabyte NFS shares, hanging the terminal or saturating the network!',
      'XFS behavior: Modern SUSE/RHEL systems format partitions with XFS. Inodes are dynamically allocated until maximum limit is reached. In ext4, inode counts are fixed at mkfs format time.',
      'NFS Stale file handle: Occurs when an NFS server unexports or removes an underlying directory while the client still holds an active mount. findmnt or mount command will hang on stat calls.'
    ],
    toolsAndCommands: [
      { name: 'df -hT', type: 'command', description: 'Reports filesystem disk space usage, types (ext4, xfs, nfs), and mount points.' },
      { name: 'df -i', type: 'command', description: 'Reports inode counts and inode percentage used.' },
      { name: 'findmnt', type: 'command', description: 'Displays an interactive hierarchical tree of all mounted filesystems and options.' },
      { name: 'du -xhd 1 <DIR>', type: 'command', description: 'Calculates directory size strictly within the local filesystem boundaries up to depth 1.' }
    ],
    productionScenario: {
      ticketId: 'INC-2026-08201',
      severity: 'P1',
      title: 'Batch Jobs Failing with File System Full - df Shows 40GB Free',
      description: 'Nightly payment processing batch job Z_EDI_INVOICE_OUT abended with OS error "No space left on device". Basis checked df -h /usr/sap/PRD/SYS/global and observed 40GB available.',
      systemContext: 'SLES 15 SP4, SAP S/4HANA 2022.'
    },
    guidedInvestigation: [
      {
        step: 1,
        title: 'Check Inode Capacity with df -i',
        instruction: 'Run df -i /usr/sap/PRD/SYS/global.',
        expectedFinding: 'IUse% is at 100%. Free inodes: 0.',
        interpretation: 'The filesystem has plenty of block storage, but the inode metadata table is completely exhausted.'
      },
      {
        step: 2,
        title: 'Locate Directory with Excessive File Count',
        instruction: 'Execute find /usr/sap/PRD/SYS/global -type d -exec sh -c "echo -n \\"{}\\": ; ls -1 \\"{}\\" | wc -l" \\; | sort -n -k 2 -t :',
        expectedFinding: 'Directory /usr/sap/PRD/SYS/global/edi_archive contains 2,410,000 tiny 50-byte acknowledgement files.',
        interpretation: 'A faulty EDI script created millions of micro-files over 6 months without archival or cleanup.'
      },
      {
        step: 3,
        title: 'Safely Purge Stale Files without Shell Glob Overflow',
        instruction: 'Run find /usr/sap/PRD/SYS/global/edi_archive -type f -mtime +90 -delete.',
        expectedFinding: 'Inodes freed; IUse% drops to 12%. Batch job completes successfully upon restart.',
        interpretation: 'Using rm * would have failed with "Argument list too long"; find -delete successfully purged inodes.'
      }
    ],
    handsOnTask: {
      title: 'Audit Production Filesystems and Inode Ratios',
      instructions: [
        'Compare the output of df -h and df -i on a Linux system.',
        'Document why rm * fails with "Argument list too long" in directories with over 100,000 files, and provide two safe alternatives.',
        'Explain the purpose of the -x flag in du -xhd 1.'
      ],
      deliverable: 'A filesystem emergency operational reference sheet.'
    },
    knowledgeCheck: [
      {
        id: 'w2d1_q1',
        question: 'Why would an application report "No space left on device" when df -h shows 50GB of free space?',
        options: [
          'The user has exceeded their CPU time quota.',
          'The filesystem has exhausted all available inodes (df -i shows 100% used).',
          'The SAP license has expired.',
          'The network switch dropped packets.'
        ],
        correctAnswer: 1,
        explanation: 'When 100% of inodes are consumed by millions of files, no new files can be created, triggering errno 28 (ENOSPC) regardless of free gigabytes.'
      },
      {
        id: 'w2d1_q2',
        question: 'Why should an administrator always pass the -x flag when running du on an SAP host?',
        options: [
          'It accelerates CPU clock frequency.',
          'It restricts du to a single filesystem, preventing it from recursing into mounted NFS shares or other partitions.',
          'It hides files owned by root.',
          'It encrypts the output.'
        ],
        correctAnswer: 1,
        explanation: 'The -x (or --one-file-system) flag prevents du from traversing into foreign mounts, such as remote multi-terabyte NFS shares like /sapmnt.'
      }
    ],
    tasks: [
      { id: 't1', text: 'Understand disk block allocation versus inode metadata tables.' },
      { id: 't2', text: 'Learn findmnt usage and mount option verification.' },
      { id: 't3', text: 'Review how to purge huge directories without argument list overflow.' },
      { id: 't4', text: 'Complete the Day 1 Linux knowledge check.' }
    ]
  },
  {
    id: 'w2d2',
    week: 2,
    day: 2,
    title: 'Deleted Files Held Open and Storage Accounting (df vs du)',
    topic: 'lsof +L1, Open File Descriptors, Storage Discrepancies, and Hidden Mount Point Data',
    domain: 'linux',
    durationMinutes: 60,
    learningObjectives: [
      'Master why df (disk free) and du (disk usage) report conflicting numbers.',
      'Identify and diagnose files deleted by rm that remain allocated in memory via open file handles.',
      'Use lsof +L1 and /proc/<PID>/fd to track down processes locking deleted files.',
      'Safely release file descriptors without crashing critical SAP or database services.',
      'Uncover data hidden beneath mount points when filesystems are mounted on non-empty directories.'
    ],
    technicalExplanation: `One of the most common and puzzling production scenarios: An administrator deletes a 200GB trace or backup file using \`rm\`, yet \`df -h\` still shows the filesystem at 99% full!

1. **Why df != du**:
   - \`df\` queries the filesystem superblock for total allocated versus free blocks. It reflects real physical space reserved.
   - \`du\` walks the directory tree by calling \`stat()\` on each visible file path and summing their sizes.
   - **The Deleted-Open Phenomenon**:
     - When a file is opened by a running process (e.g. \`disp+work\`, \`trace\`, or a backup agent), the OS creates an open file descriptor.
     - When you run \`rm file.log\`, the directory entry (dentry) is unlinked from the directory tree, making it invisible to \`ls\` and \`du\`.
     - However, the filesystem **cannot free the blocks** until the process holding the file descriptor closes it or terminates!

2. **Diagnosing Unlinked Open Files**:
   \`\`\`bash
   # Find all deleted files with link count 0 still held open by processes
   lsof +L1 /usr/sap

   # Alternative via proc filesystem
   ls -l /proc/*/fd/* 2>/dev/null | grep "(deleted)"
   \`\`\`

3. **Safe Remediation**:
   - Best: Signal the application or process to close and reopen its log (e.g. SAP trace reset or service restart).
   - If the process cannot be restarted immediately: Truncate the file descriptor directly:
     \`\`\`bash
     # Truncate the file through proc without terminating the process!
     > /proc/<PID>/fd/<FD_NUMBER>
     \`\`\``,
    detailedStudyNotes: [
      'Never blindly kill -9: Killing the process holding the descriptor might be dangerous if it is an Oracle background process or SAP dispatcher. Truncating via /proc/<PID>/fd/<FD> releases disk space instantly and safely.',
      'Hidden mount point trap: If du reports 10GB used on /, but df reports 80GB used, check if files were written into /sapmnt before the NFS partition was mounted. Test by mounting the root partition bind-mounted to /mnt/temp: mount --bind / /mnt/temp and checking /mnt/temp/sapmnt.',
      'lsof +L1 explanation: +L1 tells lsof to filter for files whose hard link count is less than 1 (i.e. 0, meaning deleted from directory tree).'
    ],
    toolsAndCommands: [
      { name: 'lsof +L1', type: 'command', description: 'Lists all open files with link count zero (deleted but held open).' },
      { name: '> /proc/<PID>/fd/<FD>', type: 'command', description: 'Zeroes out a deleted open file in place, freeing disk blocks immediately.' },
      { name: 'mount --bind / /mnt/temp', type: 'command', description: 'Bind-mounts root partition to inspect underlying directories hidden by mounts.' }
    ],
    productionScenario: {
      ticketId: 'INC-2026-08202',
      severity: 'P1',
      title: '/usr/sap at 99% - Deleted 50GB Trace File but Disk Space Did Not Free Up',
      description: 'An SAP administrator noticed dev_disp was 50GB due to trace level 3. The admin ran "rm dev_disp", but df -h continues to report /usr/sap at 99% full, threatening an imminent instance crash.',
      systemContext: 'RHEL 8.6, SAP NetWeaver 7.50 on Oracle.'
    },
    guidedInvestigation: [
      {
        step: 1,
        title: 'Verify Space Discrepancy between df and du',
        instruction: 'Run df -h /usr/sap and du -xhd 1 /usr/sap.',
        expectedFinding: 'df reports 98GB used (99%). du reports only 48GB accounted for across all directories.',
        interpretation: 'Approximately 50GB is held by deleted files whose file descriptors remain open.'
      },
      {
        step: 2,
        title: 'Identify Holding Process via lsof +L1',
        instruction: 'Execute lsof +L1 /usr/sap.',
        expectedFinding: 'disp+work PID 18921 holds FD 7 pointing to /usr/sap/PRD/D00/work/dev_disp (deleted), size 51,200,000,000 bytes.',
        interpretation: 'The active dispatcher process is still writing to the unlinked file descriptor.'
      },
      {
        step: 3,
        title: 'Safely Truncate Descriptor without Restarting SAP',
        instruction: 'Execute : > /proc/18921/fd/7 and immediately re-check df -h.',
        expectedFinding: 'df -h immediately reports /usr/sap usage dropped from 99% to 48%. Dispatcher continues running unharmed.',
        interpretation: 'Truncating the file descriptor freed the allocated filesystem blocks without dropping SAP connections.'
      }
    ],
    handsOnTask: {
      title: 'Practice Safe File Truncation and lsof Analysis',
      instructions: [
        'Document the exact mechanics of why "rm" does not free disk blocks while a process holds the descriptor.',
        'Write the exact command line to find and truncate an unlinked file held by PID 4410 on file descriptor 12.',
        'Explain why "cat /dev/null > filename" is preferable to "rm filename" for live active log files.'
      ],
      deliverable: 'A guide on managing live log rotation and unlinked file handles.'
    },
    knowledgeCheck: [
      {
        id: 'w2d2_q1',
        question: 'Why does df -h continue to report high disk usage after a large file is deleted with rm?',
        options: [
          'The Linux kernel requires an OS reboot to update the partition table.',
          'A running process still has the file open via an active file descriptor; blocks are only released when closed or truncated.',
          'The file was sent to the user Trash bin on the desktop.',
          'The disk controller cache is delayed by 24 hours.'
        ],
        correctAnswer: 1,
        explanation: 'Linux filesystems only reclaim allocated blocks when both the directory link count reaches zero AND all processes have closed their open file descriptors.'
      },
      {
        id: 'w2d2_q2',
        question: 'How can an administrator instantly free the disk space of a deleted file held by PID 9988 on file descriptor 4 without killing the process?',
        options: [
          'Run kill -9 9988.',
          'Run > /proc/9988/fd/4.',
          'Run umount -f /usr/sap.',
          'Run chown root /proc/9988.'
        ],
        correctAnswer: 1,
        explanation: 'Truncating the open descriptor directly via the /proc filesystem (> /proc/9988/fd/4) zeros out the file blocks immediately while keeping the process running.'
      }
    ],
    tasks: [
      { id: 't1', text: 'Understand why df reflects superblock allocation while du calculates dentry sizes.' },
      { id: 't2', text: 'Learn lsof +L1 syntax and output fields.' },
      { id: 't3', text: 'Master safe descriptor truncation via /proc/<PID>/fd/.' },
      { id: 't4', text: 'Complete the Day 2 Linux knowledge check.' }
    ]
  },
  {
    id: 'w2d3',
    week: 2,
    day: 3,
    title: 'CPU, Memory, and Swap Sizing and Contention Diagnosis',
    topic: 'top, ps, free -h, vmstat, Load Average, Swap Activity, Process Memory, and OOM-Killer',
    domain: 'linux',
    durationMinutes: 60,
    learningObjectives: [
      'Interpret top and vmstat metrics with precision (us, sy, id, wa, si, so).',
      'Diagnose CPU starvation vs I/O wait (wa%) saturation.',
      'Differentiate physical memory, virtual memory (VSZ), resident set size (RSS), and shared memory (SHR).',
      'Analyze Linux swap in/swap out (si/so) rates and understand why paging degrades SAP performance.',
      'Investigate the Linux Out-Of-Memory (OOM) killer and protect critical SAP/HANA processes via oom_score_adj.'
    ],
    technicalExplanation: `Operating system resource saturation directly triggers cascading SAP performance incidents.

1. **CPU Analysis & Load Average**:
   - **Load Average**: Represents the average number of threads that are actively executing on CPU or blocked waiting for uninterruptible disk I/O (D-state).
   - Rule of Thumb: A load average higher than the total number of physical CPU cores indicates queuing.
   - **CPU State Breakdown**:
     - \`us\` (User): Time executing user code (ABAP work processes, HANA queries).
     - \`sy\` (System): Time executing kernel system calls (context switches, memory allocation). If \`sy > 25%\`, suspect thread contention or excessive IPC.
     - \`wa\` (I/O Wait): CPU is idle waiting for disk or network I/O. If \`wa > 10%\`, disk storage latency is bottlenecking the system!

2. **Memory Breakdown with free -h**:
   \`\`\`bash
   # free -m output interpretation:
   #               total        used        free      shared  buff/cache   available
   # Mem:         257522      180210        4210       32100       73102       71212
   # Swap:         32767        1200       31567
   \`\`\`
   - **available**: The true indicator of available memory that can be given to new processes without swapping.
   - **shared**: Critical for SAP; represents SAP dispatcher shared memory segments and database shared buffers.

3. **Swap & vmstat**:
   - Swapping out idle pages is normal, but **continuous swap thrashing** (\`si > 0\` and \`so > 0\` in \`vmstat 1\`) will cause SAP work processes to freeze because memory access latency jumps from nanoseconds (RAM) to milliseconds (Disk).

4. **Linux OOM-Killer**:
   - When RAM and swap are completely exhausted, the Linux kernel invokes \`oom-killer\` to terminate high-memory processes.
   - Look in \`/var/log/messages\` or \`dmesg -T\` for \`Out of memory: Kill process <PID> (disp+work)\`.
   - Protect SAP: Set \`/proc/<PID>/oom_score_adj\` to \`-1000\` for ASCS or critical database daemons to prevent OS termination.`,
    detailedStudyNotes: [
      'vmstat 1 interpretation: Run vmstat 1 5 to observe 5 one-second intervals. Watch columns "r" (runnable processes), "b" (blocked in I/O), "si" (swap in from disk/sec), and "so" (swap out to disk/sec). If si/so remain continuously positive, RAM is saturated.',
      'ps aux RSS vs VSZ: RSS (Resident Set Size) is actual physical RAM consumed. VSZ is total address space requested. Always sort by RSS to find true memory hogs: ps aux --sort=-rss | head -n 10.',
      'SAP in PRIV mode: When an ABAP work process exhausts its dialog heap/roll quota, it enters PRIV mode and monopolizes physical memory. Other processes get squeezed into swap.'
    ],
    toolsAndCommands: [
      { name: 'free -h', type: 'command', description: 'Displays total, used, free, shared, buff/cache, and available RAM and swap.' },
      { name: 'vmstat 1 10', type: 'command', description: 'Reports processes, memory, paging, I/O blocks, and CPU activity every 1 second.' },
      { name: 'top -b -n 1 -o %MEM | head -n 25', type: 'command', description: 'Batch top snapshot sorted by physical memory usage.' },
      { name: 'dmesg -T | grep -i oom', type: 'command', description: 'Checks kernel ring buffer for Out-Of-Memory killer invocations with human-readable timestamps.' }
    ],
    productionScenario: {
      ticketId: 'INC-2026-08203',
      severity: 'P1',
      title: 'HANA Host Freezing - System Unresponsive and Dropping SSH Sessions',
      description: 'Host prd-hana01 became unresponsive to SAP GUI and SSH. Monitoring reported 100% CPU utilization and 0 bytes free memory before communication died.',
      systemContext: 'HANA 2.0 on SLES 15 with 1TB RAM.'
    },
    guidedInvestigation: [
      {
        step: 1,
        title: 'Check Kernel Messages for OOM Invocations',
        instruction: 'Run dmesg -T | grep -E "Out of memory|killed process".',
        expectedFinding: '[Wed Oct 28 04:12:10 2026] Out of memory: Kill process 41209 (hdbindexserver) score 852 or sacrifice child.',
        interpretation: 'The OS ran completely out of physical memory and swap, causing the kernel to kill the primary HANA indexserver.'
      },
      {
        step: 2,
        title: 'Inspect vmstat Paging and Swap Prior to Crash',
        instruction: 'Review historical SAR / vmstat data from /var/log/sa/sa28.',
        expectedFinding: 'Swap out (so) surged to 450MB/s 10 minutes prior to the crash while I/O wait (wa%) hit 68%.',
        interpretation: 'HANA attempted to allocate beyond the physical memory boundary, triggering massive swap contention that hung the server.'
      },
      {
        step: 3,
        title: 'Determine Why HANA Allocation Limit Failed',
        instruction: 'Inspect global.ini parameter GLOBAL_ALLOCATION_LIMIT vs OS total RAM.',
        expectedFinding: 'global_allocation_limit was set to 0 (unlimited), allowing HANA and external backup agents to compete for RAM.',
        interpretation: 'Configuring global_allocation_limit to 90% of physical RAM provides an OS safety cushion to prevent OOM-killer invocations.'
      }
    ],
    handsOnTask: {
      title: 'Analyze High-Load vmstat and top Snapshots',
      instructions: [
        'Analyze a sample vmstat output exhibiting high I/O wait vs high user CPU.',
        'Calculate the difference between "free" memory and "available" memory on a Linux server.',
        'Explain how to safeguard a critical process from Linux OOM-killer using oom_score_adj.'
      ],
      deliverable: 'A technical guideline on configuring Linux OS memory and swap thresholds for SAP systems.'
    },
    knowledgeCheck: [
      {
        id: 'w2d3_q1',
        question: 'In vmstat 1 output, what does continuous non-zero values in the "si" and "so" columns indicate?',
        options: [
          'High network packet throughput.',
          'Active swapping into and out of disk storage due to memory exhaustion.',
          'System integrity check is executing.',
          'Database backup is running smoothly.'
        ],
        correctAnswer: 1,
        explanation: 'The si (swap in) and so (swap out) columns represent memory pages moved to and from swap disk per second. Continuous paging degrades performance severely.'
      },
      {
        id: 'w2d3_q2',
        question: 'Which value in free -h provides the most accurate assessment of memory that can be allocated without causing swapping?',
        options: ['free', 'available', 'shared', 'total'],
        correctAnswer: 1,
        explanation: 'The "available" column estimates how much memory is available for starting new applications without swapping, by accounting for reclaimable buff/cache.'
      }
    ],
    tasks: [
      { id: 't1', text: 'Master top, ps, and vmstat output fields and metrics.' },
      { id: 't2', text: 'Understand the difference between free and available RAM.' },
      { id: 't3', text: 'Learn how Linux oom-killer operates and how to prevent it.' },
      { id: 't4', text: 'Complete the Day 3 Linux knowledge check.' }
    ]
  },
  {
    id: 'w2d4',
    week: 2,
    day: 4,
    title: 'Linux Processes, Permissions, Network Sockets, and System Logs',
    topic: 'journalctl, ss, netstat, POSIX Permissions, ACLs, DNS Resolution, Ports, and Connectivity',
    domain: 'linux',
    durationMinutes: 60,
    learningObjectives: [
      'Query and filter systemd logs using journalctl for specific units and boot intervals.',
      'Audit open listening ports, TCP socket states, and connection backlogs using ss -tulnp.',
      'Troubleshoot POSIX file permissions, setuid/setgid bits, and POSIX ACLs (getfacl, setfacl).',
      'Diagnose Linux DNS name resolution latency (/etc/resolv.conf, nsswitch.conf, getent).',
      'Trace network connectivity and firewall blocks between SAP tiers using ss, nc, and curl.'
    ],
    technicalExplanation: `Beyond hardware capacity, Linux process controls and networking dictate whether SAP services can communicate.

1. **System Logging with journalctl**:
   - Modern Linux distributions log system services through \`systemd-journald\`.
   \`\`\`bash
   # Filter logs for sapstartsrv unit since current boot
   journalctl -u sapstartsrv -b --no-pager -n 100

   # Filter system messages within an exact incident timeframe
   journalctl --since "2026-10-28 14:00:00" --until "2026-10-28 14:15:00"
   \`\`\`

2. **Network Socket Inspection with ss**:
   - \`ss\` replaces obsolete \`netstat\` with faster kernel-level socket queries:
   \`\`\`bash
   # Show all listening TCP and UDP sockets with numeric ports and owning PIDs
   ss -tulnp

   # Check if SAP dispatcher port 3200 is bound and see process
   ss -tulpn | grep :3200

   # Check connection state to database host port 1527 / 30015
   ss -tan state established '( dport = :30015 or sport = :30015 )'
   \`\`\`

3. **File Ownership, Permissions, and Setuid**:
   - SAP binaries rely on specific ownership:
     - Kernel binaries in \`/usr/sap/<SID>/SYS/exe/run\` must be owned by \`<sid>adm:sapsys\`.
     - Certain binaries (e.g. \`brbackup\`, \`brspace\`, \`saproot.sh\`, \`saposcol\`, \`icmbnd\`) require **setuid root** (\`-rwsr-xr-x owned by root:sapsys\`) to bind privileged ports (<1024) or access raw storage.

4. **DNS & Name Resolution**:
   - SAP heavily depends on reverse DNS lookups.
   - If \`/etc/nsswitch.conf\` has \`hosts: files dns\` and a configured DNS nameserver in \`/etc/resolv.conf\` is unreachable, every incoming RFC or SAP GUI logon will suffer a 30-second connection timeout while waiting for DNS resolution!
   - Test resolution speed: \`time getent hosts prd-db01\`.`,
    detailedStudyNotes: [
      'ss vs netstat: Always use ss on modern Linux; netstat is deprecated and reads /proc/net which can stall on busy servers with thousands of sockets.',
      'TIME_WAIT socket exhaustion: When thousands of short-lived RFC or HTTP requests open and close connections, sockets remain in TIME_WAIT for 60 seconds (TCP 2MSL). If local ephemeral ports are exhausted, new connections fail.',
      'icmbnd for port 80/443: On Linux, non-root users cannot bind to ports below 1024. SAP ICM uses the helper binary icmbnd with setuid root permissions to bind HTTP port 80 and HTTPS port 443.'
    ],
    toolsAndCommands: [
      { name: 'ss -tulnp', type: 'command', description: 'Lists all listening TCP/UDP sockets with process names and PIDs.' },
      { name: 'journalctl -xe', type: 'command', description: 'Displays recent systemd unit failure logs with full context.' },
      { name: 'getent hosts <HOSTNAME>', type: 'command', description: 'Tests OS name resolution path as configured in nsswitch.conf.' },
      { name: 'ls -l /usr/sap/<SID>/SYS/exe/run/icmbnd', type: 'command', description: 'Verifies setuid root permissions on the ICM port binding binary.' }
    ],
    productionScenario: {
      ticketId: 'INC-2026-08204',
      severity: 'P2',
      title: 'ICM Fails to Bind HTTPS Port 443 After System Copy',
      description: 'Following an SAP system copy from Quality to Development, the ICM process starts but dev_icm logs "*** ERROR => NiIBind: bind (13: Permission denied)" on port 443. WebGUI and Fiori launchpad fail to open.',
      systemContext: 'S/4HANA 2021 on SLES 15.'
    },
    guidedInvestigation: [
      {
        step: 1,
        title: 'Inspect dev_icm Log File',
        instruction: 'Check /usr/sap/DEV/D00/work/dev_icm for port binding errors.',
        expectedFinding: 'IcmBindService: bind service 443 failed (13: Permission denied).',
        interpretation: 'The unprivileged devadm user cannot bind privileged port 443.'
      },
      {
        step: 2,
        title: 'Check Permissions of icmbnd Executable',
        instruction: 'Run ls -l /usr/sap/DEV/SYS/exe/run/icmbnd.',
        expectedFinding: '-rwxr-xr-x 1 devadm sapsys. The setuid root bit (s) is missing!',
        interpretation: 'During the system copy or kernel sync, file permissions were copied without preserving root setuid ownership.'
      },
      {
        step: 3,
        title: 'Execute saproot.sh to Restore Privileges',
        instruction: 'As user root, execute /sapmnt/DEV/exe/saproot.sh DEV.',
        expectedFinding: 'Permissions updated: -rwsr-xr-x 1 root sapsys. ICM successfully binds port 443 on restart.',
        interpretation: 'Running saproot.sh correctly assigned root ownership and setuid bits to icmbnd and related binaries.'
      }
    ],
    handsOnTask: {
      title: 'Network Socket Audit and Name Resolution Benchmark',
      instructions: [
        'Document the output of ss -tulnp and identify all standard SAP ports (32XX, 33XX, 5XX13, 80XX).',
        'Test DNS latency using the "time getent hosts" command for primary application hosts.',
        'List 3 SAP kernel binaries that must possess setuid root permissions and explain why.'
      ],
      deliverable: 'A network socket and permission audit checklist for SAP Linux hosts.'
    },
    knowledgeCheck: [
      {
        id: 'w2d4_q1',
        question: 'Why does ICM require the helper binary icmbnd with setuid root permissions to bind port 443 on Linux?',
        options: [
          'Because HTTPS certificates can only be read by the root user.',
          'On Linux, non-root users (<sid>adm) cannot bind to privileged TCP ports below 1024 without root privileges or capabilities.',
          'Because SAP GUI encrypts all traffic using root keys.',
          'Because port 443 belongs exclusively to Apache.'
        ],
        correctAnswer: 1,
        explanation: 'Linux security restricts binding to network ports below 1024 to root. SAP resolves this cleanly by using the small setuid root utility icmbnd.'
      },
      {
        id: 'w2d4_q2',
        question: 'If getent hosts <dbhost> takes 5 seconds to return, what critical impact will this have on SAP operations?',
        options: [
          'No impact; SAP ignores OS name resolution.',
          'Every new RFC call, SAP GUI logon, and DB connection handshake will experience high latency timeouts.',
          'The Linux kernel will immediately crash.',
          'Filesystem inodes will fill to 100%.'
        ],
        correctAnswer: 1,
        explanation: 'SAP components perform frequent reverse DNS and hostname lookups. Slow name resolution causes severe lag in RFCs, user logons, and database client connections.'
      }
    ],
    tasks: [
      { id: 't1', text: 'Learn ss command syntax and socket state filtering.' },
      { id: 't2', text: 'Understand Linux privileged ports (<1024) and setuid root binaries.' },
      { id: 't3', text: 'Investigate DNS resolution impact on SAP application latency.' },
      { id: 't4', text: 'Complete the Day 4 Linux knowledge check.' }
    ]
  },
  {
    id: 'w2d5',
    week: 2,
    day: 5,
    title: 'Filesystem-Full Incident Lab: /usr/sap at 99%, df vs du Discrepancy',
    topic: 'End-to-End Investigation Lab: Isolating Root Filesystem, Tracing Hidden Allocation, Proposing Safe Remediation',
    domain: 'simulations',
    durationMinutes: 60,
    learningObjectives: [
      'Execute a full live incident protocol when an SAP filesystem reaches critical capacity (99%).',
      'Systematically isolate whether the issue is caused by unlinked open files, hidden mount points, or legitimate file growth.',
      'Accurately identify the exact failing operation before proposing remediation.',
      'Apply safe remediation that avoids destructive blind file deletion or service interruption.',
      'Document the verified root cause and implement preventive automated housekeeping.'
    ],
    technicalExplanation: `When a production filesystem hits 99%, panic can cause admins to run destructive commands (\`rm -rf *\`) that delete active transaction profiles or configuration files.

**The Systematic 4-Step Filesystem Triage Protocol**:
1. **Identify the exact mount point and type**:
   - Check \`df -hT\` and \`df -i\`. Is it block storage or inode exhaustion?
2. **Account for visible files**:
   - Run \`du -xhd 1 <MOUNT_PATH> | sort -hr\`.
   - Does \`du\` sum match \`df\`?
3. **If du << df (Major Discrepancy)**:
   - Check unlinked open file descriptors: \`lsof +L1 <MOUNT_PATH>\`.
   - Check if an underlying mount point is hiding data: test with a bind-mount.
4. **If du == df (Legitimate File Growth)**:
   - Identify the largest subdirectories.
   - Are they core dumps (\`core.*\`), trace files (\`dev_*\`), job logs (\`/usr/sap/<SID>/SYS/global/<CLIENT>JOBLG\`), or update logs?
   - Clean only eligible aged files using safe timestamp filters (\`find ... -mtime +7\`).`,
    detailedStudyNotes: [
      'Never delete active trace files with rm: If you delete dev_disp with rm while disp+work is running, the disk space will NOT be freed (it remains open in memory), and you lose the ability to truncate it via file path!',
      'Check core files: A crashing work process can dump a 16GB core file in /usr/sap/<SID>/<INSTANCE>/work. Multiple crashes can consume 100GB within minutes.',
      'Check SAP audit logs: Security audit logs (parameter rsau/enable) written to disk without automated archiving or deletion will inevitably fill the filesystem.'
    ],
    toolsAndCommands: [
      { name: 'df -hT /usr/sap', type: 'command', description: 'Checks filesystem type and block usage.' },
      { name: 'lsof +L1 /usr/sap', type: 'command', description: 'Scans for deleted files held open by processes on /usr/sap.' },
      { name: 'find /usr/sap -name "core.*" -size +100M', type: 'command', description: 'Searches for large application core dump files.' },
      { name: 'du -xhd 1 /usr/sap | sort -hr', type: 'command', description: 'Ranks top-level directory consumption within the filesystem.' }
    ],
    productionScenario: {
      ticketId: 'INC-2026-08205',
      severity: 'P1',
      title: '/usr/sap at 99% - dev_disp Reports "No space left on device" - du Accounts for Only 30%',
      description: 'Production PAS instance PRD D00 abended. dev_disp logs "DpShmCreate: No space left on device". df -h shows /usr/sap is 99% full (only 200MB free). However, du -xhd 1 /usr/sap calculates only 30GB of files across all folders out of a 100GB partition.',
      systemContext: 'SLES 15 SP4, SAP S/4HANA 2023 on Oracle.'
    },
    guidedInvestigation: [
      {
        step: 1,
        title: 'Execute Inode and Block Analysis',
        instruction: 'Run df -hT /usr/sap and df -i /usr/sap.',
        expectedFinding: 'Size: 100GB, Used: 99.8GB, Avail: 200MB (99%). Inodes: 12% used.',
        interpretation: 'The failure is physical block exhaustion, not an inode table limitation.'
      },
      {
        step: 2,
        title: 'Run lsof +L1 to Detect Deleted Open Files',
        instruction: 'Execute lsof +L1 /usr/sap.',
        expectedFinding: 'No deleted open files found. lsof returns 0 unlinked open descriptors.',
        interpretation: 'The missing 70GB is not held by unlinked open file handles!'
      },
      {
        step: 3,
        title: 'Investigate Hidden Directory Data via Bind Mount',
        instruction: 'Inspect mount points: findmnt /usr/sap. Notice that /usr/sap/PRD/sapdata is a separate NFS/SAN mount. Bind mount root filesystem to /mnt/test and check /mnt/test/usr/sap/PRD/sapdata.',
        expectedFinding: 'Before the external storage was mounted, a junior admin copied 68GB of database backup files into /usr/sap/PRD/sapdata. When the real SAN volume was mounted on top, the files were hidden!',
        interpretation: 'The 68GB exists on the underlying /usr/sap filesystem, completely hidden beneath the mount point!'
      }
    ],
    handsOnTask: {
      title: 'Complete the Filesystem Incident Simulation in the Lab',
      instructions: [
        'Open the Troubleshooting Lab in the sidebar.',
        'Launch Scenario 1: "Filesystem at 99% / Hidden Mount Data".',
        'Execute diagnostic commands (df, du, findmnt, lsof), identify the root cause, and submit your remediation plan.'
      ],
      deliverable: 'A successful simulation completion score and verified RCA.'
    },
    knowledgeCheck: [
      {
        id: 'w2d5_q1',
        question: 'When df shows 99% used but du shows only 30% used, and lsof +L1 returns nothing, what is the most likely cause?',
        options: [
          'The SSD hardware is degrading.',
          'Files were written into a mount directory BEFORE the external filesystem was mounted over it, hiding the data on the underlying disk.',
          'The SAP dispatcher corrupted the MBR table.',
          'The CPU hyperthreading is misaligned.'
        ],
        correctAnswer: 1,
        explanation: 'Mounting a device over an existing directory hides whatever files were previously written to that directory on the parent filesystem, keeping that space consumed but invisible to du.'
      },
      {
        id: 'w2d5_q2',
        question: 'How can an administrator safely inspect files hidden underneath a live mount point without unmounting production filesystems?',
        options: [
          'Reboot the server into single-user rescue mode.',
          'Bind mount the parent partition to a temporary folder (e.g. mount --bind / /mnt/inspect) and inspect the directory there.',
          'Run rm -rf on the mount point.',
          'Format the volume using mkfs.xfs.'
        ],
        correctAnswer: 1,
        explanation: 'Bind-mounting the underlying device allows you to view the raw parent directory tree without unmounting the currently active sub-mounts.'
      }
    ],
    tasks: [
      { id: 't1', text: 'Master the 4-step filesystem incident triage methodology.' },
      { id: 't2', text: 'Understand the hidden mount point phenomenon and bind-mount inspection.' },
      { id: 't3', text: 'Complete the interactive troubleshooting lab for Scenario 1.' },
      { id: 't4', text: 'Complete the Week 2 summary knowledge check.' }
    ]
  }
];

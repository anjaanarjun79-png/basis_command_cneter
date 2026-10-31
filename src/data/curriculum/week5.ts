import { CurriculumSession } from '../../types';

export const week5Sessions: CurriculumSession[] = [
  {
    id: 'w5d1',
    week: 5,
    day: 1,
    title: 'High Availability Foundations: Pacemaker (Corosync) and Serviceguard',
    topic: 'Pacemaker/Corosync vs HPE Serviceguard Architecture, Nodes, Topologies, and Cluster Status Commands',
    domain: 'ha',
    durationMinutes: 60,
    learningObjectives: [
      'Compare modern Linux high-availability stacks: Pacemaker/Corosync (SLES/RHEL) vs HPE Serviceguard.',
      'Deconstruct Corosync messaging layer, totem protocol, and Pacemaker Cluster Information Base (CIB).',
      'Execute and interpret cluster status commands: crm_mon -r1j, pcs status, cmviewcl.',
      'Understand cluster node states (Online, Standby, OFFLINE, UNCLEAN) and resource agent responsibilities.',
      'Audit cluster communication heartbeats, redundant ring networks, and binding interfaces.'
    ],
    technicalExplanation: `In enterprise SAP environments, high availability (HA) protects against single points of failure (ASCS, Enqueue, Database) through automated failover clustering.

1. **Pacemaker / Corosync Stack (Industry Standard on SUSE and Red Hat)**:
   - **Corosync**: The messaging and membership layer. Exchanges heartbeats across cluster nodes over redundant network rings (Knet or Totem protocol) to track node liveness.
   - **Pacemaker**: The cluster resource manager (CRM). Reads cluster state, evaluates policies stored in the **CIB (Cluster Information Base)** XML file, and triggers actions via Resource Agents.
   - **Resource Agents (RA)**: Standard OCF scripts that execute \`start\`, \`stop\`, and \`monitor\` actions for SAP components (e.g. \`SAPInstance\`, \`SAPHanaSR\`, \`IPaddr2\`).

2. **HPE Serviceguard (Linux & HP-UX)**:
   - High-availability clustering software widely deployed in mission-critical enterprise environments.
   - Uses Cluster Manager (\`cmcld\`), Package configurations (\`cmcheckconf\`, \`cmapplyconf\`), and status tool \`cmviewcl\`.
   - Packages encapsulate the virtual IP, storage mounts, and SAP instance start/stop logic.

3. **Interpreting Cluster Status Output**:
   \`\`\`bash
   # Pacemaker status (crm_mon)
   crm_mon -r1
   # Key checks:
   # 1. Cluster Summary: Stack (corosync), Current DC (Designated Controller)
   # 2. Nodes: 2 nodes configured, 2 expected votes -> Online: [ node1 node2 ]
   # 3. Resources: Shows location, status (Started/Stopped/Promoted), and fail counts!

   # Serviceguard status
   cmviewcl -v
   \`\`\``,
    detailedStudyNotes: [
      'Redundant ring networks: A production cluster must always have at least two independent network paths for heartbeats. If a single network switch fails, the second ring prevents split-brain.',
      'Cluster node UNCLEAN: If crm_mon marks a node as UNCLEAN / OFFLINE, Pacemaker has lost heartbeats and is actively initiating fencing (STONITH) to protect storage integrity.',
      'Designated Controller (DC): The single node in Pacemaker responsible for computing the cluster transition graph. If the DC crashes, remaining nodes elect a new DC.'
    ],
    toolsAndCommands: [
      { name: 'crm_mon -r1', type: 'command', description: 'Displays full real-time Pacemaker cluster status, resources, and failure history.' },
      { name: 'pcs status', type: 'command', description: 'Red Hat Pacemaker command line tool to check cluster and resource states.' },
      { name: 'cmviewcl -v', type: 'command', description: 'HPE Serviceguard comprehensive cluster and package status viewer.' },
      { name: 'corosync-cfgtool -s', type: 'command', description: 'Checks health of Corosync communication rings and redundant links.' }
    ],
    productionScenario: {
      ticketId: 'INC-2026-08501',
      severity: 'P1',
      title: 'Pacemaker Cluster Reporting Node Unclean - Communication Ring Failed',
      description: 'Monitoring triggered alert: "Cluster node prd-ascs02 is UNCLEAN". crm_mon shows Corosync lost token across ring 0. Administrators fear imminent fencing of the active Enqueue server.',
      systemContext: 'SLES 15 SP4, 2-node Pacemaker cluster hosting ASCS00 and ERS01.'
    },
    guidedInvestigation: [
      {
        step: 1,
        title: 'Inspect Corosync Ring Health',
        instruction: 'Run corosync-cfgtool -s on prd-ascs01.',
        expectedFinding: 'Ring 0: status "FAULTY". Ring 1: status "ACTIVE with no faults".',
        interpretation: 'Heartbeat ring 0 failed, but the redundant ring 1 maintained quorum, preventing false split-brain.'
      },
      {
        step: 2,
        title: 'Check System Logs for Network Interface Errors',
        instruction: 'Inspect journalctl -u corosync --since "30 minutes ago".',
        expectedFinding: 'Corosync: "Ring 0 interface eth1 link dropped (carrier lost)". Switch port link down on VLAN 101.',
        interpretation: 'A physical switch cable or interface failure occurred on the primary heartbeat network.'
      },
      {
        step: 3,
        title: 'Verify Cluster Quorum and Prevent Panic',
        instruction: 'Run crm_mon -r1 to verify resource allocation.',
        expectedFinding: 'All SAP resources remain STARTED on their designated nodes. No failover or fencing occurred because dual-ring prevented heartbeat loss.',
        interpretation: 'Redundant ring architecture performed as designed; network team needs to restore eth1 link.'
      }
    ],
    handsOnTask: {
      title: 'Analyze Cluster Status Output Across Stacks',
      instructions: [
        'Review and dissect a real-world crm_mon -r1 text output.',
        'Contrast the terminology between Pacemaker (Resources, CIB, STONITH) and Serviceguard (Packages, ASCII config, Quorum Server).',
        'Explain why a dual-ring Corosync configuration is mandatory for enterprise SAP clusters.'
      ],
      deliverable: 'A cluster architecture and terminology comparison matrix.'
    },
    knowledgeCheck: [
      {
        id: 'w5d1_q1',
        question: 'What is the role of Corosync in an SAP Pacemaker high-availability cluster?',
        options: [
          'It compiles ABAP code in background.',
          'It manages the underlying inter-node network messaging, token passing, and node membership tracking.',
          'It backs up the Oracle database.',
          'It provides the graphical user interface for SAP GUI.'
        ],
        correctAnswer: 1,
        explanation: 'Corosync handles low-level heartbeat messaging and cluster membership, while Pacemaker acts as the cluster resource manager evaluating rules and moving resources.'
      },
      {
        id: 'w5d1_q2',
        question: 'In crm_mon, what does it mean when a node is marked with status "UNCLEAN"?',
        options: [
          'The server needs to be cleaned with compressed air.',
          'The cluster has lost communication with the node, its state is unknown, and it is awaiting fencing (STONITH) to protect shared data.',
          'The node has temporary files in /tmp.',
          'The node is running an unlicensed copy of Linux.'
        ],
        correctAnswer: 1,
        explanation: 'An UNCLEAN node is unresponsive and dangerous; it must be fenced (powered off) before other nodes can safely take over its resources.'
      }
    ],
    tasks: [
      { id: 't1', text: 'Understand Pacemaker vs HPE Serviceguard architecture.' },
      { id: 't2', text: 'Learn to read and interpret crm_mon -r1 status output.' },
      { id: 't3', text: 'Study dual-ring Corosync heartbeat redundancy.' },
      { id: 't4', text: 'Complete the Day 1 HA knowledge check.' }
    ]
  },
  {
    id: 'w5d2',
    week: 5,
    day: 2,
    title: 'Quorum, Fencing (STONITH), Split-Brain Prevention, and Resource Failure Counts',
    topic: 'Quorum Calculations, Fencing Mechanisms (IPMI, SBD, Azure Fencing), Split-Brain Catastrophe, Resource Fail Counts',
    domain: 'ha',
    durationMinutes: 60,
    learningObjectives: [
      'Master Quorum mechanics and calculate majority votes in 2-node vs N-node clusters.',
      'Explain the split-brain hazard and understand why simultaneous writing corrupts databases.',
      'Analyze fencing implementations: SBD (Storage-Based Death), IPMI/iLO/iDRAC, and Cloud Native Fencing (Azure Fence Agent).',
      'Interpret resource failure counts (fail-count) and migration thresholds in Pacemaker.',
      'Safely clean up resource failure counts without masking underlying intermittent defects.'
    ],
    technicalExplanation: `High Availability without fencing is a disaster waiting to happen. The primary duty of cluster fencing is to prevent **Split-Brain**.

1. **The Split-Brain Catastrophe**:
   - In a 2-node cluster, if the network heartbeat link breaks, Node 1 thinks Node 2 is dead, and Node 2 thinks Node 1 is dead.
   - If both nodes simultaneously start the database or mount shared storage, both write unsynchronized blocks to the same disk.
   - **Result**: Irreversible filesystem and database corruption!

2. **Quorum & Fencing (STONITH - Shoot The Other Node In The Head)**:
   - **Quorum**: The minimum number of votes required for a cluster partition to declare itself legitimate (majority: \`N/2 + 1\`).
   - In 2-node clusters, a tiebreaker is required: a **Quorum Device (qdevice)** or **SBD (Storage-Based Death)** watchdog disk.
   - **Fencing Mechanisms**:
     - **SBD (Watchdog / Shared LUN)**: If a node stops receiving heartbeats or watchdog resets, the hardware watchdog timer reboots or powers off the node physically.
     - **IPMI / BMC (iLO / iDRAC)**: Out-of-band power cut over server management hardware.
     - **Cloud Fence Agents (Azure Fence Agent / AWS)**: Calls cloud control plane APIs to power off the failing virtual machine.

3. **Resource Fail-Counts & Cleanup**:
   - Pacemaker monitors resources using periodic health checks.
   - If a monitor operation fails, Pacemaker increments the \`fail-count\` for that resource.
   - When \`fail-count >= migration-threshold\`, the cluster moves the resource to the other node.
   - **Cleaning up**:
     \`\`\`bash
     # Inspect failures
     crm_mon -1 # look for "Failed Resource Actions"

     # Clear failure count ONLY AFTER root cause is fixed!
     crm resource cleanup <RESOURCE_NAME>
     \`\`\``,
    detailedStudyNotes: [
      'NEVER disable STONITH in production: Setting stonith-enabled=false in a production cluster violates SAP certification and invites catastrophic data corruption during network glitches.',
      'Do not cleanup fail-counts prematurely: Running crm resource cleanup without finding why the monitor failed causes resources to bounce back and forth (flapping), destabilizing the entire system.',
      'SBD Watchdog timeout: In SBD clusters, the node watchdog timeout (e.g. 30s) must be strictly aligned with Corosync token timeouts to avoid accidental self-fencing.'
    ],
    toolsAndCommands: [
      { name: 'crm resource cleanup <RESOURCE>', type: 'command', description: 'Resets failure counters and re-probes resource state in Pacemaker.' },
      { name: 'stonith_admin -I', type: 'command', description: 'Lists registered fencing devices and targets.' },
      { name: 'sbd -d <DEVICE> dump', type: 'command', description: 'Inspects header, timeouts, and messages on an SBD shared storage disk.' },
      { name: 'crm_failcount -r <RESOURCE> -G', type: 'command', description: 'Queries active failure count value on current node.' }
    ],
    productionScenario: {
      ticketId: 'INC-2026-08502',
      severity: 'P1',
      title: 'HANA Cluster Secondary Fenced Repeatedly Every 2 Hours',
      description: 'The secondary HANA node prd-db02 is being abruptly reset by STONITH / SBD watchdog at predictable 2-hour intervals. The database team is afraid to re-enable clustering.',
      systemContext: 'SLES 15 SP3, Pacemaker with SBD watchdog storage on NetApp iSCSI.'
    },
    guidedInvestigation: [
      {
        step: 1,
        title: 'Check SBD and System Logs on Fenced Node',
        instruction: 'Inspect /var/log/messages right before the hardware reboot.',
        expectedFinding: 'sbd: [PID]: Latency: disk read took 42 seconds! Watchdog timeout (30s) expired! Initiating kernel panic.',
        interpretation: 'The storage SAN experienced I/O latency exceeding 30 seconds, preventing SBD from resetting the Linux watchdog timer in time.'
      },
      {
        step: 2,
        title: 'Correlate with Storage Array Snapshots',
        instruction: 'Check storage array scheduled tasks around the incident times.',
        expectedFinding: 'A heavy storage snapshot and deduplication job was scheduled on the iSCSI controller every 2 hours, freezing LUN I/O for 40 seconds.',
        interpretation: 'The root cause is storage SAN saturation starving the SBD heartbeat LUN, not an SAP or Pacemaker software defect.'
      },
      {
        step: 3,
        title: 'Remediate SBD Timeout and Storage Scheduling',
        instruction: 'Reschedule storage deduplication to off-peak hours and tune SBD watchdog timeouts per SAP Best Practice guidelines.',
        expectedFinding: 'SBD disk read latency remains below 100ms; zero node resets observed over subsequent 72 hours.',
        interpretation: 'Stabilizing storage response times eliminated false-positive cluster fencing.'
      }
    ],
    handsOnTask: {
      title: 'Audit SBD Watchdog and Fail-Count Behavior',
      instructions: [
        'Document why disabling STONITH (stonith-enabled=false) is dangerous in production.',
        'Calculate quorum requirements for a 2-node cluster with and without a qdevice.',
        'Demonstrate the exact commands to query and safely reset a Pacemaker resource fail-count.'
      ],
      deliverable: 'A fencing and quorum architectural safety guide.'
    },
    knowledgeCheck: [
      {
        id: 'w5d2_q1',
        question: 'What catastrophic risk occurs if an HA cluster suffers a split-brain without working fencing (STONITH)?',
        options: [
          'Both nodes may simultaneously attempt to mount shared filesystems and write to the database, causing unrecoverable data corruption.',
          'The SAP GUI background color changes to pink.',
          'All user passwords are automatically reset.',
          'Linux packages are downgraded.'
        ],
        correctAnswer: 0,
        explanation: 'Without fencing, both isolated nodes believe they are the sole survivor and write conflicting transactions to storage simultaneously, destroying data integrity.'
      },
      {
        id: 'w5d2_q2',
        question: 'Why should an engineer avoid immediately running "crm resource cleanup" as soon as a failure is observed?',
        options: [
          'Because cleanup takes 24 hours to finish.',
          'Because clearing the failure count without identifying and fixing the underlying cause can cause the resource to flap continuously, compounding downtime.',
          'Because cleanup uninstalls Pacemaker.',
          'Because only root can run cleanup.'
        ],
        correctAnswer: 1,
        explanation: 'Failure counts exist to prevent broken resources from repeatedly failing on a bad node. You must fix the root problem before clearing the count.'
      }
    ],
    tasks: [
      { id: 't1', text: 'Understand split-brain mechanics and the mathematical necessity of Quorum.' },
      { id: 't2', text: 'Study fencing mechanisms: SBD, IPMI, and cloud fence agents.' },
      { id: 't3', text: 'Learn safe inspection and cleanup of Pacemaker resource fail-counts.' },
      { id: 't4', text: 'Complete the Day 2 HA knowledge check.' }
    ]
  },
  {
    id: 'w5d3',
    week: 5,
    day: 3,
    title: 'SAP ASCS/ERS Architecture, Enqueue Replication, and Failover Mechanics',
    topic: 'Standalone Enqueue Server (ENQ), Enqueue Replication Server (ERS), Shared Memory Replication, and Colocation Constraints',
    domain: 'ha',
    durationMinutes: 60,
    learningObjectives: [
      'Master the internal architecture of SAP ASCS (Message Server + Enqueue Server) and ERS (Enqueue Replication Server).',
      'Understand how the lock table is mirrored in memory between Enqueue Server (ENQ) and ERS across network sockets.',
      'Analyze Enqueue Server 2 (ENQ2) and ERS2 enhancements in modern S/4HANA systems.',
      'Examine cluster colocation rules: ASCS and ERS must NEVER run on the same node under normal conditions.',
      'Trace the lifecycle of a failover: ASCS dies -> Failover to ERS node -> Lock table acquired from replication -> ERS moved away.'
    ],
    technicalExplanation: `The SAP Enqueue Server manages logical locks in shared memory. Because locks are kept in volatile RAM, an Enqueue crash loses all lock information, forcing the entire SAP system to abort unless protected by **Enqueue Replication Server (ERS)**.

1. **ASCS / ERS Replication Mechanism**:
   - **Enqueue Server (ASCS)**: Accepts lock requests from work processes and records them in its master lock table in memory.
   - **Enqueue Replication Server (ERS)**: Runs on the **opposite cluster node**. Maintains an exact replica of the lock table in its own shared memory via continuous network replication.
   - If the ASCS host crashes:
     - Pacemaker detects the failure.
     - Pacemaker starts ASCS on the node where ERS was running.
     - ASCS initializes its lock table directly from the ERS memory segment!
     - Not a single user transaction or logical lock is lost!

2. **The Golden Anti-Colocation Rule**:
   - **ASCS and ERS must NEVER reside on the same physical host during steady-state operations**.
   - If both run on Node 1 and Node 1 loses power, both the primary lock table and its backup replica are wiped out simultaneously!
   - Pacemaker enforces this via anti-colocation constraints:
     \`colocation col_sap_ascs_ers -INFINITY: rsc_sap_ASCS rsc_sap_ERS\`.

3. **ENQ1 vs ENQ2 (Modern S/4HANA)**:
   - In modern kernels (7.53+), SAP introduced **Standalone Enqueue Server 2 (ENQ2)**.
   - Simpler replication protocol, faster recovery, and native support for multi-node clusters without requiring complex cluster score overrides.`,
    detailedStudyNotes: [
      'ERS instance stop during failover: When ASCS fails over to the node holding ERS, ASCS reads the locks from ERS, and ERS terminates cleanly so that ASCS can assume full lock ownership.',
      'Virtual IP requirement: ASCS must always bind to a Virtual IP (Floating IP). Application servers (PAS/AAS) connect to parameter rdisp/mshost pointing to this virtual hostname, ensuring seamless reconnection following failover.',
      'Cluster resource agents: Standard SAP cluster uses ocf:heartbeat:SAPInstance for ASCS and ERS, with AUTOMATIC_RECOVER=false so that Pacemaker retains absolute authority over restarts.'
    ],
    toolsAndCommands: [
      { name: 'enq_admin -state', type: 'command', description: 'Queries Standalone Enqueue Server replication state and lock table count.' },
      { name: 'crm_mon -r1', type: 'command', description: 'Checks ASCS and ERS location and colocation score enforcement.' },
      { name: 'sapcontrol -nr <NR> -function GetProcessList', type: 'command', description: 'Checks enq_server and msg_server process health.' }
    ],
    productionScenario: {
      ticketId: 'INC-2026-08503',
      severity: 'P1',
      title: 'ASCS and ERS Running on Same Cluster Node Following Maintenance',
      description: 'Following a planned OS kernel update, an admin observes that both ASCS00 and ERS01 are running on node prd-ascs01. If prd-ascs01 fails, the entire S/4HANA system will crash.',
      systemContext: 'SLES 15 Pacemaker cluster, S/4HANA 2022.'
    },
    guidedInvestigation: [
      {
        step: 1,
        title: 'Inspect Cluster Resource Locations in crm_mon',
        instruction: 'Run crm_mon -r1 on prd-ascs01.',
        expectedFinding: 'Node prd-ascs02 is in STANDBY state. Both rsc_sap_ASCS00 and rsc_sap_ERS01 are started on prd-ascs01.',
        interpretation: 'The administrator placed prd-ascs02 in standby for patching but forgot to unstandby it upon completion.'
      },
      {
        step: 2,
        title: 'Check Node Health and Re-enable Quorum',
        instruction: 'Verify prd-ascs02 OS and network health, then run crm node online prd-ascs02.',
        expectedFinding: 'Node prd-ascs02 transitions from Standby to Online.',
        interpretation: 'The cluster detects the second node is healthy and ready to host resources.'
      },
      {
        step: 3,
        title: 'Verify Automatic Migration of ERS to Enforce Anti-Colocation',
        instruction: 'Watch crm_mon -r1 as Pacemaker processes the transition graph.',
        expectedFinding: 'Pacemaker automatically moves rsc_sap_ERS01 to prd-ascs02 to satisfy anti-colocation rule (-INFINITY).',
        interpretation: 'ASCS and ERS are now properly separated on independent physical hardware, restoring full HA redundancy.'
      }
    ],
    handsOnTask: {
      title: 'Map ASCS / ERS Failover Mechanics',
      instructions: [
        'Diagram the step-by-step lock recovery sequence during an ASCS host hardware crash.',
        'Explain why anti-colocation (-INFINITY) is vital between ASCS and ERS.',
        'Document the difference between Standalone Enqueue Server 1 (ENQ1) and Enqueue Server 2 (ENQ2).'
      ],
      deliverable: 'An ASCS/ERS high availability architecture guide.'
    },
    knowledgeCheck: [
      {
        id: 'w5d3_q1',
        question: 'Why must SAP ASCS and ERS instances never reside on the same cluster node during steady-state production?',
        options: [
          'Because the SAP license prohibits it.',
          'If both run on the same server and that server crashes, both the primary lock table and its mirrored replica are lost simultaneously, bringing down the entire SAP system.',
          'Because they use the exact same port numbers.',
          'Because Linux cannot run two SAP instances on one server.'
        ],
        correctAnswer: 1,
        explanation: 'ERS exists solely to preserve the lock table if the ASCS node dies. Running both on one node completely negates failover protection.'
      },
      {
        id: 'w5d3_q2',
        question: 'How do application servers (PAS/AAS) continue communicating with ASCS after it fails over to a different cluster node?',
        options: [
          'Admins must manually edit /etc/hosts on all servers.',
          'ASCS uses a Virtual / Floating IP that moves with the instance, so client connections seamlessly redirect to the new active node.',
          'Users must close and reopen SAP GUI.',
          'Application servers do not need ASCS.'
        ],
        correctAnswer: 1,
        explanation: 'A cluster-managed Virtual IP (floating IP) automatically migrates along with the ASCS instance, allowing application servers to reconnect to the same virtual address.'
      }
    ],
    tasks: [
      { id: 't1', text: 'Understand how ERS mirrors the SAP lock table in memory.' },
      { id: 't2', text: 'Study Pacemaker anti-colocation constraints (-INFINITY).' },
      { id: 't3', text: 'Learn the difference between ENQ1 and ENQ2 failover handling.' },
      { id: 't4', text: 'Complete the Day 3 HA knowledge check.' }
    ]
  },
  {
    id: 'w5d4',
    week: 5,
    day: 4,
    title: 'HANA System Replication (HSR) vs Oracle HA (Data Guard / RAC)',
    topic: 'Architectural Comparison: HANA System Replication (sync, syncmem, async) vs Oracle Data Guard / RAC, Split-Brain Prevention',
    domain: 'ha',
    durationMinutes: 60,
    learningObjectives: [
      'Contrast SAP HANA System Replication (HSR) architecture with Oracle Data Guard and Oracle RAC.',
      'Analyze HANA replication modes: sync, syncmem, async, and operation modes: delta_datashipping, logreplay, logreplay_readaccess.',
      'Understand the role of the SAPHanaSR resource agent in automating HANA database failover in Pacemaker.',
      'Differentiate between Active-Passive replication (HSR / Data Guard) and Active-Active multi-node clustering (Oracle RAC).',
      'Diagnose replication desynchronization, network lag, and secondary takeover prerequisites.'
    ],
    technicalExplanation: `Database high availability protects enterprise data. It is vital to clearly distinguish **SAP HANA System Replication (HSR)** from **Oracle Data Guard** and **Oracle Real Application Clusters (RAC)**.

1. **SAP HANA System Replication (HSR)**:
   - Built natively into HANA. Continuous replication from Primary (active) to Secondary (standby).
   - **Replication Modes**:
     - \`sync\`: Log buffers acknowledged only after written to disk on primary AND secondary. Zero data loss (RPO = 0), but primary transactions stall if network latency increases.
     - \`syncmem\`: Secondary acknowledges once log buffers are received in RAM (faster, RPO = 0, risk of loss if secondary power drops before disk write).
     - \`async\`: Primary does not wait for secondary acknowledgment. Zero performance impact, but small data loss risk (RPO > 0).
   - **Operation Modes**:
     - \`logreplay\`: Recommended standard. Redo logs are continuously replayed into memory on secondary. Takeover takes seconds!
     - \`logreplay_readaccess\`: Secondary allows read-only queries (Active/Active read enabled).

2. **Oracle High Availability (Data Guard vs RAC)**:
   - **Oracle Data Guard**: Similar to HSR. Redo transport ships archivelogs to a standby database (Physical Standby). Switchover / Failover promoted via Data Guard Broker (\`dgmgrl\`).
   - **Oracle RAC (Real Application Clusters)**: Shared-disk, Active-Active multi-node cluster. Multiple Oracle instances on different hosts mount and update the **same shared database datafiles** simultaneously using Cache Fusion over a high-speed private interconnect.

3. **Cluster Automation with SAPHanaSR**:
   - In SUSE/RHEL, the \`SAPHanaSR\` package provides the Pacemaker resource agent.
   - It monitors HANA replication status via \`hdbnsutil -sr_state\` and promotes the secondary if the primary host suffers catastrophic failure.`,
    detailedStudyNotes: [
      'Takeover vs Switchover: A "Switchover" is a planned, zero-data-loss role reversal. A "Takeover" or "Failover" is an emergency promotion following an unplanned crash.',
      'Replication status: Always verify hdbnsutil -sr_state before initiating maintenance. Look for "mode: sync", "overall replication status: ACTIVE", and sync state "SOK".',
      'Do not perform manual takeovers while primary is running: Executing hdbnsutil -sr_takeover on secondary without stopping or fencing primary will cause split-brain data corruption!'
    ],
    toolsAndCommands: [
      { name: 'hdbnsutil -sr_state', type: 'command', description: 'HANA system command to verify replication mode, status, and synchronization state.' },
      { name: 'SAPHanaSR-showAttr', type: 'command', description: 'Pacemaker tool showing HANA cluster attributes (sync_state, roles, scores).' },
      { name: 'dgmgrl / "show configuration"', type: 'command', description: 'Oracle Data Guard Broker command to inspect primary and standby database health.' }
    ],
    productionScenario: {
      ticketId: 'INC-2026-08504',
      severity: 'P1',
      title: 'HANA Primary Stalled in COMMIT - Replication Mode Set to Sync Across High Latency WAN',
      description: 'Transactions in S/4HANA suddenly slowed to a crawl. Work processes are blocked in DB-Wait. HANA logs show log write times jumped from 1ms to 450ms following network maintenance.',
      systemContext: 'HANA 2.0 SPS 07, 2-node HSR with DR site.'
    },
    guidedInvestigation: [
      {
        step: 1,
        title: 'Check HANA Replication State via hdbnsutil',
        instruction: 'Execute hdbnsutil -sr_state on primary node prd-hdb01.',
        expectedFinding: 'Replication mode: sync. Full sync: ENABLED. Target secondary: prd-hdbdr01.',
        interpretation: 'Replication is configured in strict synchronous mode with full sync enabled.'
      },
      {
        step: 2,
        title: 'Measure Network Latency to Secondary Site',
        instruction: 'Run ping -c 10 prd-hdbdr01 and check round-trip time.',
        expectedFinding: 'Round trip time jumped from 0.8ms to 280ms due to a fiber cut rerouting traffic over backup satellite WAN.',
        interpretation: 'Because replication mode is "sync", every transaction commit must wait for a 280ms round-trip to the secondary site before committing!'
      },
      {
        step: 3,
        title: 'Safely Adjust Replication Mode to syncmem or async',
        instruction: 'Temporarily switch replication mode to async using hdbnsutil -sr_changemode --mode=async.',
        expectedFinding: 'Primary commit latency drops immediately from 450ms back to 1.2ms; SAP work processes unfreeze.',
        interpretation: 'Switching to asynchronous mode decoupled local transaction commits from WAN latency until primary fiber is repaired.'
      }
    ],
    handsOnTask: {
      title: 'Compare HANA System Replication and Oracle Data Guard',
      instructions: [
        'Construct a comparison table evaluating HSR, Oracle Data Guard, and Oracle RAC.',
        'Explain the operational difference between HSR operation modes delta_datashipping and logreplay.',
        'Document why synchronous replication across high-latency networks severely degrades SAP application response times.'
      ],
      deliverable: 'A comparative database high-availability architecture reference.'
    },
    knowledgeCheck: [
      {
        id: 'w5d4_q1',
        question: 'In SAP HANA System Replication with mode "sync", what happens if network latency between primary and secondary spikes to 500 ms?',
        options: [
          'HANA ignores the latency and commits in 1 ms.',
          'Every database commit in the SAP system will take at least 500 ms, severely degrading application response times.',
          'HANA will automatically delete the secondary database.',
          'The Linux kernel on the primary server will reboot.'
        ],
        correctAnswer: 1,
        explanation: 'Synchronous replication requires that the secondary node acknowledge log receipt before the primary can commit to the application, making commit latency directly dependent on network round-trip time.'
      },
      {
        id: 'w5d4_q2',
        question: 'What is the key architectural difference between Oracle RAC and SAP HANA System Replication (HSR)?',
        options: [
          'Oracle RAC is an Active-Active shared-disk cluster where multiple instances query the same datafiles; HSR is an Active-Passive replicated database architecture.',
          'Oracle RAC does not support backups.',
          'HSR requires Oracle Linux.',
          'HSR cannot run on SUSE Linux.'
        ],
        correctAnswer: 0,
        explanation: 'Oracle RAC allows multiple live instances to simultaneously access one shared storage database via Cache Fusion. HSR replicates data between two independent nodes with separate storage.'
      }
    ],
    tasks: [
      { id: 't1', text: 'Compare HANA System Replication modes (sync, syncmem, async).' },
      { id: 't2', text: 'Contrast HSR logreplay with Oracle Data Guard and Oracle RAC.' },
      { id: 't3', text: 'Understand the role of the SAPHanaSR resource agent in Pacemaker.' },
      { id: 't4', text: 'Complete the Day 4 HA knowledge check.' }
    ]
  },
  {
    id: 'w5d5',
    week: 5,
    day: 5,
    title: 'Recurring Failover Investigation, Failed Monitor Operations, and Safe Recovery',
    topic: 'End-to-End Cluster Incident Triage: Analyzing Monitor Failures, Preventing Resource Bouncing, and Validating Stability',
    domain: 'simulations',
    durationMinutes: 60,
    learningObjectives: [
      'Triage an emergency incident involving recurring cluster failovers (resource flapping).',
      'Isolate failed cluster monitor operations in Pacemaker logs and distinguish timeout from exit errors.',
      'Execute safe manual cluster interventions without triggering unapproved fencing.',
      'Validate cluster stability and verify clean resource failover before handing over to operations.',
      'Document professional root-cause evidence proving why the cluster initiated failover.'
    ],
    technicalExplanation: `A recurring failover (resource bouncing or flapping) is one of the most stressful production incidents. The cluster keeps moving resources from Node 1 to Node 2 and back, causing repeated outages.

**The Golden Rules of Cluster Incident Triage**:
1. **Never make sudden, unmeasured changes**: Do not disable fencing, kill Corosync, or reboot nodes blindly.
2. **Put the cluster into Maintenance Mode if flapping uncontrollably**:
   \`\`\`bash
   # Temporarily freeze cluster decisions while keeping resources running
   crm configure property maintenance-mode=true
   # Or for a specific resource:
   crm resource maintenance <RESOURCE_NAME> true
   \`\`\`
   In maintenance mode, Pacemaker will **not** move or stop resources even if a health monitor fails, giving you time to investigate calmly without further service disruption!
3. **Inspect Failed Resource Actions**:
   - Run \`crm_mon -1\`.
   - Look under **Failed Resource Actions**:
     - Check the resource name, node, operation (e.g. \`monitor_60000\`), exit reason, and exit code.
     - Did it fail with \`TIMED_OUT\` (the monitor script took longer than the configured timeout due to heavy I/O)?
     - Or did it fail with \`NOT_RUNNING\` (the underlying SAP process died)?
4. **Fix Root Problem Before Exiting Maintenance Mode**:
   - Once the underlying issue (e.g. hung NFS, high CPU, log full) is resolved, execute \`crm resource cleanup <RESOURCE_NAME>\`.
   - Take the cluster out of maintenance mode:
     \`crm configure property maintenance-mode=false\`.`,
    detailedStudyNotes: [
      'Monitor timeouts during backups: If a resource agent monitor operation has a 60-second timeout, and a heavy storage backup or snapshot freezes disk I/O for 65 seconds, the monitor times out! Pacemaker interprets this as a dead instance and triggers failover.',
      'Check OCF return codes: Return code 7 means OCF_NOT_RUNNING. Return code 1 means OCF_ERR_GENERIC.',
      'Cluster log analysis: Always inspect /var/log/messages or /var/log/ha-log around the exact second of failover to see the transition engine calculation.'
    ],
    toolsAndCommands: [
      { name: 'crm configure property maintenance-mode=true', type: 'command', description: 'Freezes all cluster actions; prevents failovers during emergency troubleshooting.' },
      { name: 'crm_mon -r1', type: 'command', description: 'Checks cluster resources and lists failed actions.' },
      { name: 'crm resource cleanup', type: 'command', description: 'Resets fail-counts and instructs cluster to re-probe states.' }
    ],
    productionScenario: {
      ticketId: 'INC-2026-08505',
      severity: 'P1',
      title: 'Production ASCS Flapping Between Nodes 1 and 2 Every 15 Minutes',
      description: 'The SAP ASCS instance has failed over 3 times in the last 45 minutes. Users are repeatedly kicked out of SAP GUI. The operations bridge is debating disabling the cluster completely.',
      systemContext: 'SLES 15 Pacemaker cluster hosting ASCS00.'
    },
    guidedInvestigation: [
      {
        step: 1,
        title: 'Stabilize by Entering Resource Maintenance Mode',
        instruction: 'Run crm resource maintenance rsc_sap_ASCS00 true.',
        expectedFinding: 'rsc_sap_ASCS00 is marked unmanaged/maintenance. Bouncing ceases immediately; ASCS remains running on current node.',
        interpretation: 'Freezing cluster management prevents further failovers while root-cause investigation proceeds.'
      },
      {
        step: 2,
        title: 'Analyze Failed Action in crm_mon',
        instruction: 'Check crm_mon -1 under Failed Resource Actions.',
        expectedFinding: 'rsc_sap_ASCS00_monitor_30000 on node1: "timed out after 60s" (call=42, status=Timed Out).',
        interpretation: 'The monitor script did not report ASCS down; the monitor operation itself timed out waiting for OS response.'
      },
      {
        step: 3,
        title: 'Investigate Cause of Monitor Timeout in /var/log/messages',
        instruction: 'Examine OS metrics and syslog during the timeout window.',
        expectedFinding: 'Every 15 minutes, an antivirus security agent ran a deep scan on /sapmnt, hanging NFS I/O for 75 seconds and causing sapcontrol to stall.',
        interpretation: 'Antivirus scanning on NFS mount froze sapcontrol queries, causing the 60s cluster monitor to time out and trigger unnecessary failovers.'
      }
    ],
    handsOnTask: {
      title: 'Execute Scenario 7 in Interactive Troubleshooting Lab',
      instructions: [
        'Open the Troubleshooting Lab in the sidebar.',
        'Launch Scenario 7: "Repeated Cluster Resource Failure / Monitor Flapping".',
        'Execute diagnostic commands, isolate the monitor timeout root cause, and formulate a safe remediation plan.'
      ],
      deliverable: 'A successful simulation completion score and documented RCA.'
    },
    knowledgeCheck: [
      {
        id: 'w5d5_q1',
        question: 'What is the immediate, safe command to stop a Pacemaker cluster from repeatedly failing over a flapping resource without stopping the application?',
        options: [
          'Run killall corosync.',
          'Set maintenance mode (e.g. crm resource maintenance <RESOURCE> true or crm configure property maintenance-mode=true).',
          'Unplug the server power cord.',
          'Delete the cluster configuration file /etc/corosync/corosync.conf.'
        ],
        correctAnswer: 1,
        explanation: 'Enabling maintenance mode tells Pacemaker to freeze resource management in place, preventing automated restarts and migrations while admins investigate.'
      },
      {
        id: 'w5d5_q2',
        question: 'In Pacemaker, if a monitor operation fails with "Timed Out" rather than "Not Running", what does this usually signify?',
        options: [
          'The application binary was deleted.',
          'The instance probe (e.g. sapcontrol or filesystem stat) hung or took longer than the configured timeout due to heavy I/O, storage freeze, or CPU starvation.',
          'The user typed an invalid password.',
          'The cluster license has expired.'
        ],
        correctAnswer: 1,
        explanation: 'A monitor timeout indicates that the diagnostic script could not complete within the allotted timeout window, often caused by I/O stalls, slow network mounts, or saturated CPUs.'
      }
    ],
    tasks: [
      { id: 't1', text: 'Master the cluster maintenance mode freeze command.' },
      { id: 't2', text: 'Learn to distinguish monitor TIMEOUT from NOT_RUNNING in crm_mon.' },
      { id: 't3', text: 'Complete the interactive troubleshooting lab for Scenario 7.' },
      { id: 't4', text: 'Complete the Week 5 summary knowledge check.' }
    ]
  }
];

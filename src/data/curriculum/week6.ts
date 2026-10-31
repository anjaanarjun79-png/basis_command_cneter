import { CurriculumSession } from '../../types';

export const week6Sessions: CurriculumSession[] = [
  {
    id: 'w6d1',
    week: 6,
    day: 1,
    title: 'Software Update Manager (SUM) Architecture, Phases, and Error Isolation',
    topic: 'SUM Directory Structure, Major Phases (PREP, SHD, PARCON, EXEC), and Isolating the First Meaningful Error',
    domain: 'upgrades',
    durationMinutes: 60,
    learningObjectives: [
      'Master the architecture and phase execution model of the SAP Software Update Manager (SUM).',
      'Distinguish major SUM phases: Extraction, Configuration, Checks, Preprocessing (Shadow Instance), Execution (Downtime), Postprocessing.',
      'Navigate the SUM directory structure (/usr/sap/<SID>/SUM/abap/log) and locate primary error logs.',
      'Differentiate cascading secondary errors from the "first meaningful error".',
      'Apply safe recovery, retry, and phase repeat actions within the SUM UI.'
    ],
    technicalExplanation: `The Software Update Manager (SUM) is the multi-purpose tool for SAP maintenance, release upgrades, SPS applications, and database migrations (DMO).

1. **The Core Lifecycle Phases of SUM**:
   - **PREPARATION (PREP)**: Validates target stack XML, evaluates component dependencies, verifies space requirements, checks SPAM/SAINT versions.
   - **SHADOW INSTANCE CREATION (SHD)**: Builds a temporary shadow system and shadow database schema in parallel while production remains online.
   - **PREPROCESSING**: Executes table conversions and dictionary activations inside the shadow system. Zero production downtime!
   - **EXECUTION (DOWNTIME)**: Production system stopped. Delta transactions merged into the target tables. Database migration (if DMO). Kernel switch. Target system restarted.
   - **POSTPROCESSING**: Cleans up shadow tables, recompiles SGEN, imports post-steps.

2. **The Principle of the "First Meaningful Error"**:
   - When SUM halts with a red error in the browser UI, the screen often displays a generic message like \`Severe error(s) occurred in phase MAIN_SHDRUN/ACT_UPG!\`.
   - Clicking through reveals dozens of cascading error lines.
   - **Crucial Rule**: Always navigate to \`/usr/sap/<SID>/SUM/abap/log\` and inspect the phase log (e.g. \`ACTUPG.ELG\` or \`SAPup.log\`).
   - Find the **very first error** in the log. Subsequent hundreds of errors are almost always cascading side effects of the first missing table, syntax violation, or locked object!`,
    detailedStudyNotes: [
      'The SAPup.log file: This is the master log of SUM. It logs every phase transition, exit code, and exact sub-log file name where errors occurred.',
      'Never kill SUM processes with kill -9: Killing the SAPup process directly while it is updating database dictionary tables can corrupt the control files (SAPup.xml). Use the SUM Web UI to choose Stop or Repeat.',
      'Resetting SUM: SUM can be reset cleanly back to initial state only during specific non-downtime phases via "SUM -> Upgrade -> Reset". Once downtime execution has begun, reset options become restricted.'
    ],
    toolsAndCommands: [
      { name: 'SAPup.log', type: 'log', description: 'Master log file of the Software Update Manager located in /usr/sap/<SID>/SUM/abap/log.' },
      { name: 'tail -n 100 /usr/sap/<SID>/SUM/abap/log/SAPup.log', type: 'command', description: 'Monitors real-time SUM phase progress and return codes.' },
      { name: 'grep -E "ERR|error|fatal" <PHASE>.ELG', type: 'command', description: 'Extracts critical errors from SUM consolidated phase error logs.' }
    ],
    productionScenario: {
      ticketId: 'INC-2026-08601',
      severity: 'P1',
      title: 'SUM Halts in Phase MAIN_SHDRUN/ACT_UPG with 450 Errors',
      description: 'During a planned weekend S/4HANA SPS upgrade, SUM halted in phase ACT_UPG. The UI displays 450 error lines. The project manager is panicking, asking if the upgrade must be aborted.',
      systemContext: 'S/4HANA 2022 to 2023 upgrade. Host prd-app01.'
    },
    guidedInvestigation: [
      {
        step: 1,
        title: 'Open Master Phase Log in SUM Log Directory',
        instruction: 'Inspect /usr/sap/PRD/SUM/abap/log/ACTUPG.ELG.',
        expectedFinding: 'Log contains 450 errors across various custom Z-tables and standard views.',
        interpretation: 'A single underlying structural failure cascaded across dependent dictionary objects.'
      },
      {
        step: 2,
        title: 'Isolate the First Meaningful Error at the Top of the Log',
        instruction: 'Search from line 1 of ACTUPG.ELG for the very first ERROR statement.',
        expectedFinding: 'Line 28: "Table ZINVOICE_HEADER: Data element ZFKDAT does not exist in active version".',
        interpretation: 'A developer transport created a custom table referencing a domain that was never released or activated in the target stack.'
      },
      {
        step: 3,
        title: 'Remediate in Shadow Instance and Repeat Phase',
        instruction: 'Log into the Shadow Instance (client 000, shadow instance number), activate the missing data element via SE11, and choose "Repeat Phase" in SUM.',
        expectedFinding: 'Phase ACT_UPG completes with return code 0; all 450 cascading errors vanish!',
        interpretation: 'Fixing the single root error eliminated all 449 dependent cascade failures.'
      }
    ],
    handsOnTask: {
      title: 'Analyze SUM Logs and Trace Phase Execution',
      instructions: [
        'Document the purpose and risk profile of SUM phases PREP, SHD, EXEC, and POST.',
        'Explain why investigating cascading errors in a .ELG log from bottom-to-top is ineffective.',
        'Detail how to safely stop and restart SUM via the browser interface.'
      ],
      deliverable: 'A SUM log analysis standard operating procedure.'
    },
    knowledgeCheck: [
      {
        id: 'w6d1_q1',
        question: 'When SUM halts with hundreds of errors in an activation or conversion phase (e.g. ACT_UPG), which error should the Basis engineer investigate first?',
        options: [
          'The last error at the very end of the file.',
          'The very first meaningful error reported at the top of the log, because subsequent errors are usually cascading effects of the first missing or invalid object.',
          'A random error in the middle.',
          'Errors should be ignored until SUM finishes.'
        ],
        correctAnswer: 1,
        explanation: 'In ABAP dictionary activation, if a fundamental domain or structure fails, all tables and views referencing it will fail as well. Always fix the primary initial error.'
      },
      {
        id: 'w6d2_q2',
        question: 'What is the primary benefit of the SUM "Shadow Instance"?',
        options: [
          'It replaces the Oracle database with MySQL.',
          'It allows heavy maintenance tasks (table conversions, dictionary activations) to run in a separate temporary schema while the production system remains fully operational, minimizing downtime.',
          'It backs up the server to tape.',
          'It automatically fixes custom ABAP code.'
        ],
        correctAnswer: 1,
        explanation: 'The shadow instance executes time-consuming upgrades in parallel with live production, drastically shrinking the actual downtime window required for the final switch.'
      }
    ],
    tasks: [
      { id: 't1', text: 'Master the SUM phase execution sequence (PREP, SHD, EXEC, POST).' },
      { id: 't2', text: 'Learn to navigate /usr/sap/<SID>/SUM/abap/log.' },
      { id: 't3', text: 'Understand how to isolate the first meaningful error in .ELG logs.' },
      { id: 't4', text: 'Complete the Day 1 Upgrade knowledge check.' }
    ]
  },
  {
    id: 'w6d2',
    week: 6,
    day: 2,
    title: 'Kernel Upgrades, SAP Host Agent, File Permissions, and Compatibility',
    topic: 'SAP Kernel Components (disp+work, sapstartsrv, R3trans), Compatibility Matrix, saproot.sh, and Validation',
    domain: 'upgrades',
    durationMinutes: 60,
    learningObjectives: [
      'Master the components of an SAP Kernel: SAPEXE (DB-independent) and SAPEXEDB (DB-dependent).',
      'Verify kernel release, patch level, and bit architecture compatibility (disp+work -v).',
      'Execute clean kernel patch applications with zero residual file lock issues.',
      'Understand the role of saproot.sh and why setuid root permissions are mandatory for specific kernel binaries.',
      'Upgrade SAP Host Agent independently using saphostexec -upgrade and verify daemon health.'
    ],
    technicalExplanation: `The SAP Kernel is the executable runtime engine that translates ABAP bytecode into operating system instructions and database queries.

1. **Kernel Architecture & Archives**:
   - **SAPEXE.SAR**: Database-independent executables (\`disp+work\`, \`msg_server\`, \`enq_server\`, \`gwrd\`, \`icmbnd\`, \`cleanipc\`).
   - **SAPEXEDB.SAR**: Database-specific libraries and executables (\`R3trans\`, \`dboraslib.so\`, \`libhdbbaslib.so\`).
   - Both archives **must be at the exact same patch level** when updating.

2. **Standard Safe Kernel Replacement Procedure**:
   - Step 1: Download matching SAR archives for OS and DB architecture (e.g. Linux x86_64, SAP S/4HANA 2023).
   - Step 2: Extract to a temporary staging folder (\`/sapmnt/<SID>/exe_new\`) using \`SAPCAR -xvf <ARCHIVE>.SAR -R /sapmnt/<SID>/exe_new\`.
   - Step 3: Stop all SAP application instances and sapstartsrv daemons cleanly.
   - Step 4: Backup the existing active kernel: \`cp -r /sapmnt/<SID>/exe/uc/linuxx86_64 /sapmnt/<SID>/exe_old\`.
   - Step 5: Copy new binaries into the active kernel directory: \`cp -p /sapmnt/<SID>/exe_new/* /sapmnt/<SID>/exe/uc/linuxx86_64/\`.
   - Step 6: **Execute saproot.sh as root**:
     \`\`\`bash
     cd /sapmnt/<SID>/exe/uc/linuxx86_64
     ./saproot.sh <SID>
     \`\`\`
   - Step 7: Verify permissions: \`ls -l icmbnd brbackup\`. Ensure \`-rwsr-xr-x 1 root sapsys\`.
   - Step 8: Verify kernel version: \`disp+work -v\` and \`R3trans -v\`.
   - Step 9: Start instances and verify health.

3. **SAP Host Agent Upgrade**:
   - Upgraded independently of the SAP kernel.
   - Run as root: \`/usr/sap/hostctrl/exe/saphostexec -upgrade -archive SAPHOSTAGENT<NR>.SAR\`.`,
    detailedStudyNotes: [
      'Downwards Compatible Kernel (DCK): Modern SAP kernels are downward compatible, meaning a 7.89 kernel can run a 7.50 NetWeaver system, but database client libraries must match target DB versions.',
      'Forgetting saproot.sh: The most frequent error after a kernel patch! If saproot.sh is omitted, icmbnd cannot bind port 80/443, brbackup cannot access raw disks, and saposcol cannot read OS CPU counters.',
      'Checking version: Always run disp+work -v as <sid>adm before starting the system to verify the patch level changed as expected.'
    ],
    toolsAndCommands: [
      { name: 'disp+work -v', type: 'command', description: 'Displays kernel release, patch level, compilation date, and supported OS.' },
      { name: 'R3trans -v', type: 'command', description: 'Displays database client interface library version and patch level.' },
      { name: 'saproot.sh <SID>', type: 'command', description: 'Sets required root ownership and setuid permissions on kernel binaries.' },
      { name: 'saphostexec -status', type: 'command', description: 'Checks status of SAP Host Agent daemon.' }
    ],
    productionScenario: {
      ticketId: 'INC-2026-08602',
      severity: 'P1',
      title: 'SAP Fails to Start After Kernel Patch: "Cannot load dboraslib.so"',
      description: 'Following a kernel patch from PL 100 to PL 300, disp+work aborts immediately. dev_disp logs "Cannot load library dboraslib.so: version mismatch or missing symbol".',
      systemContext: 'ERP 6.0 on Oracle 19c on RHEL 8.'
    },
    guidedInvestigation: [
      {
        step: 1,
        title: 'Check Kernel Executable Versions',
        instruction: 'Run disp+work -v and R3trans -v in the active kernel directory.',
        expectedFinding: 'disp+work is at Patch Level 300. R3trans and dboraslib.so are at Patch Level 100.',
        interpretation: 'The administrator extracted only SAPEXE.SAR (DB-independent) and forgot to extract SAPEXEDB.SAR (DB-dependent)!'
      },
      {
        step: 2,
        title: 'Verify Incompatible Symbol Bindings',
        instruction: 'Inspect dev_disp around the crash point.',
        expectedFinding: 'Kernel core expected interface ABI version 300, but dboraslib.so provided ABI version 100.',
        interpretation: 'Mixed kernel patch levels cause immediate shared object dynamic linking failures.'
      },
      {
        step: 3,
        title: 'Extract Matching SAPEXEDB.SAR and Re-execute saproot.sh',
        instruction: 'Extract matching SAPEXEDB PL 300, copy into the kernel directory, run saproot.sh, and restart.',
        expectedFinding: 'All binaries align at PL 300; disp+work starts cleanly and connects to Oracle.',
        interpretation: 'Ensuring matching patch levels across SAPEXE and SAPEXEDB resolved the dynamic link failure.'
      }
    ],
    handsOnTask: {
      title: 'Draft a Complete Kernel Patch Standard Operating Procedure',
      instructions: [
        'Document the 9-step safe kernel upgrade procedure including rollback steps.',
        'Explain what happens if saproot.sh is not executed after replacing kernel binaries.',
        'Write the command to verify the active patch level of disp+work.'
      ],
      deliverable: 'A standard operating procedure for SAP kernel patching.'
    },
    knowledgeCheck: [
      {
        id: 'w6d2_q1',
        question: 'Why must both SAPEXE.SAR and SAPEXEDB.SAR be updated to the exact same patch level simultaneously?',
        options: [
          'Because the SAP license requires it.',
          'SAPEXE contains the core engine while SAPEXEDB contains the DB interface library; mismatched patch levels result in binary ABI incompatibilities and dynamic linking crashes.',
          'Because SAPCAR will delete the files if patch levels differ.',
          'To prevent the Linux OS from upgrading.'
        ],
        correctAnswer: 1,
        explanation: 'The database interface shared libraries (dboraslib, dbhdbbaslib) are tightly coupled to the dispatcher and work process binaries. Mixing patch levels causes crashes.'
      },
      {
        id: 'w6d2_q2',
        question: 'What is the specific purpose of running saproot.sh as user root after updating an SAP kernel?',
        options: [
          'It clears user passwords.',
          'It assigns root ownership and sets the setuid bit on specific binaries (such as icmbnd and brbackup) that require elevated privileges to bind ports (<1024) or access raw storage.',
          'It reboots the Linux server.',
          'It registers the system with SAP Support.'
        ],
        correctAnswer: 1,
        explanation: 'Kernel binaries like icmbnd need to bind privileged network ports (e.g. 80 and 443). saproot.sh sets the setuid root bit to grant this specific permission.'
      }
    ],
    tasks: [
      { id: 't1', text: 'Understand SAPEXE vs SAPEXEDB component separation.' },
      { id: 't2', text: 'Learn the safe 9-step kernel replacement procedure.' },
      { id: 't3', text: 'Study why saproot.sh is required for root setuid binaries.' },
      { id: 't4', text: 'Complete the Day 2 Upgrade knowledge check.' }
    ]
  },
  {
    id: 'w6d3',
    week: 6,
    day: 3,
    title: 'SPAM/SAINT Queues, Component Dependencies, and Transport Logs',
    topic: 'Support Package Manager (SPAM), Add-On Installation Tool (SAINT), Queue Definition, and Return Codes',
    domain: 'upgrades',
    durationMinutes: 60,
    learningObjectives: [
      'Differentiate between SPAM (Support Package application) and SAINT (Add-On installation).',
      'Manage support package stacks, component prerequisites, and SPAM queue definitions.',
      'Interpret transport and import return codes: RC 0 (Success), RC 4 (Warning), RC 8 (Error), RC 12 (Fatal).',
      'Troubleshoot hung transport phases (e.g. IMPORT_PROPER, XPRA, ACT_700) using tp and R3trans logs.',
      'Safely handle transport locks and resolve tp deadlock conditions.'
    ],
    technicalExplanation: `The Support Package Manager (SPAM) and Add-On Installation Tool (SAINT) are the internal transaction tools for maintaining ABAP software components.

1. **SPAM vs SAINT**:
   - **SPAM**: Applies Support Packages to existing installed components (e.g. SAP_BASIS, SAP_APPL, S4CORE) to fix bugs and legal changes.
   - **SAINT**: Installs or upgrades new software add-ons (e.g. SAP Fiori Front-End Server, ST-PI, ST-A/PI, third-party payment plugins).

2. **Transport Return Codes (The Golden Standard)**:
   - **RC 0 (Success)**: Object imported and activated without issues.
   - **RC 4 (Warning)**: Minor warning (e.g. generation warning, non-critical table change). Fully acceptable in production.
   - **RC 8 (Error)**: Syntax error, missing dictionary structure, activation failure. Objects were NOT activated cleanly! Requires investigation.
   - **RC 12 (Fatal Error)**: Database failure, R3trans crash, missing tablespace space, or system halted. The import aborted.
   - **RC 16 (Catastrophic)**: Internal transport program (\`tp\`) failure or operating system kill.

3. **SPAM Import Phases & Logs**:
   - \`TEST_IMPORT\`: Dry run checking for object overwrites.
   - \`OBJECTS_LOCKED\`: Confirms no repository objects in the queue are currently being edited in unreleased development transports.
   - \`IMPORT_PROPER\`: \`R3trans\` writes the new repository and dictionary data into database tables.
   - \`ACT_700\`: Activation of ABAP dictionary objects.
   - \`XPRA (eXecution of PRograms After import)\`: ABAP conversion reports executed to migrate data structures.`,
    detailedStudyNotes: [
      'Never delete a SPAM queue blindly: If SPAM encounters an error in phase IMPORT_PROPER and you delete the queue via hidden menus, the dictionary will be left in a half-upgraded, inconsistent state!',
      'Check tp log: When an import hangs, look at /usr/sap/trans/log/SLOG<YY><WW> (System Log) and ALOG<YY><WW> (Action Log) to see what tp and R3trans are doing.',
      'Transport buffer locks: If a previous transport crashed, a lock file (/usr/sap/trans/tmp/SAP<SID>.LOK) may remain, preventing any new transports or SPAM steps from proceeding.'
    ],
    toolsAndCommands: [
      { name: 'SPAM', type: 'transaction', description: 'Support Package Manager: define queue, apply support packages, check import status.' },
      { name: 'SAINT', type: 'transaction', description: 'Add-On Installation Tool: install new software components and third-party add-ons.' },
      { name: 'tp checkimpdp <SID>', type: 'command', description: 'Checks if the background transport daemon (RDDIMPDP) is properly scheduled.' },
      { name: 'STMS', type: 'transaction', description: 'Transport Management System: manage import queues, transport routes, and import logs.' }
    ],
    productionScenario: {
      ticketId: 'INC-2026-08603',
      severity: 'P2',
      title: 'SPAM Queue Hanging in Phase IMPORT_PROPER - 3 Hours No Progress',
      description: 'Applying ST-PI and ST-A/PI support packages in QAS. SPAM has been stuck on phase IMPORT_PROPER for 3 hours. The UI shows a spinning icon with no CPU consumption on the server.',
      systemContext: 'S/4HANA 2022 on HANA 2.0.'
    },
    guidedInvestigation: [
      {
        step: 1,
        title: 'Check Transport Daemon RDDIMPDP in SM37',
        instruction: 'Check SM37 for job RDDIMPDP in client 000.',
        expectedFinding: 'Job RDDIMPDP is not scheduled or active; last run was 2 weeks ago.',
        interpretation: 'The transport daemon that triggers background steps for tp is missing from client 000!'
      },
      {
        step: 2,
        title: 'Check System Transport Log SLOG',
        instruction: 'Inspect the latest entries in /usr/sap/trans/log/SLOG2644.',
        expectedFinding: 'START IMPORT_PROPER ... waiting for RDDIMPDP to report completion.',
        interpretation: 'tp is waiting indefinitely for event-driven background job RDDIMPDP to execute the database conversion.'
      },
      {
        step: 3,
        title: 'Reschedule RDDIMPDP via SE38 in Client 000',
        instruction: 'Log into client 000, execute SE38 -> RDDNEWPP, and choose "Normal priority".',
        expectedFinding: 'Job RDDIMPDP schedules and activates immediately; SPAM resumes and completes IMPORT_PROPER within 4 minutes.',
        interpretation: 'Scheduling RDDNEWPP restored the transport dispatcher job, resolving the hang.'
      }
    ],
    handsOnTask: {
      title: 'Analyze Transport Return Codes and Logs',
      instructions: [
        'Document the meaning and operational consequences of transport return codes 0, 4, 8, 12, and 16.',
        'Explain the role of background report RDDNEWPP and job RDDIMPDP during transports and SPAM.',
        'Detail how to locate and safely remove a stale transport lock file (.LOK) in /usr/sap/trans/tmp.'
      ],
      deliverable: 'A transport management and SPAM troubleshooting guide.'
    },
    knowledgeCheck: [
      {
        id: 'w6d3_q1',
        question: 'What does a transport return code of RC 8 indicate in an import log?',
        options: [
          'Total success without any warnings.',
          'An error occurred (such as syntax errors or activation failures); repository objects were not activated cleanly and require investigation.',
          'The database hard disk crashed.',
          'The user has logged out.'
        ],
        correctAnswer: 1,
        explanation: 'RC 8 indicates an error where objects could not be activated or imported properly. In contrast, RC 4 is a non-critical warning, while RC 12 is a fatal execution crash.'
      },
      {
        id: 'w6d3_q2',
        question: 'If an import or SPAM queue hangs indefinitely in phase IMPORT_PROPER, what critical background job in client 000 should be checked first?',
        options: [
          'SAP_COLLECTOR_FOR_PERFMONITOR',
          'RDDIMPDP (scheduled via report RDDNEWPP)',
          'Z_PURGE_TRACES',
          'SAP_CCMS_MONI_BATCH'
        ],
        correctAnswer: 1,
        explanation: 'RDDIMPDP is the central event-triggered background transport dispatcher. If RDDIMPDP is not scheduled in client 000, tp will wait indefinitely for import steps to finish.'
      }
    ],
    tasks: [
      { id: 't1', text: 'Understand SPAM vs SAINT responsibilities and queue definitions.' },
      { id: 't2', text: 'Master transport return codes (RC 0, 4, 8, 12, 16).' },
      { id: 't3', text: 'Study the role of RDDIMPDP and RDDNEWPP in transport processing.' },
      { id: 't4', text: 'Complete the Day 3 Upgrade knowledge check.' }
    ]
  },
  {
    id: 'w6d4',
    week: 6,
    day: 4,
    title: 'SAP HANA Upgrades: Revision Compatibility, Prechecks, and Rollback Limitations',
    topic: 'HANA 2.0 SPS Upgrades, hdblcm Command-Line Execution, Revision Matrix, and Fallback Planning',
    domain: 'upgrades',
    durationMinutes: 60,
    learningObjectives: [
      'Master the SAP HANA lifecycle management tool (hdblcm) in GUI, web, and unattended batch mode.',
      'Evaluate HANA revision compatibility matrices, maintenance revisions, and SPS upgrade paths.',
      'Execute mandatory pre-upgrade checks: backup validation, license validity, system replication health, OS kernel packages.',
      'Understand the fundamental persistence limitations of HANA upgrades and why "rollback" requires database restore.',
      'Safely execute and monitor a HANA database upgrade from the Linux terminal.'
    ],
    technicalExplanation: `Upgrading an SAP HANA database (e.g. from HANA 2.0 SPS 05 to SPS 07) modifies the binary engine and in-place database catalog.

1. **The HANA Database Lifecycle Manager (hdblcm)**:
   - Always run the \`hdblcm\` resident in the **installation media**, not the one installed in \`/hana/shared\`:
     \`\`\`bash
     cd /sapcd/HANA2_SPS07/DATA_UNITS/HDB_LCM_LINUX_X86_64
     ./hdblcm --action=update
     \`\`\`
   - Supports command line (\`--batch\`), interactive terminal, or browser Web UI.

2. **Mandatory Pre-Upgrade Checks**:
   - **Full Database Data Backup**: Must complete and be validated immediately prior to starting the upgrade.
   - **System Replication (HSR) Sync**: If HSR is enabled, secondary must be fully synchronized (\`SOK\`).
   - **Operating System Compatibility**: Verify SLES/RHEL kernel version, GCC runtime libraries, and required \`sapconf\` or \`saptune\` packages per the SAP HANA Master Note for that target revision.
   - **Disk Space**: Verify at least 15GB free on \`/hana/shared\` and \`/usr/sap\`.

3. **The Rollback Reality**:
   - **There is no "undo" button for an SAP HANA revision upgrade**:
   - Once \`hdblcm\` updates the internal database catalog and table structures, the data volume cannot be opened by an older HANA revision binary!
   - **The only supported rollback method** is:
     1. Uninstall/revert the HANA software binaries to the previous revision.
     2. Restore the database completely from the pre-upgrade full data backup and log backups up to the pre-upgrade timestamp.
     3. This means rollback requires significant downtime and planning!`,
    detailedStudyNotes: [
      'Near-Zero Downtime with HSR: In high-availability landscapes, HANA can be upgraded with minimal downtime by upgrading the Secondary node first, executing a takeover, and then upgrading the old Primary!',
      'Inspect hdblcm.log: Every action is logged in /var/tmp/hdb_<ACTION>_<TIMESTAMP>/hdblcm.log. If an upgrade halts, this log identifies the exact failing check.',
      'Catalog migration: During the first startup under the new revision, HANA executes internal catalog migration scripts. Do not terminate the indexserver during this phase even if it appears quiet.'
    ],
    toolsAndCommands: [
      { name: './hdblcm --action=update', type: 'command', description: 'Interactive command line SAP HANA database update utility.' },
      { name: 'HDB version', type: 'command', description: 'Displays currently running SAP HANA database engine revision and build date.' },
      { name: 'tail -f /var/tmp/hdblcm.log', type: 'command', description: 'Monitors real-time HANA upgrade progress.' }
    ],
    productionScenario: {
      ticketId: 'INC-2026-08604',
      severity: 'P1',
      title: 'HANA Upgrade Aborts in Precheck: Unsupported OS C++ Library',
      description: 'During a production HANA 2.0 SPS 07 upgrade maintenance window, hdblcm aborts during precheck: "Cannot update SAP HANA system: GCC runtime package libstdc++6 version is below minimum requirement 9.3".',
      systemContext: 'HANA 2.0 SPS 05 on SLES 15 SP2 upgrading to SPS 07.'
    },
    guidedInvestigation: [
      {
        step: 1,
        title: 'Review hdblcm Precheck Output',
        instruction: 'Inspect the precheck report generated by hdblcm.',
        expectedFinding: 'Required libstdc++6 >= 9.3.0. Currently installed OS version: 8.2.1.',
        interpretation: 'The Linux operating system was not patched to the service pack level required by HANA SPS 07.'
      },
      {
        step: 2,
        title: 'Consult SAP HANA Operating System Support Matrix Note',
        instruction: 'Check SAP Release Note for HANA 2.0 SPS 07 on SLES 15.',
        expectedFinding: 'HANA 2.0 SPS 07 strictly mandates SLES 15 SP4 or higher with updated GCC runtimes.',
        interpretation: 'Continuing the upgrade is impossible until the underlying OS packages are updated.'
      },
      {
        step: 3,
        title: 'Formulate Go/No-Go Decision and Protect System',
        instruction: 'Assess time remaining in maintenance window (45 minutes left).',
        expectedFinding: 'Applying SLES service packs and rebooting requires 2 hours, exceeding maintenance window.',
        interpretation: 'Safe decision: Abort upgrade, keep running on SPS 05 (no database files were modified yet), and reschedule after OS upgrade.'
      }
    ],
    handsOnTask: {
      title: 'Design a Near-Zero Downtime HANA Upgrade Plan Using HSR',
      instructions: [
        'Outline the sequence of steps to upgrade a 2-node HANA System Replication cluster with under 5 minutes of downtime.',
        'Document the 4 mandatory pre-upgrade checks before launching hdblcm.',
        'Explain why restoring from full backup is the only valid rollback mechanism after an in-place catalog update.'
      ],
      deliverable: 'A technical HANA upgrade and rollback runbook.'
    },
    knowledgeCheck: [
      {
        id: 'w6d4_q1',
        question: 'Why is rolling back an SAP HANA database to a previous revision impossible without restoring from a backup once an upgrade completes?',
        options: [
          'Because Linux deletes the old executables.',
          'The upgrade modifies the internal database catalog and persistence structures; an older HANA revision cannot read or open a newer catalog version.',
          'Because the HANA license key expires during upgrade.',
          'Because hdblcm formats the hard drive.'
        ],
        correctAnswer: 1,
        explanation: 'Database catalog formats change between major revisions. Older binaries cannot process newer catalog structures, making full database restore the only valid rollback path.'
      },
      {
        id: 'w6d4_q2',
        question: 'From where should an administrator execute hdblcm when performing an SAP HANA database update?',
        options: [
          'From /etc/init.d.',
          'From the installation media directory (e.g. /sapcd/.../HDB_LCM_LINUX_X86_64), ensuring the newer installer version is used.',
          'From /tmp/root.',
          'From SAP GUI transaction DB02.'
        ],
        correctAnswer: 1,
        explanation: 'Always execute hdblcm from the newer target installation media to ensure the installer contains the latest bug fixes and understands the target revision.'
      }
    ],
    tasks: [
      { id: 't1', text: 'Master hdblcm update execution and command-line arguments.' },
      { id: 't2', text: 'Study mandatory HANA pre-upgrade checklists.' },
      { id: 't3', text: 'Understand near-zero downtime upgrade using System Replication.' },
      { id: 't4', text: 'Complete the Day 4 Upgrade knowledge check.' }
    ]
  },
  {
    id: 'w6d5',
    week: 6,
    day: 5,
    title: 'Failed Upgrade Recovery Plan: Impact Assessment, Rollback Limitations, and Recovery',
    topic: 'End-to-End Upgrade Disaster Recovery: Distinguishing Abort vs Rollback vs Rollforward, Production Fallback Planning',
    domain: 'upgrades',
    durationMinutes: 60,
    learningObjectives: [
      'Assess blast radius and operational state when an upgrade fails mid-execution.',
      'Differentiate between tool-level retry, phase reset, and full disaster rollback.',
      'Establish strict Go / No-Go decision gates during maintenance windows.',
      'Execute a verified fallback plan restoring production service before business opening.',
      'Conduct a post-upgrade failure RCA identifying governance, technical, and environment gaps.'
    ],
    technicalExplanation: `The true test of a senior Basis architect is managing a failed upgrade under severe time pressure when the maintenance window is expiring.

**The Go / No-Go Decision Framework**:
- Every production maintenance window must have a pre-agreed **Point of No Return (PoNR)**.
- Example:
  - Downtime Window: 22:00 Saturday to 06:00 Sunday.
  - **Point of No Return: 03:00 Sunday**.
  - If the upgrade is not at or past the Execution Downtime cutover by 03:00, **the upgrade is immediately aborted and rollback initiated** so the system is guaranteed operational by 06:00.

**Classifying Upgrade Failures**:
1. **Pre-Downtime Failure (PREP / SHADOW)**:
   - Zero business risk. Production is still online!
   - Can safely reset SUM or pause investigation without rolling back the database.
2. **Downtime Phase Failure (EXECUTION / MODTRANS)**:
   - High risk. Production is down; delta merges may be partially applied.
   - Investigate the first meaningful error: Can it be fixed within 30 minutes?
   - If yes: Fix, repeat phase, and proceed.
   - If no and PoNR is exceeded: **Trigger Full Rollback Protocol**.

**The Full Rollback Protocol**:
- Step 1: Formal notification to Incident Commander and Management of Rollback decision.
- Step 2: Restore Database from the pre-maintenance storage snapshot or full backup.
- Step 3: Revert filesystem profiles, kernel directories, and /sapmnt from backup.
- Step 4: Start Database, ASCS, and Application Servers under original software versions.
- Step 5: Execute comprehensive Post-Restoration Sanity Checks (logon, transactions, RFCs).`,
    detailedStudyNotes: [
      'Storage snapshots: In modern cloud (Azure NetApp Files, AWS EBS) or on-prem SANs (Pure Storage, NetApp), storage snapshots taken immediately prior to downtime allow full database rollback in under 10 minutes instead of multi-hour tape/backup restores!',
      'Document everything during the crisis: Maintain an incident log recording every command executed and timestamp for the post-mortem RCA.',
      'Never panic-delete directories: Deleting the SUM directory while trying to "clean up" makes rollback or recovery ten times harder.'
    ],
    toolsAndCommands: [
      { name: 'SUM Reset', type: 'tool', description: 'Resetting SUM via browser URL https://<host>:1129/lmsl/sumabap/<SID>/doc/sluigui.' },
      { name: 'SAPup reset', type: 'command', description: 'Command-line tool to reset upgrade state if supported in current phase.' },
      { name: 'R3trans -d', type: 'command', description: 'Verifies database connectivity following restoration.' }
    ],
    productionScenario: {
      ticketId: 'INC-2026-08605',
      severity: 'P1',
      title: 'Upgrade Execution Stalls in PARCONV - Point of No Return Exceeded',
      description: 'SUM downtime phase PARCONV (table conversion) failed due to disk corruption. Two hours were spent troubleshooting; the 03:00 Point of No Return has passed. Business opens in 3 hours.',
      systemContext: 'S/4HANA 2023 Upgrade. Downtime window closing.'
    },
    guidedInvestigation: [
      {
        step: 1,
        title: 'Evaluate Time Budget vs Rollback Duration',
        instruction: 'Compare remaining time (180 mins) vs verified SAN snapshot restore time (25 mins).',
        expectedFinding: 'Fixing disk corruption and rebuilding tables will take 4+ hours; snapshot restore takes 25 minutes.',
        interpretation: 'Continuing to debug guarantees business opening failure. Immediate rollback is mandatory.'
      },
      {
        step: 2,
        title: 'Execute Clean Storage Snapshot Rollback',
        instruction: 'Halt all host processes, revert /hana/data and /hana/log volumes to 22:00 snapshot, and revert /usr/sap and /sapmnt.',
        expectedFinding: 'Storage reverted in 12 minutes. Previous kernel and database catalog restored to pristine pre-upgrade state.',
        interpretation: 'Storage-level snapshot rollback cleanly erased the corrupted in-progress conversion state.'
      },
      {
        step: 3,
        title: 'Start System and Execute Sanity Verification',
        instruction: 'Start HANA DB, ASCS, and PAS; run SICK, SM21, and test user logons.',
        expectedFinding: 'Database OPEN; disp+work GREEN; all SAP transactions operational; zero data loss.',
        interpretation: 'System successfully restored to production service 2 hours before business opening.'
      }
    ],
    handsOnTask: {
      title: 'Author an Upgrade Failure Post-Mortem in RCA Notebook',
      instructions: [
        'Open the RCA Notebook.',
        'Create an RCA report for INC-2026-08605 analyzing the PARCONV failure and rollback execution.',
        'Detail why having an enforced Point of No Return (PoNR) prevented an extended business outage.'
      ],
      deliverable: 'A finalized upgrade failure RCA report.'
    },
    knowledgeCheck: [
      {
        id: 'w6d5_q1',
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
        id: 'w6d5_q2',
        question: 'Why are SAN/Cloud storage volume snapshots superior to traditional tape restores for upgrade fallback planning?',
        options: [
          'Because snapshots do not use any electricity.',
          'Snapshots can restore multi-terabyte database volumes in minutes rather than hours, fitting comfortably within tight maintenance rollback windows.',
          'Because snapshots automatically upgrade the kernel.',
          'Because snapshots eliminate the need for an SAP password.'
        ],
        correctAnswer: 1,
        explanation: 'Storage snapshots revert pointers at the block layer in minutes regardless of database size, providing a reliable, ultra-fast rollback safety net.'
      }
    ],
    tasks: [
      { id: 't1', text: 'Understand Go / No-Go decision gates and Point of No Return.' },
      { id: 't2', text: 'Learn rollback mechanics across database, kernel, and SUM layers.' },
      { id: 't3', text: 'Draft an upgrade failure RCA in the RCA Notebook.' },
      { id: 't4', text: 'Complete the Week 6 summary knowledge check.' }
    ]
  }
];

export interface KnowledgeCheckQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // 0-based index
  explanation: string;
}

export interface CurriculumSession {
  id: string; // e.g. "w1d1"
  week: number;
  day: number;
  title: string;
  topic: string;
  domain: 'architecture' | 'linux' | 'database' | 'abap' | 'ha' | 'upgrades' | 'rca' | 'simulations';
  durationMinutes: number;
  learningObjectives: string[];
  technicalExplanation: string;
  detailedStudyNotes: string[];
  toolsAndCommands: {
    name: string;
    type: 'transaction' | 'command' | 'log' | 'tool';
    syntax?: string;
    description: string;
  }[];
  productionScenario: {
    ticketId: string;
    severity: 'P1' | 'P2' | 'P3';
    title: string;
    description: string;
    systemContext: string;
  };
  guidedInvestigation: {
    step: number;
    title: string;
    instruction: string;
    expectedFinding: string;
    interpretation: string;
  }[];
  handsOnTask: {
    title: string;
    instructions: string[];
    deliverable: string;
  };
  knowledgeCheck: KnowledgeCheckQuestion[];
  tasks: {
    id: string;
    text: string;
  }[];
}

export interface UserSessionProgress {
  sessionId: string;
  completed: boolean;
  completedTasks: string[]; // task ids
  userNotes: string;
  confidenceRating: number; // 1 to 5
  actualStudyMinutes: number;
  quizScore?: {
    correct: number;
    total: number;
    answers: Record<string, number>; // questionId -> selectedIndex
  };
  completedAt?: string;
}

export interface RCAReport {
  id: string;
  title: string;
  sid: string;
  instance: string;
  startTime: string;
  businessImpact: string;
  symptoms: string;
  tags: ('HANA' | 'Oracle' | 'Linux' | 'ABAP' | 'HA' | 'Upgrade')[];
  status: 'draft' | 'reviewed' | 'completed';
  initialEvidence: {
    sapProcess: string;
    traces: string;
    osEvidence: string;
    dbEvidence: string;
    networkCluster: string;
  };
  investigation: {
    hypotheses: string;
    supportingEvidence: string;
    contradictoryEvidence: string;
    checksPerformed: string;
    alternativeCausesRuledOut: string;
  };
  rootCause: {
    confidence: 'confirmed' | 'probable' | 'unconfirmed';
    technicalExplanation: string;
    contributingFactors: string;
    evidenceProvingCause: string;
  };
  resolution: {
    correctiveAction: string;
    riskAssessment: string;
    recoveryOrRollback: string;
    actualOutcome: string;
  };
  validation: {
    sapProcessesHealthy: boolean;
    dbConnectivityVerified: boolean;
    appFunctionalityVerified: boolean;
    monitoringStable: boolean;
    notes: string;
  };
  prevention: {
    monitoringImprovements: string;
    capacityConfigChanges: string;
    followUpActions: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LabScenario {
  id: string;
  title: string;
  difficulty: 'guided' | 'intermediate' | 'expert';
  category: string;
  ticket: {
    number: string;
    severity: 'P1-CRITICAL' | 'P2-HIGH' | 'P3-MEDIUM';
    system: string;
    environment: string;
    reportedIssue: string;
    businessImpact: string;
    initialStatus: string;
  };
  hints: string[];
  supportedCommands: Record<string, string>; // normalized command string -> terminal output
  correctRootCause: string;
  correctEvidence: string[];
  safeRemediation: string;
  postFixValidation: string;
  scoringGuide: {
    keyCommandsNeeded: string[];
    pitfalls: string[];
  };
}

export interface CommandDoc {
  id: string;
  command: string;
  category: 'linux-resource' | 'filesystem' | 'process-service' | 'networking' | 'sap-instance' | 'sap-traces' | 'hana' | 'oracle' | 'ha-cluster';
  purpose: string;
  syntax: string;
  importantFlags: { flag: string; description: string }[];
  exampleOutput: string;
  interpretation: string;
  requiredPermissions: string;
  productionSafety: string;
  osDistroNotes?: string;
  isReadOnly: boolean;
}

export interface StudyArticle {
  id: string;
  title: string;
  domain: string;
  definition: string;
  productionImpact: string;
  investigationMethod: string;
  commonSymptoms: string[];
  diagnosticSteps: string[];
  exampleOutput: string;
  outputInterpretation: string;
  commonMistakes: string[];
  safeRemediation: string;
  relatedSessionIds: string[];
  knowledgeCheck: KnowledgeCheckQuestion[];
}

export interface UserSettings {
  dailyGoalMinutes: number;
  preferredStudyDays: number;
  theme: 'dark' | 'light' | 'system';
  accentColor: 'indigo' | 'blue' | 'emerald' | 'teal' | 'violet' | 'rose' | 'amber' | 'custom';
  customAccentHex?: string;
  inAppNotifications: boolean;
  userLevel: string;
  targetDatabases: string[];
}

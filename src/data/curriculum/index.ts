import { CurriculumSession } from '../../types';
import { week1Sessions } from './week1';
import { week2Sessions } from './week2';
import { week3Sessions } from './week3';
import { week4Sessions } from './week4';
import { week5Sessions } from './week5';
import { week6Sessions } from './week6';
import { week7Sessions } from './week7';
import { week8Sessions } from './week8';

export const allCurriculumSessions: CurriculumSession[] = [
  ...week1Sessions,
  ...week2Sessions,
  ...week3Sessions,
  ...week4Sessions,
  ...week5Sessions,
  ...week6Sessions,
  ...week7Sessions,
  ...week8Sessions,
];

export const getSessionById = (id: string): CurriculumSession | undefined => {
  return allCurriculumSessions.find((s) => s.id === id);
};

export const getSessionsByWeek = (week: number): CurriculumSession[] => {
  return allCurriculumSessions.filter((s) => s.week === week);
};

export const weekThemes: { week: number; title: string; subtitle: string; icon: string }[] = [
  { week: 1, title: 'Week 1', subtitle: 'SAP Architecture & Startup Troubleshooting', icon: 'Server' },
  { week: 2, title: 'Week 2', subtitle: 'Advanced Linux Administration & Storage Diagnostics', icon: 'Terminal' },
  { week: 3, title: 'Week 3', subtitle: 'SAP HANA & Oracle Database Troubleshooting', icon: 'Database' },
  { week: 4, title: 'Week 4', subtitle: 'ABAP Engine, Work Processes, Locks & Updates', icon: 'Cpu' },
  { week: 5, title: 'Week 5', subtitle: 'High Availability, Clustering & Enqueue Replication', icon: 'ShieldAlert' },
  { week: 6, title: 'Week 6', subtitle: 'Upgrades, SUM Phases, Kernels & Maintenance', icon: 'Layers' },
  { week: 7, title: 'Week 7', subtitle: 'Cross-Layer Root-Cause Analysis (RCA) Methodology', icon: 'FileText' },
  { week: 8, title: 'Week 8', subtitle: 'Incident Simulations, Capstone & Production Playbook', icon: 'Award' },
];

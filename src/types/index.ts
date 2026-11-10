// CPU Scheduling Types
export type CpuAlgorithm = 'fcfs' | 'sjf' | 'srtf' | 'round_robin' | 'priority_np' | 'priority_p';

export interface ProcessInput {
  id: string;
  name: string;
  arrivalTime: number;
  burstTime: number;
  priority: number;
  color: string;
}

export interface GanttSegment {
  processId: string;
  processName: string;
  start: number;
  end: number;
  color: string;
}

export interface ProcessMetrics {
  id: string;
  name: string;
  arrivalTime: number;
  burstTime: number;
  priority: number;
  color: string;
  completionTime: number;
  turnaroundTime: number;
  waitingTime: number;
  responseTime: number;
}

export interface SchedulingResult {
  timeline: GanttSegment[];
  metrics: ProcessMetrics[];
  avgTurnaround: number;
  avgWaiting: number;
  avgResponse: number;
  cpuUtilization: number;
  totalTime: number;
}

// Memory Allocation Types
export type MemoryAlgorithm = 'first_fit' | 'best_fit' | 'worst_fit';

export interface MemoryBlock {
  id: string;
  start: number;
  size: number;
  isAllocated: boolean;
  processName?: string;
  color?: string;
}

// Paging / Page Replacement Types
export type PageAlgorithm = 'fifo' | 'lru' | 'optimal';

export interface PageStep {
  page: number;
  frames: (number | null)[];
  isFault: boolean;
}

export interface PagingResult {
  steps: PageStep[];
  faultCount: number;
  hitCount: number;
  faultRate: number;
}

// Deadlock / Banker's Types
export interface BankersState {
  available: number[];
  max: number[][];
  allocation: number[][];
  need: number[][];
  processNames: string[];
  resourceNames: string[];
}

export interface SafetyResult {
  isSafe: boolean;
  safeSequence?: string[];
  steps: string[];
}

// Virtual Terminal & File System Types
export interface VFSNode {
  name: string;
  type: 'file' | 'dir';
  content?: string;
  children?: { [name: string]: VFSNode };
  permissions: string;
  size: number;
  updatedAt: string;
}

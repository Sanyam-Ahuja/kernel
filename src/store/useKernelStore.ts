import { create } from 'zustand';
import { 
  CpuAlgorithm, 
  ProcessInput, 
  SchedulingResult,
  MemoryBlock,
  MemoryAlgorithm,
  PageAlgorithm,
  PagingResult,
  BankersState,
  SafetyResult,
  VFSNode
} from '../types';
import { runCpuScheduler } from '../engine/cpu';
import { initializeMemory, allocateMemory, freeMemory, compactMemory } from '../engine/memory';
import { runPageReplacement } from '../engine/paging';
import { createDefaultBankersState, checkSafety, requestResources } from '../engine/deadlock';
import { createInitialVFS, executeCommand } from '../engine/filesystem';

const INITIAL_PROCESSES: ProcessInput[] = [
  { id: 'P1', name: 'P1 (Compiler)', arrivalTime: 0, burstTime: 8, priority: 3, color: '#38bdf8' },
  { id: 'P2', name: 'P2 (Database)', arrivalTime: 1, burstTime: 4, priority: 1, color: '#4ade80' },
  { id: 'P3', name: 'P3 (Web Server)', arrivalTime: 2, burstTime: 9, priority: 4, color: '#facc15' },
  { id: 'P4', name: 'P4 (Audio Daemon)', arrivalTime: 3, burstTime: 5, priority: 2, color: '#f43f5e' },
];

const INITIAL_PAGE_REF = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1];

interface KernelState {
  activeTab: 'terminal' | 'scheduler' | 'memory' | 'paging' | 'deadlock';
  setActiveTab: (tab: KernelState['activeTab']) => void;

  // CPU Scheduler
  cpuProcesses: ProcessInput[];
  cpuAlgorithm: CpuAlgorithm;
  cpuQuantum: number;
  cpuResult: SchedulingResult;
  setCpuAlgorithm: (algo: CpuAlgorithm) => void;
  setCpuQuantum: (q: number) => void;
  addProcess: (p: ProcessInput) => void;
  removeProcess: (id: string) => void;
  recalculateCpu: () => void;

  // Memory Management
  memoryBlocks: MemoryBlock[];
  memoryAlgorithm: MemoryAlgorithm;
  memoryError: string | null;
  setMemoryAlgorithm: (algo: MemoryAlgorithm) => void;
  allocateMem: (name: string, size: number) => void;
  freeMem: (id: string) => void;
  compactMem: () => void;
  resetMem: () => void;

  // Page Replacement
  pageReference: number[];
  pageFrames: number;
  pageAlgorithm: PageAlgorithm;
  pagingResult: PagingResult;
  setPageAlgorithm: (algo: PageAlgorithm) => void;
  setPageFrames: (frames: number) => void;
  setPageReferenceString: (str: string) => void;

  // Deadlock Laboratory
  bankersState: BankersState;
  safetyResult: SafetyResult;
  runSafetyCheck: () => void;
  handleResourceRequest: (pid: number, req: number[]) => { success: boolean; message: string };
  resetBankers: () => void;

  // Terminal & VFS
  vfsRoot: VFSNode;
  vfsPath: string[];
  terminalHistory: Array<{ command: string; output: string; path: string }>;
  runTerminalCommand: (cmd: string) => void;
  clearTerminal: () => void;

  // Global Demo Reset
  resetAll: () => void;
}

const STORAGE_KEY = 'kernel_os_state_v1';

const initialVFS = createInitialVFS();
const initialBankers = createDefaultBankersState();
const initialCpuResult = runCpuScheduler(INITIAL_PROCESSES, 'round_robin', 3);
const initialPagingResult = runPageReplacement(INITIAL_PAGE_REF, 3, 'lru');

export const useKernelStore = create<KernelState>((set, get) => ({
  activeTab: 'terminal',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // CPU
  cpuProcesses: INITIAL_PROCESSES,
  cpuAlgorithm: 'round_robin',
  cpuQuantum: 3,
  cpuResult: initialCpuResult,
  setCpuAlgorithm: (algo) => {
    set({ cpuAlgorithm: algo });
    get().recalculateCpu();
  },
  setCpuQuantum: (q) => {
    set({ cpuQuantum: q });
    get().recalculateCpu();
  },
  addProcess: (p) => {
    set((state) => ({ cpuProcesses: [...state.cpuProcesses, p] }));
    get().recalculateCpu();
  },
  removeProcess: (id) => {
    set((state) => ({ cpuProcesses: state.cpuProcesses.filter((p) => p.id !== id) }));
    get().recalculateCpu();
  },
  recalculateCpu: () => {
    const { cpuProcesses, cpuAlgorithm, cpuQuantum } = get();
    const result = runCpuScheduler(cpuProcesses, cpuAlgorithm, cpuQuantum);
    set({ cpuResult: result });
  },

  // Memory
  memoryBlocks: initializeMemory(1024),
  memoryAlgorithm: 'first_fit',
  memoryError: null,
  setMemoryAlgorithm: (algo) => set({ memoryAlgorithm: algo }),
  allocateMem: (name, size) => {
    const { memoryBlocks, memoryAlgorithm } = get();
    const colors = ['#06b6d4', '#818cf8', '#f59e0b', '#34d399', '#ec4899', '#a855f7'];
    const chosenColor = colors[Math.floor(Math.random() * colors.length)];
    const res = allocateMemory(memoryBlocks, name, size, memoryAlgorithm, chosenColor);
    if (res.success) {
      set({ memoryBlocks: res.blocks, memoryError: null });
    } else {
      set({ memoryError: res.error || 'Allocation failed' });
    }
  },
  freeMem: (id) => {
    set((state) => ({ memoryBlocks: freeMemory(state.memoryBlocks, id), memoryError: null }));
  },
  compactMem: () => {
    set((state) => ({ memoryBlocks: compactMemory(state.memoryBlocks, 1024), memoryError: null }));
  },
  resetMem: () => {
    set({ memoryBlocks: initializeMemory(1024), memoryError: null });
  },

  // Paging
  pageReference: INITIAL_PAGE_REF,
  pageFrames: 3,
  pageAlgorithm: 'lru',
  pagingResult: initialPagingResult,
  setPageAlgorithm: (algo) => {
    set({ pageAlgorithm: algo });
    const { pageReference, pageFrames } = get();
    set({ pagingResult: runPageReplacement(pageReference, pageFrames, algo) });
  },
  setPageFrames: (frames) => {
    set({ pageFrames: frames });
    const { pageReference, pageAlgorithm } = get();
    set({ pagingResult: runPageReplacement(pageReference, frames, pageAlgorithm) });
  },
  setPageReferenceString: (str) => {
    const parsed = str
      .split(/[,\s]+/)
      .map((n) => parseInt(n.trim(), 10))
      .filter((n) => !isNaN(n));
    set({ pageReference: parsed });
    const { pageFrames, pageAlgorithm } = get();
    set({ pagingResult: runPageReplacement(parsed, pageFrames, pageAlgorithm) });
  },

  // Deadlock
  bankersState: initialBankers,
  safetyResult: checkSafety(initialBankers),
  runSafetyCheck: () => {
    const { bankersState } = get();
    set({ safetyResult: checkSafety(bankersState) });
  },
  handleResourceRequest: (pid, req) => {
    const { bankersState } = get();
    const res = requestResources(bankersState, pid, req);
    if (res.success && res.newState) {
      set({ bankersState: res.newState, safetyResult: checkSafety(res.newState) });
    }
    return { success: res.success, message: res.message };
  },
  resetBankers: () => {
    const fresh = createDefaultBankersState();
    set({ bankersState: fresh, safetyResult: checkSafety(fresh) });
  },

  // Terminal & VFS
  vfsRoot: initialVFS.root,
  vfsPath: initialVFS.currentPath,
  terminalHistory: [
    {
      command: 'uname -a',
      output: 'Linux kernel-node-01 6.8.0-browser-edu #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux',
      path: '/home/student',
    },
    {
      command: 'help',
      output: 'Welcome to Kernel! Type pwd, ls, cd, cat, touch, mkdir, ps, free, clear.',
      path: '/home/student',
    },
  ],
  runTerminalCommand: (cmd) => {
    if (cmd.trim() === 'clear') {
      get().clearTerminal();
      return;
    }
    const { vfsRoot, vfsPath } = get();
    const currentPathStr = '/' + vfsPath.join('/');
    const res = executeCommand(cmd, vfsRoot, vfsPath);

    set((state) => ({
      vfsRoot: res.newRoot,
      vfsPath: res.newPath,
      terminalHistory: [
        ...state.terminalHistory,
        { command: cmd, output: res.output, path: currentPathStr },
      ],
    }));
  },
  clearTerminal: () => set({ terminalHistory: [] }),

  // Reset All
  resetAll: () => {
    localStorage.removeItem(STORAGE_KEY);
    const vfs = createInitialVFS();
    const bankers = createDefaultBankersState();
    const cpuRes = runCpuScheduler(INITIAL_PROCESSES, 'round_robin', 3);
    const pageRes = runPageReplacement(INITIAL_PAGE_REF, 3, 'lru');

    set({
      cpuProcesses: INITIAL_PROCESSES,
      cpuAlgorithm: 'round_robin',
      cpuQuantum: 3,
      cpuResult: cpuRes,
      memoryBlocks: initializeMemory(1024),
      memoryAlgorithm: 'first_fit',
      memoryError: null,
      pageReference: INITIAL_PAGE_REF,
      pageFrames: 3,
      pageAlgorithm: 'lru',
      pagingResult: pageRes,
      bankersState: bankers,
      safetyResult: checkSafety(bankers),
      vfsRoot: vfs.root,
      vfsPath: vfs.currentPath,
      terminalHistory: [],
    });
  },
}));

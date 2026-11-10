import { describe, it, expect } from 'vitest';
import { runCpuScheduler } from './cpu';
import { initializeMemory, allocateMemory, freeMemory, compactMemory } from './memory';
import { runPageReplacement } from './paging';
import { createDefaultBankersState, checkSafety, requestResources } from './deadlock';
import { createInitialVFS, executeCommand } from './filesystem';
import { ProcessInput } from '../types';

describe('Kernel Systems Programming Engines', () => {
  // 1. CPU Scheduling Tests
  it('correctly executes FCFS CPU scheduling and calculates turnaround/waiting metrics', () => {
    const procs: ProcessInput[] = [
      { id: 'P1', name: 'P1', arrivalTime: 0, burstTime: 5, priority: 1, color: '#38bdf8' },
      { id: 'P2', name: 'P2', arrivalTime: 1, burstTime: 3, priority: 2, color: '#4ade80' },
    ];
    const res = runCpuScheduler(procs, 'fcfs');
    expect(res.timeline.length).toBe(2);
    expect(res.timeline[0].end).toBe(5);
    expect(res.timeline[1].end).toBe(8);

    const p1 = res.metrics.find((m) => m.id === 'P1')!;
    const p2 = res.metrics.find((m) => m.id === 'P2')!;
    expect(p1.waitingTime).toBe(0);
    expect(p2.waitingTime).toBe(4); // Starts at 5, arrived at 1 -> WT = 4
  });

  it('correctly executes Round Robin scheduling with time quantum', () => {
    const procs: ProcessInput[] = [
      { id: 'P1', name: 'P1', arrivalTime: 0, burstTime: 5, priority: 1, color: '#38bdf8' },
      { id: 'P2', name: 'P2', arrivalTime: 0, burstTime: 3, priority: 1, color: '#4ade80' },
    ];
    const res = runCpuScheduler(procs, 'round_robin', 2);
    // P1(0-2), P2(2-4), P1(4-6), P2(6-7), P1(7-8)
    expect(res.totalTime).toBe(8);
    expect(res.cpuUtilization).toBe(100);
  });

  // 2. Memory Allocation Tests
  it('allocates memory partitions and compacts free holes', () => {
    let blocks = initializeMemory(1024);
    const alloc1 = allocateMemory(blocks, 'procA', 256, 'first_fit');
    expect(alloc1.success).toBe(true);

    const alloc2 = allocateMemory(alloc1.blocks, 'procB', 128, 'first_fit');
    expect(alloc2.success).toBe(true);

    // Free first block creating hole
    const targetBlock = alloc2.blocks.find((b) => b.processName === 'procA')!;
    const freed = freeMemory(alloc2.blocks, targetBlock.id);

    // Compact
    const compacted = compactMemory(freed, 1024);
    const freeHoles = compacted.filter((b) => !b.isAllocated);
    expect(freeHoles.length).toBe(1); // All free space unified into single hole
  });

  // 3. Paging Tests
  it('calculates page replacement faults accurately for LRU', () => {
    const refs = [7, 0, 1, 2, 0, 3];
    const res = runPageReplacement(refs, 3, 'lru');
    expect(res.steps.length).toBe(6);
    expect(res.faultCount).toBeGreaterThan(0);
    expect(res.hitCount).toBeGreaterThan(0);
  });

  // 4. Banker's Algorithm Tests
  it('identifies safe state and safe execution sequence in Banker algorithm', () => {
    const state = createDefaultBankersState();
    const safety = checkSafety(state);
    expect(safety.isSafe).toBe(true);
    expect(safety.safeSequence).toBeDefined();
    expect(safety.safeSequence!.length).toBe(5);
  });

  // 5. Virtual File System Tests
  it('executes virtual filesystem shell commands in memory', () => {
    const vfs = createInitialVFS();
    const resLs = executeCommand('ls', vfs.root, vfs.currentPath);
    expect(resLs.output).toContain('main.c');

    const resTouch = executeCommand('touch test.py', vfs.root, vfs.currentPath);
    const resLs2 = executeCommand('ls', resTouch.newRoot, resTouch.newPath);
    expect(resLs2.output).toContain('test.py');
  });
});

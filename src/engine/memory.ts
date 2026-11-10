import { MemoryBlock, MemoryAlgorithm } from '../types';

export function initializeMemory(totalSize: number = 1024): MemoryBlock[] {
  return [
    { id: 'blk-os', start: 0, size: 128, isAllocated: true, processName: 'Kernel OS', color: '#64748b' },
    { id: 'blk-free-1', start: 128, size: 896, isAllocated: false },
  ];
}

export function allocateMemory(
  blocks: MemoryBlock[],
  processName: string,
  requestSize: number,
  algorithm: MemoryAlgorithm,
  color: string = '#06b6d4'
): { success: boolean; blocks: MemoryBlock[]; error?: string } {
  const freeBlocks = blocks
    .map((blk, idx) => ({ blk, idx }))
    .filter(({ blk }) => !blk.isAllocated && blk.size >= requestSize);

  if (freeBlocks.length === 0) {
    return {
      success: false,
      blocks,
      error: `Out of Memory: No contiguous free block of size ${requestSize}KB available. Consider compaction.`,
    };
  }

  let chosenIdx = -1;

  if (algorithm === 'first_fit') {
    chosenIdx = freeBlocks[0].idx;
  } else if (algorithm === 'best_fit') {
    freeBlocks.sort((a, b) => a.blk.size - b.blk.size);
    chosenIdx = freeBlocks[0].idx;
  } else if (algorithm === 'worst_fit') {
    freeBlocks.sort((a, b) => b.blk.size - a.blk.size);
    chosenIdx = freeBlocks[0].idx;
  }

  const target = blocks[chosenIdx];
  const newBlocks = [...blocks];

  const allocatedBlock: MemoryBlock = {
    id: `blk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
    start: target.start,
    size: requestSize,
    isAllocated: true,
    processName,
    color,
  };

  const remainderSize = target.size - requestSize;
  if (remainderSize > 0) {
    const remainderBlock: MemoryBlock = {
      id: `blk-free-${Date.now().toString(36)}`,
      start: target.start + requestSize,
      size: remainderSize,
      isAllocated: false,
    };
    newBlocks.splice(chosenIdx, 1, allocatedBlock, remainderBlock);
  } else {
    newBlocks.splice(chosenIdx, 1, allocatedBlock);
  }

  return { success: true, blocks: mergeAdjacentFree(newBlocks) };
}

export function freeMemory(blocks: MemoryBlock[], blockId: string): MemoryBlock[] {
  const newBlocks = blocks.map((blk) => {
    if (blk.id === blockId && blk.id !== 'blk-os') {
      return {
        ...blk,
        isAllocated: false,
        processName: undefined,
        color: undefined,
      };
    }
    return blk;
  });

  return mergeAdjacentFree(newBlocks);
}

export function compactMemory(blocks: MemoryBlock[], totalSize: number = 1024): MemoryBlock[] {
  const allocated = blocks.filter((b) => b.isAllocated);
  const newBlocks: MemoryBlock[] = [];
  let currentStart = 0;

  allocated.forEach((blk) => {
    newBlocks.push({
      ...blk,
      start: currentStart,
    });
    currentStart += blk.size;
  });

  const remainingFree = totalSize - currentStart;
  if (remainingFree > 0) {
    newBlocks.push({
      id: `blk-compact-free-${Date.now()}`,
      start: currentStart,
      size: remainingFree,
      isAllocated: false,
    });
  }

  return newBlocks;
}

function mergeAdjacentFree(blocks: MemoryBlock[]): MemoryBlock[] {
  const result: MemoryBlock[] = [];
  let current: MemoryBlock | null = null;

  for (const blk of blocks) {
    if (!current) {
      current = { ...blk };
      continue;
    }

    if (!current.isAllocated && !blk.isAllocated) {
      current.size += blk.size;
    } else {
      result.push(current);
      current = { ...blk };
    }
  }

  if (current) {
    result.push(current);
  }

  return result;
}

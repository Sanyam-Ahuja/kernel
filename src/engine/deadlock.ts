import { BankersState, SafetyResult } from '../types';

export function createDefaultBankersState(): BankersState {
  const processNames = ['P0', 'P1', 'P2', 'P3', 'P4'];
  const resourceNames = ['A', 'B', 'C'];
  const available = [3, 3, 2];

  const max = [
    [7, 5, 3],
    [3, 2, 2],
    [9, 0, 2],
    [2, 2, 2],
    [4, 3, 3],
  ];

  const allocation = [
    [0, 1, 0],
    [2, 0, 0],
    [3, 0, 2],
    [2, 1, 1],
    [0, 0, 2],
  ];

  const need = max.map((row, i) =>
    row.map((val, j) => val - allocation[i][j])
  );

  return {
    available,
    max,
    allocation,
    need,
    processNames,
    resourceNames,
  };
}

export function checkSafety(state: BankersState): SafetyResult {
  const n = state.processNames.length;
  const m = state.resourceNames.length;

  const work = [...state.available];
  const finish = Array(n).fill(false);
  const safeSequence: string[] = [];
  const steps: string[] = [];

  steps.push(`Initial Available vector: [${work.join(', ')}]`);

  let count = 0;
  while (count < n) {
    let found = false;

    for (let i = 0; i < n; i++) {
      if (!finish[i]) {
        // Check if Need[i] <= Work
        let canAllocate = true;
        for (let j = 0; j < m; j++) {
          if (state.need[i][j] > work[j]) {
            canAllocate = false;
            break;
          }
        }

        if (canAllocate) {
          // Process can complete
          steps.push(
            `Checking ${state.processNames[i]}: Need [${state.need[i].join(', ')}] <= Work [${work.join(', ')}] -> Satisfied.`
          );

          for (let j = 0; j < m; j++) {
            work[j] += state.allocation[i][j];
          }

          steps.push(
            `${state.processNames[i]} finished. Reclaiming allocation [${state.allocation[i].join(', ')}]. New Work: [${work.join(', ')}]`
          );

          finish[i] = true;
          safeSequence.push(state.processNames[i]);
          found = true;
          count++;
        }
      }
    }

    if (!found) {
      const unfinished = state.processNames.filter((_, idx) => !finish[idx]);
      steps.push(
        `DEADLOCK DETECTED! Unable to allocate resources for remaining processes: ${unfinished.join(', ')}. System in UNSAFE state.`
      );
      return { isSafe: false, steps };
    }
  }

  steps.push(`System is in a SAFE state! Valid execution sequence: < ${safeSequence.join(' -> ')} >`);
  return { isSafe: true, safeSequence, steps };
}

export function requestResources(
  state: BankersState,
  processIndex: number,
  request: number[]
): { success: boolean; newState?: BankersState; message: string } {
  const m = state.resourceNames.length;

  // 1. Verify Request <= Need
  for (let j = 0; j < m; j++) {
    if (request[j] > state.need[processIndex][j]) {
      return {
        success: false,
        message: `Error: Process ${state.processNames[processIndex]} exceeded its declared maximum claim (Request > Need).`,
      };
    }
  }

  // 2. Verify Request <= Available
  for (let j = 0; j < m; j++) {
    if (request[j] > state.available[j]) {
      return {
        success: false,
        message: `Wait: Insufficient resources available for Process ${state.processNames[processIndex]} (Request > Available).`,
      };
    }
  }

  // 3. Pretend to allocate
  const newAvailable = [...state.available];
  const newAllocation = state.allocation.map((row) => [...row]);
  const newNeed = state.need.map((row) => [...row]);

  for (let j = 0; j < m; j++) {
    newAvailable[j] -= request[j];
    newAllocation[processIndex][j] += request[j];
    newNeed[processIndex][j] -= request[j];
  }

  const hypotheticalState: BankersState = {
    ...state,
    available: newAvailable,
    allocation: newAllocation,
    need: newNeed,
  };

  const safety = checkSafety(hypotheticalState);
  if (!safety.isSafe) {
    return {
      success: false,
      message: `Request Denied: Granting request to ${state.processNames[processIndex]} would cause an UNSAFE state / potential deadlock.`,
    };
  }

  return {
    success: true,
    newState: hypotheticalState,
    message: `Request Granted: System remains in SAFE sequence < ${safety.safeSequence?.join(' -> ')} >.`,
  };
}

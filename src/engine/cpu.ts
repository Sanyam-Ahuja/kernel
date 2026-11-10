import { ProcessInput, SchedulingResult, GanttSegment, ProcessMetrics, CpuAlgorithm } from '../types';

export function runCpuScheduler(
  processes: ProcessInput[],
  algorithm: CpuAlgorithm,
  quantum: number = 2
): SchedulingResult {
  if (processes.length === 0) {
    return {
      timeline: [],
      metrics: [],
      avgTurnaround: 0,
      avgWaiting: 0,
      avgResponse: 0,
      cpuUtilization: 0,
      totalTime: 0,
    };
  }

  switch (algorithm) {
    case 'fcfs':
      return scheduleFCFS(processes);
    case 'sjf':
      return scheduleSJF(processes);
    case 'srtf':
      return scheduleSRTF(processes);
    case 'round_robin':
      return scheduleRR(processes, quantum);
    case 'priority_np':
      return schedulePriorityNP(processes);
    case 'priority_p':
      return schedulePriorityP(processes);
  }
}

function scheduleFCFS(procs: ProcessInput[]): SchedulingResult {
  const sorted = [...procs].sort((a, b) => a.arrivalTime - b.arrivalTime);
  const timeline: GanttSegment[] = [];
  const metrics: ProcessMetrics[] = [];

  let currentTime = 0;

  sorted.forEach((p) => {
    if (currentTime < p.arrivalTime) {
      timeline.push({
        processId: 'IDLE',
        processName: 'IDLE',
        start: currentTime,
        end: p.arrivalTime,
        color: '#1e293b',
      });
      currentTime = p.arrivalTime;
    }

    const start = currentTime;
    const end = start + p.burstTime;
    currentTime = end;

    timeline.push({
      processId: p.id,
      processName: p.name,
      start,
      end,
      color: p.color,
    });

    const completionTime = end;
    const turnaroundTime = completionTime - p.arrivalTime;
    const waitingTime = turnaroundTime - p.burstTime;
    const responseTime = start - p.arrivalTime;

    metrics.push({
      ...p,
      completionTime,
      turnaroundTime,
      waitingTime,
      responseTime,
    });
  });

  return computeAggregate(timeline, metrics);
}

function scheduleSJF(procs: ProcessInput[]): SchedulingResult {
  const remaining = [...procs];
  const timeline: GanttSegment[] = [];
  const metrics: ProcessMetrics[] = [];
  let currentTime = 0;

  while (remaining.length > 0) {
    const available = remaining.filter((p) => p.arrivalTime <= currentTime);

    if (available.length === 0) {
      const nextArrival = Math.min(...remaining.map((p) => p.arrivalTime));
      timeline.push({
        processId: 'IDLE',
        processName: 'IDLE',
        start: currentTime,
        end: nextArrival,
        color: '#1e293b',
      });
      currentTime = nextArrival;
      continue;
    }

    // Pick shortest burst time
    available.sort((a, b) => a.burstTime - b.burstTime);
    const chosen = available[0];

    const start = currentTime;
    const end = start + chosen.burstTime;
    currentTime = end;

    timeline.push({
      processId: chosen.id,
      processName: chosen.name,
      start,
      end,
      color: chosen.color,
    });

    const completionTime = end;
    const turnaroundTime = completionTime - chosen.arrivalTime;
    const waitingTime = turnaroundTime - chosen.burstTime;
    const responseTime = start - chosen.arrivalTime;

    metrics.push({
      ...chosen,
      completionTime,
      turnaroundTime,
      waitingTime,
      responseTime,
    });

    remaining.splice(remaining.findIndex((p) => p.id === chosen.id), 1);
  }

  return computeAggregate(timeline, metrics);
}

function scheduleSRTF(procs: ProcessInput[]): SchedulingResult {
  const remBurst = new Map<string, number>();
  const firstResponse = new Map<string, number>();
  const completion = new Map<string, number>();

  procs.forEach((p) => remBurst.set(p.id, p.burstTime));

  const timeline: GanttSegment[] = [];
  let currentTime = 0;
  let finishedCount = 0;
  const n = procs.length;

  while (finishedCount < n) {
    const available = procs.filter(
      (p) => p.arrivalTime <= currentTime && (remBurst.get(p.id) || 0) > 0
    );

    if (available.length === 0) {
      const unarrived = procs.filter((p) => (remBurst.get(p.id) || 0) > 0);
      const nextArrival = Math.min(...unarrived.map((p) => p.arrivalTime));
      addOrExtendTimeline(timeline, 'IDLE', 'IDLE', currentTime, nextArrival, '#1e293b');
      currentTime = nextArrival;
      continue;
    }

    available.sort((a, b) => (remBurst.get(a.id) || 0) - (remBurst.get(b.id) || 0));
    const currentProc = available[0];

    if (!firstResponse.has(currentProc.id)) {
      firstResponse.set(currentProc.id, currentTime);
    }

    // Step 1 unit of time
    const start = currentTime;
    const end = currentTime + 1;
    currentTime = end;

    addOrExtendTimeline(timeline, currentProc.id, currentProc.name, start, end, currentProc.color);

    const left = (remBurst.get(currentProc.id) || 0) - 1;
    remBurst.set(currentProc.id, left);

    if (left === 0) {
      completion.set(currentProc.id, currentTime);
      finishedCount++;
    }
  }

  const metrics: ProcessMetrics[] = procs.map((p) => {
    const completionTime = completion.get(p.id) || p.burstTime;
    const turnaroundTime = completionTime - p.arrivalTime;
    const waitingTime = turnaroundTime - p.burstTime;
    const responseTime = (firstResponse.get(p.id) ?? p.arrivalTime) - p.arrivalTime;
    return {
      ...p,
      completionTime,
      turnaroundTime,
      waitingTime,
      responseTime,
    };
  });

  return computeAggregate(timeline, metrics);
}

function scheduleRR(procs: ProcessInput[], quantum: number): SchedulingResult {
  const remBurst = new Map<string, number>();
  const firstResponse = new Map<string, number>();
  const completion = new Map<string, number>();

  procs.forEach((p) => remBurst.set(p.id, p.burstTime));

  const timeline: GanttSegment[] = [];
  const sorted = [...procs].sort((a, b) => a.arrivalTime - b.arrivalTime);
  const queue: ProcessInput[] = [];
  const inQueue = new Set<string>();

  let currentTime = 0;
  let procsIdx = 0;

  // Add initially arrived processes
  while (procsIdx < sorted.length && sorted[procsIdx].arrivalTime <= currentTime) {
    queue.push(sorted[procsIdx]);
    inQueue.add(sorted[procsIdx].id);
    procsIdx++;
  }

  let finishedCount = 0;
  const n = procs.length;

  while (finishedCount < n) {
    if (queue.length === 0) {
      if (procsIdx < sorted.length) {
        const nextArrival = sorted[procsIdx].arrivalTime;
        addOrExtendTimeline(timeline, 'IDLE', 'IDLE', currentTime, nextArrival, '#1e293b');
        currentTime = nextArrival;
        while (procsIdx < sorted.length && sorted[procsIdx].arrivalTime <= currentTime) {
          queue.push(sorted[procsIdx]);
          inQueue.add(sorted[procsIdx].id);
          procsIdx++;
        }
      }
      continue;
    }

    const current = queue.shift()!;
    inQueue.delete(current.id);

    if (!firstResponse.has(current.id)) {
      firstResponse.set(current.id, currentTime);
    }

    const currentRem = remBurst.get(current.id) || 0;
    const execTime = Math.min(quantum, currentRem);
    const start = currentTime;
    const end = currentTime + execTime;
    currentTime = end;

    addOrExtendTimeline(timeline, current.id, current.name, start, end, current.color);
    const remaining = currentRem - execTime;
    remBurst.set(current.id, remaining);

    // Check newly arrived while executing
    while (procsIdx < sorted.length && sorted[procsIdx].arrivalTime <= currentTime) {
      if (!inQueue.has(sorted[procsIdx].id) && (remBurst.get(sorted[procsIdx].id) || 0) > 0) {
        queue.push(sorted[procsIdx]);
        inQueue.add(sorted[procsIdx].id);
      }
      procsIdx++;
    }

    if (remaining > 0) {
      queue.push(current);
      inQueue.add(current.id);
    } else {
      completion.set(current.id, currentTime);
      finishedCount++;
    }
  }

  const metrics: ProcessMetrics[] = procs.map((p) => {
    const completionTime = completion.get(p.id) || p.burstTime;
    const turnaroundTime = completionTime - p.arrivalTime;
    const waitingTime = turnaroundTime - p.burstTime;
    const responseTime = (firstResponse.get(p.id) ?? p.arrivalTime) - p.arrivalTime;
    return {
      ...p,
      completionTime,
      turnaroundTime,
      waitingTime,
      responseTime,
    };
  });

  return computeAggregate(timeline, metrics);
}

function schedulePriorityNP(procs: ProcessInput[]): SchedulingResult {
  const remaining = [...procs];
  const timeline: GanttSegment[] = [];
  const metrics: ProcessMetrics[] = [];
  let currentTime = 0;

  while (remaining.length > 0) {
    const available = remaining.filter((p) => p.arrivalTime <= currentTime);

    if (available.length === 0) {
      const nextArrival = Math.min(...remaining.map((p) => p.arrivalTime));
      timeline.push({
        processId: 'IDLE',
        processName: 'IDLE',
        start: currentTime,
        end: nextArrival,
        color: '#1e293b',
      });
      currentTime = nextArrival;
      continue;
    }

    // Lower number = higher priority
    available.sort((a, b) => a.priority - b.priority);
    const chosen = available[0];

    const start = currentTime;
    const end = start + chosen.burstTime;
    currentTime = end;

    timeline.push({
      processId: chosen.id,
      processName: chosen.name,
      start,
      end,
      color: chosen.color,
    });

    const completionTime = end;
    const turnaroundTime = completionTime - chosen.arrivalTime;
    const waitingTime = turnaroundTime - chosen.burstTime;
    const responseTime = start - chosen.arrivalTime;

    metrics.push({
      ...chosen,
      completionTime,
      turnaroundTime,
      waitingTime,
      responseTime,
    });

    remaining.splice(remaining.findIndex((p) => p.id === chosen.id), 1);
  }

  return computeAggregate(timeline, metrics);
}

function schedulePriorityP(procs: ProcessInput[]): SchedulingResult {
  const remBurst = new Map<string, number>();
  const firstResponse = new Map<string, number>();
  const completion = new Map<string, number>();

  procs.forEach((p) => remBurst.set(p.id, p.burstTime));

  const timeline: GanttSegment[] = [];
  let currentTime = 0;
  let finishedCount = 0;
  const n = procs.length;

  while (finishedCount < n) {
    const available = procs.filter(
      (p) => p.arrivalTime <= currentTime && (remBurst.get(p.id) || 0) > 0
    );

    if (available.length === 0) {
      const unarrived = procs.filter((p) => (remBurst.get(p.id) || 0) > 0);
      const nextArrival = Math.min(...unarrived.map((p) => p.arrivalTime));
      addOrExtendTimeline(timeline, 'IDLE', 'IDLE', currentTime, nextArrival, '#1e293b');
      currentTime = nextArrival;
      continue;
    }

    available.sort((a, b) => a.priority - b.priority);
    const currentProc = available[0];

    if (!firstResponse.has(currentProc.id)) {
      firstResponse.set(currentProc.id, currentTime);
    }

    const start = currentTime;
    const end = currentTime + 1;
    currentTime = end;

    addOrExtendTimeline(timeline, currentProc.id, currentProc.name, start, end, currentProc.color);

    const left = (remBurst.get(currentProc.id) || 0) - 1;
    remBurst.set(currentProc.id, left);

    if (left === 0) {
      completion.set(currentProc.id, currentTime);
      finishedCount++;
    }
  }

  const metrics: ProcessMetrics[] = procs.map((p) => {
    const completionTime = completion.get(p.id) || p.burstTime;
    const turnaroundTime = completionTime - p.arrivalTime;
    const waitingTime = turnaroundTime - p.burstTime;
    const responseTime = (firstResponse.get(p.id) ?? p.arrivalTime) - p.arrivalTime;
    return {
      ...p,
      completionTime,
      turnaroundTime,
      waitingTime,
      responseTime,
    };
  });

  return computeAggregate(timeline, metrics);
}

function addOrExtendTimeline(
  timeline: GanttSegment[],
  processId: string,
  processName: string,
  start: number,
  end: number,
  color: string
) {
  if (timeline.length > 0) {
    const last = timeline[timeline.length - 1];
    if (last.processId === processId && last.end === start) {
      last.end = end;
      return;
    }
  }
  timeline.push({ processId, processName, start, end, color });
}

function computeAggregate(timeline: GanttSegment[], metrics: ProcessMetrics[]): SchedulingResult {
  const totalTurnaround = metrics.reduce((acc, m) => acc + m.turnaroundTime, 0);
  const totalWaiting = metrics.reduce((acc, m) => acc + m.waitingTime, 0);
  const totalResponse = metrics.reduce((acc, m) => acc + m.responseTime, 0);
  const totalTime = timeline.length > 0 ? timeline[timeline.length - 1].end : 0;

  const busyTime = timeline
    .filter((s) => s.processId !== 'IDLE')
    .reduce((acc, s) => acc + (s.end - s.start), 0);

  const cpuUtilization = totalTime > 0 ? parseFloat(((busyTime / totalTime) * 100).toFixed(1)) : 100;

  return {
    timeline,
    metrics,
    avgTurnaround: parseFloat((totalTurnaround / (metrics.length || 1)).toFixed(2)),
    avgWaiting: parseFloat((totalWaiting / (metrics.length || 1)).toFixed(2)),
    avgResponse: parseFloat((totalResponse / (metrics.length || 1)).toFixed(2)),
    cpuUtilization,
    totalTime,
  };
}

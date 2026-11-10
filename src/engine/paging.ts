import { PageAlgorithm, PagingResult, PageStep } from '../types';

export function runPageReplacement(
  pages: number[],
  frameCount: number,
  algorithm: PageAlgorithm
): PagingResult {
  if (pages.length === 0 || frameCount <= 0) {
    return { steps: [], faultCount: 0, hitCount: 0, faultRate: 0 };
  }

  switch (algorithm) {
    case 'fifo':
      return runFIFO(pages, frameCount);
    case 'lru':
      return runLRU(pages, frameCount);
    case 'optimal':
      return runOptimal(pages, frameCount);
  }
}

function runFIFO(pages: number[], frameCount: number): PagingResult {
  const frames: (number | null)[] = Array(frameCount).fill(null);
  const fifoQueue: number[] = [];
  const steps: PageStep[] = [];
  let faultCount = 0;
  let hitCount = 0;

  pages.forEach((page) => {
    if (frames.includes(page)) {
      hitCount++;
      steps.push({ page, frames: [...frames], isFault: false });
    } else {
      faultCount++;
      const emptyIdx = frames.indexOf(null);
      if (emptyIdx !== -1) {
        frames[emptyIdx] = page;
        fifoQueue.push(page);
      } else {
        const victim = fifoQueue.shift()!;
        const victimIdx = frames.indexOf(victim);
        frames[victimIdx] = page;
        fifoQueue.push(page);
      }
      steps.push({ page, frames: [...frames], isFault: true });
    }
  });

  const faultRate = parseFloat(((faultCount / pages.length) * 100).toFixed(1));
  return { steps, faultCount, hitCount, faultRate };
}

function runLRU(pages: number[], frameCount: number): PagingResult {
  const frames: (number | null)[] = Array(frameCount).fill(null);
  const lastUsed = new Map<number, number>();
  const steps: PageStep[] = [];
  let faultCount = 0;
  let hitCount = 0;

  pages.forEach((page, timeIdx) => {
    lastUsed.set(page, timeIdx);

    if (frames.includes(page)) {
      hitCount++;
      steps.push({ page, frames: [...frames], isFault: false });
    } else {
      faultCount++;
      const emptyIdx = frames.indexOf(null);
      if (emptyIdx !== -1) {
        frames[emptyIdx] = page;
      } else {
        // Find LRU page
        let lruPage = frames[0]!;
        let minTime = lastUsed.get(lruPage) ?? 0;

        frames.forEach((f) => {
          if (f !== null) {
            const t = lastUsed.get(f) ?? 0;
            if (t < minTime) {
              minTime = t;
              lruPage = f;
            }
          }
        });

        const victimIdx = frames.indexOf(lruPage);
        frames[victimIdx] = page;
      }
      steps.push({ page, frames: [...frames], isFault: true });
    }
  });

  const faultRate = parseFloat(((faultCount / pages.length) * 100).toFixed(1));
  return { steps, faultCount, hitCount, faultRate };
}

function runOptimal(pages: number[], frameCount: number): PagingResult {
  const frames: (number | null)[] = Array(frameCount).fill(null);
  const steps: PageStep[] = [];
  let faultCount = 0;
  let hitCount = 0;

  pages.forEach((page, currentIdx) => {
    if (frames.includes(page)) {
      hitCount++;
      steps.push({ page, frames: [...frames], isFault: false });
    } else {
      faultCount++;
      const emptyIdx = frames.indexOf(null);
      if (emptyIdx !== -1) {
        frames[emptyIdx] = page;
      } else {
        // Find page not used for longest time in future
        let farthestIdx = -1;
        let victimPage = frames[0]!;

        for (const f of frames) {
          if (f === null) continue;
          let nextUse = -1;
          for (let k = currentIdx + 1; k < pages.length; k++) {
            if (pages[k] === f) {
              nextUse = k;
              break;
            }
          }

          if (nextUse === -1) {
            victimPage = f;
            break;
          } else if (nextUse > farthestIdx) {
            farthestIdx = nextUse;
            victimPage = f;
          }
        }

        const victimIdx = frames.indexOf(victimPage);
        frames[victimIdx] = page;
      }
      steps.push({ page, frames: [...frames], isFault: true });
    }
  });

  const faultRate = parseFloat(((faultCount / pages.length) * 100).toFixed(1));
  return { steps, faultCount, hitCount, faultRate };
}

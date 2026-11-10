import React, { useState } from 'react';
import { useKernelStore } from '../../store/useKernelStore';
import { PageAlgorithm } from '../../types';
import { Stat, Win } from '../acme/Win';

const ALGOS: { id: PageAlgorithm; word: string; long: string }[] = [
  { id: 'fifo', word: 'FIFO', long: 'evict the oldest page' },
  { id: 'lru', word: 'LRU', long: 'evict the least recently used page' },
  { id: 'optimal', word: 'OPT', long: 'evict the page used furthest in the future' },
];
const PRESETS = [
  { word: 'Belady', ref: '1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5' },
  { word: 'Textbook', ref: '7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1' },
  { word: 'Locality', ref: '1, 1, 2, 2, 3, 1, 2, 1, 4, 4, 1, 2' },
];

export const PagingLab: React.FC = () => {
  const { pageReference, pageFrames, pageAlgorithm, pagingResult, setPageAlgorithm, setPageFrames, setPageReferenceString } = useKernelStore();
  const [str, setStr] = useState(pageReference.join(', '));
  const load = (s: string) => { setStr(s); setPageReferenceString(s); };

  return (
    <div className="flex flex-col gap-1.5 sm:gap-2">
      <Win
        name="/sys/vm/refs"
        cmds={[...PRESETS.map((p) => ({ label: p.word, onClick: () => load(p.ref), title: p.ref }))]}
        dirty={str !== pageReference.join(', ')}
        thumb={100}
      >
        <form onSubmit={(e) => { e.preventDefault(); setPageReferenceString(str); }} className="flex flex-col sm:flex-row gap-2 font-mono text-[14px]">
          <input className="in flex-1" value={str} onChange={(e) => setStr(e.target.value)} aria-label="Reference string" placeholder="7, 0, 1, 2, 0, 3" />
          <label className="flex items-center gap-2">frames
            <input type="number" min={2} max={6} className="in w-14" value={pageFrames} onChange={(e) => setPageFrames(Math.max(2, Math.min(6, parseInt(e.target.value, 10) || 3)))} />
          </label>
          <button className="btn btn-go">Put</button>
        </form>
      </Win>

      <div className="grid xl:grid-cols-[1fr_320px] gap-1.5 sm:gap-2">
        <Win
          name="/sys/vm/frames"
          cmds={ALGOS.map((a) => ({ label: a.word, onClick: () => setPageAlgorithm(a.id), pressed: a.id === pageAlgorithm, title: a.long }))}
          aside={ALGOS.find((a) => a.id === pageAlgorithm)!.long}
          thumb={65}
          bodyClassName="overflow-x-auto"
        >
          <table className="font-mono text-[14px] border-collapse">
            <thead>
              <tr>
                <th className="text-left pr-3 font-semibold text-faded">ref</th>
                {pagingResult.steps.map((s, i) => <th key={i} className="w-9 text-center font-semibold border-b border-black">{s.page}</th>)}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: pageFrames }).map((_, f) => (
                <tr key={f}>
                  <td className="pr-3 text-faded">f{f}</td>
                  {pagingResult.steps.map((s, i) => {
                    const v = s.frames[f];
                    const fresh = s.isFault && v === s.page;
                    return (
                      <td key={i} className={`w-9 h-8 text-center border border-black/25 ${fresh ? 'bg-[#cf7a6b] font-semibold' : v !== null ? 'bg-white' : ''}`}>
                        {v ?? <span className="text-faded/50">·</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr>
                <td className="pr-3 text-faded pt-1">res</td>
                {pagingResult.steps.map((s, i) => (
                  <td key={i} className={`text-center pt-1 font-semibold ${s.isFault ? 'text-err' : 'text-ok'}`}>{s.isFault ? 'F' : 'h'}</td>
                ))}
              </tr>
            </tbody>
          </table>
          <p className="text-[13px] text-faded mt-3 font-sans">Shaded cell: the page just loaded on a fault. Try Belady with FIFO at 3 and then 4 frames. More frames, more faults.</p>
        </Win>

        <Win name="/sys/vm/stat" thumb={100} className="self-start">
          <Stat rows={[
            ['faults', pagingResult.faultCount],
            ['hits', pagingResult.hitCount],
            ['fault rate', `${pagingResult.faultRate}%`],
            ['refs', pageReference.length],
            ['frames', pageFrames],
          ]} />
          <div className="flex h-3 border border-black mt-3" aria-hidden>
            <span className="bg-[#cf7a6b]" style={{ width: `${pagingResult.faultRate}%` }} />
            <span className="bg-[#9cb860] flex-1" />
          </div>
        </Win>
      </div>
    </div>
  );
};

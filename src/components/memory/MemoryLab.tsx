import React, { useState } from 'react';
import { useKernelStore } from '../../store/useKernelStore';
import { MemoryAlgorithm } from '../../types';
import { Stat, Win } from '../acme/Win';

const ALGOS: { id: MemoryAlgorithm; word: string; long: string }[] = [
  { id: 'first_fit', word: 'FirstFit', long: 'first hole large enough' },
  { id: 'best_fit', word: 'BestFit', long: 'smallest hole large enough' },
  { id: 'worst_fit', word: 'WorstFit', long: 'largest hole' },
];
const hex = (n: number) => '0x' + n.toString(16).padStart(4, '0');

export const MemoryLab: React.FC = () => {
  const { memoryBlocks, memoryAlgorithm, memoryError, setMemoryAlgorithm, allocateMem, freeMem, compactMem, resetMem } = useKernelStore();
  const [proc, setProc] = useState('');
  const [size, setSize] = useState(128);
  const TOTAL = 1024;
  const used = memoryBlocks.filter((b) => b.isAllocated).reduce((a, b) => a + b.size, 0);
  const holes = memoryBlocks.filter((b) => !b.isAllocated);
  const maxHole = holes.length ? Math.max(...holes.map((b) => b.size)) : 0;
  const frag = TOTAL - used > maxHole ? TOTAL - used - maxHole : 0;

  const alloc = (e: React.FormEvent) => {
    e.preventDefault();
    allocateMem(proc.trim() || `proc_${Math.floor(10 + Math.random() * 90)}`, size);
    setProc('');
  };

  return (
    <div className="grid xl:grid-cols-[1fr_420px] gap-1.5 sm:gap-2">
      <div className="flex flex-col gap-1.5 sm:gap-2 min-w-0">
        <Win
          name="/dev/mem"
          cmds={[
            ...ALGOS.map((a) => ({ label: a.word, onClick: () => setMemoryAlgorithm(a.id), pressed: a.id === memoryAlgorithm, title: a.long })),
            { label: 'Compact', onClick: compactMem, title: 'slide every block down, merge holes' },
            { label: 'Reset', onClick: resetMem },
          ]}
          aside="1024 KB"
          dirty={!!memoryError}
          thumb={60}
        >
          {/* address space drawn vertically on wide screens: low addresses at top, like a memory map in a manual */}
          <div className="flex border border-black h-24 bg-white">
            {memoryBlocks.map((b) => (
              <div key={b.id} className="h-full border-r border-black last:border-r-0 relative group overflow-hidden"
                style={{ width: `${(b.size / TOTAL) * 100}%`, background: b.isAllocated ? b.color || '#8888cc' : 'repeating-linear-gradient(135deg, #ffffea 0 5px, #e6e6c4 5px 6px)' }}
                title={`${b.isAllocated ? b.processName : 'hole'} · ${b.size} KB @ ${hex(b.start)}`}>
                <div className="p-1 font-mono text-[11.5px] leading-tight">
                  <div className="truncate font-semibold">{b.isAllocated ? b.processName : 'hole'}</div>
                  <div className="truncate">{b.size}K</div>
                </div>
                {b.isAllocated && b.id !== 'blk-os' && (
                  <button onClick={() => freeMem(b.id)} className="absolute bottom-0.5 left-1 font-mono text-[11px] underline opacity-0 group-hover:opacity-100 focus:opacity-100">free</button>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between font-mono text-[11.5px] text-faded mt-1"><span>0x0000</span><span>0x0200</span><span>0x0400</span></div>
          {memoryError && <p className="mt-3 font-mono text-[14px] text-err">malloc: {memoryError}</p>}
          <div className="mt-4">
            <Stat rows={[
              ['in use', `${used} KB`, `${Math.round((used / TOTAL) * 100)}%`],
              ['free', `${TOTAL - used} KB`, `${holes.length} hole${holes.length === 1 ? '' : 's'}`],
              ['largest hole', `${maxHole} KB`, 'the biggest request that can succeed'],
              ['external frag', `${frag} KB`, frag ? 'free but unusable in one piece. try Compact' : 'none'],
            ]} />
          </div>
        </Win>

        <Win name="/dev/mem/map" thumb={70} bodyClassName="overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>owner</th><th>start</th><th>end</th><th>size</th><th /></tr></thead>
            <tbody>
              {memoryBlocks.map((b) => (
                <tr key={b.id} className={b.isAllocated ? '' : 'text-faded'}>
                  <td>{b.isAllocated ? <><span className="inline-block w-2.5 h-2.5 border border-black mr-1.5 align-middle" style={{ background: b.color || '#8888cc' }} />{b.processName}</> : '— hole —'}</td>
                  <td>{hex(b.start)}</td><td>{hex(b.start + b.size)}</td><td>{b.size} KB</td>
                  <td>{b.isAllocated && b.id !== 'blk-os' && <button className="cmd text-err" onClick={() => freeMem(b.id)}>Free</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Win>
      </div>

      <Win name="/dev/mem/malloc" dirty={proc.length > 0} thumb={100} className="self-start">
        <form onSubmit={alloc} className="space-y-2 font-mono text-[14px]">
          <label className="flex items-center gap-2">name <input className="in flex-1" value={proc} onChange={(e) => setProc(e.target.value)} placeholder="clang" /></label>
          <label className="flex items-center gap-2">size <input type="number" min={16} max={512} step={16} className="in w-24" value={size} onChange={(e) => setSize(parseInt(e.target.value, 10) || 16)} /> KB</label>
          <div className="flex flex-wrap gap-1">
            {[32, 64, 128, 256].map((s) => <button type="button" key={s} className="cmd border border-black/30" aria-pressed={size === s} onClick={() => setSize(s)}>{s}K</button>)}
          </div>
          <button className="btn btn-go w-full">malloc({size}K) with {ALGOS.find((a) => a.id === memoryAlgorithm)!.word}</button>
        </form>
        <p className="text-[13px] text-faded mt-3">Allocate a few, free one in the middle, then ask for something just bigger than any hole. That gap is external fragmentation.</p>
      </Win>
    </div>
  );
};

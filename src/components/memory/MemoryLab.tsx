import React, { useState } from 'react';
import { useKernelStore } from '../../store/useKernelStore';
import { MemoryAlgorithm } from '../../types';
import { HardDrive, Plus, Trash2, Combine, AlertOctagon, RotateCcw } from 'lucide-react';

export const MemoryLab: React.FC = () => {
  const {
    memoryBlocks,
    memoryAlgorithm,
    memoryError,
    setMemoryAlgorithm,
    allocateMem,
    freeMem,
    compactMem,
    resetMem,
  } = useKernelStore();

  const [procName, setProcName] = useState('');
  const [size, setSize] = useState(128);

  const totalSize = 1024;
  const allocatedSize = memoryBlocks
    .filter((b) => b.isAllocated)
    .reduce((acc, b) => acc + b.size, 0);
  const freeSize = totalSize - allocatedSize;

  const freeBlocks = memoryBlocks.filter((b) => !b.isAllocated);
  const maxContiguousFree = freeBlocks.length > 0 ? Math.max(...freeBlocks.map((b) => b.size)) : 0;
  const externalFragmentation = freeSize > maxContiguousFree ? freeSize - maxContiguousFree : 0;

  const handleAllocate = (e: React.FormEvent) => {
    e.preventDefault();
    const name = procName.trim() || `proc_${Math.floor(10 + Math.random() * 90)}`;
    allocateMem(name, size);
    setProcName('');
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="bg-[#0b101b] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 font-bold mb-1">
            <HardDrive className="w-5 h-5" />
            <h3 className="text-white text-base">Contiguous Memory Allocation & Fragmentation Lab</h3>
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Simulate dynamic memory partition allocation (First Fit, Best Fit, Worst Fit) and observe external fragmentation holes.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={memoryAlgorithm}
            onChange={(e) => setMemoryAlgorithm(e.target.value as MemoryAlgorithm)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
          >
            <option value="first_fit">First-Fit (First sufficient hole)</option>
            <option value="best_fit">Best-Fit (Smallest sufficient hole)</option>
            <option value="worst_fit">Worst-Fit (Largest available hole)</option>
          </select>

          <button
            onClick={compactMem}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-lg shadow-indigo-950/40"
            title="Compact Memory to eliminate external fragmentation"
          >
            <Combine className="w-3.5 h-3.5" />
            <span>Compact Heap</span>
          </button>
        </div>
      </div>

      {/* Heap Memory Map */}
      <div className="bg-[#0b101b] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Physical Memory Address Space [0x0000 - 0x0400] (1024 KB Total)
          </h4>
          <button
            onClick={resetMem}
            className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Heap</span>
          </button>
        </div>

        {/* Visual Memory Blocks Strip */}
        <div className="flex h-20 w-full rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
          {memoryBlocks.map((blk) => {
            const widthPct = (blk.size / totalSize) * 100;
            return (
              <div
                key={blk.id}
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: blk.isAllocated ? (blk.color || '#3b82f6') : '#0f172a',
                }}
                className={`h-full border-r border-slate-900/60 p-2 flex flex-col justify-between text-left transition-all relative group select-none ${
                  !blk.isAllocated ? 'bg-gradient-to-b from-slate-900 to-slate-950' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-[10px] font-bold font-mono truncate max-w-full ${
                    blk.isAllocated ? 'text-slate-950' : 'text-slate-500'
                  }`}>
                    {blk.isAllocated ? blk.processName : 'FREE HOLE'}
                  </span>
                  {blk.isAllocated && blk.id !== 'blk-os' && (
                    <button
                      onClick={() => freeMem(blk.id)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded bg-black/40 text-white hover:text-rose-400"
                      title="Deallocate Block"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="flex justify-between items-end text-[9px] font-mono">
                  <span className={blk.isAllocated ? 'text-slate-900 font-semibold' : 'text-slate-500'}>
                    {blk.size} KB
                  </span>
                  <span className={blk.isAllocated ? 'text-slate-900/80' : 'text-slate-600'}>
                    0x{blk.start.toString(16).padStart(3, '0')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Heap Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-xs font-mono">
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase block">Allocated Memory</span>
            <span className="text-lg font-bold text-white">{allocatedSize} KB</span>
            <span className="text-[10px] text-cyan-400 block mt-0.5">{Math.round((allocatedSize / totalSize) * 100)}% Used</span>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase block">Total Free Memory</span>
            <span className="text-lg font-bold text-emerald-400">{freeSize} KB</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{freeBlocks.length} Free Holes</span>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase block">Max Contiguous Block</span>
            <span className="text-lg font-bold text-white">{maxContiguousFree} KB</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Largest allocatable</span>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase block">External Fragmentation</span>
            <span className="text-lg font-bold text-amber-400">{externalFragmentation} KB</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Scattered unallocatable</span>
          </div>
        </div>

        {memoryError && (
          <div className="p-3 bg-rose-950/40 border border-rose-500/50 rounded-xl text-xs text-rose-300 flex items-center space-x-2">
            <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{memoryError}</span>
          </div>
        )}
      </div>

      {/* Allocation Controller & Block Registry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allocation Form */}
        <div className="p-5 rounded-2xl bg-[#0b101b] border border-slate-800 shadow-xl space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Allocate Memory Partition</span>
          </h4>

          <form onSubmit={handleAllocate} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Process Name</label>
              <input
                type="text"
                value={procName}
                onChange={(e) => setProcName(e.target.value)}
                placeholder="e.g. clang_compiler"
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Requested Size (KB)</label>
              <input
                type="number"
                min={16}
                max={512}
                step={16}
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value, 10) || 16)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center space-x-1.5 transition-colors shadow-lg shadow-emerald-950/40 mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Allocate via {memoryAlgorithm.replace('_', ' ').toUpperCase()}</span>
            </button>
          </form>
        </div>

        {/* Allocated Partitions Table */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0b101b] border border-slate-800 shadow-xl space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Active Partitions & Free Memory Holes
          </h4>

          <div className="overflow-x-auto max-h-56">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400 font-mono">
                  <th className="py-2 px-2">Type / Process</th>
                  <th className="py-2 px-2">Start Address</th>
                  <th className="py-2 px-2">End Address</th>
                  <th className="py-2 px-2">Size</th>
                  <th className="py-2 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {memoryBlocks.map((blk) => (
                  <tr key={blk.id} className="hover:bg-slate-900/40">
                    <td className="py-2 px-2">
                      {blk.isAllocated ? (
                        <span className="font-bold flex items-center space-x-1.5">
                          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: blk.color || '#3b82f6' }} />
                          <span className="text-white">{blk.processName}</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">Free Hole</span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-slate-400">0x{blk.start.toString(16).padStart(4, '0')}</td>
                    <td className="py-2 px-2 text-slate-400">0x{(blk.start + blk.size).toString(16).padStart(4, '0')}</td>
                    <td className="py-2 px-2 font-bold text-slate-200">{blk.size} KB</td>
                    <td className="py-2 px-2 text-right">
                      {blk.isAllocated && blk.id !== 'blk-os' && (
                        <button
                          onClick={() => freeMem(blk.id)}
                          className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] hover:bg-rose-500/30"
                        >
                          Deallocate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

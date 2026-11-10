import React, { useState } from 'react';
import { useKernelStore } from '../../store/useKernelStore';
import { PageAlgorithm } from '../../types';
import { Layers, CheckCircle2, AlertOctagon, RotateCcw, Sliders } from 'lucide-react';

export const PagingLab: React.FC = () => {
  const {
    pageReference,
    pageFrames,
    pageAlgorithm,
    pagingResult,
    setPageAlgorithm,
    setPageFrames,
    setPageReferenceString,
  } = useKernelStore();

  const [inputStr, setInputStr] = useState(pageReference.join(', '));

  const handleUpdateString = (e: React.FormEvent) => {
    e.preventDefault();
    setPageReferenceString(inputStr);
  };

  const presets = [
    { label: 'Belady Anomaly Test', ref: '1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5' },
    { label: 'Standard Textbook Ref', ref: '7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1' },
    { label: 'High Locality Ref', ref: '1, 1, 2, 2, 3, 1, 2, 1, 4, 4, 1, 2' },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="bg-[#0b101b] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 font-bold mb-1">
            <Layers className="w-5 h-5" />
            <h3 className="text-white text-base">Virtual Memory Page Replacement Laboratory</h3>
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Inspect physical frame allocation, page faults, and cache eviction strategies (FIFO, LRU, Optimal).
          </p>
        </div>

        {/* Algorithm & Frame Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={pageAlgorithm}
            onChange={(e) => setPageAlgorithm(e.target.value as PageAlgorithm)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
          >
            <option value="fifo">FIFO (First-In, First-Out)</option>
            <option value="lru">LRU (Least Recently Used)</option>
            <option value="optimal">Optimal (Belady's Minimum)</option>
          </select>

          <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-mono">
            <span className="text-slate-400">Frames:</span>
            <input
              type="number"
              min={2}
              max={6}
              value={pageFrames}
              onChange={(e) => setPageFrames(Math.max(2, Math.min(6, parseInt(e.target.value, 10) || 3)))}
              className="w-10 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-center text-emerald-400 font-bold focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-[#0b101b] border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Page Fault Rate</span>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-0.5">{pagingResult.faultRate}%</div>
          <span className="text-[10px] text-slate-500 font-mono">Faults / Total References</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0b101b] border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Total Page Faults (Misses)</span>
          <div className="text-2xl font-bold font-mono text-white mt-0.5">{pagingResult.faultCount}</div>
          <span className="text-[10px] text-rose-400 font-mono">Evictions & Disk Reads</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0b101b] border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Total Page Hits</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">{pagingResult.hitCount}</div>
          <span className="text-[10px] text-emerald-400 font-mono">Resident Cache Hits</span>
        </div>
      </div>

      {/* Reference String Controller */}
      <div className="bg-[#0b101b] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Page Reference String ({pageReference.length} accesses)
          </h4>
          <div className="flex items-center space-x-2 text-[11px]">
            <span className="text-slate-500">Presets:</span>
            {presets.map((pr) => (
              <button
                key={pr.label}
                onClick={() => {
                  setInputStr(pr.ref);
                  setPageReferenceString(pr.ref);
                }}
                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[10px]"
              >
                {pr.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleUpdateString} className="flex gap-2">
          <input
            type="text"
            value={inputStr}
            onChange={(e) => setInputStr(e.target.value)}
            placeholder="Comma separated page numbers: 7, 0, 1, 2, 0, 3..."
            className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Update Simulation
          </button>
        </form>
      </div>

      {/* Step-by-Step Frame Matrix */}
      <div className="bg-[#0b101b] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Step-by-Step Frame State Progression
          </h4>
          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="flex items-center space-x-1 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/20 border border-emerald-500/50" />
              <span>Hit</span>
            </span>
            <span className="flex items-center space-x-1 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500/20 border border-rose-500/50" />
              <span>Fault (Miss)</span>
            </span>
          </div>
        </div>

        {/* Matrix Grid */}
        <div className="overflow-x-auto pb-2">
          <table className="w-full text-center border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 bg-slate-900/60">
                <th className="py-2.5 px-3 text-left">Ref Page</th>
                {pagingResult.steps.map((st, idx) => (
                  <th key={idx} className="py-2.5 px-2 text-white font-bold">
                    {st.page}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {/* Frame Rows */}
              {Array.from({ length: pageFrames }).map((_, fIdx) => (
                <tr key={fIdx}>
                  <td className="py-2.5 px-3 text-left text-slate-400 text-[11px]">Frame {fIdx}</td>
                  {pagingResult.steps.map((st, sIdx) => {
                    const pageInFrame = st.frames[fIdx];
                    const isNewEntry = st.isFault && pageInFrame === st.page;

                    return (
                      <td
                        key={sIdx}
                        className={`py-2 px-2 border-r border-slate-800/40 ${
                          isNewEntry
                            ? 'bg-rose-500/10 text-rose-300 font-bold'
                            : pageInFrame !== null
                            ? 'text-slate-300'
                            : 'text-slate-700'
                        }`}
                      >
                        {pageInFrame !== null ? pageInFrame : '-'}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Status Row */}
              <tr className="border-t-2 border-slate-700 bg-slate-900/30">
                <td className="py-2.5 px-3 text-left font-bold text-slate-400">Result</td>
                {pagingResult.steps.map((st, idx) => (
                  <td key={idx} className="py-2 px-1">
                    {st.isFault ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold">
                        F
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                        H
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

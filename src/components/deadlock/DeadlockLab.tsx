import React, { useState } from 'react';
import { useKernelStore } from '../../store/useKernelStore';
import { ShieldAlert, CheckCircle2, AlertOctagon, Play, RotateCcw, ArrowRight, Binary } from 'lucide-react';

export const DeadlockLab: React.FC = () => {
  const {
    bankersState,
    safetyResult,
    runSafetyCheck,
    handleResourceRequest,
    resetBankers,
  } = useKernelStore();

  const [reqPid, setReqPid] = useState(1); // default P1
  const [reqA, setReqA] = useState(1);
  const [reqB, setReqB] = useState(0);
  const [reqC, setReqC] = useState(2);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const onSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const res = handleResourceRequest(reqPid, [reqA, reqB, reqC]);
    setFeedback(res);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="bg-[#0b101b] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 font-bold mb-1">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="text-white text-base">Deadlock Avoidance & Banker's Algorithm</h3>
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Formal multi-instance resource allocation verification, safe sequence detection, and request validation.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={runSafetyCheck}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-lg shadow-emerald-950/40"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Verify Safety Algorithm</span>
          </button>
          <button
            onClick={resetBankers}
            className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white"
            title="Reset to default textbook matrices"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Safety Status Banner */}
      <div
        className={`p-4 rounded-2xl border shadow-xl flex items-center justify-between ${
          safetyResult.isSafe
            ? 'bg-emerald-950/20 border-emerald-500/50'
            : 'bg-rose-950/30 border-rose-500/60'
        }`}
      >
        <div className="flex items-center space-x-3">
          {safetyResult.isSafe ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          ) : (
            <AlertOctagon className="w-6 h-6 text-rose-400 shrink-0" />
          )}
          <div>
            <span className="text-xs uppercase font-bold text-slate-400 font-mono block">System State Assessment:</span>
            <h4 className="text-base font-bold text-white font-mono">
              {safetyResult.isSafe ? (
                <span className="text-emerald-400">
                  SAFE STATE — Valid Sequence: &lt; {safetyResult.safeSequence?.join(' → ')} &gt;
                </span>
              ) : (
                <span className="text-rose-400">UNSAFE / DEADLOCK HAZARD DETECTED</span>
              )}
            </h4>
          </div>
        </div>

        <div className="text-right font-mono text-xs">
          <span className="text-slate-400">Available Resources:</span>
          <div className="text-emerald-400 font-bold text-sm">
            [A:{bankersState.available[0]}, B:{bankersState.available[1]}, C:{bankersState.available[2]}]
          </div>
        </div>
      </div>

      {/* Allocation, Max, and Need Matrices */}
      <div className="bg-[#0b101b] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Resource Allocation, Maximum Claim, and Computed Need Matrices
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 bg-slate-900/60">
                <th className="py-2.5 px-3 text-left">Process</th>
                <th colSpan={3} className="py-2.5 px-2 border-r border-slate-800 text-cyan-400">
                  Allocation [A B C]
                </th>
                <th colSpan={3} className="py-2.5 px-2 border-r border-slate-800 text-slate-300">
                  Max Claim [A B C]
                </th>
                <th colSpan={3} className="py-2.5 px-2 text-amber-400 font-bold">
                  Need (Max - Alloc) [A B C]
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {bankersState.processNames.map((pName, idx) => (
                <tr key={pName} className="hover:bg-slate-900/40">
                  <td className="py-2.5 px-3 text-left font-bold text-white">{pName}</td>
                  {/* Allocation */}
                  <td className="py-2 px-2 text-cyan-300">{bankersState.allocation[idx][0]}</td>
                  <td className="py-2 px-2 text-cyan-300">{bankersState.allocation[idx][1]}</td>
                  <td className="py-2 px-2 text-cyan-300 border-r border-slate-800">{bankersState.allocation[idx][2]}</td>

                  {/* Max */}
                  <td className="py-2 px-2 text-slate-400">{bankersState.max[idx][0]}</td>
                  <td className="py-2 px-2 text-slate-400">{bankersState.max[idx][1]}</td>
                  <td className="py-2 px-2 text-slate-400 border-r border-slate-800">{bankersState.max[idx][2]}</td>

                  {/* Need */}
                  <td className="py-2 px-2 text-amber-400 font-semibold">{bankersState.need[idx][0]}</td>
                  <td className="py-2 px-2 text-amber-400 font-semibold">{bankersState.need[idx][1]}</td>
                  <td className="py-2 px-2 text-amber-400 font-semibold">{bankersState.need[idx][2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resource Request Simulator & Mathematical Proof Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dynamic Resource Request Form */}
        <div className="p-5 rounded-2xl bg-[#0b101b] border border-slate-800 shadow-xl space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
            <Binary className="w-4 h-4 text-cyan-400" />
            <span>Simulate Dynamic Resource Request</span>
          </h4>

          <form onSubmit={onSubmitRequest} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Target Process</label>
              <select
                value={reqPid}
                onChange={(e) => setReqPid(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-500"
              >
                {bankersState.processNames.map((p, idx) => (
                  <option key={p} value={idx}>
                    {p} (Current Need: [{bankersState.need[idx].join(', ')}])
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Request A</label>
                <input
                  type="number"
                  min={0}
                  max={7}
                  value={reqA}
                  onChange={(e) => setReqA(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-center focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Request B</label>
                <input
                  type="number"
                  min={0}
                  max={7}
                  value={reqB}
                  onChange={(e) => setReqB(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-center focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Request C</label>
                <input
                  type="number"
                  min={0}
                  max={7}
                  value={reqC}
                  onChange={(e) => setReqC(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-center focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold flex items-center justify-center space-x-1.5 transition-colors shadow-lg shadow-cyan-950/40 mt-2"
            >
              <span>Test Resource Request Algorithm</span>
            </button>
          </form>

          {feedback && (
            <div
              className={`p-3 rounded-xl border text-xs font-mono leading-relaxed ${
                feedback.success
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
              }`}
            >
              {feedback.message}
            </div>
          )}
        </div>

        {/* Algorithm Step-by-Step Proof Trace */}
        <div className="p-5 rounded-2xl bg-[#0b101b] border border-slate-800 shadow-xl space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Safety Algorithm Execution Trace Log
          </h4>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 max-h-60 overflow-y-auto space-y-2 text-[11px] font-mono text-slate-300">
            {safetyResult.steps.map((st, idx) => (
              <div key={idx} className="pb-1 border-b border-slate-900/60 last:border-0">
                <span className="text-emerald-500 font-bold mr-1.5">[{idx + 1}]</span>
                <span>{st}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

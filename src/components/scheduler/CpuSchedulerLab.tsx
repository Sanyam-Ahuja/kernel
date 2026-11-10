import React, { useState } from 'react';
import { useKernelStore } from '../../store/useKernelStore';
import { CpuAlgorithm, ProcessInput } from '../../types';
import { Cpu, Play, Plus, Trash2, Clock, CheckCircle2, Sliders } from 'lucide-react';

export const CpuSchedulerLab: React.FC = () => {
  const {
    cpuProcesses,
    cpuAlgorithm,
    cpuQuantum,
    cpuResult,
    setCpuAlgorithm,
    setCpuQuantum,
    addProcess,
    removeProcess,
  } = useKernelStore();

  const [name, setName] = useState('');
  const [arrival, setArrival] = useState(0);
  const [burst, setBurst] = useState(4);
  const [priority, setPriority] = useState(1);
  const [color, setColor] = useState('#06b6d4');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const pid = `P${cpuProcesses.length + 1}`;
    addProcess({
      id: pid,
      name: name.trim() ? `${pid} (${name})` : pid,
      arrivalTime: arrival,
      burstTime: burst,
      priority,
      color,
    });
    setName('');
  };

  const colors = ['#38bdf8', '#4ade80', '#facc15', '#f43f5e', '#a855f7', '#fb923c'];

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="bg-[#0b101b] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 font-bold mb-1">
            <Cpu className="w-5 h-5" />
            <h3 className="text-white text-base">CPU Scheduling Algorithms Laboratory</h3>
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Mathematical simulation of process dispatching, context switching, preemption, and queue analytics.
          </p>
        </div>

        {/* Algorithm Selector & Quantum */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={cpuAlgorithm}
            onChange={(e) => setCpuAlgorithm(e.target.value as CpuAlgorithm)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
          >
            <option value="fcfs">First-Come, First-Served (FCFS)</option>
            <option value="sjf">Shortest Job First (SJF - Non-preemptive)</option>
            <option value="srtf">Shortest Remaining Time First (SRTF - Preemptive)</option>
            <option value="round_robin">Round Robin (RR)</option>
            <option value="priority_np">Priority Scheduling (Non-preemptive)</option>
            <option value="priority_p">Priority Scheduling (Preemptive)</option>
          </select>

          {cpuAlgorithm === 'round_robin' && (
            <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-mono">
              <span className="text-slate-400">Time Quantum (q):</span>
              <input
                type="number"
                min={1}
                max={20}
                value={cpuQuantum}
                onChange={(e) => setCpuQuantum(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-12 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-center text-emerald-400 font-bold focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Aggregate Metrics HUD */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#0b101b] border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Avg Waiting Time</span>
          <div className="text-2xl font-bold font-mono text-white mt-0.5">{cpuResult.avgWaiting} <span className="text-xs text-slate-500">ms</span></div>
          <span className="text-[10px] text-emerald-400 font-mono">Σ(TAT - BT) / n</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0b101b] border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Avg Turnaround Time</span>
          <div className="text-2xl font-bold font-mono text-white mt-0.5">{cpuResult.avgTurnaround} <span className="text-xs text-slate-500">ms</span></div>
          <span className="text-[10px] text-cyan-400 font-mono">Σ(CT - AT) / n</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0b101b] border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase">CPU Utilization</span>
          <div className="text-2xl font-bold font-mono text-white mt-0.5">{cpuResult.cpuUtilization}%</div>
          <span className="text-[10px] text-amber-400 font-mono">Active vs Idle time</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0b101b] border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Schedule Makespan</span>
          <div className="text-2xl font-bold font-mono text-white mt-0.5">{cpuResult.totalTime} <span className="text-xs text-slate-500">units</span></div>
          <span className="text-[10px] text-slate-400 font-mono">Total Execution Span</span>
        </div>
      </div>

      {/* Gantt Chart Visualization */}
      <div className="p-5 rounded-2xl bg-[#0b101b] border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Interactive Gantt Chart Execution Timeline</span>
          </h4>
          <span className="text-[11px] text-slate-500 font-mono">Total Timeline: 0 to {cpuResult.totalTime}</span>
        </div>

        {/* Timeline Bar */}
        <div className="overflow-x-auto pb-4">
          <div className="flex min-w-[650px] border border-slate-700 rounded-xl overflow-hidden h-14 bg-slate-950">
            {cpuResult.timeline.map((seg, idx) => {
              const widthPct = cpuResult.totalTime > 0
                ? ((seg.end - seg.start) / cpuResult.totalTime) * 100
                : 100;

              return (
                <div
                  key={idx}
                  style={{ width: `${widthPct}%`, backgroundColor: seg.color }}
                  className="h-full border-r border-slate-900/60 flex flex-col items-center justify-center p-1 text-center relative group select-none transition-all hover:brightness-110"
                >
                  <span className="text-[11px] font-bold text-slate-950 truncate max-w-full font-mono">
                    {seg.processId}
                  </span>
                  <span className="text-[9px] text-slate-900/80 font-mono">
                    {seg.end - seg.start}u
                  </span>
                </div>
              );
            })}
          </div>

          {/* Time Marker Ticks */}
          <div className="flex min-w-[650px] text-[10px] font-mono text-slate-400 mt-1 relative h-4">
            <span className="absolute left-0">0</span>
            {cpuResult.timeline.map((seg, idx) => {
              const rightPct = ((seg.end) / (cpuResult.totalTime || 1)) * 100;
              return (
                <span
                  key={idx}
                  style={{ left: `${rightPct}%` }}
                  className="absolute -translate-x-1/2"
                >
                  {seg.end}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Process Table & Add Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Process Registry Table */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0b101b] border border-slate-800 shadow-xl space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Process Control Blocks (PCB) & Computed Metrics
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400 font-mono">
                  <th className="py-2 px-2">Process</th>
                  <th className="py-2 px-2">Arrival (AT)</th>
                  <th className="py-2 px-2">Burst (BT)</th>
                  <th className="py-2 px-2">Priority</th>
                  <th className="py-2 px-2 text-emerald-400">Finish (CT)</th>
                  <th className="py-2 px-2 text-cyan-400">TAT</th>
                  <th className="py-2 px-2 text-amber-400">Waiting (WT)</th>
                  <th className="py-2 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {cpuResult.metrics.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/40">
                    <td className="py-2 px-2 font-bold flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: p.color }} />
                      <span className="text-white">{p.name}</span>
                    </td>
                    <td className="py-2 px-2 text-slate-300">{p.arrivalTime}</td>
                    <td className="py-2 px-2 text-slate-300">{p.burstTime}</td>
                    <td className="py-2 px-2 text-slate-300">{p.priority}</td>
                    <td className="py-2 px-2 text-emerald-400 font-bold">{p.completionTime}</td>
                    <td className="py-2 px-2 text-cyan-400">{p.turnaroundTime}</td>
                    <td className="py-2 px-2 text-amber-400">{p.waitingTime}</td>
                    <td className="py-2 px-2 text-right">
                      <button
                        onClick={() => removeProcess(p.id)}
                        disabled={cpuProcesses.length <= 1}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 disabled:opacity-30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Process Card */}
        <div className="p-5 rounded-2xl bg-[#0b101b] border border-slate-800 shadow-xl space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Enqueue New Process</span>
          </h4>

          <form onSubmit={handleAdd} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Process Name (optional)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Media Player"
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1">Arrival Time</label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={arrival}
                  onChange={(e) => setArrival(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Burst Time</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={burst}
                  onChange={(e) => setBurst(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1">Priority (1=High)</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={priority}
                  onChange={(e) => setPriority(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Badge Color</label>
                <div className="flex items-center space-x-1.5 pt-1">
                  {colors.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-5 h-5 rounded-full border ${color === c ? 'border-white scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center space-x-1.5 transition-colors shadow-lg shadow-emerald-950/40 mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Process to Queue</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

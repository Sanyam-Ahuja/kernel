import React, { useState } from 'react';
import { useKernelStore } from '../../store/useKernelStore';
import { CpuAlgorithm } from '../../types';
import { Stat, Win } from '../acme/Win';

const ALGOS: { id: CpuAlgorithm; word: string; long: string }[] = [
  { id: 'fcfs', word: 'FCFS', long: 'first come, first served' },
  { id: 'sjf', word: 'SJF', long: 'shortest job first, non-preemptive' },
  { id: 'srtf', word: 'SRTF', long: 'shortest remaining time, preemptive' },
  { id: 'round_robin', word: 'RR', long: 'round robin' },
  { id: 'priority_np', word: 'Prio', long: 'priority, non-preemptive' },
  { id: 'priority_p', word: 'Prio!', long: 'priority, preemptive' },
];
const SWATCH = ['#8888cc', '#9cb860', '#e0b84a', '#cf7a6b', '#6fb1b1', '#b48ac0'];

export const CpuSchedulerLab: React.FC = () => {
  const { cpuProcesses, cpuAlgorithm, cpuQuantum, cpuResult, setCpuAlgorithm, setCpuQuantum, addProcess, removeProcess } = useKernelStore();
  const [name, setName] = useState('');
  const [arrival, setArrival] = useState(0);
  const [burst, setBurst] = useState(4);
  const [priority, setPriority] = useState(1);
  const [color, setColor] = useState(SWATCH[4]);
  const T = cpuResult.totalTime || 1;
  const algo = ALGOS.find((a) => a.id === cpuAlgorithm)!;

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const pid = `P${cpuProcesses.length + 1}`;
    addProcess({ id: pid, name: name.trim() ? `${pid} (${name.trim()})` : pid, arrivalTime: arrival, burstTime: burst, priority, color });
    setName('');
  };

  return (
    <div className="grid xl:grid-cols-[1fr_440px] gap-1.5 sm:gap-2">
      <div className="flex flex-col gap-1.5 sm:gap-2 min-w-0">
        <Win
          name="/proc/sched"
          cmds={ALGOS.map((a) => ({ label: a.word, onClick: () => setCpuAlgorithm(a.id), pressed: a.id === cpuAlgorithm, title: a.long }))}
          aside={algo.long}
          thumb={55}
        >
          {cpuAlgorithm === 'round_robin' && (
            <label className="flex items-center gap-2 mb-3 font-mono text-[14px]">
              quantum
              <input type="number" min={1} max={20} value={cpuQuantum} onChange={(e) => setCpuQuantum(Math.max(1, parseInt(e.target.value, 10) || 1))} className="in w-16" />
              ticks
            </label>
          )}

          {/* one lane per process, on a shared time axis */}
          <div className="overflow-x-auto">
            <div className="min-w-[560px] pr-4">
              {cpuResult.metrics.map((p) => (
                <div key={p.id} className="grid grid-cols-[150px_1fr] items-center h-8 border-b border-dotted border-olive/60">
                  <span className="font-mono text-[13.5px] truncate pr-2">{p.name}</span>
                  <div className="relative h-5">
                    <span className="absolute h-px bg-faded/40 top-1/2" style={{ left: `${(p.arrivalTime / T) * 100}%`, right: `${100 - (p.completionTime / T) * 100}%` }} />
                    <span className="absolute -top-0.5 w-px h-6 bg-black" style={{ left: `${(p.arrivalTime / T) * 100}%` }} title={`arrives ${p.arrivalTime}`} />
                    {cpuResult.timeline.filter((s) => s.processId === p.id).map((s, i) => (
                      <span key={i} className="absolute top-0 h-5 border border-black font-mono text-[11px] grid place-items-center overflow-hidden"
                        style={{ left: `${(s.start / T) * 100}%`, width: `${((s.end - s.start) / T) * 100}%`, background: p.color }}>
                        {s.end - s.start > 1 ? s.end - s.start : ''}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-[150px_1fr] h-8">
                <span className="font-mono text-[13.5px] text-faded">cpu</span>
                <div className="relative h-5 border border-black bg-white">
                  {cpuResult.timeline.map((s, i) => (
                    <span key={i} className="absolute top-0 bottom-0 border-r border-black" style={{ left: `${(s.start / T) * 100}%`, width: `${((s.end - s.start) / T) * 100}%`, background: s.color }} title={`${s.processName} ${s.start}–${s.end}`} />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-[150px_1fr]">
                <span />
                <div className="relative h-5 font-mono text-[11px] text-faded">
                  {Array.from({ length: T + 1 }).map((_, t) => (t % (T > 30 ? 5 : T > 15 ? 2 : 1) === 0 || t === T) && (
                    <span key={t} className="absolute -translate-x-1/2" style={{ left: `${(t / T) * 100}%` }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <p className="text-[13px] text-faded mt-2">Thin rule: time in the system from arrival to finish. Blocks: time actually on the CPU.</p>
        </Win>

        <Win name="/proc/sched/stat" thumb={100}>
          <Stat rows={[
            ['avg wait', cpuResult.avgWaiting, 'Σ(TAT − burst) / n'],
            ['avg turnaround', cpuResult.avgTurnaround, 'Σ(finish − arrival) / n'],
            ['avg response', cpuResult.avgResponse, 'first run − arrival'],
            ['cpu busy', `${cpuResult.cpuUtilization}%`],
            ['makespan', `${cpuResult.totalTime} ticks`],
          ]} />
        </Win>
      </div>

      <div className="flex flex-col gap-1.5 sm:gap-2 min-w-0">
        <Win name="/proc/pcb" aside={`${cpuProcesses.length} procs`} thumb={45} bodyClassName="overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>pid</th><th>at</th><th>bt</th><th>pri</th><th>ct</th><th>tat</th><th>wt</th><th /></tr></thead>
            <tbody>
              {cpuResult.metrics.map((p) => (
                <tr key={p.id}>
                  <td><span className="inline-block w-2.5 h-2.5 border border-black mr-1.5 align-middle" style={{ background: p.color }} />{p.name}</td>
                  <td>{p.arrivalTime}</td><td>{p.burstTime}</td><td>{p.priority}</td>
                  <td>{p.completionTime}</td><td>{p.turnaroundTime}</td><td>{p.waitingTime}</td>
                  <td><button className="cmd text-err disabled:opacity-30" disabled={cpuProcesses.length <= 1} onClick={() => removeProcess(p.id)}>Kill</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Win>

        <Win name="/proc/new" dirty={name.length > 0} thumb={100}>
          <form onSubmit={add} className="grid grid-cols-2 gap-x-3 gap-y-2 font-mono text-[14px]">
            <label className="col-span-2 flex items-center gap-2">name <input className="in flex-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="Media Player" /></label>
            <label className="flex items-center gap-2">arrival <input type="number" min={0} max={50} className="in w-16" value={arrival} onChange={(e) => setArrival(parseInt(e.target.value, 10) || 0)} /></label>
            <label className="flex items-center gap-2">burst <input type="number" min={1} max={50} className="in w-16" value={burst} onChange={(e) => setBurst(parseInt(e.target.value, 10) || 1)} /></label>
            <label className="flex items-center gap-2">priority <input type="number" min={1} max={10} className="in w-16" value={priority} onChange={(e) => setPriority(parseInt(e.target.value, 10) || 1)} /></label>
            <div className="flex items-center gap-1" role="radiogroup" aria-label="colour">
              {SWATCH.map((c) => (
                <button type="button" key={c} role="radio" aria-checked={color === c} onClick={() => setColor(c)} className={`w-5 h-5 border border-black ${color === c ? 'outline-2 outline-black outline-offset-1' : ''}`} style={{ background: c }} />
              ))}
            </div>
            <p className="col-span-2 text-faded text-[12.5px] font-sans">priority 1 runs first.</p>
            <button className="btn btn-go col-span-2">Fork P{cpuProcesses.length + 1}</button>
          </form>
        </Win>
      </div>
    </div>
  );
};

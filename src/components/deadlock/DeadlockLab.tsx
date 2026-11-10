import React, { useState } from 'react';
import { useKernelStore } from '../../store/useKernelStore';
import { Win } from '../acme/Win';

export const DeadlockLab: React.FC = () => {
  const { bankersState: B, safetyResult, runSafetyCheck, handleResourceRequest, resetBankers } = useKernelStore();
  const [pid, setPid] = useState(1);
  const [req, setReq] = useState([1, 0, 2]);
  const [fb, setFb] = useState<{ success: boolean; message: string } | null>(null);
  const R = B.resourceNames.length ? B.resourceNames : ['A', 'B', 'C'];

  const Matrix: React.FC<{ title: string; m: number[][]; hl?: boolean }> = ({ title, m, hl }) => (
    <table className="tbl !w-auto">
      <thead>
        <tr><th colSpan={R.length + 1} className="!border-b-0 text-faded">{title}</th></tr>
        <tr><th /> {R.map((r) => <th key={r} className="text-center">{r}</th>)}</tr>
      </thead>
      <tbody>
        {B.processNames.map((p, i) => (
          <tr key={p} className={hl && i === pid ? 'bg-sel' : ''}>
            <td className="text-faded">{p}</td>
            {m[i].map((v, j) => <td key={j} className="text-center">{v}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="grid xl:grid-cols-[1fr_420px] gap-1.5 sm:gap-2">
      <div className="flex flex-col gap-1.5 sm:gap-2 min-w-0">
        <Win name="/sys/banker" cmds={[{ label: 'Check', onClick: runSafetyCheck }, { label: 'Reset', onClick: resetBankers }]}
          aside={`available ${R.map((r, i) => `${r}=${B.available[i]}`).join(' ')}`} dirty={!safetyResult.isSafe} thumb={50}>
          <p className={`font-mono text-[16px] mb-4 px-2 py-1 border border-black inline-block ${safetyResult.isSafe ? 'bg-[#d8ebc0]' : 'bg-[#f0c4bb]'}`}>
            {safetyResult.isSafe
              ? <>safe. sequence ⟨{safetyResult.safeSequence?.join(', ')}⟩</>
              : <>unsafe. no ordering lets every process finish</>}
          </p>
          <div className="flex flex-wrap gap-x-10 gap-y-4 overflow-x-auto">
            <Matrix title="allocation" m={B.allocation} hl />
            <Matrix title="max" m={B.max} hl />
            <Matrix title="need = max − alloc" m={B.need} hl />
          </div>
        </Win>

        <Win name="/sys/banker/trace" thumb={90} bodyClassName="font-mono text-[13.5px] max-h-[380px] overflow-y-auto">
          <ol className="space-y-0.5">
            {safetyResult.steps.map((s, i) => (
              <li key={i} className="grid grid-cols-[2.5rem_1fr]"><span className="text-faded">{i + 1}</span><span>{s}</span></li>
            ))}
          </ol>
        </Win>
      </div>

      <Win name="/sys/banker/request" dirty={!!fb && !fb.success} thumb={100} className="self-start">
        <form onSubmit={(e) => { e.preventDefault(); setFb(handleResourceRequest(pid, req)); }} className="space-y-3 font-mono text-[14px]">
          <label className="flex items-center gap-2">process
            <select className="in flex-1" value={pid} onChange={(e) => setPid(parseInt(e.target.value, 10))}>
              {B.processNames.map((p, i) => <option key={p} value={i}>{p} · need [{B.need[i].join(' ')}]</option>)}
            </select>
          </label>
          <div className="flex gap-3">
            {R.map((r, i) => (
              <label key={r} className="flex items-center gap-1.5">{r}
                <input type="number" min={0} max={7} className="in w-14" value={req[i]} onChange={(e) => setReq(req.map((v, j) => (j === i ? parseInt(e.target.value, 10) || 0 : v)))} />
              </label>
            ))}
          </div>
          <button className="btn btn-go w-full">request({B.processNames[pid]}, [{req.join(' ')}])</button>
        </form>
        {fb && (
          <p className={`mt-3 font-mono text-[13.5px] border-l-0 px-2 py-1 ${fb.success ? 'bg-[#d8ebc0]' : 'bg-[#f0c4bb]'}`}>{fb.message}</p>
        )}
        <p className="text-[13px] text-faded mt-3">The request is granted only if, after pretending to grant it, a safe sequence still exists.</p>
      </Win>
    </div>
  );
};

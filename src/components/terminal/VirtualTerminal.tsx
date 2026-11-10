import React, { useEffect, useRef, useState } from 'react';
import { useKernelStore } from '../../store/useKernelStore';
import { VFSNode } from '../../types';
import { Win } from '../acme/Win';

const WORDS = ['ls -l', 'cat readme.txt', 'cat main.c', 'ps', 'free', 'uname -a', 'pwd', 'help'];

export const VirtualTerminal: React.FC = () => {
  const { terminalHistory, vfsPath, vfsRoot, runTerminalCommand, clearTerminal } = useKernelStore();
  const [input, setInput] = useState('');
  const [hIdx, setHIdx] = useState<number | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inRef = useRef<HTMLInputElement>(null);
  const cwd = '/' + vfsPath.join('/');

  useEffect(() => { endRef.current?.scrollIntoView({ block: 'nearest' }); }, [terminalHistory]);

  let dir: VFSNode | undefined = vfsRoot;
  for (const seg of vfsPath) dir = dir?.children?.[seg];
  const entries = Object.values(dir?.children ?? {}).sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'dir' ? -1 : 1));

  const run = (c: string) => { runTerminalCommand(c); inRef.current?.focus(); };
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (!input.trim()) return; run(input); setInput(''); setHIdx(null); };
  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!terminalHistory.length) return;
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const i = hIdx === null ? terminalHistory.length - 1 : Math.max(0, hIdx - 1);
      setHIdx(i); setInput(terminalHistory[i].command);
    } else if (e.key === 'ArrowDown' && hIdx !== null) {
      e.preventDefault();
      if (hIdx < terminalHistory.length - 1) { setHIdx(hIdx + 1); setInput(terminalHistory[hIdx + 1].command); }
      else { setHIdx(null); setInput(''); }
    }
  };

  return (
    <div className="grid lg:grid-cols-[1fr_340px] gap-1.5 sm:gap-2 lg:h-[calc(100vh-52px)]">
      <Win
        name={`${cwd}/-shell`}
        cmds={[{ label: 'Clear', onClick: clearTerminal }, { label: 'Snarf', onClick: () => navigator.clipboard?.writeText(terminalHistory.map((h) => `$ ${h.command}\n${h.output}`).join('\n')), title: 'copy transcript' }]}
        aside={`${terminalHistory.length} cmds`}
        dirty={input.length > 0}
        thumb={80}
        className="min-h-[60vh] lg:min-h-0"
        bodyClassName="overflow-y-auto font-mono text-[14px] leading-[1.45]"
      >
        <div onClick={() => inRef.current?.focus()}>
          {terminalHistory.length === 0 && (
            <p className="text-faded">Empty buffer. Type <b>help</b> or click a word in the Help window.</p>
          )}
          {terminalHistory.map((h, i) => (
            <div key={i} className="mb-2">
              <div><span className="text-faded">{h.path}%</span> {h.command}</div>
              {h.output && <pre className="whitespace-pre-wrap font-mono">{h.output}</pre>}
            </div>
          ))}
          <form onSubmit={submit} className="flex gap-2 items-baseline">
            <span className="text-faded shrink-0">{cwd}%</span>
            <input
              ref={inRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              autoFocus
              aria-label="Shell command"
              className="flex-1 bg-transparent outline-none caret-black min-w-0 focus:bg-sel/40"
              spellCheck={false}
              autoComplete="off"
            />
          </form>
          <div ref={endRef} />
        </div>
      </Win>

      <div className="flex flex-col gap-1.5 sm:gap-2 min-h-0">
        <Win name={`${cwd}/`} cmds={[{ label: 'Get', onClick: () => run('ls -l') }]} thumb={30} bodyClassName="font-mono text-[14px] overflow-y-auto" className="lg:flex-1 min-h-0">
          <p className="text-faded text-[12.5px] mb-1 font-sans">click a name: folders cd, files cat</p>
          <ul>
            {vfsPath.length > 0 && <li><button className="cmd !px-0 hover:!bg-sel" onClick={() => run('cd ..')}>../</button></li>}
            {entries.map((n) => (
              <li key={n.name} className="flex justify-between gap-2">
                <button className="cmd !px-0 hover:!bg-sel text-left" onClick={() => run(n.type === 'dir' ? `cd ${n.name}` : `cat ${n.name}`)}>
                  {n.name}{n.type === 'dir' ? '/' : ''}
                </button>
                <span className="text-faded text-[12.5px]">{n.permissions}</span>
              </li>
            ))}
            {entries.length === 0 && <li className="text-faded">(empty directory)</li>}
          </ul>
        </Win>
        <Win name="/help/kernel" thumb={100} bodyClassName="text-[14px]">
          <p className="mb-2">Every word below is a command. Click to run it in the shell.</p>
          <div className="font-mono flex flex-wrap gap-x-3 gap-y-1">
            {WORDS.map((w) => <button key={w} className="cmd !px-0 underline decoration-dotted hover:!bg-sel" onClick={() => run(w)}>{w}</button>)}
          </div>
          <p className="mt-3 text-faded text-[13px]">Also: cd, mkdir, touch, rm, echo. ↑ / ↓ walk history. Files live in memory and persist in this browser only.</p>
        </Win>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useKernelStore } from '../../store/useKernelStore';

type Tab = ReturnType<typeof useKernelStore.getState>['activeTab'];
const TABS: { id: Tab; word: string; hint: string }[] = [
  { id: 'terminal', word: 'Shell', hint: 'in-memory filesystem and shell' },
  { id: 'scheduler', word: 'Sched', hint: 'CPU scheduling' },
  { id: 'memory', word: 'Heap', hint: 'contiguous allocation' },
  { id: 'paging', word: 'Paging', hint: 'page replacement' },
  { id: 'deadlock', word: 'Deadlock', hint: "banker's algorithm" },
];

/** The column-0 tag line: the whole app's commands as words. */
export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, resetAll } = useKernelStore();
  const [confirm, setConfirm] = useState(false);
  const current = TABS.find((t) => t.id === activeTab)!;

  return (
    <header className="border-b border-black bg-tag sticky top-0 z-30">
      <div className="flex flex-wrap items-center gap-x-1 px-2 py-1.5 font-mono text-[14px]">
        <span className="layoutbox !bg-black" aria-hidden />
        <span className="font-semibold mr-3">kernel/</span>
        <nav className="flex flex-wrap" aria-label="Labs">
          {TABS.map((t) => (
            <button key={t.id} className="cmd" aria-current={activeTab === t.id ? 'page' : undefined} onClick={() => setActiveTab(t.id)} title={t.hint}>
              {t.word}
            </button>
          ))}
        </nav>
        <span className="mx-2 text-faded">|</span>
        {confirm ? (
          <span className="flex items-center gap-1 bg-sel px-1">
            <span>reboot drops every queue, heap and file?</span>
            <button className="cmd font-semibold" onClick={() => { resetAll(); setConfirm(false); }}>Yes</button>
            <button className="cmd" onClick={() => setConfirm(false)}>No</button>
          </span>
        ) : (
          <button className="cmd" onClick={() => setConfirm(true)}>Reboot</button>
        )}
        <span className="ml-auto text-faded hidden md:inline">{current.hint} · simulated in-browser</span>
      </div>
    </header>
  );
};

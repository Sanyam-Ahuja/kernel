import React from 'react';
import { useKernelStore } from './store/useKernelStore';
import { Navbar } from './components/layout/Navbar';
import { VirtualTerminal } from './components/terminal/VirtualTerminal';
import { CpuSchedulerLab } from './components/scheduler/CpuSchedulerLab';
import { MemoryLab } from './components/memory/MemoryLab';
import { PagingLab } from './components/paging/PagingLab';
import { DeadlockLab } from './components/deadlock/DeadlockLab';

export const App: React.FC = () => {
  const { activeTab } = useKernelStore();

  return (
    <div className="min-h-screen bg-[#06090F] text-slate-100 flex flex-col font-mono selection:bg-emerald-500/30 selection:text-emerald-300">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'terminal' && <VirtualTerminal />}
        {activeTab === 'scheduler' && <CpuSchedulerLab />}
        {activeTab === 'memory' && <MemoryLab />}
        {activeTab === 'paging' && <PagingLab />}
        {activeTab === 'deadlock' && <DeadlockLab />}
      </main>

      <footer className="border-t border-slate-800/80 bg-[#090D16] py-4 text-center text-xs text-slate-500 font-mono">
        <p>Kernel OS Playground • Systems Programming & Architecture Laboratory • Safe Client-Side Sandbox</p>
      </footer>
    </div>
  );
};

export default App;

import React from 'react';
import { Navbar } from './components/layout/Navbar';
import { VirtualTerminal } from './components/terminal/VirtualTerminal';
import { CpuSchedulerLab } from './components/scheduler/CpuSchedulerLab';
import { MemoryLab } from './components/memory/MemoryLab';
import { PagingLab } from './components/paging/PagingLab';
import { DeadlockLab } from './components/deadlock/DeadlockLab';
import { useKernelStore } from './store/useKernelStore';

export const App: React.FC = () => {
  const { activeTab } = useKernelStore();

  return (
    <div className="min-h-screen bg-[#030803] text-green-400 font-mono flex flex-col relative selection:bg-green-500 selection:text-black">
      {/* Scanline CRT overlay */}
      <div className="fixed inset-0 crt-overlay z-50 pointer-events-none opacity-60" />

      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        {activeTab === 'terminal' && <VirtualTerminal />}
        {activeTab === 'scheduler' && <CpuSchedulerLab />}
        {activeTab === 'memory' && <MemoryLab />}
        {activeTab === 'paging' && <PagingLab />}
        {activeTab === 'deadlock' && <DeadlockLab />}
      </main>

      <footer className="border-t border-green-950 bg-[#020502] py-4 text-center text-xs text-green-700 relative z-10 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>&gt; KERNEL.SYS // SIMULATED OS PLATFORM // DEC VT100 EMULATION ACTIVE</p>
          <p className="text-green-600">[ 0x00000000 - 0xFFFFFFFF VIRTUAL ADDRESS SPACE ]</p>
        </div>
      </footer>
    </div>
  );
};

export default App;

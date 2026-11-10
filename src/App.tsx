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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 p-1.5 sm:p-2">
        {activeTab === 'terminal' && <VirtualTerminal />}
        {activeTab === 'scheduler' && <CpuSchedulerLab />}
        {activeTab === 'memory' && <MemoryLab />}
        {activeTab === 'paging' && <PagingLab />}
        {activeTab === 'deadlock' && <DeadlockLab />}
      </main>
    </div>
  );
};

export default App;

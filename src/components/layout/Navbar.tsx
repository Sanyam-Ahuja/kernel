import React, { useState } from 'react';
import { useKernelStore } from '../../store/useKernelStore';
import { 
  Terminal, 
  Cpu, 
  HardDrive, 
  Layers, 
  ShieldAlert, 
  RotateCcw,
  Sparkles,
  Binary
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, resetAll } = useKernelStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <header className="border-b border-slate-800 bg-[#090D16]/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('terminal')}>
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <span className="font-mono text-emerald-400 font-bold text-base tracking-tighter">#_</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white font-mono">Kernel<span className="text-emerald-400">OS</span></span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  v6.8-EDU
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Interactive Operating Systems Playground</p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('terminal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center space-x-1.5 transition-all ${
                activeTab === 'terminal'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Shell VFS</span>
            </button>

            <button
              onClick={() => setActiveTab('scheduler')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center space-x-1.5 transition-all ${
                activeTab === 'scheduler'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>CPU Scheduler</span>
            </button>

            <button
              onClick={() => setActiveTab('memory')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center space-x-1.5 transition-all ${
                activeTab === 'memory'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Memory Heap</span>
            </button>

            <button
              onClick={() => setActiveTab('paging')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center space-x-1.5 transition-all ${
                activeTab === 'paging'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Page Replacement</span>
            </button>

            <button
              onClick={() => setActiveTab('deadlock')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center space-x-1.5 transition-all ${
                activeTab === 'deadlock'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Banker's Deadlock</span>
            </button>
          </nav>

          {/* Reset Demo Data */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
              title="Reset Sandbox"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="flex md:hidden overflow-x-auto py-2 space-x-1 border-t border-slate-800/80 font-mono">
          {(['terminal', 'scheduler', 'memory', 'paging', 'deadlock'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2.5 py-1 rounded text-xs whitespace-nowrap capitalize ${
                activeTab === tab ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl max-w-sm w-full p-5 shadow-2xl">
            <div className="flex items-center space-x-3 text-emerald-400 mb-3">
              <RotateCcw className="w-6 h-6" />
              <h3 className="font-semibold text-white text-base">Reset Kernel Sandbox?</h3>
            </div>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed font-sans">
              This will restore the virtual filesystem, reset process queues, empty the memory heap, and reseed default Banker's matrices.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetAll();
                  setShowResetConfirm(false);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
              >
                Reset Sandbox
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

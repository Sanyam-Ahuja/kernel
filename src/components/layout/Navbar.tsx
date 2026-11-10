import React, { useState } from 'react';
import { useKernelStore } from '../../store/useKernelStore';
import { 
  Terminal, 
  Cpu, 
  HardDrive, 
  Layers, 
  ShieldAlert, 
  RotateCcw,
  Activity,
  TerminalSquare
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, resetAll } = useKernelStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <header className="border-b border-green-500/30 bg-[#020502] sticky top-0 z-40 phosphor-border">
      {/* Top BIOS Banner */}
      <div className="bg-green-950/40 border-b border-green-500/20 px-4 py-1 text-[10px] font-mono text-green-400 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="font-bold text-green-300">SYSTEM ARCHITECTURE: x86_64 / RISC-V HYBRID</span>
          <span className="hidden sm:inline text-green-600">|</span>
          <span className="hidden sm:inline text-green-500">MEM: 640K BASE + 15M EXTENDED</span>
          <span className="hidden md:inline text-green-600">|</span>
          <span className="hidden md:inline text-green-500">STATUS: INTERRUPTS ENABLED</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-ping inline-block" />
          <span className="text-green-300 font-bold">ONLINE</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={() => setActiveTab('terminal')}
          >
            <div className="w-8 h-8 rounded border border-green-500/60 bg-green-950/60 flex items-center justify-center font-mono text-green-300 font-bold text-sm phosphor-glow">
              &gt;_
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base tracking-widest text-green-400 font-mono phosphor-glow">
                  KERNEL<span className="text-green-200">.OS</span>
                </span>
                <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-green-500/20 text-green-300 border border-green-500/40 font-mono">
                  TTY0
                </span>
              </div>
            </div>
          </div>

          {/* Retro Bracket Nav */}
          <nav className="flex items-center space-x-1 font-mono text-xs">
            <button
              onClick={() => setActiveTab('terminal')}
              className={`px-2.5 py-1 rounded border transition-all ${
                activeTab === 'terminal'
                  ? 'bg-green-500/20 text-green-200 border-green-400 phosphor-glow font-bold'
                  : 'text-green-600 border-transparent hover:text-green-400 hover:border-green-800'
              }`}
            >
              [ 1: SHELL ]
            </button>

            <button
              onClick={() => setActiveTab('scheduler')}
              className={`px-2.5 py-1 rounded border transition-all ${
                activeTab === 'scheduler'
                  ? 'bg-green-500/20 text-green-200 border-green-400 phosphor-glow font-bold'
                  : 'text-green-600 border-transparent hover:text-green-400 hover:border-green-800'
              }`}
            >
              [ 2: SCHEDULER ]
            </button>

            <button
              onClick={() => setActiveTab('memory')}
              className={`px-2.5 py-1 rounded border transition-all ${
                activeTab === 'memory'
                  ? 'bg-green-500/20 text-green-200 border-green-400 phosphor-glow font-bold'
                  : 'text-green-600 border-transparent hover:text-green-400 hover:border-green-800'
              }`}
            >
              [ 3: HEAP ]
            </button>

            <button
              onClick={() => setActiveTab('paging')}
              className={`px-2.5 py-1 rounded border transition-all ${
                activeTab === 'paging'
                  ? 'bg-green-500/20 text-green-200 border-green-400 phosphor-glow font-bold'
                  : 'text-green-600 border-transparent hover:text-green-400 hover:border-green-800'
              }`}
            >
              [ 4: PAGING ]
            </button>

            <button
              onClick={() => setActiveTab('deadlock')}
              className={`px-2.5 py-1 rounded border transition-all ${
                activeTab === 'deadlock'
                  ? 'bg-green-500/20 text-green-200 border-green-400 phosphor-glow font-bold'
                  : 'text-green-600 border-transparent hover:text-green-400 hover:border-green-800'
              }`}
            >
              [ 5: DEADLOCK ]
            </button>
          </nav>

          {/* Reset */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-2.5 py-1 rounded bg-green-950/60 hover:bg-green-900 border border-green-600/50 text-green-400 text-xs font-mono transition-all flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">WARM REBOOT</span>
            </button>
          </div>
        </div>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#050e05] border-2 border-green-500 p-6 max-w-sm w-full font-mono text-green-400 phosphor-border">
            <h3 className="text-sm font-bold uppercase text-green-300">&gt;&gt;&gt; SYSTEM REBOOT WARNING &lt;&lt;&lt;</h3>
            <p className="text-xs text-green-600 mt-2">
              All volatile memory pages, scheduler queues, and VFS buffers will be flushed to cold initial state.
            </p>
            <div className="mt-4 flex justify-end space-x-2 text-xs">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1 border border-green-800 text-green-600 hover:text-green-400"
              >
                ABORT
              </button>
              <button
                onClick={() => {
                  resetAll();
                  setShowResetConfirm(false);
                }}
                className="px-3 py-1 bg-green-600 text-black font-bold hover:bg-green-500"
              >
                CONFIRM REBOOT
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

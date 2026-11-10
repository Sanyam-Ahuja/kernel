import React, { useState, useRef, useEffect } from 'react';
import { useKernelStore } from '../../store/useKernelStore';
import { Terminal as TerminalIcon, Sparkles, Play, Trash2, Folder, FileText } from 'lucide-react';

export const VirtualTerminal: React.FC = () => {
  const { terminalHistory, vfsPath, runTerminalCommand, clearTerminal } = useKernelStore();
  const [input, setInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentPathStr = '/' + vfsPath.join('/');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    runTerminalCommand(input);
    setInput('');
    setHistoryIndex(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (terminalHistory.length === 0) return;
      const nextIdx = historyIndex === null ? terminalHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setInput(terminalHistory[nextIdx].command);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === null) return;
      if (historyIndex < terminalHistory.length - 1) {
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        setInput(terminalHistory[nextIdx].command);
      } else {
        setHistoryIndex(null);
        setInput('');
      }
    }
  };

  const quickCommands = [
    'ls -l',
    'cat main.c',
    'cat readme.txt',
    'ps',
    'free',
    'uname -a',
    'cat /etc/os-release',
    'help',
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner Notice */}
      <div className="bg-[#0b101b] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 font-bold mb-0.5">
            <TerminalIcon className="w-4 h-4" />
            <span>Virtual In-Browser Bash Environment</span>
          </div>
          <p className="text-slate-400">
            Real in-memory Unix Virtual File System (VFS). Safe sandbox with directory hierarchy, permissions, and process tables.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearTerminal}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors flex items-center space-x-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Buffer</span>
          </button>
        </div>
      </div>

      {/* Terminal Window */}
      <div
        className="bg-[#050811] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden font-mono flex flex-col h-[520px]"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Terminal Titlebar */}
        <div className="bg-[#0d1322] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between select-none">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            <span className="text-xs text-slate-400 ml-2">student@kernel-node-01: {currentPathStr} (bash)</span>
          </div>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">x86_64 VFS</span>
        </div>

        {/* Scrollable Buffer */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3 text-xs leading-relaxed text-slate-300">
          {terminalHistory.map((entry, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center space-x-2 text-emerald-400">
                <span className="text-emerald-500 font-bold">student@kernel-os</span>
                <span className="text-slate-500">:</span>
                <span className="text-cyan-400 font-medium">{entry.path}</span>
                <span className="text-slate-400">$</span>
                <span className="text-white font-semibold">{entry.command}</span>
              </div>
              {entry.output && (
                <pre className="text-slate-300 whitespace-pre-wrap pl-2 font-mono text-[11px] leading-relaxed">
                  {entry.output}
                </pre>
              )}
            </div>
          ))}

          {/* Active Command Line */}
          <form onSubmit={handleSubmit} className="flex items-center space-x-2 pt-1 text-xs">
            <span className="text-emerald-500 font-bold shrink-0">student@kernel-os</span>
            <span className="text-slate-500 shrink-0">:</span>
            <span className="text-cyan-400 font-medium shrink-0">{currentPathStr}</span>
            <span className="text-slate-400 shrink-0">$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-white focus:outline-none caret-emerald-400 font-mono"
              autoFocus
              placeholder="Type command (e.g. ls, cat main.c, mkdir projects)..."
            />
          </form>

          <div ref={bottomRef} />
        </div>

        {/* Quick Command Pills Bar */}
        <div className="bg-[#0b101c] px-4 py-2 border-t border-slate-800/80 flex items-center space-x-2 overflow-x-auto text-[11px]">
          <span className="text-slate-500 uppercase text-[10px] shrink-0 font-bold">Quick Run:</span>
          {quickCommands.map((cmd) => (
            <button
              key={cmd}
              onClick={() => runTerminalCommand(cmd)}
              className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-800 hover:border-slate-700 whitespace-nowrap transition-colors"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

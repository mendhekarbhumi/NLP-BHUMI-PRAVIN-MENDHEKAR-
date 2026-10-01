import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Server,
  Code2,
  Terminal,
  BookOpen,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'playground' | 'vscode' | 'devhub' | 'rules' | 'batch';
  setActiveTab: (tab: 'playground' | 'vscode' | 'devhub' | 'rules' | 'batch') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const [serverHealth, setServerHealth] = useState<{
    status: string;
    port: number;
    uptimeSeconds: number;
    rulesCount: number;
    geminiEnabled: boolean;
  } | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);

  const checkHealth = async () => {
    setLoadingHealth(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setServerHealth(data);
      } else {
        setServerHealth(null);
      }
    } catch {
      setServerHealth(null);
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-amber-500 to-emerald-400 p-[2px] shadow-lg shadow-rose-950/40">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-1.5 drop-shadow-sm">
                  Scam Detection
                  <span className="text-xs px-2 py-0.5 rounded-md font-mono uppercase bg-gradient-to-r from-rose-500/20 to-amber-500/20 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-950/40 tracking-wider">
                    NLP
                  </span>
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                  Localhost Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                NLP Linguistic Fraud Classifier for VS Code
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('playground')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center space-x-1.5 ${
                activeTab === 'playground'
                  ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>NLP Scanner</span>
            </button>

            <button
              onClick={() => setActiveTab('vscode')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center space-x-1.5 ${
                activeTab === 'vscode'
                  ? 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>VS Code Simulator</span>
            </button>

            <button
              onClick={() => setActiveTab('devhub')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center space-x-1.5 ${
                activeTab === 'devhub'
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Localhost API & Extension</span>
            </button>

            <button
              onClick={() => setActiveTab('rules')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center space-x-1.5 ${
                activeTab === 'rules'
                  ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Rules Matrix</span>
            </button>

            <button
              onClick={() => setActiveTab('batch')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center space-x-1.5 ${
                activeTab === 'batch'
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Batch Audit</span>
            </button>
          </nav>

          {/* Right Action & Localhost Status Pill */}
          <div className="flex items-center space-x-3">
            <div
              onClick={checkHealth}
              title="Click to refresh Localhost server status"
              className="cursor-pointer group flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 text-xs"
            >
              <div className="flex items-center space-x-1.5">
                <span className="relative flex h-2 w-2">
                  {serverHealth ? (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </>
                  ) : (
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  )}
                </span>
                <Server className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200" />
                <span className="font-mono text-slate-300">
                  localhost:{serverHealth ? serverHealth.port : '3000'}
                </span>
              </div>
              <span className="text-slate-500">|</span>
              <span
                className={`font-semibold ${
                  serverHealth ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {serverHealth ? 'ONLINE' : 'CHECKING'}
              </span>
              <RefreshCw
                className={`w-3 h-3 text-slate-500 group-hover:text-slate-300 ${
                  loadingHealth ? 'animate-spin' : ''
                }`}
              />
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto space-x-2 py-2 border-t border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('playground')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'playground' ? 'bg-rose-500 text-white' : 'text-slate-400'
            }`}
          >
            Scanner
          </button>
          <button
            onClick={() => setActiveTab('vscode')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'vscode' ? 'bg-blue-500 text-white' : 'text-slate-400'
            }`}
          >
            VS Code IDE
          </button>
          <button
            onClick={() => setActiveTab('devhub')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'devhub' ? 'bg-emerald-500 text-white' : 'text-slate-400'
            }`}
          >
            Localhost Hub
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'rules' ? 'bg-purple-500 text-white' : 'text-slate-400'
            }`}
          >
            Rules ({serverHealth?.rulesCount || 11})
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'batch' ? 'bg-amber-500 text-white' : 'text-slate-400'
            }`}
          >
            Batch
          </button>
        </div>
      </div>
    </header>
  );
};

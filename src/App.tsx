import React, { useState } from 'react';
import { Navbar } from './components/Navbar.js';
import { ScamPlayground } from './components/ScamPlayground.js';
import { VSCodeSimulator } from './components/VSCodeSimulator.js';
import { DevLocalhostHub } from './components/DevLocalhostHub.js';
import { RulesCatalogueModal } from './components/RulesCatalogueModal.js';
import { BatchScannerModal } from './components/BatchScannerModal.js';
import { ScamAnalysisResult } from './types/scam.js';
import { Shield, Terminal, Code2, Server } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'playground' | 'vscode' | 'devhub' | 'rules' | 'batch'>('playground');
  const [currentResult, setCurrentResult] = useState<ScamAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async (
    text: string,
    sensitivity: 'low' | 'balanced' | 'high' = 'balanced',
    useDeepAi = true
  ): Promise<ScamAnalysisResult> => {
    setLoading(true);
    try {
      const res = await fetch('/api/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          sensitivity,
          useDeepAi,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data: ScamAnalysisResult = await res.json();
      setCurrentResult(data);
      return data;
    } catch (err: any) {
      console.error('Scan failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500/30 selection:text-rose-200">
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'playground' && (
          <ScamPlayground
            onScan={handleScan}
            currentResult={currentResult}
            loading={loading}
          />
        )}

        {activeTab === 'vscode' && (
          <VSCodeSimulator
            onScanRequest={(text) => handleScan(text, 'balanced', true)}
          />
        )}

        {activeTab === 'devhub' && <DevLocalhostHub />}

        {activeTab === 'rules' && <RulesCatalogueModal />}

        {activeTab === 'batch' && <BatchScannerModal />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-rose-500" />
            <span className="text-slate-300 font-semibold">ScamNLP</span>
            <span>—</span>
            <span>NLP Scam & Phishing Detection Engine for VS Code</span>
          </div>

          <div className="flex items-center space-x-4 font-mono text-[11px]">
            <span className="flex items-center space-x-1 text-slate-400">
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span>http://localhost:3000/api/detect</span>
            </span>
            <span className="text-slate-700">•</span>
            <span>CORS Enabled</span>
            <span className="text-slate-700">•</span>
            <span>LSP Diagnostics</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

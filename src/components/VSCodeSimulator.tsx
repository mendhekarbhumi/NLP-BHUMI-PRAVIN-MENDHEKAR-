import React, { useState, useEffect } from 'react';
import {
  FileText,
  FileCode,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  Wand2,
  Terminal,
  Settings,
  Search,
  FolderOpen,
  Copy,
  Check,
} from 'lucide-react';
import { ScamAnalysisResult, ScamDiagnostic } from '../types/scam.js';

interface VSCodeSimulatorProps {
  onScanRequest: (text: string) => Promise<ScamAnalysisResult>;
}

interface SimulatedFile {
  name: string;
  type: 'eml' | 'ts' | 'txt' | 'md';
  content: string;
}

const DEFAULT_FILES: SimulatedFile[] = [
  {
    name: 'geek_squad_invoice.eml',
    type: 'eml',
    content: `Subject: Geek Squad Support: Renewal Confirmation #GS-8849201

Dear Customer,

Thank you for choosing Geek Squad Total Tech Care. Your annual subscription has been automatically renewed for $499.00 USD. This amount has been deducted from your bank balance.

If you did not authorize this charge, you must contact our cancellation desk immediately within 24 hours at toll-free 1-800-555-0194 to reverse the transaction. Do not ignore this message or the charges will be permanent.

Order ID: GS-992144
Payment Method: Direct Bank Debit
Cancellation Helpline: 1-800-555-0194 (Open 24/7)

Geek Squad Tech Team`,
  },
  {
    name: 'payment_config.ts',
    type: 'ts',
    content: `// Payment integration gateway
export const GATEWAY_CONFIG = {
  merchantId: "M-991244",
  // Verify your account credentials here:
  authEndpoint: "https://paypa1-security-verification.xyz/oauth/v2",
  timeout: 5000,
  // Note: confirm your password to refresh secret token
  retryPolicy: { maxRetries: 3 }
};`,
  },
  {
    name: 'crypto_giveaway.txt',
    type: 'txt',
    content: `OFFICIAL CELEBRATION AIRDROP!
Send 0.5 BTC and get double your crypto returned immediately to your wallet!
Connect wallet to claim free bonus tokens within 24 hours.`,
  },
  {
    name: 'team_update.md',
    type: 'md',
    content: `# Sprint 24 Engineering Sync
Meeting at 10:00 AM PST this Thursday.
- Reviewing system telemetry
- Planning database schema migration
Google Meet: https://meet.google.com/abc-defg-hij`,
  },
];

export const VSCodeSimulator: React.FC<VSCodeSimulatorProps> = ({ onScanRequest }) => {
  const [files, setFiles] = useState<SimulatedFile[]>(DEFAULT_FILES);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [activeEditorText, setActiveEditorText] = useState(DEFAULT_FILES[0].content);
  const [scanResult, setScanResult] = useState<ScamAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDiagnostic, setSelectedDiagnostic] = useState<ScamDiagnostic | null>(null);
  const [bottomTab, setBottomTab] = useState<'problems' | 'output' | 'terminal'>('problems');
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const activeFile = files[activeFileIndex] || files[0];

  const handleScan = async (textToScan: string) => {
    setLoading(true);
    try {
      const result = await onScanRequest(textToScan);
      setScanResult(result);
      if (result.diagnostics.length > 0) {
        setSelectedDiagnostic(result.diagnostics[0]);
      } else {
        setSelectedDiagnostic(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleScan(activeFile.content);
    setActiveEditorText(activeFile.content);
  }, [activeFileIndex]);

  const handleSwitchFile = (index: number) => {
    setActiveFileIndex(index);
  };

  const handleApplyQuickFix = (diag: ScamDiagnostic) => {
    const lines = activeEditorText.split('\n');
    const lineIdx = diag.line - 1;
    if (lines[lineIdx]) {
      const lineStr = lines[lineIdx];
      const before = lineStr.substring(0, diag.character);
      const after = lineStr.substring(diag.character + diag.length);
      lines[lineIdx] = `${before}[REDACTED_SCAM_TOKEN]${after}`;
      const updated = lines.join('\n');
      setActiveEditorText(updated);

      // Update in files array
      const updatedFiles = [...files];
      updatedFiles[activeFileIndex] = { ...activeFile, content: updated };
      setFiles(updatedFiles);

      // Re-scan
      handleScan(updated);
    }
  };

  const handleResetCurrentFile = () => {
    const original = DEFAULT_FILES[activeFileIndex].content;
    setActiveEditorText(original);
    const updatedFiles = [...files];
    updatedFiles[activeFileIndex] = { ...activeFile, content: original };
    setFiles(updatedFiles);
    handleScan(original);
  };

  // Render text with wavy squiggly lines
  const renderEditorLines = () => {
    const lines = activeEditorText.split('\n');
    return lines.map((lineContent, lineIdx) => {
      const currentLineNum = lineIdx + 1;
      const diagsOnLine = (scanResult?.diagnostics || []).filter(
        (d) => d.line === currentLineNum
      );

      return (
        <div key={lineIdx} className="flex font-mono text-xs leading-6 hover:bg-slate-800/30">
          {/* Line number gutter */}
          <div className="w-10 select-none text-right pr-3 text-slate-600 font-mono">
            {currentLineNum}
          </div>

          {/* Line text */}
          <div className="flex-1 whitespace-pre-wrap break-all relative">
            {diagsOnLine.length === 0 ? (
              <span className="text-slate-200">{lineContent || ' '}</span>
            ) : (
              highlightLineWithDiagnostics(lineContent, diagsOnLine)
            )}
          </div>
        </div>
      );
    });
  };

  const highlightLineWithDiagnostics = (lineStr: string, diags: ScamDiagnostic[]) => {
    if (diags.length === 0) return <span>{lineStr}</span>;

    // Sort diags by character offset
    const sorted = [...diags].sort((a, b) => a.character - b.character);
    const elements: React.ReactNode[] = [];
    let lastIdx = 0;

    sorted.forEach((diag, i) => {
      if (diag.character > lastIdx) {
        elements.push(
          <span key={`text-${i}`} className="text-slate-200">
            {lineStr.substring(lastIdx, diag.character)}
          </span>
        );
      }

      const matchText = lineStr.substring(diag.character, diag.character + diag.length);
      const isSelected = selectedDiagnostic === diag;

      elements.push(
        <span
          key={`diag-${i}`}
          onClick={() => setSelectedDiagnostic(diag)}
          className={`cursor-pointer group relative font-medium underline decoration-wavy decoration-2 transition ${
            diag.severity === 'error'
              ? 'decoration-rose-500 text-rose-300 bg-rose-500/10'
              : 'decoration-amber-400 text-amber-300 bg-amber-500/10'
          } ${isSelected ? 'ring-1 ring-blue-400 rounded-sm' : ''}`}
        >
          {matchText || diag.matchedText}
        </span>
      );

      lastIdx = diag.character + diag.length;
    });

    if (lastIdx < lineStr.length) {
      elements.push(
        <span key="tail" className="text-slate-200">
          {lineStr.substring(lastIdx)}
        </span>
      );
    }

    return elements;
  };

  return (
    <div className="space-y-4">
      {/* Simulation Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/40">
              Interactive Workbench
            </span>
            <h3 className="text-sm font-semibold text-slate-200">
              Live VS Code Extension Simulator
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulates how ScamNLP reports inline diagnostics, wavy squiggles, hover tooltips, and QuickFix actions inside VS Code on Localhost.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleScan(activeEditorText)}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center space-x-1.5 transition disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Scan Active Buffer</span>
          </button>
          <button
            onClick={handleResetCurrentFile}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center space-x-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset File</span>
          </button>
        </div>
      </div>

      {/* Main VS Code Chrome Container */}
      <div className="rounded-xl overflow-hidden border border-slate-700/80 bg-[#1e1e1e] shadow-2xl flex flex-col font-sans">
        {/* Title Bar */}
        <div className="bg-[#2d2d2d] px-3 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 select-none">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
            </div>
            <span className="font-mono text-[11px] text-slate-300 pl-2">
              Visual Studio Code — [ScamNLP Guard]
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-2 text-[11px] text-slate-400">
            <span>Server:</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/60 text-emerald-400 font-mono">
              http://localhost:3000
            </span>
          </div>
        </div>

        {/* VS Code Body: Activity Bar + Sidebar + Editor */}
        <div className="flex min-h-[480px]">
          {/* Left Mini Activity Bar */}
          <div className="w-12 bg-[#333333] border-r border-[#252526] flex flex-col items-center py-3 space-y-4 select-none">
            <button className="text-slate-300 hover:text-white p-1 rounded" title="Explorer">
              <FolderOpen className="w-5 h-5 text-slate-300" />
            </button>
            <button className="text-slate-500 hover:text-slate-300 p-1 rounded" title="Search">
              <Search className="w-5 h-5" />
            </button>
            <button
              className="text-rose-400 p-1 rounded relative"
              title="ScamNLP Localhost Guard (Active)"
            >
              <ShieldAlert className="w-5 h-5" />
              {scanResult && scanResult.diagnostics.length > 0 && (
                <span className="absolute -top-1 -right-1 px-1 text-[9px] rounded-full bg-rose-600 text-white font-mono">
                  {scanResult.diagnostics.length}
                </span>
              )}
            </button>
            <div className="flex-1" />
            <button className="text-slate-500 hover:text-slate-300 p-1 rounded" title="Settings">
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* Explorer Side Pane */}
          <div className="w-48 bg-[#252526] border-r border-[#1e1e1e] p-2 flex flex-col text-xs select-none hidden sm:flex">
            <div className="font-bold text-[10px] tracking-wider text-slate-400 uppercase px-2 py-1 mb-1">
              EXPLORER: SCAM-AUDIT
            </div>
            <div className="space-y-0.5">
              {files.map((file, idx) => {
                const isActive = idx === activeFileIndex;
                const Icon = file.type === 'ts' ? FileCode : FileText;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSwitchFile(idx)}
                    className={`w-full text-left px-2 py-1.5 rounded flex items-center space-x-1.5 transition ${
                      isActive
                        ? 'bg-[#37373d] text-white font-medium'
                        : 'text-slate-400 hover:bg-[#2a2d2e] hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Editor Area */}
          <div className="flex-1 flex flex-col bg-[#1e1e1e]">
            {/* Editor Tabs */}
            <div className="bg-[#252526] border-b border-[#1e1e1e] flex items-center overflow-x-auto select-none">
              {files.map((file, idx) => {
                const isActive = idx === activeFileIndex;
                const Icon = file.type === 'ts' ? FileCode : FileText;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSwitchFile(idx)}
                    className={`px-3 py-2 text-xs flex items-center space-x-1.5 border-r border-[#1e1e1e] border-t-2 ${
                      isActive
                        ? 'bg-[#1e1e1e] text-white border-t-blue-500'
                        : 'bg-[#2d2d2d] text-slate-400 border-t-transparent hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-blue-400" />
                    <span>{file.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Split: Editor Content & Hover Diagnostic Inspector */}
            <div className="flex-1 p-3 overflow-y-auto max-h-96">
              {renderEditorLines()}
            </div>

            {/* Simulated VS Code Hover Tooltip / Quick Action Popover */}
            {selectedDiagnostic && (
              <div className="m-3 p-3 rounded-lg bg-[#252526] border border-blue-500/40 shadow-xl text-xs space-y-2 select-text">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {selectedDiagnostic.severity === 'error' ? (
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    )}
                    <span className="font-semibold text-slate-200">
                      {selectedDiagnostic.message}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {selectedDiagnostic.ruleId}
                  </span>
                </div>

                <div className="text-slate-400 text-[11px] leading-relaxed pl-6">
                  {selectedDiagnostic.suggestedFix ||
                    'Review suspicious phraseology for social engineering indicators.'}
                </div>

                <div className="flex items-center justify-between pt-1 pl-6">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Line {selectedDiagnostic.line}, Col {selectedDiagnostic.character} • Matched: &quot;
                    {selectedDiagnostic.matchedText}&quot;
                  </span>
                  <button
                    onClick={() => handleApplyQuickFix(selectedDiagnostic)}
                    className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-medium flex items-center space-x-1 transition"
                  >
                    <Wand2 className="w-3 h-3" />
                    <span>Quick Fix: Redact Token</span>
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Panel (Problems, Output, Terminal) */}
            <div className="border-t border-[#252526] bg-[#1e1e1e]">
              <div className="flex items-center space-x-4 px-4 pt-2 border-b border-[#252526] text-xs">
                <button
                  onClick={() => setBottomTab('problems')}
                  className={`pb-1.5 font-medium flex items-center space-x-1.5 border-b-2 ${
                    bottomTab === 'problems'
                      ? 'border-blue-500 text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>PROBLEMS</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300">
                    {scanResult?.diagnostics.length || 0}
                  </span>
                </button>

                <button
                  onClick={() => setBottomTab('output')}
                  className={`pb-1.5 font-medium flex items-center space-x-1.5 border-b-2 ${
                    bottomTab === 'output'
                      ? 'border-blue-500 text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>OUTPUT (ScamNLP)</span>
                </button>

                <button
                  onClick={() => setBottomTab('terminal')}
                  className={`pb-1.5 font-medium flex items-center space-x-1.5 border-b-2 ${
                    bottomTab === 'terminal'
                      ? 'border-blue-500 text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>TERMINAL</span>
                </button>
              </div>

              {/* Panel Content */}
              <div className="p-3 text-xs font-mono max-h-40 overflow-y-auto">
                {bottomTab === 'problems' && (
                  <div className="space-y-1">
                    {scanResult?.diagnostics.length === 0 ? (
                      <div className="text-slate-500 flex items-center space-x-2 py-1">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span>No scam or phishing diagnostics detected in active file.</span>
                      </div>
                    ) : (
                      scanResult?.diagnostics.map((diag, dIdx) => (
                        <div
                          key={dIdx}
                          onClick={() => setSelectedDiagnostic(diag)}
                          className="flex items-center space-x-2 py-1 px-1 rounded hover:bg-[#2a2d2e] cursor-pointer text-slate-300"
                        >
                          {diag.severity === 'error' ? (
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          )}
                          <span className="text-slate-400">
                            [{diag.ruleId}] {diag.message}
                          </span>
                          <span className="text-slate-500 text-[11px] ml-auto">
                            [{activeFile.name} {diag.line}:{diag.character}]
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {bottomTab === 'output' && (
                  <div className="space-y-1 text-slate-400 text-[11px]">
                    <div>[23:40:02] [ScamNLP] Extension initialized successfully.</div>
                    <div>[23:40:02] [ScamNLP] REST Client bound to http://localhost:3000/api/detect</div>
                    <div>[23:40:04] [ScamNLP] Scan completed for {activeFile.name} in {scanResult?.processingTimeMs || 12}ms</div>
                    <div className="text-emerald-400">
                      [23:40:04] Engine: {scanResult?.engine} | Score: {scanResult?.scamScore}/100 ({scanResult?.threatLevel})
                    </div>
                  </div>
                )}

                {bottomTab === 'terminal' && (
                  <div className="space-y-2 text-slate-300 text-[11px]">
                    <div className="text-slate-500">
                      # Test scan using local curl from VS Code integrated terminal:
                    </div>
                    <div className="p-2 rounded bg-black/60 border border-slate-800 text-emerald-400 flex items-center justify-between">
                      <code>
                        curl -X POST http://localhost:3000/api/detect -H &quot;Content-Type: application/json&quot; -d &apos;&#123;&quot;text&quot;:&quot;Your account will be suspended within 24 hours&quot;&#125;&apos;
                      </code>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* VS Code Bottom Status Bar */}
        <div className="bg-[#007acc] px-3 py-1 text-[11px] text-white flex items-center justify-between select-none">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setBottomTab('problems')}
              className={`flex items-center space-x-1 px-1.5 py-0.5 rounded font-medium ${
                (scanResult?.scamScore || 0) > 50
                  ? 'bg-rose-600 text-white'
                  : 'bg-black/20 text-white'
              }`}
            >
              <ShieldAlert className="w-3 h-3" />
              <span>
                ScamNLP: {scanResult?.scamScore || 0}% ({scanResult?.threatLevel || 'Safe'})
              </span>
            </button>

            <span className="hidden sm:inline text-blue-200">
              Typology: {scanResult?.scamType || 'Benign'}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-blue-100">
            <span>Ln 1, Col 1</span>
            <span>Spaces: 2</span>
            <span>UTF-8</span>
            <span>{activeFile.type.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

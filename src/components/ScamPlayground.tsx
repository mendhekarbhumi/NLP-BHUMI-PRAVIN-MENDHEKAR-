import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  Zap,
  Play,
  RotateCcw,
  Copy,
  Check,
  Upload,
  FileText,
  Sliders,
  ArrowRight,
  Info,
  ChevronDown,
  Terminal,
} from 'lucide-react';
import { ScamAnalysisResult, ThreatLevel } from '../types/scam.js';
import { NLPDeepDiveRadar } from './NLPDeepDiveRadar.js';

interface ScamPlaygroundProps {
  onScan: (
    text: string,
    sensitivity: 'low' | 'balanced' | 'high',
    useDeepAi: boolean
  ) => Promise<ScamAnalysisResult>;
  currentResult: ScamAnalysisResult | null;
  loading: boolean;
}

export const ScamPlayground: React.FC<ScamPlaygroundProps> = ({
  onScan,
  currentResult,
  loading,
}) => {
  const [inputText, setInputText] = useState('');
  const [sensitivity, setSensitivity] = useState<'low' | 'balanced' | 'high'>('balanced');
  const [useDeepAi, setUseDeepAi] = useState(true);
  const [samples, setSamples] = useState<any[]>([]);
  const [selectedSampleId, setSelectedSampleId] = useState<string>('');
  const [copiedSummary, setCopiedSummary] = useState(false);

  useEffect(() => {
    fetch('/api/samples')
      .then((r) => r.json())
      .then((data) => {
        setSamples(data);
        if (data.length > 0 && !inputText) {
          setSelectedSampleId(data[0].id);
          setInputText(data[0].text);
          // Auto run first scan for instant visual delight
          onScan(data[0].text, 'balanced', true);
        }
      })
      .catch((e) => console.error(e));
  }, []);

  const handleSelectSample = (sampleId: string) => {
    setSelectedSampleId(sampleId);
    const found = samples.find((s) => s.id === sampleId);
    if (found) {
      setInputText(found.text);
      onScan(found.text, sensitivity, useDeepAi);
    }
  };

  const handleRunScan = () => {
    if (!inputText.trim()) return;
    onScan(inputText, sensitivity, useDeepAi);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInputText(content);
      setSelectedSampleId('');
      onScan(content, sensitivity, useDeepAi);
    };
    reader.readAsText(file);
  };

  const handleCopySummary = () => {
    if (!currentResult) return;
    navigator.clipboard.writeText(
      `[ScamNLP Verdict]\nThreat Level: ${currentResult.threatLevel} (${currentResult.scamScore}%)\nType: ${currentResult.scamType}\nSummary: ${currentResult.summary}`
    );
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const getThreatBadge = (level: ThreatLevel, score: number) => {
    switch (level) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
          indicator: 'bg-rose-500',
          label: `CRITICAL THREAT (${score}%)`,
          icon: ShieldAlert,
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-500/20 text-orange-300 border-orange-500/50',
          indicator: 'bg-orange-500',
          label: `HIGH RISK (${score}%)`,
          icon: AlertTriangle,
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
          indicator: 'bg-amber-500',
          label: `SUSPICIOUS (${score}%)`,
          icon: AlertTriangle,
        };
      case 'LOW':
        return {
          bg: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
          indicator: 'bg-blue-500',
          label: `LOW RISK (${score}%)`,
          icon: Info,
        };
      case 'SAFE':
      default:
        return {
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
          indicator: 'bg-emerald-500',
          label: `BENIGN / SAFE (${score}%)`,
          icon: ShieldCheck,
        };
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Presets & Controls Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Preset Selector */}
          <div className="flex-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
              Load Realistic Scam / Phishing Sample Corpus
            </label>
            <div className="relative">
              <select
                value={selectedSampleId}
                onChange={(e) => handleSelectSample(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-rose-500 transition appearance-none cursor-pointer pr-8"
              >
                <option value="">-- Choose sample scenario or paste custom text below --</option>
                {samples.map((s) => (
                  <option key={s.id} value={s.id}>
                    [{s.threat}] {s.title} ({s.category})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Engine Parameters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Sensitivity */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
                NLP Sensitivity
              </label>
              <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 p-1">
                {(['low', 'balanced', 'high'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSensitivity(s);
                      if (inputText.trim()) onScan(inputText, s, useDeepAi);
                    }}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg capitalize transition ${
                      sensitivity === s
                        ? 'bg-slate-800 text-white font-semibold shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Gemini Semantic Reasoning Toggle */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
                Deep Semantic AI
              </label>
              <button
                onClick={() => {
                  const nextVal = !useDeepAi;
                  setUseDeepAi(nextVal);
                  if (inputText.trim()) onScan(inputText, sensitivity, nextVal);
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center space-x-1.5 transition ${
                  useDeepAi
                    ? 'bg-purple-500/10 text-purple-300 border-purple-500/40 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Gemini 3.8 Flash {useDeepAi ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor & Action Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Editor */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Target Communication Buffer
              </span>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <label className="cursor-pointer text-slate-400 hover:text-slate-200 flex items-center space-x-1 px-2 py-1 rounded bg-slate-900 border border-slate-800 transition">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload File</span>
                <input
                  type="file"
                  accept=".txt,.eml,.md,.ts,.js,.json,.log"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => {
                  setInputText('');
                  setSelectedSampleId('');
                }}
                className="text-slate-500 hover:text-slate-300 p-1"
                title="Clear buffer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="relative">
            <textarea
              rows={13}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste suspicious email, SMS, Slack message, or code comment to analyze..."
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-500/80 leading-relaxed resize-none shadow-inner"
            />

            <div className="absolute right-3 bottom-3 flex items-center space-x-2">
              <span className="text-[10px] text-slate-500 font-mono">
                {inputText.length} chars • {inputText.split('\n').length} lines
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500 font-mono">
              REST endpoint: <code className="text-slate-400">POST http://localhost:3000/api/detect</code>
            </span>

            <button
              onClick={handleRunScan}
              disabled={loading || !inputText.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-rose-950/40 transition disabled:opacity-50 cursor-pointer"
            >
              <Play className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Forensic Analyzing...' : 'Run Forensic Scan'}</span>
            </button>
          </div>
        </div>

        {/* Right: Quick Verdict Card */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          {currentResult ? (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex-1 flex flex-col justify-between">
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  {(() => {
                    const badge = getThreatBadge(
                      currentResult.threatLevel,
                      currentResult.scamScore
                    );
                    const Icon = badge.icon;
                    return (
                      <div
                        className={`px-3 py-1.5 rounded-lg border flex items-center space-x-2 ${badge.bg}`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full animate-ping ${badge.indicator}`}
                        />
                        <Icon className="w-4 h-4" />
                        <span className="text-xs font-mono font-bold tracking-wide">
                          {badge.label}
                        </span>
                      </div>
                    );
                  })()}

                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-mono text-slate-400">
                      Confidence: {currentResult.confidence}%
                    </span>
                    <button
                      onClick={handleCopySummary}
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="Copy scan verdict"
                    >
                      {copiedSummary ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Typology & Summary */}
                <div className="pt-3 space-y-2">
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    Primary Forensic Classification:
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {currentResult.scamType}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    {currentResult.summary}
                  </p>
                </div>
              </div>

              {/* Red Flags Quick Tally */}
              <div className="pt-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Key Red Flags ({currentResult.redFlags.length})
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {currentResult.redFlags.map((flag, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-slate-950/90 border border-slate-800/80 text-xs flex items-start space-x-2"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-200">
                          {flag.title}:
                        </span>{' '}
                        <span className="text-slate-400 text-[11px]">
                          {flag.reason}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Meta */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Engine: {currentResult.engine}</span>
                <span>Latency: {currentResult.processingTimeMs}ms</span>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-dashed border-slate-800 flex-1 flex flex-col items-center justify-center text-center space-y-3">
              <ShieldAlert className="w-10 h-10 text-slate-600" />
              <div className="text-sm font-medium text-slate-300">
                Ready for Natural Language Scam Analysis
              </div>
              <p className="text-xs text-slate-500 max-w-sm">
                Paste message content or select a preset above, then click &quot;Run Forensic Scan&quot; or press Ctrl+Enter.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Deep Dive NLP Vectors & Token Heatmap (Only when result exists) */}
      {currentResult && (
        <div className="space-y-6 pt-4">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
              Linguistic Vector Breakdown & Forensics
            </h3>
          </div>

          <NLPDeepDiveRadar
            metrics={currentResult.nlpMetrics}
            tokenHeatmap={currentResult.tokenHeatmap}
            detectedUrls={currentResult.detectedUrls}
            threatLevel={currentResult.threatLevel}
          />

          {/* Safe Alternatives / Developer Remediation */}
          {currentResult.safeAlternatives && currentResult.safeAlternatives.length > 0 && (
            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Recommended Protective Actions & Safe Alternatives
                </h4>
              </div>

              <ul className="space-y-1.5 text-xs text-slate-300">
                {currentResult.safeAlternatives.map((alt, aIdx) => (
                  <li key={aIdx} className="flex items-start space-x-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{alt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

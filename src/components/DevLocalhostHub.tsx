import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Copy,
  Check,
  Download,
  ExternalLink,
  Zap,
  Play,
  Server,
  Code2,
  FileCode,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const DevLocalhostHub: React.FC = () => {
  const [extensionTs, setExtensionTs] = useState('');
  const [packageJson, setPackageJson] = useState('');
  const [pythonScript, setPythonScript] = useState('');
  const [activeCodeTab, setActiveCodeTab] = useState<'extension' | 'package' | 'python' | 'curl'>('extension');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live Ping Tester
  const [testEndpoint, setTestEndpoint] = useState('/api/detect');
  const [testPayload, setTestPayload] = useState('{"text":"URGENT: Your PayPal account will be suspended within 24 hours. Click here to confirm password"}');
  const [testResult, setTestResult] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testLatency, setTestLatency] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/vscode/extension-code')
      .then((r) => r.json())
      .then((data) => {
        setExtensionTs(data.extensionTs || '');
        setPackageJson(data.packageJson || '');
        setPythonScript(data.pythonClient || '');
      })
      .catch((err) => console.error(err));
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRunLocalhostTest = async () => {
    setTestLoading(true);
    setTestResult(null);
    const start = performance.now();
    try {
      let body: any = undefined;
      let method = 'GET';
      if (testEndpoint === '/api/detect') {
        method = 'POST';
        body = testPayload;
      }

      const res = await fetch(testEndpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      const elapsed = Math.round(performance.now() - start);
      setTestLatency(elapsed);
      const data = await res.json();
      setTestResult({
        status: res.status,
        statusText: res.statusText,
        data,
      });
    } catch (err: any) {
      setTestResult({
        status: 0,
        statusText: 'Network Error',
        data: { error: err.message, note: 'Make sure localhost server is active' },
      });
    } finally {
      setTestLoading(false);
    }
  };

  const curlExample = `curl -X POST http://localhost:3000/api/detect \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Your Amazon account has been compromised! Call toll-free 1-800-555-0199 immediately.",
    "sensitivity": "balanced"
  }'`;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1">
                <Server className="w-3 h-3" />
                <span>REST API: Port 3000</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-blue-500/20 text-blue-300 border border-blue-500/40">
                VS Code LSP Ready
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Localhost Integration & VS Code Extension Hub
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Connect Visual Studio Code directly to your running local ScamNLP engine.
              Audit files, inspect emails, and receive real-time squiggly line warnings on save.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleCopy(extensionTs, 'all_ext')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center space-x-2 shadow-lg shadow-blue-950/50 transition"
            >
              {copiedKey === 'all_ext' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Extension Code Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy extension.ts</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3-Step Setup Quick Start */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-400 font-mono text-xs flex items-center justify-center font-bold">
            1
          </div>
          <h4 className="text-sm font-semibold text-slate-200">Start Localhost Engine</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Run the server locally with <code className="text-blue-300 font-mono bg-slate-950 px-1 py-0.5 rounded">npm run dev</code>. It listens on <code className="text-blue-300 font-mono bg-slate-950 px-1 py-0.5 rounded">http://localhost:3000</code> with CORS enabled.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono text-xs flex items-center justify-center font-bold">
            2
          </div>
          <h4 className="text-sm font-semibold text-slate-200">Deploy VS Code Extension</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Paste <code className="text-emerald-300 font-mono bg-slate-950 px-1 py-0.5 rounded">extension.ts</code> and <code className="text-emerald-300 font-mono bg-slate-950 px-1 py-0.5 rounded">package.json</code> into an extension folder, press <kbd className="text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">F5</kbd> to launch.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-400 font-mono text-xs flex items-center justify-center font-bold">
            3
          </div>
          <h4 className="text-sm font-semibold text-slate-200">Real-Time Protection</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Open any email (<code className="text-purple-300 font-mono bg-slate-950 px-1 py-0.5 rounded">.eml</code>), log file, or code snippet. ScamNLP marks phishing tokens with squiggly lines and QuickFix actions.
          </p>
        </div>
      </div>

      {/* Code Repository Browser */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden">
        {/* Tab Headers */}
        <div className="flex items-center justify-between border-b border-slate-800 px-4 bg-slate-950/60">
          <div className="flex items-center space-x-1 py-2">
            <button
              onClick={() => setActiveCodeTab('extension')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition flex items-center space-x-1.5 ${
                activeCodeTab === 'extension'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>extension.ts</span>
            </button>

            <button
              onClick={() => setActiveCodeTab('package')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition flex items-center space-x-1.5 ${
                activeCodeTab === 'package'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>package.json</span>
            </button>

            <button
              onClick={() => setActiveCodeTab('python')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition flex items-center space-x-1.5 ${
                activeCodeTab === 'python'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>scam_guard.py</span>
            </button>

            <button
              onClick={() => setActiveCodeTab('curl')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition flex items-center space-x-1.5 ${
                activeCodeTab === 'curl'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>cURL & Fetch</span>
            </button>
          </div>

          <button
            onClick={() => {
              const text =
                activeCodeTab === 'extension'
                  ? extensionTs
                  : activeCodeTab === 'package'
                  ? packageJson
                  : activeCodeTab === 'python'
                  ? pythonScript
                  : curlExample;
              handleCopy(text, activeCodeTab);
            }}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center space-x-1 transition"
          >
            {copiedKey === activeCodeTab ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy Current File</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content */}
        <div className="p-4 bg-slate-950 font-mono text-xs overflow-x-auto max-h-[380px] leading-relaxed text-slate-300">
          <pre>
            {activeCodeTab === 'extension' && extensionTs}
            {activeCodeTab === 'package' && packageJson}
            {activeCodeTab === 'python' && pythonScript}
            {activeCodeTab === 'curl' && curlExample}
          </pre>
        </div>
      </div>

      {/* Live Localhost API Tester */}
      <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-200">
              Live Localhost API Interactive Sandbox
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Sends real HTTP request to active dev server
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Request Form */}
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">API Endpoint</label>
              <div className="flex items-center space-x-2">
                <select
                  value={testEndpoint}
                  onChange={(e) => setTestEndpoint(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="/api/detect">POST /api/detect (Single Scan)</option>
                  <option value="/api/health">GET /api/health (Server Status)</option>
                  <option value="/api/rules">GET /api/rules (All Heuristic Rules)</option>
                </select>

                <button
                  onClick={handleRunLocalhostTest}
                  disabled={testLoading}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center space-x-1.5 transition disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 ${testLoading ? 'animate-spin' : ''}`} />
                  <span>Send Request</span>
                </button>
              </div>
            </div>

            {testEndpoint === '/api/detect' && (
              <div>
                <label className="text-xs text-slate-400 mb-1 block">JSON Request Body</label>
                <textarea
                  rows={4}
                  value={testPayload}
                  onChange={(e) => setTestPayload(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed resize-none"
                />
              </div>
            )}
          </div>

          {/* Response Inspector */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400">Response Payload</span>
              {testLatency !== null && (
                <span className="text-[11px] font-mono text-emerald-400">
                  HTTP {testResult?.status} • {testLatency}ms
                </span>
              )}
            </div>

            <div className="flex-1 min-h-[140px] max-h-48 p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 overflow-y-auto">
              {testLoading ? (
                <div className="flex items-center space-x-2 text-slate-500 py-4">
                  <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  <span>Connecting to localhost:3000...</span>
                </div>
              ) : testResult ? (
                <pre>{JSON.stringify(testResult.data, null, 2)}</pre>
              ) : (
                <span className="text-slate-600">
                  Click &quot;Send Request&quot; to test the endpoint response in real time.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

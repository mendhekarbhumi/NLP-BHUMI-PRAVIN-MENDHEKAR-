import React, { useState } from 'react';
import {
  Layers,
  Play,
  Download,
  AlertOctagon,
  ShieldCheck,
  CheckCircle,
  FileText,
  Trash2,
  Plus,
} from 'lucide-react';
import { ScamAnalysisResult } from '../types/scam.js';

interface BatchItem {
  id: string;
  name: string;
  text: string;
  status: 'idle' | 'scanning' | 'done' | 'error';
  result?: ScamAnalysisResult;
}

export const BatchScannerModal: React.FC = () => {
  const [items, setItems] = useState<BatchItem[]>([
    {
      id: '1',
      name: 'invoice_geeksquad.eml',
      text: 'Geek Squad Renewal: $499 debited. Call 1-800-555-0194 immediately within 24 hours to cancel.',
      status: 'idle',
    },
    {
      id: '2',
      name: 'slack_ceo_favor.txt',
      text: 'Are you at your desk? Need you to purchase 5 Apple gift cards for the client discreetly right now.',
      status: 'idle',
    },
    {
      id: '3',
      name: 'meeting_notes.md',
      text: 'Hi Sarah, let us review the deployment logs on Thursday sprint meeting. Google meet link attached.',
      status: 'idle',
    },
  ]);

  const [isScanningAll, setIsScanningAll] = useState(false);
  const [selectedResult, setSelectedResult] = useState<ScamAnalysisResult | null>(null);

  const handleScanItem = async (index: number) => {
    const item = items[index];
    if (!item) return;

    setItems((prev) => {
      const copy = [...prev];
      copy[index].status = 'scanning';
      return copy;
    });

    try {
      const res = await fetch('/api/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: item.text, filename: item.name }),
      });
      const data = await res.json();
      setItems((prev) => {
        const copy = [...prev];
        copy[index].status = 'done';
        copy[index].result = data;
        return copy;
      });
    } catch {
      setItems((prev) => {
        const copy = [...prev];
        copy[index].status = 'error';
        return copy;
      });
    }
  };

  const handleScanAll = async () => {
    setIsScanningAll(true);
    for (let i = 0; i < items.length; i++) {
      await handleScanItem(i);
    }
    setIsScanningAll(false);
  };

  const handleAddItem = () => {
    const newId = (items.length + 1).toString();
    setItems([
      ...items,
      {
        id: newId,
        name: `audit_snippet_${newId}.txt`,
        text: 'Enter text to scan...',
        status: 'idle',
      },
    ]);
  };

  const handleDeleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleExportJson = () => {
    const exportData = items.map((i) => ({
      name: i.name,
      text: i.text,
      status: i.status,
      result: i.result,
    }));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scamnlp-batch-audit-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Bulk Pipeline
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {items.length} Files Queued
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Batch Scam & Phishing Auditor
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Audit multiple incoming communication buffers, email archives, or code snippets simultaneously through the ScamNLP pipeline.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleAddItem}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>

          <button
            onClick={handleScanAll}
            disabled={isScanningAll || items.length === 0}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium flex items-center space-x-1.5 transition disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${isScanningAll ? 'animate-spin' : ''}`} />
            <span>Audit All Queue</span>
          </button>

          <button
            onClick={handleExportJson}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Items Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 font-mono">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Filename / Buffer</th>
                <th className="py-3 px-4">Sample Snippet</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Scam Score</th>
                <th className="py-3 px-4">Threat Level</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {items.map((item, idx) => {
                const res = item.result;
                const isErrorThreat = res && (res.threatLevel === 'CRITICAL' || res.threatLevel === 'HIGH');
                return (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-semibold text-slate-200 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-blue-400" />
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setItems((prev) => {
                              const copy = [...prev];
                              copy[idx].name = val;
                              return copy;
                            });
                          }}
                          className="bg-transparent border-b border-transparent hover:border-slate-700 focus:border-blue-500 focus:outline-none text-slate-200"
                        />
                      </div>
                    </td>

                    <td className="py-3 px-4 max-w-xs truncate text-slate-400">
                      {item.text}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {item.status === 'scanning' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 animate-pulse">
                          Scanning...
                        </span>
                      ) : item.status === 'done' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300">
                          Complete
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                          Pending
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center font-bold">
                      {res ? (
                        <span
                          className={
                            isErrorThreat
                              ? 'text-rose-400'
                              : res.scamScore > 20
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }
                        >
                          {res.scamScore}%
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {res ? (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isErrorThreat
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : res.threatLevel === 'SAFE'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {res.threatLevel}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                      {res && (
                        <button
                          onClick={() => setSelectedResult(res)}
                          className="px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 text-[11px] transition"
                        >
                          Inspect
                        </button>
                      )}

                      <button
                        onClick={() => handleScanItem(idx)}
                        disabled={item.status === 'scanning'}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition"
                      >
                        Scan
                      </button>

                      <button
                        onClick={() => handleDeleteItem(idx)}
                        className="p-1 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Inspection Modal Preview */}
      {selectedResult && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-blue-500/50 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-white">
                Detailed Inspection: {selectedResult.scamType}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                Score: {selectedResult.scamScore}/100
              </span>
            </div>
            <button
              onClick={() => setSelectedResult(null)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
            >
              Close
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {selectedResult.summary}
          </p>

          <div className="space-y-2">
            <span className="text-[11px] uppercase font-mono text-slate-400 block">
              Flagged Red Flags:
            </span>
            {selectedResult.redFlags.map((rf, rIdx) => (
              <div
                key={rIdx}
                className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-sans space-y-1"
              >
                <div className="font-semibold text-rose-300">{rf.title}</div>
                <div className="text-slate-400 text-[11px]">{rf.reason}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

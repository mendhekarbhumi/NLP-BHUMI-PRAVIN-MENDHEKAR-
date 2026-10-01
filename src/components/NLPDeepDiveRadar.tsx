import React from 'react';
import {
  NlpMetrics,
  DetectedUrl,
  TokenHeatmapItem,
  ThreatLevel,
} from '../types/scam.js';
import {
  Gauge,
  AlertOctagon,
  Clock,
  Landmark,
  CreditCard,
  KeyRound,
  ShieldCheck,
  Link2,
  ExternalLink,
  Flame,
} from 'lucide-react';

interface NLPDeepDiveRadarProps {
  metrics: NlpMetrics;
  tokenHeatmap: TokenHeatmapItem[];
  detectedUrls: DetectedUrl[];
  threatLevel: ThreatLevel;
}

export const NLPDeepDiveRadar: React.FC<NLPDeepDiveRadarProps> = ({
  metrics,
  tokenHeatmap,
  detectedUrls,
  threatLevel,
}) => {
  const metricCards = [
    {
      label: 'Urgency & Pressure Index',
      value: metrics.urgencyIndex,
      icon: Clock,
      color: metrics.urgencyIndex > 60 ? 'text-rose-400' : 'text-amber-400',
      bgColor: metrics.urgencyIndex > 60 ? 'bg-rose-500/10' : 'bg-amber-500/10',
      barColor: metrics.urgencyIndex > 60 ? 'bg-rose-500' : 'bg-amber-500',
      desc: 'Artificial time constraints, countdown deadlines, and panic-inducing triggers.',
    },
    {
      label: 'Authority Impersonation',
      value: metrics.authorityScore,
      icon: Landmark,
      color: metrics.authorityScore > 50 ? 'text-rose-400' : 'text-blue-400',
      bgColor: metrics.authorityScore > 50 ? 'bg-rose-500/10' : 'bg-blue-500/10',
      barColor: metrics.authorityScore > 50 ? 'bg-rose-500' : 'bg-blue-500',
      desc: 'Impersonation of corporate brands, government agencies, banks, or executives.',
    },
    {
      label: 'Financial Drain Pressure',
      value: metrics.financialCoercionScore,
      icon: CreditCard,
      color: metrics.financialCoercionScore > 50 ? 'text-rose-400' : 'text-amber-400',
      bgColor: metrics.financialCoercionScore > 50 ? 'bg-rose-500/10' : 'bg-amber-500/10',
      barColor: metrics.financialCoercionScore > 50 ? 'bg-rose-500' : 'bg-amber-500',
      desc: 'Demands for gift cards, irreversible crypto transfers, wires, or upfront clearance fees.',
    },
    {
      label: 'Credential Harvester Vector',
      value: metrics.credentialHarvestScore,
      icon: KeyRound,
      color: metrics.credentialHarvestScore > 50 ? 'text-rose-400' : 'text-cyan-400',
      bgColor: metrics.credentialHarvestScore > 50 ? 'bg-rose-500/10' : 'bg-cyan-500/10',
      barColor: metrics.credentialHarvestScore > 50 ? 'bg-rose-500' : 'bg-cyan-500',
      desc: 'Phrasing targeted at siphoning passwords, 2FA codes, PINs, or identity documents.',
    },
    {
      label: 'Syntactic Entropy & Casing',
      value: metrics.syntacticEntropyScore,
      icon: Gauge,
      color: metrics.syntacticEntropyScore > 40 ? 'text-amber-400' : 'text-emerald-400',
      bgColor: metrics.syntacticEntropyScore > 40 ? 'bg-amber-500/10' : 'bg-emerald-500/10',
      barColor: metrics.syntacticEntropyScore > 40 ? 'bg-amber-500' : 'bg-emerald-500',
      desc: 'ALL-CAPS ratios, excessive exclamation marks, and typographical shock tactics.',
    },
    {
      label: 'Threat & Extortion Tone',
      value: metrics.threatLanguageScore,
      icon: AlertOctagon,
      color: metrics.threatLanguageScore > 30 ? 'text-rose-400' : 'text-slate-400',
      bgColor: metrics.threatLanguageScore > 30 ? 'bg-rose-500/10' : 'bg-slate-800/40',
      barColor: metrics.threatLanguageScore > 30 ? 'bg-rose-500' : 'bg-slate-600',
      desc: 'Coercive mentions of arrest warrants, police intervention, webcam blackmail, or account loss.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 6-Vector Radar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`p-1.5 rounded-lg ${card.bgColor}`}>
                      <Icon className={`w-4 h-4 ${card.color}`} />
                    </div>
                    <span className="text-xs font-medium text-slate-200">{card.label}</span>
                  </div>
                  <span className={`text-sm font-mono font-bold ${card.color}`}>
                    {card.value}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                  {card.desc}
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${card.barColor}`}
                  style={{ width: `${Math.max(4, card.value)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Token Heatmap & Linguistic Density */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Linguistic Token Risk Heatmap
            </h4>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {tokenHeatmap.filter((t) => t.isHighlighted).length} Flagged Token Clusters
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Hover over highlighted tokens to inspect linguistic classification category and risk weight.
        </p>

        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-xs leading-relaxed max-h-52 overflow-y-auto break-words select-text">
          {tokenHeatmap.map((item, index) => {
            if (!item.isHighlighted) {
              return (
                <span key={index} className="text-slate-400">
                  {item.token}
                </span>
              );
            }

            const isHigh = item.riskWeight > 0.7;
            const highlightClass = isHigh
              ? 'bg-rose-500/20 text-rose-300 border-b-2 border-rose-500 font-semibold px-0.5 rounded-sm'
              : 'bg-amber-500/20 text-amber-300 border-b-2 border-amber-500 px-0.5 rounded-sm';

            return (
              <span
                key={index}
                title={`[${item.category || 'RISK_TOKEN'}] Risk weight: ${(
                  item.riskWeight * 100
                ).toFixed(0)}%`}
                className={`${highlightClass} inline-block transition cursor-help hover:scale-105`}
              >
                {item.token}
              </span>
            );
          })}
        </div>
      </div>

      {/* URL Forensic Analysis */}
      {detectedUrls.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5">
          <div className="flex items-center space-x-2 mb-3">
            <Link2 className="w-4 h-4 text-blue-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Extracted URL & Domain Forensics ({detectedUrls.length})
            </h4>
          </div>

          <div className="space-y-2">
            {detectedUrls.map((urlItem, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono ${
                  urlItem.suspicious
                    ? 'bg-rose-950/20 border-rose-900/50 text-rose-200'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2 overflow-hidden">
                  {urlItem.suspicious ? (
                    <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  <span className="truncate">{urlItem.url}</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  {urlItem.flags.length > 0 ? (
                    urlItem.flags.map((flag, fIdx) => (
                      <span
                        key={fIdx}
                        className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-[10px] text-rose-300"
                      >
                        {flag}
                      </span>
                    ))
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-300">
                      Standard FQDN
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

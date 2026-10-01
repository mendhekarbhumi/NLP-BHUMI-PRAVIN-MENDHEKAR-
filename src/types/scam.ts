export type ThreatLevel = 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ScamCategory =
  | 'PHISHING'
  | 'BEC_WIRE_FRAUD'
  | 'CRYPTO_GIVEAWAY'
  | 'TECH_SUPPORT'
  | 'ADVANCE_FEE'
  | 'EXTORTION'
  | 'CREDENTIAL_HARVEST'
  | 'URGENT_CALL_TO_ACTION'
  | 'SUSPICIOUS_PAYMENT'
  | 'TYPOSQUAT_LINK'
  | 'CLEAN';

export interface ScamDiagnostic {
  line: number;
  character: number;
  length: number;
  matchedText: string;
  category: string;
  severity: 'information' | 'warning' | 'error';
  message: string;
  ruleId: string;
  suggestedFix?: string;
}

export interface NlpMetrics {
  urgencyIndex: number; // 0-100
  authorityScore: number; // 0-100
  financialCoercionScore: number; // 0-100
  credentialHarvestScore: number; // 0-100
  syntacticEntropyScore: number; // 0-100
  threatLanguageScore: number; // 0-100
}

export interface DetectedUrl {
  url: string;
  suspicious: boolean;
  flags: string[];
}

export interface RedFlag {
  title: string;
  reason: string;
  snippet: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface TokenHeatmapItem {
  token: string;
  riskWeight: number; // 0 to 1
  isHighlighted: boolean;
  category?: string;
}

export interface ScamAnalysisResult {
  scamScore: number; // 0 - 100
  threatLevel: ThreatLevel;
  scamType: string;
  confidence: number; // 0 - 100
  summary: string;
  nlpMetrics: NlpMetrics;
  diagnostics: ScamDiagnostic[];
  redFlags: RedFlag[];
  safeAlternatives: string[];
  detectedUrls: DetectedUrl[];
  tokenHeatmap: TokenHeatmapItem[];
  engine: 'hybrid-gemini-nlp' | 'local-heuristic-nlp';
  processingTimeMs: number;
  timestamp: string;
}

export interface ScamDetectionRequest {
  text: string;
  filename?: string;
  sensitivity?: 'low' | 'balanced' | 'high';
  useDeepAi?: boolean;
}

export interface NlpRule {
  id: string;
  name: string;
  category: ScamCategory;
  patternDescription: string;
  weight: number;
  severity: 'information' | 'warning' | 'error';
  explanation: string;
  examples: string[];
}

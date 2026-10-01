import {
  ScamAnalysisResult,
  ScamCategory,
  ScamDiagnostic,
  NlpMetrics,
  RedFlag,
  DetectedUrl,
  TokenHeatmapItem,
  ThreatLevel,
  NlpRule,
} from '../src/types/scam.js';

interface InternalRule {
  id: string;
  name: string;
  category: ScamCategory;
  pattern: RegExp;
  weight: number;
  severity: 'information' | 'warning' | 'error';
  explanation: string;
  examples: string[];
  fixRecommendation?: string;
}

export const NLP_RULES: InternalRule[] = [
  {
    id: 'URG-001',
    name: 'Artificial Time Pressure & Expiration',
    category: 'URGENT_CALL_TO_ACTION',
    pattern: /\b(within\s+(?:24|12|48|2|1)\s*(?:hours|hrs|minutes|mins)|immediately|act\s+now|immediate\s+action\s+required|final\s+notice|time\s+sensitive|account\s+will\s+be\s+(?:suspended|terminated|deleted|frozen|closed))\b/gi,
    weight: 22,
    severity: 'error',
    explanation: 'Scammers induce panic with false deadlines to prevent victim fact-checking and critical deliberation.',
    examples: ['Your account will be suspended within 24 hours', 'Immediate action required: Act now!'],
    fixRecommendation: 'Remove false urgency indicators or verify authentic account status through official provider portals.',
  },
  {
    id: 'AUT-001',
    name: 'High-Value Institution Impersonation',
    category: 'PHISHING',
    pattern: /\b(internal\s+revenue\s+service|irs|geek\s+squad|paypal\s+security|apple\s+support|amazon\s+(?:billing|fraud|account)|microsoft\s+technical\s+support|federal\s+trade\s+commission|fbi\s+cyber|chase\s+bank|wells\s+fargo|bank\s+of\s+america)\b/gi,
    weight: 20,
    severity: 'error',
    explanation: 'Exploitation of recognized brands and authorities to engender unearned obedience and credibility.',
    examples: ['Geek Squad Renewal Confirmation', 'Internal Revenue Service urgent notice'],
    fixRecommendation: 'Check the actual sender domain and do not rely on header display names.',
  },
  {
    id: 'FIN-001',
    name: 'Irreversible Alternative Payment Vectors',
    category: 'SUSPICIOUS_PAYMENT',
    pattern: /\b((?:target|steam|apple|itunes|google\s*play|amazon)\s+(?:gift\s*card|code)s?|western\s+union|moneygram|wire\s+transfer|cashier'?s\s+check|zelle|cash\s*app|bitcoin\s+atm|deposit\s+cash)\b/gi,
    weight: 35,
    severity: 'error',
    explanation: 'Requesting payment via non-reversible channels like retail gift cards or money wires is a hallmark of fraud.',
    examples: ['Pay the balance using Apple gift cards', 'Send via Western Union to clear the fee'],
    fixRecommendation: 'Legitimate institutions never request retail gift cards or wire transfers for debt resolution.',
  },
  {
    id: 'CRY-001',
    name: 'Cryptocurrency Giveaway / Doubler Trap',
    category: 'CRYPTO_GIVEAWAY',
    pattern: /\b(send\s+(?:0\.\d+|[1-9]\d*)\s*(?:btc|eth|sol|usdt)\s+and\s+get|double\s+your\s+(?:crypto|bitcoin|investment)|elon\s+musk\s+(?:giveaway|crypto)|airdrop\s+claim\s+instant|connect\s+wallet\s+to\s+claim\s+free)\b/gi,
    weight: 40,
    severity: 'error',
    explanation: 'Linguistic bait promising guaranteed crypto multipliers or fake celebrity giveaways.',
    examples: ['Send 0.5 BTC and get 1.0 BTC returned immediately', 'Elon Musk crypto airdrop claim'],
    fixRecommendation: 'Never send cryptocurrency expecting a return multiplier; transactions on blockchain are permanent.',
  },
  {
    id: 'SEC-001',
    name: 'Credential Harvesting & 2FA Extraction',
    category: 'CREDENTIAL_HARVEST',
    pattern: /\b(verify\s+your\s+(?:identity|account|credentials|password)|confirm\s+your\s+(?:password|pin|security\s+code)|enter\s+the\s+(?:one[- ]time|otp|2fa|verification)\s+code|click\s+(?:here|below)\s+to\s+(?:log\s*in|restore\s+access)|reset\s+password\s+now)\b/gi,
    weight: 28,
    severity: 'error',
    explanation: 'Direct attempts to siphon master credentials, passwords, or one-time verification tokens.',
    examples: ['Click below to verify your account password', 'Provide the 6-digit OTP code to continue'],
    fixRecommendation: 'Never share OTP codes or click unverified login links in unsolicited messages.',
  },
  {
    id: 'EXT-001',
    name: 'Extortion & Coercive Blackmail Language',
    category: 'EXTORTION',
    pattern: /\b(i\s+recorded\s+you|compromised\s+your\s+webcam|pegasus\s+spyware|send\s+\$?\d+\s+in\s+bitcoin\s+or\s+i\s+(?:release|leak|send\s+to\s+your\s+contacts)|arrest\s+warrant\s+issued|local\s+police\s+will\s+arrive)\b/gi,
    weight: 45,
    severity: 'error',
    explanation: 'Psychological terror tactics claiming surveillance footage or impending police detention.',
    examples: ['I recorded you through your webcam, pay $1000 in BTC or I leak it', 'An arrest warrant has been issued in your name'],
    fixRecommendation: 'Do not pay extortionists; these are mass-blasted automated templates using leaked credential databases.',
  },
  {
    id: 'ADV-001',
    name: 'Advance Fee & Bogus Inheritance Bait',
    category: 'ADVANCE_FEE',
    pattern: /\b(next\s+of\s+kin|inherited\s+\$?\d+[\d,]*\s*(?:million|usd)|unclaimed\s+(?:funds|lottery|consignment)|international\s+monetary\s+fund|diplomatic\s+courier|wire\s+processing\s+fee\s+of)\b/gi,
    weight: 30,
    severity: 'warning',
    explanation: 'Classic advance-fee (419) schema promising massive fortunes in exchange for a preliminary release fee.',
    examples: ['You are designated as the next of kin to claim $14.5 million', 'Unclaimed lottery jackpot awaiting transfer fee'],
    fixRecommendation: 'Discard advance-fee claims; no authentic inheritance requires upfront gift cards or processing fees.',
  },
  {
    id: 'TEC-001',
    name: 'Tech Support Lockdown & Fake Error Codes',
    category: 'TECH_SUPPORT',
    pattern: /\b(critical\s+trojan\s+detected|call\s+toll-?free\s+(?:1[- ]8\d{2}|1[- ]800)\b|do\s+not\s+(?:restart|shut\s*down)\s+your\s+computer|error\s+code\s*#?0x[0-9a-f]{4,}|install\s+(?:anydesk|teamviewer|ultraviewer)\s+for\s+diagnostics)\b/gi,
    weight: 35,
    severity: 'error',
    explanation: 'Fake operating system crash warnings coercing victims into calling fake call centers and installing RATs.',
    examples: ['Critical Trojan Detected! Call toll-free 1-800-555-0199', 'Error code 0x80070057: Do not shut down your PC'],
    fixRecommendation: 'Legitimate OS error messages never include toll-free telephone numbers to call.',
  },
  {
    id: 'BEC-001',
    name: 'Executive Impersonation / CEO Wire Fraud',
    category: 'BEC_WIRE_FRAUD',
    pattern: /\b(are\s+you\s+at\s+your\s+desk|need\s+a\s+quick\s+favor\s+discreetly|urgent\s+wire\s+for\s+acquisition|change\s+of\s+banking\s+details|do\s+not\s+call\s+me\s+in\s+a\s+meeting|purchase\s+(?:several|some)\s+gift\s*cards\s+for\s+(?:clients|staff))\b/gi,
    weight: 38,
    severity: 'error',
    explanation: 'Business Email Compromise (BEC) mimicking executive officers requesting secret wire routing or gift cards.',
    examples: ['Are you at your desk? Need a quick favor discreetly', 'Purchase 5 Apple gift cards for the team right now'],
    fixRecommendation: 'Always verify unusual fund transfer instructions out-of-band via phone or in-person confirmation.',
  },
  {
    id: 'URL-001',
    name: 'Suspicious / Deceptive Link Architecture',
    category: 'TYPOSQUAT_LINK',
    pattern: /https?:\/\/(?:[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}|[a-z0-9-]+\.(?:xyz|top|live|click|tk|work|gq|cf|ml|pw|icu|buzz|rest)(?:\/[^\s]*)?|[a-z0-9-]*(?:paypal|apple|google|amazon|netflix|bank|login|secure|verify)[a-z0-9-]*\.(?:[a-z]{2,}))/gi,
    weight: 32,
    severity: 'error',
    explanation: 'URLs utilizing raw numeric IP addresses, high-abuse TLDs, or brand typosquatting prefixes/suffixes.',
    examples: ['http://192.168.1.1/paypal/login.php', 'https://verify-apple-account.xyz/secure'],
    fixRecommendation: 'Inspect domain name roots carefully before entering any credentials.',
  },
  {
    id: 'CAS-001',
    name: 'Excessive Capitalization & Punctuation Aggression',
    category: 'URGENT_CALL_TO_ACTION',
    pattern: /\b[A-Z\s!]{10,}\b|!{3,}|\?{3,}/g,
    weight: 12,
    severity: 'information',
    explanation: 'Aggressive stylistic formatting intended to create psychological shock and sensory overload.',
    examples: ['ALERT: SUSPENDED NOW!!!', 'URGENT ACTION NEEDED HERE!'],
    fixRecommendation: 'Reformat with professional styling and lower urgency register.',
  },
];

export function getAllNlpRules(): NlpRule[] {
  return NLP_RULES.map((r) => ({
    id: r.id,
    name: r.name,
    category: r.category,
    patternDescription: r.pattern.source,
    weight: r.weight,
    severity: r.severity,
    explanation: r.explanation,
    examples: r.examples,
  }));
}

export function extractUrls(text: string): DetectedUrl[] {
  const urlRegex = /(https?:\/\/[^\s<>"'{}|\\^`]+)/gi;
  const matches = text.match(urlRegex) || [];
  const uniqueUrls = Array.from(new Set(matches));

  return uniqueUrls.map((url) => {
    const flags: string[] = [];
    const lower = url.toLowerCase();

    // Check IP address link
    if (/https?:\/\/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/.test(lower)) {
      flags.push('Direct IP Host (Evasion Tactic)');
    }

    // Check Suspicious TLD
    if (/\.(xyz|top|live|click|tk|work|gq|cf|ml|pw|icu|buzz|rest|site)(\/|$)/.test(lower)) {
      flags.push('High-Abuse Top Level Domain');
    }

    // Check Brand Typosquatting
    if (
      /(paypal|apple|google|amazon|netflix|chase|wellsfargo|microsoft|bankofamerica)/.test(lower) &&
      !/(paypal\.com|apple\.com|google\.com|amazon\.com|netflix\.com|chase\.com|wellsfargo\.com|microsoft\.com|bankofamerica\.com)/.test(lower)
    ) {
      flags.push('Brand Squatting / Lookalike Target');
    }

    // Check suspicious path keywords
    if (/(login|signin|verify|update-card|wallet-connect|secure-portal)/.test(lower)) {
      flags.push('Credential Harvest Path');
    }

    return {
      url,
      suspicious: flags.length > 0,
      flags,
    };
  });
}

function calculateSyntacticEntropy(text: string): number {
  if (!text || text.length === 0) return 0;

  // Measure ratio of uppercase characters
  const upperCount = (text.match(/[A-Z]/g) || []).length;
  const upperRatio = upperCount / (text.length || 1);

  // Measure punctuation exclamation density
  const exclamations = (text.match(/[!$*?]/g) || []).length;
  const puncDensity = exclamations / (text.length || 1);

  const raw = upperRatio * 50 + puncDensity * 500;
  return Math.min(100, Math.round(raw));
}

export function analyzeTextLocally(
  text: string,
  sensitivity: 'low' | 'balanced' | 'high' = 'balanced'
): ScamAnalysisResult {
  const startTime = Date.now();
  const diagnostics: ScamDiagnostic[] = [];
  const redFlags: RedFlag[] = [];
  const matchedCategories = new Set<ScamCategory>();

  let cumulativeRisk = 0;
  const lines = text.split('\n');

  // Linguistic metric counters
  let urgencyRaw = 0;
  let authorityRaw = 0;
  let financialRaw = 0;
  let credentialRaw = 0;
  let threatRaw = 0;

  // Sensitivity multiplier
  const multiplier = sensitivity === 'high' ? 1.25 : sensitivity === 'low' ? 0.75 : 1.0;

  // Process rules
  for (const rule of NLP_RULES) {
    // Reset regex state
    rule.pattern.lastIndex = 0;

    let match: RegExpExecArray | null;
    let matchCountForRule = 0;

    while ((match = rule.pattern.exec(text)) !== null) {
      matchCountForRule++;
      const matchIndex = match.index;
      const matchedString = match[0];

      // Determine line and character position for VS Code LSP diagnostics
      let charCounter = 0;
      let targetLine = 1;
      let targetChar = 0;

      for (let l = 0; l < lines.length; l++) {
        const lineLen = lines[l].length + 1; // including newline
        if (charCounter + lineLen > matchIndex) {
          targetLine = l + 1;
          targetChar = matchIndex - charCounter;
          break;
        }
        charCounter += lineLen;
      }

      diagnostics.push({
        line: targetLine,
        character: targetChar,
        length: matchedString.length,
        matchedText: matchedString,
        category: rule.category,
        severity: rule.severity,
        message: `[ScamNLP] ${rule.name}: ${rule.explanation}`,
        ruleId: rule.id,
        suggestedFix: rule.fixRecommendation,
      });

      // Cap repeated matches for same rule to prevent overflow
      if (matchCountForRule <= 3) {
        cumulativeRisk += rule.weight * multiplier;
      }

      matchedCategories.add(rule.category);

      // Attribute to specific metric
      if (rule.category === 'URGENT_CALL_TO_ACTION') urgencyRaw += rule.weight;
      if (rule.category === 'PHISHING') authorityRaw += rule.weight;
      if (rule.category === 'SUSPICIOUS_PAYMENT' || rule.category === 'CRYPTO_GIVEAWAY') financialRaw += rule.weight;
      if (rule.category === 'CREDENTIAL_HARVEST') credentialRaw += rule.weight;
      if (rule.category === 'EXTORTION') threatRaw += rule.weight;
    }

    if (matchCountForRule > 0) {
      redFlags.push({
        title: rule.name,
        reason: rule.explanation,
        snippet: text.substring(Math.max(0, rule.pattern.lastIndex - 60), Math.min(text.length, rule.pattern.lastIndex + 40)).trim() || rule.examples[0],
        severity: rule.severity === 'error' ? 'critical' : rule.severity === 'warning' ? 'high' : 'medium',
      });
    }
  }

  // URL inspection
  const detectedUrls = extractUrls(text);
  for (const urlItem of detectedUrls) {
    if (urlItem.suspicious) {
      cumulativeRisk += 30 * multiplier;
      matchedCategories.add('TYPOSQUAT_LINK');
      redFlags.push({
        title: 'Deceptive URL Architecture',
        reason: `Contains suspicious attributes: ${urlItem.flags.join(', ')}`,
        snippet: urlItem.url,
        severity: 'critical',
      });
    }
  }

  // Entropy
  const entropy = calculateSyntacticEntropy(text);
  if (entropy > 50) {
    cumulativeRisk += 10 * multiplier;
  }

  // Final score normalized 0 - 100
  const finalScore = Math.min(100, Math.round(cumulativeRisk));

  // Determine threat level
  let threatLevel: ThreatLevel = 'SAFE';
  if (finalScore >= 75) threatLevel = 'CRITICAL';
  else if (finalScore >= 50) threatLevel = 'HIGH';
  else if (finalScore >= 25) threatLevel = 'MEDIUM';
  else if (finalScore >= 10) threatLevel = 'LOW';

  // Determine primary scam classification
  let primaryType = 'Clean / Unremarkable';
  if (matchedCategories.has('EXTORTION')) primaryType = 'Extortion & Blackmail Attempt';
  else if (matchedCategories.has('CRYPTO_GIVEAWAY')) primaryType = 'Cryptocurrency Doubler / Airdrop Fraud';
  else if (matchedCategories.has('BEC_WIRE_FRAUD')) primaryType = 'Business Email Compromise (BEC)';
  else if (matchedCategories.has('TECH_SUPPORT')) primaryType = 'Tech Support Impersonation';
  else if (matchedCategories.has('CREDENTIAL_HARVEST')) primaryType = 'Credential Harvester Phishing';
  else if (matchedCategories.has('ADVANCE_FEE')) primaryType = 'Advance Fee / 419 Fraud';
  else if (matchedCategories.has('SUSPICIOUS_PAYMENT')) primaryType = 'Gift Card / Wire Fraud';
  else if (matchedCategories.has('TYPOSQUAT_LINK')) primaryType = 'Typosquatting & Malicious Link';
  else if (matchedCategories.has('URGENT_CALL_TO_ACTION')) primaryType = 'Urgency-Driven Social Engineering';

  // Token Heatmap Generation
  const rawWords = text.split(/(\s+|[.,!?;:()])/);
  const tokenHeatmap: TokenHeatmapItem[] = rawWords.map((token) => {
    const trimmed = token.trim().toLowerCase();
    if (!trimmed) {
      return { token, riskWeight: 0, isHighlighted: false };
    }

    // Check if token matches any rule diagnostic
    const matchedDiag = diagnostics.find((d) =>
      d.matchedText.toLowerCase().includes(trimmed)
    );

    if (matchedDiag) {
      return {
        token,
        riskWeight: matchedDiag.severity === 'error' ? 0.9 : 0.6,
        isHighlighted: true,
        category: matchedDiag.category,
      };
    }

    return { token, riskWeight: 0, isHighlighted: false };
  });

  const safeAlternatives: string[] = [];
  if (threatLevel !== 'SAFE') {
    safeAlternatives.push('Verify legitimacy directly through official provider app or website, never through links provided.');
    safeAlternatives.push('Refuse requests for alternative payment instruments (gift cards, wire transfers, crypto).');
    safeAlternatives.push('If sender claims executive identity, corroborate via telephone call or direct in-person contact.');
  }

  const nlpMetrics: NlpMetrics = {
    urgencyIndex: Math.min(100, Math.round(urgencyRaw * 2)),
    authorityScore: Math.min(100, Math.round(authorityRaw * 2.5)),
    financialCoercionScore: Math.min(100, Math.round(financialRaw * 2)),
    credentialHarvestScore: Math.min(100, Math.round(credentialRaw * 2.2)),
    syntacticEntropyScore: entropy,
    threatLanguageScore: Math.min(100, Math.round(threatRaw * 2.5)),
  };

  const summary =
    threatLevel === 'SAFE'
      ? 'No prominent scam markers detected. The content displays normative linguistic patterns without coercion or credential phishing indicators.'
      : `High-risk communication classified under ${primaryType}. Detected ${diagnostics.length} linguistic red flags including urgency coercion and deceptive vectors.`;

  return {
    scamScore: finalScore,
    threatLevel,
    scamType: primaryType,
    confidence: Math.min(98, 65 + diagnostics.length * 5),
    summary,
    nlpMetrics,
    diagnostics,
    redFlags,
    safeAlternatives,
    detectedUrls,
    tokenHeatmap,
    engine: 'local-heuristic-nlp',
    processingTimeMs: Date.now() - startTime,
    timestamp: new Date().toISOString(),
  };
}

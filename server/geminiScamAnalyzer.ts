import { GoogleGenAI, Type } from '@google/genai';
import {
  ScamAnalysisResult,
  ThreatLevel,
  ScamDiagnostic,
} from '../src/types/scam.js';
import { analyzeTextLocally } from './nlpEngine.js';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (aiClient) return aiClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
  return aiClient;
}

export async function analyzeTextWithAi(
  text: string,
  sensitivity: 'low' | 'balanced' | 'high' = 'balanced',
  forceLocalOnly = false
): Promise<ScamAnalysisResult> {
  const localBaseline = analyzeTextLocally(text, sensitivity);

  // If local only requested or no API key, return local engine result
  const apiKey = process.env.GEMINI_API_KEY;
  if (forceLocalOnly || !apiKey) {
    return localBaseline;
  }

  const ai = getAiClient();
  if (!ai) {
    return localBaseline;
  }

  const startTime = Date.now();

  try {
    const prompt = `Analyze the following message, email, or code comment snippet for potential scam, phishing, social engineering, extortion, or fraudulent intent using deep Natural Language Processing:

"""
${text}
"""

Sensitivity mode: ${sensitivity}.
Provide a forensic NLP breakdown evaluating:
1. Scam probability score (0 to 100)
2. Threat level: SAFE, LOW, MEDIUM, HIGH, or CRITICAL
3. Scam categorization typology
4. Linguistic metrics (urgency, authority exploitation, financial coercion, credential harvesting, syntactic entropy, threat language)
5. Concise forensic summary
6. Key red flag markers with quoted text and rationale
7. Safe alternatives/remediation recommendations for developers & security analysts.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are an expert NLP Cybersecurity Analyst and Threat Intelligence Engine. Detect scam phraseology, linguistic deception, social engineering vectors, and phishing payloads with high precision.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scamScore: {
              type: Type.NUMBER,
              description: 'Scam probability from 0 (completely benign) to 100 (definitive scam/fraud).',
            },
            threatLevel: {
              type: Type.STRING,
              description: 'One of: SAFE, LOW, MEDIUM, HIGH, CRITICAL',
            },
            scamType: {
              type: Type.STRING,
              description: 'Primary scam classification category.',
            },
            confidence: {
              type: Type.NUMBER,
              description: 'Confidence score from 0 to 100.',
            },
            summary: {
              type: Type.STRING,
              description: 'Concise 1-2 sentence threat assessment.',
            },
            nlpMetrics: {
              type: Type.OBJECT,
              properties: {
                urgencyIndex: { type: Type.NUMBER },
                authorityScore: { type: Type.NUMBER },
                financialCoercionScore: { type: Type.NUMBER },
                credentialHarvestScore: { type: Type.NUMBER },
                syntacticEntropyScore: { type: Type.NUMBER },
                threatLanguageScore: { type: Type.NUMBER },
              },
              required: [
                'urgencyIndex',
                'authorityScore',
                'financialCoercionScore',
                'credentialHarvestScore',
                'syntacticEntropyScore',
                'threatLanguageScore',
              ],
            },
            redFlags: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  snippet: { type: Type.STRING },
                  severity: { type: Type.STRING },
                },
                required: ['title', 'reason', 'snippet', 'severity'],
              },
            },
            safeAlternatives: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'scamScore',
            'threatLevel',
            'scamType',
            'confidence',
            'summary',
            'nlpMetrics',
            'redFlags',
            'safeAlternatives',
          ],
        },
      },
    });

    const rawText = response.text;
    if (!rawText) {
      return localBaseline;
    }

    const parsed = JSON.parse(rawText);

    // Merge baseline VS Code diagnostics with Gemini insights
    const threatLevelNormalized: ThreatLevel = (
      ['SAFE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(parsed.threatLevel)
        ? parsed.threatLevel
        : localBaseline.threatLevel
    ) as ThreatLevel;

    // Combine redflags
    const mergedRedFlags = [
      ...parsed.redFlags.map((rf: any) => ({
        title: rf.title || 'Flagged Linguistic Marker',
        reason: rf.reason || 'Detected manipulative pattern',
        snippet: rf.snippet || '',
        severity: ['critical', 'high', 'medium', 'low'].includes(rf.severity?.toLowerCase())
          ? rf.severity.toLowerCase()
          : 'high',
      })),
      ...localBaseline.redFlags.slice(0, 3),
    ];

    // Deduplicate redflags by title
    const uniqueRedFlags = Array.from(
      new Map(mergedRedFlags.map((item) => [item.title, item])).values()
    );

    return {
      scamScore: Math.max(0, Math.min(100, Math.round(parsed.scamScore ?? localBaseline.scamScore))),
      threatLevel: threatLevelNormalized,
      scamType: parsed.scamType || localBaseline.scamType,
      confidence: Math.max(0, Math.min(100, Math.round(parsed.confidence ?? localBaseline.confidence))),
      summary: parsed.summary || localBaseline.summary,
      nlpMetrics: {
        urgencyIndex: Math.max(0, Math.min(100, Math.round(parsed.nlpMetrics?.urgencyIndex ?? localBaseline.nlpMetrics.urgencyIndex))),
        authorityScore: Math.max(0, Math.min(100, Math.round(parsed.nlpMetrics?.authorityScore ?? localBaseline.nlpMetrics.authorityScore))),
        financialCoercionScore: Math.max(0, Math.min(100, Math.round(parsed.nlpMetrics?.financialCoercionScore ?? localBaseline.nlpMetrics.financialCoercionScore))),
        credentialHarvestScore: Math.max(0, Math.min(100, Math.round(parsed.nlpMetrics?.credentialHarvestScore ?? localBaseline.nlpMetrics.credentialHarvestScore))),
        syntacticEntropyScore: Math.max(0, Math.min(100, Math.round(parsed.nlpMetrics?.syntacticEntropyScore ?? localBaseline.nlpMetrics.syntacticEntropyScore))),
        threatLanguageScore: Math.max(0, Math.min(100, Math.round(parsed.nlpMetrics?.threatLanguageScore ?? localBaseline.nlpMetrics.threatLanguageScore))),
      },
      diagnostics: localBaseline.diagnostics,
      redFlags: uniqueRedFlags,
      safeAlternatives: parsed.safeAlternatives?.length ? parsed.safeAlternatives : localBaseline.safeAlternatives,
      detectedUrls: localBaseline.detectedUrls,
      tokenHeatmap: localBaseline.tokenHeatmap,
      engine: 'hybrid-gemini-nlp',
      processingTimeMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    console.warn('Gemini NLP call failed, using local baseline:', err);
    return localBaseline;
  }
}

import { Router, Request, Response } from 'express';
import { getAllNlpRules } from './nlpEngine.js';
import { analyzeTextWithAi } from './geminiScamAnalyzer.js';
import { VSCODE_EXTENSION_TS, VSCODE_PACKAGE_JSON, PYTHON_CLIENT_SCRIPT } from './vsCodeTemplates.js';

export const apiRouter = Router();

const SERVER_START_TIME = Date.now();

// Preloaded real-world corpus
export const CORPUS_SAMPLES = [
  {
    id: 'sample-geek-squad',
    title: 'Geek Squad Auto-Renewal Invoice Fraud',
    category: 'TECH_SUPPORT',
    threat: 'CRITICAL',
    description: 'Impersonates Best Buy Geek Squad claiming an unauthorized $499 charge to force a panic phone call.',
    text: `Subject: Geek Squad Support: Renewal Confirmation #GS-8849201

Dear Customer,

Thank you for choosing Geek Squad Total Tech Care. Your annual subscription has been automatically renewed for $499.00 USD. This amount has been deducted from your bank balance.

If you did not authorize this charge, you must contact our cancellation desk immediately within 24 hours at toll-free 1-800-555-0194 to reverse the transaction. Do not ignore this message or the charges will be permanent.

Order ID: GS-992144
Payment Method: Direct Bank Debit
Cancellation Helpline: 1-800-555-0194 (Open 24/7)

Geek Squad Tech Team`,
  },
  {
    id: 'sample-crypto-doubler',
    title: 'Crypto Doubler / Airdrop Bait',
    category: 'CRYPTO_GIVEAWAY',
    threat: 'CRITICAL',
    description: 'Fake high-profile crypto giveaway demanding upfront transfer of BTC/ETH.',
    text: `OFFICIAL CELEBRATION AIRDROP!

To celebrate the new blockchain milestone, Elon Musk and the Foundation are giving back 5,000 BTC to the community!

HOW TO PARTICIPATE:
Send 0.1 BTC to 5.0 BTC to the contribution address below and get double your crypto returned immediately to your wallet!

Contribution Address: bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
Status: 3,410 / 5,000 BTC remaining!
HURRY! Time sensitive offer expires in 12 hours. Connect wallet to claim free bonus tokens.`,
  },
  {
    id: 'sample-bec-ceo',
    title: 'CEO Secret Wire / Gift Card BEC',
    category: 'BEC_WIRE_FRAUD',
    threat: 'HIGH',
    description: 'Targeted executive impersonation asking an employee to secretly buy gift cards.',
    text: `From: "David Chen, CEO" <ceo.office.corp@mail-director-board.xyz>
To: accounting@company.com
Subject: Quick favor

Are you at your desk right now?

I am currently in a confidential client acquisition meeting and cannot take calls. I need you to handle an urgent favor discreetly for me.

Please purchase 6 Apple gift cards ($500 each) for the client presentation today. Scratch the back, take clear photos of the codes, and email them to me immediately before 3 PM.

I will approve the reimbursement expense once I am out of the meeting. Keep this between us for now.

Best regards,
David Chen
Chief Executive Officer`,
  },
  {
    id: 'sample-phish-bank',
    title: 'Chase Bank Account Suspension Phishing',
    category: 'PHISHING',
    threat: 'CRITICAL',
    description: 'SMS / Email banking phishing link with brand typosquatting domain.',
    text: `CHASE BANK SECURITY ALERT:

Unusual sign-in activity detected on your checking account from an unrecognized IP address in Moscow, Russia.

Your online access will be suspended within 24 hours due to security policy violations. Immediate action required.

Click below to verify your identity and confirm your password:
http://192.168.1.104/chase-security-verify/login.php

Failure to confirm your one-time verification OTP code will result in permanent account closure.`,
  },
  {
    id: 'sample-irs-tax',
    title: 'IRS Arrest Warrant Extortion',
    category: 'EXTORTION',
    threat: 'CRITICAL',
    description: 'Coercive government impersonation threatening immediate arrest for unpaid taxes.',
    text: `FINAL LEGAL NOTICE - INTERNAL REVENUE SERVICE

Case File: #IRS-TAX-90214-CRIMINAL

Our audit division has identified intentional tax evasion and unpaid balance of $4,850. An arrest warrant has been issued in your name by federal law enforcement.

Local police will arrive at your registered address within 2 hours unless immediate payment is tendered. You can settle the penalty instantly via Western Union wire transfer or Bitcoin ATM voucher.

Call Federal Inspector Officer Miller at 1-888-555-0182 immediately to stay the warrant.`,
  },
  {
    id: 'sample-benign-email',
    title: 'Authentic Internal Sprint Planning Email',
    category: 'CLEAN',
    threat: 'SAFE',
    description: 'Standard benign workplace correspondence with normal calendar links.',
    text: `Hi Team,

Hope you all had a productive week.

Here is the draft agenda for our Sprint 24 retrospective this Thursday at 10:00 AM PST. We'll be reviewing the deployment milestones for the telemetry dashboard and planning our next backlog grooming session.

Please review the attached Google Docs notes before our standup. Let me know if you would like to add any items to the discussion topic list.

Meeting Link: https://meet.google.com/abc-defg-hij
Documentation: https://docs.company.internal/wiki/sprint-24

Cheers,
Sarah Jenkins
Engineering Lead`,
  },
  {
    id: 'sample-code-comment',
    title: 'Code File with Phishing URL in Comments',
    category: 'TYPOSQUAT_LINK',
    threat: 'HIGH',
    description: 'Source code file containing an obfuscated phishing link in an API client config.',
    text: `// Payment Gateway Configuration
// Warning: Legacy endpoint deprecated
export const AUTH_CONFIG = {
  // Auth endpoint for identity check
  // verify your credentials here:
  loginUrl: "https://paypa1-secure-verification.xyz/auth/oauth2",
  timeoutMs: 15000,
  retryCount: 3,
  // Note: verify your account password before proceeding
};`,
  },
];

// Health Check
apiRouter.get('/health', (_req: Request, res: Response) => {
  const rules = getAllNlpRules();
  res.json({
    status: 'online',
    service: 'ScamNLP Localhost Engine',
    port: 3000,
    uptimeSeconds: Math.floor((Date.now() - SERVER_START_TIME) / 1000),
    rulesCount: rules.length,
    geminiEnabled: Boolean(process.env.GEMINI_API_KEY),
    version: '1.4.0',
    capabilities: [
      'NLP Urgency & Pressure Extraction',
      'Authority Impersonation Heuristics',
      'Alternative Payment Detection',
      'VS Code LSP Diagnostics Mapping',
      'Zero-Shot Gemini 3.8 Forensic Classification',
    ],
  });
});

// Single scan endpoint
apiRouter.post('/detect', async (req: Request, res: Response) => {
  try {
    const { text, filename, sensitivity = 'balanced', useDeepAi = true } = req.body;

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text field is required and must be a string.' });
      return;
    }

    const result = await analyzeTextWithAi(text, sensitivity, !useDeepAi);
    res.json(result);
  } catch (err: any) {
    console.error('Error during scam detection:', err);
    res.status(500).json({ error: 'Failed to analyze text', message: err?.message });
  }
});

// Batch scan endpoint
apiRouter.post('/batch', async (req: Request, res: Response) => {
  try {
    const { items, sensitivity = 'balanced' } = req.body;
    if (!Array.isArray(items)) {
      res.status(400).json({ error: 'Items must be an array of { id, text, filename }' });
      return;
    }

    const results = await Promise.all(
      items.slice(0, 10).map(async (item) => {
        const scan = await analyzeTextWithAi(item.text || '', sensitivity, false);
        return {
          id: item.id || Math.random().toString(),
          filename: item.filename || 'snippet.txt',
          ...scan,
        };
      })
    );

    res.json({ count: results.length, results });
  } catch (err: any) {
    console.error('Error in batch scan:', err);
    res.status(500).json({ error: 'Batch scan failed' });
  }
});

// Get active rules
apiRouter.get('/rules', (_req: Request, res: Response) => {
  const rules = getAllNlpRules();
  res.json({ count: rules.length, rules });
});

// Preloaded corpus samples
apiRouter.get('/samples', (_req: Request, res: Response) => {
  res.json(CORPUS_SAMPLES);
});

// VS Code integration artifacts
apiRouter.get('/vscode/extension-code', (_req: Request, res: Response) => {
  res.json({
    extensionTs: VSCODE_EXTENSION_TS,
    packageJson: VSCODE_PACKAGE_JSON,
    pythonClient: PYTHON_CLIENT_SCRIPT,
  });
});

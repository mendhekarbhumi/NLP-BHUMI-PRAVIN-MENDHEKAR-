export const VSCODE_EXTENSION_TS = `/**
 * ScamNLP VS Code Extension
 * Connects directly to ScamNLP Localhost Server (http://localhost:3000/api/detect)
 */
import * as vscode from 'vscode';

interface ScamDiagnosticPayload {
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

interface ScanResponse {
  scamScore: number;
  threatLevel: string;
  scamType: string;
  summary: string;
  diagnostics: ScamDiagnosticPayload[];
}

let diagnosticCollection: vscode.DiagnosticCollection;
let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
  diagnosticCollection = vscode.languages.createDiagnosticCollection('scamnlp');
  context.subscriptions.push(diagnosticCollection);

  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'scamnlp.scanActiveFile';
  context.subscriptions.push(statusBarItem);
  statusBarItem.text = '$(shield) ScamNLP: Ready';
  statusBarItem.show();

  // Scan on document save
  const onSave = vscode.workspace.onDidSaveTextDocument((document) => {
    scanDocument(document);
  });
  context.subscriptions.push(onSave);

  // Scan on document open
  const onOpen = vscode.workspace.onDidOpenTextDocument((document) => {
    scanDocument(document);
  });
  context.subscriptions.push(onOpen);

  // Register command: Scan Active File
  const scanCmd = vscode.commands.registerCommand('scamnlp.scanActiveFile', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage('No active editor found to scan.');
      return;
    }
    scanDocument(editor.document, true);
  });
  context.subscriptions.push(scanCmd);

  // Register QuickFix Code Actions
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider('*', new ScamCodeActionProvider(), {
      providedCodeActionKinds: [vscode.CodeActionKind.QuickFix],
    })
  );

  // Scan current document if open
  if (vscode.window.activeTextEditor) {
    scanDocument(vscode.window.activeTextEditor.document);
  }
}

async function scanDocument(document: vscode.TextDocument, notify = false) {
  const text = document.getText();
  if (!text || text.trim().length === 0) {
    diagnosticCollection.delete(document.uri);
    statusBarItem.text = '$(shield) ScamNLP: Clean';
    return;
  }

  const endpoint = vscode.workspace
    .getConfiguration('scamnlp')
    .get<string>('serverUrl', 'http://localhost:3000/api/detect');

  try {
    statusBarItem.text = '$(sync~spin) ScamNLP: Scanning...';

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        filename: document.fileName,
        sensitivity: 'balanced',
      }),
    });

    if (!res.ok) {
      throw new Error(\`Server returned status \${res.status}\`);
    }

    const data = (await res.json()) as ScanResponse;
    const diags: vscode.Diagnostic[] = [];

    for (const d of data.diagnostics || []) {
      const lineIdx = Math.max(0, d.line - 1);
      const charIdx = Math.max(0, d.character);
      const range = new vscode.Range(
        new vscode.Position(lineIdx, charIdx),
        new vscode.Position(lineIdx, charIdx + d.length)
      );

      const sev =
        d.severity === 'error'
          ? vscode.DiagnosticSeverity.Error
          : d.severity === 'warning'
          ? vscode.DiagnosticSeverity.Warning
          : vscode.DiagnosticSeverity.Information;

      const diag = new vscode.Diagnostic(range, d.message, sev);
      diag.source = 'ScamNLP (Localhost)';
      diag.code = d.ruleId;
      diags.push(diag);
    }

    diagnosticCollection.set(document.uri, diags);

    // Update status bar
    if (data.scamScore >= 75) {
      statusBarItem.text = \`$(error) ScamNLP: \${data.scamScore}% (\${data.threatLevel})\`;
      statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
    } else if (data.scamScore >= 35) {
      statusBarItem.text = \`$(warning) ScamNLP: \${data.scamScore}% (\${data.threatLevel})\`;
      statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    } else {
      statusBarItem.text = \`$(shield) ScamNLP: Safe (\${data.scamScore}%)\`;
      statusBarItem.backgroundColor = undefined;
    }

    if (notify) {
      if (data.scamScore >= 50) {
        vscode.window.showWarningMessage(
          \`[ScamNLP] High Risk (\${data.scamScore}%): \${data.summary}\`
        );
      } else {
        vscode.window.showInformationMessage(
          \`[ScamNLP] Analysis Complete: \${data.threatLevel} risk detected.\`
        );
      }
    }
  } catch (err: any) {
    statusBarItem.text = '$(alert) ScamNLP: Offline';
    statusBarItem.tooltip = 'Ensure ScamNLP localhost server is running on port 3000';
    if (notify) {
      vscode.window.showErrorMessage(
        \`Could not connect to ScamNLP server at \${endpoint}. Is localhost:3000 running?\`
      );
    }
  }
}

class ScamCodeActionProvider implements vscode.CodeActionProvider {
  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext
  ): vscode.CodeAction[] {
    const actions: vscode.CodeAction[] = [];

    for (const diag of context.diagnostics) {
      if (diag.source?.includes('ScamNLP')) {
        const fix = new vscode.CodeAction(
          \`[ScamNLP] Redact suspicious token: "\${document.getText(diag.range)}"\`,
          vscode.CodeActionKind.QuickFix
        );
        fix.edit = new vscode.WorkspaceEdit();
        fix.edit.replace(document.uri, diag.range, '[REDACTED_SCAM_TOKEN]');
        fix.diagnostics = [diag];
        fix.isPreferred = true;
        actions.push(fix);
      }
    }

    return actions;
  }
}

export function deactivate() {
  if (diagnosticCollection) {
    diagnosticCollection.clear();
    diagnosticCollection.dispose();
  }
}
`;

export const VSCODE_PACKAGE_JSON = `{
  "name": "vscode-scam-nlp",
  "displayName": "ScamNLP - Localhost Scam & Phishing Guard",
  "description": "Real-time NLP-based scam detection, phishing URL scanning, and social engineering diagnostics for VS Code.",
  "version": "1.0.0",
  "publisher": "local-security",
  "engines": {
    "vscode": "^1.85.0"
  },
  "categories": [
    "Linters",
    "Security",
    "Programming Languages"
  ],
  "activationEvents": [
    "onStartupFinished"
  ],
  "main": "./out/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "scamnlp.scanActiveFile",
        "title": "ScamNLP: Scan Active File for Scam Indicators",
        "icon": "$(shield)"
      }
    ],
    "configuration": {
      "title": "ScamNLP Localhost Configuration",
      "properties": {
        "scamnlp.serverUrl": {
          "type": "string",
          "default": "http://localhost:3000/api/detect",
          "description": "Localhost REST API URL of the running ScamNLP engine."
        },
        "scamnlp.autoScanOnSave": {
          "type": "boolean",
          "default": true,
          "description": "Automatically scan files on save."
        }
      }
    }
  },
  "scripts": {
    "vscode:prepublish": "npm run compile",
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/vscode": "^1.85.0",
    "typescript": "^5.3.3"
  }
}`;

export const PYTHON_CLIENT_SCRIPT = `#!/usr/bin/env python3
"""
ScamNLP Python CLI & Git Pre-Commit Hook
Scans source files, emails, or markdown logs via ScamNLP Localhost Server.
Usage:
    python3 scam_guard.py <file_or_directory>
"""
import sys
import os
import requests
import json

SERVER_URL = "http://localhost:3000/api/detect"

def scan_text(text, filename="input"):
    try:
        response = requests.post(
            SERVER_URL,
            json={"text": text, "filename": filename, "sensitivity": "balanced"},
            timeout=5
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.ConnectionError:
        print("[ERROR] Cannot connect to ScamNLP at " + SERVER_URL)
        print("        Ensure the local dev server is running ('npm run dev').")
        sys.exit(1)
    except Exception as e:
        print(f"[ERROR] Scan failed: {e}")
        return None

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 scam_guard.py <file_path>")
        print("Example: python3 scam_guard.py sample_email.eml")
        sys.exit(0)

    target_path = sys.argv[1]
    if not os.path.exists(target_path):
        print(f"[ERROR] File '{target_path}' not found.")
        sys.exit(1)

    with open(target_path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()

    print(f"[*] Scanning '{target_path}' ({len(content)} characters)...")
    res = scan_text(content, filename=target_path)

    if not res:
        return

    score = res.get("scamScore", 0)
    level = res.get("threatLevel", "UNKNOWN")
    scam_type = res.get("scamType", "N/A")
    summary = res.get("summary", "")
    diagnostics = res.get("diagnostics", [])

    print("=" * 60)
    print(f" SCAM NLP VERDICT: [{level}] Score: {score}/100")
    print(f" Typology: {scam_type}")
    print(f" Summary:  {summary}")
    print("=" * 60)

    if diagnostics:
        print(f"\\n[!] Found {len(diagnostics)} suspicious token markers:")
        for d in diagnostics:
            line = d.get("line", 1)
            token = d.get("matchedText", "")
            rule = d.get("ruleId", "")
            msg = d.get("message", "")
            print(f"  - Line {line} [{rule}] '{token}': {msg}")

    if score >= 50:
        print("\\n[BLOCKED] File contains high-severity scam/phishing vectors.")
        sys.exit(1)
    else:
        print("\\n[PASS] Content deemed within safe operational thresholds.")
        sys.exit(0)

if __name__ == "__main__":
    main()
`;

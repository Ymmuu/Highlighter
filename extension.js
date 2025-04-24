const vscode = require('vscode');
const fs = require('fs');

let decorationType;

function activate(context) {
  console.log('Highlighter is now active!');

  initializeDecorationType();

  const highlightCmd = vscode.commands.registerCommand('extension.highlightMatches', async (fileUri) => {
    const editor = vscode.window.activeTextEditor;
    let text;

    if (editor && (!fileUri || fileUri.fsPath === editor.document.uri.fsPath)) {
      if (!['plaintext','json'].includes(editor.document.languageId)) {
        return vscode.window.showWarningMessage("File type not supported!");
      }
      text = editor.document.getText();
      const matches = findMatches(text);
      return applyHighlight(matches, editor);
    }

    if (fileUri) {
      try {
        text = fs.readFileSync(fileUri.fsPath, 'utf8');
      } catch (err) {
        console.error(err);
        return vscode.window.showErrorMessage("Error reading the file.");
      }
      const matches = findMatches(text);
      if (!matches.length) {
        return vscode.window.showInformationMessage("No matches found in selected file.");
      }
      logMatches(matches, fileUri.fsPath);
      return vscode.window.showInformationMessage(`${matches.length} matches found in ${fileUri.fsPath}.`);
    }

    vscode.window.showWarningMessage("No file selected or open!");
  });

  const newTabCmd = vscode.commands.registerCommand('extension.findMatchesNewTab', async (fileUri) => {
    let text;
    if (fileUri) {
      text = fs.readFileSync(fileUri.fsPath, 'utf8');
    } else if (vscode.window.activeTextEditor) {
      text = vscode.window.activeTextEditor.document.getText();
    } else {
      return vscode.window.showWarningMessage("No file selected or open!");
    }
    const matches = findMatches(text);
    if (!matches.length) {
      return vscode.window.showInformationMessage("No matches found.");
    }
    return displayResultsInNewTab(matches);
  });

  vscode.workspace.onDidChangeConfiguration(e => {
    if (e.affectsConfiguration('highlighter')) {
      initializeDecorationType();
      vscode.window.showInformationMessage('Settings updated!');
    }
  });

  context.subscriptions.push(highlightCmd, newTabCmd);
}

function findMatches(text) {
  const cfg = vscode.workspace.getConfiguration('highlighter');
  const pattern = cfg.get('regex');
  const regex = new RegExp(pattern, 'gi');
  return [...text.matchAll(regex)];
}

function applyHighlight(matches, editor) {
  if (!matches.length) {
    return vscode.window.showInformationMessage("No matches found.");
  }
  const decorations = matches.map(m => {
    const start = editor.document.positionAt(m.index);
    const end = editor.document.positionAt(m.index + m[0].length);
    return { range: new vscode.Range(start, end) };
  });
  editor.setDecorations(decorationType, decorations);
  vscode.window.showInformationMessage(`${matches.length} matches highlighted!`);
}

function logMatches(matches, filePath) {
  const cfg = vscode.workspace.getConfiguration('highlighter');
  if (cfg.get('logMatches')) {
    console.log(`Matches in ${filePath}:`, matches.map(m => m[0]));
  }
}

async function displayResultsInNewTab(matches) {
  const header = `Found ${matches.length} matches:\n`;
  const body = matches.map(m => m[0]).join('\n');
  const doc = await vscode.workspace.openTextDocument({ content: header + body, language: 'plaintext' });
  return vscode.window.showTextDocument(doc, { preview: false, viewColumn: vscode.ViewColumn.Beside });
}

function initializeDecorationType() {
  decorationType = vscode.window.createTextEditorDecorationType({ border: '1px solid red' });
}

function deactivate() {
  if (decorationType) decorationType.dispose();
}

module.exports = { activate, deactivate };

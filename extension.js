const vscode = require('vscode');
const fs = require('fs');

let decorationType;


function activate(context) {
    console.log('Plugin "Highlighter" är nu aktiv!');


    initializeDecorationType();

    let disposable = vscode.commands.registerCommand('extension.highlightPersonnummer', async (fileUri) => {
    
        const editor = vscode.window.activeTextEditor;
    
        if (editor && (!fileUri || fileUri.fsPath === editor.document.uri.fsPath)) {
    
            const document = editor.document;
            const text = document.getText();
            const language = document.languageId;
    
            if (language === 'pnr' || language === 'plaintext' || language === 'json') {
                const matches = findMatches(text);
    
                applyHighlight(matches, editor);
            } else {
                vscode.window.showWarningMessage("Filtypen stöds inte!");
            }
        } 
        else if (fileUri) {
    
            try {
                const filePath = fileUri.fsPath;
                const fileContent = fs.readFileSync(filePath, 'utf8');
                const matches = findMatches(fileContent);
    
                if (matches.length === 0) {
                    vscode.window.showInformationMessage("Inga matchningar hittades i den valda filen.");
                    return;
                }
    
                logMatches(matches, filePath);
                vscode.window.showInformationMessage(`${matches.length} matchningar hittade i ${filePath}.`);
            } catch (error) {
                console.error("Ett fel inträffade vid läsning av filen:", error);
                vscode.window.showErrorMessage("Ett fel inträffade vid läsning av filen.");
            }
        } else {
            console.log('Varken öppen fil eller Explorer-fil identifierad.');
            vscode.window.showWarningMessage("Ingen fil vald eller öppen!");
        }
    });
    

    let disposableNewTab = vscode.commands.registerCommand('extension.highlightPersonnummerNewTab', async (fileUri) => {
        if (fileUri) {
            try {
                const filePath = fileUri.fsPath;
                const fileContent = fs.readFileSync(filePath, 'utf8');

                const matches = findMatches(fileContent);
                if (matches.length === 0) {
                    vscode.window.showInformationMessage("Inga matchningar hittades i den valda filen.");
                    return;
                }
                displayResultsInNewTab(matches);
            } catch (error) {
                console.error("Ett fel inträffade vid läsning av filen:", error);
                vscode.window.showErrorMessage("Ett fel inträffade vid läsning av filen.");
            }
        } else {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                const document = editor.document;
                const text = document.getText();

                const matches = findMatches(text);
                if (matches.length === 0) {
                    vscode.window.showInformationMessage("Inga matchningar hittades.");
                    return;
                }
                displayResultsInNewTab(matches);
            } else {
                vscode.window.showWarningMessage("Ingen fil vald eller öppen!");
            }
        }
    });

    
    //Uppdaterar inställningarna
    vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('personnummer-highlighter')) {
            initializeDecorationType();
            vscode.window.showInformationMessage('Inställningar uppdaterade!');
        }
    });

    // Lägg till kommandona i tilläggets livscykel
    context.subscriptions.push(disposable);
    context.subscriptions.push(disposableNewTab);
}


function findMatches(text) {
    const config = vscode.workspace.getConfiguration('personnummer-highlighter');
    const userRegex = config.get('regex') || "\\b(19|20)?\\d{6}[- ]?\\d{4}\\b";

    const regex = new RegExp(userRegex.replace(/\\\\/g, "\\"), 'gi'); 

    const matches = [...text.matchAll(regex)];

    return matches;
}


function applyHighlight(matches, editor) {
    if (matches.length === 0) {
        vscode.window.showInformationMessage("Inga matchningar hittades.");
        return;
    }

    const decorations = matches.map(match => {
        const startPos = editor.document.positionAt(match.index);
        const endPos = editor.document.positionAt(match.index + match[0].length);
    
        return { range: new vscode.Range(startPos, endPos) };
    });

    if (decorations.length === 0) {
        vscode.window.showWarningMessage("Inga giltiga dekorationer skapades.");
        return;
    }

    editor.setDecorations(decorationType, decorations);
    vscode.window.showInformationMessage(`${matches.length} matchningar markerades!`);
}


function logMatches(matches, filePath) {
    const foundItems = matches.map(match => match[0]);
    console.log(
        filePath
            ? `Matchningar hittade i ${filePath}:`
            : "Matchningar hittade:",
        foundItems
    );
}


async function displayResultsInNewTab(matches) {
    const result = `Hittade ${matches.length} matchningar:\n` + matches.map(match => match[0]).join('\n');
    const newDocument = await vscode.workspace.openTextDocument({ content: result, language: 'plaintext' });
    await vscode.window.showTextDocument(newDocument, {
        preview: false,
        viewColumn: vscode.ViewColumn.Beside,
    });
}


function initializeDecorationType() {
    decorationType = vscode.window.createTextEditorDecorationType({
        border: '1px solid red'
    });
}


function deactivate() {
    if (decorationType) {
        decorationType.dispose();
    }
}

module.exports = {
    activate,
    deactivate,
};

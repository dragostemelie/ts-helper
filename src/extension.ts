import * as vscode from "vscode";
import { findJsxElementAtCursor } from "./utils";

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand("ts-helper.selectAll", async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const jsxElement = findJsxElementAtCursor(editor);

        if (jsxElement) {
            const start = jsxElement.getStart();
            const end = jsxElement.getEnd();

            const document = editor.document;
            const startPos = document.positionAt(start);
            const endPos = document.positionAt(end);

			// Select JSX Element
            editor.selection = new vscode.Selection(startPos, endPos);
        } else {
			// Select to bracket if not JSX
            await vscode.commands.executeCommand("editor.action.selectToBracket");
        }
    });

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

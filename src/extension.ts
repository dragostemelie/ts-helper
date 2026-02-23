import type { ExtensionContext } from "vscode";
import { window, Selection, commands } from "vscode";
import { findJsxElementAtCursor } from "./utils";

export function activate(context: ExtensionContext) {
    const disposable = commands.registerCommand("ts-helper.selectAllInside", async () => {
        const editor = window.activeTextEditor;
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
            editor.selection = new Selection(startPos, endPos);
        } else {
            // Select to bracket if not JSX
            await commands.executeCommand("editor.action.selectToBracket");
        }
    });

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

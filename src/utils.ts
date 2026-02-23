import * as vscode from "vscode";
import * as ts from "typescript";

export function findJsxElementAtCursor(editor: vscode.TextEditor) {
    const document = editor.document;
    const position = editor.selection.active;
    const cursorOffset = document.offsetAt(position);
    const text = document.getText();

    const sourceFile = ts.createSourceFile(document.fileName, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

    let closest: ts.Node | undefined;

    function visit(node: ts.Node): any {
        if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node)) {
            const start = node.getStart();
            const end = node.getEnd();

            if (cursorOffset >= start && cursorOffset <= end) {
                closest = node;
            }
        }

        return ts.forEachChild(node, visit);
    }

    visit(sourceFile);

    return closest;
}

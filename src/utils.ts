import {
    createSourceFile,
    isJsxElement,
    isJsxSelfClosingElement,
    isJsxFragment,
    ScriptTarget,
    ScriptKind,
    forEachChild,
} from "typescript";

import type { TextEditor } from "vscode";
import type { Node } from "typescript";

export function findJsxElementAtCursor(editor: TextEditor) {
    const document = editor.document;
    const position = editor.selection.active;
    const cursorOffset = document.offsetAt(position);
    const text = document.getText();

    const sourceFile = createSourceFile(document.fileName, text, ScriptTarget.Latest, true, ScriptKind.TSX);

    let closest: Node | undefined;

    function visit(node: Node): void {
        if (isJsxElement(node) || isJsxSelfClosingElement(node) || isJsxFragment(node)) {
            const start = node.getStart();
            const end = node.getEnd();

            if (cursorOffset >= start && cursorOffset <= end) {
                closest = node;
            }
        }

        return forEachChild(node, visit);
    }

    visit(sourceFile);

    return closest;
}

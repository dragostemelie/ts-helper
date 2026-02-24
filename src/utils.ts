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
import type { Node, JsxElement, JsxSelfClosingElement, JsxFragment } from "typescript";

type JsxNode = JsxElement | JsxSelfClosingElement | JsxFragment;

export function findJsxElementAtCursor(editor: TextEditor) {
    const document = editor.document;
    const position = editor.selection.active;
    const cursorOffset = document.offsetAt(position);
    const startOffset = document.offsetAt(editor.selection.start);
    const endOffset = document.offsetAt(editor.selection.end);
    const text = document.getText();

    const sourceFile = createSourceFile(document.fileName, text, ScriptTarget.Latest, true, ScriptKind.TSX);

    let jsxNodes: Node[] = [];

    function getNodeFromSelection(node: Node): void {
        if (
            (isJsxElement(node) || isJsxSelfClosingElement(node) || isJsxFragment(node)) &&
            node.getStart() >= startOffset &&
            node.getEnd() <= endOffset
        ) {
            jsxNodes.push(node);
            return;
        }
        forEachChild(node, getNodeFromSelection);
    }

    function getNextSiblingNode(node: JsxNode): void {
        const parent = node.parent;
        if (!parent || !("children" in parent)) {
            jsxNodes = [];
            return;
        }

        const children = parent.children as Node[];
        const jsxChildren = children.filter(
            child => isJsxElement(child) || isJsxSelfClosingElement(child) || isJsxFragment(child),
        );

        const index = jsxChildren.findIndex(child => child.getStart(sourceFile) === node.getStart(sourceFile));

        // No match found?
        if (index === -1) {
            return;
        }

        // Is last sibling?
        if (index === jsxChildren.length - 1) {
            jsxNodes = [parent];
        } else {
            jsxNodes.push(jsxChildren[index + 1]);
        }
    }

    function getClosestNodeToCursor(node: Node): void {
        if (isJsxElement(node) || isJsxSelfClosingElement(node) || isJsxFragment(node)) {
            const start = node.getStart();
            const end = node.getEnd();

            if (cursorOffset >= start && cursorOffset <= end) {
                jsxNodes[0] = node;
            }
        }

        return forEachChild(node, getClosestNodeToCursor);
    }

    // If something selected check to see if it's jSX
    if (endOffset - startOffset > 4) {
        getNodeFromSelection(sourceFile);
    }

    // Selection was JSX?
    if (jsxNodes.length) {
        const node = jsxNodes[jsxNodes.length - 1];
        getNextSiblingNode(node as JsxNode);
    } else {
        getClosestNodeToCursor(sourceFile);
    }

    return jsxNodes;
}

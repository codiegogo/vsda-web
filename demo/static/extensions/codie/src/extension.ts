/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as vscode from "vscode";
import { count, watch } from "./watch";

let myStatusBarItem: vscode.StatusBarItem;

export function activate({ subscriptions }: vscode.ExtensionContext) {
  watch();

  let startNewD = vscode.commands.registerCommand(
    "workbench.action.remote.close2",
    () => {
      console.log("workbench action remote close2");
      vscode.commands.getCommands().then((commands) => {
        console.log(commands);
      });
    },
  );
  subscriptions.push(startNewD);

  // register a command that is invoked when the status bar
  // item is selected
  const myCommandId = "sample.showSelectionCount";
  subscriptions.push(vscode.commands.registerCommand(myCommandId, () => {
    const n = getNumberOfSelectedLines(vscode.window.activeTextEditor);
    vscode.window.showInformationMessage(
      `Yeah, ${n} line(s) selected... Keep going!`,
    );
  }));

  // create a new status bar item that we can now manage
  myStatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    Number.MAX_VALUE - 1,
  );
  myStatusBarItem.command = myCommandId;
  subscriptions.push(myStatusBarItem);

  // register some listener that make sure the status bar
  // item always up-to-date
  subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(updateStatusBarItem),
  );
  subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection(updateStatusBarItem),
  );

  // update status bar item once at start
  updateStatusBarItem();
}

function updateStatusBarItem(): void {
  const n = getNumberOfSelectedLines(vscode.window.activeTextEditor);
  if (n >= 0) {
    myStatusBarItem.text = `$(megaphone) ${count} agents(s) connected`;
    myStatusBarItem.show();
  } else {
    myStatusBarItem.hide();
  }
}

function getNumberOfSelectedLines(
  editor: vscode.TextEditor | undefined,
): number {
  let lines = 0;
  if (editor) {
    lines = editor.selections.reduce(
      (prev, curr) => prev + (curr.end.line - curr.start.line),
      0,
    );
  }
  return lines;
}

export function deactivate() {
  // Everything is nicely registered in context.subscriptions,
  // so nothing to do for now.
}

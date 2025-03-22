/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as vscode from "vscode";

let myStatusBarItem: vscode.StatusBarItem;

let agents: any[] = [];

function getConfigHub(): string | undefined {
  const config = vscode.workspace.getConfiguration("k0s");
  return config.get("hub");
}

function setConfigHub(hub: string) {
  const config = vscode.workspace.getConfiguration("k0s");
  vscode.window.showInformationMessage(`Setting hub to ${hub}`);
  return config.update("hub", hub, vscode.ConfigurationTarget.Global);
}

async function editConfigHub() {
  await vscode.commands.executeCommand(
    "workbench.action.openSettingsJson",
    { revealSetting: { key: "k0s.hub", edit: true } },
  );
}

function getOrEditConfigHub() {
  const hub = getConfigHub();
  if (hub) {
    if (!watched) {
      watchOnce(hub!);
      watched = true;
    }
    return hub;
  }
  vscode.window.showInformationMessage("Please set the hub");
  editConfigHub();
}

var watched: boolean = false;

function watchOnce(hub: string) {
  let api = `${hub}/api/agents/watch`;
  let a = new WebSocket(api);
  let dec = new TextDecoder();
  a.binaryType = "arraybuffer";
  a.addEventListener("message", ({ data }: any) => {
    agents = JSON.parse(dec.decode(data));
    updateStatusBarItem();
  });
}

export function activate({ subscriptions }: vscode.ExtensionContext) {
  vscode.window.showInformationMessage(`Codie::Activated`);

  let x = vscode.workspace.registerRemoteAuthorityResolver;

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

  subscriptions.push(
    vscode.commands.registerCommand("workbench.action.remote.new0", () => {
      console.log("new window, noargs");
      vscode.commands.executeCommand("vscode.newWindow");
    }),
  );
  subscriptions.push(
    vscode.commands.registerCommand("workbench.action.remote.new00", () => {
      console.log("new window, reuse");
      vscode.commands.executeCommand("vscode.newWindow", {
        reuseWindow: true,
      });
    }),
  );
  subscriptions.push(
    vscode.commands.registerCommand("workbench.action.remote.new000", () => {
      console.log("new window, no reuse");
      vscode.commands.executeCommand("vscode.newWindow", {
        reuseWindow: false,
      });
    }),
  );
  subscriptions.push(
    vscode.commands.registerCommand("workbench.action.remote.new0000", () => {
      console.log("new window, no reuse");
      vscode.commands.executeCommand("vscode.newWindow", {
        remoteAuthority: "127.0.0.1:8081",
        reuseWindow: false,
      });
    }),
  );
  subscriptions.push(
    vscode.commands.registerCommand("workbench.action.remote.new00000", () => {
      console.log("new window, no reuse");
      vscode.commands.executeCommand("vscode.newWindow", {
        remoteAuthority: "127.0.0.1:8081",
        reuseWindow: true,
      });
    }),
  );
  subscriptions.push(
    vscode.commands.registerCommand("workbench.action.remote.new1", () => {
      console.log("new window, remoteAuthority 127.0.0.1:8080");
      vscode.commands.executeCommand("vscode.newWindow", {
        remoteAuthority: "127.0.0.1:8080",
      });
    }),
  );
  subscriptions.push(
    vscode.commands.registerCommand("workbench.action.remote.new2", () => {
      console.log("new window, remoteAuthority 127.0.0.1:8080, reuse");
      vscode.commands.executeCommand("vscode.newWindow", {
        reuseWindow: true,
        remoteAuthority: "127.0.0.1:8080",
      });
    }),
  );
  subscriptions.push(
    vscode.commands.registerCommand("workbench.action.remote.new3", () => {
      console.log("new window, remoteAuthority 127.0.0.1:8080, no reuse");
      vscode.commands.executeCommand("vscode.newWindow", {
        reuseWindow: false,
        remoteAuthority: "127.0.0.1:8080",
      });
    }),
  );
  subscriptions.push(
    vscode.commands.registerCommand(
      "workbench.action.remote.closeCurrent",
      () => {
        console.log("new window, noargs");
        vscode.commands.executeCommand("vscode.newWindow");
      },
    ),
  );
  subscriptions.push(
    vscode.commands.registerCommand(
      "workbench.action.remote.newWithInput",
      async () => {
        // Prompt the user for the remote authority (e.g., "127.0.0.1:8080")
        const remoteAuthority = await vscode.window.showInputBox({
          placeHolder: "Enter remote authority (e.g., 127.0.0.1:8080)",
          prompt: "Specify the remote authority for the new window",
          value: "127.0.0.1:8080", // Default value
        });

        // Check if the user provided input
        if (remoteAuthority) {
          console.log(
            `Replacing window with remoteAuthority: ${remoteAuthority}`,
          );
          // Replace the current window with a new one
          vscode.commands.executeCommand("vscode.newWindow", {
            remoteAuthority: remoteAuthority,
            reuseWindow: true, // <-- This replaces the current window
          });
        }
      },
    ),
  );
  subscriptions.push(
    vscode.commands.registerCommand(
      "workbench.action.remote.newWindowWithInput",
      async () => {
        // Prompt the user for the remote authority (e.g., "127.0.0.1:8080")
        const remoteAuthority = await vscode.window.showInputBox({
          placeHolder: "Enter remote authority (e.g., 127.0.0.1:8080)",
          prompt: "Specify the remote authority for the new window",
          value: "127.0.0.1:8080", // Default value
        });

        // Check if the user provided input
        if (remoteAuthority) {
          console.log(
            `Opening window with remoteAuthority: ${remoteAuthority}`,
          );
          vscode.commands.executeCommand("vscode.newWindow", {
            remoteAuthority: remoteAuthority,
            reuseWindow: false,
          });
        }
      },
    ),
  );
  // register a command that is invoked when the status bar
  // item is selected
  const myCommandId = "sample.showSelectionCount";
  subscriptions.push(vscode.commands.registerCommand(myCommandId, () => {
    vscode.window.showInformationMessage(
      `Yeah, ${agents.length} line(s) selected... Keep going!`,
    );
    console.log(agents.length, agents);

    let hub = getOrEditConfigHub();
    if (!hub) return;

    const quickPickItems = adaptToQuickPickItems(agents);

    vscode.window.showQuickPick(quickPickItems, {
      placeHolder: "Select a agent connection",
      matchOnDescription: true,
      matchOnDetail: true,
    }).then((selected) => {
      if (selected) {
        console.log("selected", selected);
        vscode.commands.executeCommand("echoshell.createNewTerminal", {
          value: `${hub}/api/agent/${selected.agent.id}/terminal`,
          label: selected.agent.name,
        });
      }
    });
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
  // updateStatusBarItem();
  updateStatusBarItem();
}

function updateStatusBarItem(): void {
  myStatusBarItem.text = `$(megaphone) ${agents.length} agents(s) connected`;
  myStatusBarItem.show();
  // myStatusBarItem.hide();
}

export function deactivate() {
  // Everything is nicely registered in context.subscriptions,
  // so nothing to do for now.
}

interface Agent {
  id: string;
  name: string;
  tags: string[];
  auth: boolean;
  connected: number;
  ip: string;
  os: string;
  pwd: string;
  arch: string;
  username: string;
  hostname: string;
  version: string;
  git_summary: string;
}

interface AgentQuickPickItem extends vscode.QuickPickItem {
  agent: Agent;
}

function adaptToQuickPickItems(agents: Agent[]): AgentQuickPickItem[] {
  return agents.map((agent) => {
    // Format connection time
    const connectedDate = new Date(agent.connected * 1000);
    const timeString = connectedDate.toLocaleString();

    // Create status icons
    const authIcon = agent.auth ? "$(lock)" : "$(unlock)";
    const osIcon = agent.os === "linux" ? "$(terminal-linux)" : "$(terminal)";

    // Build description
    const descriptionParts = [
      `$(history) Connected: ${timeString}`,
      `$(tag) ${agent.tags.join(", ")}`,
      `$(server) ${agent.hostname} (${agent.ip})`,
    ];

    return {
      agent,
      label: `${authIcon} ${osIcon} ${agent.name}`,
      description: descriptionParts.join("  •  "),
      detail: [
        `Path: ${agent.pwd}`,
        `User: ${agent.username}@${agent.hostname}`,
        `Version: ${agent.git_summary}`,
      ].join("\n"),
      alwaysShow: true,
      buttons: [{
        iconPath: new vscode.ThemeIcon("link-external"),
        tooltip: "Open Connection",
      }],
    };
  });
}

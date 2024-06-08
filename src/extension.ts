import * as vscode from 'vscode';

class Note extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);
    this.command = command;
  }
}

class NotesTreeDataProvider implements vscode.TreeDataProvider<Note> {
  getTreeItem(element: Note): vscode.TreeItem {
    return element;
  }

  getChildren(element?: Note): Thenable<Note[]> {
    if (element) {
      if (element.label === "目录1") {
        return Promise.resolve([
          new Note(`笔记1`, vscode.TreeItemCollapsibleState.None, {
            command: 'leibaio-note.showNote', // 使用命令ID
            title: "", // 用不到title参数，因为这是点击时的命令，不是按钮
            arguments: ['笔记1的内容'] // 可传递给命令的参数，例如笔记内容或ID
          }),
          new Note(`笔记2`, vscode.TreeItemCollapsibleState.None),
        ]);
      }
      // 判断是否是目录节点，然后返回相应的笔记
      if (element.label.startsWith("目录")) {
        const directoryIndex = parseInt(element.label.slice(-1));
        // 假设每个目录都有两个笔记
        return Promise.resolve([
          new Note(`笔记${(directoryIndex - 1) * 2 + 1}`, vscode.TreeItemCollapsibleState.None),
          new Note(`笔记${(directoryIndex - 1) * 2 + 2}`, vscode.TreeItemCollapsibleState.None),
        ]);
      } else {
        // 如果已经是笔记节点了，就没有子节点
        return Promise.resolve([]);
      }
    } else {
      // 返回两个目录作为根节点
      return Promise.resolve([
        new Note('目录1', vscode.TreeItemCollapsibleState.Collapsed),
        new Note('目录2', vscode.TreeItemCollapsibleState.Collapsed),
      ]);
    }
  }
}

// activate() 插件激活时候，插件入口
export function activate(context: vscode.ExtensionContext) {

  console.log('Congratulations, your extension "leibaio-note" is now active!');
  // 命令 id 必须与 package.json 中的 command 字段匹配，相当于绑定了一个事件监听器，命令触发(如下leibaio-note.helloWorld)就执行

  // Hello World 命令
  const disposableHelloWorld = vscode.commands.registerCommand('leibaio-note.helloWorld', () => {
    // 绑定的function，执行内容
    vscode.window.showInformationMessage('Hello World from leibaio-note hi hi hi!');
  });

  // Open Note 命令
  let disposableOpenNote = vscode.commands.registerCommand('leibaio-note.openNote', () => {
    // 创建Webview Panel
    const panel = vscode.window.createWebviewPanel(
      'leibaioNote', // Identifies the type of the webview. Used internally
      'Leibaio Note', // Title of the panel displayed to the user
      vscode.ViewColumn.One, // Editor column to show the new webview panel in.
      {} // Webview options. More on these later.
    );

    // 设置Webview的HTML内容
    panel.webview.html = getWebviewContent();
  });

  // 注册打开笔记的命令
  let disposableShowNote = vscode.commands.registerCommand('leibaio-note.showNote', (noteContent: string) => {
    // 创建Webview Panel
    const panel = vscode.window.createWebviewPanel(
      'note', // Webview类型
      'Note', // Webview标题
      vscode.ViewColumn.One, // 在编辑器的哪一列中显示新的webview面板
      {} // Webview选项
    );

    // 设置Webview的HTML内容
    panel.webview.html = getNoteWebviewContent(noteContent);
  });

  // 注册TreeView数据提供者
  const notesTreeViewProvider = new NotesTreeDataProvider();
  vscode.window.createTreeView('noteTreeView', { treeDataProvider: notesTreeViewProvider });

  context.subscriptions.push(disposableHelloWorld);
  context.subscriptions.push(disposableOpenNote);
  context.subscriptions.push(disposableShowNote);
}

// This method is called when your extension is deactivated
export function deactivate() { }

// 生成显示在Webview中的HTML内容
function getWebviewContent() {
  return `<!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Leibaio Note</title>
          </head>
          <body>
              <h1>Leibaio Note</h1>
              <p>这里显示Leibaio的笔记内容。</p>
          </body>
          </html>`;
}

// 生成显示笔记内容的Webview HTML
function getNoteWebviewContent(noteContent: string) {
  return `<!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Note</title>
          </head>
          <body>
              <h1>Note</h1>
              <p>${noteContent}</p>
          </body>
          </html>`;
}
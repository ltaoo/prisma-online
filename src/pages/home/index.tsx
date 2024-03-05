import { useEffect, useCallback, useRef, useState } from "react";
import axios from "axios";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import "monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution.js";
import "monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution.js";
import "monaco-editor/esm/vs/language/css/monaco.contribution";
import "monaco-editor/esm/vs/language/html/monaco.contribution";
import "monaco-editor/esm/vs/language/json/monaco.contribution";
import "monaco-editor/esm/vs/language/typescript/monaco.contribution";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
// @ts-ignore
import { languages } from "monaco-editor/esm/vs/editor/edcore.main";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
// import typescript from "monaco-editor/esm/vs/language/typescript/tsWorker?worker";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
// @ts-ignore
import * as vim from "monaco-vim";

import { ViewComponent } from "@/store/types";

window.MonacoEnvironment = {
  // @ts-ignore
  getWorker(_: unknown, label: "json" | "javascript" | "typescript") {
    if (label === "json") {
      return new jsonWorker();
    }
    if (label === "typescript") {
      return new tsWorker();
    }
    if (label === "javascript") {
      return new tsWorker();
    }
    return new editorWorker();
  },
};

async function fetchFiles() {
  try {
    const r = await axios.get<{
      code: number;
      msg: string;
      data: {
        files: {
          filepath: string;
          content: string;
        }[];
      };
    }>("/api/v1/devtools/prisma/files");
    return r.data.data.files;
  } catch (err) {
    return [];
  }
}
async function execPrismaCode(code: string) {
  try {
    const r = await axios.post<{
      code: number;
      msg: string;
      data: unknown[];
    }>("/api/v1/devtools/prisma/exec", {
      code,
    });
    return r.data;
  } catch (err) {
    return {
      code: 0,
      msg: "",
      data: [],
    };
  }
}

const HomePage: ViewComponent = (props) => {
  const { storage } = props;

  const ref = useRef(null);
  const editorRef = useRef<null | monaco.editor.IStandaloneCodeEditor>(null);
  const vimModeRef = useRef<null | { dispose: () => void }>(null);
  const vimStatusRef = useRef<HTMLDivElement | null>(null);
  const [vimChecked, setVimChecked] = useState(storage.get("settings").vim);
  const [logs, setLogs] = useState<unknown[]>([]);

  const execCode = useCallback(async (code) => {
    const cleanContent = code.replace(
      /import { client } from '\.\/client';/,
      ""
    );
    const r = await execPrismaCode(cleanContent);
    setLogs(
      r.data.map((d) => {
        return JSON.stringify(d, null, 2);
      })
    );
  }, []);

  useEffect(() => {
    if (ref.current === null) {
      return;
    }
    const compilerOptions: monaco.languages.typescript.CompilerOptions = {
      strict: true,
      target: languages.typescript.ScriptTarget.ESNext,
      module: languages.typescript.ModuleKind.ESNext,
      moduleResolution: languages.typescript.ModuleResolutionKind.NodeJs,
      jsx: languages.typescript.JsxEmit.Preserve,
      // jsxImportSource: "solid-js",
      allowNonTsExtensions: true,
    };
    languages.typescript.typescriptDefaults.setCompilerOptions(compilerOptions);
    languages.typescript.javascriptDefaults.setCompilerOptions(compilerOptions);
    (async () => {
      const files = await fetchFiles();
      for (let i = 0; i < files.length; i += 1) {
        const { filepath, content } = files[i];
        const uri = filepath
          .replace(/^[-_/a-zA-Z]{1,}\/node_modules/, "")
          .replace("@prisma", "_prisma");
        monaco.editor.createModel(
          content.replace("@prisma", "/_prisma"),
          "typescript",
          monaco.Uri.parse(`file://${uri}`)
        );
      }
      monaco.editor.createModel(
        "import { PrismaClient } from './.prisma/client';\n\nexport const client = new PrismaClient();",
        "typescript",
        monaco.Uri.parse("file:///client.ts")
      );
    })();
    const editor = monaco.editor.create(ref.current, {
      fontSize: 16,
      language: "typescript",
      renderWhitespace: "all",
      automaticLayout: true,
      minimap: {
        enabled: false,
      },
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      const content = editor.getValue();
      editor.getAction("editor.action.formatDocument").run();
      execCode(content);
      storage.set("content", content);
    });
    editorRef.current = editor;
    const content = storage.get("content");
    const main = monaco.editor.createModel(
      content ||
        `import { client } from './client';

// 执行任意语句
const data = await client.user.findFirst({
    where: {}
});
// 使用 console.log 查看变量值
console.log(data);
// 每次 console.log 都会生成一个变量值
console.log({ text: 'hello prisma' });
`,
      "typescript",
      monaco.Uri.parse("file:///index.ts")
    );
    editor.setModel(main);
    setTimeout(() => {
      const settings = storage.get("settings");
      if (settings.vim && vimStatusRef.current) {
        vimModeRef.current = vim.initVimMode(editor, vimStatusRef.current);
      }
      editor.getAction("editor.action.formatDocument").run();
    }, 1200);
  }, []);

  console.log("render", vimChecked);

  return (
    <PanelGroup direction="horizontal" id="group" className="">
      <Panel id="left-panel" className="relative">
        <div className="flex items-center p-2">
          <input
            type="checkbox"
            checked={vimChecked}
            onChange={(event) => {
              console.log(event.target.checked);
              setVimChecked(event.target.checked);
              if (event.target.checked) {
                if (!vimModeRef.current) {
                  vimModeRef.current = vim.initVimMode(
                    editorRef.current,
                    vimStatusRef.current
                  );
                  storage.merge("settings", {
                    vim: true,
                  });
                  return;
                }
                return;
              }
              storage.merge("settings", {
                vim: false,
              });
              if (vimModeRef.current) {
                // @ts-ignore
                vimModeRef.current.dispose();
                vimModeRef.current = null;
              }
            }}
          />
          <span className="ml-2">vim</span>
          <div className="ml-8">
            <div ref={vimStatusRef} />
          </div>
        </div>
        <div ref={ref} style={{ height: "100vh" }}></div>
        <div
          className="btn absolute right-8 top-4"
          onClick={async () => {
            const editor = editorRef.current;
            if (!editor) {
              return;
            }
            const content = editor.getValue();
            execCode(content);
          }}
        >
          执行
        </div>
      </Panel>
      <PanelResizeHandle id="resize-handle" className="w-2 bg-gray-200" />
      <Panel id="right-panel" className="h-screen">
        <div
          className="p-2 max-h-full overflow-y-auto"
          style={{ fontSize: 16 }}
        >
          <div className="space-y-4">
            {logs.map((content, i) => {
              return (
                <div key={i}>
                  <pre>{content as string}</pre>
                </div>
              );
            })}
          </div>
        </div>
      </Panel>
    </PanelGroup>
  );
};

export default HomePage;

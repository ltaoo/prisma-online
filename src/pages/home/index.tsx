import { useEffect, useCallback, useRef, useState } from "react";
import axios, { AxiosError } from "axios";
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
import { Spin } from "@/components/spin";
import { Result } from "@/utils";

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
    if (r.data.code !== 0) {
      return Result.Err(r.data.msg, r.data.code);
    }
    return Result.Ok(r.data.data);
  } catch (err) {
    const e = err as AxiosError;
    return Result.Err(e.message);
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
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  const execCode = useCallback(async (code) => {
    const cleanContent = code.replace(
      /import { client } from '\.\/client';/,
      ""
    );
    setLoading(true);
    const r = await execPrismaCode(cleanContent);
    setLoading(false);
    if (r.error) {
      // alert(r.error.message);
      setErrorText(r.error.message);
      setErrorDialogOpen(true);
      return;
    }
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
        const uri = filepath;
        monaco.languages.typescript.typescriptDefaults.addExtraLib(
          content,
          `file:///node_modules/${uri}`
        );
      }
      // monaco.languages.typescript.typescriptDefaults.addExtraLib(
      //   "export * from '.prisma/client'",
      //   "file:///node_modules/@prisma/client/index.d.ts"
      // );
      monaco.editor.createModel(
        "import { PrismaClient } from '@prisma/client';\n\nexport const client = new PrismaClient();",
        "typescript",
        monaco.Uri.parse(`file:///client.ts`)
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
    <>
      <PanelGroup
        direction="horizontal"
        id="group"
        className=""
        onLayout={(r) => {
          storage.set("layout", r);
        }}
      >
        <Panel
          id="left-panel"
          className="relative"
          defaultSize={storage.get("layout")[0]}
        >
          <div className="h-screen flex flex-col">
            <div className="flex items-center h-[56px] p-2">
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
            <div ref={ref} className="flex-1"></div>
          </div>
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
        <Panel
          id="right-panel"
          className="relative h-screen"
          defaultSize={storage.get("layout")[1]}
        >
          {loading ? (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Spin theme="dark" />
            </div>
          ) : null}
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
      {errorDialogOpen ? (
        <div
          className="fixed inset-0"
          onClick={() => {
            setErrorDialogOpen(false);
          }}
        >
          <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-[520px] h-[320px] p-4 overflow-y-auto rounded-md bg-white shadow-xl">
              <pre>{errorText}</pre>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default HomePage;

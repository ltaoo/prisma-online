import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
// import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import "monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution.js";
import "monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution.js";

// import "monaco-editor/esm/vs/basic-languages/abap/abap.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/apex/apex.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/azcli/azcli.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/bat/bat.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/bicep/bicep.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/cameligo/cameligo.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/clojure/clojure.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/coffee/coffee.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/cpp/cpp.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/csharp/csharp.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/csp/csp.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/css/css.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/cypher/cypher.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/dart/dart.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/dockerfile/dockerfile.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/ecl/ecl.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/elixir/elixir.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/flow9/flow9.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/fsharp/fsharp.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/freemarker2/freemarker2.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/go/go.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/graphql/graphql.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/handlebars/handlebars.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/hcl/hcl.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/html/html.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/ini/ini.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/java/java.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/julia/julia.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/kotlin/kotlin.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/less/less.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/lexon/lexon.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/lua/lua.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/liquid/liquid.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/m3/m3.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/markdown/markdown.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/mips/mips.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/msdax/msdax.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/mysql/mysql.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/objective-c/objective-c.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/pascal/pascal.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/pascaligo/pascaligo.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/perl/perl.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/pgsql/pgsql.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/php/php.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/pla/pla.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/postiats/postiats.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/powerquery/powerquery.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/powershell/powershell.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/protobuf/protobuf.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/pug/pug.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/python/python.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/qsharp/qsharp.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/r/r.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/razor/razor.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/redis/redis.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/redshift/redshift.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/restructuredtext/restructuredtext.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/ruby/ruby.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/rust/rust.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/sb/sb.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/scala/scala.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/scheme/scheme.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/scss/scss.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/shell/shell.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/solidity/solidity.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/sophia/sophia.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/sparql/sparql.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/sql/sql.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/st/st.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/swift/swift.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/systemverilog/systemverilog.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/tcl/tcl.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/twig/twig.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/vb/vb.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/xml/xml.contribution.js";
// import "monaco-editor/esm/vs/basic-languages/yaml/yaml.contribution.js";

// import "monaco-editor/esm/vs/basic-languages/monaco.contribution";

import "monaco-editor/esm/vs/language/css/monaco.contribution";
import "monaco-editor/esm/vs/language/html/monaco.contribution";
import "monaco-editor/esm/vs/language/json/monaco.contribution";
import "monaco-editor/esm/vs/language/typescript/monaco.contribution";

import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
// @ts-ignore
import { languages } from "monaco-editor/esm/vs/editor/edcore.main";
// @ts-ignore
import * as vim from "monaco-vim";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
// import typescript from "monaco-editor/esm/vs/language/typescript/tsWorker?worker";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";

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

const HomePage = () => {
  const ref = useRef(null);
  const editorRef = useRef<null | monaco.editor.IStandaloneCodeEditor>(null);
  const vimModeRef = useRef<null | { dispose: () => void }>(null);
  const vimStatusRef = useRef<HTMLDivElement | null>(null);
  const [logs, setLogs] = useState<unknown[]>([]);

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
        monaco.Uri.parse("file:///client.d.ts")
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
    editorRef.current = editor;
    const main = monaco.editor.createModel(
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
      editor.getAction("editor.action.formatDocument").run();
    }, 1200);
  }, []);
  return (
    <PanelGroup direction="horizontal" id="group" className="">
      <Panel id="left-panel" className="relative">
        <div className="flex items-center p-2">
          <input
            type="checkbox"
            onChange={(event) => {
              if (event.target.checked) {
                if (!vimModeRef.current) {
                  vimModeRef.current = vim.initVimMode(
                    editorRef.current,
                    vimStatusRef.current
                  );
                  return;
                }
                return;
              }
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
            const cleanContent = content.replace(
              /import { client } from '\.\/client';/,
              ""
            );
            const r = await execPrismaCode(cleanContent);
            setLogs(
              r.data.map((d) => {
                return JSON.stringify(d, null, 2);
              })
            );
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

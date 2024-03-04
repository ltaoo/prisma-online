import { useEffect, useRef } from "react";
import axios from "axios";
import { languages } from "monaco-editor";
import * as monaco from "monaco-editor";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
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
    }>("/api/v2/devtools/prisma_client");
    return r.data.data.files;
  } catch (err) {
    return [];
  }
}
async function fetchFile(url: string) {
  try {
    const r = await axios.get(url);
    return r.data;
  } catch (err) {
    return "";
  }
}

const TestPage = () => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current === null) {
      return;
    }
    // const types
    // const types: Record<string, string> = import.meta.globEager(
    //   "/public/prisma-client.d.ts",
    //   {
    //     as: "raw",
    //   }
    // );
    const compilerOptions: languages.typescript.CompilerOptions = {
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
      // const content1 = await fetchFile("/index.d.ts");
      // const model = monaco.editor.createModel(
      //   content1,
      //   "typescript",
      //   monaco.Uri.parse("file:///path/to/types/index.d.ts")
      // );
      // const content2 = await fetchFile("/library.d.ts");
      // const model2 = monaco.editor.createModel(
      //   content2,
      //   "typescript",
      //   monaco.Uri.parse("file:///path/to/types/library.d.ts")
      // );
      // const content3 = await fetchFile("/prisma-client.d.ts");
      // const model3 = monaco.editor.createModel(
      //   content3,
      //   "typescript",
      //   monaco.Uri.parse("file:///path/to/types/prisma-client.d.ts")
      // );
      const files = await fetchFiles();
      for (let i = 0; i < files.length; i += 1) {
        const { filepath, content } = files[i];
        const uri = filepath
          .replace(/^[-_/a-zA-Z]{1,}\/node_modules/, "")
          .replace("@prisma", "_prisma");
        console.log(uri);
        monaco.editor.createModel(
          content.replace("@prisma", "/_prisma"),
          "typescript",
          monaco.Uri.parse(`file://${uri}`)
        );
      }
      const model4 = monaco.editor.createModel(
        "import { PrismaClient } from './.prisma/client';\n\nexport const client = new PrismaClient();",
        "typescript",
        monaco.Uri.parse("file:///client.d.ts")
      );
    })();
    // const prismaDeclaration = `export class PrismaClient {
    //   constructor();
    //   drive(name: string): void;
    // }`;
    // const prismaDeclaration2 = `declare module 'prisma-types' {
    //   // 定义 PrismaClient 类
    //   export class PrismaClient {
    //     // 假设 PrismaClient 中有 drive 方法，需要根据实际情况添加方法签名和参数类型
    //     drive(direction: string): boolean;
    //     // 其他可能的方法或属性定义...
    //   }
    // }`;

    const editor = monaco.editor.create(ref.current, {
      // value: `import { CustomModule } from "./customModule";`,
      language: "typescript",
      renderWhitespace: "all",
      minimap: {
        enabled: false,
      },
    });
    const AModel = monaco.editor.createModel(
      `import { client } from './client';

const data = await client.user.findFirst({
    where: {
        id: '123',
    }
});
console.log(data);
`,
      "typescript",
      monaco.Uri.parse("file:///index.ts")
    );

    // 创建 B 文件的模型 BModel
    // const BModel = monaco.editor.createModel(
    //   prismaDeclaration,
    //   "typescript",
    //   monaco.Uri.parse("file:///path/to/prisma-client.ts")
    // );
    // const BModel = monaco.editor.createModel(
    //   prismaDeclaration,
    //   "typescript",
    //   monaco.Uri.parse("file:///path/to/prisma-client.ts")
    // );
    // const BModel = monaco.editor.createModel(
    //   prismaDeclaration,
    //   "typescript",
    //   monaco.Uri.parse("file:///node_modules/solid-js/web/types/index")
    // );
    // monaco.languages.typescript.typescriptDefaults.addExtraLib(prismaDeclaration, 'file:///path/to/customModule.d.ts');
    // monaco.languages.typescript.typescriptDefaults.addExtraLib(
    //   prismaDeclaration2,
    //   "file:///path/to/globals.d.ts"
    // );

    // 将 AModel 设置到编辑器中
    editor.setModel(AModel);
    // const uri = editor.getModel()?.uri.toString();
    // console.log("uri ", uri);
    setTimeout(() => {
      editor.getAction("editor.action.formatDocument").run();
    }, 3000);
  }, []);
  return <div ref={ref} style={{ height: 480 }}></div>;
};

export default TestPage;

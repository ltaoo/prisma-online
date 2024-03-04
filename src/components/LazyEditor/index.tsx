/**
 * @file 使用 requirejs 加载包含最新版 typescript 的 monaco-editor 编辑器
 */
import React, { useEffect, useRef, useState } from "react";
import type * as monaco from "monaco-editor";
import axios from "axios";

import { loadScript } from "@/utils";

interface IEditorProps {
  value?: string;
  defaultValue?: string;
  language?: string;
  onChange?: (value: string) => void;
  onSave?: (value?: string) => void;
}
const LazyEditor: React.FC<IEditorProps> = (props) => {
  const {
    defaultValue,
    value,
    language = "typescript",
    onChange,
    onSave,
  } = props;

  const onChangeRef = useRef(onChange);
  const onSaveRef = useRef(onSave);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const insRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [loading, setLoading] = useState(true);
  const languageRef = useRef(language);
  const vRef = useRef(value || defaultValue);

  useEffect(() => {
    (async () => {
      if (insRef.current !== null) {
        return;
      }
      await loadScript("//static.funzm.com/assets/require@2.3.6.js");
      // @ts-ignore
      if (window.requirejs === undefined) {
        return;
      }
      // console.log("[COMPONENT](LazyEditor)", editorRef.current);
      if (editorRef.current === null) {
        return;
      }
      // @ts-ignore
      requirejs.config({
        paths: {
          vs: "//static.funzm.com/assets/monaco/4.9.4/min/vs",
        },
        ignoreDuplicateModules: ["vs/editor/editor.main"],
      });
      // console.log("before require modules", vRef.current, languageRef.current);
      // @ts-ignore
      requirejs(
        ["vs/editor/editor.main", "vs/language/typescript/tsWorker"],
        // @ts-ignore
        (monaco, ts) => {
          monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: false,
            noSyntaxValidation: false,
          });
          monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.ES2016,
            allowNonTsExtensions: true,
            moduleResolution:
              monaco.languages.typescript.ModuleResolutionKind.NodeJs,
            module: monaco.languages.typescript.ModuleKind.CommonJS,
            noEmit: true,
            noLib: true,
            typeRoots: ["node_modules/@types"],
          });
          // monaco.languages.typescript.typescriptDefaults.addExtraLib(
          //   [
          //     "declare class Facts {",
          //     "    /**",
          //     "     * Returns the next fact",
          //     "     */",
          //     "    static next():string",
          //     "}",
          //   ].join("\n"),
          //   monaco.Uri.parse("ts:filename/node_modules/@types/prisma/client.ts")
          // );
          (async () => {
            // const r = await axios.get("/tools/test.d.ts");
            const r = await axios.get("/tools/prisma-client.min.d.ts");
            const code = r.data;
            // editor.setValue(r.data);
            // const code = `declare type Aggregate = '_count' | '_max' | '_min' | '_avg' | '_sum';

            // declare type Args_3 = InternalArgs;
            
            // declare type Args_4<T, F extends Operation> = T extends {
            //     [K: symbol]: {
            //         types: {
            //             [K in F]: {
            //                 args: any;
            //             };
            //         };
            //     };
            // } ? T[symbol]['types'][F]['args'] : never;
            
            // declare type BaseDMMF = Pick<DMMF.Document, 'datamodel' | 'mappings'>;
            
            // declare interface BaseDMMFHelper extends DMMFDatamodelHelper, DMMFMappingsHelper {
            // }
            
            // declare class BaseDMMFHelper {
            //     constructor(dmmf: BaseDMMF);
            // }`;
            monaco.languages.typescript.typescriptDefaults.addExtraLib(
              code,
              monaco.Uri.parse(
                "ts:filename/node_modules/@types/prisma/client.ts"
              )
            );
          })();
          // monaco.languages.typescript.typescriptDefaults.addExtraLib(
          //   [
          //     "declare class Facts {",
          //     "    /**",
          //     "     * Returns the next fact",
          //     "     */",
          //     "    static next():string",
          //     "}",
          //   ].join("\n"),
          //   monaco.Uri.parse("ts:filename/node_modules/@types/prisma/client.ts")
          // );
          // monaco.languages.typescript.typescriptDefaults.addExtraLib(
          //   ["export * from './index';"].join("\n"),
          //   monaco.Uri.parse(
          //     "ts:filename/node_modules/@types/prisma/library.ts"
          //   )
          // );
          // monaco.languages.typescript.typescriptDefaults.addExtraLib(
          //   [
          //     "declare type Value = unknown;",
          //     "declare function warnEnvConflicts(envPaths: any): void;",
          //   ].join("\n"),
          //   monaco.Uri.parse("ts:filename/node_modules/@types/prisma/index.ts")
          // );
          // console.log("loaded modules", monaco, ts, window.ts, vRef.current);
          const editor = monaco.editor.create(editorRef.current, {
            text: vRef.current,
            language: languageRef.current,
            scrollBeyondLastColumn: 3,
            scrollBeyondLastLine: true,
            fontSize: 14,
            quickSuggestions: {
              other: true,
              comments: true,
              strings: true,
            },
            minimap: {
              enabled: false,
            },
            acceptSuggestionOnCommitCharacter: true,
            acceptSuggestionOnEnter: "on",
            accessibilitySupport: "on",
            inlayHints: {
              enabled: true,
            },
            lightbulb: {
              enabled: true,
            },
          });
          const model = editor.getModel();
          model?.onDidChangeContent(() => {
            if (onChangeRef.current) {
              onChangeRef.current(model.getValue());
            }
          });
          editor.setValue(vRef.current);
          insRef.current = editor;
          setLoading(false);
        },
        () => {
          alert("loaded modules failed");
        }
      );
    })();
  }, []);

  useEffect(() => {
    const editor = insRef.current;
    if (editor === null) {
      return;
    }
    if (value && vRef.current !== value) {
      vRef.current = value;
      editor.setValue(value);
    }
  }, [value]);

  useEffect(() => {
    vRef.current = value;
  }, [value]);
  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  useEffect(() => {
    if (onChange && onChange !== onChangeRef.current) {
      onChangeRef.current === onChange;
    }
  }, [onChange]);
  useEffect(() => {
    if (onSave && onSave !== onSaveRef.current) {
      onSaveRef.current === onSave;
    }
  }, [onSave]);

  return (
    <div>
      {loading && <div>Loading</div>}
      <div ref={editorRef} className="h-120 border border-1" />
    </div>
  );
};

export default LazyEditor;

import fs from "fs/promises";
import path from "path";

import resolve from "resolve/sync";

import { PrismaClientTypeEntryName } from "./constants";

export function validate_prisma_client() {
  //   const filepath = path.resolve(process.cwd(), PrismaClientTypeEntryName);
  try {
    const PrismaClient = require("@prisma/client").PrismaClient;
    if (typeof PrismaClient !== "function") {
      return Result.Err("@prisma/client 模块内容错误");
    }
    return Result.Ok(null);
  } catch (err) {
    return Result.Err(
      "没有找到 node_modules/.prisma，请先执行 prisma generate 命令。"
    );
  }
}

type Mod = {
  filepath: string;
  content: string;
  imports: Mod[];
};
export async function load_file(filepath: string) {
  try {
    const file_content = await fs.readFile(filepath, "utf-8");
    const regexp = /from ['"]([^'"]{1,})['"];{0,1}/g;
    const r1 = file_content.match(regexp);
    const entry: Mod = {
      filepath,
      content: file_content,
      imports: [],
    };
    if (!r1) {
      return Result.Ok(entry);
    }
    for (let i = 0; i < r1.length; i += 1) {
      await (async () => {
        const r1_str = r1[i];
        const regexp = /from ['"]([^'"]{1,})['"];{0,1}/;
        const r2 = r1_str.match(regexp);
        if (!r2) {
          return;
        }
        const module_path = (() => {
          const s = r2[1];
          if (s.endsWith(".d.ts")) {
            return s;
          }
          return [s, "d.ts"].join(".");
        })();
        const file = (() => {
          if (module_path.match(/^\./)) {
            return {
              // 相对路径
              type: 1,
              filepath: module_path,
            };
          }
          if (module_path.match(/^\//)) {
            return {
              // 绝对路径
              type: 2,
              filepath: module_path,
            };
          }
          return {
            // node_modules 模块
            type: 3,
            filepath: module_path,
          };
        })();
        // console.log("load_file", file);
        if (file.type === 1) {
          const basedir = path.parse(filepath).dir;
          const filepath2 = resolve(file.filepath, {
            basedir,
          });
          // console.log("1", filepath, file.filepath, basedir, filepath2);
          const r = await load_file(filepath2);
          if (r.error) {
            return;
          }
          entry.imports.push(r.data);
          return;
        }
        if (file.type === 3) {
          const filepath2 = resolve(file.filepath, {
            basedir: path.resolve(process.cwd(), "node_modules"),
          });
          const r = await load_file(filepath2);
          if (r.error) {
            return;
          }
          entry.imports.push(r.data);
          return;
        }
      })();
    }
    return Result.Ok(entry);
  } catch (err) {
    const e = err as Error;
    return Result.Err(e.message);
  }
}
export function flatten_mod(mod: Mod) {
  const result: { filepath: string; content: string }[] = [];
  result.push({ filepath: mod.filepath, content: mod.content });
  function process_imports(imports) {
    for (const importedMod of imports) {
      const flattenedImportedMod = flatten_mod(importedMod);
      result.push(...flattenedImportedMod);
    }
  }
  process_imports(mod.imports);
  return result;
}

export class BizError extends Error {
  message: string;
  code?: string | number;
  data: unknown | null = null;

  constructor(msg: string, code?: string | number, data: unknown = null) {
    super(msg);

    this.message = msg;
    this.code = code;
    this.data = data;
  }
}

export type Resp<T> = {
  data: T extends null ? null : T;
  error: T extends null ? BizError : null;
};
export type Result<T> = Resp<T> | Resp<null>;
export type UnpackedResult<T> = NonNullable<
  T extends Resp<infer U> ? (U extends null ? U : U) : T
>;
/** 构造一个结果对象 */
export const Result = {
  /** 构造成功结果 */
  Ok: <T>(value: T) => {
    const result = {
      data: value,
      error: null,
    } as Result<T>;
    return result;
  },
  /** 构造失败结果 */
  Err: <T>(
    message: string | BizError | Error | Result<null>,
    code?: string | number,
    data: unknown = null
  ) => {
    const result = {
      data,
      code,
      error: (() => {
        if (typeof message === "string") {
          const e = new BizError(message, code, data);
          return e;
        }
        if (message instanceof BizError) {
          return message;
        }
        if (typeof message === "object") {
          const e = new BizError((message as Error).message, code, data);
          return e;
        }
        if (!message) {
          const e = new BizError("未知错误", code, data);
          return e;
        }
        const r = message as Result<null>;
        return r.error;
      })(),
    } as Result<null>;
    return result;
  },
};

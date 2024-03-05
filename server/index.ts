#!/usr/bin/env node
import path from "path";
import vm from "vm";

import express from "express";
import { program } from "commander";

import { name, version } from "../package.json";

import { load_file, flatten_mod, validate_prisma_client } from "./utils";
import { PrismaClientTypeEntryName } from "./constants";

program
  .name(name)
  .version(version)
  .option("--port <number>")
  .option("--db <char>")
  .option("--schema <char>");
program.parse();
const options = program.opts();

function main() {
  const r = validate_prisma_client();
  if (r.error) {
    console.log(r.error.message);
    return;
  }
  const app = express();
  const PrismaClient = require("@prisma/client").PrismaClient;
  const client = (() => {
    if (!options.db) {
      return new PrismaClient();
    }
    return new PrismaClient({
      datasources: {
        db: {
          url: `file://${options.db}`,
        },
      },
    });
  })();
  const static_dir = path.resolve(__dirname, "./dist");
  app.use(express.json());
  app.use(express.static(static_dir));
  app.get("/api/v1/devtools/prisma/files", async (req, res) => {
    const filepath = path.resolve(process.cwd(), PrismaClientTypeEntryName);
    const r = await load_file(filepath);
    if (r.error) {
      res.json({
        code: 1001,
        msg: r.error.message,
        data: {},
      });
      return;
    }
    const files = flatten_mod(r.data);
    res.json({
      code: 0,
      msg: "",
      data: {
        files,
      },
    });
  });
  app.post("/api/v1/devtools/prisma/exec", async (req, res) => {
    const code = req.body.code;
    const result: unknown[] = [];
    const context = {
      console: {
        log: (...args: unknown[]) => {
          result.push(...args);
        },
      },
      client,
    };
    const sandbox = vm.createContext(context);
    await vm.runInNewContext(
      `(async () => {
${code}
})();`,
      sandbox
    );
    res.json({
      code: 0,
      msg: "",
      data: result,
    });
    return;
  });

  const PORT = options.port || 8000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

main();

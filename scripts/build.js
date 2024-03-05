const fs = require("fs");

const esbuild = require("esbuild");
const { build } = require("vite");

// const front_config = require("../vite.config");
async function main() {
  await esbuild.build({
    entryPoints: ["server/index.ts"],
    bundle: true,
    outfile: "output/app.js",
    format: "cjs",
    platform: "node",
    external: ["@prisma/client"],
    // metafile: true,
    watch: process.argv.includes("--watch"),
  });
  // await build();
  // fs.writeFileSync(
  //   "./output/meta.json",
  //   JSON.stringify(result.metafile, null, 2)
  // );
}

main();

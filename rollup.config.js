const { dts } = require("rollup-plugin-dts");

const config = [
  // …
  {
    input: "./public/prisma-client.d.ts",
    output: [{ file: "dist/my-library.d.ts", format: "es" }],
    plugins: [dts()],
  },
];

module.exports = config;

const fs = require("fs");
const path = require("path");

const pkg = require("../package.json");

function main() {
  const { dependencies, devDependencies, ...rest } = pkg;
  fs.writeFileSync(
    path.resolve(__dirname, "../package.json"),
    JSON.stringify(rest, null, 2)
  );
  fs.writeFileSync(
    path.resolve(__dirname, "../package.json.tmp"),
    JSON.stringify(pkg, null, 2)
  );
}

main();

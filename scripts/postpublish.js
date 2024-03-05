const fs = require("fs");
const path = require("path");

function main() {
  fs.renameSync(
    path.resolve(__dirname, "../package.json.tmp"),
    path.resolve(__dirname, "../package.json")
  );
}

main();

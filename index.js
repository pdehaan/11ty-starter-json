const fs = require("fs-extra");
const lib = require("./lib");

main();

async function main() {
  const spaces = process.env.NODE_ENV === "production" ? 0 : 2;
  try {
    const starters = await lib.getStarters();
    await fs.writeJSON("./starters.json", starters, { spaces });
    console.log("Done!", `Found ${starters.length} starter templates`);
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  }
}

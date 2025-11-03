var fs = require("fs-extra");
var env = "production"; //production //staging
var args = process.argv.slice(2);
if (args.length > 0) {
  if (args[0].includes("staging") || args[0].includes("production")) {
    env = args[0];
    console.error(`start config ${env}`);

    fs.copy(`config/${env}/config.ts`, "config/config.ts");
  }
} else {
  console.error("Please pass env type 'staging' or 'production'");
}

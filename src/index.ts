import path from "path";
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
import { ClientCore } from "./core/client";
new ClientCore({
  clientToken: process.env.CLIENT_TOKEN,
  mongoURL: process.env.MONGO_STRING,
}).handler({
  commandsDir: __dirname + "/commands",
  eventsDir: __dirname + "/events",
  clientDevelopers: ["690591139996106855"],
  clientVersion: require("../package.json").version,
  clientName: "SoB: The Bot",
  clientPrefix: "?",
});
process.on("uncaughtException", (error) => {
  require("./utils/util").log(2, error);
});
process.on("exit", (code) => {
  require("./utils/util").log(2, new Error(`Exiting with code ${code}`));
});
process.on("warning", (warning) => {
  require("./utils/util").log(1, warning.message);
});
process.on("message", (message) => {
  require("./utils/util").log(0, message);
});
process.on("unhandledRejection", (reason) => {
  require("./utils/util").log(2, reason);
});

import type { ParsedClient } from "../typings/export";
import * as eris from "eris";
require("dotenv");
import * as fs from "fs";
import utils from "../utils/util";
class ClientCore {
  token: string;
  mongoURL: string;
  name: string;
  prefix: string;
  constructor(options: { clientToken: string; mongoURL: string }) {
    this.token = options.clientToken;
    this.mongoURL = options.mongoURL;
  }

  handler(options: {
    commandsDir: string;
    eventsDir: string;
    clientDevelopers?: Array<string>;
    clientVersion?: number;
    clientName?: string;
    clientPrefix?: string;
  }) {
    const mongoose = require("mongoose");
    mongoose.set("useNewUrlParser", true);
    mongoose.set("useFindAndModify", false);
    mongoose.set("useCreateIndex", true);
    mongoose.set("useUnifiedTopology", true);
    mongoose.connect(this.mongoURL);
    const client: ParsedClient = Object.assign(
      new eris.Client(this.token, {
        maxShards: "auto",
        intents: ["guilds", "guildMessages"],
        allowedMentions: { everyone: true, roles: true },
      }),
      {
        prefix: options.clientPrefix || "=",
        username: options.clientName || "Bot",
        developers: options.clientDevelopers || [],
        version: options.clientVersion || 1.0,
        currentExecDirectory: process.cwd(),
        utils: utils,
        commands: new Map(),
        emojis: new Map()
          .set("success", "<a:checkv2:699728359805943919>")
          .set("fail", "<a:anix:679455003710193672>")
          .set("warn", "⚠️"),
      }
    );

    client.connect();

    fs.readdir(options.eventsDir, (err: any, files: any[]) => {
      if (err) return client.utils.log(2, err, client);
      files.forEach((file: string) => {
        if (!file.endsWith(".js")) return;
        const event = require(`${options.eventsDir}/${file}`);
        const eventName: string = file.split(".")[0];
        client.on(eventName, event.bind(null, client));
      });
    });

    fs.readdir(options.commandsDir, (err: any, files: any[]) => {
      if (err) return client.utils.log(2, err, client);
      files.forEach((file: string) => {
        if (!file.endsWith(".js")) return;
        const props = require(`${options.commandsDir}/${file}`);
        const commandName = props?.options?.commandName;
        client.commands.set(commandName, props);
      });
    });
  }
}

export { ClientCore };

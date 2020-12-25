import { Eris, ParsedClient } from "../typings/export";
let color = require("colors");
export = {
  exec: (
    client: ParsedClient,
    message: Eris.Message<Eris.TextChannel>,
    messageArgs: Array<string>
  ) => {
    const fs = require("fs");
    const reloadReport: Array<string> = [];
    messageArgs.forEach((arg: string) => {
      const fileToReload = require("path").resolve(__dirname, "../", arg);
      if (fs.existsSync(fileToReload + ".js")) {
        const fileType = fileToReload.includes("commands")
          ? 0
          : fileToReload.includes("events")
          ? 1
          : fileToReload.includes("utils")
          ? 2
          : undefined;
        switch (fileType) {
          case 0: {
            // Command
            delete require.cache[require.resolve(fileToReload)];
            let props = require(fileToReload);
            client.commands.delete(props?.options.commandName);
            client.commands.set(props?.options.commandName, props);
            client.utils.log(0, `Reloaded command ${color.cyan(arg)}`);
            break;
          }
          case 1: {
            // Event
            delete require.cache[require.resolve(fileToReload)];
            client.removeAllListeners(
              fileToReload.split("/")[fileToReload.split("/").length - 1]
            );
            client.on(
              fileToReload.split("/")[fileToReload.split("/").length - 1],
              require(fileToReload).bind(null, client)
            );
            client.utils.log(0, `Reloaded event ${color.cyan(arg)}`);
            break;
          }
          case 2: {
            // Util
            delete require.cache[require.resolve(fileToReload)];
            client.utils = require(fileToReload);
            client.utils.log(0, `Reloaded util ${color.cyan(arg)}`);
            break;
          }
          default: {
            // Other
            delete require.cache[require.resolve(fileToReload)];
            client.utils.log(0, `Reloaded file ${color.cyan(arg)}`);
            break;
          }
        }
        reloadReport.push(
          `${client.emojis.get("success")} Sucesfully reloaded file: **${arg}**`
        );
      } else {
        reloadReport.push(
          `${client.emojis.get(
            "fail"
          )} Failed to reload invalid file: **${arg}**`
        );
      }
    });
    return client.utils.embed(client, reloadReport.join("\n"), message.channel);
  },
  options: {
    commandName: "reload",
    commandDescription: "`[DEV]` Reload application files",
    commandUsage: "reload commands/help",
    extendedDescription:
      "`[DEV]` Reload application files to update with no downtime",
    commandArgs: "[Relavtive File Path]",
    commandAliases: [],
    requiredBotPermissions: [],
    requiredAuthorPermissions: [],
    developerRestricted: true,
  },
};

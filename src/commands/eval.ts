import { Eris, ParsedClient, Axios } from "../typings/export";
export = {
  exec: async (
    client: ParsedClient,
    message: Eris.Message<Eris.TextChannel>,
    messageArgs: Array<string>
  ) => {
    const util = require("util");
    const axios = require("axios");
    let evalResult: Error | string;
    try {
      evalResult = eval(messageArgs.join(" "));
    } catch (error) {
      evalResult = error;
    }
    let parsedResult =
      typeof evalResult === "object" && evalResult?.name
        ? `${evalResult.name}: ${evalResult.message}`
        : util.inspect(evalResult, true, 0);
    if (parsedResult) {
      if (parsedResult.length > 1024) {
        await axios
          .post("https://paste.smc.wtf/documents", parsedResult)
          .then((res: Axios.AxiosResponse) => {
            parsedResult = `https://paste.smc.wtf/` + res.data.key;
          });
      }
      return client.createMessage(message.channel.id, {
        embed: {
          title: "JavaScript Eval",
          fields: [
            {
              name: ":inbox_tray: INPUT:",
              value: `\`\`\`js\n${messageArgs.join(" ")}\`\`\``,
            },
            {
              name: ":outbox_tray: OUTPUT:",
              value: `\`\`\`js\n‏‏‎${
                parsedResult === "" ? "‏‏‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎" : parsedResult
              }\`\`\``,
            },
            {
              name: ":hash: TYPE:",
              value: `\`\`\`fix\n‏‏‎${
                evalResult && evalResult.constructor
                  ? evalResult.constructor.name
                  : typeof evalResult
              }\`\`\``,
            },
          ],
          color: 0x2f3136,
          timestamp: new Date().toISOString(),
        },
      });
    }
  },
  options: {
    commandName: "eval",
    commandDescription: "`[DEV]` Eval JavaScript for debugging",
    commandUsage: "eval conosle.log('ping')",
    extendedDescription:
      "`[DEV]` Use Eval to run JavaScript code for Debugging the application",
    commandArgs: "[JavaScript]",
    commandAliases: [],
    requiredBotPermissions: [],
    requiredAuthorPermissions: [],
    developerRestricted: true,
  },
};

import { Eris, ParsedClient, Axios } from "../typings/export";

export = {
  exec: (
    client: ParsedClient,
    message: Eris.Message<Eris.TextChannel>,
    messageArgs: Array<string>
  ) => {
    const { exec } = require("child_process");
    const fs = require("fs");
    const path = require("path");
    const axios = require("axios");
    let workingDirectory = client.currentExecDirectory;
    if (messageArgs[0] === "cd") {
      let parsedPath = path.resolve(`${workingDirectory}`, `${messageArgs[1]}`);
      if (fs.existsSync(parsedPath))
        return (
          (client.currentExecDirectory = parsedPath),
          client.utils.embed(
            client,
            `${client.currentExecDirectory}`,
            message.channel
          )
        );
      client.utils.embed(
        client,
        `bash: cd: ${parsedPath}: No such file or directory`,
        message.channel
      );
    } else {
      exec(
        messageArgs.join(" "),
        {
          cwd: workingDirectory,
        },
        async (error: Error, stdout: string) => {
          let response: string;
          if (error) response = error.toString();
          else response = stdout;
          if (response.length > 1024) {
            await axios
              .post("https://paste.smc.wtf/documents", response)
              .then((res: Axios.AxiosResponse) => {
                response = `https://paste.smc.wtf/` + res.data.key;
              });
          }
          client.createMessage(message.channel.id, {
            embed: {
              title: "Bash Execute",
              fields: [
                {
                  name: ":inbox_tray: INPUT:",
                  value: `\`\`\`bash\n${messageArgs.join(" ")}\`\`\``,
                },
                {
                  name: ":outbox_tray: OUTPUT:",
                  value: `\`\`\`bash\n‏‏‎${
                    response === "" ? "‏‏‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‎" : response
                  }\`\`\``,
                },
              ],
              color: 0x36393e,
              footer: { text: client.currentExecDirectory },
              timestamp: new Date().toISOString(),
            },
          });
        }
      );
    }
  },
  options: {
    commandName: "exec",
    commandDescription:
      "`[DEV]` Execute commands on the application host for debugging",
    commandUsage: "exec pwd",
    extendedDescription:
      "`[DEV]` Execute bash commands on the application's host server for debugging",
    commandArgs: "[Bash Script]",
    commandAliases: [],
    requiredBotPermissions: [],
    requiredAuthorPermissions: [],
    developerRestricted: true,
  },
};

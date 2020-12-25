import type { ClientCommand, Eris, ParsedClient } from "../typings/export";

export = {
  exec: (
    client: ParsedClient,
    message: Eris.Message<Eris.TextChannel>,
    messageArgs: string[],
    developerAuthor: Boolean
  ) => {
    let reqPerm: string;
    if (client.commands.get(messageArgs[0])) {
      const cmd = client.commands.get(messageArgs[0]);
      if (cmd.options.developerRestricted && !developerAuthor) {
        return client.utils.embed(
          client,
          `You must be a developer to run: \`:help ${messageArgs[0]}\``,
          message.channel
        );
      }
      cmd.options.requiredAuthorPermissions.every((perm: string) => {
        if (!message.member.permissions.has(perm)) {
          return (reqPerm = perm);
        }
      });

      if (reqPerm)
        return client.utils.embed(
          client,
          `You must have permission \`[${reqPerm}]\` to run: \`:help ${messageArgs[0]}\``,
          message.channel
        );

      return client.createMessage(message.channel.id, {
        embed: {
          title: client.username + " - Help",
          description: `**${
            messageArgs[0].charAt(0).toUpperCase() + messageArgs[0].slice(1)
          }**\n  
        **• Description:** ${
          cmd.options.extendedDescription
        }\n  **• Example:** \`${
            client.prefix + cmd.options.commandUsage
          }\`\n**• Arguments:** \`${cmd.options.commandArgs}\`\n`,
          color: 0x2f3136,
          footer: {
            text: `Tip: See all commands by using: ${client.prefix}help`,
          },
        },
      });
    } else {
      let helpData = [];
      client.commands.forEach((cmd: ClientCommand) => {
        cmd.options.requiredAuthorPermissions.every((perm: string) => {
          if (!message.member.permissions.has(perm)) {
            return (reqPerm = perm);
          }
        });
        if (
          !(developerAuthor === false && cmd.options.developerRestricted) &&
          !reqPerm
        ) {
          helpData.push(
            `**${
              cmd.options.commandName.charAt(0).toUpperCase() +
              cmd.options.commandName.slice(1)
            }**\n  **• Description:** ${
              cmd.options.commandDescription
            }\n  **• Example:** \`${cmd.options.commandUsage}\`\n`
          );
        }
      });

      return client.createMessage(message.channel.id, {
        embed: {
          title: client.username + " - Help",
          description: helpData.join("\n"),
          color: 0x2f3136,
          footer: {
            text:
              "Tip: Use a command name for more information, such as: :help ping",
          },
        },
      });
    }
  },
  options: {
    commandName: "help",
    commandDescription: "Get information and usage for commands",
    extendedDescription: "Get information and usage for commands",
    commandArgs: `[CommandName]`,
    commandUsage: "help",
    commandAliases: [],
    requiredBotPermissions: [],
    requiredAuthorPermissions: [],
    developerRestricted: false,
  },
};

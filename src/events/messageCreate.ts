import { ParsedClient, Eris, ClientCommand } from "../typings/export";
module.exports = async (
  client: ParsedClient,
  message: Eris.Message<Eris.TextChannel>
) => {
  try {
    if (message.member && !message.member.bot && message.channel.guild) {
      const developerAuthor: boolean =
        client.developers.indexOf(message.author.id) != -1;
      const prefix = client.prefix;
      if (message.content.startsWith(prefix)) {
        const messageArgs = message.content
          .slice(Object.keys(prefix).length)
          .trim()
          .split(/ +/g);

        const messageCommand: string = messageArgs?.shift()?.toLowerCase();
        const cmd: ClientCommand =
          client.utils.findInMap(
            client.commands,
            (command: ClientCommand) =>
              command.options.commandName === messageCommand
          ) ||
          client.utils.findInMap(client.commands, (command: ClientCommand) =>
            command.options.commandAliases.includes(messageCommand)
          );
        if (!cmd) return;
        if (
          !message.channel.guild.members
            .get(client.user.id)
            .permissions.has("sendMessages")
        )
          return;
        const permission = message.channel.permissionsOf(client.user.id);
        if (!permission.has("sendMessages")) return;
        if (
          !message.channel.guild.members
            .get(client.user.id)
            .permissions.has("embedLinks")
        )
          return client.utils.embed(
            client,
            `I must have the **\`[EMBED_LINKS]\`** permission to run command: \`[${messageCommand.toUpperCase()}]\``,
            message.channel
          );
        if (!permission.has("embedLinks"))
          return client.utils.embed(
            client,
            `I must have the **\`[EMBED_LINKS]\`** permission **in this channel** to run command: \`[${messageCommand.toUpperCase()}]\``,
            message.channel
          );
        if (
          !message.channel.guild.members
            .get(client.user.id)
            .permissions.has("externalEmojis")
        )
          return client.utils.embed(
            client,
            `I must have the **\`[USE_EXTERNAL_EMOJIS]\`** permission to run command: \`[${messageCommand.toUpperCase()}]\``,
            message.channel
          );

        if (!permission.has("externalEmojis"))
          return client.utils.embed(
            client,
            `I must have the **\`[USE_EXTERNAL_EMOJIS]\`** permission **in this channel** to run command: \`[${messageCommand.toUpperCase()}]\``,
            message.channel
          );
        let requiredBotPermission: string;
        let requiredAuthorPermission: string;

        cmd.options.requiredBotPermissions.every((perm: string) => {
          if (
            !message.channel.guild.members
              .get(client.user.id)
              .permissions.has(perm) ||
            !permission.has(perm)
          )
            return (requiredBotPermission = perm);
        });

        if (requiredBotPermission)
          return client.utils.embed(
            client,
            `I must have the **\`[${requiredBotPermission}]\`** permission to run command: \`[${messageCommand.toUpperCase()}]\``,
            message.channel
          );
        if (!(client.developers.indexOf(message.member.id) != -1)) {
          cmd.options.requiredAuthorPermissions.every((perm: string) => {
            if (!message.member.permissions.has(perm))
              return (requiredAuthorPermission = perm);
          });
        }
        if (cmd.options.developerRestricted && !developerAuthor)
          requiredAuthorPermission = "DEVELOPER";
        if (requiredAuthorPermission)
          return client.utils.embed(
            client,
            `You must have the **\`[${requiredAuthorPermission}]\`** permission to run command: \`[${messageCommand.toUpperCase()}]\``,
            message.channel
          );
        try {
          cmd.exec(client, message, messageArgs, developerAuthor);
        } catch (error) {
          client.utils.log(2, error, client),
            client.utils.embed(
              client,
              "⛔ An error occured, and has been reported! Please try again later.",
              message.channel
            );
        }
      }
    }
  } catch (e) {
    client.utils.log(2, e, client),
      client.utils.embed(
        client,
        "⛔ An error occured, and has been reported! Please try again later.",
        message.channel
      );
  }
};

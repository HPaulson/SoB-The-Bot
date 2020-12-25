import type { Eris, ParsedClient } from "../typings/export";

export = {
  exec: (client: ParsedClient, message: Eris.Message<Eris.TextChannel>) => {
    client.utils.embed(
      client,
      `${client.emojis.get("success")} Took **${Math.floor(
        message.channel.guild.shard.latency
      )}ms** to ping ${client.username}!`,
      message.channel
    );
  },
  options: {
    commandName: "ping",
    commandDescription: "Pong!",
    commandUsage: "ping",
    extendedDescription: "Get the bot's shard latency, with a fun message!",
    commandArgs: "[]",
    commandAliases: [],
    requiredBotPermissions: [],
    requiredAuthorPermissions: [],
    developerRestricted: false,
  },
};

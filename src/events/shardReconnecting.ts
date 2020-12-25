import { ParsedClient } from "../typings/export";

module.exports = async (client: ParsedClient, id: number) => {
  try {
    client.utils.log(1, `Shard ${id} reconnecting`);
    client.executeWebhook(
      process.env.STARTUP_ID,
      process.env.STARTUP_WEBHOOK_TOKEN,
      {
        username: client.user.username,
        avatarURL: client.user.avatarURL,
        embeds: [
          {
            footer: { text: new Date().toISOString() },
            timestamp: new Date().toISOString(),
            color: 0x2f3136,
            description: `${client.emojis.get(
              "warn"
            )} Shard **${id}** reconnecting`,
          },
        ],
      }
    );
  } catch (e) {
    client.utils.log(2, e, client);
  }
};

import { ParsedClient } from "../typings/export";
module.exports = async (client: ParsedClient, err: Error, id: number) => {
  try {
    client.utils.log(
      2,
      new Error(`Shard ${id} disconnected${err ? ` with err: ${err}` : ""}`),
      client
    );

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
            color: 0xff0000,
            description: `${client.emojis.get(
              "fail"
            )} Shard **${id}** disconnected with error: \`\`\`js\n${err}\`\`\``,
          },
        ],
      }
    );
  } catch (e) {
    client.utils.log(2, e, client);
  }
};

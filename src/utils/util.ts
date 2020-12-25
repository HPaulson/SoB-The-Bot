import path from "path";
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
import { ParsedClient, Eris } from "../typings/export";
import { request } from "graphql-request";
const parseError = require("stacktracey");
const color = require("colors");
const apiURL = "https://blender-api.mlsdigital.net/graphql";

export = {
  getNextMatchID: async (clubID?: number) => {
    const query = `query ScoresMatchesInRange { 
		  matches(date: "${new Date().getTime()}", club_opta_id: ${clubID || "5513"}) {
		   results {
			 opta_id
		   }
		 }
		 }`;
    return await request(apiURL, query).then(async (res: any) => {
      return res;
    });
  },

  getMatchData: async (matchID: number) => {
    const query = `query MatchSummary { 
		  match(id: ${matchID}) {
			opta_id
			date
			is_final
			 home {
			  match {
				scoring {
				  score
				}
			  }
			  name {
				full
			  }
			 }
			 away {
			  match {
				scoring {
				  score
				}
			  }
			   name {
				 full
			   }
			 }
		 }
		 }`;

    return await request(apiURL, query).then(async (res: any) => {
      return res;
    });
  },

  embed: (client: ParsedClient, text: string, channel: Eris.TextChannel) => {
    client
      .createMessage(channel.id, {
        embed: { color: 0x2f3136, description: text },
      })
      .catch((e) => {});
  },

  log: (type: 0 | 1 | 2, message: string | Error, client?: ParsedClient) => {
    const date = new Date();
    const datePrefix = color.white.bold(`[${date.toUTCString()}]`);
    if (!message) throw new Error("No message suplied for logs");
    switch (type) {
      case 0: {
        console.log(datePrefix, color.green.bold(`[INFO]`), message);
        break;
      }
      case 1: {
        /* @ts-ignore - `message` will always be a string when type 1 is passed */
        let beforeParse = message.split(" ");
        let afterParse = [];
        if (beforeParse[0].includes("[DEPRECATED]"))
          afterParse.push(color.bold.yellow("[DEPRECATED]")),
            beforeParse.shift();
        else afterParse.push(color.bold.yellow("[WARNING]"));
        for (let i = 0; i < beforeParse.length; i++) {
          beforeParse[i].includes("#")
            ? afterParse.push(color.cyan(beforeParse[i]))
            : afterParse.push(beforeParse[i]);
          if (i === beforeParse.length - 1) {
            let prefix = afterParse[0];
            afterParse.shift();
            console.warn(datePrefix, prefix, afterParse.join(" "));
          }
        }
        break;
      }
      case 2: {
        let parsedError: {
          fileName: string;
          line: number;
          column: number;
        } = new parseError(message)[0];

        console.error(
          datePrefix,
          // @ts-ignore - `message` will always be an error object when type 2 is passed
          color.red.bold(`[${message.name}]`),
          // @ts-ignore - `message` will always be an error object when type 2 is passed
          `${message.message} at ${color.red(
            `${parsedError.fileName}:${parsedError.line}:${parsedError.column}`
          )}`
        );

        if (client)
          return client.executeWebhook(
            process.env.ERROR_WEBHOOK_ID,
            process.env.ERROR_WEBHOOK_TOKEN,
            {
              username: client.user.username,
              avatarURL: client.user.avatarURL,
              embeds: [
                {
                  author: { name: "⛔ ERROR" },
                  title: `${parsedError.fileName}:${parsedError.line}`,
                  description: `\`\`\`js\n${message}\`\`\``,
                  color: 0xff0000,
                  timestamp: new Date().toISOString(),
                },
              ],
            }
          );
        break;
      }
    }
  },

  attemptWebhook: (
    client: ParsedClient,
    webhookPayload: {
      content?: string;
      embeds?: Array<Eris.EmbedOptions>;
      username?: string;
      avatarURL?: string;
    },
    channel: Eris.TextChannel
  ) => {
    if (!channel || !client) return;
    if (
      channel.guild.members
        .get(client.user.id)
        .permissions.has("manageWebhooks")
    ) {
      let messageWebhook: Eris.Webhook;
      channel
        .getWebhooks()
        .then(async (channelWebhooks: Array<Eris.Webhook>) => {
          if (!channelWebhooks[0]) {
            await channel
              .createWebhook(
                {
                  name: webhookPayload?.username || client.user.username,
                  avatar: webhookPayload?.avatarURL || client.user.avatarURL,
                },
                "I logging webhook"
              )
              .then((newWebhook: Eris.Webhook) => {
                messageWebhook;
              });
          } else messageWebhook = channelWebhooks[0];
          client.executeWebhook(messageWebhook.id, messageWebhook.token, {
            username: webhookPayload?.username || client.user.username,
            avatarURL: webhookPayload?.avatarURL || client.user.avatarURL,
            content: webhookPayload.content || "",
            embeds: webhookPayload?.embeds || [],
          });
        })
        .catch((err: any) => {
          client.utils.log(2, err, client);
        });
    } else
      client.createMessage(channel.id, {
        content: webhookPayload?.content || "",
        embed: webhookPayload.embeds[0] || null,
      });
  },

  requireUncached: (module: string) => {
    delete require.cache[require.resolve(module)];
    return require(module);
  },

  findInMap: (map: Map<any, any>, func: (i: any) => boolean) => {
    for (const item of map.values()) {
      if (func(item)) {
        return item;
      }
    }
    return null;
  },
};

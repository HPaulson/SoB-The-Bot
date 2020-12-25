import { UserDoc, Eris, ParsedClient } from "../typings/export";

module.exports = {
  exec: (
    client: ParsedClient,
    message: Eris.Message<Eris.TextChannel>,
    messageArgs: string[]
  ) => {
    const database = require("../database/main.database");

    switch (messageArgs[0]) {
      case "add": {
        modifyPoints(0);
        break;
      }
      case "remove": {
        modifyPoints(1);
        break;
      }

      default: {
        return client.utils.embed(
          client,
          "You must specifcy whether to `add` or `remove` points!",
          message.channel
        );
        break;
      }
    }
    function modifyPoints(type: 0 | 1) {
      if (message.mentions.length < 1)
        return client.utils.embed(
          client,
          `You must specifcy a user to ${
            type === 0 ? "add" : "remove"
          } points ${type === 0 ? "to" : "from"}!`,
          message.channel
        );
      else {
        if (!parseInt(messageArgs[2]))
          return client.utils.embed(
            client,
            `You must specify an ammount of points to ${
              type === 0 ? "add" : "remove"
            }!`,
            message.channel
          );
        else {
          database.User.findById(
            {
              _id: message.mentions[0].id,
            },
            (err: Error, user: UserDoc) => {
              if (err) {
                client.utils.log(2, err, client);
              }
              if (!user) {
                user = new database.User(
                  database.UserTemplate(message.mentions[0].id)
                );
              }
              if (type) user.xp = user.xp - parseInt(messageArgs[2]);
              else user.xp = user.xp + parseInt(messageArgs[2]);
              user.save().catch((err) => {
                client.utils.log(2, err, client);
                return client.utils.embed(
                  client,
                  "⛔ An error occured, and has been reported! Please try again later.",
                  message.channel
                );
              });
              return client.utils.embed(
                client,
                `Sucesfully ${type === 0 ? "added" : "removed"} ${
                  messageArgs[2]
                } points ${type === 0 ? "add" : "remove"} points ${
                  type === 0 ? "to" : "from"
                } ${message.mentions[0].username}!`,
                message.channel
              );
            }
          );
        }
      }
    }
  },
  options: {
    commandName: "points",
    commandDescription: "`[ADMIN]` Add or Remove points from a user",
    commandUsage: "?points add @User 10",
    extendedDescription:
      "`[ADMIN]` Add or Remove points from a user to fix any mistakes by the bot",
    commandArgs: "[add/remove] [@user] [ammount]",
    commandaliases: [],
    requiredBotPermissions: [],
    requiredAuthorPermissions: ["administrator"],
    developerRestricted: false,
  },
};

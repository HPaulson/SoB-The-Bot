import { match } from "assert";
import database from "../database/database";
import { Match, Eris, ParsedClient, UserDoc } from "../typings/export";
module.exports = {
  exec: (
    client: ParsedClient,
    message: Eris.Message<Eris.TextChannel>,
    messageArgs: string[]
  ) => {
    database.User.findById(
      {
        _id: message.author.id,
      },
      (err: Error, user: UserDoc) => {
        if (err) {
          console.log("here");
          client.utils.log(2, err, client);
        }
        if (!user) {
          user = new database.User(database.UserTemplate(message.author.id));
        }
        const scoresArray: string[] = messageArgs[0]?.split("-") || [];
        if (
          (!parseInt(scoresArray[0], 10) &&
            parseInt(scoresArray[0], 10) != 0) ||
          (!parseInt(scoresArray[1], 10) && parseInt(scoresArray[1], 10) != 0)
        ) {
          return client.utils.embed(
            client,
            "You must provide the correct format: `1-1 Union`, with the Union's score first!",
            message.channel
          );
        } else {
          database.Match.find({}).then((matches: Match[], error: Error) => {
            if (error)
              return (
                client.utils.log(2, err, client),
                client.utils.embed(
                  client,
                  ":no_entry: An error occured, and has been reported! Please try again later.",
                  message.channel
                )
              );
            else {
              if (
                matches[matches.length - 1]?.starts ||
                0 <= new Date().getTime()
              ) {
                return client.utils.embed(
                  client,
                  "There's no game you may predict for! Please wait until it's closer to the next match.",
                  message.channel
                );
              }
              let winnerInt: string | 0 | 1 | 2 = messageArgs[1];
              if (parseInt(scoresArray[0], 10) === parseInt(scoresArray[1], 10))
                winnerInt = 2;
              else if (
                matches[matches.length - 1].home
                  ?.toLowerCase()
                  .includes(winnerInt.toLowerCase())
              )
                winnerInt = 0;
              else if (
                matches[matches.length - 1].away
                  ?.toLowerCase()
                  .includes(winnerInt.toLowerCase())
              )
                winnerInt = 1;
              else
                return client.utils.embed(
                  client,
                  `You must chose a valid team to win after the score, such as \`${
                    matches[matches.length - 1].home
                  }\` or \`${matches[matches.length - 1].away}\``,
                  message.channel
                );
              let usersNextGamePrediction = user.predictions.filter(
                (prediction: {
                  _id: number;
                  home: number;
                  away: number;
                  winner: 0 | 1 | 2;
                }) => prediction._id === matches[matches.length - 1]._id
              );

              if (usersNextGamePrediction) {
                user.predictions.splice(
                  user.predictions.indexOf(usersNextGamePrediction[0]),
                  1
                );
              }

              user.predictions.push({
                _id: matches[matches.length - 1]._id,
                home: matches[matches.length - 1].home
                  .toLowerCase()
                  .includes("union")
                  ? parseInt(scoresArray[0], 10)
                  : parseInt(scoresArray[1], 10),
                away: matches[matches.length - 1].away
                  .toLowerCase()
                  .includes("union")
                  ? parseInt(scoresArray[0], 10)
                  : parseInt(scoresArray[1], 10),
                winner: winnerInt,
              });

              user.save().catch((err: Error) => {
                client.utils.log(2, err, client);
              });
              message.addReaction("✅");
              client.getDMChannel(message.author.id).then((channel) => {
                client.createMessage(channel.id, {
                  embed: {
                    title: "Game Prediction",
                    color: 0x2f3136,
                    fields: [
                      {
                        name: matches[matches.length - 1].home,
                        value: `**• Goals**: ${
                          matches[matches.length - 1].home
                            .toLowerCase()
                            .includes("union")
                            ? scoresArray[0]
                            : scoresArray[1]
                        } ${winnerInt === 0 ? "\n**• Winner**" : ""}`,
                      },
                      {
                        name: matches[matches.length - 1].away,
                        value: `**• Goals**:  ${
                          matches[matches.length - 1].away
                            .toLowerCase()
                            .includes("union")
                            ? scoresArray[0]
                            : scoresArray[1]
                        } ${winnerInt === 1 ? "\n**• Winner**" : ""}`,
                      },
                    ],
                  },
                });
              });
            }
          });
        }
      }
    );
  },

  options: {
    commandName: "predict",
    commandDescription: "Predict the next Union Game's outcome",
    commandUsage: "?predict 3-1 Union",
    extendedDescription:
      "Predict the outcome of the next Union game - Submit your score and winner prediction, with the union's score first! After the game, you will recive points if you guess correctly! You may change your prediction as many times untill the game begins.",
    commandArgs: "[Union Score]-[Away Score] [Winner]",
    commandaliases: [],
    requiredBotPermissions: [],
    requiredAuthorPermissions: [],
    developerRestricted: false,
  },
};

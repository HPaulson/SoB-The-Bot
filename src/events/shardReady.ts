import { Match, MatchData, ParsedClient, UserDoc } from "../typings/export";
import * as cron from "node-cron";
import database from "../database/database";
import { User } from "eris";
module.exports = async (client: ParsedClient, id: number) => {
  try {
    client.executeWebhook(
      process.env.STARTUP_WEBHOOK_ID,
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
              "success"
            )} Shard **${id}** is ready!`,
          },
        ],
      }
    );
    client.utils.log(0, `Shard ${id} is ready`);

    client.editStatus("dnd", {
      name: `In the River | ?help`,
      type: 1,
    });
    syncData();

    cron.schedule("0 7 * * *", syncData);

    async function syncData() {
      await client.utils
        .getNextMatchID()
        .then((res: any) => {
          if (!res?.matches?.results[res.matches.results.length - 1]) return;
          client.utils
            .getMatchData(
              res?.matches?.results[res.matches.results.length - 1]?.opta_id
            )
            .then((data: MatchData) => {
              console.log(data);
              database.Match.find({}).then(async (matches: Match[], error) => {
                let filteredMatches = matches.filter(
                  (match: Match) => match._id === data.match.opta_id
                );
                let match = new database.Match(
                  database.MatchTemplate(
                    res.matches.results[res.matches.results.length - 1].opta_id
                  )
                );
                if (filteredMatches.length < 1) {
                  match.home = data.match.home.name.full;
                  match.away = data.match.away.name.full;
                  match.starts = data.match.date;
                  console.log("Loaded next match:", match._id);
                } else if (
                  filteredMatches[0].home != data.match.home.name.full
                ) {
                  match.home = data.match.home.name.full;
                } else if (
                  filteredMatches[0].away != data.match.away.name.full
                ) {
                  filteredMatches[0].away != data.match.away.name.full;
                }
                match.save();
                matches.forEach((match: Match) => {
                  if (
                    match.starts <= new Date().getTime() &&
                    match.cauculated === false
                  ) {
                    client.utils
                      .getMatchData(match._id)
                      .then((matchData: MatchData) => {
                        if (matchData.match.is_final) {
                          let homeScore =
                            matchData.match.home.match.scoring.score;
                          let awayScore =
                            matchData.match.away.match.scoring.score;
                          let matchWinner: 0 | 1 | 2 =
                            homeScore > awayScore
                              ? 0
                              : awayScore > homeScore
                              ? 1
                              : 2;
                          database.User.find({}).then(
                            async (users: UserDoc[], error) => {
                              users.forEach((user) => {
                                let pointsToAdd = 0;
                                let userPrediction = user.predictions.filter(
                                  (prediction) => prediction._id === match._id
                                )[0];
                                if (userPrediction) {
                                  if (userPrediction.winner === matchWinner) {
                                    if (
                                      userPrediction.home === homeScore &&
                                      userPrediction.away === awayScore
                                    ) {
                                      pointsToAdd = 3;
                                    } else {
                                      pointsToAdd = 1;
                                    }
                                  }
                                  user.xp = user.xp + pointsToAdd;
                                  user.save().catch((error) => {
                                    client.utils.log(2, error, client);
                                  });
                                }
                              });
                              match.cauculated = true;
                              match.final.away = awayScore;
                              match.final.home = homeScore;
                              match.final.winner = matchWinner;
                              match.save().catch((error) => {
                                client.utils.log(2, error, client);
                              });
                            }
                          );
                        }
                      });
                  }
                });
              });
            });
        })
        .catch((e: Error) => console.error(e));
    }
  } catch (e) {
    client.utils.log(2, e, client);
  }
};

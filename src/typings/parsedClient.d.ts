import { ClientCommand, Eris, MatchData } from "./export";
export class ParsedClient extends Eris.Client {
  commands: Map<string, ClientCommand>;
  version?: number;
  username?: string;
  developers?: string[];
  prefix?: string;
  emojis: Map<String, String>;
  currentExecDirectory: string;
  utils: {
    getNextMatchID: (clubID?: number) => Promise<number>;
    getMatchData: (matchID: number) => Promise<MatchData>;
    attemptWebhook: (
      client: ParsedClient,
      webhookPayload: {
        content?: string;
        embeds?: Array<Eris.EmbedOptions>;
        username?: string;
        avatarURL?: string;
      },
      channel: Eris.TextChannel | Eris.AnyChannel
    ) => void;
    log: (
      status: 0 | 1 | 2,
      message: Error | string,
      client?: ParsedClient
    ) => void;
    embed: (
      client: ParsedClient,
      msg: string,
      channel: Eris.TextChannel
    ) => void;
    findInMap(map: Map<any, any>, func: (i: any) => boolean): any | null;
  };
}

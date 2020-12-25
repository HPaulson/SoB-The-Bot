import { Eris } from "./export";
export interface ClientCommand {
  exec: (
    client: Eris.Client,
    message: Eris.Message,
    messageArgs: Array<string>,
    developerAuthor: boolean
  ) => void;
  options: {
    commandName: string;
    commandDescription: string;
    commandUsage: string;
    extendedDescription: string;
    commandArgs: string;
    commandAliases: Array<string>;
    requiredBotPermissions: Array<string>;
    requiredAuthorPermissions: Array<string>;
    developerRestricted: boolean;
  };
}

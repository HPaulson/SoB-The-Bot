import { Mongoose } from "./export";

interface UserDoc extends Mongoose.Document {
  _id: string;
  xp: number;
  predictions: [
    {
      _id: number;
      home: number;
      away: number;
      winner: number;
    }
  ];
}
interface Match extends Mongoose.Document {
  _id: number;
  home: string;
  away: string;
  starts: number;
  final: { home: number; away: number; winner: number };
  cauculated: boolean;
}

export interface Database {
  User: Mongoose.Model<UserDoc>;
  UserTemplate: (id: string) => UserDoc;
  MatchTemplate: (id: number) => Match;
}

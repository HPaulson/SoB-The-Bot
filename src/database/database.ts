export = {
  User: require("mongoose").model(
    "users",
    require("mongoose").Schema({
      _id: String,
      xp: Number,
      predictions: [
        {
          _id: Number,
          home: Number,
          away: Number,
          winner: Number,
        },
      ],
    })
  ),

  Match: require("mongoose").model(
    "match",
    require("mongoose").Schema({
      _id: Number,
      home: String,
      away: String,
      starts: Number,
      final: { home: Number, away: Number, winner: Number },
      cauculated: Boolean,
    })
  ),

  MatchTemplate: (id: number) => {
    return {
      _id: id,
      home: "",
      away: "",
      starts: null,
      final: { home: null, away: null, winner: null },
      cauculated: false,
    };
  },

  UserTemplate: (id: string) => {
    return {
      _id: id,
      xp: 0,
      predictions: [],
    };
  },
};

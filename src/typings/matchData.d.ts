export interface MatchData {
  match: {
    is_final: Boolean;
    opta_id: number;
    date: number;
    home: { match: { scoring: { score: number } }; name: { full: string } };
    away: { match: { scoring: { score: number } }; name: { full: string } };
  };
}

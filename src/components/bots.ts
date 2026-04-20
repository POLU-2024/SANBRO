export type BotInfo = {
  name: string;
  elo: number;
  tier: 'Beginner' | 'Intermediate' | 'Advanced' | 'Elite';
  source: 'Stockfish' | 'Lozza' | 'Chess.com-style' | 'Lichess-style';
};

export const BOTS: BotInfo[] = [
  { name: 'Pawnling', elo: 50, tier: 'Beginner', source: 'Chess.com-style' },
  { name: 'Orbit Kid', elo: 250, tier: 'Beginner', source: 'Lichess-style' },
  { name: 'Nova Scout', elo: 700, tier: 'Intermediate', source: 'Stockfish' },
  { name: 'Galaxy Mind', elo: 1400, tier: 'Intermediate', source: 'Lozza' },
  { name: 'Nebula Coach', elo: 2000, tier: 'Advanced', source: 'Stockfish' },
  { name: 'Titan Core', elo: 2800, tier: 'Advanced', source: 'Lozza' },
  { name: 'Polu', elo: 3600, tier: 'Elite', source: 'Stockfish' },
  { name: 'Neel', elo: 4000, tier: 'Elite', source: 'Stockfish' },
];

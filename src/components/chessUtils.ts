import { Chess, Move } from 'chess.js';

export const moveBadge = (move: Move): string => {
  if (move.san.includes('#')) return '⏩ Forced mate';
  if (move.flags.includes('e')) return '📖 Book move';
  if (move.san.includes('+')) return '➡️ Forced Move';

  const capture = move.flags.includes('c') || move.flags.includes('e');
  if (capture && move.promotion) return '!! Brilliant move';
  if (capture) return '✅ Good move';
  if (move.san.includes('O-O')) return '👍 Excellent move';
  return '⭐ Best move';
};

export const openingFromHistory = (history: string[]): string => {
  const pgn = history.join(' ');
  if (pgn.startsWith('e4 e5 Nf3 Nc6 Bb5')) return 'Ruy Lopez Opening';
  if (pgn.startsWith('d4 d5 c4')) return 'Queen\'s Gambit';
  if (pgn.startsWith('e4 c5')) return 'Sicilian Defense';
  if (pgn.startsWith('e4 e5 Nf3 Nf6')) return 'Petrov Defense';
  return 'General Opening / Trap Scan Active';
};

export const evaluateMaterial = (chess: Chess): number => {
  const values: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  const board = chess.board();
  let white = 0;
  let black = 0;

  for (const row of board) {
    for (const piece of row) {
      if (!piece) continue;
      if (piece.color === 'w') white += values[piece.type];
      else black += values[piece.type];
    }
  }

  const total = white + black;
  if (!total) return 50;
  return Math.max(0, Math.min(100, Math.round((white / total) * 100)));
};

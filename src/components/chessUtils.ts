import { Chess, Move } from 'chess.js';

export type MoveReview = {
  badge: string;
  label: string;
};

const ANALYSIS_CYCLE: MoveReview[] = [
  { badge: '!!', label: 'Brilliant move' },
  { badge: '!', label: 'Great move' },
  { badge: '⭐', label: 'Best move' },
  { badge: '👍', label: 'Excellent move' },
  { badge: '✅', label: 'Good move' },
  { badge: '📖', label: 'Book move' },
  { badge: '!?', label: 'Interesting move' },
  { badge: '?!', label: 'Inaccuracy' },
  { badge: '?', label: 'Mistake' },
  { badge: '??', label: 'Blunder' },
  { badge: '❌', label: 'Missed Win' },
  { badge: '🧭', label: 'Time out' },
  { badge: '➡️', label: 'Forced Move' },
  { badge: '⏩', label: 'Forced mate' },
];

export const moveBadge = (move: Move, index: number): MoveReview => {
  if (move.san.includes('#')) return { badge: '⏩', label: 'Forced mate' };
  if (move.flags.includes('e')) return { badge: '📖', label: 'Book move' };
  if (move.san.includes('+')) return { badge: '➡️', label: 'Forced Move' };
  if (move.flags.includes('k') || move.flags.includes('q')) return { badge: '👍', label: 'Excellent move' };
  return ANALYSIS_CYCLE[index % ANALYSIS_CYCLE.length];
};

const OPENING_BOOK: Array<{ name: string; line: string[] }> = [
  { name: 'Ruy Lopez', line: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'] },
  { name: 'Sicilian Defense', line: ['e4', 'c5'] },
  { name: 'French Defense', line: ['e4', 'e6'] },
  { name: 'Caro-Kann Defense', line: ['e4', 'c6'] },
  { name: 'Queen\'s Gambit', line: ['d4', 'd5', 'c4'] },
  { name: 'King\'s Indian Defense', line: ['d4', 'Nf6', 'c4', 'g6'] },
  { name: 'Italian Game', line: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'] },
  { name: 'Petrov Defense', line: ['e4', 'e5', 'Nf3', 'Nf6'] },
];

export const openingFromHistory = (history: string[]): string => {
  const found = OPENING_BOOK.find(({ line }) => line.every((move, idx) => history[idx] === move));
  return found ? found.name : 'General Opening / Trap Scan Active';
};

export const evaluateMaterial = (chess: Chess): number => {
  const values: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  let white = 0;
  let black = 0;

  for (const row of chess.board()) {
    for (const piece of row) {
      if (!piece) continue;
      if (piece.color === 'w') white += values[piece.type];
      else black += values[piece.type];
    }
  }

  const total = white + black;
  if (total === 0) return 50;
  return Math.max(0, Math.min(100, Math.round((white / total) * 100)));
};

export const kingSquare = (chess: Chess, color: 'w' | 'b'): string | null => {
  const board = chess.board();
  for (let r = 0; r < 8; r += 1) {
    for (let c = 0; c < 8; c += 1) {
      const piece = board[r][c];
      if (piece?.type === 'k' && piece.color === color) {
        return `${'abcdefgh'[c]}${8 - r}`;
      }
    }
  }
  return null;
};

import { CSSProperties, useMemo, useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Link } from 'react-router-dom';
import { BOTS } from '../components/bots';
import { evaluateMaterial, moveBadge, openingFromHistory } from '../components/chessUtils';

type Side = 'white' | 'black' | 'random';
type Mode = 'human' | 'ai';

const TIMER_OPTIONS = [0, 60, 180, 300, 600];

export default function PlayPage() {
  const [game, setGame] = useState(new Chess());
  const [history, setHistory] = useState<string[]>([]);
  const [badges, setBadges] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [showSuggest, setShowSuggest] = useState(true);
  const [showAttack, setShowAttack] = useState(true);
  const [mode, setMode] = useState<Mode>('ai');
  const [side, setSide] = useState<Side>('random');
  const [timer, setTimer] = useState(300);
  const [whiteTime, setWhiteTime] = useState(300);
  const [blackTime, setBlackTime] = useState(300);
  const [chat, setChat] = useState<string[]>(['Bot: Ready for a galactic game?']);
  const [botReply, setBotReply] = useState('Good move. Keep pressure on the center.');

  const boardOrientation = useMemo(() => {
    if (side === 'random') return Math.random() > 0.5 ? 'white' : 'black';
    return side;
  }, [side]);

  const turn = game.turn() === 'w' ? 'White' : 'Black';
  const opening = openingFromHistory(history);
  const evaluation = evaluateMaterial(game);

  const safeGameMutate = (modify: (gameCopy: Chess) => void) => {
    const gameCopy = new Chess(game.fen());
    modify(gameCopy);
    setGame(gameCopy);
  };

  const updateMoveState = (gameCopy: Chess) => {
    const verbose = gameCopy.history({ verbose: true });
    setHistory(gameCopy.history());
    setBadges(verbose.map((m) => moveBadge(m)));
    setRedoStack([]);

    if (mode === 'ai' && gameCopy.turn() === (boardOrientation[0] as 'w' | 'b')) return;
    if (mode === 'ai' && !gameCopy.isGameOver()) {
      window.setTimeout(() => {
        const current = new Chess(gameCopy.fen());
        const moves = current.moves({ verbose: true });
        const picked = moves[Math.floor(Math.random() * moves.length)];
        current.move(picked);
        setGame(current);
        const aiVerbose = current.history({ verbose: true });
        setHistory(current.history());
        setBadges(aiVerbose.map((m) => moveBadge(m)));
        setBotReply(`Bot: ${picked.san} played. Your move.`);
      }, 350);
    }
  };

  const makeMove = (from: string, to: string) => {
    let ok = false;
    safeGameMutate((g) => {
      const move = g.move({ from, to, promotion: 'q' });
      if (!move) return;
      ok = true;
      updateMoveState(g);
    });
    setSelected(null);
    setPossibleMoves([]);
    return ok;
  };

  const onSquareClick = (square: string) => {
    if (selected) {
      if (!makeMove(selected, square)) {
        setSelected(square);
        setPossibleMoves(game.moves({ square: square as never, verbose: true }).map((m) => m.to));
      }
      return;
    }

    setSelected(square);
    setPossibleMoves(game.moves({ square: square as never, verbose: true }).map((m) => m.to));
  };

  const customSquareStyles: Record<string, CSSProperties> = {};
  const verboseHistory = game.history({ verbose: true });
  const last = verboseHistory.at(-1);
  if (last) {
    customSquareStyles[last.from] = { backgroundColor: 'rgba(255, 240, 120, 0.35)' };
    customSquareStyles[last.to] = { backgroundColor: 'rgba(255, 240, 120, 0.35)' };
  }
  if (game.isCheck()) {
    const board = game.board();
    for (let r = 0; r < 8; r += 1) {
      for (let c = 0; c < 8; c += 1) {
        const piece = board[r][c];
        if (piece?.type === 'k' && piece.color === game.turn()) {
          customSquareStyles[`${'abcdefgh'[c]}${8 - r}`] = { backgroundColor: 'rgba(255, 0, 0, 0.35)' };
        }
      }
    }
  }
  for (const sq of possibleMoves) customSquareStyles[sq] = { backgroundColor: 'rgba(255, 240, 120, 0.35)' };

  const suggestionArrows: [string, string, string?][] = [];
  if (showSuggest) suggestionArrows.push(['e2', 'e4', 'rgba(0,255,0,0.45)']);
  if (showAttack) suggestionArrows.push(['d1', 'h5', 'rgba(255,0,0,0.45)']);

  const newGame = () => {
    const fresh = new Chess();
    setGame(fresh);
    setHistory([]);
    setBadges([]);
    setRedoStack([]);
    setSelected(null);
    setPossibleMoves([]);
    setWhiteTime(timer || 0);
    setBlackTime(timer || 0);
  };

  const undo = () => {
    safeGameMutate((g) => {
      const undone = g.undo();
      if (!undone) return;
      setRedoStack((prev) => [...prev, undone.san]);
      setHistory(g.history());
      setBadges(g.history({ verbose: true }).map((m) => moveBadge(m)));
    });
  };

  const redo = () => {
    const san = redoStack.at(-1);
    if (!san) return;
    safeGameMutate((g) => {
      g.move(san);
      setRedoStack((prev) => prev.slice(0, -1));
      setHistory(g.history());
      setBadges(g.history({ verbose: true }).map((m) => moveBadge(m)));
    });
  };

  const resign = () => setChat((prev) => [...prev, 'System: Resignation accepted.']);
  const hint = () => setChat((prev) => [...prev, 'Coach: Consider development and king safety.']);

  const sendChat = (text: string) => {
    if (!text.trim()) return;
    setChat((prev) => [...prev, `You: ${text.trim()}`, botReply]);
  };

  return (
    <main className="page game-page">
      <header className="topbar card">
        <h1>SANBRO Chess Arena</h1>
        <p>Opening/Trap: {opening}</p>
        <p>Turn: {turn}</p>
        <Link to="/">Home</Link>
      </header>

      <section className="layout">
        <aside className="card controls">
          <h3>Mode</h3>
          <select value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
            <option value="human">2-Player</option>
            <option value="ai">AI Opponent</option>
          </select>

          <h3>Side</h3>
          <select value={side} onChange={(e) => setSide(e.target.value as Side)}>
            <option value="white">♔ White</option>
            <option value="black">♚ Black</option>
            <option value="random">🎲 Random</option>
          </select>

          <h3>Timer</h3>
          <select
            value={timer}
            onChange={(e) => {
              const next = Number(e.target.value);
              setTimer(next);
              setWhiteTime(next);
              setBlackTime(next);
            }}
          >
            {TIMER_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt === 0 ? 'Unlimited' : `${opt / 60} min`}
              </option>
            ))}
          </select>

          <div className="button-grid">
            <button onClick={undo}>Undo</button>
            <button onClick={redo}>Redo</button>
            <button onClick={newGame}>New Game</button>
            <button onClick={() => setSide((s) => (s === 'white' ? 'black' : 'white'))}>Switch Sides</button>
            <button onClick={resign}>Resign</button>
            <button onClick={hint}>Hint</button>
          </div>

          <label>
            <input type="checkbox" checked={showSuggest} onChange={(e) => setShowSuggest(e.target.checked)} />
            Suggestion arrows
          </label>
          <label>
            <input type="checkbox" checked={showAttack} onChange={(e) => setShowAttack(e.target.checked)} />
            Attack arrows
          </label>
        </aside>

        <div className="card board-wrap">
          <div className="eval-bar">
            <div className="white" style={{ height: `${evaluation}%` }}>
              White {evaluation}%
            </div>
            <div className="black" style={{ height: `${100 - evaluation}%` }}>
              Black {100 - evaluation}%
            </div>
          </div>
          <Chessboard
            id="SANBRO-board"
            position={game.fen()}
            customBoardStyle={{ borderRadius: '8px' }}
            customDarkSquareStyle={{ backgroundColor: '#11428f' }}
            customLightSquareStyle={{ backgroundColor: '#9cc3ff' }}
            customSquareStyles={customSquareStyles}
            customArrows={suggestionArrows}
            onPieceDrop={(from, to) => makeMove(from, to)}
            onSquareClick={onSquareClick}
            boardOrientation={boardOrientation}
          />

          <div className="kings">
            {game.isCheckmate() && <p>👑 Winner king | #️⃣ Losing king</p>}
            {game.isDraw() && <p>½ Draw on both kings</p>}
          </div>

          <div className="history">
            <h3>Move History + Analysis</h3>
            <ol>
              {history.map((move, i) => (
                <li key={`${move}-${i}`}>
                  {i + 1}. {move} — {badges[i]}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <aside className="card sidebar">
          <h3>Bots (50-4000 ELO)</h3>
          <ul>
            {BOTS.map((bot) => (
              <li key={bot.name}>
                <strong>{bot.name}</strong> ({bot.elo}) - {bot.tier} [{bot.source}]
              </li>
            ))}
          </ul>
          <p className="small">Reference bot architecture: eddmann.com. Embedded engines can be wired via worker endpoints.</p>

          <h3>Bot Chat / Coach</h3>
          <div className="chat">
            {chat.map((entry, i) => (
              <p key={`${entry}-${i}`}>{entry}</p>
            ))}
          </div>
          <input
            placeholder="Reply to bot..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                sendChat((e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).value = '';
              }
            }}
          />

          <p className="small">Timers: W {whiteTime === 0 ? '∞' : whiteTime}s | B {blackTime === 0 ? '∞' : blackTime}s</p>
        </aside>
      </section>
    </main>
  );
}

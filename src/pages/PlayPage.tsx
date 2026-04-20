import { CSSProperties, useEffect, useMemo, useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Link } from 'react-router-dom';
import { BOTS } from '../components/bots';
import { evaluateMaterial, kingSquare, MoveReview, moveBadge, openingFromHistory } from '../components/chessUtils';

type Side = 'white' | 'black' | 'random';
type Mode = 'human' | 'ai';

type MoveRecord = { move: string; review: MoveReview };

type GameSnapshot = {
  fen: string;
  moveRecords: MoveRecord[];
};

const TIMER_OPTIONS = [0, 60, 180, 300, 600, 900];

const initialSnapshot = (): GameSnapshot => ({ fen: new Chess().fen(), moveRecords: [] });

export default function PlayPage() {
  const [game, setGame] = useState(new Chess());
  const [moveRecords, setMoveRecords] = useState<MoveRecord[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [showSuggest, setShowSuggest] = useState(true);
  const [showAttack, setShowAttack] = useState(true);
  const [mode, setMode] = useState<Mode>('ai');
  const [side, setSide] = useState<Side>('white');
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');
  const [timer, setTimer] = useState(300);
  const [whiteTime, setWhiteTime] = useState(300);
  const [blackTime, setBlackTime] = useState(300);
  const [chat, setChat] = useState<string[]>(['Bot: Ready for a galactic game?']);
  const [message, setMessage] = useState('');
  const [historyStack, setHistoryStack] = useState<GameSnapshot[]>([initialSnapshot()]);
  const [historyPointer, setHistoryPointer] = useState(0);

  const history = useMemo(() => moveRecords.map((item) => item.move), [moveRecords]);
  const turn = game.turn() === 'w' ? 'White' : 'Black';
  const opening = openingFromHistory(history);
  const evaluation = evaluateMaterial(game);

  useEffect(() => {
    if (side === 'random') {
      setBoardOrientation(Math.random() > 0.5 ? 'white' : 'black');
      return;
    }
    setBoardOrientation(side);
  }, [side]);

  useEffect(() => {
    if (timer === 0 || game.isGameOver()) return;
    const interval = window.setInterval(() => {
      if (game.turn() === 'w') {
        setWhiteTime((time) => Math.max(0, time - 1));
      } else {
        setBlackTime((time) => Math.max(0, time - 1));
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [game, timer]);

  useEffect(() => {
    if (whiteTime === 0 && timer > 0 && !game.isGameOver()) {
      setChat((prev) => [...prev, 'System: White flagged on time. 🧭']);
    }
  }, [whiteTime, timer, game]);

  useEffect(() => {
    if (blackTime === 0 && timer > 0 && !game.isGameOver()) {
      setChat((prev) => [...prev, 'System: Black flagged on time. 🧭']);
    }
  }, [blackTime, timer, game]);

  const pushSnapshot = (nextGame: Chess, nextMoves: MoveRecord[]) => {
    const trimmed = historyStack.slice(0, historyPointer + 1);
    setHistoryStack([...trimmed, { fen: nextGame.fen(), moveRecords: nextMoves }]);
    setHistoryPointer(trimmed.length);
  };

  const runBotMove = (currentGame: Chess, currentMoves: MoveRecord[]) => {
    if (mode !== 'ai' || currentGame.isGameOver()) return;

    const userColor = boardOrientation === 'white' ? 'w' : 'b';
    if (currentGame.turn() === userColor) return;

    window.setTimeout(() => {
      const next = new Chess(currentGame.fen());
      const moves = next.moves({ verbose: true });
      if (!moves.length) return;
      const picked = moves[Math.floor(Math.random() * moves.length)];
      next.move(picked);
      const nextMoves = [...currentMoves, { move: picked.san, review: moveBadge(picked, currentMoves.length) }];
      setGame(next);
      setMoveRecords(nextMoves);
      pushSnapshot(next, nextMoves);
      setChat((prev) => [...prev, `Bot: ${picked.san} played. Your move.`]);
    }, 350);
  };

  const makeMove = (from: string, to: string) => {
    const next = new Chess(game.fen());
    const move = next.move({ from, to, promotion: 'q' });
    if (!move) return false;

    const nextMoves = [...moveRecords, { move: move.san, review: moveBadge(move, moveRecords.length) }];
    setGame(next);
    setMoveRecords(nextMoves);
    pushSnapshot(next, nextMoves);
    setSelected(null);
    setPossibleMoves([]);
    runBotMove(next, nextMoves);
    return true;
  };

  const onSquareClick = (square: string) => {
    const piece = game.get(square);
    const turnColor = game.turn();

    if (selected) {
      if (!makeMove(selected, square)) {
        if (piece && piece.color === turnColor) {
          setSelected(square);
          setPossibleMoves(game.moves({ square: square as never, verbose: true }).map((m) => m.to));
        } else {
          setSelected(null);
          setPossibleMoves([]);
        }
      }
      return;
    }

    if (piece && piece.color === turnColor) {
      setSelected(square);
      setPossibleMoves(game.moves({ square: square as never, verbose: true }).map((m) => m.to));
    }
  };

  const customSquareStyles: Record<string, CSSProperties> = {};
  const verboseHistory = game.history({ verbose: true });
  const last = verboseHistory.at(-1);
  if (last) {
    customSquareStyles[last.from] = { backgroundColor: 'rgba(255, 240, 120, 0.35)' };
    customSquareStyles[last.to] = { backgroundColor: 'rgba(255, 240, 120, 0.35)' };
  }

  if (game.isCheck()) {
    const checkedKing = kingSquare(game, game.turn());
    if (checkedKing) customSquareStyles[checkedKing] = { backgroundColor: 'rgba(255, 0, 0, 0.35)' };
  }
  for (const sq of possibleMoves) customSquareStyles[sq] = { backgroundColor: 'rgba(255, 240, 120, 0.35)' };

  const suggestionArrows: [string, string, string?][] = [];
  if (showSuggest && possibleMoves[0]) suggestionArrows.push([selected ?? 'e2', possibleMoves[0], 'rgba(0,255,0,0.45)']);
  if (showAttack) suggestionArrows.push(['d1', 'h5', 'rgba(255,0,0,0.45)']);

  const newGame = () => {
    const fresh = new Chess();
    setGame(fresh);
    setMoveRecords([]);
    setSelected(null);
    setPossibleMoves([]);
    setWhiteTime(timer || 0);
    setBlackTime(timer || 0);
    setHistoryStack([{ fen: fresh.fen(), moveRecords: [] }]);
    setHistoryPointer(0);
  };

  const undo = () => {
    if (historyPointer <= 0) return;
    const nextPointer = historyPointer - 1;
    const snapshot = historyStack[nextPointer];
    setHistoryPointer(nextPointer);
    setGame(new Chess(snapshot.fen));
    setMoveRecords(snapshot.moveRecords);
    setSelected(null);
    setPossibleMoves([]);
  };

  const redo = () => {
    if (historyPointer >= historyStack.length - 1) return;
    const nextPointer = historyPointer + 1;
    const snapshot = historyStack[nextPointer];
    setHistoryPointer(nextPointer);
    setGame(new Chess(snapshot.fen));
    setMoveRecords(snapshot.moveRecords);
    setSelected(null);
    setPossibleMoves([]);
  };

  const resign = () => {
    setChat((prev) => [...prev, 'System: Resignation accepted.']);
  };

  const hint = () => {
    const suggestion = possibleMoves[0] ? `Coach: Candidate move is ${selected}-${possibleMoves[0]}.` : 'Coach: Improve center control and king safety.';
    setChat((prev) => [...prev, suggestion]);
  };

  const sendChat = () => {
    if (!message.trim()) return;
    setChat((prev) => [...prev, `You: ${message.trim()}`, 'Bot: Nice idea — keep calculating forcing lines.']);
    setMessage('');
  };

  const winnerKing = game.isCheckmate() ? kingSquare(game, game.turn() === 'w' ? 'b' : 'w') : null;
  const loserKing = game.isCheckmate() ? kingSquare(game, game.turn()) : null;

  if (winnerKing) customSquareStyles[winnerKing] = { backgroundColor: 'rgba(85, 187, 90, 0.45)' };
  if (loserKing) customSquareStyles[loserKing] = { backgroundColor: 'rgba(229, 57, 53, 0.45)' };

  const drawWhiteKing = game.isDraw() ? kingSquare(game, 'w') : null;
  const drawBlackKing = game.isDraw() ? kingSquare(game, 'b') : null;
  if (drawWhiteKing) customSquareStyles[drawWhiteKing] = { backgroundColor: 'rgba(160, 160, 160, 0.4)' };
  if (drawBlackKing) customSquareStyles[drawBlackKing] = { backgroundColor: 'rgba(160, 160, 160, 0.4)' };

  return (
    <main className="page game-page">
      <header className="topbar card">
        <h1>SANBRO Chess Arena</h1>
        <p>Opening / Trap: {opening}</p>
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
            <button onClick={() => setSide((s) => (s === 'white' ? 'black' : s === 'black' ? 'white' : 'random'))}>Switch Sides</button>
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
          <div className="eval-bar" aria-label="Evaluation Bar">
            <div className="white" style={{ width: `${evaluation}%` }}>
              White {evaluation}%
            </div>
            <div className="black" style={{ width: `${100 - evaluation}%` }}>
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
              {moveRecords.map((entry, i) => (
                <li key={`${entry.move}-${i}`}>
                  {i + 1}. {entry.move} — {entry.review.badge} {entry.review.label}
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

          <h3>Bot Chat / Coach</h3>
          <div className="chat">
            {chat.map((entry, i) => (
              <p key={`${entry}-${i}`}>{entry}</p>
            ))}
          </div>

          <div className="chat-entry">
            <input
              placeholder="Reply to bot..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendChat();
              }}
            />
            <button onClick={sendChat}>Send</button>
          </div>

          <p className="small">Timers: W {whiteTime === 0 ? '∞' : `${whiteTime}s`} | B {blackTime === 0 ? '∞' : `${blackTime}s`}</p>
        </aside>
      </section>
    </main>
  );
}

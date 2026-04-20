import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <main className="page home">
      <section className="hero card">
        <h1>SANBRO Chess</h1>
        <p>
          Welcome to SANBRO Chess — a professional, galactic-blue themed chess experience for learning,
          competing, and improving.
        </p>
        <div className="actions">
          <Link className="btn" to="/play">
            PLAY CHESS
          </Link>
          <Link className="btn btn-secondary" to="/signin">
            SIGN IN
          </Link>
        </div>
      </section>

      <section className="card prose">
        <h2>Chess History</h2>
        <p>
          Chess evolved from ancient Indian chaturanga, spread through Persia and the Islamic world, and reached
          Europe where modern rules formed between the 15th and 19th centuries. Organized tournaments and world
          championships transformed chess into a global sport and a benchmark game for AI.
        </p>
        <h2>Core Rules</h2>
        <ul>
          <li>Checkmate ends the game with a winner.</li>
          <li>Draw can occur by stalemate, repetition, fifty-move rule, or insufficient material.</li>
          <li>Special moves include castling, en passant, and pawn promotion.</li>
          <li>Zugzwang and tactical motifs are supported through legal move generation.</li>
        </ul>
        <h2>Why SANBRO Chess?</h2>
        <p>
          Play with humans or bots, track move quality, get hints and arrows, run timers, and review rich move
          history with evaluation insights.
        </p>
      </section>
    </main>
  );
}

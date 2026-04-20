import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SignInPage() {
  const navigate = useNavigate();
  const [name, setName] = useState(localStorage.getItem('sanbro-user') ?? '');

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    localStorage.setItem('sanbro-user', name.trim());
    navigate('/play');
  };

  return (
    <main className="page auth">
      <form className="card auth-card" onSubmit={onSubmit}>
        <h1>SANBRO Chess Sign In / Sign Up</h1>
        <label htmlFor="name">Player Name</label>
        <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" />
        <button className="btn" type="submit">
          Continue
        </button>
      </form>
    </main>
  );
}

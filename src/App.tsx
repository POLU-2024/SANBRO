import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PlayPage from './pages/PlayPage';
import SignInPage from './pages/SignInPage';

export default function App() {
  const isSignedIn = Boolean(localStorage.getItem('sanbro-user'));

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/play" element={isSignedIn ? <PlayPage /> : <Navigate to="/signin" replace />} />
    </Routes>
  );
}

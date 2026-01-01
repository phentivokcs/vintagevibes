import { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

type LoginProps = {
  onClose: () => void;
  onLoginSuccess: () => void;
};

export function Login({ onClose, onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError('Érvénytelen e-mail vagy jelszó');
      return;
    }

    if (data.user) {
      onLoginSuccess();
      onClose();
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.user) {
      setSuccessMessage('Fiók létrehozva! Most már bejelentkezhetsz.');
      setIsSignUp(false);
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="mx-auto max-w-md w-full">
        <div className="card2 p-6 space-y-5">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
              {isSignUp ? 'Regisztráció' : 'Bejelentkezés'}
            </h2>
            <p className="muted text-sm">
              {isSignUp ? 'Hozd létre fiókodat a folytatáshoz.' : 'Rendelések, mentett termékek, gyorsabb vásárlás.'}
            </p>
          </div>

          <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
            {error && (
              <div className="card border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="card border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700">
                {successMessage}
              </div>
            )}

            <label className="space-y-1">
              <span className="muted text-xs uppercase tracking-wider">E-mail</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="te@email.com"
              />
            </label>

            <label className="space-y-1">
              <span className="muted text-xs uppercase tracking-wider">Jelszó</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 disabled:opacity-50"
            >
              {loading
                ? (isSignUp ? 'Létrehozás...' : 'Bejelentkezés...')
                : (isSignUp ? 'Regisztráció' : 'Folytatás')
              }
            </button>

            <div className="flex items-center justify-between text-xs">
              <a className="text-zinc-700 hover:text-zinc-900 underline underline-offset-4" href="/forgot">Elfelejtett?</a>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setSuccessMessage('');
                }}
                className="text-zinc-700 hover:text-zinc-900 underline underline-offset-4"
              >
                {isSignUp ? 'Bejelentkezés' : 'Fiók létrehozása'}
              </button>
            </div>
          </form>

          <button
            onClick={onClose}
            className="btn w-full"
          >
            Bezárás
          </button>
        </div>
      </div>
    </div>
  );
}

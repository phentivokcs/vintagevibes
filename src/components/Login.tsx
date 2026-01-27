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
  const [isForgotPassword, setIsForgotPassword] = useState(false);
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

      try {
        await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-welcome-email`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: email,
            }),
          }
        );
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (resetError) {
      setError('Hiba történt. Próbáld újra.');
      return;
    }

    setSuccessMessage('Elküldtük a jelszó visszaállító linket az email címedre!');
    setTimeout(() => {
      setIsForgotPassword(false);
      setSuccessMessage('');
    }, 3000);
  };

  return (
    <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="mx-auto max-w-md w-full">
        <div className="card2 p-6 space-y-5">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
              {isForgotPassword ? 'Jelszó visszaállítás' : isSignUp ? 'Regisztráció' : 'Bejelentkezés'}
            </h2>
            <p className="muted text-sm">
              {isForgotPassword
                ? 'Add meg az email címed és küldünk egy jelszó visszaállító linket.'
                : isSignUp ? 'Hozd létre fiókodat a folytatáshoz.' : 'Rendelések, mentett termékek, gyorsabb vásárlás.'
              }
            </p>
          </div>

          <form onSubmit={isForgotPassword ? handleForgotPassword : isSignUp ? handleSignUp : handleLogin} className="space-y-4">
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

            {!isForgotPassword && (
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
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 disabled:opacity-50"
            >
              {loading
                ? (isForgotPassword ? 'Küldés...' : isSignUp ? 'Létrehozás...' : 'Bejelentkezés...')
                : (isForgotPassword ? 'Jelszó visszaállítás küldése' : isSignUp ? 'Regisztráció' : 'Folytatás')
              }
            </button>

            {!isForgotPassword && (
              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true);
                    setError('');
                    setSuccessMessage('');
                  }}
                  className="text-zinc-700 hover:text-zinc-900 underline underline-offset-4"
                >
                  Elfelejtett?
                </button>
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
            )}

            {isForgotPassword && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setError('');
                    setSuccessMessage('');
                  }}
                  className="text-sm text-zinc-700 hover:text-zinc-900 underline underline-offset-4"
                >
                  Vissza a bejelentkezéshez
                </button>
              </div>
            )}
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

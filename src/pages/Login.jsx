import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="neon-title">
        <h1 className="glowing-text">Nexus</h1>
        <p className="subtitle">Authorized users only</p>
      </div>

      <div className="terminal-container">
        <h2 className="terminal-title">Access Terminal</h2>
        <p className="terminal-subtitle">Enter credentials to continue</p>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          className="google-button"
          disabled={loading}
        >
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="Google" 
            className="google-icon"
          />
          <span>Continue with Google</span>
        </button>

        <div className="divider">
          <span>OR</span>
        </div>

        <form onSubmit={handleSignIn} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">EMAIL</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="neon-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">PASSWORD</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="neon-input"
            />
          </div>

          <button type="submit" className="neon-button" disabled={loading}>
            {loading ? 'AUTHENTICATING...' : 'SIGN IN'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/signup')}
            className="neon-button secondary"
            disabled={loading}
          >
            SIGN UP
          </button>
        </form>

        <div className="auth-footer">
        
        </div>
      </div>

      <div className="system-info">
        v0.1 SYSTEM ONLINE
      </div>
    </div>
  );
}

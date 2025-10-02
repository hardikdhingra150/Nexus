import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      console.log('✅ Sign up data:', data);
      
      // Check if user already exists
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setError('This email is already registered. Please sign in instead.');
        setLoading(false);
        return;
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        console.log('📧 Email confirmation required');
        setNeedsConfirmation(true);
        setSuccess(true);
      } else {
        console.log('✅ User created and logged in automatically');
        setSuccess(true);
        // Redirect immediately if no confirmation needed
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }

      setLoading(false);

    } catch (error) {
      console.error('❌ Sign up error:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
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

  if (success) {
    return (
      <div className="app">
        <div className="neon-title">
          <h1 className="glowing-text">NEON ACCESS</h1>
          <p className="subtitle">Account created successfully</p>
        </div>

        <div className="terminal-container">
          <div className="success-screen">
            <div className="success-icon-large">✓</div>
            <h2 className="success-title">Registration Complete!</h2>
            
            {needsConfirmation ? (
              <div className="confirmation-message">
                <p className="success-message">
                  <strong>📧 Please check your email</strong>
                </p>
                <p className="confirmation-text">
                  We've sent a confirmation link to:
                  <span className="email-highlight">{email}</span>
                </p>
                <div className="confirmation-steps">
                  <div className="step-item">
                    <span className="step-number">1</span>
                    <span>Check your inbox (and spam folder)</span>
                  </div>
                  <div className="step-item">
                    <span className="step-number">2</span>
                    <span>Click the confirmation link</span>
                  </div>
                  <div className="step-item">
                    <span className="step-number">3</span>
                    <span>Return here and sign in</span>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/')} 
                  className="neon-button"
                  style={{ marginTop: '30px' }}
                >
                  GO TO LOGIN
                </button>
              </div>
            ) : (
              <div>
                <p className="success-message">
                  Your account has been created successfully!
                </p>
                <div className="success-animation">
                  <div className="spinner"></div>
                  <p className="redirect-text">Redirecting to dashboard...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="neon-title">
        <h1 className="glowing-text">NEON ACCESS</h1>
        <p className="subtitle">Create your account</p>
      </div>

      <div className="terminal-container">
        <h2 className="terminal-title">New User Registration</h2>
        <p className="terminal-subtitle">Enter your details to create an account</p>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleGoogleSignUp}
          className="google-button"
          disabled={loading}
        >
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="Google" 
            className="google-icon"
          />
          <span>Sign up with Google</span>
        </button>

        <div className="divider">
          <span>OR</span>
        </div>

        <form onSubmit={handleSignUp} className="auth-form">
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
              minLength={6}
              className="neon-input"
            />
            <small className="input-hint">At least 6 characters</small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">CONFIRM PASSWORD</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="neon-input"
            />
          </div>

          <button type="submit" className="neon-button" disabled={loading}>
            {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="neon-button secondary"
            disabled={loading}
          >
            BACK TO LOGIN
          </button>
        </form>

        <div className="auth-footer">
          <p className="footer-text">
            Already have an account? 
            <a href="#" onClick={() => navigate('/')} className="footer-link"> Sign in</a>
          </p>
        </div>
      </div>

      <div className="system-info">
        v0.1 SYSTEM ONLINE
      </div>
    </div>
  );
}

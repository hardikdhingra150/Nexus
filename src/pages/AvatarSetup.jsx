import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { saveAvatarData } from '../services/avatarService';
import ReadyPlayerMeAvatar from '../components/ReadyPlayerMeAvatar';
import '../App.css';

export default function Setup() {
  const [step, setStep] = useState(1);
  const [avatarData, setAvatarData] = useState({ imageUrl: '', glbUrl: '' });
  const [voiceId, setVoiceId] = useState('');
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const voices = [
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah (Female)', emoji: '👩' },
    { id: 'VR6AewLTigWG4xSOukaG', name: 'Adam (Male)', emoji: '👨' },
    { id: 'pNInz6obpgDQGcFmaJgB', name: 'Nicole (Female)', emoji: '👱‍♀️' },
    { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Michael (Male)', emoji: '🧔' },
  ];

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        navigate('/');
      } else {
        setUser(user);
      }
    });
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('avatarData');
    navigate('/');
  };

  const handleAvatarCreated = (imageUrl, glbUrl) => {
    setAvatarData({ imageUrl, glbUrl });
    setStep(2);
  };

  const handleComplete = async () => {
    if (!voiceId) return;
    
    setSaving(true);
    
    try {
      // Save to Supabase database
      await saveAvatarData(avatarData.imageUrl, avatarData.glbUrl, voiceId);
      
      // Also save to localStorage as backup
      const data = {
        imageUrl: avatarData.imageUrl,
        glbUrl: avatarData.glbUrl,
        voiceId: voiceId,
      };
      localStorage.setItem('avatarData', JSON.stringify(data));
      
      console.log('✅ Avatar saved to database successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('❌ Error saving avatar:', error);
      alert('Failed to save avatar. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSkipVoice = async () => {
    setSaving(true);
    
    try {
      // Save to Supabase database without voice
      await saveAvatarData(avatarData.imageUrl, avatarData.glbUrl, null);
      
      // Also save to localStorage as backup
      const data = {
        imageUrl: avatarData.imageUrl,
        glbUrl: avatarData.glbUrl,
        voiceId: null,
      };
      localStorage.setItem('avatarData', JSON.stringify(data));
      
      console.log('✅ Avatar saved to database (no voice)!');
      navigate('/dashboard');
    } catch (error) {
      console.error('❌ Error saving avatar:', error);
      alert('Failed to save avatar. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="setup-legendary">
      {/* Animated Background */}
      <div className="setup-background">
        <div className="bg-gradient-1"></div>
        <div className="bg-gradient-2"></div>
        <div className="bg-gradient-3"></div>
      </div>

      {/* Floating Orbs */}
      <div className="floating-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      <div className="setup-container">
        {/* Header */}
        <div className="setup-header-legendary">
          <div className="header-content">
            <div className="header-left">
              <div className="setup-logo">
                <div className="logo-hexagon"></div>
                <span className="logo-text">SETUP</span>
              </div>
              <div className="header-info">
                <h1 className="setup-title">Neural Configuration</h1>
                <p className="setup-subtitle">Configure your digital identity</p>
              </div>
            </div>
            <button onClick={handleSignOut} className="btn-exit">
              <span className="exit-icon">→</span>
              <span>Exit</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-track">
            <div 
              className="progress-fill" 
              style={{ width: `${(step / 2) * 100}%` }}
            ></div>
          </div>
          <div className="progress-steps">
            <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
              <div className="step-circle">
                {step > 1 ? '✓' : '1'}
              </div>
              <span className="step-label">Avatar</span>
            </div>
            <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
              <div className="step-circle">2</div>
              <span className="step-label">Voice</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="setup-content">
          {step === 1 && (
            <div className="setup-section" key="avatar-section">
              {/* Feature Card */}
              <div className="feature-card">
                <div className="feature-icon">🎭</div>
                <div className="feature-content">
                  <h3 className="feature-title">Photorealistic 3D Avatar from Selfie</h3>
                  <p className="feature-description">
                    Create a lifelike 3D avatar that looks exactly like you using AI!
                  </p>
                </div>
                <div className="feature-badge">POWERED BY AI</div>
              </div>

              {/* Avatar Creator */}
              <ReadyPlayerMeAvatar onAvatarCreated={handleAvatarCreated} />
            </div>
          )}

          {step === 2 && (
            <div className="setup-section voice-section" key="voice-section">
              {/* Voice Selection Card */}
              <div className="voice-header-card">
                <div className="voice-icon-large">🎙️</div>
                <h2 className="voice-title">Select Neural Voice</h2>
                <p className="voice-subtitle">
                  Choose a voice that represents your digital persona
                </p>
              </div>

              <div className="voice-selection-grid">
                {voices.map((voice) => (
                  <div
                    key={voice.id}
                    className={`voice-card ${voiceId === voice.id ? 'selected' : ''}`}
                    onClick={() => setVoiceId(voice.id)}
                  >
                    <div className="voice-avatar">
                      <span className="voice-emoji">{voice.emoji}</span>
                      {voiceId === voice.id && (
                        <div className="selected-ring"></div>
                      )}
                    </div>
                    <div className="voice-info">
                      <h4 className="voice-name">{voice.name}</h4>
                      <span className="voice-type">Neural Voice</span>
                    </div>
                    {voiceId === voice.id && (
                      <div className="selected-badge">
                        <span>✓</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Action Buttons with Saving State */}
              <div className="voice-actions">
                <button
                  onClick={handleComplete}
                  className="btn-complete"
                  disabled={!voiceId || saving}
                >
                  {saving ? (
                    <>
                      <span className="btn-spinner"></span>
                      <span>SAVING TO DATABASE...</span>
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">✓</span>
                      <span>COMPLETE SETUP</span>
                    </>
                  )}
                  <div className="btn-glow"></div>
                </button>
                <button 
                  onClick={handleSkipVoice} 
                  className="btn-skip"
                  disabled={saving}
                >
                  <span>{saving ? 'Saving...' : 'Skip for now'}</span>
                  {!saving && <span className="skip-arrow">→</span>}
                </button>
              </div>

              {/* Database Save Info */}
              <div className="save-info-banner">
                <span className="info-icon">💾</span>
                <span className="info-text">
                  Your avatar will be saved to your account and available across all devices
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="setup-footer">
          <div className="footer-badge">
            <span className="badge-dot"></span>
            <span>SECURE CONFIGURATION</span>
          </div>
          <div className="footer-info">
            <span>Step {step} of 2</span>
            <span>•</span>
            <span>Neural Identity Setup</span>
          </div>
        </div>
      </div>
    </div>
  );
}

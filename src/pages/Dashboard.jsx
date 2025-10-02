import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { getChatResponse } from '../api/gemini';
import { textToSpeech } from '../api/elevenlabs';
import { getAvatarData } from '../services/avatarService';
import CartoonMouth from '../components/CartoonMouth';
import '../App.css';

// Text cleaning function for voice synthesis
function cleanTextForSpeech(text) {
  if (!text) return '';

  let cleaned = text;

  // Remove markdown bold/italic (**, __, *, _)
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
  cleaned = cleaned.replace(/__([^_]+)__/g, '$1');
  cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');
  cleaned = cleaned.replace(/_([^_]+)_/g, '$1');

  // Remove markdown headers (# ## ###)
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');

  // Remove markdown links [text](url)
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Remove markdown code blocks
  cleaned = cleaned.replace(/``````/g, '');
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');

  // Remove HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, '');

  // Remove bullet points and list markers
  cleaned = cleaned.replace(/^[\s]*[-*+]\s+/gm, '');
  cleaned = cleaned.replace(/^[\s]*\d+\.\s+/gm, '');

  // Remove special characters
  cleaned = cleaned.replace(/[#$%^&<>{}[\]\\|~`]/g, '');

  // Replace slashes with "or"
  cleaned = cleaned.replace(/\s*\/\s*/g, ' or ');

  // Replace @ with "at"
  cleaned = cleaned.replace(/@/g, ' at ');

  // Replace & with "and"
  cleaned = cleaned.replace(/&/g, ' and ');

  // Remove quotation marks
  cleaned = cleaned.replace(/["']/g, '');

  // Remove parentheses
  cleaned = cleaned.replace(/[()]/g, '');

  // Replace multiple spaces with single space
  cleaned = cleaned.replace(/\s+/g, ' ');

  // Replace ellipsis with period
  cleaned = cleaned.replace(/\.{2,}/g, '.');

  // Remove leading/trailing whitespace
  cleaned = cleaned.trim();

  return cleaned;
}

export default function Dashboard() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [avatarData, setAvatarData] = useState(null);
  const [user, setUser] = useState(null);
  const [messageCount, setMessageCount] = useState(0);
  const [loadingAvatar, setLoadingAvatar] = useState(true);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadUserData = async () => {
    try {
      setLoadingAvatar(true);
      
      // Get authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      
      setUser(user);

      if (user) {
        console.log('👤 User loaded:', user.email);
        
        // Try to load avatar from database first
        const dbAvatar = await getAvatarData();
        
        if (dbAvatar) {
          console.log('✅ Avatar loaded from database:', dbAvatar);
          setAvatarData(dbAvatar);
          
          // Update localStorage as backup
          localStorage.setItem('avatarData', JSON.stringify(dbAvatar));
        } else {
          console.log('⚠️ No avatar in database, checking localStorage...');
          
          // Fallback to localStorage
          const localData = localStorage.getItem('avatarData');
          if (localData) {
            console.log('📦 Avatar loaded from localStorage (fallback)');
            setAvatarData(JSON.parse(localData));
          } else {
            console.log('❌ No avatar found anywhere');
          }
        }
      }
    } catch (error) {
      console.error('❌ Error loading user data:', error);
    } finally {
      setLoadingAvatar(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('avatarData');
    navigate('/');
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setMessageCount(prev => prev + 1);
    setLoading(true);

    try {
      // Get AI response
      const aiResponse = await getChatResponse(userMessage);
      
      // Add original response to messages for display
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      setMessageCount(prev => prev + 1);
      setLoading(false);

      // Generate speech if voice is configured
      if (avatarData?.voiceId) {
        setSpeaking(true);
        try {
          // Clean text for speech (remove special characters)
          const speechText = cleanTextForSpeech(aiResponse);
          
          console.log('🎯 Original text:', aiResponse);
          console.log('🧹 Cleaned for speech:', speechText);
          
          // Generate and play audio
          const audio = await textToSpeech(speechText, avatarData.voiceId);
          setAudioUrl(audio);
          
          const audioElement = new Audio(audio);
          audioElement.onended = () => setSpeaking(false);
          audioElement.play();
        } catch (error) {
          console.error('Speech error:', error);
          setSpeaking(false);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'system', content: `Error: ${error.message}` }]);
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setMessageCount(0);
  };

  const handleDownloadChat = () => {
    const chatText = messages
      .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Show loading state while fetching avatar
  if (loadingAvatar) {
    return (
      <div className="dashboard-ultimate">
        <div className="dashboard-loading">
          <div className="loading-spinner-large"></div>
          <p className="loading-text-large">Loading Neural Interface...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-ultimate">
      {/* Animated Background Grid */}
      <div className="grid-background">
        <div className="grid-line horizontal"></div>
        <div className="grid-line horizontal"></div>
        <div className="grid-line horizontal"></div>
        <div className="grid-line vertical"></div>
        <div className="grid-line vertical"></div>
        <div className="grid-line vertical"></div>
      </div>

      {/* Floating Particles */}
      <div className="particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      <div className="dashboard-content">
        {/* Futuristic Header */}
        <div className="dashboard-header">
          <div className="header-left">
            <div className="logo-container">
              <div className="logo-ring"></div>
              <div className="logo-core">AI</div>
            </div>
            <div className="header-info">
              <h1 className="dashboard-title">
                <span className="title-primary">NEURAL</span>
                <span className="title-secondary">INTERFACE</span>
              </h1>
              <div className="user-badge">
                <span className="badge-icon">👤</span>
                <span className="badge-text">{user?.email}</span>
              </div>
            </div>
          </div>
          
          <div className="header-right">
            <div className="stats-mini">
              <div className="stat-item">
                <span className="stat-label">Messages</span>
                <span className="stat-value">{messageCount}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Status</span>
                <span className="stat-value status-online">● ONLINE</span>
              </div>
            </div>
            {!avatarData && (
              <button onClick={() => navigate('/setup')} className="btn-setup-mini">
                <span className="btn-icon">⚙️</span>
                Setup
              </button>
            )}
            <button onClick={handleSignOut} className="btn-logout-mini">
              <span className="btn-icon">🚪</span>
              Exit
            </button>
          </div>
        </div>

        {/* Status Banner */}
        {avatarData ? (
          <div className="status-banner success">
            <div className="banner-icon">✓</div>
            <div className="banner-content">
              <strong>SYSTEM READY</strong>
              <span>{avatarData.voiceId ? 'Full neural sync active • Loaded from database' : 'Visual interface active • Loaded from database'}</span>
            </div>
            <div className="banner-pulse"></div>
          </div>
        ) : (
          <div className="status-banner warning">
            <div className="banner-icon">⚠</div>
            <div className="banner-content">
              <strong>SETUP REQUIRED</strong>
              <span>Complete avatar configuration to unlock full features</span>
            </div>
          </div>
        )}

        {/* Main Interface */}
        <div className="neural-interface">
          {/* Avatar Panel */}
          {avatarData?.imageUrl && (
            <div className="avatar-panel">
              <div className="panel-header">
                <h3 className="panel-title">AVATAR CORE</h3>
                <div className={`status-indicator ${speaking ? 'active' : 'idle'}`}>
                  <span className="indicator-dot"></span>
                  <span className="indicator-text">{speaking ? 'SPEAKING' : 'STANDBY'}</span>
                </div>
              </div>

              <div className="avatar-display">
                <div className="avatar-container">
                  <div className="avatar-frame">
                    <img src={avatarData.imageUrl} alt="Avatar" className="avatar-img" />
                    {speaking && <CartoonMouth audioUrl={audioUrl} />}
                    <div className="frame-glow"></div>
                  </div>
                  <div className="avatar-scanline"></div>
                </div>
              </div>

              <div className="avatar-stats">
                <div className="stat-row">
                  <span className="stat-icon">🎭</span>
                  <span className="stat-label">Neural Model</span>
                  <span className="stat-badge">ACTIVE</span>
                </div>
                {avatarData.voiceId && (
                  <div className="stat-row">
                    <span className="stat-icon">🔊</span>
                    <span className="stat-label">Voice Synthesis</span>
                    <span className="stat-badge">ENABLED</span>
                  </div>
                )}
                <div className="stat-row">
                  <span className="stat-icon">⚡</span>
                  <span className="stat-label">System Status</span>
                  <span className="stat-badge success">OPTIMAL</span>
                </div>
              </div>
            </div>
          )}

          {/* Chat Panel */}
          <div className="chat-panel">
            <div className="panel-header">
              <h3 className="panel-title">NEURAL COMMUNICATION</h3>
              <div className="panel-controls">
                <button 
                  className="control-btn" 
                  title="Clear chat"
                  onClick={handleClearChat}
                >
                  🗑️
                </button>
                <button 
                  className="control-btn" 
                  title="Download chat"
                  onClick={handleDownloadChat}
                  disabled={messages.length === 0}
                >
                  💾
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="messages-area">
              {messages.length === 0 && (
                <div className="welcome-screen">
                  <div className="welcome-animation">
                    <div className="welcome-ring"></div>
                    <div className="welcome-ring"></div>
                    <div className="welcome-ring"></div>
                    <div className="welcome-icon">🧠</div>
                  </div>
                  <h2 className="welcome-title">NEURAL INTERFACE READY</h2>
                  <p className="welcome-subtitle">Initiate communication to begin neural sync</p>
                  <div className="welcome-features">
                    <div className="feature-chip">AI-Powered</div>
                    <div className="feature-chip">Real-time</div>
                    <div className="feature-chip">Secure</div>
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`message-bubble ${msg.role}`}>
                  <div className="message-header">
                    <span className="message-avatar">
                      {msg.role === 'user' ? '👤' : msg.role === 'system' ? '⚠️' : '🤖'}
                    </span>
                    <span className="message-sender">
                      {msg.role === 'user' ? 'YOU' : msg.role === 'system' ? 'SYSTEM' : 'NEURAL AI'}
                    </span>
                    <span className="message-time">{new Date().toLocaleTimeString()}</span>
                  </div>
                  <div className="message-content">
                    <p>{msg.content}</p>
                  </div>
                  <div className="message-glow"></div>
                </div>
              ))}

              {loading && (
                <div className="message-bubble assistant loading">
                  <div className="message-header">
                    <span className="message-avatar">🤖</span>
                    <span className="message-sender">NEURAL AI</span>
                  </div>
                  <div className="loading-animation">
                    <div className="loading-dots">
                      <span className="dot"></span>
                      <span className="dot"></span>
                      <span className="dot"></span>
                    </div>
                    <span className="loading-text">Processing neural data...</span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="input-panel">
              <div className="input-wrapper">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !loading && handleSend()}
                  placeholder="Enter neural command..."
                  className="neural-input"
                  disabled={loading}
                />
                <div className="input-line"></div>
              </div>
              <button
                onClick={handleSend}
                className="send-button"
                disabled={loading || !input.trim()}
              >
                <span className="btn-text">TRANSMIT</span>
                <span className="btn-icon">→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="dashboard-footer">
          <div className="footer-left">
            <span className="footer-badge">v2.0.1</span>
            <span className="footer-text">NEURAL INTERFACE</span>
          </div>
          <div className="footer-center">
            <span className="footer-chip">🔒 ENCRYPTED</span>
            <span className="footer-chip">⚡ LOW LATENCY</span>
            <span className="footer-chip">🌐 CONNECTED</span>
          </div>
          <div className="footer-right">
            <span className="footer-text">AI CHAT • VOICE SYNTHESIS • NEURAL SYNC</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import '../App.css';

export default function ReadyPlayerMeAvatar({ onAvatarCreated }) {
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState('');

  const openReadyPlayerMe = () => {
    window.open('https://readyplayer.me/avatar', '_blank', 'width=1000,height=800');
  };

  const handleUrlSubmit = () => {
    if (!avatarUrl.trim()) {
      alert('⚠️ Please paste your Ready Player Me avatar URL!');
      return;
    }

    setLoading(true);

    try {
      // Extract avatar ID from URL
      let avatarId = '';
      
      // Support multiple URL formats
      if (avatarUrl.includes('models.readyplayer.me')) {
        // Direct GLB URL: https://models.readyplayer.me/xxx.glb
        const match = avatarUrl.match(/models\.readyplayer\.me\/([^.]+)/);
        if (match) avatarId = match[1];
      } else if (avatarUrl.includes('readyplayer.me')) {
        // Full URL: https://readyplayer.me/avatar?id=xxx
        const match = avatarUrl.match(/id=([^&]+)/);
        if (match) avatarId = match[1];
      } else {
        // Just the ID
        avatarId = avatarUrl.trim();
      }

      if (!avatarId) {
        alert('⚠️ Invalid URL format. Please check and try again.');
        setLoading(false);
        return;
      }

      // Generate URLs
      const glbUrl = `https://models.readyplayer.me/${avatarId}.glb`;
      const imageUrl = `https://models.readyplayer.me/${avatarId}.png`;

      // Set preview
      setPreview(imageUrl);
      setLoading(false);

      // Callback
      onAvatarCreated(imageUrl, glbUrl);
      
      console.log('✅ Avatar loaded:', { imageUrl, glbUrl });

    } catch (error) {
      console.error('Error loading avatar:', error);
      alert('Failed to load avatar. Please check the URL and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="rpm-manual-creator">
      <div className="creator-header">
        <div className="header-icon">🎭</div>
        <h3 className="header-title">Ready Player Me Avatar</h3>
        <p className="header-subtitle">
          Create your photorealistic 3D avatar and paste the URL below
        </p>
      </div>

      <div className="creator-section">
        <div className="section-label">VISUAL BIOMETRIC (Ready Player Me 3D Avatar)</div>

        {!preview ? (
          <div className="rpm-instructions-card">
            {/* Step 1 */}
            <div className="instruction-step">
              <div className="step-header">
                <div className="step-number">1</div>
                <h4 className="step-title">Create Avatar on Ready Player Me</h4>
              </div>
              <p className="step-description">
                Click the button below to open Ready Player Me in a new tab
              </p>
              <button onClick={openReadyPlayerMe} className="open-rpm-button">
                🚀 OPEN READY PLAYER ME
              </button>
            </div>

            {/* Step 2 */}
            <div className="instruction-step">
              <div className="step-header">
                <div className="step-number">2</div>
                <h4 className="step-title">Create & Customize Your Avatar</h4>
              </div>
              <div className="step-list">
                <p>📸 Take a selfie or upload your photo</p>
                <p>⏳ Wait for AI to process (~30 seconds)</p>
                <p>✨ Customize your avatar (optional)</p>
                
              </div>
            </div>

            {/* Step 3 */}
            <div className="instruction-step">
              <div className="step-header">
                <div className="step-number">3</div>
                <h4 className="step-title">Copy & Paste Avatar URL</h4>
              </div>
              <p className="step-description">
                Click the <strong>"Copy"</strong> button on the completion screen and paste the URL below
              </p>
              
              <div className="url-input-section">
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="Paste your Ready Player Me avatar URL here..."
                  className="url-input"
                  disabled={loading}
                />
                <button 
                  onClick={handleUrlSubmit}
                  className="submit-button"
                  disabled={loading || !avatarUrl.trim()}
                >
                  {loading ? (
                    <>
                      <span className="btn-spinner"></span>
                      Loading...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">✓</span>
                      LOAD AVATAR
                    </>
                  )}
                </button>
              </div>
              
              <p className="url-example">
                💡 <strong>Example:</strong> https://models.readyplayer.me/68de3c749603200be5494882.glb
              </p>
            </div>
          </div>
        ) : (
          <div className="rpm-success">
            <div className="success-badge">✓</div>
            <h4 className="success-title">3D Avatar Loaded Successfully!</h4>
            <div className="avatar-preview">
              <img src={preview} alt="Ready Player Me Avatar" className="avatar-image" />
            </div>
            <p className="avatar-url-display">
              <strong>Avatar ID:</strong> {avatarUrl.split('/').pop().split('.')[0] || avatarUrl}
            </p>
            <button 
              onClick={() => {
                setPreview('');
                setAvatarUrl('');
              }}
              className="change-avatar-button"
            >
              🔄 Load Different Avatar
            </button>
          </div>
        )}

        <div className="rpm-note">
          <span className="note-icon">💡</span>
          <div className="note-content">
            <strong>Quick Tip:</strong> After creating your avatar on Ready Player Me, look for the "Copy" button on the completion screen. It will copy the avatar URL which you can paste above.
          </div>
        </div>
      </div>
    </div>
  );
}

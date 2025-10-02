import { useState } from 'react';
import '../App.css';

export default function AvatarCreator({ onAvatarCreated }) {
  const [loading, setLoading] = useState(false);
  const [showIframe, setShowIframe] = useState(false);

  const handleCreateAvatar = () => {
    setShowIframe(true);
  };

  const handleMessage = (event) => {
    // Listen for avatar creation from iframe
    if (event.data?.source === 'readyplayerme') {
      if (event.data.eventName === 'v1.avatar.exported') {
        const avatarUrl = event.data.data.url;
        console.log('Avatar created:', avatarUrl);
        
        // Convert GLB to image for display
        const avatarImageUrl = `${avatarUrl.replace('.glb', '.png')}?scene=fullbody-portrait-v1`;
        
        setShowIframe(false);
        onAvatarCreated(avatarImageUrl, avatarUrl);
      }
    }
  };

  useState(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="avatar-creator">
      {!showIframe ? (
        <button 
          onClick={handleCreateAvatar}
          className="neon-button"
        >
          🎨 CREATE 3D AVATAR FROM SELFIE
        </button>
      ) : (
        <div className="iframe-container">
          <iframe
            src="https://demo.readyplayer.me/avatar?frameApi"
            allow="camera *; microphone *"
            className="avatar-iframe"
            title="ReadyPlayerMe Avatar Creator"
          />
          <p className="iframe-note">
            📸 Take a selfie or upload a photo to create your 3D avatar
          </p>
        </div>
      )}
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import '../App.css';

export default function TalkingAvatar({ avatarUrl, audioUrl, isPlaying }) {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const animationRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const [mouthOpen, setMouthOpen] = useState(0);

  useEffect(() => {
    if (!audioUrl || !isPlaying) return;

    // Setup audio analysis
    const audio = audioRef.current;
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(audio);
    
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 256;

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    // Animate mouth based on audio
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const animate = () => {
      analyser.getByteFrequencyData(dataArray);
      
      // Get average volume
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      const normalized = average / 255;
      
      // Map to mouth opening (0-1)
      const mouthValue = Math.min(normalized * 2, 1);
      setMouthOpen(mouthValue);
      
      animationRef.current = requestAnimationFrame(animate);
    };

    audio.play();
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioUrl, isPlaying]);

  return (
    <div className="talking-avatar-container">
      <div className="avatar-stage">
        {/* Background Avatar */}
        <img 
          src={avatarUrl} 
          alt="Avatar" 
          className="avatar-base"
        />
        
        {/* Animated Mouth Overlay */}
        <div 
          className="mouth-overlay"
          style={{
            transform: `scaleY(${1 + mouthOpen * 0.3})`,
            opacity: 0.8 + mouthOpen * 0.2,
          }}
        >
          <div className="mouth-shape" style={{ height: `${20 + mouthOpen * 30}px` }} />
        </div>

        {/* Glow effect when talking */}
        <div 
          className="avatar-glow"
          style={{
            opacity: mouthOpen * 0.6,
            transform: `scale(${1 + mouthOpen * 0.1})`,
          }}
        />
      </div>

      {/* Hidden audio player */}
      <audio 
        ref={audioRef}
        src={audioUrl}
        style={{ display: 'none' }}
      />

      {/* Status indicator */}
      <div className="avatar-status">
        {isPlaying ? (
          <span className="status-talking">
            🎤 Speaking... 
            <span className="volume-bars">
              {[...Array(3)].map((_, i) => (
                <span 
                  key={i}
                  className="bar"
                  style={{
                    height: `${10 + mouthOpen * 20 + i * 5}px`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </span>
          </span>
        ) : (
          <span className="status-idle">💬 Listening</span>
        )}
      </div>
    </div>
  );
}

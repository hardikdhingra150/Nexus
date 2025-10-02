export default function CartoonMouth({ isOpen, openAmount = 0 }) {
    const mouthHeight = 5 + openAmount * 25; // 5px to 30px
    const mouthY = 50 - (mouthHeight / 2);
  
    return (
      <svg 
        width="60" 
        height="40" 
        viewBox="0 0 60 40"
        style={{
          position: 'absolute',
          bottom: '70px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
        }}
      >
        {/* Mouth */}
        <ellipse
          cx="30"
          cy={mouthY}
          rx="22"
          ry={mouthHeight}
          fill="#ff1744"
          stroke="#c41230"
          strokeWidth="2"
          style={{
            transition: 'all 0.1s ease-out',
          }}
        />
        
        {/* Teeth (when mouth is open) */}
        {openAmount > 0.3 && (
          <>
            <rect x="20" y={mouthY - 3} width="8" height="6" fill="white" rx="1" />
            <rect x="32" y={mouthY - 3} width="8" height="6" fill="white" rx="1" />
          </>
        )}
        
        {/* Tongue (when mouth is very open) */}
        {openAmount > 0.6 && (
          <ellipse
            cx="30"
            cy={mouthY + mouthHeight * 0.3}
            rx="15"
            ry="8"
            fill="#ff6b9d"
          />
        )}
      </svg>
    );
  }
  
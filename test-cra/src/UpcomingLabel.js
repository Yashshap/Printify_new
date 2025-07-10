import React from 'react';

const UpcomingLabel = () => {
  return (
    <div style={{
      position: 'absolute',
      bottom: -8,
      left: -8,
      background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
      color: '#fff',
      padding: '6px 16px',
      borderRadius: 999,
      fontSize: '0.75rem',
      fontWeight: 700,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      boxShadow: '0 4px 12px 0 rgba(251,191,36,0.4)',
      border: '2px solid #fff',
      zIndex: 10,
      animation: 'pulse-glow 2s ease-in-out infinite',
    }}>
      Coming Soon
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 4px 12px 0 rgba(251,191,36,0.4);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 6px 20px 0 rgba(251,191,36,0.6);
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
};

export default UpcomingLabel; 
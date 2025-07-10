import React from 'react';
import UpcomingLabel from './UpcomingLabel';

const catalogItems = [
  {
    icon: (
      <svg className="w-10 h-10 text-[#176fd3]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" fill="#e0e7ff" /><path d="M8 12h8m-4-4v8" stroke="#176fd3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    ),
    title: 'Premium Prints',
    desc: 'High-quality color and B&W prints for all your needs.'
  },
  {
    icon: (
      <svg className="w-10 h-10 text-[#fbbf24]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fbbf24" /><path d="M8 12h8m-4-4v8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    ),
    title: 'Binding & Finishing',
    desc: 'Professional binding and finishing options.'
  },
  {
    icon: (
      <svg className="w-10 h-10 text-[#4e7097]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="4" y="4" width="16" height="16" rx="2" fill="#4e7097" />
        <path d="M8 8h8M8 12h6M8 16h4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="18" cy="6" r="2" fill="#fbbf24" stroke="#fff" strokeWidth="1"/>
        <path d="M17 5l2 2-2 2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'AI Docx Formatter',
    desc: 'Detect mistakes in a click.'
  },
  {
    icon: (
      <svg className="w-10 h-10 text-[#22c55e]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="#22c55e" />
        <path d="M12 8v8M8 12h8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="12" r="3" fill="#fff" opacity="0.8"/>
      </svg>
    ),
    title: 'Your Suggestion',
    desc: 'Your suggestion can be our next feature! Share your ideas with us.'
  },
];

const CatalogPage = () => {
  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Animated Gradient Background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        background: 'linear-gradient(120deg, #f8fafc 0%, #e0e7ff 50%,rgb(246, 223, 165) 50%)',
        animation: 'gradient-move 8s ease-in-out infinite',
        backgroundSize: '200% 200%'
      }} />
      {/* Decorative SVG Blob */}
      <svg style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, opacity: 0.18, zIndex: 1 }} viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="200" cy="200" r="200" fill="url(#catBlob)" />
        <defs>
          <radialGradient id="catBlob" cx="0" cy="0" r="1" gradientTransform="translate(200 200) scale(200)" gradientUnits="userSpaceOnUse">
            <stop stopColor="#176fd3" />
            <stop offset="1" stopColor="#fbbf24" stopOpacity="0.2" />
          </radialGradient>
        </defs>
      </svg>
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 16px 32px 16px' }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 800,
          color: '#0e141b',
          marginBottom: 12,
          letterSpacing: '-0.02em',
          textAlign: 'center',
          textShadow: '0 2px 16px #e0e7ff'
        }}>
          Explore Our Premium Catalogue
        </h1>
        <p style={{ color: '#4e7097', fontSize: '1.2rem', marginBottom: 40, textAlign: 'center', maxWidth: 540 }}>
          Discover a range of high-quality print and stationery services designed to make your life easier and more colorful.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 32,
          width: '100%',
          maxWidth: 900,
          marginBottom: 48
        }}>
          {catalogItems.map((item, idx) => (
            <div
              key={item.title}
              style={{
                background: 'rgba(255,255,255,0.95)',
                borderRadius: 20,
                boxShadow: '0 4px 32px 0 rgba(23,111,211,0.08)',
                padding: item.title === 'Your Suggestion' ? '40px 32px' : '32px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
                border: '2px solid #e0e7ff',
                position: 'relative',
                overflow: 'hidden',
                gridColumn: item.title === 'Your Suggestion' ? '1 / -1' : 'auto',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px) scale(1.03)';
                e.currentTarget.style.boxShadow = '0 8px 32px 0 #176fd344';
                e.currentTarget.style.border = '2px solid #176fd3';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 32px 0 rgba(23,111,211,0.08)';
                e.currentTarget.style.border = '2px solid #e0e7ff';
              }}
            >
              {(item.title === 'Binding & Finishing' || item.title === 'AI Docx Formatter') && <UpcomingLabel />}
              {item.icon}
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0e141b', margin: '18px 0 8px 0', textAlign: 'center' }}>{item.title}</h2>
              <p style={{ color: '#4e7097', fontSize: '1rem', textAlign: 'center', marginBottom: item.title === 'Your Suggestion' ? '24px' : '0' }}>{item.desc}</p>
              {item.title === 'Your Suggestion' && (
                <button
                  style={{
                    padding: '12px 28px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 999,
                    background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
                    boxShadow: '0 4px 16px 0 rgba(34,197,94,0.3)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    marginTop: '8px',
                    letterSpacing: '0.01em',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(34,197,94,0.4)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 4px 16px 0 rgba(34,197,94,0.3)';
                  }}
                >
                  Submit Idea
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Keyframes for animated gradient */}
      <style>{`
        @keyframes gradient-move {
          0%,100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes gradient-x {
          0%,100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
};

export default CatalogPage; 
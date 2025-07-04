import React, { useEffect, useState } from 'react';
import './CatalogPage.css';

const CatalogPage = () => {
  const sloganText = "Making Your Life Easy...";
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(sloganText.slice(0, i));
      i++;
      if (i > sloganText.length) clearInterval(interval);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="coming-soon-container">
      <div className="tech-circle"></div>
      <h1 className="tech-title">🤖 More Services Coming Soon</h1>
      <p className="typing-text">{displayedText}</p>
    </div>
  );
};

export default CatalogPage; 
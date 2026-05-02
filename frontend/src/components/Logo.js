import React from 'react';

const Logo = ({ size = 'medium' }) => {
  const isSmall = size === 'small';

  const letters = [
    { letter: 'S', color: '#4A4A4A' },
    { letter: 'R', color: '#888888' },
    { letter: 'M', color: '#4A4A4A' },
    { letter: 'S', color: '#888888' }
  ];

  return (
    <div style={styles.wrapper}>
      <div style={styles.logoRow}>
        {letters.map((item, index) => (
          <div
            key={index}
            style={{
              ...styles.letterBox,
              backgroundColor: item.color,
              width: isSmall ? '28px' : '44px',
              height: isSmall ? '28px' : '44px',
              fontSize: isSmall ? '13px' : '22px'
            }}
          >
            {item.letter}
          </div>
        ))}
      </div>
      {!isSmall && (
        <div style={styles.tagline}>
          SUBMISSION REVIEW MANAGEMENT SYSTEM
        </div>
      )}
    </div>
  );
};

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px'
  },
  logoRow: {
    display: 'flex',
    gap: '5px'
  },
  letterBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    color: 'white',
    fontWeight: '800',
    fontFamily: 'Arial, sans-serif'
  },
  tagline: {
    fontSize: '9px',
    letterSpacing: '2px',
    color: '#999999',
    fontWeight: '600'
  }
};

export default Logo;
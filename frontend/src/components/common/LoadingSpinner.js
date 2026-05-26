import React from 'react';

function LoadingSpinner({ fullPage = false, size = 'md' }) {
  const sizes = { sm: 20, md: 32, lg: 48 };
  const px = sizes[size] || 32;

  const spinner = (
    <span
      className="spinner"
      style={{ width: px, height: px, borderWidth: px / 8 }}
      role="status"
      aria-label="Loading"
    />
  );

  if (fullPage) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          width: '100%',
        }}
      >
        {spinner}
      </div>
    );
  }

  return spinner;
}

export default LoadingSpinner;

'use client';

import React from 'react';

interface LoadingStateProps {
  message?: string;
  rows?: number;
}

export default function LoadingState({
  message = 'Loading live data...',
  rows = 3,
}: LoadingStateProps) {
  return (
    <div
      style={{
        padding: '32px 20px',
        background: 'var(--surface, #18191c)',
        border: '1px solid var(--border, #2a2b30)',
        borderRadius: 'var(--radius, 10px)',
        margin: '16px 0',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 20,
          color: 'var(--accent, #f4d35e)',
        }}
      >
        <div
          style={{
            width: 20,
            height: 20,
            border: '2px solid rgba(244, 211, 94, 0.25)',
            borderTop: '2px solid var(--accent, #f4d35e)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text, #f5f5f6)' }}>
          {message}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            style={{
              height: 20,
              borderRadius: 4,
              background: 'linear-gradient(90deg, #1e1f24 25%, #2a2b30 50%, #1e1f24 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              opacity: 1 - i * 0.2,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}

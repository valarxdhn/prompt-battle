'use client';

import React, { useEffect } from 'react';
import { useApp } from '../../context/DemoContext';

export default function Toast() {
  const { state, dispatch } = useApp();

  useEffect(() => {
    if (state.toasts.length === 0) return;
    const timer = setTimeout(() => {
      // Remove first toast after duration
      const firstToast = state.toasts[0];
      if (firstToast) {
        dispatch({ type: 'REMOVE_TOAST', payload: firstToast.id });
      }
    }, state.toasts[0]?.duration || 4500);

    return () => clearTimeout(timer);
  }, [state.toasts, dispatch]);

  if (state.toasts.length === 0) return null;

  const typeConfig: Record<string, { border: string; bg: string; icon: string }> = {
    info: { border: '#5b9cf6', bg: '#18191c', icon: 'ℹ️' },
    success: { border: '#4caf84', bg: '#18191c', icon: '✅' },
    warning: { border: '#f4a435', bg: '#18191c', icon: '⚠️' },
    error: { border: '#e05252', bg: '#18191c', icon: '🚨' },
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        maxWidth: 380,
        width: 'calc(100vw - 48px)',
      }}
    >
      {state.toasts.map((toast) => {
        const cfg = typeConfig[toast.type] || typeConfig.info;
        return (
          <div
            key={toast.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              padding: '12px 16px',
              borderRadius: 8,
              background: cfg.bg,
              border: '1px solid var(--border, #2a2b30)',
              borderLeft: `4px solid ${cfg.border}`,
              color: 'var(--text, #f5f5f6)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              fontSize: 13,
              fontWeight: 500,
              animation: 'slideIn 0.25s ease-out',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16 }}>{cfg.icon}</span>
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => dispatch({ type: 'REMOVE_TOAST', payload: toast.id })}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--muted, #9a9ba3)',
                fontSize: 16,
                cursor: 'pointer',
                padding: '0 4px',
                lineHeight: 1,
              }}
              aria-label="Dismiss toast"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}

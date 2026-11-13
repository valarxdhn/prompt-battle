'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { UserRole } from '../../types';

interface NavbarProps {
  title: string;
  role?: UserRole;
  showBack?: boolean;
}

const ROLE_COLORS: Record<UserRole, string> = {
  student: 'var(--info)',
  admin: 'var(--accent)',
  driver: 'var(--success)',
};

const ROLE_TEXT_COLORS: Record<UserRole, string> = {
  student: '#fff',
  admin: '#171717',
  driver: '#171717',
};

const ROLE_LABELS: Record<UserRole, string> = {
  student: 'Student',
  admin: 'Admin',
  driver: 'Driver',
};

export default function Navbar({ title, role, showBack }: NavbarProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link href="/" className="navbar-brand">
          <span className="navbar-brand-mark">R</span>
          <span className="navbar-brand-name">ROUTELESS</span>
        </Link>
        {showBack && (
          <button className="navbar-back btn btn-ghost btn-sm" onClick={() => router.back()}>
            ← Back
          </button>
        )}
      </div>

      <div className="navbar-center">
        <span className="navbar-title">{title}</span>
      </div>

      <div className="navbar-right">
        {role && (
          <span
            className="navbar-role-badge"
            style={{
              background: ROLE_COLORS[role],
              color: ROLE_TEXT_COLORS[role],
            }}
          >
            {ROLE_LABELS[role]}
          </span>
        )}
        <Link href="/" className="btn btn-ghost btn-sm navbar-switch">
          Switch Role
        </Link>
        <button
          className="navbar-hamburger"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {menuOpen && (
        <div className="navbar-mobile-menu">
          {role && (
            <span
              className="navbar-role-badge"
              style={{
                background: ROLE_COLORS[role],
                color: ROLE_TEXT_COLORS[role],
              }}
            >
              {ROLE_LABELS[role]}
            </span>
          )}
          <Link
            href="/"
            className="btn btn-ghost btn-sm"
            onClick={() => setMenuOpen(false)}
          >
            Switch Role
          </Link>
        </div>
      )}

      <style>{`
        .navbar {
          height: 60px;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border);
          background: var(--surface);
          position: sticky;
          top: 0;
          z-index: 100;
          flex-wrap: wrap;
        }

        .navbar-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          flex-shrink: 0;
        }

        .navbar-brand-mark {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background: var(--accent);
          color: #171717;
          font-size: 15px;
          font-weight: 800;
          display: grid;
          place-items: center;
        }

        .navbar-brand-name {
          font-size: 14px;
          font-weight: 800;
          color: var(--accent);
          letter-spacing: 0.08em;
        }

        .navbar-back {
          margin-left: 4px;
        }

        .navbar-center {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          pointer-events: none;
        }

        .navbar-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
          white-space: nowrap;
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-left: auto;
        }

        .navbar-role-badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .navbar-switch {
          font-size: 12px;
        }

        .navbar-hamburger {
          display: none;
          background: none;
          border: none;
          color: var(--text);
          font-size: 18px;
          cursor: pointer;
          padding: 4px;
        }

        .navbar-mobile-menu {
          display: none;
          width: 100%;
          padding: 10px 0;
          border-top: 1px solid var(--border);
          gap: 10px;
          align-items: center;
        }

        @media (max-width: 600px) {
          .navbar {
            height: auto;
            min-height: 56px;
            padding: 10px 16px;
          }

          .navbar-center {
            display: none;
          }

          .navbar-switch {
            display: none;
          }

          .navbar-role-badge {
            display: none;
          }

          .navbar-hamburger {
            display: block;
          }

          .navbar-mobile-menu {
            display: flex;
          }
        }
      `}</style>
    </nav>
  );
}

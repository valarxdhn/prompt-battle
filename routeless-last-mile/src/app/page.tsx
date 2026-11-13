'use client';

import { useRouter } from 'next/navigation';
import { useApp } from '../context/DemoContext';
import type { UserRole } from '../types';

const ROLES: {
  role: UserRole;
  emoji: string;
  name: string;
  description: string;
  path: string;
}[] = [
  {
    role: 'student',
    emoji: '🎓',
    name: 'Student',
    description: 'Find your bus, track live arrival times, set reminders, and get help when stranded.',
    path: '/student',
  },
  {
    role: 'admin',
    emoji: '🛠️',
    name: 'Admin',
    description: 'Monitor fleet status, manage disruptions, dispatch alternatives, and view all routes.',
    path: '/admin',
  },
  {
    role: 'driver',
    emoji: '🚌',
    name: 'Driver / Conductor',
    description: 'Update your status, report delays or breakdowns, and manage passenger occupancy.',
    path: '/driver',
  },
];

export default function HomePage() {
  const router = useRouter();
  const { state, dispatch } = useApp();

  function handleSelectRole(role: UserRole, path: string) {
    dispatch({ type: 'SET_ROLE', payload: role });
    router.push(path);
  }

  return (
    <div className="landing-root">
      {/* Top bar */}
      <header className="landing-topbar">
        <div className="landing-brand">
          <span className="landing-brand-mark">R</span>
          <span className="landing-brand-name">ROUTELESS</span>
        </div>
        <span className="landing-tagline">Rural Transport, Reimagined</span>
      </header>

      {/* Hero */}
      <main className="landing-main">
        <div className="landing-hero">
          <h1 className="landing-hero-title">
            Who are you today?
          </h1>
          <p className="landing-hero-sub">
            Select your role to enter the right dashboard.
          </p>
        </div>

        {/* Role cards */}
        <div className="landing-cards">
          {ROLES.map(({ role, emoji, name, description, path }) => {
            const isActive = state.role === role;
            return (
              <div
                key={role}
                className={`landing-card${isActive ? ' landing-card--active' : ''}`}
                onClick={() => handleSelectRole(role, path)}
              >
                <div className="landing-card-icon">{emoji}</div>
                <h2 className="landing-card-name">{name}</h2>
                <p className="landing-card-desc">{description}</p>
                <button
                  className={`btn${isActive ? ' btn-primary' : ' btn-ghost'} landing-card-btn`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectRole(role, path);
                  }}
                >
                  {isActive ? '✓ Currently Active' : `Enter as ${name}`}
                </button>
                {isActive && (
                  <span className="landing-active-pill">Active Role</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer disclaimer */}
        <footer className="landing-footer">
          ⚠️ Demo data is SIMULATED unless marked{' '}
          <span className="text-success font-bold">ACTUAL</span> or{' '}
          <span style={{ color: 'var(--info)', fontWeight: 700 }}>PREDICTED</span>
        </footer>
      </main>

      <style>{`
        .landing-root {
          min-height: 100vh;
          background: var(--background);
          display: flex;
          flex-direction: column;
        }

        .landing-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 40px;
          height: 64px;
          border-bottom: 1px solid var(--border);
          background: var(--surface);
          flex-shrink: 0;
        }

        .landing-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .landing-brand-mark {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: var(--accent);
          color: #171717;
          font-size: 18px;
          font-weight: 800;
          display: grid;
          place-items: center;
        }

        .landing-brand-name {
          color: var(--accent);
          font-size: 17px;
          font-weight: 800;
          letter-spacing: 0.08em;
        }

        .landing-tagline {
          font-size: 13px;
          color: var(--muted);
          letter-spacing: 0.03em;
        }

        .landing-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 24px 40px;
        }

        .landing-hero {
          text-align: center;
          margin-bottom: 48px;
        }

        .landing-hero-title {
          font-size: clamp(28px, 5vw, 46px);
          font-weight: 800;
          letter-spacing: -0.03em;
          margin: 0 0 12px;
          color: var(--text);
        }

        .landing-hero-sub {
          font-size: 16px;
          color: var(--muted);
          margin: 0;
        }

        .landing-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          width: 100%;
          max-width: 960px;
          margin-bottom: 56px;
        }

        .landing-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          cursor: pointer;
          transition: border-color 180ms, background 180ms, transform 120ms;
          position: relative;
          gap: 10px;
        }

        .landing-card:hover {
          border-color: #44454a;
          background: var(--surface2);
          transform: translateY(-2px);
        }

        .landing-card--active {
          border-color: var(--accent);
          background: rgba(244, 211, 94, 0.05);
        }

        .landing-card-icon {
          font-size: 48px;
          line-height: 1;
          margin-bottom: 6px;
        }

        .landing-card-name {
          font-size: 20px;
          font-weight: 700;
          margin: 0;
          color: var(--text);
        }

        .landing-card-desc {
          font-size: 13px;
          color: var(--muted);
          margin: 0;
          line-height: 1.6;
          flex: 1;
        }

        .landing-card-btn {
          margin-top: 8px;
          width: 100%;
        }

        .landing-active-pill {
          position: absolute;
          top: 12px;
          right: 12px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: var(--accent);
          color: #171717;
          padding: 2px 8px;
          border-radius: 20px;
        }

        .landing-footer {
          font-size: 12px;
          color: var(--muted);
          text-align: center;
          padding: 16px;
          border-top: 1px solid var(--border);
          width: 100%;
          max-width: 960px;
        }

        @media (max-width: 768px) {
          .landing-topbar {
            padding: 0 20px;
          }
          .landing-tagline {
            display: none;
          }
          .landing-cards {
            grid-template-columns: 1fr;
            max-width: 400px;
          }
          .landing-main {
            padding: 40px 16px 32px;
          }
        }
      `}</style>
    </div>
  );
}

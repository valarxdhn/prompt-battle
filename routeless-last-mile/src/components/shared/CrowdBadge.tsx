import type { CrowdLevel } from '../../types';

interface CrowdBadgeProps {
  level: CrowdLevel;
  seats: number;
}

const crowdConfig: Record<CrowdLevel, { label: string; color: string; bg: string; bar: number }> = {
  empty:    { label: 'Empty',    color: 'var(--success)', bg: 'rgba(76,175,132,0.12)',  bar: 5  },
  light:    { label: 'Light',    color: 'var(--success)', bg: 'rgba(76,175,132,0.12)',  bar: 35 },
  moderate: { label: 'Moderate', color: 'var(--warning)', bg: 'rgba(244,164,53,0.12)',  bar: 65 },
  full:     { label: 'Full',     color: 'var(--danger)',  bg: 'rgba(224,82,82,0.12)',   bar: 100},
};

export default function CrowdBadge({ level, seats }: CrowdBadgeProps) {
  const cfg = crowdConfig[level];
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 4, minWidth: 90 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          style={{
            padding: '2px 7px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 700,
            background: cfg.bg,
            color: cfg.color,
            textTransform: 'uppercase',
          }}
        >
          {cfg.label}
        </span>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>
          {seats} seats
        </span>
      </div>
      <div
        style={{
          height: 4,
          borderRadius: 2,
          background: 'var(--border)',
          overflow: 'hidden',
          width: 90,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${cfg.bar}%`,
            background: cfg.color,
            borderRadius: 2,
            transition: 'width 400ms ease',
          }}
        />
      </div>
    </div>
  );
}

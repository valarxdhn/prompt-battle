import type { BusStatus } from '../../types';

interface StatusBadgeProps {
  status: BusStatus;
}

const statusConfig: Record<BusStatus, { label: string; color: string; bg: string }> = {
  'on-time':     { label: 'On Time',     color: 'var(--success)', bg: 'rgba(76,175,132,0.15)' },
  'delayed':     { label: 'Delayed',     color: 'var(--warning)', bg: 'rgba(244,164,53,0.15)' },
  'full':        { label: 'Full',        color: 'var(--danger)',  bg: 'rgba(224,82,82,0.15)'  },
  'unavailable': { label: 'Unavailable', color: 'var(--muted)',   bg: 'rgba(154,155,163,0.15)'},
  'breakdown':   { label: 'Breakdown',   color: 'var(--danger)',  bg: 'rgba(224,82,82,0.15)'  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = statusConfig[status] ?? statusConfig['unavailable'];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.04em',
        background: cfg.bg,
        color: cfg.color,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: cfg.color,
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      {cfg.label}
    </span>
  );
}

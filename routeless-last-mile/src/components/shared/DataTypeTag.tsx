import type { DataType } from '../../types';

interface DataTypeTagProps {
  type: DataType;
  size?: 'sm' | 'md';
}

const typeConfig: Record<DataType, { label: string; icon: string; color: string; bg: string; border: string }> = {
  ACTUAL: {
    label: 'ACTUAL',
    icon: '●',
    color: '#4caf84',
    bg: 'rgba(76, 175, 132, 0.15)',
    border: 'rgba(76, 175, 132, 0.35)',
  },
  PREDICTED: {
    label: 'PREDICTED',
    icon: '◈',
    color: '#5b9cf6',
    bg: 'rgba(91, 156, 246, 0.15)',
    border: 'rgba(91, 156, 246, 0.35)',
  },
  SIMULATED: {
    label: 'SIMULATED / SAMPLE',
    icon: '◇',
    color: '#f4a435',
    bg: 'rgba(244, 164, 53, 0.15)',
    border: 'rgba(244, 164, 53, 0.35)',
  },
};

export default function DataTypeTag({ type, size = 'sm' }: DataTypeTagProps) {
  const cfg = typeConfig[type] || typeConfig.SIMULATED;
  const isSm = size === 'sm';

  return (
    <span
      title={`Data origin: ${cfg.label}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSm ? 4 : 6,
        padding: isSm ? '2px 6px' : '3px 8px',
        borderRadius: 4,
        fontSize: isSm ? 10 : 11,
        fontWeight: 700,
        letterSpacing: '0.04em',
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        userSelect: 'none',
      }}
    >
      <span style={{ fontSize: isSm ? 9 : 11, lineHeight: 1 }}>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

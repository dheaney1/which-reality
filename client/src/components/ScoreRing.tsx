interface Props {
  fraction: number
  color: string
  name: string
  total: number
  max: number
  size?: number
}

export default function ScoreRing({ fraction, color, name, total, max, size = 48 }: Props) {
  const strokeWidth = 4
  const r = (size - strokeWidth * 2) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(1, Math.max(0, fraction)))
  const cx = size / 2

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={cx} cy={cx} r={r}
            fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth}
          />
          <circle
            cx={cx} cy={cx} r={r}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.45s ease' }}
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-xs font-bold"
          style={{ color }}
        >
          {name[0]}
        </span>
      </div>
      <span className="text-xs font-medium text-gray-700 leading-none">{name}</span>
      <span className="text-xs text-gray-400 leading-none">
        {total}/{max}
      </span>
    </div>
  )
}

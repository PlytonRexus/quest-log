interface ConnectionLineProps {
  x1: number
  y1: number
  x2: number
  y2: number
  label?: string
}

export function ConnectionLine({ x1, y1, x2, y2, label }: ConnectionLineProps) {
  const midX = (x1 + x2) / 2
  const midY = (y1 + y2) / 2

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      data-testid="connection-line"
    >
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="#06b6d4"
        strokeWidth={2}
        strokeDasharray="6 3"
        opacity={0.6}
      />
      {label && (
        <text
          x={midX}
          y={midY - 8}
          textAnchor="middle"
          fill="#06b6d4"
          fontSize={10}
          opacity={0.8}
        >
          {label}
        </text>
      )}
    </svg>
  )
}

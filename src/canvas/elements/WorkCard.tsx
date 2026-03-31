interface WorkCardProps {
  title: string
  medium: string
  score: number | null
}

const MEDIUM_ICONS: Record<string, string> = {
  anime: '\u25B6',
  film: '\u25C9',
  novel: '\u25A0',
  manga: '\u25C6',
  game: '\u25B2',
  tv: '\u25CB',
}

export function WorkCard({ title, medium, score }: WorkCardProps) {
  const icon = MEDIUM_ICONS[medium] ?? '\u25CF'

  return (
    <div className="w-full h-full rounded-lg bg-surface p-3 border border-border overflow-hidden" aria-label={`${title} work card`} data-testid="work-card">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-star truncate flex-1">{title}</p>
        {score !== null && (
          <span className="text-xs font-bold text-ember shrink-0">{score.toFixed(1)}</span>
        )}
      </div>
      <p className="text-[10px] text-star/40 mt-0.5">
        <span className="mr-1">{icon}</span>
        {medium}
      </p>
    </div>
  )
}

interface TropeCardProps {
  name: string
  category: string
  description?: string
  color?: string
}

const CATEGORY_COLORS: Record<string, string> = {
  premise_structural: '#3B82F6',
  character_archetype: '#A855F7',
  pacing_mechanic: '#22C55E',
  emotional_dynamic: '#EF4444',
  world_building: '#F59E0B',
  narrative_technique: '#06B6D4',
  relationship_pattern: '#EC4899',
  conflict_type: '#F97316',
}

export function TropeCard({ name, category, description, color }: TropeCardProps) {
  const borderColor = color ?? CATEGORY_COLORS[category] ?? '#4B5563'

  return (
    <div
      className="w-full h-full rounded-lg bg-surface p-3 overflow-hidden"
      style={{ borderLeft: `4px solid ${borderColor}` }}
      aria-label={`${name} trope card`}
      data-testid="trope-card"
    >
      <p className="text-sm font-semibold text-star truncate">{name}</p>
      <p className="text-[10px] text-star/40 mt-0.5">{category.replace(/_/g, ' ')}</p>
      {description && (
        <p className="text-xs text-star/60 mt-1 line-clamp-3">{description}</p>
      )}
    </div>
  )
}

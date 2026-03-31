import {
  insertDimension, insertWork, insertTrope,
  linkWorkTrope, insertTropeRelation, getTropes, getWorks,
} from './dal'
import { exec, queryOne } from './connection'

// --- Dimensions ---

const PRIMARY_DIMENSIONS = [
  { name: 'Incentive Coherence', weight: 5.0, isLoadBearing: 1, framework: 'primary' as const, description: 'Characters act from believable motivations that track across the story' },
  { name: 'World Causality & Internal Logic', weight: 5.0, isLoadBearing: 1, framework: 'primary' as const, description: 'The world operates by consistent, inferable rules' },
  { name: 'Multi-Threaded or Layered Narrative', weight: 4.0, isLoadBearing: 0, framework: 'primary' as const, description: 'Multiple plot threads or thematic layers that interconnect' },
  { name: 'Meaningful Stakes With Real Cost', weight: 4.0, isLoadBearing: 0, framework: 'primary' as const, description: 'Consequences are permanent and felt by the characters and audience' },
  { name: 'Systemic World-Building', weight: 4.0, isLoadBearing: 0, framework: 'primary' as const, description: 'The world has functional systems: political, economic, ecological' },
  { name: 'Moral Complexity & Grey Zones', weight: 4.0, isLoadBearing: 0, framework: 'primary' as const, description: 'No clear hero/villain binary; moral positions are debatable' },
  { name: 'Power Justification', weight: 4.5, isLoadBearing: 1, framework: 'primary' as const, description: 'Power and competence must be earned, explained, or cost something' },
  { name: 'Character Depth & Psychological Realism', weight: 5.0, isLoadBearing: 0, framework: 'primary' as const, description: 'Characters have internal worlds, contradictions, growth arcs' },
  { name: 'Coincidence Integration', weight: 3.5, isLoadBearing: 0, framework: 'primary' as const, description: 'When coincidences occur, they are woven into the fabric of the narrative' },
  { name: 'Narrative Velocity & Drift Intolerance', weight: 3.0, isLoadBearing: 0, framework: 'primary' as const, description: 'Every scene must earn its place; tolerance for filler is low' },
  { name: 'Emotional Authenticity & Consequence', weight: 3.5, isLoadBearing: 0, framework: 'primary' as const, description: 'Emotions are proportional, earned, and have narrative weight' },
  { name: 'Aesthetic-Substance Coherence', weight: 2.5, isLoadBearing: 0, framework: 'primary' as const, description: 'Visual or stylistic choices reinforce thematic substance' },
]

const COMFORT_DIMENSIONS = [
  { name: 'Emotional Safety', weight: 5.0, isLoadBearing: 0, framework: 'comfort' as const, description: 'Reader/viewer can trust the story will not betray them gratuitously' },
  { name: 'Narrative Reliability', weight: 4.5, isLoadBearing: 0, framework: 'comfort' as const, description: 'Confidence that promises made early will be kept' },
  { name: 'Protagonist Viability', weight: 4.5, isLoadBearing: 0, framework: 'comfort' as const, description: 'The protagonist can plausibly navigate their challenges' },
  { name: 'Conflict Register', weight: 4.0, isLoadBearing: 0, framework: 'comfort' as const, description: 'Conflict is present but calibrated, not relentless trauma' },
  { name: 'Romance Architecture', weight: 3.5, isLoadBearing: 0, framework: 'comfort' as const, description: 'Romantic elements are structured, earned, and satisfying' },
  { name: 'Setting & World Character', weight: 3.0, isLoadBearing: 0, framework: 'comfort' as const, description: 'The world itself feels like a comforting or inviting place' },
  { name: 'Language & Accessibility', weight: 2.5, isLoadBearing: 0, framework: 'comfort' as const, description: 'Prose is accessible, witty, or warm without being condescending' },
]

// --- Works ---

interface SeedWork {
  title: string
  medium: string
  year: number | null
  primaryScore: number | null
  comfortScore: number | null
  consumptionMode: string
}

const PRIMARY_WORKS: SeedWork[] = [
  { title: 'Attack on Titan', medium: 'anime', year: 2013, primaryScore: 9.6, comfortScore: null, consumptionMode: 'legitimacy' },
  { title: 'Death Note', medium: 'anime', year: 2006, primaryScore: 9.3, comfortScore: null, consumptionMode: 'legitimacy' },
  { title: 'The Hunt', medium: 'film', year: 2012, primaryScore: 9.3, comfortScore: null, consumptionMode: 'legitimacy' },
  { title: 'Parasite', medium: 'film', year: 2019, primaryScore: 9.2, comfortScore: null, consumptionMode: 'legitimacy' },
  { title: 'Your Name', medium: 'film', year: 2016, primaryScore: 9.2, comfortScore: null, consumptionMode: 'legitimacy' },
  { title: 'Dune', medium: 'film', year: 2021, primaryScore: 9.1, comfortScore: null, consumptionMode: 'legitimacy' },
  { title: 'Code Geass', medium: 'anime', year: 2006, primaryScore: 9.0, comfortScore: null, consumptionMode: 'legitimacy' },
  { title: 'The Social Network', medium: 'film', year: 2010, primaryScore: 9.0, comfortScore: null, consumptionMode: 'legitimacy' },
  { title: 'The Prestige', medium: 'film', year: 2006, primaryScore: 8.6, comfortScore: null, consumptionMode: 'legitimacy' },
  { title: 'The Shawshank Redemption', medium: 'film', year: 1994, primaryScore: 7.5, comfortScore: null, consumptionMode: 'legitimacy' },
  { title: 'The Matrix', medium: 'film', year: 1999, primaryScore: 7.5, comfortScore: null, consumptionMode: 'legitimacy' },
  { title: 'Demon Slayer', medium: 'anime', year: 2019, primaryScore: 7.0, comfortScore: null, consumptionMode: 'legitimacy' },
  { title: 'I Am a Hero', medium: 'anime', year: 2016, primaryScore: 6.9, comfortScore: null, consumptionMode: 'legitimacy' },
  { title: 'Solo Leveling', medium: 'anime', year: 2024, primaryScore: 6.0, comfortScore: null, consumptionMode: 'legitimacy' },
  { title: 'KGF', medium: 'film', year: 2018, primaryScore: 4.0, comfortScore: null, consumptionMode: 'legitimacy' },
]

const COMFORT_WORKS: SeedWork[] = [
  { title: 'Spy x Family', medium: 'anime', year: 2022, primaryScore: null, comfortScore: 9.2, consumptionMode: 'hospitality' },
  { title: 'HPMOR', medium: 'book', year: 2015, primaryScore: null, comfortScore: 9.0, consumptionMode: 'hospitality' },
  { title: 'Beware of Chicken', medium: 'book', year: 2021, primaryScore: null, comfortScore: 9.0, consumptionMode: 'hospitality' },
  { title: 'Suits', medium: 'series', year: 2011, primaryScore: null, comfortScore: 8.5, consumptionMode: 'hospitality' },
  { title: 'Bridgerton', medium: 'series', year: 2020, primaryScore: null, comfortScore: 8.5, consumptionMode: 'hospitality' },
  { title: 'Downton Abbey', medium: 'series', year: 2010, primaryScore: null, comfortScore: 8.5, consumptionMode: 'hospitality' },
  { title: 'Harry Potter', medium: 'book', year: 1997, primaryScore: null, comfortScore: 8.5, consumptionMode: 'hospitality' },
  { title: 'Crazy Rich Asians', medium: 'film', year: 2018, primaryScore: null, comfortScore: 8.2, consumptionMode: 'hospitality' },
  { title: 'Big Bang Theory', medium: 'series', year: 2007, primaryScore: null, comfortScore: 8.0, consumptionMode: 'hospitality' },
  { title: 'Good Omens', medium: 'series', year: 2019, primaryScore: null, comfortScore: 6.0, consumptionMode: 'hospitality' },
  { title: 'The House in the Cerulean Sea', medium: 'book', year: 2020, primaryScore: null, comfortScore: 5.0, consumptionMode: 'hospitality' },
  { title: 'Looking for Alaska', medium: 'book', year: 2005, primaryScore: null, comfortScore: 4.5, consumptionMode: 'hospitality' },
  { title: '13 Reasons Why', medium: 'series', year: 2017, primaryScore: null, comfortScore: 2.0, consumptionMode: 'hospitality' },
]

// --- Tropes ---

interface SeedTrope {
  name: string
  category: string
  description: string
}

const TROPES: SeedTrope[] = [
  // Premise/Structural (12)
  { name: 'cat-and-mouse escalation', category: 'premise_structural', description: 'Antagonist and protagonist engage in escalating tactical exchanges' },
  { name: 'political intrigue', category: 'premise_structural', description: 'Power struggles within systems of governance or hierarchy' },
  { name: 'class warfare', category: 'premise_structural', description: 'Conflict driven by socioeconomic stratification' },
  { name: 'epic with intimate core', category: 'premise_structural', description: 'Grand scale narrative anchored by deeply personal character stakes' },
  { name: 'time manipulation', category: 'premise_structural', description: 'Temporal mechanics as a core plot device' },
  { name: 'cosmic scale', category: 'premise_structural', description: 'Narrative scope extends to existential or civilizational proportions' },
  { name: 'chosen one (justified)', category: 'premise_structural', description: 'Protagonist is special, but the narrative earns and explains why' },
  { name: 'found family', category: 'premise_structural', description: 'Characters form bonds that replace or supplement biological family' },
  { name: 'locked room mystery', category: 'premise_structural', description: 'Confined setting forces deduction and reveals character' },
  { name: 'institutional drama', category: 'premise_structural', description: 'Conflict within or against formal institutions' },
  { name: 'war of ideologies', category: 'premise_structural', description: 'Central conflict between incompatible worldviews or philosophies' },
  { name: 'survival pressure', category: 'premise_structural', description: 'Characters face existential threats that demand adaptation' },

  // Character Archetypes (9)
  { name: 'morally grey antihero', category: 'character_archetype', description: 'Protagonist whose morality is genuinely debatable' },
  { name: 'broken genius', category: 'character_archetype', description: 'Brilliant character whose intelligence comes at personal cost' },
  { name: 'competent-from-pain', category: 'character_archetype', description: 'Character whose competence is forged through suffering' },
  { name: 'villain-who-believes-hero', category: 'character_archetype', description: 'Antagonist with a coherent moral framework they genuinely believe in' },
  { name: 'intelligent underdog', category: 'character_archetype', description: 'Outmatched protagonist who succeeds through wit, not power' },
  { name: 'emotionally functional protagonist', category: 'character_archetype', description: 'Protagonist with healthy emotional processing, rare in genre fiction' },
  { name: 'competent ensemble', category: 'character_archetype', description: 'Multiple characters who are each distinctly capable' },
  { name: 'wisened mentor', category: 'character_archetype', description: 'Guide figure with hard-won wisdom and genuine depth' },
  { name: 'tragic strategist', category: 'character_archetype', description: 'Character who sacrifices personally for strategic outcomes' },

  // Pacing (7)
  { name: 'slow burn with pressurization', category: 'pacing_mechanic', description: 'Gradual build with steadily increasing tension' },
  { name: 'rapid-fire tactical dialogue', category: 'pacing_mechanic', description: 'Fast exchanges where every line advances position or information' },
  { name: 'ticking clock', category: 'pacing_mechanic', description: 'External time pressure driving narrative urgency' },
  { name: 'loop-and-escalate', category: 'pacing_mechanic', description: 'Repeated structural pattern with each iteration raising stakes' },
  { name: 'episodic payoff', category: 'pacing_mechanic', description: 'Regular satisfying resolution points within larger arc' },
  { name: 'tight structure (no waste)', category: 'pacing_mechanic', description: 'Every scene and subplot earns its place in the narrative' },
  { name: 'building dread', category: 'pacing_mechanic', description: 'Mounting atmospheric tension toward inevitable confrontation' },
]

// Work-Trope links: maps work titles to their key tropes with confidence
const WORK_TROPE_LINKS: Record<string, { trope: string; confidence: number }[]> = {
  'Attack on Titan': [
    { trope: 'political intrigue', confidence: 0.95 },
    { trope: 'morally grey antihero', confidence: 0.9 },
    { trope: 'war of ideologies', confidence: 0.95 },
    { trope: 'survival pressure', confidence: 0.9 },
    { trope: 'epic with intimate core', confidence: 0.85 },
    { trope: 'building dread', confidence: 0.85 },
  ],
  'Death Note': [
    { trope: 'cat-and-mouse escalation', confidence: 0.98 },
    { trope: 'broken genius', confidence: 0.9 },
    { trope: 'morally grey antihero', confidence: 0.95 },
    { trope: 'rapid-fire tactical dialogue', confidence: 0.85 },
    { trope: 'ticking clock', confidence: 0.7 },
  ],
  'The Hunt': [
    { trope: 'institutional drama', confidence: 0.9 },
    { trope: 'competent-from-pain', confidence: 0.85 },
    { trope: 'building dread', confidence: 0.9 },
  ],
  'Parasite': [
    { trope: 'class warfare', confidence: 0.98 },
    { trope: 'locked room mystery', confidence: 0.7 },
    { trope: 'tight structure (no waste)', confidence: 0.95 },
    { trope: 'building dread', confidence: 0.85 },
  ],
  'Your Name': [
    { trope: 'time manipulation', confidence: 0.95 },
    { trope: 'epic with intimate core', confidence: 0.95 },
    { trope: 'ticking clock', confidence: 0.8 },
  ],
  'Dune': [
    { trope: 'political intrigue', confidence: 0.95 },
    { trope: 'chosen one (justified)', confidence: 0.9 },
    { trope: 'cosmic scale', confidence: 0.9 },
    { trope: 'slow burn with pressurization', confidence: 0.85 },
    { trope: 'war of ideologies', confidence: 0.8 },
  ],
  'Code Geass': [
    { trope: 'cat-and-mouse escalation', confidence: 0.9 },
    { trope: 'morally grey antihero', confidence: 0.95 },
    { trope: 'tragic strategist', confidence: 0.9 },
    { trope: 'political intrigue', confidence: 0.85 },
    { trope: 'loop-and-escalate', confidence: 0.8 },
  ],
  'The Social Network': [
    { trope: 'institutional drama', confidence: 0.85 },
    { trope: 'broken genius', confidence: 0.9 },
    { trope: 'rapid-fire tactical dialogue', confidence: 0.95 },
    { trope: 'tight structure (no waste)', confidence: 0.9 },
  ],
  'The Prestige': [
    { trope: 'cat-and-mouse escalation', confidence: 0.9 },
    { trope: 'locked room mystery', confidence: 0.75 },
    { trope: 'loop-and-escalate', confidence: 0.85 },
    { trope: 'tight structure (no waste)', confidence: 0.9 },
  ],
  'The Shawshank Redemption': [
    { trope: 'institutional drama', confidence: 0.9 },
    { trope: 'competent-from-pain', confidence: 0.85 },
    { trope: 'slow burn with pressurization', confidence: 0.9 },
  ],
  'The Matrix': [
    { trope: 'chosen one (justified)', confidence: 0.8 },
    { trope: 'cosmic scale', confidence: 0.7 },
    { trope: 'war of ideologies', confidence: 0.75 },
  ],
  'Demon Slayer': [
    { trope: 'competent-from-pain', confidence: 0.85 },
    { trope: 'found family', confidence: 0.8 },
    { trope: 'episodic payoff', confidence: 0.85 },
  ],
  'Solo Leveling': [
    { trope: 'chosen one (justified)', confidence: 0.6 },
    { trope: 'loop-and-escalate', confidence: 0.9 },
    { trope: 'survival pressure', confidence: 0.7 },
  ],
  'KGF': [
    { trope: 'chosen one (justified)', confidence: 0.5 },
    { trope: 'epic with intimate core', confidence: 0.4 },
  ],
  'Spy x Family': [
    { trope: 'found family', confidence: 0.98 },
    { trope: 'competent ensemble', confidence: 0.85 },
    { trope: 'episodic payoff', confidence: 0.9 },
    { trope: 'emotionally functional protagonist', confidence: 0.8 },
  ],
  'HPMOR': [
    { trope: 'broken genius', confidence: 0.9 },
    { trope: 'intelligent underdog', confidence: 0.85 },
    { trope: 'cat-and-mouse escalation', confidence: 0.8 },
    { trope: 'rapid-fire tactical dialogue', confidence: 0.8 },
  ],
  'Beware of Chicken': [
    { trope: 'found family', confidence: 0.9 },
    { trope: 'emotionally functional protagonist', confidence: 0.95 },
    { trope: 'episodic payoff', confidence: 0.85 },
  ],
  'Suits': [
    { trope: 'institutional drama', confidence: 0.95 },
    { trope: 'rapid-fire tactical dialogue', confidence: 0.9 },
    { trope: 'intelligent underdog', confidence: 0.8 },
    { trope: 'competent ensemble', confidence: 0.85 },
  ],
  'Bridgerton': [
    { trope: 'institutional drama', confidence: 0.7 },
    { trope: 'slow burn with pressurization', confidence: 0.85 },
    { trope: 'class warfare', confidence: 0.6 },
  ],
  'Downton Abbey': [
    { trope: 'institutional drama', confidence: 0.95 },
    { trope: 'class warfare', confidence: 0.85 },
    { trope: 'competent ensemble', confidence: 0.8 },
    { trope: 'slow burn with pressurization', confidence: 0.8 },
  ],
  'Harry Potter': [
    { trope: 'chosen one (justified)', confidence: 0.85 },
    { trope: 'found family', confidence: 0.9 },
    { trope: 'wisened mentor', confidence: 0.9 },
    { trope: 'episodic payoff', confidence: 0.85 },
  ],
  'Crazy Rich Asians': [
    { trope: 'class warfare', confidence: 0.8 },
    { trope: 'found family', confidence: 0.6 },
    { trope: 'institutional drama', confidence: 0.5 },
  ],
  'Big Bang Theory': [
    { trope: 'found family', confidence: 0.75 },
    { trope: 'episodic payoff', confidence: 0.9 },
    { trope: 'broken genius', confidence: 0.6 },
  ],
  'Good Omens': [
    { trope: 'found family', confidence: 0.7 },
    { trope: 'cosmic scale', confidence: 0.6 },
    { trope: 'competent ensemble', confidence: 0.65 },
  ],
}

// Trope relations: pairs of tropes that enhance or relate to each other
const TROPE_RELATIONS: { a: string; b: string; type: string; weight: number }[] = [
  { a: 'political intrigue', b: 'institutional drama', type: 'enhances', weight: 0.9 },
  { a: 'political intrigue', b: 'war of ideologies', type: 'enhances', weight: 0.85 },
  { a: 'cat-and-mouse escalation', b: 'rapid-fire tactical dialogue', type: 'enhances', weight: 0.8 },
  { a: 'cat-and-mouse escalation', b: 'ticking clock', type: 'enhances', weight: 0.75 },
  { a: 'class warfare', b: 'institutional drama', type: 'enhances', weight: 0.8 },
  { a: 'morally grey antihero', b: 'tragic strategist', type: 'related', weight: 0.85 },
  { a: 'morally grey antihero', b: 'villain-who-believes-hero', type: 'mirrors', weight: 0.9 },
  { a: 'broken genius', b: 'competent-from-pain', type: 'related', weight: 0.7 },
  { a: 'slow burn with pressurization', b: 'building dread', type: 'enhances', weight: 0.85 },
  { a: 'found family', b: 'emotionally functional protagonist', type: 'enhances', weight: 0.7 },
  { a: 'epic with intimate core', b: 'cosmic scale', type: 'related', weight: 0.75 },
  { a: 'loop-and-escalate', b: 'episodic payoff', type: 'related', weight: 0.65 },
  { a: 'tight structure (no waste)', b: 'rapid-fire tactical dialogue', type: 'enhances', weight: 0.7 },
  { a: 'survival pressure', b: 'competent-from-pain', type: 'enhances', weight: 0.8 },
  { a: 'intelligent underdog', b: 'competent-from-pain', type: 'related', weight: 0.7 },
]

// --- Seed functions ---

export async function seedDimensions(): Promise<void> {
  for (const dim of [...PRIMARY_DIMENSIONS, ...COMFORT_DIMENSIONS]) {
    await insertDimension(dim)
  }
}

export async function seedWorks(): Promise<void> {
  for (const work of [...PRIMARY_WORKS, ...COMFORT_WORKS]) {
    await insertWork({
      title: work.title,
      medium: work.medium,
      year: work.year,
      coverUrl: null,
      primaryScore: work.primaryScore,
      comfortScore: work.comfortScore,
      consumptionMode: work.consumptionMode,
      dateConsumed: null,
      notes: null,
    })
  }
}

export async function seedTropes(): Promise<void> {
  for (const trope of TROPES) {
    await insertTrope(trope)
  }
}

export async function seedWorkTropeLinks(): Promise<void> {
  const works = await getWorks()
  const tropes = await getTropes()

  const workByTitle = new Map(works.map((w) => [w.title, w]))
  const tropeByName = new Map(tropes.map((t) => [t.name, t]))

  for (const [workTitle, links] of Object.entries(WORK_TROPE_LINKS)) {
    const work = workByTitle.get(workTitle)
    if (!work) continue

    for (const link of links) {
      const trope = tropeByName.get(link.trope)
      if (!trope) continue
      await linkWorkTrope(work.id, trope.id, link.confidence, 'seed')
    }
  }
}

export async function seedTropeRelations(): Promise<void> {
  const tropes = await getTropes()
  const tropeByName = new Map(tropes.map((t) => [t.name, t]))

  for (const rel of TROPE_RELATIONS) {
    const a = tropeByName.get(rel.a)
    const b = tropeByName.get(rel.b)
    if (!a || !b) continue
    await insertTropeRelation(a.id, b.id, rel.type, rel.weight)
  }
}

export async function seedUserProgress(): Promise<void> {
  await exec(
    `INSERT INTO userProgress (totalXp, worksLogged, tropesDiscovered, fogPercentRevealed, lastActivity)
     VALUES (?, ?, ?, ?, ?)`,
    [0, 0, 0, 0.0, new Date().toISOString()],
  )
}

export async function runSeed(): Promise<void> {
  // Check if already seeded (idempotent)
  const existing = await queryOne<{ count: number }>(
    'SELECT COUNT(*) as count FROM dimensions',
  )
  if (existing && existing.count > 0) return

  await seedDimensions()
  await seedWorks()
  await seedTropes()
  await seedWorkTropeLinks()
  await seedTropeRelations()
  await seedUserProgress()
}

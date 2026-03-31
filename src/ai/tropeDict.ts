// Curated trope dictionary for narrative analysis
// 200+ tropes organized by category with descriptions and aliases

export type TropeCategory =
  | 'premise_structural'
  | 'character_archetype'
  | 'pacing_mechanic'
  | 'emotional_dynamic'
  | 'world_building'
  | 'narrative_technique'
  | 'relationship_pattern'
  | 'conflict_type'

export interface TropeDictEntry {
  name: string
  category: TropeCategory
  description: string
  aliases: string[]
}

export const CATEGORY_COLORS: Record<TropeCategory, string> = {
  premise_structural: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  character_archetype: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  pacing_mechanic: 'bg-green-500/20 text-green-300 border-green-500/30',
  emotional_dynamic: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  world_building: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  narrative_technique: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  relationship_pattern: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  conflict_type: 'bg-red-500/20 text-red-300 border-red-500/30',
}

export const CATEGORY_LABELS: Record<TropeCategory, string> = {
  premise_structural: 'Premise/Structure',
  character_archetype: 'Character',
  pacing_mechanic: 'Pacing',
  emotional_dynamic: 'Emotional',
  world_building: 'World',
  narrative_technique: 'Technique',
  relationship_pattern: 'Relationship',
  conflict_type: 'Conflict',
}

export const TROPE_DICT: TropeDictEntry[] = [
  // =========================================================================
  // PREMISE / STRUCTURAL (40+ tropes)
  // =========================================================================
  { name: 'cat-and-mouse escalation', category: 'premise_structural', description: 'Two adversaries engage in increasingly clever moves and counter-moves', aliases: ['mind games', 'intellectual duel'] },
  { name: 'political intrigue', category: 'premise_structural', description: 'Complex power plays, alliances, and betrayals in political settings', aliases: ['court intrigue', 'political maneuvering', 'scheming'] },
  { name: 'class warfare', category: 'premise_structural', description: 'Conflict driven by socioeconomic class divisions', aliases: ['class struggle', 'rich vs poor', 'inequality'] },
  { name: 'epic with intimate core', category: 'premise_structural', description: 'Grand-scale story anchored by deeply personal character stakes', aliases: ['personal stakes in grand conflict'] },
  { name: 'time manipulation', category: 'premise_structural', description: 'Story uses time travel, loops, or nonlinear time as a core mechanic', aliases: ['time travel', 'time loop', 'temporal paradox'] },
  { name: 'cosmic scale', category: 'premise_structural', description: 'Story operates at civilizational, planetary, or universal scope', aliases: ['grand scale', 'space opera', 'galaxy spanning'] },
  { name: 'chosen one (justified)', category: 'premise_structural', description: 'Protagonist is destined or special, but the narrative earns or subverts this', aliases: ['prophecy fulfilled', 'earned destiny'] },
  { name: 'found family', category: 'premise_structural', description: 'Characters form familial bonds outside blood relations', aliases: ['chosen family', 'makeshift family', 'bonds of choice'] },
  { name: 'locked room mystery', category: 'premise_structural', description: 'Mystery constrained to a limited setting or set of suspects', aliases: ['closed circle', 'whodunit', 'confined mystery'] },
  { name: 'institutional drama', category: 'premise_structural', description: 'Story centered on the workings and politics of an institution', aliases: ['organizational drama', 'workplace intrigue'] },
  { name: 'war of ideologies', category: 'premise_structural', description: 'Central conflict between opposing belief systems or philosophies', aliases: ['ideological conflict', 'clash of values'] },
  { name: 'survival pressure', category: 'premise_structural', description: 'Characters face life-threatening circumstances requiring resourcefulness', aliases: ['survival horror', 'fight for survival', 'life or death'] },
  { name: 'heist or con', category: 'premise_structural', description: 'Elaborate theft or deception requiring a coordinated plan', aliases: ['caper', 'Ocean\u0027s Eleven style', 'elaborate scheme'] },
  { name: 'dual identity', category: 'premise_structural', description: 'Character maintains two separate identities or lives', aliases: ['secret identity', 'double life', 'mask'] },
  { name: 'uprising or revolution', category: 'premise_structural', description: 'Oppressed group organizes to overthrow a ruling power', aliases: ['rebellion', 'revolt', 'resistance movement'] },
  { name: 'tournament arc', category: 'premise_structural', description: 'Characters compete in a structured competition with escalating stakes', aliases: ['competition', 'contest', 'championship'] },
  { name: 'mystery box', category: 'premise_structural', description: 'Central enigma drives the plot, revealing layers over time', aliases: ['puzzle narrative', 'unfolding mystery'] },
  { name: 'parallel narratives', category: 'premise_structural', description: 'Multiple storylines run simultaneously and eventually converge', aliases: ['interweaving stories', 'multi-thread'] },
  { name: 'fish out of water', category: 'premise_structural', description: 'Protagonist placed in an unfamiliar environment and must adapt', aliases: ['stranger in strange land', 'isekai'] },
  { name: 'prophecy and fate', category: 'premise_structural', description: 'Destiny or prophecy shapes character actions and plot outcomes', aliases: ['predetermined fate', 'destiny'] },
  { name: 'power corrupts', category: 'premise_structural', description: 'Gaining power leads to moral compromise or transformation', aliases: ['corruption arc', 'descent into tyranny'] },
  { name: 'rags to riches', category: 'premise_structural', description: 'Character rises from poverty or obscurity to wealth or prominence', aliases: ['underdog rises', 'zero to hero'] },
  { name: 'riches to rags', category: 'premise_structural', description: 'Character falls from a position of privilege or power', aliases: ['fall from grace', 'downfall'] },
  { name: 'nested narrative', category: 'premise_structural', description: 'Story within a story, with framing devices or meta-layers', aliases: ['frame narrative', 'story within story', 'meta-narrative'] },
  { name: 'last stand', category: 'premise_structural', description: 'Characters make a final, desperate defense against overwhelming odds', aliases: ['holding the line', 'final battle', 'siege'] },
  { name: 'escape narrative', category: 'premise_structural', description: 'Primary goal is escaping imprisonment, danger, or oppression', aliases: ['prison break', 'great escape'] },
  { name: 'quest narrative', category: 'premise_structural', description: 'Characters embark on a journey to achieve a specific goal', aliases: ['hero\u0027s journey', 'adventure quest', 'odyssey'] },
  { name: 'social experiment', category: 'premise_structural', description: 'Characters placed in an artificial situation to test behavior', aliases: ['psychological experiment', 'death game'] },
  { name: 'unreliable reality', category: 'premise_structural', description: 'The nature of reality itself is questioned within the narrative', aliases: ['simulation theory', 'dream within dream', 'what is real'] },
  { name: 'legacy and inheritance', category: 'premise_structural', description: 'Story driven by what is passed down between generations', aliases: ['generational saga', 'family legacy'] },
  { name: 'countdown pressure', category: 'premise_structural', description: 'A deadline or timer creates escalating urgency', aliases: ['race against time', 'ticking bomb'] },
  { name: 'hidden world', category: 'premise_structural', description: 'A secret society or world exists alongside the mundane', aliases: ['secret society', 'masquerade', 'hidden realm'] },
  { name: 'reconstruction', category: 'premise_structural', description: 'After deconstruction of genre tropes, the story rebuilds with earned sincerity', aliases: ['genre reconstruction', 'earned optimism'] },
  { name: 'deconstruction', category: 'premise_structural', description: 'Genre conventions are examined, subverted, or exposed', aliases: ['genre subversion', 'meta-commentary'] },
  { name: 'cold open mystery', category: 'premise_structural', description: 'Story opens with a dramatic scene, then traces how events led there', aliases: ['in medias res', 'how we got here'] },
  { name: 'switcheroo reveal', category: 'premise_structural', description: 'A major twist recontextualizes everything previously shown', aliases: ['plot twist', 'paradigm shift', 'perspective flip'] },

  // =========================================================================
  // CHARACTER ARCHETYPE (35+ tropes)
  // =========================================================================
  { name: 'morally grey antihero', category: 'character_archetype', description: 'Protagonist with questionable ethics who the audience roots for anyway', aliases: ['anti-hero', 'dark protagonist', 'flawed hero'] },
  { name: 'broken genius', category: 'character_archetype', description: 'Brilliant mind undermined by personal flaws or trauma', aliases: ['tortured genius', 'brilliant but damaged'] },
  { name: 'competent-from-pain', category: 'character_archetype', description: 'Character whose abilities come from overcoming hardship', aliases: ['forged in suffering', 'trauma-forged'] },
  { name: 'villain-who-believes-hero', category: 'character_archetype', description: 'Antagonist genuinely convinced they are doing the right thing', aliases: ['well-intentioned extremist', 'sympathetic villain'] },
  { name: 'intelligent underdog', category: 'character_archetype', description: 'Outmatched character who compensates with wit and strategy', aliases: ['clever underdog', 'brains over brawn'] },
  { name: 'emotionally functional protagonist', category: 'character_archetype', description: 'Hero who is emotionally healthy and processes feelings maturely', aliases: ['emotionally mature hero', 'healthy protagonist'] },
  { name: 'competent ensemble', category: 'character_archetype', description: 'Group where every member brings genuine expertise', aliases: ['team of experts', 'skilled team'] },
  { name: 'wisened mentor', category: 'character_archetype', description: 'Experienced guide who shapes the protagonist through wisdom', aliases: ['sage mentor', 'wise teacher'] },
  { name: 'tragic strategist', category: 'character_archetype', description: 'Brilliant planner whose plans succeed at terrible personal cost', aliases: ['chess master', 'burden of command'] },
  { name: 'reluctant leader', category: 'character_archetype', description: 'Character thrust into leadership despite not wanting the role', aliases: ['accidental leader', 'chosen reluctantly'] },
  { name: 'fallen hero', category: 'character_archetype', description: 'Once-noble character who has been broken or corrupted', aliases: ['corrupted hero', 'dark knight'] },
  { name: 'trickster', category: 'character_archetype', description: 'Character who uses deception, humor, and cleverness as tools', aliases: ['con artist', 'rogue', 'prankster'] },
  { name: 'stoic warrior', category: 'character_archetype', description: 'Fighter who masks emotion behind discipline and duty', aliases: ['silent protector', 'samurai archetype'] },
  { name: 'charismatic leader', category: 'character_archetype', description: 'Leader who inspires through personal magnetism and vision', aliases: ['inspiring commander', 'born leader'] },
  { name: 'naive idealist', category: 'character_archetype', description: 'Character driven by pure ideals that clash with harsh reality', aliases: ['wide-eyed idealist', 'innocent dreamer'] },
  { name: 'cynical realist', category: 'character_archetype', description: 'Character who sees the world as it is, not as they wish it were', aliases: ['jaded pragmatist', 'world-weary'] },
  { name: 'loyal second', category: 'character_archetype', description: 'Devoted companion or lieutenant who anchors the protagonist', aliases: ['faithful companion', 'right-hand person'] },
  { name: 'magnificent bastard', category: 'character_archetype', description: 'Antagonist who is admired for sheer competence and style', aliases: ['classy villain', 'elegant antagonist'] },
  { name: 'sacrificial protector', category: 'character_archetype', description: 'Character whose arc culminates in self-sacrifice for others', aliases: ['guardian angel', 'protective sacrifice'] },
  { name: 'hidden depths', category: 'character_archetype', description: 'Character who appears simple but reveals unexpected complexity', aliases: ['more than meets the eye', 'deceptively deep'] },
  { name: 'reformed villain', category: 'character_archetype', description: 'Former antagonist who genuinely changes sides', aliases: ['heel-face turn', 'redemption arc'] },
  { name: 'child prodigy', category: 'character_archetype', description: 'Young character with extraordinary abilities or maturity', aliases: ['gifted child', 'young genius'] },
  { name: 'gentle giant', category: 'character_archetype', description: 'Physically imposing character who is kind and peaceful', aliases: ['big softie', 'tender strength'] },
  { name: 'mad scientist', category: 'character_archetype', description: 'Brilliant mind who pushes boundaries of ethics in pursuit of knowledge', aliases: ['unhinged genius', 'obsessive researcher'] },
  { name: 'ice queen thawing', category: 'character_archetype', description: 'Cold or aloof character who gradually reveals warmth', aliases: ['defrosting ice queen', 'warming up'] },
  { name: 'rage against the machine', category: 'character_archetype', description: 'Character who rebels against systemic oppression or control', aliases: ['system fighter', 'rebel'] },
  { name: 'woman scorned', category: 'character_archetype', description: 'Character driven by betrayal into calculated vengeance', aliases: ['vengeful ex', 'betrayed fury'] },
  { name: 'fish out of water hero', category: 'character_archetype', description: 'Protagonist whose outsider perspective drives the narrative', aliases: ['newcomer protagonist'] },
  { name: 'monster with a heart', category: 'character_archetype', description: 'Character perceived as monstrous who shows genuine compassion', aliases: ['kind monster', 'sympathetic creature'] },
  { name: 'the survivor', category: 'character_archetype', description: 'Character defined by enduring and adapting to extreme circumstances', aliases: ['last one standing', 'endurance personified'] },

  // =========================================================================
  // PACING MECHANIC (25+ tropes)
  // =========================================================================
  { name: 'slow burn with pressurization', category: 'pacing_mechanic', description: 'Gradual buildup that compresses tension until explosive release', aliases: ['building pressure', 'simmering tension'] },
  { name: 'rapid-fire tactical dialogue', category: 'pacing_mechanic', description: 'Fast-paced verbal exchanges where every word carries weight', aliases: ['snappy dialogue', 'verbal sparring'] },
  { name: 'ticking clock', category: 'pacing_mechanic', description: 'External time pressure that accelerates narrative momentum', aliases: ['countdown', 'deadline pressure'] },
  { name: 'loop-and-escalate', category: 'pacing_mechanic', description: 'Repeated cycles with increasing stakes or complexity each time', aliases: ['escalating loops', 'iterative stakes'] },
  { name: 'episodic payoff', category: 'pacing_mechanic', description: 'Self-contained episodes that each deliver satisfying resolution', aliases: ['monster of the week with arc', 'contained stories'] },
  { name: 'tight structure (no waste)', category: 'pacing_mechanic', description: 'Every scene, line, and detail serves the larger narrative', aliases: ['economical storytelling', 'Chekhov\u0027s everything'] },
  { name: 'building dread', category: 'pacing_mechanic', description: 'Atmospheric tension that grows steadily without release', aliases: ['mounting horror', 'creeping unease'] },
  { name: 'breather episodes', category: 'pacing_mechanic', description: 'Deliberate calm moments between intense sequences', aliases: ['calm before the storm', 'interlude'] },
  { name: 'cold open hook', category: 'pacing_mechanic', description: 'Opening scene that immediately grabs attention', aliases: ['grabber opening', 'hook'] },
  { name: 'flashback revelation', category: 'pacing_mechanic', description: 'Past events revealed at strategic moments to recontextualize', aliases: ['strategic flashback', 'delayed reveal'] },
  { name: 'montage compression', category: 'pacing_mechanic', description: 'Time is compressed through rapid sequence of key moments', aliases: ['training montage', 'time skip montage'] },
  { name: 'cliffhanger cascade', category: 'pacing_mechanic', description: 'Multiple unresolved tensions stacked at episode or chapter ends', aliases: ['serial cliffhangers', 'stacked hooks'] },
  { name: 'parallel tension', category: 'pacing_mechanic', description: 'Multiple storylines reaching crisis points simultaneously', aliases: ['cross-cutting tension', 'convergent pressure'] },
  { name: 'delayed gratification', category: 'pacing_mechanic', description: 'Key payoffs are withheld to maximize emotional impact', aliases: ['patience rewarded', 'long game'] },
  { name: 'information asymmetry', category: 'pacing_mechanic', description: 'Audience knows something characters do not, creating suspense', aliases: ['dramatic irony', 'audience superiority'] },
  { name: 'reveal cascade', category: 'pacing_mechanic', description: 'Series of revelations that each reframe previous understanding', aliases: ['onion peeling', 'layered reveals'] },
  { name: 'in medias res', category: 'pacing_mechanic', description: 'Story begins in the middle of action, fills in context later', aliases: ['starting in the middle', 'cold start'] },
  { name: 'rising action staircase', category: 'pacing_mechanic', description: 'Tension builds in distinct escalating steps rather than smoothly', aliases: ['stepped escalation', 'crisis ladder'] },
  { name: 'quiet devastation', category: 'pacing_mechanic', description: 'Emotional impact delivered through understatement rather than spectacle', aliases: ['understated tragedy', 'silent heartbreak'] },
  { name: 'whiplash tonal shift', category: 'pacing_mechanic', description: 'Sudden dramatic change in tone for emotional effect', aliases: ['mood whiplash', 'tonal contrast'] },

  // =========================================================================
  // EMOTIONAL DYNAMIC (25+ tropes)
  // =========================================================================
  { name: 'earned catharsis', category: 'emotional_dynamic', description: 'Emotional release that feels deserved after sustained buildup', aliases: ['satisfying payoff', 'emotional reward'] },
  { name: 'bittersweet resolution', category: 'emotional_dynamic', description: 'Ending that combines satisfaction with genuine loss', aliases: ['happy-sad ending', 'pyrrhic victory'] },
  { name: 'hope in darkness', category: 'emotional_dynamic', description: 'Moments of light and possibility in otherwise bleak narratives', aliases: ['candle in the dark', 'spark of hope'] },
  { name: 'grief as growth', category: 'emotional_dynamic', description: 'Loss transforms characters rather than merely damaging them', aliases: ['transformative loss', 'growth through pain'] },
  { name: 'empathy through perspective', category: 'emotional_dynamic', description: 'Narrative forces audience to understand an opposing viewpoint', aliases: ['walking in their shoes', 'perspective shift'] },
  { name: 'unspoken understanding', category: 'emotional_dynamic', description: 'Characters communicate deep feelings without words', aliases: ['silent connection', 'understood without saying'] },
  { name: 'earned vulnerability', category: 'emotional_dynamic', description: 'Strong character showing weakness at the right dramatic moment', aliases: ['hero breaks down', 'strategic vulnerability'] },
  { name: 'moral reckoning', category: 'emotional_dynamic', description: 'Character forced to confront the consequences of their choices', aliases: ['facing the music', 'accountability moment'] },
  { name: 'inherited trauma', category: 'emotional_dynamic', description: 'Pain passed between generations shapes character behavior', aliases: ['generational trauma', 'cycles of pain'] },
  { name: 'joy as resistance', category: 'emotional_dynamic', description: 'Finding happiness becomes an act of defiance against oppression', aliases: ['radical joy', 'happiness as rebellion'] },
  { name: 'quiet heroism', category: 'emotional_dynamic', description: 'Acts of courage that are understated rather than grandiose', aliases: ['everyday hero', 'small acts of bravery'] },
  { name: 'the weight of knowledge', category: 'emotional_dynamic', description: 'Knowing the truth becomes a burden rather than a liberation', aliases: ['terrible truth', 'cursed knowledge'] },
  { name: 'forgiveness arc', category: 'emotional_dynamic', description: 'Character journey toward forgiving themselves or others', aliases: ['letting go', 'release of grudge'] },
  { name: 'emotional isolation', category: 'emotional_dynamic', description: 'Character surrounded by others yet fundamentally alone', aliases: ['lonely in a crowd', 'isolation despite connection'] },
  { name: 'sacrificial love', category: 'emotional_dynamic', description: 'Love expressed through willing self-sacrifice', aliases: ['dying for love', 'ultimate devotion'] },
  { name: 'nostalgia and loss', category: 'emotional_dynamic', description: 'Longing for a past that cannot be recovered', aliases: ['lost paradise', 'golden age memory'] },
  { name: 'rage channeled', category: 'emotional_dynamic', description: 'Anger directed productively rather than destructively', aliases: ['righteous fury', 'constructive anger'] },
  { name: 'emotional armor cracking', category: 'emotional_dynamic', description: 'Defenses a character built breaking under sustained pressure', aliases: ['walls coming down', 'facade crumbling'] },
  { name: 'collective grief', category: 'emotional_dynamic', description: 'Community processing loss together', aliases: ['shared mourning', 'communal sorrow'] },
  { name: 'tender brutality', category: 'emotional_dynamic', description: 'Moments of genuine tenderness in otherwise harsh narratives', aliases: ['softness in violence', 'gentleness in war'] },
  { name: 'guilt as motivation', category: 'emotional_dynamic', description: 'Character driven by need to atone for past actions', aliases: ['atonement drive', 'guilt-driven hero'] },

  // =========================================================================
  // WORLD BUILDING (25+ tropes)
  // =========================================================================
  { name: 'lived-in world', category: 'world_building', description: 'Setting feels like it exists beyond what is shown on screen', aliases: ['iceberg worldbuilding', 'implied depth'] },
  { name: 'magic system with rules', category: 'world_building', description: 'Supernatural elements follow consistent internal logic', aliases: ['hard magic', 'systematic magic'] },
  { name: 'societal stratification', category: 'world_building', description: 'World features distinct social layers with clear dynamics', aliases: ['caste system', 'rigid hierarchy'] },
  { name: 'ecological worldbuilding', category: 'world_building', description: 'Environment and ecology are integral to the story world', aliases: ['living ecosystem', 'environmental storytelling'] },
  { name: 'technology as character', category: 'world_building', description: 'Technology shapes society and story in meaningful ways', aliases: ['tech-driven world', 'technological determinism'] },
  { name: 'cultural authenticity', category: 'world_building', description: 'World draws from real cultural traditions with depth and respect', aliases: ['cultural grounding', 'authentic representation'] },
  { name: 'dystopian machinery', category: 'world_building', description: 'Oppressive systems and their mechanics are thoroughly explored', aliases: ['totalitarian worldbuilding', 'systemic oppression'] },
  { name: 'economic realism', category: 'world_building', description: 'Economic systems and their effects are realistically depicted', aliases: ['trade and commerce', 'economic worldbuilding'] },
  { name: 'historical parallels', category: 'world_building', description: 'Fictional world clearly mirrors or comments on historical events', aliases: ['historical allegory', 'period inspiration'] },
  { name: 'mythological substrate', category: 'world_building', description: 'Deep mythological or religious traditions underpin the world', aliases: ['mythological foundation', 'religious worldbuilding'] },
  { name: 'post-apocalyptic recovery', category: 'world_building', description: 'Society rebuilding after catastrophe, shaped by what was lost', aliases: ['after the fall', 'rebuilding civilization'] },
  { name: 'alien familiar', category: 'world_building', description: 'Non-human elements that illuminate the human condition', aliases: ['alien mirror', 'other as reflection'] },
  { name: 'geographic storytelling', category: 'world_building', description: 'Physical geography actively shapes plot and character development', aliases: ['landscape as character', 'terrain-driven plot'] },
  { name: 'information ecosystem', category: 'world_building', description: 'How information flows (or is suppressed) in the story world', aliases: ['propaganda and truth', 'media landscape'] },
  { name: 'constructed language', category: 'world_building', description: 'Original languages that add depth to cultural worldbuilding', aliases: ['conlang', 'fictional language'] },
  { name: 'architectural storytelling', category: 'world_building', description: 'Buildings and spaces communicate history and power dynamics', aliases: ['meaningful architecture', 'space as story'] },
  { name: 'everyday magic', category: 'world_building', description: 'Supernatural elements integrated naturally into daily life', aliases: ['mundane magic', 'magic as normal'] },
  { name: 'frontier setting', category: 'world_building', description: 'Story set on the edge of civilization or known territory', aliases: ['edge of the map', 'borderlands'] },
  { name: 'urban labyrinth', category: 'world_building', description: 'Complex city setting that is almost a character itself', aliases: ['city as character', 'urban maze'] },
  { name: 'cozy worldbuilding', category: 'world_building', description: 'World designed to feel warm, safe, and inviting', aliases: ['comfort setting', 'wholesome world'] },

  // =========================================================================
  // NARRATIVE TECHNIQUE (25+ tropes)
  // =========================================================================
  { name: 'unreliable narrator', category: 'narrative_technique', description: 'Narrator whose account cannot be fully trusted', aliases: ['deceptive perspective', 'biased narrator'] },
  { name: 'Chekhov\u0027s gun', category: 'narrative_technique', description: 'Every element introduced becomes relevant later', aliases: ['setup and payoff', 'nothing is wasted'] },
  { name: 'dramatic irony', category: 'narrative_technique', description: 'Audience knows something the characters do not', aliases: ['audience awareness', 'we know more'] },
  { name: 'foreshadowing', category: 'narrative_technique', description: 'Hints at future events planted throughout the narrative', aliases: ['subtle hints', 'planted clues'] },
  { name: 'show don\u0027t tell', category: 'narrative_technique', description: 'Information conveyed through action and implication rather than exposition', aliases: ['visual storytelling', 'implied narrative'] },
  { name: 'multiple perspectives', category: 'narrative_technique', description: 'Story told from several characters\u0027 viewpoints', aliases: ['POV switching', 'multi-perspective'] },
  { name: 'non-linear timeline', category: 'narrative_technique', description: 'Events presented out of chronological order for effect', aliases: ['temporal scramble', 'shuffled timeline'] },
  { name: 'motif and symbolism', category: 'narrative_technique', description: 'Recurring images, themes, or symbols that carry meaning', aliases: ['symbolic language', 'thematic imagery'] },
  { name: 'thematic mirroring', category: 'narrative_technique', description: 'Subplot or secondary characters reflect the main theme', aliases: ['parallel themes', 'thematic echo'] },
  { name: 'subtext-heavy dialogue', category: 'narrative_technique', description: 'Characters say one thing but mean another, with layers of meaning', aliases: ['loaded dialogue', 'reading between lines'] },
  { name: 'environmental storytelling', category: 'narrative_technique', description: 'Setting and objects tell stories without explicit narration', aliases: ['visual narrative', 'scenery as story'] },
  { name: 'frame breaking', category: 'narrative_technique', description: 'Narrative acknowledges its own artifice or addresses the audience', aliases: ['fourth wall break', 'meta-awareness'] },
  { name: 'epistolary elements', category: 'narrative_technique', description: 'Story told through documents, letters, or media', aliases: ['found footage', 'documentary style'] },
  { name: 'repetition with variation', category: 'narrative_technique', description: 'Same scene or motif repeated but changed to show growth', aliases: ['callback with twist', 'evolved repetition'] },
  { name: 'juxtaposition', category: 'narrative_technique', description: 'Contrasting elements placed side by side for emphasis', aliases: ['contrast cuts', 'tonal contrast'] },
  { name: 'minimalist exposition', category: 'narrative_technique', description: 'Worldbuilding delivered through implication rather than info dumps', aliases: ['organic exposition', 'no info dumps'] },
  { name: 'unreliable memory', category: 'narrative_technique', description: 'Characters\u0027 memories are shown to be flawed or constructed', aliases: ['false memory', 'distorted recall'] },
  { name: 'genre blending', category: 'narrative_technique', description: 'Combining elements from multiple genres in a cohesive way', aliases: ['genre mashup', 'cross-genre'] },
  { name: 'cold prose', category: 'narrative_technique', description: 'Deliberately restrained, clinical writing style for emotional effect', aliases: ['detached narration', 'clinical style'] },
  { name: 'comedic deflection', category: 'narrative_technique', description: 'Humor used to process or deflect from heavy themes', aliases: ['gallows humor', 'laughing to cope'] },

  // =========================================================================
  // RELATIONSHIP PATTERN (25+ tropes)
  // =========================================================================
  { name: 'rivals to allies', category: 'relationship_pattern', description: 'Adversaries who develop mutual respect and cooperation', aliases: ['enemy mine', 'rival turned friend'] },
  { name: 'mentor-student evolution', category: 'relationship_pattern', description: 'Teacher-student dynamic that evolves into equals or role reversal', aliases: ['surpassing the master', 'student becomes teacher'] },
  { name: 'reluctant partnership', category: 'relationship_pattern', description: 'Characters forced to work together who gradually bond', aliases: ['odd couple', 'forced teamwork'] },
  { name: 'unequal power romance', category: 'relationship_pattern', description: 'Romance between characters with significant power differential', aliases: ['power imbalance romance', 'forbidden love'] },
  { name: 'sibling rivalry', category: 'relationship_pattern', description: 'Conflict and competition between siblings drives the narrative', aliases: ['brother against brother', 'family competition'] },
  { name: 'loyalty tested', category: 'relationship_pattern', description: 'A relationship strained by conflicting obligations', aliases: ['divided loyalty', 'torn allegiance'] },
  { name: 'tragic romance', category: 'relationship_pattern', description: 'Love story destined for heartbreak or sacrifice', aliases: ['doomed lovers', 'star-crossed'] },
  { name: 'battle couple', category: 'relationship_pattern', description: 'Romantic partners who fight together as equals', aliases: ['power couple', 'fighting side by side'] },
  { name: 'one-sided devotion', category: 'relationship_pattern', description: 'Character loves another who does not reciprocate', aliases: ['unrequited love', 'pining'] },
  { name: 'bromance', category: 'relationship_pattern', description: 'Deep platonic bond between male characters', aliases: ['male friendship', 'bonds of brotherhood'] },
  { name: 'found siblings', category: 'relationship_pattern', description: 'Characters who become like siblings without blood relation', aliases: ['adoptive siblings', 'chosen brothers/sisters'] },
  { name: 'complex parent-child', category: 'relationship_pattern', description: 'Parent-child relationship with realistic complications', aliases: ['flawed parenthood', 'parent issues'] },
  { name: 'enemies to lovers', category: 'relationship_pattern', description: 'Characters who hate each other develop romantic feelings', aliases: ['hate to love', 'antagonistic romance'] },
  { name: 'slow burn romance', category: 'relationship_pattern', description: 'Romance that develops gradually over extended period', aliases: ['gradual love', 'patience in romance'] },
  { name: 'platonic life partners', category: 'relationship_pattern', description: 'Characters whose primary bond is deep friendship, not romance', aliases: ['queerplatonic', 'life partners without romance'] },
  { name: 'protective instinct', category: 'relationship_pattern', description: 'Character driven by need to protect someone specific', aliases: ['guardian dynamic', 'protector and protected'] },
  { name: 'betrayal and forgiveness', category: 'relationship_pattern', description: 'A relationship broken by betrayal that slowly rebuilds', aliases: ['broken trust', 'rebuilding trust'] },
  { name: 'banter as bonding', category: 'relationship_pattern', description: 'Characters develop intimacy through witty verbal exchanges', aliases: ['playful bickering', 'teasing as affection'] },
  { name: 'generational echo', category: 'relationship_pattern', description: 'Current relationships mirror those of previous generations', aliases: ['history repeats', 'like parent like child'] },
  { name: 'sacrificial exit', category: 'relationship_pattern', description: 'Character leaves a relationship to protect the other person', aliases: ['noble breakup', 'leaving for their sake'] },

  // =========================================================================
  // CONFLICT TYPE (25+ tropes)
  // =========================================================================
  { name: 'man vs system', category: 'conflict_type', description: 'Individual struggles against institutional or societal forces', aliases: ['fighting the system', 'one against the machine'] },
  { name: 'man vs self', category: 'conflict_type', description: 'Primary conflict is internal: fear, guilt, identity, desire', aliases: ['internal struggle', 'self-doubt', 'inner demons'] },
  { name: 'man vs nature', category: 'conflict_type', description: 'Characters battle environmental or natural forces', aliases: ['survival against nature', 'nature as antagonist'] },
  { name: 'man vs technology', category: 'conflict_type', description: 'Conflict arising from created technology or artificial intelligence', aliases: ['AI uprising', 'Frankenstein conflict'] },
  { name: 'moral dilemma', category: 'conflict_type', description: 'No right answer exists; every choice has meaningful cost', aliases: ['trolley problem', 'impossible choice', 'no-win scenario'] },
  { name: 'justice vs mercy', category: 'conflict_type', description: 'Tension between punishment and compassion', aliases: ['law vs grace', 'forgive or punish'] },
  { name: 'individual vs collective', category: 'conflict_type', description: 'Personal desires conflict with group needs', aliases: ['self vs community', 'duty vs desire'] },
  { name: 'truth vs loyalty', category: 'conflict_type', description: 'Revealing the truth means betraying those you care about', aliases: ['whistleblower dilemma', 'honesty vs allegiance'] },
  { name: 'freedom vs security', category: 'conflict_type', description: 'Choice between liberty and safety', aliases: ['liberty vs protection', 'chaos vs order'] },
  { name: 'tradition vs progress', category: 'conflict_type', description: 'Old ways clash with new ideas or technology', aliases: ['old vs new', 'conservative vs progressive'] },
  { name: 'creation vs destruction', category: 'conflict_type', description: 'Tension between building and tearing down', aliases: ['builder vs destroyer'] },
  { name: 'knowledge vs ignorance', category: 'conflict_type', description: 'Whether knowing the truth is better than blissful unawareness', aliases: ['red pill blue pill', 'forbidden knowledge'] },
  { name: 'ends vs means', category: 'conflict_type', description: 'Whether a good outcome justifies morally questionable methods', aliases: ['utilitarian dilemma', 'does the end justify'] },
  { name: 'vengeance cycle', category: 'conflict_type', description: 'Cycle of retaliation that perpetuates conflict', aliases: ['eye for an eye', 'revenge breeds revenge'] },
  { name: 'colonial resistance', category: 'conflict_type', description: 'Occupied people fighting against colonial or imperial power', aliases: ['anti-imperialism', 'decolonization struggle'] },
  { name: 'resource scarcity', category: 'conflict_type', description: 'Conflict driven by competition for limited resources', aliases: ['fighting over scraps', 'zero-sum game'] },
  { name: 'identity crisis', category: 'conflict_type', description: 'Character struggles with who they are or who they should become', aliases: ['self-discovery', 'existential questioning'] },
  { name: 'generational conflict', category: 'conflict_type', description: 'Younger generation clashes with older over values or direction', aliases: ['old guard vs new blood', 'generation gap'] },
  { name: 'power vacuum', category: 'conflict_type', description: 'Removal of authority creates chaos and competition', aliases: ['succession crisis', 'throne game'] },
  { name: 'proxy war', category: 'conflict_type', description: 'Larger powers fight through smaller agents or factions', aliases: ['shadow war', 'puppet conflict'] },
  { name: 'cultural clash', category: 'conflict_type', description: 'Conflict arising from fundamentally different cultural worldviews', aliases: ['culture war', 'civilizational divide'] },
  { name: 'existential threat', category: 'conflict_type', description: 'Threat to the very existence of a species, civilization, or world', aliases: ['apocalyptic threat', 'extinction event'] },
  { name: 'corruption exposed', category: 'conflict_type', description: 'Hidden wrongdoing within trusted institutions is brought to light', aliases: ['scandal revealed', 'whistle blown'] },
  { name: 'survival of principles', category: 'conflict_type', description: 'Maintaining moral integrity when abandoning it would be easier', aliases: ['integrity tested', 'moral fortitude'] },

  // Additional premise/structural
  { name: 'body swap', category: 'premise_structural', description: 'Characters exchange bodies or perspectives, gaining empathy or chaos', aliases: ['identity swap', 'walking in their shoes literally'] },
  { name: 'memory erasure', category: 'premise_structural', description: 'Loss or deliberate erasure of memories drives the plot', aliases: ['amnesia plot', 'forgotten past'] },

  // Additional character archetypes
  { name: 'the collector', category: 'character_archetype', description: 'Character obsessed with gathering, cataloguing, or preserving things', aliases: ['archivist', 'hoarder with purpose'] },

  // Additional pacing mechanics
  { name: 'crescendo finale', category: 'pacing_mechanic', description: 'All narrative threads converge into an overwhelming climactic sequence', aliases: ['everything at once', 'grand finale'] },
  { name: 'silence as punctuation', category: 'pacing_mechanic', description: 'Strategic pauses or quiet moments used for dramatic emphasis', aliases: ['dramatic silence', 'meaningful pause'] },

  // Additional emotional dynamics
  { name: 'cathartic destruction', category: 'emotional_dynamic', description: 'Breaking or destroying something as emotional release', aliases: ['breaking free', 'symbolic destruction'] },
  { name: 'earned reunion', category: 'emotional_dynamic', description: 'Long-separated characters finally reunited after struggle', aliases: ['coming home', 'reunion payoff'] },

  // Additional world building
  { name: 'ruins and legacy', category: 'world_building', description: 'Remnants of past civilizations shape the current world', aliases: ['ancient ruins', 'lost civilization'] },

  // Additional narrative technique
  { name: 'match cut', category: 'narrative_technique', description: 'Visual or thematic transition connecting disparate scenes', aliases: ['visual bridge', 'linking image'] },
  { name: 'voiceover commentary', category: 'narrative_technique', description: 'Narrator provides ongoing commentary or reflection over events', aliases: ['internal monologue', 'narration overlay'] },
]

// Helpers

export function getTropesByCategory(): Map<TropeCategory, TropeDictEntry[]> {
  const map = new Map<TropeCategory, TropeDictEntry[]>()
  for (const trope of TROPE_DICT) {
    const list = map.get(trope.category) ?? []
    list.push(trope)
    map.set(trope.category, list)
  }
  return map
}

export function buildLabelsForBatch(tropes: TropeDictEntry[]): string[] {
  return tropes.map((t) => `${t.name}: ${t.description}`)
}

export function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

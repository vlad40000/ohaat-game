import { useEffect, useMemo, useState } from 'react'
import {
  BUSINESSES,
  BUSINESS_MAP,
  EPISODE_MAP,
  EPISODE_STORY_MAP,
  FACTION_MAP,
  FACTION_STORY_MAP,
  HIDDEN_CARD_MAP,
  LORE_CARDS,
  SCRIPT_EPISODES,
  STARTER_FACTION_IDS,
  type BusinessId,
} from './data'
import {
  advanceTurn,
  applyWinCheck,
  getChaosPulse,
  getCurrentEpisodeAct,
  getSpotlightTier,
  getSpotlightValue,
  getSpotlightVenueId,
  performClaim,
  performFactionSpecial,
  performForce,
  performMove,
  performScheme,
  performSearch,
  setupGame,
  type ForceResult,
  type MatchState,
} from './engine'

function createInitialState(): MatchState {
  return setupGame({
    playerIds: ['P1', 'P2'],
    factionIds: [STARTER_FACTION_IDS[0], STARTER_FACTION_IDS[2]],
    seed: 'ohaat-story-build-alpha',
  })
}

type VisibleClashResult = Pick<
  ForceResult,
  | 'businessId'
  | 'targetRivalId'
  | 'attackRoll'
  | 'defenseRoll'
  | 'attackModifier'
  | 'defenseModifier'
  | 'attackTotal'
  | 'defenseTotal'
  | 'winnerPlayerId'
  | 'controllerChanged'
> & {
  attackerId: string
  mode: 'private' | 'public'
  intent: 'pressure' | 'seize'
  sequence: number
}

const DIE_PIP_MAP: Record<number, number[]> = {
  1: [5],
  2: [1, 9],
  3: [1, 5, 9],
  4: [1, 3, 7, 9],
  5: [1, 3, 5, 7, 9],
  6: [1, 3, 4, 6, 7, 9],
}

function DiceFace({ value }: { value: number }) {
  const activePips = DIE_PIP_MAP[value] ?? []
  return (
    <div className="die-face" aria-label={`d6 roll ${value}`}>
      {Array.from({ length: 9 }, (_, index) => index + 1).map((slot) => (
        <span key={slot} className={`pip ${activePips.includes(slot) ? 'on' : ''}`} />
      ))}
      <span className="die-value">{value}</span>
    </div>
  )
}

type StoryCardVisualProps = {
  eyebrow: string
  title: string
  summary: string
  body: string
  chips: string[]
  faceUp: boolean
  held?: boolean
  accent?: string
  deckLabel: string
  onFlip: () => void
}

function HiddenPlayCard({
  cardId,
  faceUp,
  held = false,
  fresh = false,
  onFlip,
}: {
  cardId: string
  faceUp: boolean
  held?: boolean
  fresh?: boolean
  onFlip: () => void
}) {
  const card = HIDDEN_CARD_MAP[cardId]
  if (!card) return null

  return (
    <article
      className={`play-card ${faceUp ? 'face-up' : 'face-down'} ${held ? 'held' : ''} ${fresh ? 'fresh' : ''}`}
      onClick={onFlip}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onFlip()
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`${faceUp ? 'Flip down' : 'Flip up'} ${card.name}`}
    >
      <div className="play-card-shell">
        <div className="play-card-face play-card-front">
          <div className="play-card-topline">
            <span className="card-kicker">{card.kind.toUpperCase()}</span>
            <span className="card-chip solo">{card.tags[0] ?? 'Swamp'}</span>
          </div>
          <h3>{card.name}</h3>
          <p>{card.revealText}</p>
          {card.effectText && <p className="play-card-effect">{card.effectText}</p>}
          <div className="card-chip-row">
            {card.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="card-chip">
                {tag}
              </span>
            ))}
          </div>
          <div className="play-card-foot">
            {card.homeBusinessIds.map((id) => BUSINESS_MAP[id].shortName).join(' • ')}
          </div>
        </div>

        <div className="play-card-face play-card-back">
          <div className="play-card-back-mark">OHAAT</div>
          <strong>Hidden Discovery</strong>
          <span>{card.kind} / swamp deck</span>
          <p>Click to flip this card face up.</p>
        </div>
      </div>
    </article>
  )
}

function StoryPlayCard({
  eyebrow,
  title,
  summary,
  body,
  chips,
  faceUp,
  held = false,
  accent = 'episode',
  deckLabel,
  onFlip,
}: StoryCardVisualProps) {
  return (
    <article
      className={`play-card story-play-card ${faceUp ? 'face-up' : 'face-down'} ${held ? 'held' : ''} accent-${accent}`}
      onClick={onFlip}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onFlip()
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`${faceUp ? 'Flip down' : 'Flip up'} ${title}`}
    >
      <div className="play-card-shell">
        <div className="play-card-face play-card-front">
          <div className="play-card-topline">
            <span className="card-kicker">{eyebrow}</span>
            <span className="card-chip solo">{deckLabel}</span>
          </div>
          <h3>{title}</h3>
          <p>{summary}</p>
          <p className="play-card-effect">{body}</p>
          <div className="card-chip-row">
            {chips.map((chip) => (
              <span key={chip} className="card-chip">
                {chip}
              </span>
            ))}
          </div>
        </div>

        <div className="play-card-face play-card-back">
          <div className="play-card-back-mark">OHAAT</div>
          <strong>{deckLabel}</strong>
          <span>{eyebrow}</span>
          <p>Click to flip this card face up.</p>
        </div>
      </div>
    </article>
  )
}


type CountyRegionId =
  | 'goochs_grounds'
  | 'windy_sands_estate'
  | 'wild_refuge'
  | 'county_strip'
  | 'panda_pressure'

interface CountyRegionDef {
  id: CountyRegionId
  name: string
  subtitle: string
  hook: string
  routeLabel: string
  tileIds: BusinessId[]
}

const COUNTY_REGIONS: CountyRegionDef[] = [
  {
    id: 'goochs_grounds',
    name: "Gooch's Grounds",
    subtitle: 'Fairway hinge, hunt country, and paranormal spillover.',
    hook: 'This side of the county wants traps, ambushes, and spotlight kills on open turf.',
    routeLabel: 'Open fairway / swamp edge',
    tileIds: ['gator_gear_garage', 'swamp_scroll_stack'],
  },
  {
    id: 'windy_sands_estate',
    name: 'Windy Sands Estate',
    subtitle: 'Lobby-to-tower fortress with cult spillover on the property line.',
    hook: 'Hard-entry region for surveillance, vertical control, and late-game hostage pressure.',
    routeLabel: 'Property line / lobby / elevator',
    tileIds: ['swamp_signal_co', 'swamp_scam_insurers'],
  },
  {
    id: 'wild_refuge',
    name: 'Wild Refuge',
    subtitle: 'Hidden routes, cleanup space, and the skunkhole interior.',
    hook: 'This region should feel sneaky, recoverable, and hard to pin down in a chase.',
    routeLabel: 'Secret wild paths',
    tileIds: ['rustys_wrench_hut', 'sawbones_swamp_clinic'],
  },
  {
    id: 'county_strip',
    name: 'County Strip',
    subtitle: 'Roadside chaos, crowds, disguises, and public violence.',
    hook: 'Fastest place on the board to turn motion into spectacle, rumors, and headline pressure.',
    routeLabel: 'Public road strip',
    tileIds: ['sonnys_strike_zone', 'gator_jaw_tavern', 'taco_gator_hut'],
  },
  {
    id: 'panda_pressure',
    name: 'Panda / Law Pressure',
    subtitle: 'Cages, contraband, interrogation rooms, and trial squeeze.',
    hook: 'The harshest region for evidence play, capture beats, and witness suppression.',
    routeLabel: 'Law corridor / service road',
    tileIds: ['mayors_office', 'ledger_lodge', 'critter_corral'],
  },
]

const COUNTY_ROUTE_BANDS = [
  {
    label: 'Public county strip',
    text: "Sonny's, Dale's, and the Dress Barn run hot and loud. Great for headlines, terrible for subtlety.",
  },
  {
    label: 'Hidden wild paths',
    text: 'The swamp-side spaces should feel like chase routes, secret pivots, and escape valves rather than clean roads.',
  },
  {
    label: 'Property line pressure',
    text: "Gooch's and Windy Sands sit in tension. That border is where episodes should flip from local chaos to fortress play.",
  },
  {
    label: 'Law and syndicate squeeze',
    text: 'The PD, zoo, and syndicate front should create a nasty corridor for evidence, capture, and jailbreak pressure.',
  },
] as const

const BUSINESS_BOARD_DETAILS: Record<BusinessId, { role: string; landmark: string; routeMode: string; pressure: string }> = {
  mayors_office: {
    role: 'Law stronghold',
    landmark: 'Interrogation room and civic pressure point',
    routeMode: 'Public road / law corridor',
    pressure: 'Frames, evidence turns, and trial squeeze.',
  },
  ledger_lodge: {
    role: 'Syndicate objective',
    landmark: 'Backroom contraband front',
    routeMode: 'Service road crossover',
    pressure: 'Launders heat and hides dirty inventory.',
  },
  critter_corral: {
    role: 'Captivity zone',
    landmark: 'Zoo cages and panda confinement',
    routeMode: 'Public gate / law corridor',
    pressure: 'Capture, rescue, and jailbreak beats.',
  },
  sonnys_strike_zone: {
    role: 'Public hub',
    landmark: 'Bowling alley and SKA meeting ground',
    routeMode: 'County strip artery',
    pressure: 'Crowds, events, and chaos-to-headline conversion.',
  },
  rustys_wrench_hut: {
    role: 'Hidden stronghold',
    landmark: 'Skunkhole interior and monitor nest',
    routeMode: 'Secret wild path',
    pressure: 'Repair, hide, and set up quiet ambushes.',
  },
  swamp_scroll_stack: {
    role: 'Weird objective',
    landmark: 'Crowley lab and portal fringe',
    routeMode: 'Swamp edge approach',
    pressure: 'Lore leverage, prophecy nonsense, and top-deck peeking.',
  },
  gator_jaw_tavern: {
    role: 'Roadside blood stop',
    landmark: "Dale's family violence attraction",
    routeMode: 'County strip artery',
    pressure: 'Public clash bonuses and ugly spectacle.',
  },
  taco_gator_hut: {
    role: 'Transit disguise node',
    landmark: 'Dress Barn decoy crossover',
    routeMode: 'Service lane / secret crossover',
    pressure: 'Swaps, decoys, and slippery movement.',
  },
  swamp_scam_insurers: {
    role: 'Cult edge choke point',
    landmark: 'Jehovah Fitness on the property line',
    routeMode: 'Windy perimeter access',
    pressure: 'Cleansing, cash, and incursion staging.',
  },
  gator_gear_garage: {
    role: 'Hunt ground',
    landmark: "Gooch's fairway and pro-shop axis",
    routeMode: 'Open fairway',
    pressure: 'Traps, ambushes, and camera-magnet violence.',
  },
  sawbones_swamp_clinic: {
    role: 'Recovery hideaway',
    landmark: 'Sawbones cleanup shack',
    routeMode: 'Swamp back trail',
    pressure: 'Healing, cleanup, and force boosts.',
  },
  swamp_signal_co: {
    role: 'Vertical fortress',
    landmark: 'Windy Sands lobby and tower line',
    routeMode: 'Lobby to elevator',
    pressure: 'Surveillance, hostage pressure, and late-game control.',
  },
}

const BUSINESS_REGION_LOOKUP = Object.fromEntries(
  COUNTY_REGIONS.flatMap((region) => region.tileIds.map((tileId) => [tileId, region])),
) as Record<BusinessId, CountyRegionDef>

export default function App() {
  const [state, setState] = useState<MatchState>(createInitialState)
  const [selectedBusinessId, setSelectedBusinessId] = useState<BusinessId>('mayors_office')
  const [moveDestination, setMoveDestination] = useState<BusinessId>('ledger_lodge')
  const [moveMode, setMoveMode] = useState<'normal' | 'secret'>('normal')
  const [schemeIntent, setSchemeIntent] = useState<'pressure' | 'clean' | 'seize'>('pressure')
  const [schemeEffect, setSchemeEffect] = useState<'evidence' | 'heat'>('evidence')
  const [forceMode, setForceMode] = useState<'private' | 'public'>('private')
  const [forceIntent, setForceIntent] = useState<'pressure' | 'seize'>('pressure')
  const [specialDestination, setSpecialDestination] = useState<BusinessId>('sonnys_strike_zone')
  const [specialChoice, setSpecialChoice] = useState<
    'gain_headline' | 'pull_headline' | 'clear_self' | 'blank_target' | 'heat' | 'legend'
  >('gain_headline')
  const [error, setError] = useState('')
  const [selectedScriptEpisodeNumber, setSelectedScriptEpisodeNumber] = useState(1)
  const [loreIndex, setLoreIndex] = useState(0)
  const [lastClash, setLastClash] = useState<VisibleClashResult | null>(null)
  const [heldCardId, setHeldCardId] = useState<string | null>(null)
  const [flippedCardIds, setFlippedCardIds] = useState<string[]>([])
  const [lastDrawnCardId, setLastDrawnCardId] = useState<string | null>(null)
  const [episodeCardFaceUp, setEpisodeCardFaceUp] = useState(true)
  const [loreCardFaceUp, setLoreCardFaceUp] = useState(true)
  const [heldStoryCard, setHeldStoryCard] = useState<'episode' | 'lore' | null>(null)

  const currentPlayer = state.players[state.currentPlayerId]
  const selectedTile = state.tiles[selectedBusinessId]
  const episode = EPISODE_MAP[state.activeEpisodeId]
  const episodeStory = EPISODE_STORY_MAP[state.activeEpisodeId]
  const episodeAct = getCurrentEpisodeAct(state)
  const spotlightVenueId = getSpotlightVenueId(state)
  const spotlightTier = getSpotlightTier(state)
  const spotlightValue = getSpotlightValue(state)
  const chaosPulse = getChaosPulse(state)
  const currentFactionStory = FACTION_STORY_MAP[currentPlayer.factionId]
  const selectedScriptEpisode = SCRIPT_EPISODES.find((entry) => entry.number === selectedScriptEpisodeNumber) ?? SCRIPT_EPISODES[0]
  const activeLoreCard = LORE_CARDS[loreIndex % LORE_CARDS.length]
  const currentPlayerHandCardIds = currentPlayer.revealedCardIds.slice().reverse()
  const selectedTileFaceDownCardIds = selectedTile.hiddenCardIds.slice(0, 3)
  const selectedTileFaceUpCardIds = selectedTile.revealedCardIds.slice().reverse().slice(0, 3)
  const engineEpisodeInspirationMap: Record<string, number[]> = {
    wrong_man_on_trial: [10],
    bowling_alley_bloodbath: [6],
    rescue_the_cryptid: [4, 10],
    return_of_snorp: [5],
    panda_jailbreak: [7],
    backroom_commerce_fair: [3],
    chamber_scandal: [2],
    halloween_bowl_bash: [9],
    siege_of_the_fortress: [8],
    christmas_conversion_drive: [1],
  }
  const scriptPullNumbers = engineEpisodeInspirationMap[state.activeEpisodeId] ?? []

  const rivalsAtCurrentTile = useMemo(
    () => state.playerOrder.filter((id) => id !== state.currentPlayerId && state.players[id].position === currentPlayer.position),
    [state, currentPlayer.position],
  )

  const possibleMoveDestinations = useMemo(() => {
    const neighborSet = new Set<BusinessId>(BUSINESS_MAP[currentPlayer.position].neighbors)
    if (currentPlayer.position === 'taco_gator_hut') {
      neighborSet.add('sonnys_strike_zone')
      neighborSet.add('gator_jaw_tavern')
    }
    BUSINESSES.forEach((business) => {
      if (business.id !== currentPlayer.position && business.district === BUSINESS_MAP[currentPlayer.position].district) {
        neighborSet.add(business.id)
      }
    })
    return [...neighborSet]
  }, [currentPlayer.position])

  useEffect(() => {
    if (!possibleMoveDestinations.includes(moveDestination)) {
      setMoveDestination(possibleMoveDestinations[0] ?? currentPlayer.position)
    }
    if (specialDestination === currentPlayer.position && possibleMoveDestinations[0]) {
      setSpecialDestination(possibleMoveDestinations[0])
    }
  }, [possibleMoveDestinations, moveDestination, currentPlayer.position, specialDestination])

  useEffect(() => {
    if (heldCardId && !currentPlayer.revealedCardIds.includes(heldCardId)) {
      setHeldCardId(null)
    }
    if (lastDrawnCardId && !currentPlayer.revealedCardIds.includes(lastDrawnCardId)) {
      setLastDrawnCardId(null)
    }
  }, [currentPlayer.revealedCardIds, heldCardId, lastDrawnCardId])

  const playerCards = state.playerOrder.map((playerId) => ({
    player: state.players[playerId],
    faction: FACTION_MAP[state.players[playerId].factionId],
    story: FACTION_STORY_MAP[state.players[playerId].factionId],
  }))
  const selectedRegion = BUSINESS_REGION_LOOKUP[selectedBusinessId]

  function run(action: () => MatchState) {
    try {
      setError('')
      setState(action())
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
    }
  }

  function applyAction(nextState: MatchState) {
    return applyWinCheck(nextState)
  }

  function handleForceAction() {
    try {
      setError('')
      const result = performForce(state, state.currentPlayerId, {
        mode: forceMode,
        intent: forceIntent,
      })
      setLastClash({
        attackerId: state.currentPlayerId,
        businessId: result.businessId,
        targetRivalId: result.targetRivalId,
        attackRoll: result.attackRoll,
        defenseRoll: result.defenseRoll,
        attackModifier: result.attackModifier,
        defenseModifier: result.defenseModifier,
        attackTotal: result.attackTotal,
        defenseTotal: result.defenseTotal,
        winnerPlayerId: result.winnerPlayerId,
        controllerChanged: result.controllerChanged,
        mode: forceMode,
        intent: forceIntent,
        sequence: (lastClash?.sequence ?? 0) + 1,
      })
      }
    }
  }

  function handleSearchAction() {
    try {
      setError('')
      const result = performSearch(state, state.currentPlayerId)
      if (result.revealedCardId) {
        setLastDrawnCardId(result.revealedCardId)
        setHeldCardId(result.revealedCardId)
        setFlippedCardIds((current) => current.filter((cardId) => cardId !== result.revealedCardId))
      }
      setState(applyAction(result.state))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
    }
  }

  function toggleHiddenCard(cardId: string) {
    setFlippedCardIds((current) =>
      current.includes(cardId) ? current.filter((entry) => entry !== cardId) : [...current, cardId],
    )
  }

  function toggleHeldCard(cardId: string) {
    setHeldCardId((current) => (current === cardId ? null : cardId))
  }

  return (
    <div className="app-shell">
      <header className="topbar story-topbar">
        <div>
          <div className="eyebrow">Story Prototype Build</div>
          <h1>OHAAT — Swamp Chaos Episode Engine</h1>
          <p>
            This pass keeps the tested engine, adds an exact 10-episode campaign browser from the uploaded scripts,
            and adds a usable lore deck pulled from the uploaded flashcard CSVs.
          </p>
        </div>
        <div className="topbar-actions">
          <button
            onClick={() => {
              const fresh = createInitialState()
              setError('')
              setState(fresh)
              setLastClash(null)
              setHeldCardId(null)
              setFlippedCardIds([])
              setLastDrawnCardId(null)
              setEpisodeCardFaceUp(true)
              setLoreCardFaceUp(true)
              setHeldStoryCard(null)
              setSelectedBusinessId(fresh.players[fresh.currentPlayerId].position)
              setMoveDestination(BUSINESS_MAP[fresh.players[fresh.currentPlayerId].position].neighbors[0])
              setSpecialDestination(BUSINESS_MAP[fresh.players[fresh.currentPlayerId].position].neighbors[0])
            }}
          >
            New Match
          </button>
          <button onClick={() => run(() => advanceTurn(state))}>End Turn</button>
        </div>
      </header>

      <section className="story-strip">
        <article className="card spotlight-card">
          <div className="eyebrow">Episode Frame</div>
          <h2>{episode.name}</h2>
          <p>{episodeStory.premise}</p>
          <div className="pill-row">
            <span className={`pill ${spotlightTier === 'low' ? 'found' : ''}`}>Spotlight {spotlightTier}</span>
            <span className="pill">Value {spotlightValue}</span>
            <span className="pill">Round {state.round}</span>
            <span className="pill">Seed {state.seed}</span>
          </div>
        </article>

        <article className="card overlay-card">
          <div className="eyebrow">Active Venue Overlay</div>
          <h2>{episodeStory.overlayName}</h2>
          <p>{episodeStory.overlayText}</p>
          <div className="stat-row">
            <span>Spotlight venue</span>
            <strong>{BUSINESS_MAP[spotlightVenueId].name}</strong>
          </div>
          <div className="stat-row">
            <span>Chaos pulse</span>
            <strong>{chaosPulse}</strong>
          </div>
        </article>

        <article className="card act-card">
          <div className="eyebrow">3-Act Structure</div>
          <h2>{episodeAct.title}</h2>
          <p>{episodeAct.text}</p>
          <div className="act-list">
            {episodeStory.acts.map((act) => (
              <div key={act.stage} className={`act-item ${act.stage === episodeAct.stage ? 'active' : ''}`}>
                <strong>{act.title}</strong>
                <span>{act.text}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      {error && <div className="error-banner">{error}</div>}

      <section className="hud-grid players-grid">
        {playerCards.map(({ player, faction, story }) => {
          const isCurrent = player.id === state.currentPlayerId
          return (
            <article key={player.id} className={`card player-card ${isCurrent ? 'current-player-card' : ''}`}>
              <div className="eyebrow">{isCurrent ? 'Current player' : 'Rival'}</div>
              <h2>{player.id}</h2>
              <p><strong>{faction.name}</strong> — {story.hook}</p>
              <p className="story-note">Story skin now pairs the stable engine layer with a direct script campaign deck and lore deck.</p>
              <div className="stat-row"><span>Legend</span><strong>{player.legend}</strong></div>
              <div className="stat-row"><span>Heat</span><strong>{player.heat}</strong></div>
              <div className="stat-row"><span>Toothpicks / Evidence</span><strong>{player.evidence}</strong></div>
              <div className="stat-row"><span>Cash</span><strong>{player.cash}</strong></div>
              <div className="stat-row"><span>Headline</span><strong>{player.headlineTokens}</strong></div>
              <div className="stat-row"><span>Position</span><strong>{BUSINESS_MAP[player.position].shortName}</strong></div>
              <div className="stat-row"><span>Hunted target</span><strong>{story.huntedTarget}</strong></div>
              <div className="stat-row"><span>Preferred ally</span><strong>{story.preferredAlly}</strong></div>
              <div className="stat-row"><span>Hated venue</span><strong>{BUSINESS_MAP[story.hatedVenueId].shortName}</strong></div>
            </article>
          )
        })}
      </section>

      <main className="main-grid story-main-grid">
        <section className="card board-panel county-board-panel">
          <div className="panel-header">
            <div>
              <div className="eyebrow">County War Map</div>
              <h2>Swamp County Regions</h2>
              <p>The board now reads as a crooked county with public lanes, hidden swamp routes, fortress spaces, and a nasty law corridor.</p>
            </div>
          </div>
          <div className="district-legend county-role-legend">
            <span className="pill">Public hubs</span>
            <span className="pill">Strongholds</span>
            <span className="pill">Transit lanes</span>
            <span className="pill">Weird objectives</span>
          </div>
          <div className="county-route-grid">
            {COUNTY_ROUTE_BANDS.map((route) => (
              <article key={route.label} className="county-route-card">
                <strong>{route.label}</strong>
                <span>{route.text}</span>
              </article>
            ))}
          </div>
          <div className="county-board">
            {COUNTY_REGIONS.map((region) => (
              <section key={region.id} className={`county-region region-${region.id}`}>
                <header className="county-region-header">
                  <div>
                    <div className="eyebrow">{region.routeLabel}</div>
                    <h3>{region.name}</h3>
                    <p>{region.subtitle}</p>
                  </div>
                  <span className="region-hook">{region.hook}</span>
                </header>
                <div className="region-tiles">
                  {region.tileIds.map((businessId) => {
                    const business = BUSINESS_MAP[businessId]
                    const tile = state.tiles[business.id]
                    const isCurrent = currentPlayer.position === business.id
                    const isSelected = selectedBusinessId === business.id
                    const isSpotlight = business.id === spotlightVenueId
                    const occupants = state.playerOrder.filter((playerId) => state.players[playerId].position === business.id)
                    const boardDetails = BUSINESS_BOARD_DETAILS[business.id]
                    return (
                      <button
                        key={business.id}
                        className={`business-tile county-tile district-${business.district} ${isCurrent ? 'current' : ''} ${isSelected ? 'selected' : ''} ${isSpotlight ? 'spotlight' : ''}`}
                        onClick={() => setSelectedBusinessId(business.id)}
                      >
                        <div className="tile-title-row">
                          <div className="tile-title">{business.shortName}</div>
                          <span className="tile-role">{boardDetails.role}</span>
                        </div>
                        <div className="tile-meta">Landmark: {boardDetails.landmark}</div>
                        <div className="tile-meta">Route: {boardDetails.routeMode}</div>
                        <div className="tile-meta">Pressure: {boardDetails.pressure}</div>
                        <div className="tile-meta">Controller: {tile.controllerPlayerId ?? 'None'}</div>
                        <div className="tile-meta">Occupants: {occupants.join(', ') || 'None'}</div>
                        <div className="tile-meta">Hidden {tile.hiddenCardIds.length} · Revealed {tile.revealedCardIds.length} · Audit {tile.auditCount}</div>
                        <div className="tile-meta">Exposed: {tile.exposed ? 'Yes' : 'No'}</div>
                        {isSpotlight && <div className="tile-banner">Finale camera magnet</div>}
                        {isCurrent && <div className="tile-banner current-banner">Current position</div>}
                      </button>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        </section>

        <aside className="sidebar-stack">
          <section className="card action-card">
            <div className="eyebrow">Turn Controls</div>
            <h2>{state.currentPlayerId} at {BUSINESS_MAP[currentPlayer.position].shortName}</h2>
            <div className="stat-row"><span>Actions left</span><strong>{currentPlayer.actionCount}</strong></div>
            <div className="stat-row"><span>Rivals here</span><strong>{rivalsAtCurrentTile.join(', ') || 'None'}</strong></div>

            <div className="controls-grid">
              <button onClick={handleSearchAction}>Search / Draw</button>
              <button onClick={() => run(() => applyAction(performClaim(state, state.currentPlayerId).state))}>Claim</button>
            </div>

            <label>
              Move Mode
              <select value={moveMode} onChange={(e) => setMoveMode(e.target.value as 'normal' | 'secret')}>
                <option value="normal">Normal</option>
                <option value="secret">Secret route</option>
              </select>
            </label>
            <label>
              Move Destination
              <select value={moveDestination} onChange={(e) => setMoveDestination(e.target.value as BusinessId)}>
                {possibleMoveDestinations.map((id) => (
                  <option key={id} value={id}>{BUSINESS_MAP[id].shortName}</option>
                ))}
              </select>
            </label>
            <button onClick={() => run(() => applyAction(performMove(state, state.currentPlayerId, {
              destinationBusinessId: moveDestination,
              useSecretRoute: moveMode === 'secret',
            }).state))}>
              Move
            </button>

            <label>
              Scheme Intent
              <select value={schemeIntent} onChange={(e) => setSchemeIntent(e.target.value as 'pressure' | 'clean' | 'seize')}>
                <option value="pressure">Pressure</option>
                <option value="clean">Clean</option>
                <option value="seize">Seize</option>
              </select>
            </label>
            <label>
              Scheme Effect
              <select value={schemeEffect} onChange={(e) => setSchemeEffect(e.target.value as 'evidence' | 'heat')}>
                <option value="evidence">Toothpicks / Evidence</option>
                <option value="heat">Heat</option>
              </select>
            </label>
            <button onClick={() => run(() => applyAction(performScheme(state, state.currentPlayerId, {
              intent: schemeIntent,
              targetEffect: schemeEffect,
            }).state))}>
              Scheme
            </button>

            <label>
              Force Mode
              <select value={forceMode} onChange={(e) => setForceMode(e.target.value as 'private' | 'public')}>
                <option value="private">Private clash</option>
                <option value="public">Public spectacle</option>
              </select>
            </label>
            <label>
              Force Intent
              <select value={forceIntent} onChange={(e) => setForceIntent(e.target.value as 'pressure' | 'seize')}>
                <option value="pressure">Pressure</option>
                <option value="seize">Seize</option>
              </select>
            </label>
            <button onClick={handleForceAction}>
              Force
            </button>

            <label>
              Special Target / Destination
              <select value={specialDestination} onChange={(e) => setSpecialDestination(e.target.value as BusinessId)}>
                {BUSINESSES.filter((business) => business.id !== currentPlayer.position).map((business) => (
                  <option key={business.id} value={business.id}>{business.shortName}</option>
                ))}
              </select>
            </label>
            <label>
              Special Choice
              <select
                value={specialChoice}
                onChange={(e) =>
                  setSpecialChoice(
                    e.target.value as 'gain_headline' | 'pull_headline' | 'clear_self' | 'blank_target' | 'heat' | 'legend',
                  )
                }
              >
                <option value="gain_headline">Gain Headline</option>
                <option value="pull_headline">Pull Headline</option>
                <option value="clear_self">Clear Self</option>
                <option value="blank_target">Blank Target</option>
                <option value="heat">Convert to Heat</option>
                <option value="legend">Convert to Legend</option>
              </select>
            </label>
            <button onClick={() => run(() => applyAction(performFactionSpecial(state, state.currentPlayerId, {
              destinationBusinessId: specialDestination,
              sourceBusinessId: selectedBusinessId,
              choose: specialChoice,
              useSecretRoute: true,
            }).state))}>
              Faction Special
            </button>
          </section>

          {lastClash && (
            <section className="card dice-card">
              <div className="eyebrow">Visible Dice Tray</div>
              <h2>Last Clash at {BUSINESS_MAP[lastClash.businessId].shortName}</h2>
              <div className="pill-row">
                <span className="pill">{lastClash.mode === 'public' ? 'Public spectacle' : 'Private clash'}</span>
                <span className="pill">Intent: {lastClash.intent}</span>
                <span className={`pill ${lastClash.winnerPlayerId === lastClash.attackerId ? 'found' : ''}`}>Winner: {lastClash.winnerPlayerId}</span>
                {lastClash.controllerChanged && <span className="pill found">Venue seized</span>}
              </div>

              <div className="dice-clash-grid">
                <div className={`dice-side ${lastClash.winnerPlayerId === lastClash.attackerId ? 'winner' : ''}`} key={`attacker-${lastClash.sequence}`}>
                  <div className="dice-side-header">
                    <span>Attacker</span>
                    <strong>{lastClash.attackerId}</strong>
                  </div>
                  <DiceFace value={lastClash.attackRoll} />
                  <div className="dice-math">
                    <span>Roll {lastClash.attackRoll}</span>
                    <span>Modifier {lastClash.attackModifier >= 0 ? `+${lastClash.attackModifier}` : lastClash.attackModifier}</span>
                    <strong>Total {lastClash.attackTotal}</strong>
                  </div>
                </div>

                <div className={`dice-side ${lastClash.winnerPlayerId === lastClash.targetRivalId ? 'winner' : ''}`} key={`defender-${lastClash.sequence}`}>
                  <div className="dice-side-header">
                    <span>Defender</span>
                    <strong>{lastClash.targetRivalId}</strong>
                  </div>
                  <DiceFace value={lastClash.defenseRoll} />
                  <div className="dice-math">
                    <span>Roll {lastClash.defenseRoll}</span>
                    <span>Modifier {lastClash.defenseModifier >= 0 ? `+${lastClash.defenseModifier}` : lastClash.defenseModifier}</span>
                    <strong>Total {lastClash.defenseTotal}</strong>
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="card deck-card">
            <div className="eyebrow">Venue Deck / Held Cards</div>
            <div className="deck-header">
              <div className="deck-stack" aria-label={`${selectedTile.hiddenCardIds.length} face-down cards at ${BUSINESS_MAP[selectedBusinessId].shortName}`}>
                {Array.from({ length: Math.max(1, Math.min(3, selectedTile.hiddenCardIds.length || 1)) }, (_, index) => (
                  <span key={`stack-${selectedBusinessId}-${index}`} className="deck-stack-card" />
                ))}
                <span className="deck-stack-count">{selectedTile.hiddenCardIds.length}</span>
              </div>
              <div>
                <h2>{BUSINESS_MAP[selectedBusinessId].shortName} Deck</h2>
                <p>Search now visibly draws the top hidden card. Click any shown card to flip it. Hold pins a card like it is in your hand.</p>
              </div>
            </div>

            {lastDrawnCardId ? (
              <div className="draw-zone">
                <div className="mini-controls">
                  <button onClick={() => toggleHiddenCard(lastDrawnCardId)}>{flippedCardIds.includes(lastDrawnCardId) ? 'Turn Face Down' : 'Flip Drawn Card'}</button>
                  <button onClick={() => toggleHeldCard(lastDrawnCardId)}>{heldCardId === lastDrawnCardId ? 'Release Hold' : 'Hold Drawn Card'}</button>
                </div>
                <HiddenPlayCard
                  cardId={lastDrawnCardId}
                  faceUp={flippedCardIds.includes(lastDrawnCardId)}
                  held={heldCardId === lastDrawnCardId}
                  fresh
                  onFlip={() => toggleHiddenCard(lastDrawnCardId)}
                />
              </div>
            ) : (
              <p className="story-note">No card drawn yet this turn. Hit Search / Draw at a venue with hidden cards to pull one into view.</p>
            )}

            <div className="deck-preview-grid">
              <div>
                <div className="eyebrow">Face-down at this venue</div>
                <div className="card-fan">
                  {selectedTileFaceDownCardIds.length > 0 ? (
                    selectedTileFaceDownCardIds.map((cardId) => (
                      <HiddenPlayCard
                        key={`down-${cardId}`}
                        cardId={cardId}
                        faceUp={false}
                        onFlip={() => toggleHiddenCard(cardId)}
                      />
                    ))
                  ) : (
                    <div className="empty-card-state">No face-down cards left here.</div>
                  )}
                </div>
              </div>

              <div>
                <div className="eyebrow">Current player's hand</div>
                <div className="card-fan">
                  {currentPlayerHandCardIds.length > 0 ? (
                    currentPlayerHandCardIds.slice(0, 5).map((cardId) => (
                      <div key={`hand-${cardId}`} className="hand-card-wrap">
                        <HiddenPlayCard
                          cardId={cardId}
                          faceUp={flippedCardIds.includes(cardId)}
                          held={heldCardId === cardId}
                          onFlip={() => toggleHiddenCard(cardId)}
                        />
                        <button onClick={() => toggleHeldCard(cardId)}>{heldCardId === cardId ? 'Release' : 'Hold'}</button>
                      </div>
                    ))
                  ) : (
                    <div className="empty-card-state">Search reveals cards into your hand.</div>
                  )}
                </div>
              </div>
            </div>

            {selectedTileFaceUpCardIds.length > 0 && (
              <div>
                <div className="eyebrow">Revealed on table</div>
                <div className="table-row">
                  {selectedTileFaceUpCardIds.map((cardId) => (
                    <div key={`table-${cardId}`} className="table-card-pill">
                      {HIDDEN_CARD_MAP[cardId]?.name ?? cardId}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="card">
            <div className="eyebrow">Current Faction</div>
            <h2>{FACTION_MAP[currentPlayer.factionId].name}</h2>
            <p><strong>{FACTION_MAP[currentPlayer.factionId].activeName}</strong> — {FACTION_MAP[currentPlayer.factionId].activeText}</p>
            <p>{FACTION_MAP[currentPlayer.factionId].passiveText}</p>
            <p><strong>Story hook:</strong> {currentFactionStory.hook}</p>
            <p><strong>Hated venue:</strong> {BUSINESS_MAP[currentFactionStory.hatedVenueId].name} — {currentFactionStory.hatedVenueReason}</p>
          </section>

          <section className="card">
            <div className="eyebrow">Selected Venue / Story Skin</div>
            <h2>{BUSINESS_MAP[selectedBusinessId].name}</h2>
            <p>{BUSINESS_MAP[selectedBusinessId].controlText}</p>
            <div className="stat-row"><span>Region</span><strong>{selectedRegion.name}</strong></div>
            <div className="stat-row"><span>Board role</span><strong>{BUSINESS_BOARD_DETAILS[selectedBusinessId].role}</strong></div>
            <div className="stat-row"><span>Route mode</span><strong>{BUSINESS_BOARD_DETAILS[selectedBusinessId].routeMode}</strong></div>
            <div className="stat-row"><span>Landmark</span><strong>{BUSINESS_BOARD_DETAILS[selectedBusinessId].landmark}</strong></div>
            <div className="stat-row"><span>Pressure line</span><strong>{BUSINESS_BOARD_DETAILS[selectedBusinessId].pressure}</strong></div>
            <div className="stat-row"><span>Neighbors</span><strong>{BUSINESS_MAP[selectedBusinessId].neighbors.map((id) => BUSINESS_MAP[id].shortName).join(', ')}</strong></div>
            <div className="stat-row"><span>Reward lane</span><strong>{BUSINESS_MAP[selectedBusinessId].rewardLane.join(', ')}</strong></div>
            <div className="stat-row"><span>Discovery tags</span><strong>{BUSINESS_MAP[selectedBusinessId].discoveryTags.join(', ')}</strong></div>
            <div className="stat-row"><span>Controller</span><strong>{selectedTile.controllerPlayerId ?? 'None'}</strong></div>
            <div className="stat-row"><span>Hidden cards</span><strong>{selectedTile.hiddenCardIds.join(', ') || 'None'}</strong></div>
            <div className="stat-row"><span>Revealed cards</span><strong>{selectedTile.revealedCardIds.join(', ') || 'None'}</strong></div>
          </section>
        </aside>
      </main>

      <section className="hud-grid lower-grid">
        <article className="card episode-card">
          <div className="eyebrow">Episode Card</div>
          <div className="mini-controls">
            <button onClick={() => setEpisodeCardFaceUp((current) => !current)}>{episodeCardFaceUp ? 'Turn Face Down' : 'Flip Episode Card'}</button>
            <button onClick={() => setHeldStoryCard((current) => (current === 'episode' ? null : 'episode'))}>{heldStoryCard === 'episode' ? 'Release Hold' : 'Hold Episode Card'}</button>
          </div>
          <StoryPlayCard
            eyebrow="Episode Frame"
            title={episode.name}
            summary={episode.revealText}
            body={`${episode.passiveRule} Score: ${episode.scoreRule}`}
            chips={[episode.closerLabel, `Round ${state.round}`, `Spotlight ${spotlightTier}`]}
            faceUp={episodeCardFaceUp}
            held={heldStoryCard === 'episode'}
            accent="episode"
            deckLabel={`1 of ${SCRIPT_EPISODES.length}`}
            onFlip={() => setEpisodeCardFaceUp((current) => !current)}
          />
          {scriptPullNumbers.length > 0 && (
            <div className="pill-row">
              {scriptPullNumbers.map((episodeNumber) => (
                <button
                  key={episodeNumber}
                  className="mini-pill-button"
                  onClick={() => setSelectedScriptEpisodeNumber(episodeNumber)}
                >
                  Script pull: Episode {episodeNumber}
                </button>
              ))}
            </div>
          )}
          <div className="pill-row">
            {episode.searchTargets.map((target) => {
              const found = state.episodeProgressByPlayerId[state.currentPlayerId].foundTargetNames.includes(target)
              return (
                <span key={target} className={`pill ${found ? 'found' : ''}`}>
                  {target}
                </span>
              )
            })}
          </div>
          <p><strong>Passive:</strong> {episode.passiveRule}</p>
          <p><strong>Score:</strong> {episode.scoreRule}</p>
          <p><strong>{episode.closerLabel}:</strong> {episode.closerRule}</p>
          {state.winnerPlayerId && (
            <p className="winner-banner">
              Winner: {state.winnerPlayerId} — {state.winnerReason}
            </p>
          )}
        </article>


        <article className="card campaign-card">
          <div className="eyebrow">10-Episode Campaign Deck</div>
          <h2>Episode {selectedScriptEpisode.number} — {selectedScriptEpisode.title}</h2>
          <p>{selectedScriptEpisode.shortHook}</p>
          <div className="mini-controls">
            <button
              onClick={() =>
                setSelectedScriptEpisodeNumber((current) => (current === 1 ? SCRIPT_EPISODES.length : current - 1))
              }
            >
              Previous Episode
            </button>
            <button
              onClick={() =>
                setSelectedScriptEpisodeNumber((current) => (current === SCRIPT_EPISODES.length ? 1 : current + 1))
              }
            >
              Next Episode
            </button>
          </div>
          <div className="episode-number-row">
            {SCRIPT_EPISODES.map((entry) => (
              <button
                key={entry.number}
                className={`episode-index-button ${entry.number === selectedScriptEpisode.number ? 'active' : ''}`}
                onClick={() => setSelectedScriptEpisodeNumber(entry.number)}
              >
                {entry.number}
              </button>
            ))}
          </div>
          <p><strong>Synopsis:</strong> {selectedScriptEpisode.synopsis}</p>
          <p><strong>Board hook:</strong> {selectedScriptEpisode.boardHook}</p>
          <p><strong>Win path:</strong> {selectedScriptEpisode.winPath}</p>
          <div className="stat-row"><span>Featured cast</span><strong>{selectedScriptEpisode.featuredCast.join(', ')}</strong></div>
          <div className="stat-row"><span>Featured venues</span><strong>{selectedScriptEpisode.featuredVenues.join(', ')}</strong></div>
        </article>

        <article className="card lore-card">
          <div className="eyebrow">Lore / Discovery Deck</div>
          <div className="mini-controls">
            <button
              onClick={() =>
                setLoreIndex((current) => (current === 0 ? LORE_CARDS.length - 1 : current - 1))
              }
            >
              Previous Card
            </button>
            <button onClick={() => setLoreIndex((current) => (current + 1) % LORE_CARDS.length)}>
              Next Card
            </button>
            <button onClick={() => setLoreCardFaceUp((current) => !current)}>{loreCardFaceUp ? 'Turn Face Down' : 'Flip Lore Card'}</button>
            <button onClick={() => setHeldStoryCard((current) => (current === 'lore' ? null : 'lore'))}>{heldStoryCard === 'lore' ? 'Release Hold' : 'Hold Lore Card'}</button>
          </div>
          <StoryPlayCard
            eyebrow="Lore / Discovery"
            title={activeLoreCard.question}
            summary={activeLoreCard.answer}
            body={`Tag: ${activeLoreCard.tag}`}
            chips={[activeLoreCard.tag, `Card ${loreIndex + 1}`, `${LORE_CARDS.length} total`]}
            faceUp={loreCardFaceUp}
            held={heldStoryCard === 'lore'}
            accent="lore"
            deckLabel={`Lore ${loreIndex + 1}/${LORE_CARDS.length}`}
            onFlip={() => setLoreCardFaceUp((current) => !current)}
          />
        </article>
        <article className="card log-panel">
          <div className="eyebrow">Match Log</div>
          <h2>Recent Events</h2>
          <div className="log-list">
            {[...state.log].reverse().map((entry, index) => (
              <div key={`${entry}-${index}`} className="log-entry">{entry}</div>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}

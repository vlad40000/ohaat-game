import { BUSINESSES, BUSINESS_MAP, type BusinessId } from '../data/businesses';
import { EPISODES, STARTER_EPISODE_IDS, type EpisodeId } from '../data/episodes';
import { HIDDEN_CARDS } from '../data/hiddenCards';
import type { FactionId } from '../data/factions';
import type { MatchState, PlayerState, SetupGameOptions, TileState } from './types';

const DEFAULT_STARTING_CASH = 3;
const START_POSITIONS: BusinessId[] = [
  'mayors_office',
  'sonnys_strike_zone',
  'critter_corral',
  'swamp_signal_co',
];

function hashSeed(seed: string): number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i += 1) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h >>> 0) || 1;
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function choose<T>(items: T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length)];
}

function chooseEpisodeId(rng: () => number, useAllEpisodes: boolean): EpisodeId {
  const pool = useAllEpisodes
    ? (EPISODES.map((episode) => episode.id) as EpisodeId[])
    : STARTER_EPISODE_IDS;
  return choose(pool, rng);
}

function buildInitialPlayers(
  playerIds: string[],
  factionIds: FactionId[],
  startingCash: number,
): Record<string, PlayerState> {
  return Object.fromEntries(
    playerIds.map((playerId, index) => {
      const startPosition = START_POSITIONS[index % START_POSITIONS.length];
      const player: PlayerState = {
        id: playerId,
        factionId: factionIds[index],
        legend: 0,
        heat: 0,
        evidence: 0,
        cash: startingCash,
        headlineTokens: 0,
        merchLines: 0,
        position: startPosition,
        controlledBusinessIds: [],
        revealedCardIds: [],
        actionCount: 3,
        specialsUsedThisRound: [],
        capturedByPlayerId: undefined,
      };
      return [playerId, player];
    }),
  );
}

function distributeHiddenCards(rng: () => number): Record<BusinessId, string[]> {
  const perTile = BUSINESSES.reduce<Record<BusinessId, string[]>>((acc, business) => {
    acc[business.id] = [];
    return acc;
  }, {} as Record<BusinessId, string[]>);

  const coreCards = HIDDEN_CARDS.filter((card) => card.kind === 'core');
  const remainingCards = shuffle(
    HIDDEN_CARDS.filter((card) => card.kind !== 'core'),
    rng,
  );

  for (const card of coreCards) {
    const home = card.homeBusinessIds[0];
    perTile[home].push(card.id);
  }

  for (const card of remainingCards) {
    const eligible = card.homeBusinessIds.length > 0 ? [...card.homeBusinessIds] : BUSINESSES.map((b) => b.id);
    eligible.sort((a, b) => perTile[a].length - perTile[b].length);

    let placed = false;
    for (const businessId of eligible) {
      if (perTile[businessId].length < 3) {
        perTile[businessId].push(card.id);
        placed = true;
        break;
      }
    }

    if (!placed) {
      const fallback = BUSINESSES.map((business) => business.id)
        .sort((a, b) => perTile[a].length - perTile[b].length)
        .find((businessId) => perTile[businessId].length < 3);

      if (!fallback) {
        throw new Error(`Unable to place hidden card ${card.id}`);
      }

      perTile[fallback].push(card.id);
    }
  }

  for (const business of BUSINESSES) {
    if (perTile[business.id].length !== 3) {
      throw new Error(
        `Hidden-card distribution failed for ${business.id}. Expected 3, got ${perTile[business.id].length}.`,
      );
    }
  }

  return perTile;
}

function buildInitialTiles(rng: () => number): Record<BusinessId, TileState> {
  const hiddenDistribution = distributeHiddenCards(rng);

  return Object.fromEntries(
    BUSINESSES.map((business) => {
      const tile: TileState = {
        businessId: business.id,
        hiddenCardIds: hiddenDistribution[business.id],
        revealedCardIds: [],
        contestedByPlayerIds: [],
        exposed: false,
        auditCount: 0,
        searchCount: 0,
        fortifiedByPlayerId: undefined,
        headlineTokenCount: 0,
      };
      return [business.id, tile];
    }),
  ) as Record<BusinessId, TileState>;
}

function initializePerPlayerNumberMap(
  playerIds: string[],
  initialValue = 0,
): Record<string, number> {
  return Object.fromEntries(playerIds.map((playerId) => [playerId, initialValue]));
}

function initializePerPlayerArrayMap(playerIds: string[]): Record<string, string[]> {
  return Object.fromEntries(playerIds.map((playerId) => [playerId, []]));
}

function initializeSnorp(
  episodeId: EpisodeId,
  tiles: Record<BusinessId, TileState>,
  rng: () => number,
) {
  if (episodeId !== 'return_of_snorp') {
    return {
      active: false,
      tileBusinessId: undefined,
      moves: 0,
      corneredByPlayerId: undefined,
    };
  }

  const eligibleTiles = BUSINESSES.map((business) => business.id).filter(
    (businessId) => tiles[businessId].hiddenCardIds.length > 0,
  );

  const snorpTileBusinessId = choose(eligibleTiles, rng);

  return {
    active: true,
    tileBusinessId: snorpTileBusinessId,
    moves: 0,
    corneredByPlayerId: undefined,
  };
}

export function setupGame(options: SetupGameOptions): MatchState {
  const {
    playerIds,
    factionIds,
    seed = `seed-${Date.now()}`,
    useAllEpisodes = false,
    startingCash = DEFAULT_STARTING_CASH,
  } = options;

  if (playerIds.length < 2) throw new Error('setupGame requires at least 2 players.');
  if (playerIds.length !== factionIds.length) throw new Error('playerIds and factionIds must have the same length.');
  if (new Set(factionIds).size !== factionIds.length) throw new Error('Each player must receive a unique faction.');

  const seedNumber = hashSeed(seed);
  const rng = mulberry32(seedNumber);
  const players = buildInitialPlayers(playerIds, factionIds, startingCash);
  const tiles = buildInitialTiles(rng);
  const activeEpisodeId = chooseEpisodeId(rng, useAllEpisodes);

  const state: MatchState = {
    seed,
    round: 1,
    turnNumber: 1,
    currentPlayerId: playerIds[0],
    playerOrder: [...playerIds],
    activeEpisodeId,
    episodeProgressByPlayerId: Object.fromEntries(
      playerIds.map((playerId) => [
        playerId,
        {
          foundTargetNames: [],
          bonusClaimed: false,
        },
      ]),
    ),
    players,
    tiles,
    log: [`Game seeded with ${seed}.`, `Episode revealed: ${BUSINESS_MAP[players[playerIds[0]].position].shortName ? activeEpisodeId : activeEpisodeId}.`],
    snorp: initializeSnorp(activeEpisodeId, tiles, rng),
    flags: {
      publicClashWinsAtSonnysByPlayerId: initializePerPlayerNumberMap(playerIds),
      exposedBusinessesByPlayerId: initializePerPlayerNumberMap(playerIds),
      successfulDefenseCountByPlayerId: initializePerPlayerNumberMap(playerIds),
      defendedBusinessStreakByPlayerId: Object.fromEntries(
        playerIds.map((playerId) => [playerId, { businessId: undefined, count: 0 }]),
      ),
      backRoomRewardKeysByPlayerId: initializePerPlayerArrayMap(playerIds),
      merchLinesMaintainedFullRoundByPlayerId: initializePerPlayerNumberMap(playerIds),
      secretRouteUsedThisRoundByPlayerId: initializePerPlayerNumberMap(playerIds),
      rescueBonusMoveUsedThisRoundByPlayerId: initializePerPlayerNumberMap(playerIds),
    },
  };

  if (state.snorp.active && state.snorp.tileBusinessId) {
    state.log.push(`Snorp hidden at ${BUSINESS_MAP[state.snorp.tileBusinessId].name}.`);
  }

  return state;
}

export function resetActionsForCurrentPlayer(state: MatchState): MatchState {
  const next = structuredClone(state) as MatchState;
  const currentPlayer = next.players[next.currentPlayerId];
  currentPlayer.actionCount = 3;
  currentPlayer.specialsUsedThisRound = [];
  return next;
}

export function advanceTurn(state: MatchState): MatchState {
  const next = structuredClone(state) as MatchState;
  const currentIndex = next.playerOrder.indexOf(next.currentPlayerId);
  const nextIndex = (currentIndex + 1) % next.playerOrder.length;
  const isNewRound = nextIndex === 0;

  next.currentPlayerId = next.playerOrder[nextIndex];
  next.turnNumber += 1;

  if (isNewRound) {
    next.round += 1;
    for (const playerId of next.playerOrder) {
      next.flags.secretRouteUsedThisRoundByPlayerId[playerId] = 0;
      next.flags.rescueBonusMoveUsedThisRoundByPlayerId[playerId] = 0;
    }
  }

  next.players[next.currentPlayerId].actionCount = 3;
  next.players[next.currentPlayerId].specialsUsedThisRound = [];

  for (const tile of Object.values(next.tiles)) {
    if (tile.fortifiedByPlayerId === next.currentPlayerId) {
      tile.fortifiedByPlayerId = undefined;
    }
  }

  return next;
}

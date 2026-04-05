import { BUSINESS_MAP, type BusinessId } from '../data/businesses';
import type { MatchState } from './types';
import { getSpotlightModifier } from './story';

export interface ForceOptions {
  attackRoll?: number;
  defenseRoll?: number;
  targetRivalId?: string;
  mode?: 'private' | 'public';
  intent?: 'pressure' | 'seize';
}

export interface ForceResult {
  state: MatchState;
  success: boolean;
  businessId: BusinessId;
  targetRivalId: string;
  attackRoll: number;
  defenseRoll: number;
  attackModifier: number;
  defenseModifier: number;
  attackTotal: number;
  defenseTotal: number;
  winnerPlayerId: string;
  controllerChanged: boolean;
}

function pushLog(state: MatchState, message: string) {
  state.log.push(message);
}

function rollD6() {
  return Math.floor(Math.random() * 6) + 1;
}

function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids)];
}

function syncControlledBusinessLists(state: MatchState) {
  for (const playerId of state.playerOrder) state.players[playerId].controlledBusinessIds = [];
  for (const tile of Object.values(state.tiles)) {
    if (tile.controllerPlayerId) state.players[tile.controllerPlayerId].controlledBusinessIds.push(tile.businessId);
  }
}

function addLegend(state: MatchState, playerId: string, amount: number, reason: string) {
  state.players[playerId].legend += amount;
  pushLog(state, `${playerId} gains ${amount} Legend (${reason}).`);
}

function getRivalsAtBusiness(
  state: MatchState,
  businessId: BusinessId,
  excludingPlayerId?: string,
): string[] {
  return state.playerOrder.filter((playerId) => {
    if (excludingPlayerId && playerId === excludingPlayerId) return false;
    return state.players[playerId].position === businessId;
  });
}

function validateForce(state: MatchState, playerId: string) {
  if (state.winnerPlayerId) throw new Error('Cannot use Force after the game has been won.');
  if (state.currentPlayerId !== playerId) throw new Error('Only the current player may use Force.');
  const player = state.players[playerId];
  if (!player) throw new Error(`Unknown player: ${playerId}`);
  if (player.actionCount < 1) throw new Error(`${playerId} has no actions remaining.`);
}

function chooseTargetRivalId(
  state: MatchState,
  playerId: string,
  businessId: BusinessId,
  explicitTargetRivalId?: string,
): string {
  if (explicitTargetRivalId) {
    if (!state.players[explicitTargetRivalId]) throw new Error(`Unknown target rival: ${explicitTargetRivalId}`);
    if (state.players[explicitTargetRivalId].position !== businessId) {
      throw new Error(`${explicitTargetRivalId} is not at ${BUSINESS_MAP[businessId].shortName}.`);
    }
    return explicitTargetRivalId;
  }

  const rivals = getRivalsAtBusiness(state, businessId, playerId);
  if (rivals.length === 0) throw new Error(`No rival is present at ${BUSINESS_MAP[businessId].shortName}.`);
  return rivals[0];
}

function computeAttackModifier(
  state: MatchState,
  attackerId: string,
  defenderId: string,
  businessId: BusinessId,
  mode: 'private' | 'public',
): number {
  const tile = state.tiles[businessId];
  let modifier = 0;
  if (tile.exposed) modifier += 1;
  if (tile.auditCount > 0) modifier += tile.auditCount;
  if (state.activeEpisodeId === 'bowling_alley_bloodbath' && businessId === 'sonnys_strike_zone' && mode === 'public') modifier += 1;
  if (state.activeEpisodeId === 'return_of_snorp' && state.snorp.active && state.snorp.tileBusinessId === businessId) modifier += 1;
  if (state.players[attackerId].factionId === 'hans_and_soupy' && state.tiles[businessId].controllerPlayerId === defenderId) modifier += 1;
  modifier += getSpotlightModifier(state, businessId, mode);
  return modifier;
}

function computeDefenseModifier(
  state: MatchState,
  defenderId: string,
  businessId: BusinessId,
  mode: 'private' | 'public',
): number {
  const tile = state.tiles[businessId];
  let modifier = 0;
  if (tile.controllerPlayerId === defenderId) modifier += 1;
  if (state.players[defenderId].factionId === 'buck_and_stump' && tile.controllerPlayerId === defenderId) modifier += 1;
  if (state.activeEpisodeId === 'siege_of_the_fortress' && tile.controllerPlayerId === defenderId) modifier += 1;
  if (state.activeEpisodeId === 'bowling_alley_bloodbath' && businessId === 'sonnys_strike_zone' && mode === 'public') modifier += 1;
  if (tile.fortifiedByPlayerId === defenderId) modifier += 1;
  return modifier;
}

function markPublicClashWinAtSonnys(state: MatchState, winnerPlayerId: string) {
  if (!state.flags.publicClashWinsAtSonnysByPlayerId[winnerPlayerId]) {
    state.flags.publicClashWinsAtSonnysByPlayerId[winnerPlayerId] = 0;
  }
  state.flags.publicClashWinsAtSonnysByPlayerId[winnerPlayerId] += 1;
  if (state.activeEpisodeId === 'bowling_alley_bloodbath') {
    state.players[winnerPlayerId].headlineTokens += 1;
    pushLog(state, `${winnerPlayerId} wins a public clash at Sonny’s and gains 1 Headline token.`);
  }
}

function markSuccessfulDefense(state: MatchState, defenderId: string, businessId: BusinessId) {
  if (!state.flags.successfulDefenseCountByPlayerId[defenderId]) {
    state.flags.successfulDefenseCountByPlayerId[defenderId] = 0;
  }
  state.flags.successfulDefenseCountByPlayerId[defenderId] += 1;

  const streak = state.flags.defendedBusinessStreakByPlayerId[defenderId];
  if (streak.businessId === businessId) {
    streak.count += 1;
  } else {
    streak.businessId = businessId;
    streak.count = 1;
  }

  if (state.activeEpisodeId === 'siege_of_the_fortress') addLegend(state, defenderId, 2, 'successful fortress defense');
}

function handleAttackerWin(
  state: MatchState,
  attackerId: string,
  defenderId: string,
  businessId: BusinessId,
  intent: 'pressure' | 'seize',
): boolean {
  const tile = state.tiles[businessId];
  const defenderControlled = tile.controllerPlayerId === defenderId;
  let controllerChanged = false;
  tile.contestedByPlayerIds = uniqueIds([...tile.contestedByPlayerIds, attackerId, defenderId]);

  if (defenderControlled && intent === 'seize') {
    tile.controllerPlayerId = attackerId;
    tile.contestedByPlayerIds = [];
    tile.exposed = false;
    tile.auditCount = 0;
    tile.fortifiedByPlayerId = undefined;
    syncControlledBusinessLists(state);
    controllerChanged = true;
    pushLog(state, `${attackerId} wins the clash and seizes ${BUSINESS_MAP[businessId].shortName} from ${defenderId}.`);
    return controllerChanged;
  }

  if (defenderControlled) {
    tile.exposed = true;
    tile.auditCount += 1;
    tile.fortifiedByPlayerId = undefined;
    pushLog(state, `${attackerId} wins the clash and exposes ${defenderId}'s hold on ${BUSINESS_MAP[businessId].shortName}.`);
    return controllerChanged;
  }

  pushLog(state, `${attackerId} wins the clash at ${BUSINESS_MAP[businessId].shortName}.`);
  return controllerChanged;
}

function handleDefenderWin(state: MatchState, attackerId: string, defenderId: string, businessId: BusinessId) {
  const tile = state.tiles[businessId];
  tile.contestedByPlayerIds = uniqueIds([...tile.contestedByPlayerIds, attackerId, defenderId]);
  if (tile.controllerPlayerId === defenderId) {
    markSuccessfulDefense(state, defenderId, businessId);
    pushLog(state, `${defenderId} holds ${BUSINESS_MAP[businessId].shortName} against ${attackerId}.`);
    return;
  }
  pushLog(state, `${defenderId} repels ${attackerId} at ${BUSINESS_MAP[businessId].shortName}.`);
}

export function performForce(
  state: MatchState,
  playerId: string,
  options: ForceOptions = {},
): ForceResult {
  validateForce(state, playerId);

  const next = structuredClone(state) as MatchState;
  const attacker = next.players[playerId];
  const businessId = attacker.position;
  const mode = options.mode ?? 'private';
  const intent = options.intent ?? 'pressure';
  const targetRivalId = chooseTargetRivalId(next, playerId, businessId, options.targetRivalId);

  const attackRoll = options.attackRoll ?? rollD6();
  const defenseRoll = options.defenseRoll ?? rollD6();
  const attackModifier = computeAttackModifier(next, playerId, targetRivalId, businessId, mode);
  const defenseModifier = computeDefenseModifier(next, targetRivalId, businessId, mode);
  const attackTotal = attackRoll + attackModifier;
  const defenseTotal = defenseRoll + defenseModifier;

  attacker.actionCount -= 1;
  pushLog(next, `${playerId} uses Force against ${targetRivalId} at ${BUSINESS_MAP[businessId].shortName} (${attackRoll} + ${attackModifier} vs ${defenseRoll} + ${defenseModifier}).`);

  let success = false;
  let winnerPlayerId = targetRivalId;
  let controllerChanged = false;

  if (attackTotal > defenseTotal) {
    success = true;
    winnerPlayerId = playerId;
    controllerChanged = handleAttackerWin(next, playerId, targetRivalId, businessId, intent);
  } else {
    handleDefenderWin(next, playerId, targetRivalId, businessId);
  }

  if (businessId === 'sonnys_strike_zone' && mode === 'public') {
    markPublicClashWinAtSonnys(next, winnerPlayerId);
  }

  return {
    state: next,
    success,
    businessId,
    targetRivalId,
    attackRoll,
    defenseRoll,
    attackModifier,
    defenseModifier,
    attackTotal,
    defenseTotal,
    winnerPlayerId,
    controllerChanged,
  };
}

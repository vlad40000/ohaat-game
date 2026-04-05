import { BUSINESS_MAP, type BusinessId } from '../data/businesses';
import type { MatchState } from './types';
import { getSpotlightModifier } from './story';

export interface SchemeOptions {
  roll?: number;
  targetRivalId?: string;
  targetEffect?: 'evidence' | 'heat';
  intent?: 'pressure' | 'clean' | 'seize';
}

export interface SchemeResult {
  state: MatchState;
  success: boolean;
  roll: number;
  modifier: number;
  total: number;
  businessId: BusinessId;
}

const BASE_SCHEME_TARGET = 4;

function pushLog(state: MatchState, message: string) {
  state.log.push(message);
}

function rollD6() {
  return Math.floor(Math.random() * 6) + 1;
}

function clampMin(value: number, min = 0) {
  return Math.max(min, value);
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

function validateScheme(state: MatchState, playerId: string) {
  if (state.winnerPlayerId) throw new Error('Cannot scheme after the game has been won.');
  if (state.currentPlayerId !== playerId) throw new Error('Only the current player may scheme.');
  const player = state.players[playerId];
  if (!player) throw new Error(`Unknown player: ${playerId}`);
  if (player.actionCount < 1) throw new Error(`${playerId} has no actions remaining.`);
}

function getPlayersAtBusiness(
  state: MatchState,
  businessId: BusinessId,
  excludingPlayerId?: string,
): string[] {
  return state.playerOrder.filter((playerId) => {
    if (excludingPlayerId && playerId === excludingPlayerId) return false;
    return state.players[playerId].position === businessId;
  });
}

function chooseTargetRivalId(
  state: MatchState,
  playerId: string,
  businessId: BusinessId,
  explicitTargetRivalId?: string,
): string | undefined {
  if (explicitTargetRivalId) return explicitTargetRivalId;
  const rivalsHere = getPlayersAtBusiness(state, businessId, playerId);
  return rivalsHere[0];
}

function computeSchemeModifier(
  state: MatchState,
  playerId: string,
  businessId: BusinessId,
  intent: 'pressure' | 'clean' | 'seize',
): number {
  const tile = state.tiles[businessId];
  const player = state.players[playerId];
  let modifier = 0;

  if (tile.auditCount > 0) modifier += 1;
  if (tile.exposed) modifier += 1;
  if (tile.controllerPlayerId === playerId) modifier += 1;
  if (intent === 'clean' && (player.heat > 0 || player.evidence > 0)) modifier += 1;
  modifier += getSpotlightModifier(state, businessId, 'public');

  if (
    player.factionId === 'roger_and_anita' &&
    tile.controllerPlayerId &&
    tile.controllerPlayerId !== playerId &&
    state.players[tile.controllerPlayerId].evidence > 0
  ) {
    modifier += 1;
  }

  return modifier;
}

function applySchemeFailure(state: MatchState, playerId: string, businessId: BusinessId) {
  if (state.activeEpisodeId === 'christmas_conversion_drive') {
    state.players[playerId].heat += 1;
    pushLog(state, `${playerId} fails a Scheme during Christmas Conversion Drive and gains 1 Heat.`);
  } else {
    pushLog(state, `${playerId}'s Scheme fails at ${BUSINESS_MAP[businessId].shortName}.`);
  }
}

function applyWrongManLegendBonus(state: MatchState, playerId: string) {
  if (state.activeEpisodeId !== 'wrong_man_on_trial') return;
  addLegend(state, playerId, 2, 'Wrong Man on Trial scheme bonus');
}

function exposeBusiness(state: MatchState, playerId: string, controllerId: string, businessId: BusinessId) {
  const tile = state.tiles[businessId];
  const firstExposure = !tile.exposed;
  tile.exposed = true;
  tile.auditCount += 1;
  state.players[controllerId].heat += 1;
  tile.contestedByPlayerIds = uniqueIds([...tile.contestedByPlayerIds, playerId, controllerId]);
  if (firstExposure) state.flags.exposedBusinessesByPlayerId[playerId] += 1;
  pushLog(state, `${playerId} exposes ${controllerId}'s hold on ${BUSINESS_MAP[businessId].shortName}, adds an Audit marker, and gives ${controllerId} 1 Heat.`);
}

function cleanBusinessOrPlayer(state: MatchState, playerId: string, businessId: BusinessId) {
  const tile = state.tiles[businessId];
  const player = state.players[playerId];

  if (tile.controllerPlayerId === playerId && (tile.exposed || tile.auditCount > 0)) {
    if (tile.auditCount > 0) tile.auditCount -= 1;
    if (tile.auditCount === 0) tile.exposed = false;
    pushLog(state, `${playerId} stabilizes ${BUSINESS_MAP[businessId].shortName} and reduces its exposure pressure.`);
    return;
  }

  if (player.heat > 0) {
    player.heat = clampMin(player.heat - 1);
    pushLog(state, `${playerId} cleans up 1 Heat.`);
    return;
  }

  if (player.evidence > 0) {
    player.evidence = clampMin(player.evidence - 1);
    pushLog(state, `${playerId} removes 1 Evidence from themselves.`);
    return;
  }

  player.cash += 1;
  pushLog(state, `${playerId} converts a clean Scheme into +1 Cash.`);
}

function seizeBusiness(state: MatchState, playerId: string, controllerId: string, businessId: BusinessId) {
  const tile = state.tiles[businessId];
  const controllerPresent = state.players[controllerId].position === businessId;
  const softened = tile.exposed || tile.auditCount > 0;

  if (!softened || controllerPresent) {
    exposeBusiness(state, playerId, controllerId, businessId);
    return;
  }

  tile.controllerPlayerId = playerId;
  tile.contestedByPlayerIds = [];
  tile.exposed = false;
  tile.auditCount = 0;
  tile.fortifiedByPlayerId = undefined;
  syncControlledBusinessLists(state);
  pushLog(state, `${playerId} uses Scheme to seize ${BUSINESS_MAP[businessId].shortName} from ${controllerId}.`);
}

function pressureRival(
  state: MatchState,
  playerId: string,
  businessId: BusinessId,
  targetRivalId: string,
  targetEffect: 'evidence' | 'heat',
) {
  if (!state.players[targetRivalId]) throw new Error(`Unknown target rival: ${targetRivalId}`);
  if (state.players[targetRivalId].position !== businessId) {
    throw new Error(`${targetRivalId} is not at ${BUSINESS_MAP[businessId].shortName}.`);
  }

  if (targetEffect === 'heat') {
    state.players[targetRivalId].heat += 1;
    pushLog(state, `${playerId} successfully Schemes against ${targetRivalId}, giving them 1 Heat.`);
    return;
  }

  state.players[targetRivalId].evidence += 1;
  pushLog(state, `${playerId} successfully Schemes against ${targetRivalId}, placing 1 Evidence on them.`);
}

export function performScheme(
  state: MatchState,
  playerId: string,
  options: SchemeOptions = {},
): SchemeResult {
  validateScheme(state, playerId);

  const next = structuredClone(state) as MatchState;
  const player = next.players[playerId];
  const businessId = player.position;
  const tile = next.tiles[businessId];
  const intent = options.intent ?? 'pressure';
  const targetEffect = options.targetEffect ?? 'evidence';
  const targetRivalId = chooseTargetRivalId(next, playerId, businessId, options.targetRivalId);

  const roll = options.roll ?? rollD6();
  const modifier = computeSchemeModifier(next, playerId, businessId, intent);
  const total = roll + modifier;
  const success = total >= BASE_SCHEME_TARGET;

  player.actionCount -= 1;
  pushLog(next, `${playerId} Schemes at ${BUSINESS_MAP[businessId].shortName} (roll ${roll} + ${modifier} = ${total}).`);

  if (!success) {
    applySchemeFailure(next, playerId, businessId);
    return { state: next, success: false, roll, modifier, total, businessId };
  }

  if (intent === 'clean') {
    cleanBusinessOrPlayer(next, playerId, businessId);
    applyWrongManLegendBonus(next, playerId);
    return { state: next, success: true, roll, modifier, total, businessId };
  }

  if (tile.controllerPlayerId && tile.controllerPlayerId !== playerId) {
    if (intent === 'seize') {
      seizeBusiness(next, playerId, tile.controllerPlayerId, businessId);
    } else {
      exposeBusiness(next, playerId, tile.controllerPlayerId, businessId);
    }
    applyWrongManLegendBonus(next, playerId);
    return { state: next, success: true, roll, modifier, total, businessId };
  }

  if (targetRivalId) {
    pressureRival(next, playerId, businessId, targetRivalId, targetEffect);
    applyWrongManLegendBonus(next, playerId);
    return { state: next, success: true, roll, modifier, total, businessId };
  }

  cleanBusinessOrPlayer(next, playerId, businessId);
  applyWrongManLegendBonus(next, playerId);
  return { state: next, success: true, roll, modifier, total, businessId };
}

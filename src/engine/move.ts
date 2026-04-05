import { BUSINESS_MAP, type BusinessId } from '../data/businesses';
import { HIDDEN_CARD_MAP } from '../data/hiddenCards';
import type { MatchState } from './types';

export interface MoveOptions {
  destinationBusinessId: BusinessId;
  useSecretRoute?: boolean;
  free?: boolean;
  carryingRescueTarget?: boolean;
  rescuedTargetLabel?: string;
  freedCaptive?: boolean;
  carryingCapturedUnitId?: string;
}

export interface MoveResult {
  state: MatchState;
  moved: boolean;
  businessIdFrom: BusinessId;
  businessIdTo: BusinessId;
  usedSecretRoute: boolean;
  actionCost: number;
}

function pushLog(state: MatchState, message: string) {
  state.log.push(message);
}

function addLegend(state: MatchState, playerId: string, amount: number, reason: string) {
  state.players[playerId].legend += amount;
  pushLog(state, `${playerId} gains ${amount} Legend (${reason}).`);
}

function hasRevealedCard(state: MatchState, businessId: BusinessId, cardId: string): boolean {
  return state.tiles[businessId].revealedCardIds.includes(cardId);
}

function currentTileHasTag(state: MatchState, businessId: BusinessId, tag: string): boolean {
  return state.tiles[businessId].revealedCardIds.some((cardId) => {
    const card = HIDDEN_CARD_MAP[cardId];
    return Boolean(card?.tags.includes(tag));
  });
}

function distanceLimitedReach(start: BusinessId, maxSteps: number): Set<BusinessId> {
  const visited = new Set<BusinessId>([start]);
  const results = new Set<BusinessId>();
  const queue: Array<{ businessId: BusinessId; depth: number }> = [{ businessId: start, depth: 0 }];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.depth >= maxSteps) continue;
    for (const neighbor of BUSINESS_MAP[current.businessId].neighbors) {
      if (visited.has(neighbor)) continue;
      visited.add(neighbor);
      results.add(neighbor);
      queue.push({ businessId: neighbor, depth: current.depth + 1 });
    }
  }

  return results;
}

function getSecretRouteDestinations(state: MatchState, playerId: string, fromBusinessId: BusinessId): Set<BusinessId> {
  const player = state.players[playerId];
  const destinations = new Set<BusinessId>();

  if (fromBusinessId === 'taco_gator_hut') {
    destinations.add('sonnys_strike_zone');
    destinations.add('gator_jaw_tavern');
  }

  if (hasRevealedCard(state, fromBusinessId, 'reward_phantom_lane_pass')) {
    if (fromBusinessId === 'sonnys_strike_zone') destinations.add('taco_gator_hut');
    if (fromBusinessId === 'taco_gator_hut') destinations.add('sonnys_strike_zone');
  }

  const hasRouteCard =
    hasRevealedCard(state, fromBusinessId, 'core_tunnel_map') ||
    hasRevealedCard(state, fromBusinessId, 'ep_jail_key') ||
    currentTileHasTag(state, fromBusinessId, 'Route');

  if (hasRouteCard || player.factionId === 'cabbage_and_steve') {
    const reachable = distanceLimitedReach(fromBusinessId, 2);
    for (const businessId of reachable) destinations.add(businessId);
  }

  destinations.delete(fromBusinessId);
  return destinations;
}

function validateMove(state: MatchState, playerId: string, options: MoveOptions) {
  if (state.winnerPlayerId) throw new Error('Cannot move after the game has been won.');
  if (state.currentPlayerId !== playerId) throw new Error('Only the current player may move.');
  if (!state.players[playerId]) throw new Error(`Unknown player: ${playerId}`);
  if (!BUSINESS_MAP[options.destinationBusinessId]) throw new Error(`Unknown destination: ${options.destinationBusinessId}`);
}

function canUseFreeMove(state: MatchState, playerId: string, options: MoveOptions): boolean {
  if (options.free) return true;
  if (options.useSecretRoute && state.players[playerId].factionId === 'cabbage_and_steve' && !state.flags.secretRouteUsedThisRoundByPlayerId[playerId]) return true;
  if (options.carryingRescueTarget && state.activeEpisodeId === 'rescue_the_cryptid' && !state.flags.rescueBonusMoveUsedThisRoundByPlayerId[playerId]) return true;
  return false;
}

function markFreeMoveConsumption(state: MatchState, playerId: string, options: MoveOptions) {
  if (options.useSecretRoute && state.players[playerId].factionId === 'cabbage_and_steve' && !state.flags.secretRouteUsedThisRoundByPlayerId[playerId]) {
    state.flags.secretRouteUsedThisRoundByPlayerId[playerId] = 1;
  }
  if (options.carryingRescueTarget && state.activeEpisodeId === 'rescue_the_cryptid' && !state.flags.rescueBonusMoveUsedThisRoundByPlayerId[playerId]) {
    state.flags.rescueBonusMoveUsedThisRoundByPlayerId[playerId] = 1;
  }
}

function validatePathing(
  state: MatchState,
  playerId: string,
  fromBusinessId: BusinessId,
  toBusinessId: BusinessId,
  useSecretRoute: boolean,
) {
  if (fromBusinessId === toBusinessId) throw new Error('Destination must be different from current tile.');

  if (useSecretRoute) {
    const legalDestinations = getSecretRouteDestinations(state, playerId, fromBusinessId);
    if (!legalDestinations.has(toBusinessId)) {
      throw new Error(`No valid secret route from ${BUSINESS_MAP[fromBusinessId].shortName} to ${BUSINESS_MAP[toBusinessId].shortName}.`);
    }
    return;
  }

  if (!BUSINESS_MAP[fromBusinessId].neighbors.includes(toBusinessId)) {
    throw new Error(`${BUSINESS_MAP[toBusinessId].shortName} is not adjacent to ${BUSINESS_MAP[fromBusinessId].shortName}.`);
  }
}

function maybeResolveRescueDelivery(
  state: MatchState,
  playerId: string,
  destinationBusinessId: BusinessId,
  rescuedTargetLabel?: string,
) {
  const safeDestination = destinationBusinessId === 'critter_corral' || destinationBusinessId === 'sawbones_swamp_clinic';
  if (!safeDestination) return;
  state.flags.rescuedTargetDeliveredByPlayerId = playerId;
  state.flags.rescuedTargetDeliveredTo = destinationBusinessId;
  pushLog(state, `${playerId} delivers ${rescuedTargetLabel ?? 'the rescue target'} to ${BUSINESS_MAP[destinationBusinessId].shortName}.`);
  if (state.activeEpisodeId === 'rescue_the_cryptid' && !state.flags.firstRescueRunWinnerPlayerId) {
    state.flags.firstRescueRunWinnerPlayerId = playerId;
    addLegend(state, playerId, 5, 'first successful Rescue Run');
  }
}

function maybeResolveJailbreakMove(
  state: MatchState,
  playerId: string,
  usedSecretRoute: boolean,
  carryingCapturedUnitId?: string,
  freedCaptive?: boolean,
) {
  if (!freedCaptive) return;
  const targetLabel = carryingCapturedUnitId ?? 'captured unit';
  pushLog(state, `${playerId} moves ${targetLabel} as part of a jailbreak.`);
  if (state.activeEpisodeId === 'panda_jailbreak') addLegend(state, playerId, 2, 'causing or stopping a jailbreak');
  if (usedSecretRoute) {
    state.flags.freedCaptiveAndUsedSecretRouteSameRoundByPlayerId = playerId;
    pushLog(state, `${playerId} completes the jailbreak route through a secret path.`);
  }
}

function maybeLogSnorpContact(state: MatchState, playerId: string, destinationBusinessId: BusinessId) {
  if (!state.snorp.active || state.snorp.tileBusinessId !== destinationBusinessId) return;
  pushLog(state, `${playerId} arrives at ${BUSINESS_MAP[destinationBusinessId].shortName} and encounters Snorp.`);
}

export function performMove(
  state: MatchState,
  playerId: string,
  options: MoveOptions,
): MoveResult {
  validateMove(state, playerId, options);

  const next = structuredClone(state) as MatchState;
  const player = next.players[playerId];
  const fromBusinessId = player.position;
  const toBusinessId = options.destinationBusinessId;
  const usedSecretRoute = Boolean(options.useSecretRoute);

  validatePathing(next, playerId, fromBusinessId, toBusinessId, usedSecretRoute);

  const freeMove = canUseFreeMove(next, playerId, options);
  const actionCost = freeMove ? 0 : 1;
  if (player.actionCount < actionCost) throw new Error(`${playerId} does not have enough actions to move.`);

  if (actionCost > 0) {
    player.actionCount -= actionCost;
  } else {
    markFreeMoveConsumption(next, playerId, options);
  }

  player.position = toBusinessId;
  if (usedSecretRoute) next.flags.secretRouteUsedThisRoundByPlayerId[playerId] = 1;

  pushLog(next, `${playerId} moves from ${BUSINESS_MAP[fromBusinessId].shortName} to ${BUSINESS_MAP[toBusinessId].shortName}${usedSecretRoute ? ' via secret route' : ''}.`);

  if (options.carryingRescueTarget) {
    maybeResolveRescueDelivery(next, playerId, toBusinessId, options.rescuedTargetLabel);
  }
  if (options.freedCaptive || options.carryingCapturedUnitId) {
    maybeResolveJailbreakMove(next, playerId, usedSecretRoute, options.carryingCapturedUnitId, options.freedCaptive);
  }

  maybeLogSnorpContact(next, playerId, toBusinessId);

  return {
    state: next,
    moved: true,
    businessIdFrom: fromBusinessId,
    businessIdTo: toBusinessId,
    usedSecretRoute,
    actionCost,
  };
}

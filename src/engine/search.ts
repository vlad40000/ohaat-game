import { BUSINESS_MAP, type BusinessId } from '../data/businesses';
import { EPISODE_MAP } from '../data/episodes';
import { HIDDEN_CARD_MAP, type HiddenCardDef } from '../data/hiddenCards';
import type { MatchState, SearchResult } from './types';
import { maybeApplySpotlightSearchBonus } from './story';

function pushLog(state: MatchState, message: string) {
  state.log.push(message);
}

function addLegend(state: MatchState, playerId: string, amount: number, reason: string) {
  state.players[playerId].legend += amount;
  pushLog(state, `${playerId} gains ${amount} Legend (${reason}).`);
}

function clampMin(value: number, min = 0) {
  return Math.max(min, value);
}

function getRivalIdsAtTile(
  state: MatchState,
  playerId: string,
  businessId: BusinessId,
): string[] {
  return state.playerOrder.filter(
    (id) => id !== playerId && state.players[id].position === businessId,
  );
}

function getMatchedEpisodeTargets(state: MatchState, card: HiddenCardDef): string[] {
  const episode = EPISODE_MAP[state.activeEpisodeId];
  const matched = new Set<string>();

  for (const target of episode.searchTargets) {
    if (card.name === target || card.tags.includes(target)) {
      matched.add(target);
      continue;
    }

    const normalizedTarget = target.toLowerCase();
    const nameMatch = card.name.toLowerCase() === normalizedTarget;
    const tagMatch = card.tags.some((tag) => tag.toLowerCase() === normalizedTarget);

    if (nameMatch || tagMatch) matched.add(target);
  }

  return [...matched];
}

function recordMatchedTargets(state: MatchState, playerId: string, targets: string[]) {
  if (targets.length === 0) return;
  const progress = state.episodeProgressByPlayerId[playerId];
  const nextFound = new Set(progress.foundTargetNames);
  for (const target of targets) nextFound.add(target);
  progress.foundTargetNames = [...nextFound];
}

function maybeAwardEpisodeSetCompletion(state: MatchState, playerId: string) {
  const episode = EPISODE_MAP[state.activeEpisodeId];
  const progress = state.episodeProgressByPlayerId[playerId];
  const completed = episode.searchTargets.every((target) => progress.foundTargetNames.includes(target));

  if (completed && !progress.bonusClaimed) {
    progress.bonusClaimed = true;
    addLegend(state, playerId, 3, `${episode.name} target set completed`);
  }
}

function countSonnysEpisodeTargets(state: MatchState, playerId: string): number {
  const progress = state.episodeProgressByPlayerId[playerId];
  const sonnysTargets = ['Bowling Ball', 'Blood Trail', 'Crowd', 'Neon Sign'];
  return progress.foundTargetNames.filter((target) => sonnysTargets.includes(target)).length;
}

function maybeAwardEpisodeSpecificSearchBonus(state: MatchState, playerId: string) {
  if (
    state.activeEpisodeId === 'bowling_alley_bloodbath' &&
    !state.flags.firstSonnysTargetWinnerPlayerId &&
    countSonnysEpisodeTargets(state, playerId) >= 2
  ) {
    state.flags.firstSonnysTargetWinnerPlayerId = playerId;
    addLegend(state, playerId, 2, 'first to reveal 2 Sonny’s-linked targets');
  }

  if (
    state.activeEpisodeId === 'backroom_commerce_fair' &&
    state.flags.backRoomRewardKeysByPlayerId[playerId].length >= 3
  ) {
    pushLog(state, `${playerId} now holds 3 Back Room discoveries.`);
  }
}

function nearestHiddenBusiness(state: MatchState, fromBusinessId: BusinessId): BusinessId | undefined {
  const visited = new Set<BusinessId>([fromBusinessId]);
  const queue: BusinessId[] = [fromBusinessId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const neighbor of BUSINESS_MAP[current].neighbors) {
      if (visited.has(neighbor)) continue;
      visited.add(neighbor);
      if (state.tiles[neighbor].hiddenCardIds.length > 0) return neighbor;
      queue.push(neighbor);
    }
  }

  return undefined;
}

function resolveSnorpMovement(state: MatchState, playerId: string, businessId: BusinessId) {
  if (!state.snorp.active || state.snorp.tileBusinessId !== businessId) return;

  const destination = nearestHiddenBusiness(state, businessId);
  if (!destination) {
    state.snorp.corneredByPlayerId = playerId;
    if (!state.flags.firstSnorpCornerWinnerPlayerId) {
      state.flags.firstSnorpCornerWinnerPlayerId = playerId;
      addLegend(state, playerId, 2, 'first to corner Snorp');
    }
    pushLog(state, `${playerId} corners Snorp at ${BUSINESS_MAP[businessId].name}.`);
    return;
  }

  state.snorp.tileBusinessId = destination;
  state.snorp.moves += 1;
  pushLog(state, `Snorp flees from ${BUSINESS_MAP[businessId].shortName} to ${BUSINESS_MAP[destination].shortName}.`);
}

function applyWrongManOnTrialPassive(state: MatchState, playerId: string, card: HiddenCardDef) {
  if (state.activeEpisodeId !== 'wrong_man_on_trial') return;
  const isEvidenceLike = card.tags.includes('Evidence') || card.name === 'Witness';
  if (!isEvidenceLike) return;
  const businessId = state.players[playerId].position;
  const rivals = getRivalIdsAtTile(state, playerId, businessId);
  if (rivals.length === 0) return;
  const targetRivalId = rivals[0];
  state.players[targetRivalId].evidence += 1;
  pushLog(state, `${playerId} plants 1 Evidence on ${targetRivalId} via Wrong Man on Trial.`);
}

function applyChamberScandalPassive(
  state: MatchState,
  playerId: string,
  card: HiddenCardDef,
  tileControllerId?: string,
) {
  if (state.activeEpisodeId !== 'chamber_scandal') return;
  if (!card.tags.includes('Merch')) return;
  if (!tileControllerId || tileControllerId === playerId) return;

  state.players[tileControllerId].heat += 1;
  state.flags.exposedBusinessesByPlayerId[playerId] += 1;
  state.tiles[state.players[playerId].position].exposed = true;

  pushLog(state, `${playerId} exposes ${tileControllerId}'s business via Chamber Scandal and gives them 1 Heat.`);
}

function addBackRoomDiscovery(state: MatchState, playerId: string, businessId: BusinessId, cardId: string) {
  const bucket = state.flags.backRoomRewardKeysByPlayerId[playerId];
  const key = `${businessId}:${cardId}`;
  if (!bucket.includes(key)) bucket.push(key);
}

function applyCardEffect(state: MatchState, playerId: string, card: HiddenCardDef, businessId: BusinessId) {
  const player = state.players[playerId];

  if (card.tags.includes('Backroom')) addBackRoomDiscovery(state, playerId, businessId, card.id);

  switch (card.id) {
    case 'core_ledger':
      if (player.heat > 0) {
        player.heat = clampMin(player.heat - 1);
        pushLog(state, `${playerId} removes 1 Heat from Ledger Lodge.`);
      } else {
        player.cash += 1;
        pushLog(state, `${playerId} gains 1 Cash from Ledger Lodge.`);
      }
      break;
    case 'core_bowling_ball':
    case 'ep_blood_trail':
      player.headlineTokens += 1;
      pushLog(state, `${playerId} gains 1 Headline token.`);
      break;
    case 'core_tunnel_map':
      pushLog(state, `${playerId} may take a free route move after this search.`);
      break;
    case 'core_policy_folder':
      player.cash += 1;
      pushLog(state, `${playerId} gains 1 Cash or audit leverage from Policy Folder.`);
      break;
    case 'core_trap_kit':
      pushLog(state, `${playerId} arms a trap at ${BUSINESS_MAP[businessId].shortName}.`);
      break;
    case 'core_serum':
    case 'reward_clean_record':
      if (player.heat > 0) {
        const removed = card.id === 'reward_clean_record' ? Math.min(2, player.heat) : 1;
        player.heat = clampMin(player.heat - removed);
        pushLog(state, `${playerId} removes ${removed} Heat.`);
      }
      break;
    case 'reward_backroom_cache':
      player.cash += 2;
      pushLog(state, `${playerId} gains 2 Cash from a Back Room Cache.`);
      break;
    case 'reward_blackmail_file':
      addLegend(state, playerId, 1, 'cashing in a Blackmail File');
      break;
    case 'trap_false_witness':
    case 'trap_planted_heat':
      player.heat += 1;
      pushLog(state, `${playerId} gains 1 Heat from a trap.`);
      break;
    case 'trap_booby_trap':
      pushLog(state, `${playerId} hits a Booby Trap and loses tempo.`);
      player.actionCount = clampMin(player.actionCount - 1);
      break;
    case 'ep_briefcase':
    case 'ep_merch_bundle':
      player.cash += 1;
      pushLog(state, `${playerId} gains 1 Cash from a commerce reveal.`);
      break;
    default:
      break;
  }
}

function validateSearch(state: MatchState, playerId: string) {
  if (state.winnerPlayerId) throw new Error('Cannot search after the game has been won.');
  if (state.currentPlayerId !== playerId) throw new Error('Only the current player may search.');
  const player = state.players[playerId];
  if (!player) throw new Error(`Unknown player: ${playerId}`);
  if (player.actionCount < 1) throw new Error(`${playerId} has no actions remaining.`);
}

export function performSearch(state: MatchState, playerId: string): SearchResult {
  validateSearch(state, playerId);

  const next = structuredClone(state) as MatchState;
  const player = next.players[playerId];
  const businessId = player.position;
  const tile = next.tiles[businessId];

  if (tile.hiddenCardIds.length === 0) {
    pushLog(next, `${playerId} searches ${BUSINESS_MAP[businessId].shortName}, but nothing remains hidden.`);
    player.actionCount -= 1;
    return { state: next, matchedTargets: [] };
  }

  const revealedCardId = tile.hiddenCardIds.shift()!;
  const card = HIDDEN_CARD_MAP[revealedCardId];
  const matchedTargets = getMatchedEpisodeTargets(next, card);

  tile.revealedCardIds.push(revealedCardId);
  tile.searchCount += 1;
  player.revealedCardIds.push(revealedCardId);
  player.actionCount -= 1;

  pushLog(next, `${playerId} searches ${BUSINESS_MAP[businessId].shortName} and reveals ${card.name}.`);
  recordMatchedTargets(next, playerId, matchedTargets);
  if (matchedTargets.length > 0) {
    pushLog(next, `${playerId} marks episode targets: ${matchedTargets.join(', ')}.`);
  }

  applyCardEffect(next, playerId, card, businessId);
  maybeApplySpotlightSearchBonus(next, playerId, businessId);
  applyWrongManOnTrialPassive(next, playerId, card);
  applyChamberScandalPassive(next, playerId, card, tile.controllerPlayerId);

  if (next.activeEpisodeId === 'return_of_snorp') resolveSnorpMovement(next, playerId, businessId);

  maybeAwardEpisodeSetCompletion(next, playerId);
  maybeAwardEpisodeSpecificSearchBonus(next, playerId);

  return { state: next, revealedCardId, matchedTargets };
}

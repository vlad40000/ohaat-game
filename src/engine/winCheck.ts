import type { BusinessId } from '../data/businesses';
import { EPISODE_MAP } from '../data/episodes';
import type { MatchState, PlayerState } from './types';

export interface WinCheckResult {
  winnerPlayerId?: string;
  reason?: string;
}

const LEGEND_THRESHOLD = 12;
const DEFAULT_MAX_ROUNDS = 8;

function rivalIds(state: MatchState, playerId: string): string[] {
  return state.playerOrder.filter((id) => id !== playerId);
}

function controlsBusiness(state: MatchState, playerId: string, businessId: BusinessId): boolean {
  return state.tiles[businessId].controllerPlayerId === playerId;
}

function controlledBusinessCount(state: MatchState, playerId: string): number {
  return Object.values(state.tiles).filter((tile) => tile.controllerPlayerId === playerId).length;
}

function hasLessEvidenceThanEveryRival(state: MatchState, playerId: string): boolean {
  const playerEvidence = state.players[playerId].evidence;
  return rivalIds(state, playerId).every((rivalId) => playerEvidence < state.players[rivalId].evidence);
}

function uniqueBackRoomBusinessCount(state: MatchState, playerId: string): number {
  const keys = state.flags.backRoomRewardKeysByPlayerId[playerId] ?? [];
  const businesses = new Set(keys.map((key) => key.split(':')[0]).filter((key) => !key.startsWith('round')));
  return businesses.size;
}

function playerHasLegendThreshold(player: PlayerState): boolean {
  return player.legend >= LEGEND_THRESHOLD;
}

function targetSetComplete(state: MatchState, playerId: string): boolean {
  const episode = EPISODE_MAP[state.activeEpisodeId];
  const found = state.episodeProgressByPlayerId[playerId].foundTargetNames;
  return episode.searchTargets.every((target) => found.includes(target));
}

function episodeCloserMet(state: MatchState, playerId: string): boolean {
  const player = state.players[playerId];
  if (!playerHasLegendThreshold(player)) return false;

  switch (state.activeEpisodeId) {
    case 'wrong_man_on_trial':
      return targetSetComplete(state, playerId) && hasLessEvidenceThanEveryRival(state, playerId);
    case 'bowling_alley_bloodbath':
      return controlsBusiness(state, playerId, 'sonnys_strike_zone') && (state.flags.publicClashWinsAtSonnysByPlayerId[playerId] ?? 0) > 0;
    case 'rescue_the_cryptid':
      return (
        state.flags.rescuedTargetDeliveredByPlayerId === playerId &&
        (state.flags.rescuedTargetDeliveredTo === 'critter_corral' || state.flags.rescuedTargetDeliveredTo === 'sawbones_swamp_clinic')
      );
    case 'return_of_snorp':
      return state.snorp.moves >= 3 && state.snorp.tileBusinessId === player.position;
    case 'panda_jailbreak':
      return state.flags.freedCaptiveAndUsedSecretRouteSameRoundByPlayerId === playerId;
    case 'backroom_commerce_fair':
      return uniqueBackRoomBusinessCount(state, playerId) >= 3;
    case 'chamber_scandal':
      return (state.flags.exposedBusinessesByPlayerId[playerId] ?? 0) >= 3 && controlledBusinessCount(state, playerId) >= 3;
    case 'halloween_bowl_bash':
      return controlsBusiness(state, playerId, 'sonnys_strike_zone') && state.flags.hostedSuccessfulPublicEventAtSonnysByPlayerId === playerId;
    case 'siege_of_the_fortress': {
      const streak = state.flags.defendedBusinessStreakByPlayerId[playerId];
      return Boolean(streak?.businessId && streak.count >= 2);
    }
    case 'christmas_conversion_drive':
      return (state.flags.merchLinesMaintainedFullRoundByPlayerId[playerId] ?? 0) >= 4;
    default:
      return false;
  }
}

function sortForTiebreak(state: MatchState, playerIds: string[]): string[] {
  return [...playerIds].sort((a, b) => {
    const pa = state.players[a];
    const pb = state.players[b];
    if (pb.legend !== pa.legend) return pb.legend - pa.legend;
    if (pa.heat !== pb.heat) return pa.heat - pb.heat;
    const aControl = controlledBusinessCount(state, a);
    const bControl = controlledBusinessCount(state, b);
    if (bControl !== aControl) return bControl - aControl;
    if (pb.cash !== pa.cash) return pb.cash - pa.cash;
    return a.localeCompare(b);
  });
}

export function getWinCheckResult(state: MatchState, maxRounds = DEFAULT_MAX_ROUNDS): WinCheckResult {
  for (const playerId of state.playerOrder) {
    if (episodeCloserMet(state, playerId)) {
      const episode = EPISODE_MAP[state.activeEpisodeId];
      return { winnerPlayerId: playerId, reason: `${playerId} meets the ${episode.name} closer.` };
    }
  }

  if (state.round > maxRounds) {
    const ranked = sortForTiebreak(state, state.playerOrder);
    return { winnerPlayerId: ranked[0], reason: `Round limit reached. ${ranked[0]} wins on tiebreak.` };
  }

  return {};
}

export function applyWinCheck(state: MatchState, maxRounds = DEFAULT_MAX_ROUNDS): MatchState {
  const result = getWinCheckResult(state, maxRounds);
  if (!result.winnerPlayerId) return state;
  const next = structuredClone(state) as MatchState;
  next.winnerPlayerId = result.winnerPlayerId;
  next.winnerReason = result.reason;
  next.log.push(result.reason ?? `${result.winnerPlayerId} wins.`);
  return next;
}

import { BUSINESS_MAP, type BusinessId } from '../data/businesses';
import type { MatchState } from './types';
import { maybeApplySpotlightClaimBonus } from './story';

export interface ClaimResult {
  state: MatchState;
  claimed: boolean;
  contested: boolean;
  businessId: BusinessId;
}

function pushLog(state: MatchState, message: string) {
  state.log.push(message);
}

function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids)];
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

function syncControlledBusinessLists(state: MatchState) {
  for (const playerId of state.playerOrder) state.players[playerId].controlledBusinessIds = [];
  for (const tile of Object.values(state.tiles)) {
    if (tile.controllerPlayerId) state.players[tile.controllerPlayerId].controlledBusinessIds.push(tile.businessId);
  }
}

function validateClaim(state: MatchState, playerId: string) {
  if (state.winnerPlayerId) throw new Error('Cannot claim after the game has been won.');
  if (state.currentPlayerId !== playerId) throw new Error('Only the current player may claim.');
  const player = state.players[playerId];
  if (!player) throw new Error(`Unknown player: ${playerId}`);
  if (player.actionCount < 1) throw new Error(`${playerId} has no actions remaining.`);
}

function grantBackroomClaimStubIfNeeded(state: MatchState, playerId: string) {
  if (state.activeEpisodeId !== 'backroom_commerce_fair') return;
  const bucket = state.flags.backRoomRewardKeysByPlayerId[playerId];
  const roundKey = `round:${state.round}:claim_bonus`;
  if (bucket.includes(roundKey)) return;
  bucket.push(roundKey);
  state.players[playerId].cash += 1;
  pushLog(state, `${playerId} triggers Backroom Commerce Fair on their first claim this round and gains +1 Cash (temporary Item / Back Room stub).`);
}

export function performClaim(state: MatchState, playerId: string): ClaimResult {
  validateClaim(state, playerId);

  const next = structuredClone(state) as MatchState;
  const player = next.players[playerId];
  const businessId = player.position;
  const tile = next.tiles[businessId];
  const controllerId = tile.controllerPlayerId;
  const rivalsHere = getPlayersAtBusiness(next, businessId, playerId);

  if (controllerId === playerId) throw new Error(`You already control ${BUSINESS_MAP[businessId].name}.`);

  if (controllerId && controllerId !== playerId) {
    const controllerPresent = next.players[controllerId].position === businessId;
    const softened = tile.exposed || tile.auditCount > 0;

    if (controllerPresent) {
      player.actionCount -= 1;
      tile.contestedByPlayerIds = uniqueIds([...tile.contestedByPlayerIds, playerId, controllerId]);
      pushLog(next, `${playerId} tries to claim ${BUSINESS_MAP[businessId].shortName}, but ${controllerId} is present. The business becomes contested.`);
      return { state: next, claimed: false, contested: true, businessId };
    }

    if (!softened) {
      throw new Error(`Use Scheme or Force first. ${BUSINESS_MAP[businessId].shortName} is still protected by ${controllerId}.`);
    }

    player.actionCount -= 1;
    tile.controllerPlayerId = playerId;
    tile.contestedByPlayerIds = [];
    tile.exposed = false;
    tile.auditCount = 0;
    tile.fortifiedByPlayerId = undefined;

    syncControlledBusinessLists(next);
    grantBackroomClaimStubIfNeeded(next, playerId);
    pushLog(next, `${playerId} claims exposed business ${BUSINESS_MAP[businessId].shortName} from ${controllerId}.`);
    return { state: next, claimed: true, contested: false, businessId };
  }

  const foreignContestants = tile.contestedByPlayerIds.filter((id) => id !== playerId);
  const anyoneElseHere = rivalsHere.length > 0 || foreignContestants.length > 0;
  player.actionCount -= 1;

  if (anyoneElseHere) {
    tile.contestedByPlayerIds = uniqueIds([...tile.contestedByPlayerIds, playerId, ...rivalsHere]);
    pushLog(next, `${playerId} pressures a claim at ${BUSINESS_MAP[businessId].shortName}, but rivals are nearby. The business is now contested.`);
    return { state: next, claimed: false, contested: true, businessId };
  }

  tile.controllerPlayerId = playerId;
  tile.contestedByPlayerIds = [];
  syncControlledBusinessLists(next);
  grantBackroomClaimStubIfNeeded(next, playerId);
  maybeApplySpotlightClaimBonus(next, playerId, businessId);
  pushLog(next, `${playerId} claims ${BUSINESS_MAP[businessId].shortName}.`);

  return { state: next, claimed: true, contested: false, businessId };
}

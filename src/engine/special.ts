import { FACTION_MAP, type FactionId } from '../data/factions';
import { BUSINESS_MAP, type BusinessId } from '../data/businesses';
import { HIDDEN_CARD_MAP } from '../data/hiddenCards';
import { performMove } from './move';
import type { MatchState } from './types';

export interface SpecialOptions {
  destinationBusinessId?: BusinessId;
  sourceBusinessId?: BusinessId;
  targetRivalId?: string;
  choose?: 'gain_headline' | 'pull_headline' | 'clear_self' | 'blank_target' | 'heat' | 'legend';
  useSecretRoute?: boolean;
  evidenceAmount?: number;
  carryingRescueTarget?: boolean;
  rescuedTargetLabel?: string;
  freedCaptive?: boolean;
  carryingCapturedUnitId?: string;
}

export interface SpecialResult {
  state: MatchState;
  used: boolean;
  factionId: FactionId;
}

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

function validateSpecial(state: MatchState, playerId: string) {
  if (state.winnerPlayerId) throw new Error('Cannot use a faction special after the game has been won.');
  if (state.currentPlayerId !== playerId) throw new Error('Only the current player may use a faction special.');
  const player = state.players[playerId];
  if (!player) throw new Error(`Unknown player: ${playerId}`);
  if (player.actionCount < 1) throw new Error(`${playerId} has no actions remaining.`);
  if (player.specialsUsedThisRound.includes(player.factionId)) {
    throw new Error(`${FACTION_MAP[player.factionId].name} already used its special this turn.`);
  }
}

function markSpecialUsed(state: MatchState, playerId: string) {
  const player = state.players[playerId];
  if (!player.specialsUsedThisRound.includes(player.factionId)) player.specialsUsedThisRound.push(player.factionId);
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

function removeOneMatchingTarget(
  targets: string[],
  predicate: (target: string) => boolean,
): { nextTargets: string[]; removedTarget?: string } {
  const nextTargets: string[] = [];
  let removedTarget: string | undefined;
  for (const target of targets) {
    if (!removedTarget && predicate(target)) {
      removedTarget = target;
      continue;
    }
    nextTargets.push(target);
  }
  return { nextTargets, removedTarget };
}

function useBuckAndStumpSpecial(state: MatchState, playerId: string): MatchState {
  const next = structuredClone(state) as MatchState;
  const player = next.players[playerId];
  const tile = next.tiles[player.position];

  if (tile.controllerPlayerId !== playerId) {
    throw new Error('Buck & Stump must be on a business they control to fortify it.');
  }

  player.actionCount -= 1;
  tile.fortifiedByPlayerId = playerId;
  markSpecialUsed(next, playerId);
  pushLog(next, `${playerId} uses Hold the Line and fortifies ${BUSINESS_MAP[player.position].shortName} until their next turn.`);
  return next;
}

function useHansAndSoupySpecial(
  state: MatchState,
  playerId: string,
  options: SpecialOptions,
): MatchState {
  const next = structuredClone(state) as MatchState;
  const player = next.players[playerId];
  const fromBusinessId = player.position;
  const targetRivalId = chooseTargetRivalId(next, playerId, fromBusinessId, options.targetRivalId);

  if (!options.destinationBusinessId) {
    throw new Error('Hans & Soupy require a destinationBusinessId for Extraction Run.');
  }

  player.actionCount -= 1;
  markSpecialUsed(next, playerId);

  if (next.players[targetRivalId].capturedByPlayerId !== playerId) {
    next.players[targetRivalId].capturedByPlayerId = playerId;
    pushLog(next, `${playerId} marks ${targetRivalId} as Captured.`);
  }

  const moved = performMove(next, playerId, {
    destinationBusinessId: options.destinationBusinessId,
    useSecretRoute: options.useSecretRoute,
    free: true,
    carryingCapturedUnitId: targetRivalId,
  }).state;

  moved.players[targetRivalId].position = options.destinationBusinessId;

  if (options.useSecretRoute) addLegend(moved, playerId, 1, 'Extraction Run through a secret route');
  pushLog(moved, `${playerId} extracts ${targetRivalId} to ${BUSINESS_MAP[options.destinationBusinessId].shortName}.`);
  return moved;
}

function useRoccoAndCherrySpecial(
  state: MatchState,
  playerId: string,
  options: SpecialOptions,
): MatchState {
  const next = structuredClone(state) as MatchState;
  const player = next.players[playerId];
  const currentBusinessId = player.position;
  const currentTile = next.tiles[currentBusinessId];
  const choose = options.choose ?? 'gain_headline';

  player.actionCount -= 1;
  markSpecialUsed(next, playerId);

  if (choose === 'pull_headline') {
    if (!options.sourceBusinessId) throw new Error('Rocco & Cherry require sourceBusinessId when pulling a Headline token.');
    if (options.sourceBusinessId === currentBusinessId) throw new Error('Source business must be different from your current business.');

    const sourceTile = next.tiles[options.sourceBusinessId];
    if (sourceTile.controllerPlayerId) throw new Error('You may only pull a Headline token from an uncontrolled business.');
    if (sourceTile.headlineTokenCount < 1) throw new Error(`${BUSINESS_MAP[options.sourceBusinessId].shortName} has no Headline token to move.`);

    sourceTile.headlineTokenCount -= 1;
    currentTile.headlineTokenCount += 1;
    pushLog(next, `${playerId} uses Front Page Spin to move a Headline token from ${BUSINESS_MAP[options.sourceBusinessId].shortName} to ${BUSINESS_MAP[currentBusinessId].shortName}.`);
    return next;
  }

  player.headlineTokens += 1;
  pushLog(next, `${playerId} uses Front Page Spin and gains 1 Headline token.`);
  return next;
}

function usePandaSyndicateSpecial(
  state: MatchState,
  playerId: string,
  options: SpecialOptions,
): MatchState {
  const next = structuredClone(state) as MatchState;
  const player = next.players[playerId];
  const businessId = player.position;
  const tile = next.tiles[businessId];
  const choose = options.choose ?? (player.evidence > 0 || player.heat > 0 ? 'clear_self' : 'blank_target');

  player.actionCount -= 1;
  markSpecialUsed(next, playerId);

  if (choose === 'clear_self') {
    if (player.evidence > 0) {
      player.evidence = clampMin(player.evidence - 1);
      pushLog(next, `${playerId} uses Quiet the Witness to remove 1 Evidence from themselves.`);
      return next;
    }
    if (player.heat > 0) {
      player.heat = clampMin(player.heat - 1);
      pushLog(next, `${playerId} uses Quiet the Witness to remove 1 Heat from themselves.`);
      return next;
    }
    pushLog(next, `${playerId} uses Quiet the Witness, but has nothing on themselves to clear.`);
    return next;
  }

  const targetRivalId = chooseTargetRivalId(next, playerId, businessId, options.targetRivalId);

  const blankableCards = tile.revealedCardIds
    .map((cardId) => HIDDEN_CARD_MAP[cardId])
    .filter(
      (card) =>
        card &&
        (card.name === 'Witness' || card.tags.includes('Witness') || card.tags.includes('Evidence')),
    );

  if (blankableCards.length === 0) {
    if (next.players[targetRivalId].evidence > 0) {
      next.players[targetRivalId].evidence = clampMin(next.players[targetRivalId].evidence - 1);
      pushLog(next, `${playerId} uses Quiet the Witness on ${targetRivalId} and strips 1 Evidence.`);
      return next;
    }
    pushLog(next, `${playerId} uses Quiet the Witness, but there is no Witness/Evidence reveal to suppress here.`);
    return next;
  }

  const rivalProgress = next.episodeProgressByPlayerId[targetRivalId];
  const { nextTargets, removedTarget } = removeOneMatchingTarget(rivalProgress.foundTargetNames, (target) =>
    blankableCards.some(
      (card) =>
        card.name === target ||
        card.tags.includes(target) ||
        (target === 'Witness' && (card.name === 'Witness' || card.tags.includes('Witness'))) ||
        (target === 'Evidence' && card.tags.includes('Evidence')),
    ),
  );

  if (removedTarget) {
    rivalProgress.foundTargetNames = nextTargets;
    pushLog(next, `${playerId} uses Quiet the Witness and blanks ${removedTarget} from ${targetRivalId}'s episode progress.`);
    return next;
  }

  if (next.players[targetRivalId].evidence > 0) {
    next.players[targetRivalId].evidence = clampMin(next.players[targetRivalId].evidence - 1);
    pushLog(next, `${playerId} uses Quiet the Witness and removes 1 Evidence from ${targetRivalId}.`);
    return next;
  }

  pushLog(next, `${playerId} uses Quiet the Witness, but ${targetRivalId} has nothing useful to suppress.`);
  return next;
}

function useCabbageAndSteveSpecial(
  state: MatchState,
  playerId: string,
  options: SpecialOptions,
): MatchState {
  const next = structuredClone(state) as MatchState;
  const player = next.players[playerId];
  if (!options.destinationBusinessId) throw new Error('Cabbage & Steve require a destinationBusinessId for Get Out Route.');

  player.actionCount -= 1;
  markSpecialUsed(next, playerId);

  const moved = performMove(next, playerId, {
    destinationBusinessId: options.destinationBusinessId,
    useSecretRoute: options.useSecretRoute ?? true,
    free: true,
    carryingRescueTarget: options.carryingRescueTarget,
    rescuedTargetLabel: options.rescuedTargetLabel,
    carryingCapturedUnitId: options.carryingCapturedUnitId,
    freedCaptive: options.freedCaptive,
  }).state;

  pushLog(moved, `${playerId} uses Get Out Route to reposition through a secret route.`);
  return moved;
}

function useRogerAndAnitaSpecial(
  state: MatchState,
  playerId: string,
  options: SpecialOptions,
): MatchState {
  const next = structuredClone(state) as MatchState;
  const player = next.players[playerId];
  const businessId = player.position;
  const tile = next.tiles[businessId];
  const targetRivalId = chooseTargetRivalId(next, playerId, businessId, options.targetRivalId);
  const targetRival = next.players[targetRivalId];
  const choose = options.choose ?? 'heat';
  const amount = Math.min(options.evidenceAmount ?? 2, targetRival.evidence);

  if (amount < 1) throw new Error(`${targetRivalId} has no Evidence to weaponize.`);

  player.actionCount -= 1;
  markSpecialUsed(next, playerId);
  targetRival.evidence = clampMin(targetRival.evidence - amount);

  if (choose === 'legend') {
    if (tile.controllerPlayerId !== playerId) throw new Error('Roger & Anita need to control the tile to convert files into Legend.');
    addLegend(next, playerId, amount, 'Weaponize the File');
    pushLog(next, `${playerId} converts ${amount} Evidence from ${targetRivalId} into Legend.`);
    return next;
  }

  targetRival.heat += amount;
  pushLog(next, `${playerId} converts ${amount} Evidence from ${targetRivalId} into ${amount} Heat.`);
  return next;
}

export function performFactionSpecial(
  state: MatchState,
  playerId: string,
  options: SpecialOptions = {},
): SpecialResult {
  validateSpecial(state, playerId);
  const factionId = state.players[playerId].factionId;

  switch (factionId) {
    case 'buck_and_stump':
      return { state: useBuckAndStumpSpecial(state, playerId), used: true, factionId };
    case 'hans_and_soupy':
      return { state: useHansAndSoupySpecial(state, playerId, options), used: true, factionId };
    case 'rocco_and_cherry':
      return { state: useRoccoAndCherrySpecial(state, playerId, options), used: true, factionId };
    case 'panda_syndicate':
      return { state: usePandaSyndicateSpecial(state, playerId, options), used: true, factionId };
    case 'cabbage_and_steve':
      return { state: useCabbageAndSteveSpecial(state, playerId, options), used: true, factionId };
    case 'roger_and_anita':
      return { state: useRogerAndAnitaSpecial(state, playerId, options), used: true, factionId };
    default:
      throw new Error(`Unhandled faction special for ${factionId}`);
  }
}

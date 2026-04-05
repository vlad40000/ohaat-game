import { BUSINESS_MAP, type BusinessId } from '../data/businesses';
import { EPISODE_STORY_MAP, type EpisodeActStage } from '../data/story';
import type { MatchState } from './types';

export function getEpisodeActStage(round: number): EpisodeActStage {
  if (round <= 2) return 'cold_open';
  if (round <= 4) return 'escalation';
  return 'finale';
}

export function getCurrentEpisodeAct(state: MatchState) {
  const story = EPISODE_STORY_MAP[state.activeEpisodeId];
  const stage = getEpisodeActStage(state.round);
  return story.acts.find((act) => act.stage === stage) ?? story.acts[0];
}

export function getSpotlightVenueId(state: MatchState): BusinessId {
  return EPISODE_STORY_MAP[state.activeEpisodeId].spotlightVenueId;
}

export function isSpotlightVenue(state: MatchState, businessId: BusinessId): boolean {
  return getSpotlightVenueId(state) === businessId;
}

export function getSpotlightValue(state: MatchState): number {
  const totalHeat = state.playerOrder.reduce((sum, playerId) => sum + state.players[playerId].heat, 0);
  const totalHeadlineTokens = state.playerOrder.reduce(
    (sum, playerId) => sum + state.players[playerId].headlineTokens,
    0,
  );

  return totalHeat + totalHeadlineTokens * 2 + state.round - 1;
}

export function getSpotlightTier(state: MatchState): 'low' | 'rising' | 'blazing' {
  const value = getSpotlightValue(state);
  if (value <= 4) return 'low';
  if (value <= 8) return 'rising';
  return 'blazing';
}

export function getSpotlightModifier(
  state: MatchState,
  businessId: BusinessId,
  mode: 'private' | 'public' = 'private',
): number {
  let modifier = 0;
  const stage = getEpisodeActStage(state.round);
  const spotlightVenue = getSpotlightVenueId(state);
  const tier = getSpotlightTier(state);

  if (businessId === spotlightVenue && stage !== 'cold_open') {
    modifier += 1;
  }

  if (businessId === spotlightVenue && stage === 'finale') {
    modifier += 1;
  }

  if (mode === 'public' && tier === 'blazing') {
    modifier += 1;
  }

  return modifier;
}

export function maybeApplySpotlightClaimBonus(
  state: MatchState,
  playerId: string,
  businessId: BusinessId,
): void {
  if (!isSpotlightVenue(state, businessId)) return;
  if (getEpisodeActStage(state.round) !== 'finale') return;

  state.players[playerId].legend += 1;
  state.log.push(
    `${playerId} gains 1 Legend for taking control of the finale spotlight at ${BUSINESS_MAP[businessId].shortName}.`,
  );
}

export function maybeApplySpotlightSearchBonus(
  state: MatchState,
  playerId: string,
  businessId: BusinessId,
): void {
  if (!isSpotlightVenue(state, businessId)) return;
  const stage = getEpisodeActStage(state.round);

  if (stage === 'cold_open') return;

  state.players[playerId].headlineTokens += 1;
  state.log.push(
    `${playerId} gains 1 Headline token for searching the active venue at ${BUSINESS_MAP[businessId].shortName}.`,
  );
}

export function getChaosPulse(state: MatchState): string {
  const story = EPISODE_STORY_MAP[state.activeEpisodeId];
  const stage = getEpisodeActStage(state.round);
  const index = stage === 'cold_open' ? 0 : stage === 'escalation' ? 1 : 2;
  return story.chaosPulse[index] ?? story.chaosPulse[0];
}

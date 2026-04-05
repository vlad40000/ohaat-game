import type { BusinessId } from '../data/businesses';
import type { EpisodeId } from '../data/episodes';
import type { FactionId } from '../data/factions';

export interface EpisodeProgressState {
  foundTargetNames: string[];
  bonusClaimed: boolean;
}

export interface PlayerState {
  id: string;
  factionId: FactionId;
  legend: number;
  heat: number;
  evidence: number;
  cash: number;
  headlineTokens: number;
  merchLines: number;
  position: BusinessId;
  controlledBusinessIds: BusinessId[];
  revealedCardIds: string[];
  actionCount: number;
  specialsUsedThisRound: string[];
  capturedByPlayerId?: string;
}

export interface TileState {
  businessId: BusinessId;
  hiddenCardIds: string[];
  revealedCardIds: string[];
  controllerPlayerId?: string;
  contestedByPlayerIds: string[];
  exposed: boolean;
  auditCount: number;
  searchCount: number;
  fortifiedByPlayerId?: string;
  headlineTokenCount: number;
}

export interface SnorpState {
  active: boolean;
  tileBusinessId?: BusinessId;
  moves: number;
  corneredByPlayerId?: string;
}

export interface MatchFlags {
  publicClashWinsAtSonnysByPlayerId: Record<string, number>;
  exposedBusinessesByPlayerId: Record<string, number>;
  successfulDefenseCountByPlayerId: Record<string, number>;
  defendedBusinessStreakByPlayerId: Record<string, { businessId?: BusinessId; count: number }>;
  backRoomRewardKeysByPlayerId: Record<string, string[]>;
  merchLinesMaintainedFullRoundByPlayerId: Record<string, number>;
  secretRouteUsedThisRoundByPlayerId: Record<string, number>;
  rescueBonusMoveUsedThisRoundByPlayerId: Record<string, number>;
  hostedSuccessfulPublicEventAtSonnysByPlayerId?: string;
  freedCaptiveAndUsedSecretRouteSameRoundByPlayerId?: string;
  rescuedTargetDeliveredByPlayerId?: string;
  rescuedTargetDeliveredTo?: BusinessId;
  firstRescueRunWinnerPlayerId?: string;
  firstSonnysTargetWinnerPlayerId?: string;
  firstSnorpCornerWinnerPlayerId?: string;
  jailbreakResolvedByPlayerId?: string;
}

export interface MatchState {
  seed: string;
  round: number;
  turnNumber: number;
  currentPlayerId: string;
  playerOrder: string[];
  activeEpisodeId: EpisodeId;
  episodeProgressByPlayerId: Record<string, EpisodeProgressState>;
  players: Record<string, PlayerState>;
  tiles: Record<BusinessId, TileState>;
  log: string[];
  winnerPlayerId?: string;
  winnerReason?: string;
  snorp: SnorpState;
  flags: MatchFlags;
}

export interface SetupGameOptions {
  playerIds: string[];
  factionIds: FactionId[];
  seed?: string;
  useAllEpisodes?: boolean;
  startingCash?: number;
}

export interface SearchResult {
  state: MatchState;
  revealedCardId?: string;
  matchedTargets: string[];
}

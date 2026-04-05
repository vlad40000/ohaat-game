export type EpisodeId =
  | 'wrong_man_on_trial'
  | 'bowling_alley_bloodbath'
  | 'rescue_the_cryptid'
  | 'return_of_snorp'
  | 'panda_jailbreak'
  | 'backroom_commerce_fair'
  | 'chamber_scandal'
  | 'halloween_bowl_bash'
  | 'siege_of_the_fortress'
  | 'christmas_conversion_drive';

export interface EpisodeDef {
  id: EpisodeId;
  name: string;
  category: 'headline' | 'backroom' | 'chamber' | 'merch';
  revealText: string;
  searchTargets: string[];
  passiveRule: string;
  scoreRule: string;
  closerLabel: string;
  closerRule: string;
  starter: boolean;
}

export const EPISODES: EpisodeDef[] = [
  {
    id: 'wrong_man_on_trial',
    name: 'Episode 10 — Trial and Windy Sands Rescue',
    category: 'headline',
    revealText: 'Witness pressure, trial fallout, and rescue momentum define the finale episode.',
    searchTargets: ['Evidence', 'Witness', 'Ledger', 'Court Seal'],
    passiveRule: 'Witness-style reveals let you push the courtroom narrative onto a rival at your tile.',
    scoreRule: 'Complete the trial set for +3 Legend and stronger endgame control.',
    closerLabel: 'Finale Closer',
    closerRule: 'At 12+ Legend, finish the rescue-side episode with the cleanest evidence profile at the table.',
    starter: true,
  },
  {
    id: 'bowling_alley_bloodbath',
    name: "Episode 6 — Sonny's Birthday Bloodbath",
    category: 'headline',
    revealText: 'Once the exhibit escape spills into Sonny’s, every public fight becomes headline fuel.',
    searchTargets: ['Bowling Ball', 'Blood Trail', 'Crowd', 'Neon Sign'],
    passiveRule: 'Violence at Sonny’s gets +1 Hit once the birthday-floor chaos is live.',
    scoreRule: 'First player to lock in two Sonny’s fight clues gains +2 Legend.',
    closerLabel: 'Finale Closer',
    closerRule: 'At 12+ Legend, control Sonny’s and win a public clash there.',
    starter: true,
  },
  {
    id: 'rescue_the_cryptid',
    name: 'Episode 4 / 10 — Capture or Rescue the Cryptid',
    category: 'headline',
    revealText: 'The hunt can flip into a rescue run, and the first clean extraction is worth a huge swing.',
    searchTargets: ['Cage', 'Collar', 'Trail', 'Clinic Tag'],
    passiveRule: 'A player carrying a rescued target gains +1 move.',
    scoreRule: 'Reveal all 4 targets and escort the rescue to safety for +3 Legend.',
    closerLabel: 'Finale Closer',
    closerRule: 'Deliver the rescued target to Critter Corral or Sawbones Swamp Clinic.',
    starter: false,
  },
  {
    id: 'return_of_snorp',
    name: 'Episode 5 — Return of Snorp',
    category: 'headline',
    revealText: 'Snorp drops into the board as a neutral threat; first faction to corner or endure him gains the big reward.',
    searchTargets: ['Footprint', 'Radio Burst', 'Trap', 'Shadow'],
    passiveRule: 'Put the Snorp marker on a hidden business. Each time that tile is searched, move Snorp to the nearest hidden tile.',
    scoreRule: 'First player to corner Snorp gains +2 Legend.',
    closerLabel: 'Finale Closer',
    closerRule: 'At 12+ Legend, end your turn on Snorp’s tile after it has moved at least 3 times.',
    starter: true,
  },
  {
    id: 'panda_jailbreak',
    name: "Episode 7 — Bongbong's Story / Panda Pressure",
    category: 'headline',
    revealText: 'Interrogation heat, syndicate loyalty, and jailbreak pressure all point back at Bongbong this episode.',
    searchTargets: ['Jail Key', 'Shackles', 'Escape Route', 'Witness'],
    passiveRule: 'Rescue actions may target adjacent tiles.',
    scoreRule: 'Gain +2 Legend for causing or stopping a jailbreak.',
    closerLabel: 'Finale Closer',
    closerRule: 'At 12+ Legend, free a captive and move them through a secret route in the same round.',
    starter: false,
  },
  {
    id: 'backroom_commerce_fair',
    name: 'Episode 3 — Panda Crate Ambush',
    category: 'backroom',
    revealText: 'Contraband transport and shady backroom movement are faster this episode.',
    searchTargets: ['Contraband', 'Briefcase', 'Ledger', 'Merch Bundle'],
    passiveRule: 'The first time you Claim a business this round, immediately draw 1 Item / Back Room card.',
    scoreRule: 'Hold 3 different Back Room discoveries for +3 Legend.',
    closerLabel: 'Back Room Closer',
    closerRule: 'At 12+ Legend, hold 3 different Back Room rewards from different businesses.',
    starter: true,
  },
  {
    id: 'chamber_scandal',
    name: 'Episode 2 — Lab Infiltration and Cover-Up',
    category: 'chamber',
    revealText: 'Paperwork, cover stories, and camera-risk matter more while the Crowley-lab plot is active.',
    searchTargets: ['Yard Sign', 'Policy Folder', 'Permit', 'Broadcast Tape'],
    passiveRule: 'Revealing a Merch-linked target at a rival-controlled business places 1 Heat on that rival.',
    scoreRule: 'Expose 3 rival businesses for +3 Legend.',
    closerLabel: 'Chamber Closer',
    closerRule: 'At 12+ Legend, expose 3 rival businesses and still control 3 businesses of your own.',
    starter: false,
  },
  {
    id: 'halloween_bowl_bash',
    name: 'Episode 9 — Christmas in Swamp County',
    category: 'headline',
    revealText: 'The holiday state makes key venues louder and Sonny’s remains a huge public scoring point.',
    searchTargets: ['Mask', 'Candy Bucket', 'Costume Prop', 'Party Poster'],
    passiveRule: 'The first Host Event at Sonny’s each round costs 1 less Cash.',
    scoreRule: 'Reveal the full holiday-event set for +3 Legend.',
    closerLabel: 'Finale Closer',
    closerRule: 'At 12+ Legend, control Sonny’s and host a successful public event there.',
    starter: false,
  },
  {
    id: 'siege_of_the_fortress',
    name: 'Episode 8 — Honey Island Siege',
    category: 'chamber',
    revealText: 'The perimeter is hot, the fortress matters, and defense under pressure becomes the whole episode.',
    searchTargets: ['Barricade', 'Spotlight', 'Ammo Crate', 'Steel Door'],
    passiveRule: 'The first time you defend a claimed business each round, gain +1 die.',
    scoreRule: 'Each successful defense of a claimed business gains +2 Legend.',
    closerLabel: 'Chamber Closer',
    closerRule: 'At 12+ Legend, defend the same claimed business through 2 separate clashes.',
    starter: false,
  },
  {
    id: 'christmas_conversion_drive',
    name: 'Episode 1 — Pickled Platypus Eggs',
    category: 'merch',
    revealText: 'The opening conspiracy thread makes hidden supply lines lucrative, but sloppy schemes bring heat fast.',
    searchTargets: ['Donation Box', 'Gift Stack', 'Carol Sheet', 'Heat Notice'],
    passiveRule: 'Each active merch line you hold is worth +1 toward tie-break scoring.',
    scoreRule: 'Complete the holiday set for +3 Legend.',
    closerLabel: 'Merch Empire Closer',
    closerRule: 'At 12+ Legend, maintain 4 active merch lines for a full round.',
    starter: false,
  },
];

export const STARTER_EPISODE_IDS: EpisodeId[] = [
  'wrong_man_on_trial',
  'bowling_alley_bloodbath',
  'return_of_snorp',
  'backroom_commerce_fair',
];

export const EPISODE_MAP: Record<EpisodeId, EpisodeDef> = Object.fromEntries(
  EPISODES.map((episode) => [episode.id, episode]),
) as Record<EpisodeId, EpisodeDef>;

export type FactionId =
  | 'buck_and_stump'
  | 'hans_and_soupy'
  | 'rocco_and_cherry'
  | 'panda_syndicate'
  | 'cabbage_and_steve'
  | 'roger_and_anita';

export interface FactionDef {
  id: FactionId;
  name: string;
  roleTags: string[];
  passiveText: string;
  activeName: string;
  activeText: string;
  activeCost: number;
  activeTiming: 'your_turn' | 'reaction' | 'either';
  legendBias: string;
  starter: boolean;
}

export const FACTIONS: FactionDef[] = [
  {
    id: 'buck_and_stump',
    name: 'Buck & Stump',
    roleTags: ['defense', 'ambush', 'fortress'],
    passiveText:
      'When defending a business you control, gain +1 on the first defense roll each round. You may also peek at 1 facedown card at an adjacent business via Stump’s cyber-radar nonsense.',
    activeName: 'Fairy Dust Fart',
    activeText:
      'Spend 1 action to fortify your current controlled business. Rivals get -1 on their first Force or Claim attempt there until your next turn.',
    activeCost: 1,
    activeTiming: 'your_turn',
    legendBias: 'Scores best through defense, repeat control, and fortress-style episodes.',
    starter: true,
  },
  {
    id: 'hans_and_soupy',
    name: 'Hans & Soupy',
    roleTags: ['capture', 'extraction', 'pressure'],
    passiveText:
      'When you win a Force test, you may mark the rival as Captured instead of merely pressured. A Captured rival is easier to move, interrogate, and parade around like a trophy.',
    activeName: 'Unicefilis Assemble',
    activeText:
      'Spend 1 action to deploy the Less Thans extraction energy: move yourself and one Captured target to an adjacent tile. If that move uses a secret route, gain 1 Legend.',
    activeCost: 1,
    activeTiming: 'your_turn',
    legendBias: 'Scores best through capture chains, jailbreak denial, and forced repositioning.',
    starter: false,
  },
  {
    id: 'rocco_and_cherry',
    name: 'Rocco & Cherry',
    roleTags: ['event', 'cash', 'pressure'],
    passiveText:
      'The first time you Host, Scheme, or trigger a public event each round, reduce its Cash cost by 1 or gain +1 on the roll if it has no cost.',
    activeName: 'I Could Stick My Fist In That!',
    activeText:
      'Spend 1 action to trigger Cherry’s involuntary public spectacle. Gain 1 Headline token or move 1 Headline token from an uncontrolled business to your current business.',
    activeCost: 1,
    activeTiming: 'your_turn',
    legendBias: 'Scores best through event manipulation, public spots, and spending tempo.',
    starter: true,
  },
  {
    id: 'panda_syndicate',
    name: 'Panda Syndicate (Bongbong & Nipples)',
    roleTags: ['evidence', 'suppression', 'heat'],
    passiveText:
      'When you reveal a Witness, Toothpick, or Broadcast-linked hidden card, choose one: place 1 Toothpick / Evidence on a rival here, remove 1 from yourself, or give a rival 1 Heat.',
    activeName: 'Loose Lips Sink Ships',
    activeText:
      'Spend 1 action to blank one revealed Witness or Evidence target at your tile until the start of your next turn. In story terms, the witness has been handled.',
    activeCost: 1,
    activeTiming: 'your_turn',
    legendBias: 'Scores best through witness suppression, evidence tempo, and scandal play.',
    starter: true,
  },
  {
    id: 'cabbage_and_steve',
    name: 'Cabbage & Steve',
    roleTags: ['rescue', 'mobility', 'routes'],
    passiveText:
      'You gain +1 move while carrying a rescue target, and your first move through a secret route each round is free via Steve’s gate-control nonsense.',
    activeName: 'Skunkhole Extraction',
    activeText:
      'Spend 1 action to move yourself or an allied / rescued unit through a secret route to any connected valid business.',
    activeCost: 1,
    activeTiming: 'your_turn',
    legendBias: 'Scores best through rescue missions, route play, and evasive positioning.',
    starter: true,
  },
  {
    id: 'roger_and_anita',
    name: 'Roger & Anita',
    roleTags: ['evidence', 'scheme', 'blackmail'],
    passiveText:
      'Whenever you place Toothpicks / Evidence on a rival, gain 1 Scheme momentum. On your next Scheme at that rival’s tile, spend the momentum for +1.',
    activeName: 'You Know Too Much',
    activeText:
      'Spend 1 action to convert up to 2 Evidence on one rival into either +2 Heat on them or +2 Legend for you if you control the tile.',
    activeCost: 1,
    activeTiming: 'your_turn',
    legendBias: 'Scores best through engineered scandals and evidence conversion.',
    starter: false,
  },
];

export const STARTER_FACTION_IDS: FactionId[] = [
  'buck_and_stump',
  'rocco_and_cherry',
  'panda_syndicate',
  'cabbage_and_steve',
];

export const FACTION_MAP: Record<FactionId, FactionDef> = Object.fromEntries(
  FACTIONS.map((faction) => [faction.id, faction]),
) as Record<FactionId, FactionDef>;

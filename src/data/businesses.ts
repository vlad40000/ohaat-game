export type BusinessId =
  | 'mayors_office'
  | 'ledger_lodge'
  | 'critter_corral'
  | 'sonnys_strike_zone'
  | 'rustys_wrench_hut'
  | 'swamp_scroll_stack'
  | 'gator_jaw_tavern'
  | 'taco_gator_hut'
  | 'swamp_scam_insurers'
  | 'gator_gear_garage'
  | 'sawbones_swamp_clinic'
  | 'swamp_signal_co';

export type RewardKey =
  | 'plant_evidence'
  | 'wash_heat'
  | 'gain_animal_token'
  | 'host_headline'
  | 'sabotage_or_repair'
  | 'peek_deck'
  | 'public_clash_bonus'
  | 'secret_route_move'
  | 'audit_or_payout'
  | 'set_trap'
  | 'heal_or_boost_force'
  | 'inspect_or_interfere';

export interface BusinessDef {
  id: BusinessId;
  name: string;
  shortName: string;
  district: 'course_fairway' | 'swamp_wild' | 'public_spectacle' | 'industrial_service';
  zone:
    | 'civic'
    | 'commerce'
    | 'wild'
    | 'entertainment'
    | 'industrial'
    | 'occult'
    | 'hospitality'
    | 'travel'
    | 'services'
    | 'medical'
    | 'media';
  neighbors: BusinessId[];
  discoveryTags: string[];
  rewardLane: RewardKey[];
  rewardText: string[];
  controlText: string;
  starterLegendValue: number;
}

export const BUSINESSES: BusinessDef[] = [
  {
    id: 'mayors_office',
    name: 'Swamp County PD',
    shortName: 'Swamp PD',
    district: 'course_fairway',
    zone: 'civic',
    neighbors: ['ledger_lodge', 'swamp_scam_insurers', 'swamp_signal_co'],
    discoveryTags: ['Interrogation Tape', 'Panda Disguise', 'Sugary Coffee'],
    rewardLane: ['plant_evidence'],
    rewardText: [
      'Move 1 Toothpick / Evidence between players at this tile.',
      'Or plant 1 Toothpick / Evidence on a rival at your tile.',
    ],
    controlText: 'Civic pressure, frame jobs, and witness handling. Strong setup tile for Scheme and Toothpick play.',
    starterLegendValue: 2,
  },
  {
    id: 'ledger_lodge',
    name: 'Magical Sexual Sundries',
    shortName: 'Sex Sundries',
    district: 'course_fairway',
    zone: 'commerce',
    neighbors: ['mayors_office', 'rustys_wrench_hut', 'swamp_scam_insurers'],
    discoveryTags: ['Dildo', 'Whip', 'Shipping Crate'],
    rewardLane: ['wash_heat'],
    rewardText: ['Remove 1 Heat from yourself.', 'Or gain 1 Cash by flipping contraband stock through the back room.'],
    controlText: 'Panda Syndicate contraband front. Launders Heat, hides inventory, and makes commerce feel filthy.',
    starterLegendValue: 2,
  },
  {
    id: 'critter_corral',
    name: 'Everglade Wildlife Preserve & Zoo',
    shortName: 'Everglade Zoo',
    district: 'swamp_wild',
    zone: 'wild',
    neighbors: ['gator_gear_garage', 'sawbones_swamp_clinic', 'taco_gator_hut'],
    discoveryTags: ['Orange Jumpsuit', 'Broomstick', 'Prison Cell'],
    rewardLane: ['gain_animal_token'],
    rewardText: ['Gain 1 Animal token.', 'Or mark a rival as Captured if you pass a Force or Rescue beat here.'],
    controlText: 'Cryptid containment, jailbreak pressure, and rescue hooks all collide here.',
    starterLegendValue: 2,
  },
  {
    id: 'sonnys_strike_zone',
    name: "Sonny G's Bowling Alley",
    shortName: "Sonny's",
    district: 'public_spectacle',
    zone: 'entertainment',
    neighbors: ['gator_jaw_tavern', 'taco_gator_hut', 'swamp_signal_co'],
    discoveryTags: ['Bowling Ball', 'Piñata', 'Puffdog'],
    rewardLane: ['host_headline'],
    rewardText: ['Gain 1 Headline token.', 'Or take a free Host Event / public pressure effect here.'],
    controlText: 'Public violence hotspot, SKA meeting ground, and the cleanest place on the board to turn chaos into spectacle.',
    starterLegendValue: 3,
  },
  {
    id: 'rustys_wrench_hut',
    name: 'The Skunkhole',
    shortName: 'Skunkhole',
    district: 'industrial_service',
    zone: 'industrial',
    neighbors: ['ledger_lodge', 'gator_gear_garage', 'taco_gator_hut'],
    discoveryTags: ['Chess Piece', 'Monitor', 'Headset'],
    rewardLane: ['sabotage_or_repair'],
    rewardText: ['Repair one of your protections or clear a broken status.', 'Or inspect a rival progress line and sabotage an adjacent controlled business.'],
    controlText: 'Cabbage and Steve hideout energy: repair rigs, monitor feeds, and quiet technical sabotage.',
    starterLegendValue: 2,
  },
  {
    id: 'swamp_scroll_stack',
    name: 'Aleister Crowley Institute',
    shortName: 'Crowley Inst.',
    district: 'swamp_wild',
    zone: 'occult',
    neighbors: ['gator_jaw_tavern', 'sawbones_swamp_clinic', 'swamp_signal_co'],
    discoveryTags: ['Wheelchair', 'Planet X Portal', 'God Serum'],
    rewardLane: ['peek_deck'],
    rewardText: ['Peek at the top 2 hidden cards of any business.', 'Or peek at the next Episode / event-facing card.'],
    controlText: 'Paranormal physics, portals, and deep lore leverage. This is the story engine for prophecy nonsense.',
    starterLegendValue: 2,
  },
  {
    id: 'gator_jaw_tavern',
    name: "Dale's Kill-Your-Own Veal Farm",
    shortName: "Dale's Veal",
    district: 'public_spectacle',
    zone: 'hospitality',
    neighbors: ['sonnys_strike_zone', 'swamp_scroll_stack', 'taco_gator_hut'],
    discoveryTags: ['Hammer', 'Pipe', 'Blood Trail'],
    rewardLane: ['public_clash_bonus'],
    rewardText: ['Your next public clash this round gets +1 Hit.', 'Or gain 1 Cash after a public clash.'],
    controlText: 'Cheap, family-friendly violence. If the episode wants blood in public, this place is happy to help.',
    starterLegendValue: 2,
  },
  {
    id: 'taco_gator_hut',
    name: "Rosita's Dress Barn",
    shortName: 'Dress Barn',
    district: 'industrial_service',
    zone: 'travel',
    neighbors: ['critter_corral', 'sonnys_strike_zone', 'rustys_wrench_hut', 'gator_jaw_tavern'],
    discoveryTags: ['Dress', 'Camouflage', 'Receipt'],
    rewardLane: ['secret_route_move'],
    rewardText: ['Move to any adjacent tile for free.', 'Or swap your position with a decoy-quality disguise route.'],
    controlText: 'Disguises, mobility, and evasive positioning. The board gets slipperier when this venue is live.',
    starterLegendValue: 2,
  },
  {
    id: 'swamp_scam_insurers',
    name: 'Jehovah Fitness Center',
    shortName: 'Jehovah Fitness',
    district: 'course_fairway',
    zone: 'services',
    neighbors: ['mayors_office', 'ledger_lodge', 'sawbones_swamp_clinic'],
    discoveryTags: ['Coupon', 'Treadmill', 'Holy Water'],
    rewardLane: ['audit_or_payout'],
    rewardText: ['Choose: remove 1 status penalty or gain 2 Cash.', 'A cleansed business is easier to stabilize after Heat or scandal.'],
    controlText: 'Apocalyptic cult gym energy. Good for cleansing status pressure while quietly stockpiling money.',
    starterLegendValue: 2,
  },
  {
    id: 'gator_gear_garage',
    name: "Gooch's Golf Course",
    shortName: "Gooch's",
    district: 'industrial_service',
    zone: 'industrial',
    neighbors: ['rustys_wrench_hut', 'critter_corral', 'sawbones_swamp_clinic'],
    discoveryTags: ['Golf Club', 'Lotion', 'Meat Suit'],
    rewardLane: ['set_trap'],
    rewardText: ['Set 1 Trap on this tile or an adjacent tile.', 'A trapped tile punishes the next rival Search or Force here.'],
    controlText: 'Hunting-show turf full of ambush setups, bait, and high-profile humiliation opportunities.',
    starterLegendValue: 2,
  },
  {
    id: 'sawbones_swamp_clinic',
    name: 'Sawbones Swamp Clinic',
    shortName: 'Sawbones',
    district: 'swamp_wild',
    zone: 'medical',
    neighbors: ['critter_corral', 'swamp_scroll_stack', 'swamp_scam_insurers', 'gator_gear_garage'],
    discoveryTags: ['Serum', 'Bandage', 'Clean Record'],
    rewardLane: ['heal_or_boost_force'],
    rewardText: ['Remove 1 injury / status penalty.', 'Or gain +1 on your next Force or Rescue test.'],
    controlText: 'Still the safest recovery space on the board, now flavored as the only place with semi-believable cleanup.',
    starterLegendValue: 2,
  },
  {
    id: 'swamp_signal_co',
    name: 'Windy Sands Observatory',
    shortName: 'Windy Sands',
    district: 'public_spectacle',
    zone: 'media',
    neighbors: ['mayors_office', 'sonnys_strike_zone', 'swamp_scroll_stack'],
    discoveryTags: ['Golden Lamp', 'Telescope', 'Blood Tank'],
    rewardLane: ['inspect_or_interfere'],
    rewardText: ['Inspect 1 random card or hidden progress from a rival.', 'Or interfere with the next event-facing trigger this round.'],
    controlText: 'Penthouse surveillance, deep information leverage, and the cleanest line of sight on the whole mess.',
    starterLegendValue: 3,
  },
];

export const BUSINESS_MAP: Record<BusinessId, BusinessDef> = Object.fromEntries(
  BUSINESSES.map((business) => [business.id, business]),
) as Record<BusinessId, BusinessDef>;

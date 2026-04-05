import type { BusinessId } from './businesses';
import type { EpisodeId } from './episodes';
import type { FactionId } from './factions';

export type EpisodeActStage = 'cold_open' | 'escalation' | 'finale';

export interface EpisodeActDef {
  stage: EpisodeActStage;
  title: string;
  text: string;
}

export interface EpisodeStoryDef {
  episodeId: EpisodeId;
  premise: string;
  inspiration: string;
  spotlightVenueId: BusinessId;
  overlayName: string;
  overlayText: string;
  chaosPulse: string[];
  acts: EpisodeActDef[];
}

export interface FactionStoryDef {
  factionId: FactionId;
  huntedTarget: string;
  preferredAlly: string;
  hatedVenueId: BusinessId;
  hatedVenueReason: string;
  hook: string;
}

export const EPISODE_STORY: EpisodeStoryDef[] = [
  {
    episodeId: 'wrong_man_on_trial',
    premise: 'Courtroom chaos, planted witnesses, and swamp-town legal theater explode into a public scandal.',
    inspiration: 'Leans into the scripts’ legal pressure, syndicate mess, and public humiliation energy.',
    spotlightVenueId: 'mayors_office',
    overlayName: 'Trial Day at the Courthouse',
    overlayText: 'The cameras are outside, paper trails matter, and one bad witness can flip the town narrative.',
    chaosPulse: ['A reporter van parks outside.', 'A witness changes their statement.', 'The judge wants spectacle more than truth.'],
    acts: [
      { stage: 'cold_open', title: 'Cold Open: Bad Paperwork', text: 'Start with legal pressure. Civic tiles feel hot and evidence starts moving fast.' },
      { stage: 'escalation', title: 'Escalation: Witness Circus', text: 'Broadcasts and witness cards become more dangerous as the town starts watching.' },
      { stage: 'finale', title: 'Finale: Public Verdict', text: 'The Mayor’s Office becomes the spotlight stage. Whoever controls the narrative can steal the ending.' },
    ],
  },
  {
    episodeId: 'bowling_alley_bloodbath',
    premise: 'A public grudge at Sonny’s turns from a petty confrontation into a legendary local disaster.',
    inspiration: 'Captures the scripts’ bowling alley spectacle, bar fight energy, and crowd-pleasing chaos.',
    spotlightVenueId: 'sonnys_strike_zone',
    overlayName: 'Birthday Night at Sonny’s',
    overlayText: 'The alley is packed, drinks are flowing, and every ugly move gets an audience.',
    chaosPulse: ['A party bus unloads.', 'The karaoke machine starts feeding the crowd.', 'Everyone suddenly has an opinion.'],
    acts: [
      { stage: 'cold_open', title: 'Cold Open: Trash Talk', text: 'The alley becomes a pressure cooker and public actions start getting noticed.' },
      { stage: 'escalation', title: 'Escalation: Crowd Turns Ugly', text: 'Headline tokens and public Force swing faster as the room picks sides.' },
      { stage: 'finale', title: 'Finale: Main Event at Sonny’s', text: 'The cameras, the crowd, and the blood trail all point back to one huge scene at Sonny’s.' },
    ],
  },
  {
    episodeId: 'rescue_the_cryptid',
    premise: 'A captured creature becomes the center of a rescue mission through clinics, cages, and swamp shortcuts.',
    inspiration: 'Pulls from cryptid pursuit, rescue beats, tracking props, and care-vs-capture conflict.',
    spotlightVenueId: 'critter_corral',
    overlayName: 'Zoo Lockdown',
    overlayText: 'Cages are sealed, handlers are panicking, and everyone claims they are helping.',
    chaosPulse: ['A handler drops the keys.', 'A false trail leads into the reeds.', 'Animal control shows up at the worst moment.'],
    acts: [
      { stage: 'cold_open', title: 'Cold Open: Something Escaped', text: 'Tracking, cages, and rescue clues show up fast in the wild district.' },
      { stage: 'escalation', title: 'Escalation: Chase Through the Swamp', text: 'Movement becomes more valuable as escort routes and trap paths matter.' },
      { stage: 'finale', title: 'Finale: Safe Delivery', text: 'Critter Corral and Sawbones become the emotional finish line for the whole episode.' },
    ],
  },
  {
    episodeId: 'return_of_snorp',
    premise: 'A neutral cryptid threat keeps slipping through the board while every faction tries to turn the chaos into legend.',
    inspiration: 'Matches the scripts’ monster-hunt energy, observation tech, and near-miss set pieces.',
    spotlightVenueId: 'swamp_signal_co',
    overlayName: 'Observation Tower Alert',
    overlayText: 'Static bursts, bait rigs, and terrified eyewitnesses make the whole town feel hunted.',
    chaosPulse: ['A radio burst spikes.', 'Something big crosses a trail cam.', 'A trap line is tripped but nothing is there.'],
    acts: [
      { stage: 'cold_open', title: 'Cold Open: Strange Readings', text: 'Signals and tracks suggest Snorp is near, but no one can pin it down.' },
      { stage: 'escalation', title: 'Escalation: Hunt Party Forms', text: 'Trap tags, broadcasts, and movement tricks gain urgency as the board starts reacting.' },
      { stage: 'finale', title: 'Finale: Live Sighting', text: 'The story becomes public. Signal Co. and the nearest hot zone become the episode’s camera magnet.' },
    ],
  },
  {
    episodeId: 'panda_jailbreak',
    premise: 'Captives, escape routes, and syndicate pressure collide in a slapstick breakout attempt.',
    inspiration: 'Built from the panda-syndicate comedy, jailbreak beats, and chase-routing from the docs.',
    spotlightVenueId: 'taco_gator_hut',
    overlayName: 'Transit Route Compromised',
    overlayText: 'Every back hallway, tunnel map, and greasy shortcut is suddenly valuable.',
    chaosPulse: ['A delivery truck blocks the road.', 'A captive bolts for the wrong exit.', 'Someone swapped the key ring.'],
    acts: [
      { stage: 'cold_open', title: 'Cold Open: The Holding Cell', text: 'Captivity and escape routes enter the story immediately.' },
      { stage: 'escalation', title: 'Escalation: Keys Change Hands', text: 'Route cards and jailbreak pressure spread outward across the map.' },
      { stage: 'finale', title: 'Finale: Breakout Run', text: 'The finale becomes a desperate route race through the travel and entertainment lanes.' },
    ],
  },
  {
    episodeId: 'backroom_commerce_fair',
    premise: 'A shady town fair turns every side deal into a chance for profit, betrayal, and hidden inventory.',
    inspiration: 'Reflects the scripts’ backroom scams, shady merchants, and event-day bustle.',
    spotlightVenueId: 'ledger_lodge',
    overlayName: 'Commerce Fair',
    overlayText: 'Merch tables, side bets, and briefcases make every claim feel like a handshake deal.',
    chaosPulse: ['A vendor slips contraband into the stock.', 'A suitcase goes missing.', 'The cash box looks lighter than it should.'],
    acts: [
      { stage: 'cold_open', title: 'Cold Open: Side Deals', text: 'Back-room play gets easier and money starts flowing through commerce spaces.' },
      { stage: 'escalation', title: 'Escalation: Market Frenzy', text: 'Claiming and searching commercial venues become richer and more contested.' },
      { stage: 'finale', title: 'Finale: Fairground Sting', text: 'The fair becomes a public bust opportunity where every reward can become evidence.' },
    ],
  },
  {
    episodeId: 'chamber_scandal',
    premise: 'A fake-respectable business scene collapses into exposure, permits, and public embarrassment.',
    inspiration: 'Focuses on civic hypocrisy, signage, policies, and public-facing scandal.',
    spotlightVenueId: 'swamp_scam_insurers',
    overlayName: 'Chamber Mixer',
    overlayText: 'Everyone is pretending to be respectable while quietly sabotaging each other.',
    chaosPulse: ['A permit inspector arrives early.', 'The sponsorship banner has the wrong logo.', 'Someone leaks a folder to the press.'],
    acts: [
      { stage: 'cold_open', title: 'Cold Open: Handshakes and Lies', text: 'Merch, policy folders, and civic fronts become the real battleground.' },
      { stage: 'escalation', title: 'Escalation: Exposure Spiral', text: 'Audit markers and scandal triggers spread faster once the chamber notices.' },
      { stage: 'finale', title: 'Finale: The Mixer Melts Down', text: 'Scam Insurers becomes the spotlight stage where polite society falls apart in public.' },
    ],
  },
  {
    episodeId: 'halloween_bowl_bash',
    premise: 'A costume-heavy event at Sonny’s turns party props into tactical tools and public comedy.',
    inspiration: 'Uses the scripts’ performance chaos, costuming, and venue-night energy.',
    spotlightVenueId: 'sonnys_strike_zone',
    overlayName: 'Halloween Bowl Bash',
    overlayText: 'Masks, candy buckets, and party posters make every move look bigger than it is.',
    chaosPulse: ['Someone shows up in the wrong costume.', 'The fog machine hides a clue.', 'A child wins a prop that should not be dangerous.'],
    acts: [
      { stage: 'cold_open', title: 'Cold Open: Costume Arrival', text: 'Setup is light and silly, but public attention starts climbing immediately.' },
      { stage: 'escalation', title: 'Escalation: Party Fever', text: 'Host-style actions and performance pressure spike as the room fills.' },
      { stage: 'finale', title: 'Finale: Spotlight Lanes', text: 'Sonny’s becomes a giant performance arena where control is worth far more than usual.' },
    ],
  },
  {
    episodeId: 'siege_of_the_fortress',
    premise: 'A defended holdout becomes a televised siege full of towers, barricades, and ranged pressure.',
    inspiration: 'Tracks the scripts’ obsession with hunting rigs, towers, and home-field defense.',
    spotlightVenueId: 'gator_gear_garage',
    overlayName: 'Lockdown Perimeter',
    overlayText: 'The town is talking about barricades, defenses, and whoever survives the pressure cooker.',
    chaosPulse: ['A spotlight sweeps the road.', 'Someone hears a shot from the tree line.', 'A trap gets sprung too early.'],
    acts: [
      { stage: 'cold_open', title: 'Cold Open: Fortify the Hold', text: 'Defenders get comfortable while everyone else starts circling.' },
      { stage: 'escalation', title: 'Escalation: Range Pressure', text: 'Every defensive success becomes part of the episode story.' },
      { stage: 'finale', title: 'Finale: Breach Attempt', text: 'The fortified venue becomes the inevitable clash site everyone has been building toward.' },
    ],
  },
  {
    episodeId: 'christmas_conversion_drive',
    premise: 'A holiday promotion mutates into merch pressure, goodwill theater, and small-town exposure.',
    inspiration: 'Lifts straight from the holiday-event and fake-charity tone in the scripts.',
    spotlightVenueId: 'gator_jaw_tavern',
    overlayName: 'Holiday Charity Drive',
    overlayText: 'Lights, donation boxes, and public guilt make even cheap scams look festive.',
    chaosPulse: ['A choir blocks the entrance.', 'The donation jar goes missing.', 'A holiday mascot turns violent.'],
    acts: [
      { stage: 'cold_open', title: 'Cold Open: Decorating Day', text: 'Merch gets stronger, but so does the cost of failing in public.' },
      { stage: 'escalation', title: 'Escalation: Charity Pressure', text: 'The town starts rewarding whoever looks generous enough to fool them.' },
      { stage: 'finale', title: 'Finale: Holiday Meltdown', text: 'The tavern and nearby civic lanes become a festive disaster zone with real scoring weight.' },
    ],
  },
];

export const FACTION_STORY: FactionStoryDef[] = [
  {
    factionId: 'buck_and_stump',
    huntedTarget: 'Cabbage',
    preferredAlly: 'Chef Jamison',
    hatedVenueId: 'critter_corral',
    hatedVenueReason: 'Buck hates any place that turns the hunt into a rescue story.',
    hook: 'Big-game ego, traps, and televised hunting nonsense.',
  },
  {
    factionId: 'hans_and_soupy',
    huntedTarget: 'Cabbage',
    preferredAlly: 'One through Four & One Half',
    hatedVenueId: 'ledger_lodge',
    hatedVenueReason: 'Hans wants the hunt, not the bookkeeping.',
    hook: 'Observation towers, capture pressure, and a very theatrical predator vibe.',
  },
  {
    factionId: 'rocco_and_cherry',
    huntedTarget: 'Hans Von Braunen',
    preferredAlly: 'Roger',
    hatedVenueId: 'mayors_office',
    hatedVenueReason: 'Nothing good for Rocco happens when officials get involved.',
    hook: 'Venue control, spectacle, and turning disasters into a show.',
  },
  {
    factionId: 'panda_syndicate',
    huntedTarget: 'Witnesses',
    preferredAlly: 'Bongbong',
    hatedVenueId: 'swamp_signal_co',
    hatedVenueReason: 'Broadcasts and witnesses make syndicate work harder.',
    hook: 'Suppression, pressure, and making evidence disappear before it gets public.',
  },
  {
    factionId: 'cabbage_and_steve',
    huntedTarget: 'Buck Addington',
    preferredAlly: 'Roger',
    hatedVenueId: 'gator_gear_garage',
    hatedVenueReason: 'Traps, spotlights, and hunting rigs are exactly what Cabbage wants to avoid.',
    hook: 'Escape routes, survival, and getting the weird target out alive.',
  },
  {
    factionId: 'roger_and_anita',
    huntedTarget: 'Anyone holding evidence',
    preferredAlly: 'Cabbage',
    hatedVenueId: 'sonnys_strike_zone',
    hatedVenueReason: 'Roger thrives in chaos, but Sonny’s chaos gets too public too fast.',
    hook: 'Files, leverage, and turning embarrassment into advantage.',
  },
];

export const EPISODE_STORY_MAP: Record<EpisodeId, EpisodeStoryDef> = Object.fromEntries(
  EPISODE_STORY.map((entry) => [entry.episodeId, entry]),
) as Record<EpisodeId, EpisodeStoryDef>;

export const FACTION_STORY_MAP: Record<FactionId, FactionStoryDef> = Object.fromEntries(
  FACTION_STORY.map((entry) => [entry.factionId, entry]),
) as Record<FactionId, FactionStoryDef>;

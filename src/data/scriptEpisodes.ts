export interface ScriptEpisodeDef {
  number: number;
  title: string;
  shortHook: string;
  synopsis: string;
  featuredCast: string[];
  featuredVenues: string[];
  boardHook: string;
  winPath: string;
}

export const SCRIPT_EPISODES: ScriptEpisodeDef[] = [
  {
    number: 1,
    title: 'Pickled Platypus Eggs',
    shortHook: 'Roger kills at Gooch’s while Buck and Stump chase Cabbage through the swamp edge.',
    synopsis:
      'The opener establishes the golf-course murder pattern, Buck’s cryptid-hunter energy, the platypus egg thread, and the first real sense that Swamp County works on conspiracy logic instead of normal logic.',
    featuredCast: ['Roger', 'Buck', 'Stump', 'Cabbage', 'Rocco', 'Cherry', 'Dick Johnson'],
    featuredVenues: ["Gooch's Golf Course", 'Swamp fringe', 'Golf course office'],
    boardHook:
      'Start with evidence pressure and a moving hunt target. Public kills and cryptid tracking should both matter at once.',
    winPath:
      'Best as an opener that rewards early clues, first contact with the hunt target, and controlling Gooch’s before the town fully reacts.',
  },
  {
    number: 2,
    title: 'Meetings, Meat Suits, and Orgies',
    shortHook: 'SKA, the Crowley lab, and the Nibiru platypus-egg conspiracy collide.',
    synopsis:
      'Roger enters Serial Killers Anonymous, learns the Nibiru plot, kills the wrong assistant, and uses a meat-suit infiltration to enter the lab. This is the strongest scheme-and-infiltration episode in the set.',
    featuredCast: ['Roger', 'Iceman', 'Dean Pleasures', 'Melissa', 'Buck', 'Stump'],
    featuredVenues: ["Sonny G's Bowling Alley", 'Crowley Institute', 'Intergalactic Observatory Lab'],
    boardHook:
      'Use this card when the table wants scheme actions, covert access, evidence planting, and one big lab reveal.',
    winPath:
      'Score by infiltrating science/civic spaces, stealing knowledge first, and weaponizing evidence before rivals stabilize.',
  },
  {
    number: 3,
    title: 'Panda Crate Ambush',
    shortHook: 'Chef’s delivery goes wrong and Bongbong blows the transport apart.',
    synopsis:
      'Chef calls Buck to move a dangerous crate, the rig becomes a rolling disaster, and the Panda Syndicate side of the setting gets louder and more physical.',
    featuredCast: ['Chef Jamison', 'Buck', 'Stump', 'Bongbong'],
    featuredVenues: ['Kitchen', "Buck's RV", "Buck's garage / fortress staging"],
    boardHook:
      'Great for cargo movement, ambush timing, contraband transport, and sudden mid-route violence.',
    winPath:
      'Reward the faction that safely escorts the crate or turns the ambush into immediate board control and contraband profit.',
  },
  {
    number: 4,
    title: 'Old Men and Small Animals',
    shortHook: 'The E.A.T. convention, celebrity feud, and Windy Sands spectacle come online.',
    synopsis:
      'Roger keeps killing, the E.A.T. Animals convention turns Windy Sands into a crowded event map, and Dusty Bones versus Rick Hollywood adds public-showdown energy to the board.',
    featuredCast: ['Roger', 'Iceman', 'Hans Van Braunen', 'Soupy', 'Dusty Bones', 'Rick Hollywood'],
    featuredVenues: ['Windy Sands Resort', "Gooch's property line", 'Convention grounds'],
    boardHook:
      'This is the cleanest event-mode episode: use crowds, cages, celebrity attraction, and a packed venue with many simultaneous objectives.',
    winPath:
      'Win by controlling the convention zone, swinging the public feud, and extracting the highest value from event actions before the crowd turns.',
  },
  {
    number: 5,
    title: 'Return of Snorp',
    shortHook: 'Snorp drops from Nibiru and every faction suddenly has a monster problem.',
    synopsis:
      'Snorp arrives with a direct mission, Buck and Chef become unwilling first responders, and the platypus egg thread becomes a full board-level threat.',
    featuredCast: ['Snorp', 'Buck', 'Stump', 'Chef Jamison', 'Roger', 'Cabbage', 'Steve'],
    featuredVenues: ['Crash site', "Gooch's perimeter", 'Skunkhole'],
    boardHook:
      'Use a roaming neutral threat that keeps moving after searches, forcing factions to chase, bait, corner, or survive it.',
    winPath:
      'First faction to corner, redirect, or endure the Snorp threat without losing tempo should get the biggest episode payout.',
  },
  {
    number: 6,
    title: "Krakhead Exhibit / Sonny's Birthday Bloodbath",
    shortHook: 'Roger escapes the exhibit and the board funnels into a violent night at Sonny’s.',
    synopsis:
      'The Windy Sands exhibit sequence becomes an escape setup and then detonates into one of the strongest public-fight episodes in the whole run once the party reaches Sonny’s.',
    featuredCast: ['Roger', 'Anita', 'Howard', 'Buck', 'Stump', 'Bongbong', 'Chef Jamison'],
    featuredVenues: ['Krakhead Exhibit', "Sonny G's Bowling Alley", 'Birthday party floor'],
    boardHook:
      'Build this as an escape-to-brawl episode: first survive the exhibit, then let Sonny’s become the main collision point.',
    winPath:
      'Score by triggering or surviving the wall-of-death style clash, taking Sonny’s, and converting the crowd into legend.',
  },
  {
    number: 7,
    title: "Bongbong's Story",
    shortHook: 'Interrogation, backstory, and Panda Syndicate hierarchy move into the center.',
    synopsis:
      'Episode 7 deepens Bongbong, explains more of Buck’s grudge history, and turns the Panda Syndicate from a side nuisance into a clearer power structure.',
    featuredCast: ['Bongbong', 'Dick Johnson', 'Spinks', 'Major Nipples', 'Buck'],
    featuredVenues: ['Interrogation room', 'Flashback spaces', 'Syndicate memory beats'],
    boardHook:
      'This is a frame-job and testimony episode. It works best when information, confession pressure, and syndicate evidence are all valuable.',
    winPath:
      'Reward the faction that controls testimony, keeps heat off itself, and turns syndicate evidence into a decisive board swing.',
  },
  {
    number: 8,
    title: 'Honey Island Siege',
    shortHook: 'A toxic-origin monster and fortress pressure turn the board into defense mode.',
    synopsis:
      'The Honey Island creature enters with a revenge angle, Buck’s world becomes siege-ready, and the setting finally feels big enough for barricades, towers, and fortified showdowns.',
    featuredCast: ['Honey Island Swamp Monster', 'Buck', 'Stump', 'Chef Jamison', 'Hans', 'Soupy'],
    featuredVenues: ["Buck's fortress", 'Observation tower', 'Approach roads'],
    boardHook:
      'Run this as the dedicated defense episode. Fortifications, ranged pressure, and repeated assaults should define the round.',
    winPath:
      'Win by holding the fortress perimeter through multiple clashes or by breaking it before the defenders can stabilize.',
  },
  {
    number: 9,
    title: 'Christmas in Swamp County',
    shortHook: 'Holiday decorations, bait plans, and prison pressure make the town feel connected.',
    synopsis:
      'Nearly every major location gets a Christmas layer, Bongbong’s prison cell becomes important, and Hans’s plan to use Roger as bait turns the middle board into a holiday trap.',
    featuredCast: ['Rocco', 'Cherry', 'Buck', 'Stump', 'Hans', 'Soupy', 'Bongbong', 'Roger', 'Anita'],
    featuredVenues: ['Swamp County wide', "Gooch's", 'Windy Sands', 'Bongbong prison cell'],
    boardHook:
      'Use this as a town-wide event card. Many venues matter at once and holiday props become action hooks instead of flavor only.',
    winPath:
      'Reward factions that hold multiple active venues during the holiday state while also surviving the bait-and-capture plan.',
  },
  {
    number: 10,
    title: 'Trial and Windy Sands Rescue',
    shortHook: 'Courtroom pressure and a direct rescue mission collide in the finale.',
    synopsis:
      'The final uploaded episode folds legal fallout, Panda Syndicate pressure, and the Buck-led Windy Sands rescue into one convergence card. It is the cleanest endgame episode in the set.',
    featuredCast: ['Bongbong', 'Buck', 'Stump', 'Cabbage', 'Roger', 'Hans', 'Soupy', 'Dean Pleasures', 'Major Nipples'],
    featuredVenues: ['Courtroom', 'Windy Sands white room', 'Swamp approach', 'Observation spaces'],
    boardHook:
      'This is the finale card. Pair witness pressure with a direct raid so the table has both a paper war and a physical rescue clock.',
    winPath:
      'Win by resolving the rescue, surviving the courtroom narrative, and controlling the last big public reveal.',
  },
];

export const SCRIPT_EPISODE_MAP = Object.fromEntries(
  SCRIPT_EPISODES.map((episode) => [episode.number, episode]),
) as Record<number, ScriptEpisodeDef>;

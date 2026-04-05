export interface LoreCard {
  question: string;
  answer: string;
  tag: 'character' | 'faction' | 'venue' | 'plot' | 'threat';
}

export const LORE_CARDS: LoreCard[] = [
  { question: 'What does SKA stand for?', answer: 'Serial Killers Anonymous.', tag: 'faction' },
  { question: "Who becomes Roger's first sponsor?", answer: 'Rich K., the Iceman.', tag: 'character' },
  { question: 'Why is Roger pushed toward SKA?', answer: 'Because his killing is starting to affect his work performance.', tag: 'plot' },
  { question: 'What are the Annunaki according to the conspiracy thread?', answer: 'Skunkapes from Planet X / Nibiru who want to enslave humanity.', tag: 'threat' },
  { question: 'What is being fired at Nibiru to keep them distracted?', answer: 'Eggs from the last heterosexual platypus pair.', tag: 'plot' },
  { question: 'What does E.A.T. stand for?', answer: 'Emotional Awareness Treatment.', tag: 'venue' },
  { question: 'Who are Anita and Fabio?', answer: 'The last straight platypus couple in the world.', tag: 'character' },
  { question: 'Where does Roger infiltrate the lab story?', answer: 'The Aleister Crowley Institute for Paranormal Physics.', tag: 'venue' },
  { question: 'How does Roger get into the lab?', answer: 'He uses a meat-suit disguise to pass the palm and retina scan.', tag: 'plot' },
  { question: 'Who is Buck Addington?', answer: 'The groundskeeper at Gooch’s and a professional cryptid hunter.', tag: 'character' },
  { question: 'Who is Stump?', answer: "Buck's cybernetic dog companion.", tag: 'character' },
  { question: 'What is Stump’s most important gimmick?', answer: 'His tail can morph into tools and weapons.', tag: 'character' },
  { question: 'Who runs the Panda Syndicate?', answer: 'Major Nipples the Clown.', tag: 'faction' },
  { question: 'What is Roger’s calling card on victims?', answer: 'A single toothpick.', tag: 'plot' },
  { question: 'Who is Dusty Bones?', answer: 'The legendary wrestler hired by Rocco.', tag: 'character' },
  { question: 'Who is Rick Hollywood?', answer: 'Dusty Bones’s flashy professional rival, the “Natural Boy.”', tag: 'character' },
  { question: 'Who owns the Windy Sands Resort?', answer: 'Hans Van Braunen, the vampire antagonist.', tag: 'character' },
  { question: 'Who is Soupy?', answer: "Hans Van Braunen's loyal assistant and clone-line handler.", tag: 'character' },
  { question: 'Who are the Less Thans?', answer: "Soupy's numbered helpers who can combine into a larger form.", tag: 'faction' },
  { question: 'Who is Snorp?', answer: 'The Nibiru chimp harbinger sent to recover the platypus egg machines.', tag: 'threat' },
  { question: 'Why does Hans want skunkape blood?', answer: 'He believes it can cure his albinism and let him survive in the sun.', tag: 'plot' },
  { question: 'What is the Skunkhole?', answer: 'A hidden lair used by Cabbage and Steve.', tag: 'venue' },
  { question: 'How is the Honey Island Swamp Monster created?', answer: 'From a circus-train toxic-waste crash that fuses multiple creatures together.', tag: 'threat' },
  { question: 'How did Buck lose his hand?', answer: 'Bongbong bit it off during a commercial shoot.', tag: 'plot' },
  { question: 'What is the Krakhead Exhibit?', answer: 'A Windy Sands attraction built around trapping residents in a free-crack nightmare.', tag: 'venue' },
  { question: 'What phrase does Roger keep using before he attacks?', answer: '“You know too much.”', tag: 'character' },
  { question: 'What is Jehovah’s Fitness?', answer: 'A cult-like fitness organization preparing members for Armageddon.', tag: 'venue' },
  { question: 'What is the main evidence used to tie Bongbong to the murders?', answer: 'A box of toothpicks connected to the killer’s calling card.', tag: 'plot' },
];

export const LORE_TAG_ORDER: LoreCard['tag'][] = ['character', 'faction', 'venue', 'plot', 'threat'];

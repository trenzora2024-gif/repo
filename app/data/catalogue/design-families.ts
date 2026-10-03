import type {DesignFamily, PersonalizationConfig} from './types.ts';

/**
 * The 10 master design concepts. Every concept ships on all three hero
 * products, so copy here must work for a tee, a tote and a tumbler.
 *
 * Source of truth: the official production masters
 * (catalogue/artwork-source.json). Copy describes what is actually on the
 * artwork. Never describe motifs that aren't there.
 *
 * V1 launch = 8 families (24 SKUs). `us` and `make-it-yours` are V2
 * personalization concepts: their masters carry template wording, so they
 * are kept as records but never imported or sold in V1.
 */

const STATIC: PersonalizationConfig = {
  enabled: false,
  planned: false,
  fields: [],
};

export const DESIGN_FAMILIES: DesignFamily[] = [
  {
    handle: 'mumbai-made',
    headline: 'Built here. Worn everywhere.',
    line: 'Born in the city that keeps moving.',
    number: 1,
    name: 'Mumbai Made',
    code: 'MUM',
    artworkFile: '01_mumbai_made.png',
    artworkText: 'MUMBAI MADE · EST. 1995 · BUILT HERE. WORN EVERYWHERE.',
    tagline: 'Built here. Worn everywhere.',
    story:
      'Two words, one city. For everyone Mumbai raised, wherever life goes next.',
    concept:
      'The first Trenzora drop: “MUMBAI MADE” in heavy capitals, underlined in red, with “Est. 1995” and the line “Built here. Worn everywhere.”',
    forWho:
      'Mumbaikars at home and away, and anyone who left a little of themselves on Marine Drive.',
    artWords: ['MUMBAI', 'MADE'],
    palette: {bg: '#B4432C', fg: '#F6EFE4', accent: '#E7B04A'},
    collections: ['mumbai-made', 'drops', 'trending', 'gifts'],
    vibe: 'Mumbai',
    keywords: ['mumbai', 'bombay', 'mumbaikar', 'mumbai made', 'city'],
    personalization: STATIC,
    drop: '01',
    release: 'v1',
  },
  {
    handle: 'local-life',
    headline: 'Different station. Same story.',
    line: 'Made for people who know every stop.',
    number: 2,
    name: 'Local Life',
    code: 'LOC',
    artworkFile: '02_local_life.png',
    artworkText: 'LOCAL LEGEND · MUMBAI · DIFFERENT STATION. SAME STORY.',
    tagline: 'Different station. Same story.',
    story:
      'The fast local, the window seat you fought for, the compartment that knows your face. For the legends of the line.',
    concept:
      '“LOCAL LEGEND” in heavy capitals, signed “Mumbai”, with the line “Different station. Same story.”',
    forWho:
      'Daily commuters, ex-commuters and every Mumbaikar who has survived a peak-hour local.',
    artWords: ['LOCAL', 'LEGEND'],
    palette: {bg: '#D3A23B', fg: '#17140F', accent: '#B4432C'},
    collections: ['mumbai-made', 'drops'],
    keywords: [
      'mumbai local',
      'local train',
      'local legend',
      'commute',
      'mumbai',
    ],
    personalization: STATIC,
    drop: '01',
    release: 'v1',
  },
  {
    handle: 'corporate-survivor',
    headline: 'This meeting could have been an email.',
    line: 'For everyone who has survived one too many calls.',
    number: 3,
    name: 'Corporate Survivor',
    code: 'COR',
    artworkFile: '03_corporate_survivor.png',
    artworkText: 'THIS MEETING COULD HAVE BEEN AN EMAIL. · CORPORATE SURVIVOR',
    tagline: 'This meeting could have been an email.',
    story:
      'Back-to-back calls, a calendar with no gaps. For everyone still standing.',
    concept:
      'Office humour with a straight face: “THIS MEETING COULD HAVE BEEN AN EMAIL.” signed “Corporate Survivor”. Made to be worn to the off-site and gifted on the last day.',
    forWho: 'Your work wife, your team lead, and you on a Monday.',
    artWords: ['CORPORATE', 'SURVIVOR'],
    palette: {bg: '#2E3A4B', fg: '#F3EEE6', accent: '#D9B26A'},
    collections: ['drops', 'trending', 'gifts'],
    vibe: 'Office',
    keywords: ['office', 'corporate', 'work', 'colleague gift', 'meeting'],
    personalization: STATIC,
    drop: '01',
    release: 'v1',
  },
  {
    handle: 'coffee-personality',
    headline: 'Good ideas start with coffee.',
    line: 'Bombay Coffee Club energy.',
    number: 4,
    name: 'Coffee Personality',
    code: 'COF',
    artworkFile: '04_coffee_personality.png',
    artworkText: 'GOOD IDEAS START WITH COFFEE · BOMBAY COFFEE CLUB',
    tagline: 'Good ideas start with coffee.',
    story:
      'Every plan worth making started over a cup. Membership to the Bombay Coffee Club.',
    concept:
      '“GOOD IDEAS START WITH COFFEE” in heavy capitals, signed “Bombay Coffee Club”.',
    forWho:
      'Coffee people, café regulars, and anyone who isn’t a morning person until the first cup.',
    artWords: ['COFFEE', 'CLUB'],
    palette: {bg: '#5B3A29', fg: '#F1E4D1', accent: '#C98F55'},
    collections: ['mumbai-made', 'drops', 'trending', 'gifts'],
    vibe: 'Coffee',
    keywords: [
      'coffee',
      'bombay coffee club',
      'café',
      'coffee lover gift',
      'bombay',
    ],
    personalization: STATIC,
    drop: '01',
    release: 'v1',
  },
  {
    handle: 'bestie-energy',
    headline: 'She knows too much.',
    line: 'For the one who has every screenshot.',
    number: 5,
    name: 'Bestie Energy',
    code: 'BES',
    artworkFile: '05_bestie_energy.png',
    artworkText: "SHE KNOWS TOO MUCH. · THAT'S WHY SHE'S MY BESTIE.",
    tagline: 'She knows too much. That’s why she’s my bestie.',
    story:
      'Every secret, every 2 a.m. voice note. She’s heard it all, and she’s still here.',
    concept:
      '“SHE KNOWS TOO MUCH.” with the punchline “That’s why she’s my bestie.” Made to gift to your best girl, or to buy as a pair for the two of you.',
    forWho:
      'Best friends, girl gangs, sisters-by-choice, and the bestie who holds all your secrets.',
    artWords: ['BESTIE', 'ENERGY'],
    palette: {bg: '#DFA3AE', fg: '#1B1714', accent: '#8E2F3F'},
    collections: ['drops', 'trending', 'gifts'],
    vibe: 'Bestie',
    keywords: [
      'bestie',
      'best friend',
      'gift for her',
      'gift for best friend',
      'girl gang',
    ],
    personalization: STATIC,
    drop: '01',
    release: 'v1',
  },
  {
    handle: 'us',
    headline: 'You + me. Us. Always.',
    line: 'Two names, one story. Coming soon.',
    number: 6,
    name: 'Us',
    code: 'USS',
    artworkFile: '06_us.png',
    artworkText: 'YOU + ME · US · ALWAYS. · NAMES • DATE • STORY',
    tagline: 'You + me. Us. Always.',
    story:
      'For the two of you who argue about where to eat and always end up at the same place.',
    concept:
      '“YOU + ME · US · ALWAYS.”: a couple design created to carry your names, date and story.',
    forWho:
      'Couples, newlyweds, and anniversaries that deserve more than a card.',
    artWords: ['US'],
    palette: {bg: '#8C1F2E', fg: '#FBEDE7', accent: '#E7B04A'},
    collections: ['drops', 'personalize', 'gifts'],
    vibe: 'Couple',
    keywords: ['couple', 'anniversary', 'gift for partner', 'valentine'],
    personalization: {
      enabled: false,
      planned: true,
      comingSoonNote:
        'Us is launching with personalization: your names and date, printed just for you. Not available to order yet.',
      fields: [
        {key: 'Name 1', label: 'First name', maxLength: 12, required: true},
        {key: 'Name 2', label: 'Second name', maxLength: 12, required: true},
        {
          key: 'Date',
          label: 'Date (optional)',
          maxLength: 10,
          placeholder: 'DD.MM.YYYY',
          required: false,
        },
      ],
    },
    drop: '01',
    release: 'v2',
  },
  {
    handle: 'pet-parent',
    headline: 'Pet Parent Club.',
    line: 'Membership is lifelong. The fur is everywhere.',
    number: 7,
    name: 'Pet Parent',
    code: 'PET',
    artworkFile: '07_pet_parent.png',
    artworkText: 'PET PARENT CLUB · PROUD MEMBER OF THE PET PARENT CLUB.',
    tagline: 'Proud member of the Pet Parent Club.',
    story:
      'Indie or pedigree, adopted or rescued. They run the house; you’re just the staff.',
    concept:
      'A clean, typographic “PET PARENT CLUB” badge with no specific pet name, so it works for every dog and cat parent.',
    forWho: 'Dog parents, cat parents and proud indie adopters.',
    artWords: ['PET PARENT', 'CLUB'],
    palette: {bg: '#6C8466', fg: '#F5F0E6', accent: '#E4C27A'},
    collections: ['drops', 'gifts'],
    vibe: 'Pet Parent',
    keywords: ['pet parent', 'dog', 'cat', 'indie dog', 'pet lover gift'],
    personalization: STATIC,
    drop: '01',
    release: 'v1',
  },
  {
    handle: 'campus-energy',
    headline: 'Attendance is a suggestion.',
    line: 'Canteen chai. Last benches. Forever.',
    number: 8,
    name: 'Campus Energy',
    code: 'CAM',
    artworkFile: '08_campus_energy.png',
    artworkText: 'ATTENDANCE IS A SUGGESTION · CAMPUS DAYS • FOREVER',
    tagline: 'Attendance is a suggestion.',
    story:
      'Canteen debates, 2 a.m. Maggi, the night-before-the-exam plan. The years you’ll talk about forever.',
    concept:
      '“ATTENDANCE IS A SUGGESTION” in heavy capitals, signed “Campus days • forever”.',
    forWho: 'Students, freshers and anyone who still misses the canteen.',
    artWords: ['CAMPUS', 'ENERGY'],
    palette: {bg: '#2E4593', fg: '#F4EFE6', accent: '#E3B341'},
    collections: ['drops'],
    keywords: ['college', 'campus', 'hostel', 'student', 'attendance'],
    personalization: STATIC,
    drop: '01',
    release: 'v1',
  },
  {
    handle: 'desi-roots',
    headline: 'माझी मुंबई',
    line: 'Same roots. New stories.',
    number: 9,
    name: 'Desi Roots',
    code: 'DES',
    artworkFile: '09_desi_roots.png',
    artworkText: 'माझी मुंबई · SAME ROOTS. NEW STORIES.',
    tagline: 'Same roots. New stories.',
    story:
      '“Maajhi Mumbai”: my Mumbai, written in Marathi. For everyone whose roots run through the city, here or far away.',
    concept:
      'Devanagari “माझी मुंबई” paired with the line “Same roots. New stories.”: Mumbai and Marathi identity, made modern.',
    forWho:
      'Marathi Mumbaikars, Mumbaikars abroad, and anyone who says “maajhi Mumbai” and means it.',
    artWords: ['DESI', 'ROOTS'],
    palette: {bg: '#1E5B57', fg: '#F3E2B5', accent: '#D96B3B'},
    collections: ['mumbai-made', 'drops', 'gifts'],
    keywords: [
      'marathi',
      'maajhi mumbai',
      'majhi mumbai',
      'mumbai',
      'mumbaikar',
    ],
    personalization: STATIC,
    drop: '01',
    release: 'v1',
  },
  {
    handle: 'make-it-yours',
    headline: 'Make it yours.',
    line: 'Your words, printed. Coming soon.',
    number: 10,
    name: 'Make It Yours',
    code: 'MIY',
    artworkFile: '10_make_it_yours.png',
    artworkText: 'MAKE IT YOURS · NAME • CITY • DATE · YOUR STORY. YOUR WAY.',
    tagline: 'Your story. Your way.',
    story:
      'The Trenzora design built to carry a name, a city and a date. Launches with personalization.',
    concept:
      '“MAKE IT YOURS · NAME • CITY • DATE · YOUR STORY. YOUR WAY.”: the template for our upcoming personalization service.',
    forWho:
      'Anyone who wants a piece that is one of one: your name, your city, your date.',
    artWords: ['MAKE IT', 'YOURS'],
    palette: {bg: '#1B1916', fg: '#F6EFE4', accent: '#E7B04A'},
    collections: ['drops', 'personalize'],
    keywords: ['make it yours', 'personalised', 'personalized', 'custom'],
    personalization: {
      enabled: false,
      planned: true,
      comingSoonNote:
        'Make It Yours is launching with personalization: your name, city and date, printed just for you. Not available to order yet.',
      fields: [
        {key: 'Name', label: 'Name', maxLength: 14, required: true},
        {key: 'City', label: 'City', maxLength: 14, required: false},
        {
          key: 'Date',
          label: 'Date (optional)',
          maxLength: 10,
          placeholder: 'DD.MM.YYYY',
          required: false,
        },
      ],
    },
    drop: '01',
    release: 'v2',
  },
];

export function getDesignFamily(handle: string | undefined | null) {
  return DESIGN_FAMILIES.find((family) => family.handle === handle);
}

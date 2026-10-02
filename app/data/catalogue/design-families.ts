import type {DesignFamily, PersonalizationConfig} from './types.ts';

/**
 * The 10 master design concepts. Every concept ships on all three hero
 * products, so copy here must work for a tee, a tote and a tumbler.
 *
 * Copy is launch draft — review tone with brand before go-live.
 */

const STATIC: PersonalizationConfig = {
  enabled: false,
  planned: false,
  fields: [],
};

export const DESIGN_FAMILIES: DesignFamily[] = [
  {
    handle: 'mumbai-made',
    number: 1,
    name: 'Mumbai Made',
    code: 'MUM',
    artworkFile: '01_mumbai_made.png',
    tagline: 'For everyone the city raised.',
    story:
      'Local trains, cutting chai and sea-face evenings. Mumbai Made is our love letter to the city that never asks where you are from — only where you are going.',
    concept:
      'The first Trenzora drop. An original illustration built from the things every Mumbaikar recognises without being told.',
    forWho:
      'Mumbaikars, ex-Mumbaikars, and anyone who left a little of themselves on Marine Drive.',
    artWords: ['MUMBAI', 'MADE'],
    palette: {bg: '#E0452B', fg: '#FFF6EA', accent: '#F2B705'},
    collections: ['mumbai-made', 'drops', 'trending', 'gifts'],
    vibe: 'Mumbai',
    keywords: ['mumbai', 'bombay', 'city', 'local train', 'marine drive'],
    personalization: STATIC,
    drop: '01',
  },
  {
    handle: 'local-life',
    number: 2,
    name: 'Local Life',
    code: 'LOC',
    artworkFile: '02_local_life.png',
    tagline: 'Main character of the gully.',
    story:
      'The kirana uncle who knows your order, the auto that will “adjust”, the neighbourhood that runs on its own clock. Local Life celebrates the everyday India we actually live in.',
    concept:
      'A graphic built from street-level details — the signs, sounds and shortcuts of an Indian neighbourhood.',
    forWho: 'People who know every shortcut in their area.',
    artWords: ['LOCAL', 'LIFE'],
    palette: {bg: '#F2B705', fg: '#16130F', accent: '#E0452B'},
    collections: ['drops'],
    keywords: ['local', 'street', 'neighbourhood', 'auto', 'kirana'],
    personalization: STATIC,
    drop: '01',
  },
  {
    handle: 'corporate-survivor',
    number: 3,
    name: 'Corporate Survivor',
    code: 'COR',
    artworkFile: '03_corporate_survivor.png',
    tagline: 'Survived another “quick call”.',
    story:
      'Back-to-back meetings, “per my last email”, and a Monday that started on Sunday night. Corporate Survivor is for everyone still standing.',
    concept:
      'Office humour drawn with a straight face — designed to be worn to the off-site and gifted on the last day.',
    forWho: 'Your work wife, your team lead, and you on a Monday.',
    artWords: ['CORPORATE', 'SURVIVOR'],
    palette: {bg: '#1F3A5F', fg: '#FFF6EA', accent: '#F2B705'},
    collections: ['drops', 'trending', 'gifts'],
    vibe: 'Office',
    keywords: ['office', 'corporate', 'work', 'colleague gift', 'monday'],
    personalization: STATIC,
    drop: '01',
  },
  {
    handle: 'coffee-personality',
    number: 4,
    name: 'Coffee Personality',
    code: 'COF',
    artworkFile: '04_coffee_personality.png',
    tagline: 'Filter kaapi to cold brew. It’s a personality.',
    story:
      'Some people drink coffee. Some people are coffee. From steel-tumbler filter kaapi to the third cold brew of the day, this one is for the second kind.',
    concept:
      'A coffee graphic that respects both the davara-tumbler classic and the café order that needs a paragraph.',
    forWho: 'Anyone who is not a morning person until the first cup.',
    artWords: ['COFFEE', 'PERSONALITY'],
    palette: {bg: '#6B3E26', fg: '#F6E7CF', accent: '#F2B705'},
    collections: ['drops', 'trending', 'gifts'],
    vibe: 'Coffee',
    keywords: ['coffee', 'filter kaapi', 'cold brew', 'caffeine'],
    personalization: STATIC,
    drop: '01',
  },
  {
    handle: 'bestie-energy',
    number: 5,
    name: 'Bestie Energy',
    code: 'BES',
    artworkFile: '05_bestie_energy.png',
    tagline: 'The one who already knows the plan.',
    story:
      'Voice notes longer than podcasts, inside jokes no one else gets, and a friend who shows up with snacks. Bestie Energy is made to be bought in pairs.',
    concept:
      'A friendship design for the person who has seen every version of you — and stayed.',
    forWho: 'Best friends, hostel roommates and group-chat admins.',
    artWords: ['BESTIE', 'ENERGY'],
    palette: {bg: '#E8559A', fg: '#16130F', accent: '#FFF6EA'},
    collections: ['drops', 'trending', 'gifts'],
    vibe: 'Bestie',
    keywords: ['best friend', 'bestie', 'friendship', 'gift for friend'],
    personalization: STATIC,
    drop: '01',
  },
  {
    handle: 'us',
    number: 6,
    name: 'Us',
    code: 'USS',
    artworkFile: '06_us.png',
    tagline: 'A design for two.',
    story:
      'For the couple who argues about where to eat and always ends up at the same place. Us is a quiet, confident design for two people who are a team.',
    concept:
      'A couple design built to carry names and dates later — launching first as a ready-to-wear original.',
    forWho:
      'Couples, newlyweds, and anniversaries that deserve more than a card.',
    artWords: ['US'],
    palette: {bg: '#B3132B', fg: '#FFEDE7', accent: '#F2B705'},
    collections: ['drops', 'personalize', 'gifts'],
    vibe: 'Couple',
    keywords: ['couple', 'anniversary', 'gift for partner', 'valentine'],
    personalization: {
      enabled: false,
      planned: true,
      comingSoonNote:
        'Names and a date on this design are coming soon. The original design is available now.',
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
  },
  {
    handle: 'pet-parent',
    number: 7,
    name: 'Pet Parent',
    code: 'PET',
    artworkFile: '07_pet_parent.png',
    tagline: 'My child has four legs.',
    story:
      'Indie or pedigree, adopted or rescued — they run the house and you are just the staff. Pet Parent is for the people whose camera roll is 80% one face.',
    concept:
      'A warm, playful design for people who plan their weekends around walks.',
    forWho: 'Dog parents, cat parents and proud indie adopters.',
    artWords: ['PET', 'PARENT'],
    palette: {bg: '#2F7D5B', fg: '#FFF6EA', accent: '#F2B705'},
    collections: ['drops', 'gifts'],
    vibe: 'Pet Parent',
    keywords: ['dog', 'cat', 'pet', 'indie dog', 'pet lover gift'],
    personalization: STATIC,
    drop: '01',
  },
  {
    handle: 'campus-energy',
    number: 8,
    name: 'Campus Energy',
    code: 'CAM',
    artworkFile: '08_campus_energy.png',
    tagline: 'Attendance: 75%. Energy: 100%.',
    story:
      'Canteen debates, hostel Maggi at 2 a.m., and the night-before-the-exam study plan. Campus Energy is for the years you will talk about forever.',
    concept: 'A loud, happy graphic for college life in India.',
    forWho: 'Students, freshers and anyone who still misses the canteen.',
    artWords: ['CAMPUS', 'ENERGY'],
    palette: {bg: '#3047D9', fg: '#FFF6EA', accent: '#F2B705'},
    collections: ['drops'],
    keywords: ['college', 'campus', 'hostel', 'student'],
    personalization: STATIC,
    drop: '01',
  },
  {
    handle: 'desi-roots',
    number: 9,
    name: 'Desi Roots',
    code: 'DES',
    artworkFile: '09_desi_roots.png',
    tagline: 'Wherever you go, you carry home.',
    story:
      'Ghar ka khaana, your nani’s advice and the language you still dream in. Desi Roots is a modern design rooted in the things that made us.',
    concept:
      'Indian heritage, redrawn for now — familiar motifs in a contemporary, wearable graphic.',
    forWho:
      'Anyone who misses home — whether home is two cities or two continents away.',
    artWords: ['DESI', 'ROOTS'],
    palette: {bg: '#0E6E6B', fg: '#F7DFA0', accent: '#E0452B'},
    collections: ['drops', 'gifts'],
    keywords: ['desi', 'indian', 'heritage', 'home', 'nri gift'],
    personalization: STATIC,
    drop: '01',
  },
  {
    handle: 'make-it-yours',
    number: 10,
    name: 'Make It Yours',
    code: 'MIY',
    artworkFile: '10_make_it_yours.png',
    tagline: 'Your name. Your story. Our design.',
    story:
      'A Trenzora original designed to carry a name, a nickname or a line that only makes sense to you. Launching as an original first — personal text is next.',
    concept:
      'A design system with space built in for your words, so every piece can be one of one.',
    forWho: 'The person who has everything — except one with their name on it.',
    artWords: ['MAKE IT', 'YOURS'],
    palette: {bg: '#16130F', fg: '#FFF6EA', accent: '#F2B705'},
    collections: ['drops', 'personalize', 'gifts'],
    keywords: ['personalised', 'custom name', 'personalized gift', 'custom'],
    personalization: {
      enabled: false,
      planned: true,
      comingSoonNote:
        'Adding your own name or line is coming soon. The original design is available now.',
      fields: [
        {
          key: 'Your text',
          label: 'Your text',
          maxLength: 18,
          placeholder: 'A name or a short line',
          required: true,
        },
      ],
    },
    drop: '01',
  },
];

export function getDesignFamily(handle: string | undefined | null) {
  return DESIGN_FAMILIES.find((family) => family.handle === handle);
}

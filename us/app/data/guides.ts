/**
 * Buying guides and how-tos. Written to answer real searches, each linking
 * to the collection and setup that completes the job. Move to a Shopify blog
 * later if non-developers need to edit them; URLs stay /guides/<handle>.
 */
export type Guide = {
  handle: string;
  title: string;
  description: string;
  mission: string;
  readMinutes: number;
  updated: string;
  intro: string;
  sections: Array<{heading: string; body: string[]; products?: string[]}>;
  checklist?: string[];
  bundle?: string;
};

export const GUIDES: Guide[] = [
  {
    handle: 'car-camping-checklist',
    title: 'The Car Camping Checklist: What You Actually Need',
    description:
      'A practical car camping checklist by priority: shelter, sleep, light, kitchen and water, plus the upgrades worth buying later.',
    mission: 'weekend-car-camping',
    readMinutes: 6,
    updated: '2026-10-04',
    intro:
      'Car camping lets you bring comfort that backpackers can’t — but most first-timers bring the wrong comfort. Prioritize in this order and every trip gets easier.',
    sections: [
      {
        heading: '1. Shelter that uses your vehicle',
        body: [
          'Your car is a windbreak, a locker and a power source. A tailgate tent attaches to an SUV or minivan hatch so the cargo area becomes part of your room; a truck bed tent lifts you off rocks and mud.',
          'Check two numbers before you buy: your hatch opening (for tailgate tents) or bed length (for truck tents).',
        ],
        products: ['suv-tailgate-tent', 'truck-bed-tent'],
      },
      {
        heading: '2. Sleep: elevation beats thickness',
        body: [
          'Cold comes up from the ground. A cot with a mattress keeps you warm and flat; an SUV mattress suits solo trips where you sleep inside the vehicle.',
          'Choose a sleeping bag rated 10–15°F below the coldest forecast night.',
        ],
        products: ['folding-cot-with-mattress', 'cold-weather-sleeping-bag'],
      },
      {
        heading: '3. Light and power',
        body: [
          'One lantern per tent and one headlamp per person. Rechargeable means no battery runs and a phone top-up in a pinch.',
        ],
        products: ['rechargeable-lantern-power-bank', 'headlamp-two-pack'],
      },
      {
        heading: '4. Kitchen and water',
        body: [
          'A standing-height cook station and a water jug with a spigot make cooking feel like a kitchen, not a chore.',
        ],
        products: ['camp-kitchen-table', 'collapsible-water-jug'],
      },
    ],
    checklist: [
      'Tent + stakes + mallet',
      'Cot or mattress, sleeping bag, pillow',
      'Lantern, headlamps, charging cable',
      'Stove, fuel, lighter, cookware, utensils',
      'Water jug, cooler or 12V fridge',
      'Chairs and a table',
      'First-aid kit, trash bags, layers for 15°F colder than forecast',
    ],
    bundle: 'weekend-car-camping-setup',
  },
  {
    handle: 'hot-tent-camping-guide',
    title: 'Hot-Tent Camping: How to Heat a Canvas Tent Safely',
    description:
      'How hot tents work, how to match a wood stove to a canvas bell tent, and the safety rules for heating a tent in fall and winter.',
    mission: 'cold-weather-camping',
    readMinutes: 7,
    updated: '2026-10-04',
    intro:
      'A hot tent is a tent designed to be heated by a wood stove. Done right, it turns a freezing October night into a dry, warm basecamp. Done wrong, it’s dangerous. Here’s how to do it right.',
    sections: [
      {
        heading: 'What makes a tent a “hot tent”',
        body: [
          'A fire-resistant stove jack — a reinforced ring where the chimney passes through the fabric — and breathable canvas that handles condensation. Never put a stove in a tent without one.',
        ],
        products: ['canvas-bell-tent-5m'],
      },
      {
        heading: 'Matching the stove to the tent',
        body: [
          'Bigger isn’t better: an oversized stove in a small tent forces you to run it choked down, which makes more smoke and creosote. A mid-size stove suits a 5 m bell tent.',
          'Check that the chimney is tall enough to clear the tent peak and fitted with a spark arrestor.',
        ],
        products: ['tent-wood-stove'],
      },
      {
        heading: 'Safety rules that aren’t optional',
        body: [
          'Run a battery carbon-monoxide alarm inside the tent every night.',
          'Keep a clear zone around the stove; sleeping bags and cots stay at least 3 feet away.',
          'Never leave the stove burning unattended or while everyone is asleep without a plan to let it die down safely.',
          'Check local fire restrictions before every trip.',
        ],
      },
      {
        heading: 'Sleep warm even after the fire dies',
        body: ['The stove will go out at night. A cot plus a cold-rated bag keeps you warm until morning.'],
        products: ['folding-cot-with-mattress', 'cold-weather-sleeping-bag'],
      },
    ],
    bundle: 'hot-tent-basecamp',
  },
  {
    handle: 'build-a-camp-kitchen',
    title: 'Build a Camp Kitchen That Packs in One Bin',
    description:
      'How to build a camp kitchen: a standing cook station, 12V fridge vs cooler, water on tap and a storage bin that stays packed.',
    mission: 'camp-kitchen',
    readMinutes: 5,
    updated: '2026-10-04',
    intro: 'The best camp kitchens are boring: always packed, always in the same bin, set up in five minutes.',
    sections: [
      {
        heading: 'The cook station',
        body: [
          'A one-piece folding kitchen table gives you a heat-tolerant surface for the stove plus side tables for prep. Choose a windscreen version if you camp in open country.',
        ],
        products: ['camp-kitchen-table', 'camp-kitchen-table-windscreen'],
      },
      {
        heading: '12V fridge or cooler?',
        body: [
          'A good cooler costs less but needs ice every day or two. A compressor fridge needs power (your car or a power station) but holds true fridge or freezer temperatures with no ice.',
          'Rule of thumb: if you camp more than five nights a year or road-trip for a week at a time, the fridge pays off.',
        ],
        products: ['12v-car-fridge-40l', 'portable-power-station-300w'],
      },
      {
        heading: 'Water and storage',
        body: ['A water jug with a spigot makes hand-washing and dishes easy. A dedicated bin means the kitchen is always packed.'],
        products: ['collapsible-water-jug', 'camp-storage-box', 'camp-cookware-set'],
      },
    ],
    bundle: 'camp-kitchen-kit',
  },
  {
    handle: 'tailgate-setup-guide',
    title: 'The One-Trip Tailgate Setup',
    description: 'How to set up a tailgate in one trip from the car: hauling, a standing cook station, cold drinks and seating.',
    mission: 'tailgate-and-backyard',
    readMinutes: 4,
    updated: '2026-10-04',
    intro: 'Great tailgates aren’t about more gear. They’re about less walking, faster setup and a place to sit that isn’t a bucket.',
    sections: [
      {heading: 'Haul in one trip', body: ['A collapsible wagon carries the table, chairs and food in one go and folds flat in the trunk.'], products: ['collapsible-wagon']},
      {heading: 'Cook at standing height', body: ['Put the grill or griddle on a camp kitchen table; prep on the side tables.'], products: ['camp-kitchen-table']},
      {heading: 'Seat people properly', body: ['A recliner or two becomes the most popular spot in the lot.'], products: ['reclining-camp-chair', 'camp-side-table']},
    ],
    bundle: 'tailgate-ready-kit',
  },
  {
    handle: 'gifts-for-campers-guide',
    title: 'Gifts for Campers Who Already Own the Basics',
    description: 'Camping gift ideas by budget — under $50, under $150 and the big upgrade — chosen for people who already have a tent.',
    mission: 'gifts-for-campers',
    readMinutes: 4,
    updated: '2026-10-04',
    intro: 'Most campers own a tent, a bag and a stove. The gifts they love are the comfort upgrades they never buy for themselves.',
    sections: [
      {heading: 'Under $50', body: ['A rechargeable lantern that charges a phone, or a 2-pack of rechargeable headlamps.'], products: ['rechargeable-lantern-power-bank', 'headlamp-two-pack']},
      {heading: '$50–$150', body: ['A reclining rocking camp chair, a hatchet set for firewood, or a portable fire pit.'], products: ['reclining-camp-chair', 'camping-hatchet-set', 'portable-fire-pit']},
      {heading: 'The big upgrade', body: ['A 12V car fridge ends ice runs forever; a power station brings silent power to camp and the house during outages.'], products: ['12v-car-fridge-40l', 'portable-power-station-300w']},
    ],
  },
];

export const GUIDE_BY_HANDLE = new Map(GUIDES.map((g) => [g.handle, g]));

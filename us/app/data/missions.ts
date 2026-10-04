import type {GearHandle, MissionHandle} from './catalog.ts';

/**
 * Collection editorial: every collection answers "why am I here?".
 * Handles match the Shopify collections described in
 * us/catalog/collections.json (smart collections on product tags
 * `mission:<handle>` and `gear:<handle>`).
 */
export type CollectionContent = {
  handle: string;
  kind: 'mission' | 'gear';
  title: string;
  /** Short label for navigation and tiles. */
  label: string;
  /** The customer's job, in their words. */
  job: string;
  intro: string;
  problem: string;
  guidance: Array<{title: string; body: string}>;
  faq: Array<{q: string; a: string}>;
  seo: {title: string; description: string};
  related: string[];
  bundle?: string;
  guide?: string;
  tone: 'pine' | 'clay' | 'sand' | 'slate' | 'ember';
};

export const MISSIONS: Record<MissionHandle, CollectionContent> = {
  'weekend-car-camping': {
    handle: 'weekend-car-camping',
    kind: 'mission',
    title: 'Weekend Car Camping',
    label: 'Weekend car camping',
    job: '“We’re heading out Friday after work.”',
    intro:
      'Everything you need to drive in, set up before dark and actually sleep — chosen to work with the vehicle you already own.',
    problem:
      'Most first car-camping trips fail on three things: no room, bad sleep, no light. This collection fixes those first, then adds comfort.',
    guidance: [
      {title: 'Start with shelter that uses your car', body: 'An SUV tailgate tent or truck bed tent turns the vehicle into part of camp. It’s more room for less money than a rooftop tent.'},
      {title: 'Then sleep', body: 'A cot with a mattress beats any pad for comfort and keeps you off cold ground. Check it fits your tent floor.'},
      {title: 'Then light and power', body: 'One rechargeable lantern per tent plus a headlamp per person covers almost every trip.'},
    ],
    faq: [
      {q: 'What’s the minimum I need for a first trip?', a: 'Shelter, something to sleep on, a light, a way to cook and water. Our Weekend Setup bundle covers the first three.'},
      {q: 'Do I need a rooftop tent?', a: 'Not to start. A tailgate tent gives standing room for a fraction of the cost and doesn’t need a roof rack.'},
    ],
    seo: {
      title: 'Car Camping Gear for Weekend Trips',
      description: 'Car camping essentials that work with your SUV or truck: tailgate tents, cots, camp kitchens and lights, hand-picked and grouped into ready setups.',
    },
    related: ['camp-kitchen', 'sleep-better-outside', 'power-and-light'],
    bundle: 'weekend-car-camping-setup',
    guide: 'car-camping-checklist',
    tone: 'pine',
  },
  'camp-kitchen': {
    handle: 'camp-kitchen',
    kind: 'mission',
    title: 'Camp Kitchen',
    label: 'Camp kitchen',
    job: '“I want to cook real food at camp, not just hot dogs.”',
    intro: 'A standing-height kitchen, cold storage that lasts the whole trip, water on tap and a bin that keeps it all packed between trips.',
    problem: 'Picnic tables are low, dirty and crowded, ice melts by day two, and the kitchen gear is scattered across the house.',
    guidance: [
      {title: 'Table first', body: 'A one-piece kitchen table gives you a stove surface and prep space. Choose the windscreen version if you camp in open, windy sites.'},
      {title: 'Cold storage', body: 'A 12V compressor fridge ends the ice cycle. It pays off if you camp more than 4–5 nights a year.'},
      {title: 'Water and storage', body: 'A water jug with a spigot and one dedicated camp bin make every trip faster to pack.'},
    ],
    faq: [
      {q: 'Fridge or cooler?', a: 'Coolers are cheaper up front. A compressor fridge needs power but no ice and holds freezer temperatures — worth it for trips over two nights.'},
    ],
    seo: {
      title: 'Camp Kitchen Gear: Tables, 12V Fridges & More',
      description: 'Build a camp kitchen that works: folding cook stations, 12V car fridges, water jugs and storage, with honest advice on what you need.',
    },
    related: ['weekend-car-camping', 'tailgate-and-backyard'],
    bundle: 'camp-kitchen-kit',
    guide: 'build-a-camp-kitchen',
    tone: 'clay',
  },
  'sleep-better-outside': {
    handle: 'sleep-better-outside',
    kind: 'mission',
    title: 'Sleep Better Outside',
    label: 'Sleep better outside',
    job: '“I love camping. I hate how I sleep.”',
    intro: 'Bad sleep ends more camping hobbies than bad weather. Get off the ground, stay warm and wake up ready.',
    problem: 'The ground is hard and cold, and summer bags fail below 50°F. The fix is elevation plus the right temperature rating.',
    guidance: [
      {title: 'Elevation beats padding', body: 'A cot keeps you off cold ground. Add a mattress pad for side sleeping.'},
      {title: 'Rate your bag for the coldest night', body: 'Pick a bag rated 10–15°F below the lowest forecast temperature.'},
    ],
    faq: [{q: 'Cot or air mattress?', a: 'Cots don’t deflate and stay warmer off the ground. Air mattresses pack smaller and suit the back of an SUV.'}],
    seo: {
      title: 'Camping Cots, Sleeping Bags & Car Mattresses',
      description: 'Sleep well at camp: camping cots with mattresses, cold-weather sleeping bags and SUV mattresses, with advice on what actually helps.',
    },
    related: ['cold-weather-camping', 'weekend-car-camping'],
    tone: 'sand',
  },
  'cold-weather-camping': {
    handle: 'cold-weather-camping',
    kind: 'mission',
    title: 'Cold-Weather & Hot-Tent Camping',
    label: 'Cold-weather camping',
    job: '“Hunting camp opens in three weeks and last year we froze.”',
    intro: 'Canvas tents with stove jacks, tent wood stoves, warm sleep systems and the tools to keep a fire going — for fall hunting camps and winter basecamps.',
    problem: 'Nylon tents can’t be heated safely and condensation soaks everything. A canvas hot tent with a proper stove changes cold camping completely.',
    guidance: [
      {title: 'Tent and stove go together', body: 'Only use a wood stove in a tent with a fire-rated stove jack. Match the stove size to the tent: a 5 m bell tent suits a mid-size stove.'},
      {title: 'Safety is non-negotiable', body: 'Bring a battery CO alarm, keep a spark arrestor on the chimney, and never leave a stove burning unattended.'},
      {title: 'Sleep off the ground', body: 'Cold rises from the ground. Cots plus a cold-rated bag are the warmest combination.'},
    ],
    faq: [
      {q: 'What is a hot tent?', a: 'A tent built to be heated by a wood stove, with a stove jack where the chimney exits safely.'},
      {q: 'Can I use a propane heater instead?', a: 'Only models certified for indoor use with an oxygen-depletion sensor, with ventilation and a CO alarm.'},
    ],
    seo: {
      title: 'Hot Tent Camping: Canvas Tents & Tent Wood Stoves',
      description: 'Cold-weather and hunting camp setups: canvas bell tents with stove jacks, tent wood stoves, cots and cold-rated sleeping bags, plus the safety rules.',
    },
    related: ['sleep-better-outside', 'gifts-for-campers'],
    bundle: 'hot-tent-basecamp',
    guide: 'hot-tent-camping-guide',
    tone: 'ember',
  },
  'power-and-light': {
    handle: 'power-and-light',
    kind: 'mission',
    title: 'Power & Light',
    label: 'Power & light',
    job: '“I need light at camp and power when the grid goes down.”',
    intro: 'Lanterns, headlamps, a quiet power station and solar to recharge it — gear that works at the campsite and during the next outage.',
    problem: 'Gas generators are loud and can’t run in a tent or garage. A power station plus solar is silent and fume-free.',
    guidance: [
      {title: 'Light first', body: 'One lantern per tent, one headlamp per person.'},
      {title: 'Size the power station to your load', body: 'A 300W unit handles phones, lights, a fan and a 12V fridge for part of a day. Add a 100W panel for multi-day trips.'},
    ],
    faq: [{q: 'Can a power station run my fridge at home in an outage?', a: 'A 300W station isn’t built for a household fridge. It’s sized for phones, lights, CPAP-class loads (check yours) and a 12V car fridge.'}],
    seo: {
      title: 'Camping Lanterns, Power Stations & Solar Panels',
      description: 'Light and power for camp and outages: rechargeable lanterns, headlamps, 300W power stations and foldable solar panels, sized honestly.',
    },
    related: ['weekend-car-camping', 'gifts-for-campers'],
    tone: 'slate',
  },
  'tailgate-and-backyard': {
    handle: 'tailgate-and-backyard',
    kind: 'mission',
    title: 'Tailgate & Backyard',
    label: 'Tailgate & backyard',
    job: '“Game day is Saturday and I’m hosting.”',
    intro: 'Haul it in one trip, cook standing up, keep drinks cold and give people a chair worth sitting in — at the lot, the campsite or the backyard.',
    problem: 'Tailgates fall apart on logistics: too many trips from the car, no prep surface, warm drinks and terrible chairs.',
    guidance: [
      {title: 'Logistics first', body: 'A collapsible wagon moves the setup in one trip.'},
      {title: 'Cook at standing height', body: 'A camp kitchen table holds the grill or griddle with space to prep.'},
    ],
    faq: [],
    seo: {
      title: 'Tailgating Gear: Wagons, Camp Kitchens & Chairs',
      description: 'Tailgate and backyard gear that earns its trunk space: collapsible wagons, folding cook stations, 12V fridges, recliners and fire pits.',
    },
    related: ['camp-kitchen', 'gifts-for-campers'],
    bundle: 'tailgate-ready-kit',
    guide: 'tailgate-setup-guide',
    tone: 'clay',
  },
  'family-campsite': {
    handle: 'family-campsite',
    kind: 'mission',
    title: 'Family Campsite',
    label: 'Family camping',
    job: '“First camping trip with the kids — I want it to go well.”',
    intro: 'The comfort pieces that make family camping work: room, a bathroom, a hot shower, light for every kid and one-trip hauling.',
    problem: 'Family trips end early for comfort reasons — the 2 a.m. bathroom walk, no shower, cold, cramped tents.',
    guidance: [
      {title: 'Room and privacy', body: 'A big tent plus a privacy tent with a camp toilet removes the two most common complaints.'},
      {title: 'Hot water changes everything', body: 'A propane water heater gives warm showers and hot dish water.'},
    ],
    faq: [],
    seo: {
      title: 'Family Camping Gear: Privacy Tents, Showers & More',
      description: 'Family camping essentials: big tents, privacy and shower tents, camp toilets, hot water and lights so the first trip isn’t the last.',
    },
    related: ['weekend-car-camping', 'camp-kitchen'],
    bundle: 'family-comfort-kit',
    tone: 'pine',
  },
  'gifts-for-campers': {
    handle: 'gifts-for-campers',
    kind: 'mission',
    title: 'Gifts for Campers',
    label: 'Gifts for campers',
    job: '“They love camping and I have no idea what they already own.”',
    intro: 'Gifts campers actually use, sorted by budget — the upgrades people rarely buy for themselves.',
    problem: 'Campers already own the basics. The best gifts are comfort upgrades and clever tools.',
    guidance: [
      {title: 'Under $50', body: 'Rechargeable lantern, headlamp 2-pack.'},
      {title: '$50–$150', body: 'Reclining camp chair, hatchet set, portable fire pit.'},
      {title: 'The big one', body: '12V car fridge or a power station.'},
    ],
    faq: [{q: 'Can I return a gift?', a: 'Yes — see our returns policy. Holiday orders placed from November 1 can be returned until January 31.'}],
    seo: {
      title: 'Gifts for Campers: Under $50, $100 and $200',
      description: 'Camping gift ideas people actually use, by budget: lanterns, recliners, hatchet sets, fire pits, 12V fridges and power stations.',
    },
    related: ['power-and-light', 'tailgate-and-backyard'],
    guide: 'gifts-for-campers-guide',
    tone: 'ember',
  },
};

export const GEAR: Record<GearHandle, CollectionContent> = {
  shelter: gear('shelter', 'Shelter', 'Tents & awnings', 'SUV and truck tents, canvas bell tents and vehicle awnings.', 'pine'),
  sleep: gear('sleep', 'Sleep', 'Sleep', 'Cots, sleeping bags and car mattresses.', 'sand'),
  'camp-kitchen-gear': gear('camp-kitchen-gear', 'Camp Kitchen Gear', 'Kitchen', 'Cook stations, 12V fridges, cookware and water.', 'clay'),
  'seating-tables': gear('seating-tables', 'Chairs & Tables', 'Chairs & tables', 'Recliners, camp tables and hammocks.', 'clay'),
  'heat-fire': gear('heat-fire', 'Heat & Fire', 'Heat & fire', 'Tent stoves, fire pits, heaters and fire tools.', 'ember'),
  'power-light': gear('power-light', 'Power & Lighting', 'Power & light', 'Lanterns, headlamps, power stations and solar.', 'slate'),
  'haul-storage': gear('haul-storage', 'Haul & Storage', 'Haul & storage', 'Wagons and camp bins.', 'pine'),
  'campsite-comfort': gear('campsite-comfort', 'Campsite Comfort', 'Comfort', 'Privacy tents, camp toilets and hot showers.', 'sand'),
};

function gear(
  handle: GearHandle,
  title: string,
  label: string,
  intro: string,
  tone: CollectionContent['tone'],
): CollectionContent {
  return {
    handle,
    kind: 'gear',
    title,
    label,
    job: '',
    intro,
    problem: '',
    guidance: [],
    faq: [],
    seo: {
      title: `${title} for Car Camping`,
      description: `${intro} Hand-picked for car camping and basecamp setups by Trenzora.`,
    },
    related: [],
    tone,
  };
}

export const MISSION_ORDER: MissionHandle[] = [
  'weekend-car-camping',
  'camp-kitchen',
  'cold-weather-camping',
  'sleep-better-outside',
  'power-and-light',
  'tailgate-and-backyard',
  'family-campsite',
  'gifts-for-campers',
];

export const GEAR_ORDER: GearHandle[] = [
  'shelter',
  'sleep',
  'camp-kitchen-gear',
  'seating-tables',
  'heat-fire',
  'power-light',
  'haul-storage',
  'campsite-comfort',
];

export function collectionContent(handle: string): CollectionContent | null {
  return (
    (MISSIONS as Record<string, CollectionContent>)[handle] ??
    (GEAR as Record<string, CollectionContent>)[handle] ??
    null
  );
}

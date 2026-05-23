import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mountain, Sunrise, Sun, Moon, MapPin, MessageCircle,
  Sparkles, Trees, Leaf, ShoppingBag, Factory,
  Gamepad2, Plus, ChevronDown, UserPlus, LogOut,
  Send, Compass, Footprints, Flower2, Train,
  Coffee, Cookie, Utensils, BookOpen, Star, Heart,
  Tent, Camera, Eye, Cog, RotateCcw, Info, Download, CalendarDays
} from 'lucide-react';

/* ----------------------------------------------------------------
   PALETTE — Nilgiri tea & mist
---------------------------------------------------------------- */
const P = {
  ink: '#1A1F1A',
  deepTea: '#2C3E2D',
  midTea: '#43594A',
  mistGreen: '#8FA68E',
  sage: '#B5C2AA',
  cream: '#F4ECD8',
  paper: '#FAF6EB',
  paperDark: '#EFE6D0',
  terracotta: '#C56B4A',
  rust: '#9B4D2E',
  honey: '#D4A248',
  border: '#D4C9B4',
  borderSoft: '#E5DDC8',
  shadow: 'rgba(44, 62, 45, 0.08)',
  shadowStrong: 'rgba(44, 62, 45, 0.18)',
};

const MEMBER_COLORS = [
  '#C56B4A', '#5B7C5C', '#8B6FA6', '#D4A248',
  '#A6585F', '#4A7588', '#7A8C44', '#B07A3E',
];

/* ----------------------------------------------------------------
   DATA — both itineraries
---------------------------------------------------------------- */
const ICONS = {
  sunrise: Sunrise, sun: Sun, moon: Moon, mountain: Mountain,
  trees: Trees, leaf: Leaf, shop: ShoppingBag, factory: Factory,
  game: Gamepad2, compass: Compass, foot: Footprints, flower: Flower2,
  train: Train, coffee: Coffee, cookie: Cookie, utensils: Utensils,
  book: BookOpen, star: Star, heart: Heart, tent: Tent, camera: Camera,
  eye: Eye, sparkles: Sparkles, cog: Cog,
};

const SLOT_META = {
  morning: { label: 'Morning', time: '6 AM — 12 PM', icon: 'sunrise', tint: '#E8D9B0' },
  afternoon: { label: 'Afternoon', time: '12 PM — 6 PM', icon: 'sun', tint: '#E8C9A8' },
  night: { label: 'Night', time: '6 PM — late', icon: 'moon', tint: '#C9D4C2' },
};

// Helper to build options compactly
const opt = (id, title, sub, dur, tags, notes, icon) => ({
  id, title, sub, dur, tags, notes, icon,
});

const KOTAGIRI_DAYS = [
  {
    id: 'k-day1',
    date: 'Jun 20',
    dayOfWeek: 'Saturday',
    theme: 'Arrival & Settling In',
    vibe: 'A gentle landing — drive up, sink into the hills, nothing planned after sundown.',
    slots: {
      morning: [
        opt('a', 'Mettupalayam Route',
          'Drive Coimbatore → Kotagiri via Mettupalayam. Stop at Annapoorna for filter coffee + idli before the ghat road begins to climb.',
          '~3.5 hr', ['drive', 'breakfast stop'],
          'Reach the homestay by ~11 AM. The Mettupalayam stretch handles a heavy car well.',
          'compass'),
        opt('b', 'Sirumugai Forest Route',
          'Quieter alternative through Sirumugai reserve forest. Less traffic, more "elephant crossing" boards. Pack roadside breakfast from Coimbatore.',
          '~4 hr', ['scenic', 'wildlife'],
          'Slightly longer but much less honking. Reach by ~11:30 AM.',
          'trees'),
      ],
      afternoon: [
        opt('a', 'Settle & Sink In',
          'Check in, lazy thali lunch with the homestay host, then a slow 30-minute walk around the adjacent tea estate. No agenda.',
          '~3 hr', ['rest', 'tea estate walk'],
          'Best option after the morning drive. The baby will appreciate it most.',
          'leaf'),
        opt('b', 'John Sullivan Memorial + Town Lunch',
          'Short stop at the bungalow of the founder of Ooty (free entry, ~30 min of history). Lunch at Nahar\'s Sidewalk Cafe in town.',
          '~3 hr', ['history', 'museum'],
          'Good warm-up if anyone has energy after the drive.',
          'book'),
      ],
      night: [
        opt('a', 'Welcome Dinner + Board Games',
          'Homestay-cooked South Indian dinner. Pull out Catan / Codenames / Carcassonne after dessert.',
          '~3 hr', ['games', 'home dinner'],
          'Codenames works best for 6 — two teams of 3.',
          'game'),
        opt('b', 'Fireplace Antakshari',
          'Light the fireplace (June nights here are ~14°C). Warm dinner. Antakshari until someone gets sleepy.',
          '~3 hr', ['music', 'fireside'],
          'Phones-down rule for an hour. Best with both sets of parents.',
          'sparkles'),
      ],
    },
  },
  {
    id: 'k-day2',
    date: 'Jun 21',
    dayOfWeek: 'Sunday',
    theme: 'Nature & Stillness',
    vibe: 'A morning in the wild, an afternoon for the soul, a night under stars.',
    slots: {
      morning: [
        opt('a', 'Sunrise at Kodanad Viewpoint',
          'Drive 25 min to where three districts meet. 360° view, mist below your feet. Meditate on the rocks. Picnic breakfast packed by the homestay.',
          '~4 hr', ['meditation', 'viewpoint', 'sunrise'],
          'Wake-up at 5 AM. Worth it. Bring shawls.',
          'mountain'),
        opt('b', 'Longwood Shola Forest Walk',
          'Beginner forest walk through an ancient shola (3 km loop, ~1.5 hr). Endemic birds, no real climbs. Breakfast back at the homestay.',
          '~3 hr', ['hike: easy', 'forest', 'birds'],
          'Best for the day birders. Carry binoculars if you have any.',
          'trees'),
      ],
      afternoon: [
        opt('a', 'Catherine Falls + Cafe Diem',
          'Drive to Catherine Falls viewpoint (no descent needed for the view itself). Late lunch at Cafe Diem — wood-fired pizzas, gentle on parents and kids.',
          '~4 hr', ['waterfall', 'lunch'],
          'Best in monsoon — falls are full. Slippery near the edge, watch the little one.',
          'eye'),
        opt('b', 'Keystone Foundation + The Last Forest',
          'India\'s celebrated tribal-livelihood NGO. Their shop sells indigenous honey, beeswax, millets, woven baskets. Lunch at their on-site cafe.',
          '~4 hr', ['local', 'shopping', 'NGO'],
          'Deeply local. The moms will love the shop.',
          'shop'),
      ],
      night: [
        opt('a', 'Stargazing + Tambola',
          'Lawn chairs out, blanket on, Tambola tickets in. Bortle 3 skies — Milky Way visible on clear nights.',
          '~3 hr', ['games', 'stars'],
          'Print tickets in the day. Hot bournvita in flasks.',
          'star'),
        opt('b', 'Badaga Kitchen Night',
          'Pre-arrange a Badaga cooking lesson with the host. Make ragi puttu and samai sambar. Eat what you cooked.',
          '~3.5 hr', ['cooking', 'local food'],
          'Badaga = the native community of the Nilgiris. Book this with the homestay 2 days in advance.',
          'utensils'),
      ],
    },
  },
  {
    id: 'k-day3',
    date: 'Jun 22',
    dayOfWeek: 'Monday',
    theme: 'Coonoor Day Trip — Tea & Cheese',
    vibe: 'Spend the day in Coonoor — factory floors, cantonment streets, and India\'s only cheese farmstead.',
    slots: {
      morning: [
        opt('a', 'Highfield Tea Factory Tour',
          'Drive Kotagiri → Coonoor (45 min). Tour the working factory (₹150/head): plucking → withering → fermenting → drying. Free tasting at the end.',
          '~4 hr', ['factory', 'tea', 'tasting'],
          'A proper working factory — bring covered shoes, the floors are damp.',
          'factory'),
        opt('b', 'Sim\'s Park Morning',
          'Coonoor\'s botanical garden — magnolias, tree ferns, ancient redwoods. Far calmer than Ooty\'s. Breakfast at La Belle Vie after.',
          '~4 hr', ['garden', 'walk'],
          'Easier for the parents than Ooty Botanical. Stroller-friendly.',
          'flower'),
      ],
      afternoon: [
        opt('a', 'Wellington Heritage Walk',
          'Walk the colonial cantonment town — Defence Staff College area, St. George\'s Church, old officers\' bungalows. Lunch at Hyderabad Biryani House (large veg menu).',
          '~4 hr', ['history', 'walk'],
          'Defence area — no photos near the college gates.',
          'book'),
        opt('b', 'Acres Wild Cheesemaking Farm',
          'Tour India\'s only farmstead cheese maker. Tasting, then lunch at 180° McIver on the property, overlooking their pastures.',
          '~4 hr', ['factory', 'cheese', 'lunch'],
          'Book the tour 2-3 days in advance. The cheese platter at lunch is the move.',
          'cog'),
      ],
      night: [
        opt('a', 'Charades, Back at Base',
          'Drive back to Kotagiri before sundown (45 min). Dinner at homestay. Dumb Charades — Bollywood movies only, no actor names.',
          '~3 hr', ['games', 'home dinner'],
          'Easier to drive back in light. Saves a late-night ghat drive.',
          'game'),
        opt('b', 'Dolphin\'s Nose Sunset',
          'Stay back in Coonoor for the iconic sunset point. Drive back in the dark using the well-lit ghat road. Late dinner at homestay.',
          '~4 hr', ['viewpoint', 'sunset'],
          'Skip if rain is heavy — the road back gets foggy.',
          'sun'),
      ],
    },
  },
  {
    id: 'k-day4',
    date: 'Jun 23',
    dayOfWeek: 'Tuesday',
    theme: 'Hike + Heritage',
    vibe: 'A proper hike for the legs, an estate visit for the senses, shopping for the moms.',
    slots: {
      morning: [
        opt('a', 'Rangaswamy Pillar Hike',
          'Intermediate hike (4 km, 2.5 hr round trip). Massive freestanding rock pillar, local mythology, sweeping Nilgiri views. Some scrambling near the top.',
          '~3 hr', ['hike: intermediate', 'mythology'],
          'Skip if any knee is acting up that day — the descent is the tough part.',
          'mountain'),
        opt('b', 'Stone House + Tea Estate Walk',
          'Visit Stone House (the oldest English building in the Nilgiris, 1822). Then a flat walk through the tea estate next to the homestay.',
          '~3 hr', ['history', 'easy walk'],
          'Stone House interior may be closed — even the exterior + grounds is worth it.',
          'book'),
      ],
      afternoon: [
        opt('a', 'Boutique Tea Estate + Lunch',
          'Visit a smaller estate (e.g., Halli Berri) for a more intimate factory tour, plucking demo, tasting, and a hot in-estate lunch.',
          '~4 hr', ['factory', 'tea', 'lunch'],
          'Call ahead — these are private estates, they accommodate but on schedule.',
          'leaf'),
        opt('b', 'Kotagiri Bazaar with the Moms',
          'Local market — Toda silver, eucalyptus oil, fresh honey, hand-woven shawls. Lunch at La Maison.',
          '~4 hr', ['shopping', 'local'],
          'Best afternoon for this — the bazaar is busiest 2–5 PM.',
          'shop'),
      ],
      night: [
        opt('a', 'Outdoor Meditation Circle',
          'Set up on the lawn at dusk. 20-minute guided silence, then a simple millet-and-sambar dinner.',
          '~3 hr', ['meditation', 'home dinner'],
          'Skip if it\'s raining hard — the next option is better that night.',
          'sparkles'),
        opt('b', 'Movie Under the Stars',
          'Pre-arrange a projector + screen on the lawn. Watch a vintage Tamil or Hindi film. Hot chocolate, popcorn, blankets.',
          '~3 hr', ['movie', 'fireside'],
          'Backup if the meditation night gets rained out.',
          'camera'),
      ],
    },
  },
  {
    id: 'k-day5',
    date: 'Jun 24',
    dayOfWeek: 'Wednesday',
    theme: 'Last Day — Coonoor, Ooty, or Both',
    vibe: 'The big goodbye day — choose between a slow toy-train morning or a viewpoint hike.',
    slots: {
      morning: [
        opt('a', 'Nilgiri Mountain Railway',
          'Catch the Coonoor → Ooty toy train (~1.5 hr, UNESCO heritage). Have one car positioned in Ooty to pick you up. Breakfast in Ooty after.',
          '~5 hr', ['train', 'UNESCO'],
          'Book tickets 2 days ahead — they sell out. Wednesday should be calmer than weekend.',
          'train'),
        opt('b', 'Lamb\'s Rock + Dolphin\'s Nose',
          'Two viewpoints back-to-back on the same loop near Coonoor. Light walk between them. Picnic breakfast.',
          '~4 hr', ['viewpoint', 'easy walk'],
          'Drive straight from Kotagiri, return for lunch.',
          'mountain'),
      ],
      afternoon: [
        opt('a', 'Ooty Lake Boating + Earl\'s Secret',
          'Pedal or row boats at Ooty Lake (Wednesday is much calmer than weekends). Late lunch at Earl\'s Secret.',
          '~4 hr', ['boating', 'lunch'],
          'Life jackets for all, including the baby (they have infant ones).',
          'tent'),
        opt('b', 'Botanical Garden + Tea Museum',
          'Ooty Botanical Garden — head straight to the fern house, skip the busy avenue. Tea Museum nearby for lunch.',
          '~4 hr', ['garden', 'museum'],
          'Skip if the Ooty Lake day gets picked — too much in one afternoon.',
          'flower'),
      ],
      night: [
        opt('a', 'Farewell Dinner + Pictionary',
          'Back at Kotagiri homestay. Big spread cooked by the host, group photo, Pictionary tournament with handicaps for the worst artists.',
          '~3 hr', ['games', 'farewell'],
          'Pack tonight — early drive tomorrow.',
          'heart'),
        opt('b', 'Bonfire + Mafia',
          'Arrange a bonfire on the lawn. Simple dinner. Play Werewolf/Mafia until someone betrays everyone (perfect with 6 players).',
          '~3 hr', ['games', 'fireside'],
          'Mafia needs a narrator — assign before dinner.',
          'tent'),
      ],
    },
  },
];

const COONOOR_DAYS = [
  {
    id: 'c-day1',
    date: 'Jun 20',
    dayOfWeek: 'Saturday',
    theme: 'Arrival & Settling In',
    vibe: 'Drive up, sink into the hills, no plans after sundown.',
    slots: {
      morning: [
        opt('a', 'Mettupalayam Route',
          'Drive Coimbatore → Coonoor via Mettupalayam (~3 hr incl. breakfast stop). Reach by ~10:30 AM.',
          '~3 hr', ['drive', 'breakfast stop'],
          'Most direct route. Stop at Annapoorna for tiffin.',
          'compass'),
        opt('b', 'Sirumugai Route',
          'Quieter alternative through Sirumugai forest (~3.5 hr). Pack breakfast from Coimbatore.',
          '~3.5 hr', ['scenic', 'wildlife'],
          'Less traffic, slightly longer.',
          'trees'),
      ],
      afternoon: [
        opt('a', 'Settle & Slow Sim\'s Park',
          'Check in, lazy lunch at homestay, then a slow walk through Sim\'s Park (15 min away).',
          '~3 hr', ['rest', 'garden'],
          'Best for after-drive recovery.',
          'flower'),
        opt('b', 'Wellington Heritage Stroll',
          'Drive 15 min to Wellington cantonment, walk the heritage streets. Lunch at La Belle Vie.',
          '~3 hr', ['history', 'walk'],
          'Avoid restricted Defence zones — locals will point them out.',
          'book'),
      ],
      night: [
        opt('a', 'Welcome Dinner + Board Games',
          'Homestay dinner — Catan / Codenames / Carcassonne after.',
          '~3 hr', ['games', 'home dinner'],
          'Codenames is the easiest entry for 6.',
          'game'),
        opt('b', 'Fireplace Antakshari',
          'Cool June evening, fireplace, dinner, antakshari till bedtime.',
          '~3 hr', ['music', 'fireside'],
          'Phones in a basket for an hour.',
          'sparkles'),
      ],
    },
  },
  {
    id: 'c-day2',
    date: 'Jun 21',
    dayOfWeek: 'Sunday',
    theme: 'Local Coonoor — Tea, Cheese, Vistas',
    vibe: 'Spend the day inside Coonoor. Tea factory, a cheese farm, a garden.',
    slots: {
      morning: [
        opt('a', 'Dolphin\'s Nose + Lamb\'s Rock Sunrise',
          'Drive 30 min to the viewpoints. Walk between them. Picnic breakfast packed.',
          '~4 hr', ['viewpoint', 'sunrise'],
          'Best in clear weather — mist can hide the whole drop.',
          'mountain'),
        opt('b', 'Highfield Tea Factory Tour',
          'Working factory tour (₹150/head). Tea tasting at the end. Breakfast at La Belle Vie after.',
          '~3.5 hr', ['factory', 'tea'],
          'Working factory — closed-toe shoes are easier.',
          'factory'),
      ],
      afternoon: [
        opt('a', 'Sim\'s Park + Cafe Diem',
          'Full afternoon at Sim\'s Park — rose garden inside, small lake. Lunch at Cafe Diem.',
          '~4 hr', ['garden', 'lunch'],
          'Slow-paced — great when the morning was a workout.',
          'flower'),
        opt('b', 'Acres Wild Cheesemaking Tour',
          'Tour India\'s only farmstead cheese maker, tasting, lunch at 180° McIver on their grounds.',
          '~4 hr', ['factory', 'cheese', 'lunch'],
          'Book 2–3 days ahead. The lunch is the highlight.',
          'cog'),
      ],
      night: [
        opt('a', 'Stargazing + Tambola',
          'Lawn, blankets, Tambola, flasks of hot drinks.',
          '~3 hr', ['games', 'stars'],
          'Print tickets earlier in the day.',
          'star'),
        opt('b', 'Badaga Kitchen Night',
          'Pre-arrange a Badaga cooking lesson with the host. Cook ragi puttu and samai sambar. Eat your work.',
          '~3.5 hr', ['cooking', 'local food'],
          'Confirm with homestay 2 days in advance.',
          'utensils'),
      ],
    },
  },
  {
    id: 'c-day3',
    date: 'Jun 22',
    dayOfWeek: 'Monday',
    theme: 'Kotagiri Day Trip — The Quiet Side',
    vibe: 'Day out to Kotagiri — the calmer cousin, where the tribal-led conservation work lives.',
    slots: {
      morning: [
        opt('a', 'Kodanad Sunrise + Picnic',
          'Drive to Kodanad viewpoint (5:30 AM start, ~75 min from Coonoor). Three-district view. Meditate on the rocks. Breakfast picnic.',
          '~5 hr', ['meditation', 'viewpoint', 'sunrise'],
          'Set alarms. The light at 6:30 AM here is something else.',
          'mountain'),
        opt('b', 'Longwood Shola Walk',
          'Drive to Kotagiri, then a 1.5-hour walk through an ancient shola (3 km loop). Endemic birds. Breakfast at Cafe Diem after.',
          '~4 hr', ['hike: easy', 'forest'],
          'Carry binoculars. Cool mornings = active birds.',
          'trees'),
      ],
      afternoon: [
        opt('a', 'Keystone Foundation + The Last Forest',
          'India\'s celebrated tribal-livelihood NGO. Indigenous honey, millets, baskets. Lunch at Nahar\'s Sidewalk.',
          '~4 hr', ['local', 'shopping', 'NGO'],
          'Deeply local. The moms will love the shop.',
          'shop'),
        opt('b', 'Catherine Falls + Kotagiri Bazaar',
          'Falls viewpoint + a slow walk through Kotagiri\'s bazaar — Toda silver, eucalyptus oil, honey. Lunch at La Maison.',
          '~4 hr', ['waterfall', 'shopping'],
          'Waterfall is most full in monsoon. Bazaar peaks 2–5 PM.',
          'shop'),
      ],
      night: [
        opt('a', 'Drive Back, Charades',
          'Drive back to Coonoor before dark (45 min). Dinner at homestay. Dumb Charades — Bollywood movies only.',
          '~3 hr', ['games', 'home dinner'],
          'Easier on the driver — avoid the post-dusk ghat road.',
          'game'),
        opt('b', 'John Sullivan + Late Dinner Out',
          'Quick stop at John Sullivan Memorial on the way back. Late dinner at La Belle Vie back in Coonoor.',
          '~4 hr', ['history', 'dinner out'],
          'Best if no one is exhausted by 6 PM.',
          'book'),
      ],
    },
  },
  {
    id: 'c-day4',
    date: 'Jun 23',
    dayOfWeek: 'Tuesday',
    theme: 'Hike + Factory Day',
    vibe: 'Morning legs, afternoon senses, evening rest.',
    slots: {
      morning: [
        opt('a', 'Droog Fort Hike',
          'Intermediate hike (3 hr round trip). Ancient Tipu Sultan-era fort ruins, big views. Snacks and water packed.',
          '~4 hr', ['hike: intermediate', 'history'],
          'Skip if it rained hard last night — the final stretch gets slippery.',
          'mountain'),
        opt('b', 'Wellington Heritage + Museum',
          'Walk the cantonment, visit the Defence Services Museum (artillery, regimental history).',
          '~3.5 hr', ['history', 'museum'],
          'Easier for anyone whose knees voted "no" on hike day.',
          'book'),
      ],
      afternoon: [
        opt('a', 'Chocolate Factory Visit',
          'Drive towards Ooty for King Star / Modern Chocolate factory tour. Tasting, buy a kilo for home. Lunch nearby.',
          '~4 hr', ['factory', 'chocolate', 'shopping'],
          'Tour is small. The shop is the real reason to go.',
          'cookie'),
        opt('b', 'Boutique Tea Estate + Lunch',
          'Smaller estate (Glendale, Tiger Hill) for an intimate tour, tea tasting, and a hot estate lunch.',
          '~4 hr', ['factory', 'tea', 'lunch'],
          'Call ahead by 2 days — these are private operations.',
          'leaf'),
      ],
      night: [
        opt('a', 'Outdoor Meditation Circle',
          'Lawn at dusk, 20 minutes guided silence, simple millet-and-sambar dinner.',
          '~3 hr', ['meditation', 'home dinner'],
          'Skip if it\'s raining hard.',
          'sparkles'),
        opt('b', 'Movie Under the Stars',
          'Projector + screen on the lawn. Old film, hot chocolate, popcorn, blankets.',
          '~3 hr', ['movie', 'fireside'],
          'Pre-arrange the projector with the homestay.',
          'camera'),
      ],
    },
  },
  {
    id: 'c-day5',
    date: 'Jun 24',
    dayOfWeek: 'Wednesday',
    theme: 'Last Day — Ooty, or Stay Close',
    vibe: 'The big goodbye day — go out to Ooty, or stay close in Coonoor.',
    slots: {
      morning: [
        opt('a', 'Ooty Lake Boating',
          'Drive to Ooty, take pedal boats at the lake (Wednesday morning is calm). Breakfast at Place to Bee.',
          '~4 hr', ['boating', 'breakfast'],
          'Life jackets for all, including the baby — they have infant ones.',
          'tent'),
        opt('b', 'Hidden Valley + Law\'s Falls',
          'Stay in Coonoor. Quiet walk through Hidden Valley + view of Law\'s Falls. Less driving on the last day.',
          '~3 hr', ['easy walk', 'waterfall'],
          'Best option if the legs need a quieter morning.',
          'foot'),
      ],
      afternoon: [
        opt('a', 'Botanical Garden + Tribal Museum',
          'Ooty Botanical Garden (head to the fern house, skip the busy parts) + the underrated Tribal Research Centre Museum. Lunch at Earl\'s Secret.',
          '~5 hr', ['garden', 'museum', 'lunch'],
          'The Tribal Museum is a hidden gem — small but moving.',
          'flower'),
        opt('b', 'Bedford Shopping for the Moms',
          'Coonoor\'s old market — woolens, eucalyptus oils, chocolates, spices. Lunch wherever the moms point.',
          '~4 hr', ['shopping', 'local'],
          'Best last-day option for souvenirs.',
          'shop'),
      ],
      night: [
        opt('a', 'Farewell Dinner + Pictionary',
          'Big homestay dinner, group photo, Pictionary tournament.',
          '~3 hr', ['games', 'farewell'],
          'Pack tonight — early drive tomorrow.',
          'heart'),
        opt('b', 'Bonfire + Mafia',
          'Bonfire on the lawn, simple dinner, Werewolf/Mafia until someone betrays everyone (perfect with 6).',
          '~3 hr', ['games', 'fireside'],
          'Assign a narrator before dinner.',
          'tent'),
      ],
    },
  },
];

const VILLA_GAMES = [
  { id: 'g-cat', name: 'Settlers of Catan', players: '3–4', time: '60–90 min', tag: 'strategy', desc: 'Trade, build, settle. Best as a one-night commitment.' },
  { id: 'g-cod', name: 'Codenames', players: '4–8', time: '15–30 min', tag: 'team / words', desc: 'Two teams, secret agents, word clues. Easiest entry for 6 with mixed players.' },
  { id: 'g-car', name: 'Carcassonne', players: '2–5', time: '~35 min', tag: 'tile-laying', desc: 'Build a medieval landscape one tile at a time. Quiet, considered.' },
  { id: 'g-uno', name: 'UNO', players: '2–10', time: '~30 min', tag: 'cards', desc: 'No rules debate, just play.' },
  { id: 'g-tam', name: 'Tambola (Housie)', players: 'any', time: '20–30 min', tag: 'classic', desc: 'Print tickets, one caller, prizes for early-five, top-row, full house.' },
  { id: 'g-ant', name: 'Antakshari', players: 'any', time: '30+ min', tag: 'singing', desc: 'Two teams, songs that start with the last letter of the previous one. Bollywood only?' },
  { id: 'g-dum', name: 'Dumb Charades', players: '4+', time: '30+ min', tag: 'acting', desc: 'Bollywood movies. No talking, no lip-syncing, no spelling.' },
  { id: 'g-pic', name: 'Pictionary', players: '4+', time: '30+ min', tag: 'drawing', desc: 'Handicaps for the bad artists (more time) and the good ones (felt-tip only).' },
  { id: 'g-maf', name: 'Werewolf / Mafia', players: '6–12', time: '~30 min', tag: 'social deduction', desc: 'Perfect with 6 players. One narrator, two wolves, four villagers.' },
  { id: 'g-fiv', name: '5-Second Rule', players: '3+', time: '~30 min', tag: 'speed', desc: 'Name three things in 5 seconds. Surprisingly hard with parents in the room.' },
  { id: 'g-tri', name: 'Family Trivia', players: 'any', time: '30+ min', tag: 'trivia', desc: 'Prepare questions about each family member. Hilarious mid-week activity.' },
  { id: 'g-sto', name: 'Round-Robin Storytelling', players: 'any', time: '20–40 min', tag: 'storytelling', desc: 'Each person adds one sentence. The story gets stranger. The baby will laugh.' },
];

/* ----------------------------------------------------------------
   STORAGE HELPERS
---------------------------------------------------------------- */
async function loadSharedState() {
  try {
    const result = await fetch('/api/state');
    if (!result.ok) throw new Error('Could not load shared state');
    return await result.json();
  } catch {
    return {
      profiles: [],
      baseVotes: {},
      votes: {},
      comments: [],
      gameVotes: {},
    };
  }
}

async function runSharedAction(type, payload) {
  try {
    const result = await fetch('/api/action', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type, payload }),
    });
    if (!result.ok) {
      const body = await result.json().catch(() => ({}));
      throw new Error(body.error || 'Could not save your choice');
    }
    return await result.json();
  } catch (e) {
    console.error(e);
    return null;
  }
}

/* ----------------------------------------------------------------
   UTILITIES
---------------------------------------------------------------- */
const initials = (name) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const newId = () => Math.random().toString(36).slice(2, 10);

const BASE_LABELS = {
  kotagiri: 'Kotagiri',
  coonoor: 'Coonoor',
};

const TRIP_START_YEAR = 2026;
const SLOT_TIMES = {
  morning: ['08:00', '11:30'],
  afternoon: ['13:00', '17:00'],
  night: ['19:00', '22:00'],
};

const IMAGE_BY_TAG = {
  train: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=900&q=80',
  factory: 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?auto=format&fit=crop&w=900&q=80',
  tea: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=900&q=80',
  waterfall: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
  garden: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80',
  boating: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
  shopping: 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&w=900&q=80',
  museum: 'https://images.unsplash.com/photo-1566054757965-8c4085344c96?auto=format&fit=crop&w=900&q=80',
  history: 'https://images.unsplash.com/photo-1524230572899-a752b3835840?auto=format&fit=crop&w=900&q=80',
  viewpoint: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80',
  forest: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=900&q=80',
  lunch: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80',
  default: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=900&q=80',
};

function getDaysForBase(base) {
  return base === 'coonoor' ? COONOOR_DAYS : KOTAGIRI_DAYS;
}

function votePercent(count, total) {
  if (!total) return 0;
  return Math.round((count / total) * 100);
}

function getTargetKey(base, dayId, slotKey, optionId) {
  return `${base}:${dayId}:${slotKey}:${optionId}`;
}

function getOptionVotes(votes, base, dayId, slotKey, optionId) {
  return Object.keys(votes[getTargetKey(base, dayId, slotKey, optionId)] || {});
}

function getWinningBases(baseVotes, profiles) {
  const choices = ['kotagiri', 'coonoor'];
  const counts = choices.map((base) => ({
    base,
    count: profiles.filter((p) => baseVotes[p.id] === base).length,
  }));
  const max = Math.max(...counts.map((item) => item.count));
  if (max === 0) return choices;
  return counts.filter((item) => item.count === max).map((item) => item.base);
}

function getWinningOptions(day, base, slotKey, votes) {
  const scored = day.slots[slotKey].map((option) => ({
    option,
    count: getOptionVotes(votes, base, day.id, slotKey, option.id).length,
  }));
  const max = Math.max(...scored.map((item) => item.count));
  if (max === 0) return scored.map((item) => item.option);
  return scored.filter((item) => item.count === max).map((item) => item.option);
}

function getPersonalOptions(day, base, slotKey, votes, comments, profileId) {
  const voted = day.slots[slotKey].filter((option) => {
    const key = getTargetKey(base, day.id, slotKey, option.id);
    return Boolean(votes[key]?.[profileId]);
  });
  if (voted.length > 0) return voted;

  const commented = day.slots[slotKey].filter((option) => {
    const key = getTargetKey(base, day.id, slotKey, option.id);
    return comments.some((comment) => comment.userId === profileId && comment.target === key);
  });
  return commented.length > 0 ? commented : day.slots[slotKey];
}

function getInfoForOption(option, base) {
  const tags = option.tags || [];
  const tag = tags.find((item) => IMAGE_BY_TAG[item]) || tags.find((item) => item.startsWith('hike')) || 'default';
  const search = encodeURIComponent(`${option.title} ${BASE_LABELS[base]} Nilgiris`);
  return {
    image: IMAGE_BY_TAG[tag] || IMAGE_BY_TAG.default,
    mapUrl: `https://www.google.com/maps/search/?api=1&query=${search}`,
    caption: option.notes || 'Open the pin before leaving, because timings and access can change in the hills.',
  };
}

function formatDayDate(day) {
  return `${day.dayOfWeek}, ${day.date}, ${TRIP_START_YEAR}`;
}

function itineraryLines({ bases, votes, comments, profiles, gameVotes = {}, mode = 'final', profileId = null }) {
  const lines = [];
  bases.forEach((base) => {
    lines.push(`${BASE_LABELS[base]} itinerary`);
    getDaysForBase(base).forEach((day, idx) => {
      lines.push(`Day ${idx + 1} - ${formatDayDate(day)} - ${day.theme}`);
      ['morning', 'afternoon', 'night'].forEach((slotKey) => {
        const options = mode === 'personal'
          ? getPersonalOptions(day, base, slotKey, votes, comments, profileId)
          : getWinningOptions(day, base, slotKey, votes);
        lines.push(`${SLOT_META[slotKey].label}: ${options.map((option) => option.title).join(' / ')}`);
      });
    });
    lines.push('');
  });
  const topGames = VILLA_GAMES
    .map((game) => ({ game, count: Object.keys(gameVotes[game.id] || {}).length }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);
  if (topGames.length > 0 && profiles.length > 0) {
    lines.push(`Villa games: ${topGames.map(({ game }) => game.name).join(', ')}`);
  }
  return lines;
}

function downloadBlob(filename, mimeType, content) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function downloadFinalPdf({ bases, votes, comments, profiles, gameVotes }) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const lines = itineraryLines({ bases, votes, comments, profiles, gameVotes });
  let y = 56;
  doc.setFont('times', 'bold');
  doc.setFontSize(20);
  doc.text('Nilgiri Final Itinerary', 48, y);
  y += 28;
  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  doc.text(`Generated from latest live votes on ${new Date().toLocaleString('en-IN')}`, 48, y);
  y += 28;
  doc.setFontSize(11);
  lines.forEach((line) => {
    const wrapped = doc.splitTextToSize(line, 500);
    wrapped.forEach((part) => {
      if (y > 780) {
        doc.addPage();
        y = 56;
      }
      doc.text(part, 48, y);
      y += 16;
    });
    if (!line) y += 6;
  });
  doc.save('nilgiri-final-itinerary.pdf');
}

function downloadFinalCalendar({ bases, votes, comments, profiles }) {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const escapeIcs = (value) => String(value).replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
  const events = [];

  bases.forEach((base) => {
    getDaysForBase(base).forEach((day) => {
      const dayNumber = Number(day.date.replace(/\D/g, ''));
      const mmdd = `${TRIP_START_YEAR}06${String(dayNumber).padStart(2, '0')}`;
      ['morning', 'afternoon', 'night'].forEach((slotKey) => {
        const options = getWinningOptions(day, base, slotKey, votes);
        const [start, end] = SLOT_TIMES[slotKey];
        const uid = `${base}-${day.id}-${slotKey}@nilgiri-family-trip`;
        events.push([
          'BEGIN:VEVENT',
          `UID:${uid}`,
          `DTSTAMP:${stamp}`,
          `DTSTART;TZID=Asia/Kolkata:${mmdd}T${start.replace(':', '')}00`,
          `DTEND;TZID=Asia/Kolkata:${mmdd}T${end.replace(':', '')}00`,
          `SUMMARY:${escapeIcs(`${SLOT_META[slotKey].label}: ${options.map((option) => option.title).join(' / ')}`)}`,
          `DESCRIPTION:${escapeIcs(`${BASE_LABELS[base]} base. Generated from latest live votes. ${options.map((option) => option.sub).join(' | ')}`)}`,
          `LOCATION:${escapeIcs(`${BASE_LABELS[base]}, Nilgiris`)}`,
          'END:VEVENT',
        ].join('\r\n'));
      });
    });
  });

  downloadBlob(
    'nilgiri-final-itinerary.ics',
    'text/calendar;charset=utf-8',
    ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Nilgiri Family Trip//Live Planner//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', ...events, 'END:VCALENDAR'].join('\r\n')
  );
}

/* ----------------------------------------------------------------
   SMALL COMPONENTS
---------------------------------------------------------------- */
function Avatar({ profile, size = 32, ring = false }) {
  if (!profile) return null;
  return (
    <div
      title={`${profile.name}${profile.age ? ` · ${profile.age}` : ''}`}
      style={{
        width: size,
        height: size,
        background: profile.color,
        color: '#FAF6EB',
        boxShadow: ring ? `0 0 0 2px ${P.paper}, 0 0 0 4px ${profile.color}` : `0 1px 2px ${P.shadow}`,
        fontFamily: 'Spectral, Georgia, serif',
        fontSize: size * 0.4,
        fontWeight: 600,
        letterSpacing: 0.3,
      }}
      className="rounded-full inline-flex items-center justify-center shrink-0"
    >
      {initials(profile.name)}
    </div>
  );
}

function AvatarStack({ profiles, size = 26, max = 5 }) {
  const shown = profiles.slice(0, max);
  const extra = profiles.length - shown.length;
  return (
    <div className="flex items-center">
      {shown.map((p, i) => (
        <div key={p.id} style={{ marginLeft: i === 0 ? 0 : -8 }}>
          <Avatar profile={p} size={size} ring />
        </div>
      ))}
      {extra > 0 && (
        <div
          style={{
            marginLeft: -8,
            width: size,
            height: size,
            background: P.paper,
            color: P.deepTea,
            border: `2px solid ${P.paper}`,
            outline: `1px solid ${P.border}`,
            fontFamily: 'Spectral, Georgia, serif',
            fontSize: size * 0.4,
            fontWeight: 600,
          }}
          className="rounded-full inline-flex items-center justify-center"
        >
          +{extra}
        </div>
      )}
    </div>
  );
}

function Tag({ children, tone = 'sage' }) {
  const styles = {
    sage: { background: '#E5EBE0', color: P.deepTea, border: `1px solid #D2DCC9` },
    cream: { background: P.paperDark, color: P.midTea, border: `1px solid ${P.border}` },
    terracotta: { background: '#F5DDD0', color: P.rust, border: `1px solid #EBC8B5` },
  };
  return (
    <span
      style={{
        ...styles[tone],
        fontFamily: 'Spectral, Georgia, serif',
        fontSize: 11,
        letterSpacing: 0.4,
      }}
      className="inline-block px-2 py-0.5 rounded-full uppercase tracking-wide"
    >
      {children}
    </span>
  );
}

function SectionDivider() {
  return (
    <div className="flex items-center gap-3 py-4">
      <div style={{ height: 1, background: P.border, flex: 1 }} />
      <Leaf size={14} style={{ color: P.mistGreen }} />
      <div style={{ height: 1, background: P.border, flex: 1 }} />
    </div>
  );
}

/* ----------------------------------------------------------------
   PROFILE GATE
---------------------------------------------------------------- */
function ProfileGate({ profiles, onPick, onAdd, loading }) {
  const [showAdd, setShowAdd] = useState(profiles.length === 0);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');

  const handleAdd = () => {
    if (!name.trim()) return;
    const ageN = age ? parseInt(age, 10) : null;
    onAdd(name.trim(), ageN || null);
    setName('');
    setAge('');
    setShowAdd(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: P.paper }}
    >
      <div
        className="w-full max-w-xl rounded-lg overflow-hidden"
        style={{
          background: P.paperDark,
          border: `1px solid ${P.border}`,
          boxShadow: `0 20px 60px ${P.shadow}`,
        }}
      >
        <div className="px-8 pt-10 pb-6 text-center" style={{ background: P.deepTea, color: P.paper }}>
          <div className="flex items-center justify-center gap-2 mb-2" style={{ fontFamily: 'Spectral, Georgia, serif', fontSize: 12, letterSpacing: 4 }}>
            <Mountain size={14} />
            <span>NILGIRI · A FAMILY GATHERING</span>
            <Mountain size={14} />
          </div>
          <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 36, fontWeight: 400, lineHeight: 1.1 }}>
            Welcome
          </h1>
          <p style={{ fontFamily: 'Spectral, serif', fontStyle: 'italic', opacity: 0.85, marginTop: 6 }}>
            Tell us who you are, and we&apos;ll show you the plan.
          </p>
        </div>

        <div className="px-8 py-8">
          {loading && (
            <div className="text-center py-8" style={{ fontFamily: 'Spectral, serif', color: P.midTea }}>
              loading the family…
            </div>
          )}

          {!loading && profiles.length > 0 && !showAdd && (
            <>
              <div
                style={{ fontFamily: 'Spectral, serif', fontSize: 13, letterSpacing: 2, color: P.midTea }}
                className="uppercase mb-4 text-center"
              >
                I am…
              </div>
              <div className="space-y-2">
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onPick(p.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded transition-all hover:translate-x-1"
                    style={{
                      background: P.paper,
                      border: `1px solid ${P.border}`,
                      textAlign: 'left',
                    }}
                  >
                    <Avatar profile={p} size={36} />
                    <div className="flex-1">
                      <div style={{ fontFamily: 'Fraunces, serif', fontSize: 18, color: P.ink }}>
                        {p.name}
                      </div>
                      {p.age && (
                        <div style={{ fontFamily: 'Spectral, serif', fontSize: 12, color: P.midTea, fontStyle: 'italic' }}>
                          {p.age} years
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowAdd(true)}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded transition-all"
                style={{
                  background: 'transparent',
                  border: `1px dashed ${P.mistGreen}`,
                  color: P.deepTea,
                  fontFamily: 'Spectral, serif',
                  fontSize: 14,
                }}
              >
                <UserPlus size={16} />
                Add me to the family
              </button>
            </>
          )}

          {!loading && showAdd && (
            <>
              <div
                style={{ fontFamily: 'Spectral, serif', fontSize: 13, letterSpacing: 2, color: P.midTea }}
                className="uppercase mb-4 text-center"
              >
                {profiles.length === 0 ? 'Be the first to join' : 'Add yourself'}
              </div>
              <div className="space-y-3">
                <div>
                  <label style={{ fontFamily: 'Spectral, serif', fontSize: 12, letterSpacing: 1.5, color: P.midTea }} className="uppercase block mb-1">
                    Your name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    className="w-full px-4 py-3 rounded outline-none"
                    style={{
                      background: P.paper,
                      border: `1px solid ${P.border}`,
                      fontFamily: 'Spectral, serif',
                      fontSize: 16,
                      color: P.ink,
                    }}
                    placeholder="e.g., Lakshmi"
                  />
                </div>
                <div>
                  <label style={{ fontFamily: 'Spectral, serif', fontSize: 12, letterSpacing: 1.5, color: P.midTea }} className="uppercase block mb-1">
                    Age (optional)
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    className="w-full px-4 py-3 rounded outline-none"
                    style={{
                      background: P.paper,
                      border: `1px solid ${P.border}`,
                      fontFamily: 'Spectral, serif',
                      fontSize: 16,
                      color: P.ink,
                    }}
                    placeholder="e.g., 58"
                  />
                </div>
                <button
                  onClick={handleAdd}
                  disabled={!name.trim()}
                  className="w-full py-3 rounded transition-all"
                  style={{
                    background: name.trim() ? P.terracotta : P.border,
                    color: P.paper,
                    fontFamily: 'Spectral, serif',
                    fontSize: 15,
                    letterSpacing: 1,
                    cursor: name.trim() ? 'pointer' : 'not-allowed',
                  }}
                >
                  Continue →
                </button>
                {profiles.length > 0 && (
                  <button
                    onClick={() => setShowAdd(false)}
                    className="w-full py-2 text-sm"
                    style={{ fontFamily: 'Spectral, serif', color: P.midTea }}
                  >
                    Back to family list
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
   BASE TOGGLE (the big decision)
---------------------------------------------------------------- */
function BaseCard({ base, isActive, isMyChoice, voters, onPick, onView, totalProfiles }) {
  const isKotagiri = base === 'kotagiri';
  return (
    <div
      className="relative rounded-lg overflow-hidden transition-all"
      style={{
        background: isActive ? P.deepTea : P.paperDark,
        color: isActive ? P.paper : P.ink,
        border: `1px solid ${isActive ? P.deepTea : P.border}`,
        boxShadow: isActive ? `0 8px 28px ${P.shadowStrong}` : `0 2px 8px ${P.shadow}`,
        cursor: 'pointer',
      }}
      onClick={onView}
    >
      <div className="p-6 sm:p-7">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div style={{ fontFamily: 'Spectral, serif', fontSize: 11, letterSpacing: 3, opacity: 0.7 }} className="uppercase">
              {isKotagiri ? 'Base option · 01' : 'Base option · 02'}
            </div>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 32, fontWeight: 400, lineHeight: 1, marginTop: 4 }}>
              {isKotagiri ? 'Kotagiri' : 'Coonoor'}
            </h3>
            <div
              style={{
                fontFamily: 'Spectral, serif',
                fontStyle: 'italic',
                fontSize: 14,
                opacity: 0.85,
                marginTop: 2,
              }}
            >
              {isKotagiri ? 'The Quiet One' : 'The Lively One'}
            </div>
          </div>
          {isActive && (
            <div
              style={{
                background: P.honey,
                color: P.deepTea,
                fontFamily: 'Spectral, serif',
                fontSize: 11,
                letterSpacing: 1.5,
              }}
              className="px-2 py-1 rounded uppercase"
            >
              Viewing
            </div>
          )}
        </div>
        <p style={{ fontFamily: 'Spectral, serif', fontSize: 15, opacity: 0.85, lineHeight: 1.55 }}>
          {isKotagiri
            ? 'Slower, sleepier, soaked in mist. Postcards without the crowds. Best base if you want the trip to slow down on its own.'
            : 'A bit more bustle, more cafés, more tea estates within walking distance. Easiest base for restaurants, markets, and the toy train.'}
        </p>

        <div
          className="mt-5 pt-4 flex items-center justify-between gap-3"
          style={{ borderTop: `1px solid ${isActive ? 'rgba(244,236,216,0.18)' : P.border}` }}
        >
          <div className="flex items-center gap-2">
            <span style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 500 }}>
              {voters.length}
            </span>
            <span style={{ fontFamily: 'Spectral, serif', fontSize: 12, opacity: 0.7, letterSpacing: 1 }} className="uppercase">
              vote{voters.length === 1 ? '' : 's'} · {votePercent(voters.length, totalProfiles)}%
            </span>
            {voters.length > 0 && (
              <div className="ml-2">
                <AvatarStack profiles={voters} size={22} max={6} />
              </div>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onPick(); }}
            className="px-4 py-2 rounded transition-all"
            style={{
              background: isMyChoice ? P.honey : (isActive ? P.paper : P.deepTea),
              color: isMyChoice ? P.deepTea : (isActive ? P.deepTea : P.paper),
              fontFamily: 'Spectral, serif',
              fontSize: 13,
              letterSpacing: 1,
            }}
          >
            {isMyChoice ? '✓ My pick' : 'Vote for base'}
          </button>
        </div>

        {totalProfiles > 0 && (
          <div className="mt-3" style={{ height: 4, background: isActive ? 'rgba(244,236,216,0.15)' : P.border, borderRadius: 2, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${(voters.length / totalProfiles) * 100}%`,
                background: isActive ? P.honey : P.terracotta,
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
   OPTION CARD
---------------------------------------------------------------- */
function OptionCard({
  option, slotKey, dayId, base,
  voters, allProfiles, currentUserId,
  onVote, comments, onAddComment,
  slotTint, totalProfiles,
}) {
  const [showComments, setShowComments] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [draft, setDraft] = useState('');
  const IconComp = ICONS[option.icon] || Star;
  const info = getInfoForOption(option, base);
  const percent = votePercent(voters.length, totalProfiles);

  const isMyVote = voters.some((v) => v.id === currentUserId);

  const submitComment = () => {
    if (!draft.trim()) return;
    onAddComment(draft.trim());
    setDraft('');
  };

  return (
    <div
      className="rounded-lg transition-all"
      style={{
        background: P.paper,
        border: `1px solid ${isMyVote ? P.terracotta : P.border}`,
        boxShadow: isMyVote ? `0 4px 18px rgba(197, 107, 74, 0.18)` : `0 1px 3px ${P.shadow}`,
      }}
    >
      <div className="p-4 sm:p-5">
        <div className="flex gap-3 items-start mb-3">
          <div
            style={{
              background: slotTint,
              color: P.deepTea,
              padding: 8,
              borderRadius: 8,
              border: `1px solid ${P.borderSoft}`,
            }}
            className="shrink-0"
          >
            <IconComp size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              <h4 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 500, color: P.ink, lineHeight: 1.2, flex: 1 }}>
                {option.title}
              </h4>
              <button
                onClick={() => setShowInfo(true)}
                aria-label={`More info about ${option.title}`}
                title="More info, image and map pin"
                className="shrink-0 inline-flex items-center justify-center rounded-full"
                style={{
                  width: 26,
                  height: 26,
                  color: P.deepTea,
                  background: P.paperDark,
                  border: `1px solid ${P.border}`,
                }}
              >
                <Info size={15} />
              </button>
            </div>
            <div className="mt-1 flex items-center gap-2 flex-wrap">
              <span style={{ fontFamily: 'Spectral, serif', fontSize: 12, color: P.midTea, fontStyle: 'italic' }}>
                {option.dur}
              </span>
              {option.tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
          </div>
        </div>

        <p style={{ fontFamily: 'Spectral, serif', fontSize: 14, color: P.midTea, lineHeight: 1.6 }}>
          {option.sub}
        </p>

        {option.notes && (
          <div
            className="mt-3 px-3 py-2 rounded"
            style={{
              background: P.paperDark,
              border: `1px dashed ${P.border}`,
              fontFamily: 'Spectral, serif',
              fontSize: 12,
              color: P.midTea,
              fontStyle: 'italic',
              lineHeight: 1.5,
            }}
          >
            ✦ {option.notes}
          </div>
        )}

        <div
          className="mt-4 pt-3 flex items-center justify-between gap-2 flex-wrap"
          style={{ borderTop: `1px solid ${P.borderSoft}` }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={onVote}
              className="px-3 py-1.5 rounded transition-all"
              style={{
                background: isMyVote ? P.terracotta : 'transparent',
                color: isMyVote ? P.paper : P.deepTea,
                border: `1px solid ${isMyVote ? P.terracotta : P.mistGreen}`,
                fontFamily: 'Spectral, serif',
                fontSize: 13,
                letterSpacing: 0.5,
              }}
            >
              {isMyVote ? '✓ Picked' : 'Pick this'}
            </button>
            {voters.length > 0 && (
              <div className="flex items-center gap-2">
                <AvatarStack profiles={voters} size={22} max={5} />
                <span style={{ fontFamily: 'Spectral, serif', fontSize: 12, color: P.midTea }}>
                  {voters.length} vote{voters.length === 1 ? '' : 's'} · {percent}%
                </span>
              </div>
            )}
            {voters.length === 0 && totalProfiles > 0 && (
              <span style={{ fontFamily: 'Spectral, serif', fontSize: 12, color: P.midTea }}>
                0 votes · 0%
              </span>
            )}
          </div>

          <button
            onClick={() => setShowComments(!showComments)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded transition-all"
            style={{
              fontFamily: 'Spectral, serif',
              fontSize: 12,
              color: P.midTea,
              background: showComments ? P.paperDark : 'transparent',
            }}
          >
            <MessageCircle size={13} />
            <span>{comments.length}</span>
          </button>
        </div>

        {showComments && (
          <div className="mt-3 pt-3 space-y-2" style={{ borderTop: `1px solid ${P.borderSoft}` }}>
            {comments.length === 0 && (
              <div
                style={{ fontFamily: 'Spectral, serif', fontSize: 12, color: P.midTea, fontStyle: 'italic' }}
                className="text-center py-2"
              >
                No comments yet — be the first.
              </div>
            )}
            {comments.map((c) => {
              const author = allProfiles.find((p) => p.id === c.userId);
              return (
                <div key={c.id} className="flex gap-2 items-start">
                  <Avatar profile={author || { name: '??', color: P.mistGreen }} size={26} />
                  <div className="flex-1">
                    <div style={{ fontFamily: 'Spectral, serif', fontSize: 12 }}>
                      <span style={{ color: P.deepTea, fontWeight: 600 }}>{author?.name || 'Unknown'}</span>
                      <span style={{ color: P.midTea, marginLeft: 6, fontSize: 11 }}>
                        {new Date(c.ts).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ fontFamily: 'Spectral, serif', fontSize: 13, color: P.ink, marginTop: 1, lineHeight: 1.45 }}>
                      {c.text}
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitComment()}
                placeholder="Add a comment…"
                className="flex-1 px-3 py-2 rounded outline-none"
                style={{
                  background: P.paperDark,
                  border: `1px solid ${P.border}`,
                  fontFamily: 'Spectral, serif',
                  fontSize: 13,
                  color: P.ink,
                }}
              />
              <button
                onClick={submitComment}
                disabled={!draft.trim()}
                className="px-3 rounded inline-flex items-center justify-center"
                style={{
                  background: draft.trim() ? P.deepTea : P.border,
                  color: P.paper,
                  cursor: draft.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(26, 31, 26, 0.55)' }} onClick={() => setShowInfo(false)}>
          <div
            className="w-full max-w-lg rounded-lg overflow-hidden"
            style={{ background: P.paper, border: `1px solid ${P.border}`, boxShadow: `0 24px 80px ${P.shadowStrong}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <img src={info.image} alt={option.title} className="w-full" style={{ height: 220, objectFit: 'cover' }} />
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 500, color: P.ink }}>
                    {option.title}
                  </h3>
                  <p style={{ fontFamily: 'Spectral, serif', fontSize: 14, color: P.midTea, lineHeight: 1.55, marginTop: 6 }}>
                    {option.sub}
                  </p>
                </div>
                <button onClick={() => setShowInfo(false)} className="px-2" style={{ color: P.midTea, fontSize: 20 }}>x</button>
              </div>
              <div className="mt-3 px-3 py-2 rounded" style={{ background: P.paperDark, border: `1px dashed ${P.border}`, fontFamily: 'Spectral, serif', fontSize: 13, color: P.midTea }}>
                {info.caption}
              </div>
              <a
                href={info.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded"
                style={{ background: P.deepTea, color: P.paper, fontFamily: 'Spectral, serif', fontSize: 14 }}
              >
                <MapPin size={15} />
                Open location pin
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------
   DAY CARD
---------------------------------------------------------------- */
function DayCard({ day, dayIndex, base, isOpen, onToggle, profiles, votes, currentUserId, onVote, comments, onAddComment }) {
  const SlotIcon = ({ k }) => {
    const Comp = ICONS[SLOT_META[k].icon];
    return <Comp size={16} />;
  };

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        background: P.paperDark,
        border: `1px solid ${P.border}`,
        boxShadow: `0 2px 8px ${P.shadow}`,
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-5 py-5 transition-all text-left"
        style={{ background: isOpen ? P.deepTea : 'transparent', color: isOpen ? P.paper : P.ink }}
      >
        <div
          style={{
            background: isOpen ? P.honey : P.cream,
            color: P.deepTea,
            width: 56,
            height: 56,
            fontFamily: 'Fraunces, serif',
            fontSize: 22,
            fontWeight: 500,
            border: `1px solid ${isOpen ? P.honey : P.border}`,
          }}
          className="rounded-full flex flex-col items-center justify-center shrink-0 leading-none"
        >
          <div style={{ fontSize: 9, letterSpacing: 1.5, opacity: 0.7, marginBottom: 1 }}>DAY</div>
          <div>{dayIndex + 1}</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2" style={{ fontFamily: 'Spectral, serif', fontSize: 12, letterSpacing: 1.5, opacity: 0.7 }}>
            <span className="uppercase">{day.dayOfWeek}</span>
            <span>·</span>
            <span>{day.date}</span>
          </div>
          <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500, lineHeight: 1.15, marginTop: 2 }}>
            {day.theme}
          </h3>
          <p
            style={{
              fontFamily: 'Spectral, serif',
              fontStyle: 'italic',
              fontSize: 13,
              opacity: 0.85,
              marginTop: 2,
              lineHeight: 1.45,
            }}
            className="line-clamp-2"
          >
            {day.vibe}
          </p>
        </div>
        <div className="shrink-0">
          <ChevronDown
            size={20}
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s',
            }}
          />
        </div>
      </button>

      {isOpen && (
        <div className="px-5 py-6 space-y-6">
          {['morning', 'afternoon', 'night'].map((slotKey) => {
            const slot = SLOT_META[slotKey];
            const options = day.slots[slotKey];
            return (
              <div key={slotKey}>
                <div className="flex items-center gap-2 mb-3">
                  <div
                    style={{
                      background: slot.tint,
                      color: P.deepTea,
                      padding: 6,
                      borderRadius: 6,
                    }}
                  >
                    <SlotIcon k={slotKey} />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Fraunces, serif', fontSize: 17, fontWeight: 500, color: P.ink }}>
                      {slot.label}
                    </div>
                    <div style={{ fontFamily: 'Spectral, serif', fontSize: 11, color: P.midTea, letterSpacing: 1 }}>
                      {slot.time}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {options.map((option) => {
                    const targetKey = `${base}:${day.id}:${slotKey}:${option.id}`;
                    const voterIds = Object.keys(votes[targetKey] || {});
                    const voters = voterIds.map((id) => profiles.find((p) => p.id === id)).filter(Boolean);
                    const optComments = comments.filter((c) => c.target === targetKey);

                    return (
                      <OptionCard
                        key={option.id}
                        option={option}
                        slotKey={slotKey}
                        dayId={day.id}
                        base={base}
                        voters={voters}
                        allProfiles={profiles}
                        currentUserId={currentUserId}
                        onVote={() => onVote(targetKey, slotKey, day.id)}
                        comments={optComments}
                        onAddComment={(text) => onAddComment(targetKey, text)}
                        slotTint={slot.tint}
                        totalProfiles={profiles.length}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SmallOption({ option, base, count, totalProfiles, comments = [] }) {
  const [showInfo, setShowInfo] = useState(false);
  const info = getInfoForOption(option, base);
  const IconComp = ICONS[option.icon] || Star;

  return (
    <div className="rounded p-3" style={{ background: P.paper, border: `1px solid ${P.borderSoft}` }}>
      <div className="flex items-start gap-3">
        <div className="shrink-0 rounded" style={{ background: P.paperDark, color: P.deepTea, padding: 7 }}>
          <IconComp size={15} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16, color: P.ink, lineHeight: 1.2, flex: 1 }}>
              {option.title}
            </div>
            <button
              onClick={() => setShowInfo(true)}
              className="inline-flex items-center justify-center rounded-full"
              style={{ width: 24, height: 24, border: `1px solid ${P.border}`, color: P.deepTea, background: P.paperDark }}
              title="More info, image and map pin"
              aria-label={`More info about ${option.title}`}
            >
              <Info size={13} />
            </button>
          </div>
          <div style={{ fontFamily: 'Spectral, serif', fontSize: 12, color: P.midTea, marginTop: 3 }}>
            {option.dur}
            {typeof count === 'number' && (
              <span> · {count} vote{count === 1 ? '' : 's'} · {votePercent(count, totalProfiles)}%</span>
            )}
          </div>
          <p style={{ fontFamily: 'Spectral, serif', fontSize: 13, color: P.midTea, lineHeight: 1.45, marginTop: 5 }}>
            {option.sub}
          </p>
          {comments.length > 0 && (
            <div className="mt-2 space-y-1">
              {comments.map((comment) => (
                <div key={comment.id} style={{ fontFamily: 'Spectral, serif', fontSize: 12, color: P.rust, fontStyle: 'italic' }}>
                  “{comment.text}”
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(26, 31, 26, 0.55)' }} onClick={() => setShowInfo(false)}>
          <div className="w-full max-w-lg rounded-lg overflow-hidden" style={{ background: P.paper, border: `1px solid ${P.border}`, boxShadow: `0 24px 80px ${P.shadowStrong}` }} onClick={(e) => e.stopPropagation()}>
            <img src={info.image} alt={option.title} className="w-full" style={{ height: 210, objectFit: 'cover' }} />
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 500, color: P.ink }}>{option.title}</h3>
                <button onClick={() => setShowInfo(false)} className="px-2" style={{ color: P.midTea, fontSize: 20 }}>x</button>
              </div>
              <p style={{ fontFamily: 'Spectral, serif', fontSize: 14, color: P.midTea, lineHeight: 1.55, marginTop: 6 }}>
                {option.sub}
              </p>
              <a href={info.mapUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded" style={{ background: P.deepTea, color: P.paper, fontFamily: 'Spectral, serif', fontSize: 14 }}>
                <MapPin size={15} />
                Open location pin
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ItineraryView({ title, eyebrow, description, bases, votes, comments, profiles, gameVotes, mode = 'final', selectedProfileId, onSelectedProfileChange }) {
  const selectedProfile = profiles.find((profile) => profile.id === selectedProfileId);

  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div style={{ fontFamily: 'Spectral, serif', fontSize: 11, letterSpacing: 3, color: P.midTea }} className="uppercase">
            {eyebrow}
          </div>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 400, lineHeight: 1.1 }}>
            {title}
          </h2>
          <p style={{ fontFamily: 'Spectral, serif', fontSize: 14, color: P.midTea, fontStyle: 'italic', marginTop: 2 }}>
            {description}
          </p>
        </div>
        {mode === 'personal' && (
          <select
            value={selectedProfileId || ''}
            onChange={(e) => onSelectedProfileChange(e.target.value)}
            className="px-3 py-2 rounded"
            style={{ background: P.paperDark, border: `1px solid ${P.border}`, color: P.ink, fontFamily: 'Spectral, serif' }}
          >
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {mode === 'final' && (
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => downloadFinalPdf({ bases, votes, comments, profiles, gameVotes })} className="inline-flex items-center gap-2 px-4 py-2 rounded" style={{ background: P.deepTea, color: P.paper, fontFamily: 'Spectral, serif', fontSize: 14 }}>
            <Download size={15} />
            Download PDF
          </button>
          <button onClick={() => downloadFinalCalendar({ bases, votes, comments, profiles })} className="inline-flex items-center gap-2 px-4 py-2 rounded" style={{ background: P.paperDark, color: P.deepTea, border: `1px solid ${P.border}`, fontFamily: 'Spectral, serif', fontSize: 14 }}>
            <CalendarDays size={15} />
            Download calendar file
          </button>
        </div>
      )}

      {bases.map((base) => (
        <div key={base} className="rounded-lg overflow-hidden" style={{ background: P.paperDark, border: `1px solid ${P.border}`, boxShadow: `0 2px 8px ${P.shadow}` }}>
          <div className="px-5 py-4" style={{ background: P.deepTea, color: P.paper }}>
            <div style={{ fontFamily: 'Spectral, serif', fontSize: 11, letterSpacing: 2, opacity: 0.75 }} className="uppercase">
              {mode === 'final' ? 'Live winner' : selectedProfile ? `${selectedProfile.name}'s choices` : 'Personal choices'}
            </div>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 500 }}>
              {BASE_LABELS[base]} Plan
            </h3>
          </div>
          <div className="p-5 space-y-5">
            {getDaysForBase(base).map((day, idx) => (
              <div key={day.id} className="rounded p-4" style={{ background: P.paper, border: `1px solid ${P.borderSoft}` }}>
                <div className="mb-3">
                  <div style={{ fontFamily: 'Spectral, serif', fontSize: 11, letterSpacing: 1.5, color: P.midTea }} className="uppercase">
                    Day {idx + 1} · {formatDayDate(day)}
                  </div>
                  <h4 style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 500, color: P.ink }}>
                    {day.theme}
                  </h4>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  {['morning', 'afternoon', 'night'].map((slotKey) => {
                    const selected = mode === 'personal'
                      ? getPersonalOptions(day, base, slotKey, votes, comments, selectedProfileId)
                      : getWinningOptions(day, base, slotKey, votes);
                    return (
                      <div key={slotKey}>
                        <div className="mb-2" style={{ fontFamily: 'Spectral, serif', fontSize: 12, color: P.midTea, letterSpacing: 1.2, textTransform: 'uppercase' }}>
                          {SLOT_META[slotKey].label}
                        </div>
                        <div className="space-y-2">
                          {selected.map((option) => {
                            const target = getTargetKey(base, day.id, slotKey, option.id);
                            const count = getOptionVotes(votes, base, day.id, slotKey, option.id).length;
                            const personalComments = mode === 'personal'
                              ? comments.filter((comment) => comment.userId === selectedProfileId && comment.target === target)
                              : [];
                            return (
                              <SmallOption
                                key={option.id}
                                option={option}
                                base={base}
                                count={mode === 'final' ? count : undefined}
                                totalProfiles={profiles.length}
                                comments={personalComments}
                              />
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

/* ----------------------------------------------------------------
   VILLA GAMES SECTION
---------------------------------------------------------------- */
function VillaGames({ profiles, gameVotes, currentUserId, onVote }) {
  return (
    <section
      className="rounded-lg overflow-hidden"
      style={{
        background: P.deepTea,
        color: P.paper,
        boxShadow: `0 8px 30px ${P.shadowStrong}`,
      }}
    >
      <div className="px-6 sm:px-8 py-6 sm:py-8">
        <div className="flex items-center gap-2 mb-1" style={{ fontFamily: 'Spectral, serif', fontSize: 11, letterSpacing: 3, opacity: 0.7 }}>
          <Gamepad2 size={14} />
          <span className="uppercase">For the villa nights</span>
        </div>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 30, fontWeight: 400, lineHeight: 1.1, marginBottom: 4 }}>
          Pack-list of games
        </h2>
        <p style={{ fontFamily: 'Spectral, serif', fontStyle: 'italic', opacity: 0.85, fontSize: 14, marginBottom: 24, lineHeight: 1.55 }}>
          Vote up the games you want to actually play. Whoever votes most for a game is on packing duty for it.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {VILLA_GAMES.map((g) => {
            const voterIds = Object.keys(gameVotes[g.id] || {});
            const voters = voterIds.map((id) => profiles.find((p) => p.id === id)).filter(Boolean);
            const isMyVote = voterIds.includes(currentUserId);
            return (
              <div
                key={g.id}
                className="rounded-lg p-4"
                style={{
                  background: 'rgba(244, 236, 216, 0.08)',
                  border: `1px solid rgba(244, 236, 216, 0.18)`,
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 style={{ fontFamily: 'Fraunces, serif', fontSize: 17, fontWeight: 500, color: P.paper }}>
                    {g.name}
                  </h4>
                  <button
                    onClick={() => onVote(g.id)}
                    className="px-2 py-1 rounded shrink-0"
                    style={{
                      background: isMyVote ? P.honey : 'transparent',
                      color: isMyVote ? P.deepTea : P.paper,
                      border: `1px solid ${isMyVote ? P.honey : 'rgba(244, 236, 216, 0.3)'}`,
                      fontFamily: 'Spectral, serif',
                      fontSize: 11,
                      letterSpacing: 0.5,
                    }}
                  >
                    {isMyVote ? '✓' : '+ pick'}
                  </button>
                </div>
                <div style={{ fontFamily: 'Spectral, serif', fontSize: 11, opacity: 0.7, letterSpacing: 0.5, marginBottom: 6 }}>
                  {g.players} players · {g.time} · <em>{g.tag}</em>
                </div>
                <p style={{ fontFamily: 'Spectral, serif', fontSize: 13, opacity: 0.88, lineHeight: 1.5 }}>
                  {g.desc}
                </p>
                {voters.length > 0 && (
                  <div className="mt-3 pt-2 flex items-center gap-2" style={{ borderTop: '1px solid rgba(244, 236, 216, 0.15)' }}>
                    <AvatarStack profiles={voters} size={20} max={5} />
                    <span style={{ fontFamily: 'Spectral, serif', fontSize: 11, opacity: 0.75 }}>
                      {voters.length} want{voters.length === 1 ? 's' : ''} this
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------
   SUMMARY PANEL
---------------------------------------------------------------- */
function SummaryPanel({ open, onClose, profiles, baseVotes, votes, gameVotes, activeBase }) {
  if (!open) return null;
  const days = activeBase === 'kotagiri' ? KOTAGIRI_DAYS : COONOOR_DAYS;

  return (
    <div className="fixed inset-0 z-50 flex" style={{ background: 'rgba(26, 31, 26, 0.5)' }} onClick={onClose}>
      <div
        className="ml-auto h-full overflow-y-auto"
        style={{
          width: '100%',
          maxWidth: 540,
          background: P.paper,
          boxShadow: `-20px 0 60px ${P.shadowStrong}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 px-6 py-4 flex items-center justify-between" style={{ background: P.deepTea, color: P.paper, borderBottom: `1px solid ${P.border}` }}>
          <div>
            <div style={{ fontFamily: 'Spectral, serif', fontSize: 11, letterSpacing: 2, opacity: 0.7 }} className="uppercase">
              The Tally
            </div>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500 }}>
              Who picked what
            </h2>
          </div>
          <button onClick={onClose} style={{ color: P.paper, fontSize: 20 }} className="px-2">✕</button>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Base votes */}
          <div>
            <div style={{ fontFamily: 'Spectral, serif', fontSize: 12, letterSpacing: 2, color: P.midTea }} className="uppercase mb-3">
              Base choice
            </div>
            {['kotagiri', 'coonoor'].map((b) => {
              const voters = profiles.filter((p) => baseVotes[p.id] === b);
              return (
                <div key={b} className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${P.borderSoft}` }}>
                  <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16, color: P.ink, textTransform: 'capitalize' }}>
                    {b}
                  </div>
                  <div className="flex items-center gap-2">
                    <AvatarStack profiles={voters} size={22} max={6} />
                    <span style={{ fontFamily: 'Spectral, serif', fontSize: 12, color: P.midTea }}>
                      {voters.length} · {votePercent(voters.length, profiles.length)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Per-day picks - active base only */}
          <div>
            <div style={{ fontFamily: 'Spectral, serif', fontSize: 12, letterSpacing: 2, color: P.midTea }} className="uppercase mb-3">
              Day-by-day · {activeBase === 'kotagiri' ? 'Kotagiri Plan' : 'Coonoor Plan'}
            </div>
            <div className="space-y-4">
              {days.map((day, idx) => (
                <div key={day.id} style={{ background: P.paperDark, border: `1px solid ${P.border}`, borderRadius: 8 }} className="p-3">
                  <div className="mb-2">
                    <span style={{ fontFamily: 'Spectral, serif', fontSize: 11, letterSpacing: 1.5, color: P.midTea }} className="uppercase">
                      Day {idx + 1} · {day.date}
                    </span>
                    <div style={{ fontFamily: 'Fraunces, serif', fontSize: 15, color: P.ink }}>
                      {day.theme}
                    </div>
                  </div>
                  {['morning', 'afternoon', 'night'].map((slotKey) => (
                    <div key={slotKey} className="py-1.5" style={{ borderTop: `1px dashed ${P.borderSoft}` }}>
                      <div style={{ fontFamily: 'Spectral, serif', fontSize: 11, color: P.midTea, letterSpacing: 1 }} className="uppercase mb-1">
                        {SLOT_META[slotKey].label}
                      </div>
                      {day.slots[slotKey].map((option) => {
                        const targetKey = `${activeBase}:${day.id}:${slotKey}:${option.id}`;
                        const voterIds = Object.keys(votes[targetKey] || {});
                        const voters = voterIds.map((id) => profiles.find((p) => p.id === id)).filter(Boolean);
                        if (voters.length === 0) return null;
                        return (
                          <div key={option.id} className="flex items-start justify-between gap-3 py-1">
                            <div style={{ fontFamily: 'Spectral, serif', fontSize: 13, color: P.ink }}>
                              {option.title}
                              <span style={{ color: P.midTea, marginLeft: 6 }}>
                                {voters.length} · {votePercent(voters.length, profiles.length)}%
                              </span>
                            </div>
                            <AvatarStack profiles={voters} size={20} max={6} />
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Game picks */}
          <div>
            <div style={{ fontFamily: 'Spectral, serif', fontSize: 12, letterSpacing: 2, color: P.midTea }} className="uppercase mb-3">
              Game picks
            </div>
            <div className="space-y-1">
              {VILLA_GAMES.map((g) => {
                const voterIds = Object.keys(gameVotes[g.id] || {});
                const voters = voterIds.map((id) => profiles.find((p) => p.id === id)).filter(Boolean);
                if (voters.length === 0) return null;
                return (
                  <div key={g.id} className="flex items-center justify-between py-1.5" style={{ borderBottom: `1px dashed ${P.borderSoft}` }}>
                    <div style={{ fontFamily: 'Spectral, serif', fontSize: 13, color: P.ink }}>
                      {g.name}
                    </div>
                    <AvatarStack profiles={voters} size={20} max={6} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
   MAIN APP
---------------------------------------------------------------- */
export default function App() {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState([]);
  const [baseVotes, setBaseVotes] = useState({});
  const [votes, setVotes] = useState({});
  const [comments, setComments] = useState([]);
  const [gameVotes, setGameVotes] = useState({});

  const [currentUserId, setCurrentUserId] = useState(null);
  const [activeBase, setActiveBase] = useState('kotagiri');
  const [activeView, setActiveView] = useState('vote');
  const [preferredProfileId, setPreferredProfileId] = useState(null);
  const [openDayIdx, setOpenDayIdx] = useState(0);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const applySharedState = useCallback((next) => {
    setProfiles(next.profiles || []);
    setBaseVotes(next.baseVotes || {});
    setVotes(next.votes || {});
    setComments(next.comments || []);
    setGameVotes(next.gameVotes || {});
    setLoading(false);
  }, []);

  // initial load + polling
  const reload = useCallback(async () => {
    applySharedState(await loadSharedState());
  }, [applySharedState]);

  useEffect(() => {
    reload();
    const events = new EventSource('/api/events');
    events.onmessage = (event) => applySharedState(JSON.parse(event.data));
    events.onerror = () => {
      events.close();
      setTimeout(reload, 3000);
    };

    const fallback = setInterval(reload, 30000);
    return () => {
      events.close();
      clearInterval(fallback);
    };
  }, [reload, applySharedState]);

  useEffect(() => {
    if (!preferredProfileId && currentUserId) {
      setPreferredProfileId(currentUserId);
    }
  }, [preferredProfileId, currentUserId]);

  // create profile
  const addProfile = async (name, age) => {
    const id = newId();
    const color = MEMBER_COLORS[profiles.length % MEMBER_COLORS.length];
    const next = [...profiles, { id, name, age, color }];
    setProfiles(next);
    const saved = await runSharedAction('addProfile', { profile: { id, name, age, color } });
    if (saved) applySharedState(saved);
    setCurrentUserId(id);
  };

  // base vote
  const voteForBase = async (base) => {
    if (!currentUserId) return;
    const next = { ...baseVotes, [currentUserId]: base };
    setBaseVotes(next);
    const saved = await runSharedAction('voteBase', { userId: currentUserId, base });
    if (saved) applySharedState(saved);
  };

  // option vote (single choice per slot per day per base)
  const voteForOption = async (targetKey, slotKey, dayId) => {
    if (!currentUserId) return;
    const next = { ...votes };

    // Remove this user from all other options in the same slot+day+base
    const prefix = targetKey.split(':').slice(0, -1).join(':') + ':';
    for (const key of Object.keys(next)) {
      if (key.startsWith(prefix) && key !== targetKey && next[key]?.[currentUserId]) {
        const { [currentUserId]: _removed, ...rest } = next[key];
        if (Object.keys(rest).length === 0) {
          delete next[key];
        } else {
          next[key] = rest;
        }
      }
    }

    // Toggle current
    const existing = next[targetKey] || {};
    if (existing[currentUserId]) {
      const { [currentUserId]: _removed, ...rest } = existing;
      if (Object.keys(rest).length === 0) {
        delete next[targetKey];
      } else {
        next[targetKey] = rest;
      }
    } else {
      next[targetKey] = { ...existing, [currentUserId]: true };
    }

    setVotes(next);
    const saved = await runSharedAction('voteOption', { userId: currentUserId, targetKey });
    if (saved) applySharedState(saved);
  };

  // game vote (multi-select allowed)
  const voteForGame = async (gameId) => {
    if (!currentUserId) return;
    const next = { ...gameVotes };
    const existing = next[gameId] || {};
    if (existing[currentUserId]) {
      const { [currentUserId]: _removed, ...rest } = existing;
      if (Object.keys(rest).length === 0) {
        delete next[gameId];
      } else {
        next[gameId] = rest;
      }
    } else {
      next[gameId] = { ...existing, [currentUserId]: true };
    }
    setGameVotes(next);
    const saved = await runSharedAction('voteGame', { userId: currentUserId, gameId });
    if (saved) applySharedState(saved);
  };

  // add comment
  const addComment = async (targetKey, text) => {
    if (!currentUserId) return;
    const comment = {
      id: newId(),
      userId: currentUserId,
      target: targetKey,
      text,
      ts: Date.now(),
    };
    const next = [...comments, comment];
    setComments(next);
    const saved = await runSharedAction('addComment', { userId: currentUserId, comment });
    if (saved) applySharedState(saved);
  };

  const switchUser = () => setCurrentUserId(null);

  /* ----- gate: not logged in ----- */
  if (!currentUserId) {
    return (
      <>
        <FontStyles />
        <ProfileGate
          profiles={profiles}
          loading={loading}
          onPick={setCurrentUserId}
          onAdd={addProfile}
        />
      </>
    );
  }

  const me = profiles.find((p) => p.id === currentUserId);
  const days = activeBase === 'kotagiri' ? KOTAGIRI_DAYS : COONOOR_DAYS;
  const finalBases = getWinningBases(baseVotes, profiles);
  const personalBase = preferredProfileId && baseVotes[preferredProfileId] ? baseVotes[preferredProfileId] : activeBase;

  const kotagiriVoters = profiles.filter((p) => baseVotes[p.id] === 'kotagiri');
  const coonoorVoters = profiles.filter((p) => baseVotes[p.id] === 'coonoor');

  return (
    <>
      <FontStyles />
      <div style={{ background: P.paper, minHeight: '100vh', color: P.ink }}>
        {/* HEADER */}
        <header
          style={{
            background: P.deepTea,
            color: P.paper,
            borderBottom: `1px solid ${P.deepTea}`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Topographic motif */}
          <svg
            width="100%"
            height="100%"
            style={{ position: 'absolute', inset: 0, opacity: 0.06, pointerEvents: 'none' }}
            preserveAspectRatio="none"
            viewBox="0 0 1200 300"
          >
            {Array.from({ length: 14 }).map((_, i) => (
              <path
                key={i}
                d={`M0,${30 + i * 22} Q300,${10 + i * 22} 600,${30 + i * 22} T1200,${30 + i * 22}`}
                fill="none"
                stroke={P.paper}
                strokeWidth="1"
              />
            ))}
          </svg>

          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-10 relative">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-3" style={{ fontFamily: 'Spectral, serif', fontSize: 11, letterSpacing: 4, opacity: 0.75 }}>
                  <Mountain size={14} />
                  <span className="uppercase">Nilgiri · 2026</span>
                </div>
                <h1
                  style={{
                    fontFamily: 'Fraunces, serif',
                    fontSize: 'clamp(36px, 6vw, 64px)',
                    fontWeight: 400,
                    lineHeight: 0.95,
                    letterSpacing: -1,
                  }}
                >
                  A family<br />gathering in the hills.
                </h1>
                <p style={{ fontFamily: 'Spectral, serif', fontStyle: 'italic', opacity: 0.85, marginTop: 12, fontSize: 16 }}>
                  Six of us. Five days. Two possible bases. One blue baby in tow.
                </p>
                <div className="mt-4 flex items-center gap-3 flex-wrap" style={{ fontFamily: 'Spectral, serif', fontSize: 13, opacity: 0.9 }}>
                  <span>Jun 20 → Jun 25, 2026</span>
                  <span style={{ opacity: 0.5 }}>·</span>
                  <span>Coimbatore ⇄ Hills</span>
                  <span style={{ opacity: 0.5 }}>·</span>
                  <span>Self-drive · all-veg · mid-range</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setSummaryOpen(true)}
                  className="px-3 py-2 rounded inline-flex items-center gap-2"
                  style={{
                    background: 'rgba(244, 236, 216, 0.12)',
                    color: P.paper,
                    border: `1px solid rgba(244, 236, 216, 0.25)`,
                    fontFamily: 'Spectral, serif',
                    fontSize: 13,
                  }}
                >
                  <Eye size={14} />
                  The Tally
                </button>
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded"
                  style={{
                    background: 'rgba(244, 236, 216, 0.12)',
                    border: `1px solid rgba(244, 236, 216, 0.25)`,
                    fontFamily: 'Spectral, serif',
                    fontSize: 13,
                  }}
                >
                  <Avatar profile={me} size={26} />
                  <span>{me?.name}</span>
                  <button onClick={switchUser} style={{ opacity: 0.7 }} title="Switch user">
                    <LogOut size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-5 sm:px-8 py-10 space-y-12">
          <nav className="flex gap-2 flex-wrap" aria-label="Planner views">
            {[
              ['vote', 'Vote & Discuss'],
              ['final', 'Final Itinerary'],
              ['personal', 'My Preferred Itinerary'],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setActiveView(id)}
                className="px-4 py-2 rounded"
                style={{
                  background: activeView === id ? P.deepTea : P.paperDark,
                  color: activeView === id ? P.paper : P.deepTea,
                  border: `1px solid ${activeView === id ? P.deepTea : P.border}`,
                  fontFamily: 'Spectral, serif',
                  fontSize: 14,
                }}
              >
                {label}
              </button>
            ))}
          </nav>

          {activeView === 'vote' && (
            <>
          {/* BASE DECISION */}
          <section>
            <div className="flex items-end justify-between gap-4 mb-5 flex-wrap">
              <div>
                <div style={{ fontFamily: 'Spectral, serif', fontSize: 11, letterSpacing: 3, color: P.midTea }} className="uppercase">
                  Step 01
                </div>
                <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 400, lineHeight: 1.1 }}>
                  Where do we wake up?
                </h2>
                <p style={{ fontFamily: 'Spectral, serif', fontSize: 14, color: P.midTea, fontStyle: 'italic', marginTop: 2 }}>
                  Pick a base. You can also tap a card to see its plan below.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <BaseCard
                base="kotagiri"
                isActive={activeBase === 'kotagiri'}
                isMyChoice={baseVotes[currentUserId] === 'kotagiri'}
                voters={kotagiriVoters}
                onPick={() => voteForBase('kotagiri')}
                onView={() => setActiveBase('kotagiri')}
                totalProfiles={profiles.length}
              />
              <BaseCard
                base="coonoor"
                isActive={activeBase === 'coonoor'}
                isMyChoice={baseVotes[currentUserId] === 'coonoor'}
                voters={coonoorVoters}
                onPick={() => voteForBase('coonoor')}
                onView={() => setActiveBase('coonoor')}
                totalProfiles={profiles.length}
              />
            </div>
          </section>

          {/* ITINERARY */}
          <section>
            <div className="flex items-end justify-between gap-4 mb-5 flex-wrap">
              <div>
                <div style={{ fontFamily: 'Spectral, serif', fontSize: 11, letterSpacing: 3, color: P.midTea }} className="uppercase">
                  Step 02 · the daily plan
                </div>
                <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 400, lineHeight: 1.1 }}>
                  {activeBase === 'kotagiri' ? 'The Kotagiri plan.' : 'The Coonoor plan.'}
                </h2>
                <p style={{ fontFamily: 'Spectral, serif', fontSize: 14, color: P.midTea, fontStyle: 'italic', marginTop: 2 }}>
                  Two options per slot. Pick the one you&apos;d enjoy more — disagreement is welcome.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOpenDayIdx(null)}
                  style={{
                    fontFamily: 'Spectral, serif',
                    fontSize: 12,
                    color: P.midTea,
                    border: `1px solid ${P.border}`,
                    background: 'transparent',
                  }}
                  className="px-3 py-1.5 rounded inline-flex items-center gap-1"
                >
                  <RotateCcw size={12} /> Collapse all
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {days.map((day, idx) => (
                <DayCard
                  key={day.id}
                  day={day}
                  dayIndex={idx}
                  base={activeBase}
                  isOpen={openDayIdx === idx}
                  onToggle={() => setOpenDayIdx(openDayIdx === idx ? null : idx)}
                  profiles={profiles}
                  votes={votes}
                  currentUserId={currentUserId}
                  onVote={voteForOption}
                  comments={comments}
                  onAddComment={addComment}
                />
              ))}
            </div>

            <SectionDivider />
            <p style={{ fontFamily: 'Spectral, serif', fontStyle: 'italic', fontSize: 13, color: P.midTea, textAlign: 'center' }}>
              Jun 25 — early morning drive back to Coimbatore. No agenda for the road but coffee.
            </p>
          </section>

          {/* VILLA GAMES */}
          <VillaGames
            profiles={profiles}
            gameVotes={gameVotes}
            currentUserId={currentUserId}
            onVote={voteForGame}
          />
            </>
          )}

          {activeView === 'final' && (
            <ItineraryView
              title="Final Itinerary"
              eyebrow="Live itinerary"
              description="This keeps rebuilding from the latest votes. Ties show every tied option; empty slots show all available options."
              bases={finalBases}
              votes={votes}
              comments={comments}
              profiles={profiles}
              gameVotes={gameVotes}
              mode="final"
            />
          )}

          {activeView === 'personal' && (
            <ItineraryView
              title="My Preferred Itinerary"
              eyebrow="Personal lens"
              description="Choose a family member to see their own selected options. If they commented without voting, those commented options are surfaced too."
              bases={[personalBase]}
              votes={votes}
              comments={comments}
              profiles={profiles}
              gameVotes={gameVotes}
              mode="personal"
              selectedProfileId={preferredProfileId || currentUserId}
              onSelectedProfileChange={setPreferredProfileId}
            />
          )}

          {/* FOOTER */}
          <footer className="text-center py-8" style={{ fontFamily: 'Spectral, serif', fontSize: 12, color: P.midTea, fontStyle: 'italic' }}>
            <SectionDivider />
            <p>Made for the family · share this page with anyone joining the trip</p>
            <p style={{ marginTop: 4, opacity: 0.7 }}>Votes update across all your devices every few seconds</p>
          </footer>
        </main>

        <SummaryPanel
          open={summaryOpen}
          onClose={() => setSummaryOpen(false)}
          profiles={profiles}
          baseVotes={baseVotes}
          votes={votes}
          gameVotes={gameVotes}
          activeBase={activeBase}
        />
      </div>
    </>
  );
}

/* ----------------------------------------------------------------
   FONT STYLES
---------------------------------------------------------------- */
function FontStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..600&family=Spectral:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&display=swap');
      * { box-sizing: border-box; }
      body { margin: 0; }
      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      input::placeholder { color: #A89F87; opacity: 1; }
      button { font-family: inherit; cursor: pointer; }
      button:disabled { cursor: not-allowed; }
    `}</style>
  );
}

/**
 * Content for the /platform showcase.
 *
 * HONESTY RULES
 * - Photography is illustrative stock (Pexels). It is never presented as PCCOE.
 * - Timetable, marketplace, community and utility entries shown in device frames
 *   are clearly labelled DEMONSTRATION data, with no real student information.
 * - Swap `IMG` entries for real Campus+ screenshots / PCCOE photography (with
 *   permission) when they're available. Every composition reads from here.
 */

export type Img = { src: string; alt: string; credit: string };

const px = (id: number, file = `pexels-photo-${id}.jpeg`) => `https://images.pexels.com/photos/${id}/${file}`;

/** Build a sized, compressed Pexels URL. */
export function imgUrl(base: string, w: number, h?: number) {
  return `${base}?auto=compress&cs=tinysrgb&w=${w}${h ? `&h=${h}&fit=crop` : ""}`;
}

export const IMG = {
  concreteDawn: { src: px(36460195), alt: "Concrete building with deep morning shadows", credit: "Murun E." },
  concreteGreen: { src: px(34411157), alt: "Concrete architecture softened by greenery", credit: "Emiliano Maglione" },
  concreteFacade: { src: px(29797868), alt: "Geometric concrete facade in raking light", credit: "Darya Sannikova" },
  library: { src: px(35378714), alt: "Library with curved wooden bookshelves", credit: "Blackcurrant Great" },
  libraryAisle: { src: px(10246141), alt: "Row of wooden folding chairs in a bright room", credit: "Mathias Reding" },
  libraryLamp: { src: px(19134921), alt: "Desk lamp glowing beside library shelves", credit: "Muneeb Babar" },
  hall: { src: px(276175), alt: "Rows of wooden seats in an empty hall", credit: "Pixabay" },
  classroomChairs: { src: px(10246141), alt: "Row of wooden folding chairs in a bright room", credit: "Mathias Reding" },
  deskSun: { src: px(18313029), alt: "Sunlight across a desk with an open book", credit: "Beyzaa" },
  notebook: { src: px(5951539), alt: "Glasses resting on an open notebook", credit: "Arina Krasnikova" },
  stairs: { src: px(16698393), alt: "Shaded concrete staircase", credit: "Allen Boguslavsky" },
  // marketplace
  books: { src: px(1333742), alt: "Stack of well-used books", credit: "Suzy Hazelwood" },
  booksBlue: { src: px(32046500), alt: "Pile of books with blue covers", credit: "Marta Branco" },
  booksClose: { src: px(6561514), alt: "Close-up of stacked book spines", credit: "Poppy Thomas Hill" },
  laptopFlat: { src: px(5208786), alt: "Laptop and headphones on a beige surface", credit: "Kaboompics" },
  deskFlat: { src: px(37365432), alt: "Laptop, headphones and notepad from above", credit: "Tina Simakova" },
  cozyDesk: { src: px(28536450), alt: "Notebook, headphones and laptop in soft light", credit: "Glow Club" },
  chair: { src: px(7193654), alt: "Wooden chair beside a plant and stool", credit: "Kaboompics" },
  tableLamp: { src: px(6265942), alt: "Wooden table with a lamp and bookshelves", credit: "Max Vakhtbovych" },
  cabinet: { src: px(12277023), alt: "Minimal wooden cabinet with decor", credit: "dada_design" },
  sweaters: { src: px(14641438), alt: "Folded knitted sweaters in neutral tones", credit: "Nati" },
  sweaterStack: { src: px(13889763), alt: "Vertical stack of knitted sweaters", credit: "Büşra İnce" },
  sweatersWhite: { src: px(30569741), alt: "Folded sweaters on a white background", credit: "Kate L" },
  kitchen: { src: px(5447065), alt: "Kitchen utensils hanging on a tiled wall", credit: "Leeloo The First" },
  kettle: { src: px(36266853), alt: "Kettle and mugs on a kitchen counter", credit: "Nur Tok" },
  teapot: { src: px(9865807), alt: "Ceramic teapot and mug in low light", credit: "Янина Энгвик" },
  // utilities
  bicycle: { src: px(32875738), alt: "Bicycle leaning on a sunlit wall", credit: "Hassan Bouamoud" },
  bicycleStone: { src: px(34476104), alt: "Bicycle against a stone wall", credit: "Yalçın U" },
  bedroom: { src: px(35110643), alt: "Minimal bedroom in natural daylight", credit: "Francesco Ungaro" },
  smallRoom: { src: px(11295825), alt: "Small room with a single bed and desk", credit: "Vidal Balielo Jr." },
  keys: { src: px(14721, "pexels-photo.jpg"), alt: "Keys on a wooden surface", credit: "Ingo Joseph" },
  wallet: { src: px(5930, "wood-top-keys-lock.jpg"), alt: "Wallet and keys on a wooden table", credit: "Karolina Grabowska" },
  corkboard: { src: px(4068289), alt: "Cork board with pinned papers", credit: "cottonbro studio" },
  stickyNotes: { src: px(7430327), alt: "Sticky note being placed on a whiteboard", credit: "cottonbro studio" },
  sketch: { src: px(3850229), alt: "Graphic tablet beside a sketched diagram", credit: "ready made" },
  // community
  guitar: { src: px(5825557), alt: "Classical guitar beside a floor lamp", credit: "Charlotte May" },
  circuit: { src: px(35652379), alt: "Circuit board and tools on a workbench", credit: "Tanha Tamanna Syed" },
  soldering: { src: px(4709378), alt: "Hands soldering a circuit board", credit: "cottonbro studio" },
  camera: { src: px(3953354), alt: "Film camera, rolls and prints on a table", credit: "Viktoria Alipatova" },
  chess: { src: px(12214749), alt: "Chess knight in warm light", credit: "Yusuf Gündüz" },
  stage: { src: px(12092846), alt: "Microphone on a warmly lit stage", credit: "A. S." },
} satisfies Record<string, Img>;

/* ───────────────────────── Navigation ───────────────────────── */
export const NAV = [
  { id: "how", label: "How it works" },
  { id: "academic", label: "Features" },
  { id: "community", label: "Community" },
  { id: "marketplace", label: "Marketplace" },
] as const;

/** Sections that light up a nav item (utilities belong to "Features"). */
export const SECTION_TO_NAV: Record<string, string> = {
  top: "",
  how: "how",
  academic: "academic",
  community: "community",
  marketplace: "marketplace",
  utilities: "academic",
  start: "",
};

/* ───────────────────────── Routes in the Campus+ app ───────────────────────── */
export const ROUTES = {
  app: "/",
  login: "/login",
  home: "/home",
  timetable: "/timetable",
  platform: "/platform",
};

/* ───────────────────────── Timetable (DEMONSTRATION DATA) ───────────────────────── */
export type Slot = {
  start: string;
  end: string;
  subject: string;
  code: string;
  kind: "Lecture" | "Lab" | "Tutorial";
  room: string;
  faculty: string;
  batch?: string;
};

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
export type Day = (typeof DAYS)[number];

type Subject = { name: string; code: string; faculty: string };

const DIVISION_SUBJECTS: Record<string, Subject[]> = {
  "SE-A": [
    { name: "Data Structures", code: "DS", faculty: "Prof. R.K." },
    { name: "Discrete Mathematics", code: "DM", faculty: "Prof. S.P." },
    { name: "Computer Graphics", code: "CG", faculty: "Prof. A.M." },
    { name: "Digital Electronics", code: "DELD", faculty: "Prof. N.J." },
    { name: "OOP with Java", code: "OOP", faculty: "Prof. V.D." },
  ],
  "SE-B": [
    { name: "Discrete Mathematics", code: "DM", faculty: "Prof. K.S." },
    { name: "Data Structures", code: "DS", faculty: "Prof. P.T." },
    { name: "OOP with Java", code: "OOP", faculty: "Prof. M.R." },
    { name: "Computer Graphics", code: "CG", faculty: "Prof. A.M." },
    { name: "Digital Electronics", code: "DELD", faculty: "Prof. H.G." },
  ],
  "TE-A": [
    { name: "Database Systems", code: "DBMS", faculty: "Prof. S.B." },
    { name: "Theory of Computation", code: "TOC", faculty: "Prof. R.N." },
    { name: "Computer Networks", code: "CN", faculty: "Prof. D.K." },
    { name: "Software Engineering", code: "SE", faculty: "Prof. L.V." },
    { name: "Machine Learning", code: "ML", faculty: "Prof. J.A." },
  ],
};

export const DIVISIONS = [
  { id: "SE-A", label: "SE · A", long: "Second Year · Division A" },
  { id: "SE-B", label: "SE · B", long: "Second Year · Division B" },
  { id: "TE-A", label: "TE · A", long: "Third Year · Division A" },
] as const;

const TIMES: Array<[string, string]> = [
  ["09:00", "10:00"],
  ["10:00", "11:00"],
  ["11:15", "12:15"],
  ["12:15", "13:15"],
];

/** Deterministic demo schedule generator (no real timetable data is embedded). */
export function demoSchedule(division: string, day: Day): Slot[] {
  const subs = DIVISION_SUBJECTS[division];
  const d = DAYS.indexOf(day);
  const seed = division.charCodeAt(0) + division.charCodeAt(3);
  const rooms = ["A-204", "A-206", "B-112", "B-114", "C-301"];
  if (day === "Sat") {
    return [
      { start: "09:00", end: "11:00", subject: subs[(seed + 1) % 5].name, code: subs[(seed + 1) % 5].code, kind: "Tutorial", room: "B-112", faculty: subs[(seed + 1) % 5].faculty },
    ];
  }
  const slots: Slot[] = TIMES.map(([start, end], i) => {
    const s = subs[(i + d * 2 + seed) % subs.length];
    return { start, end, subject: s.name, code: s.code, kind: "Lecture", room: rooms[(i + d + seed) % rooms.length], faculty: s.faculty };
  });
  const lab = subs[(d + seed + 3) % subs.length];
  slots.push({
    start: "14:00",
    end: "16:00",
    subject: `${lab.name} Lab`,
    code: lab.code,
    kind: "Lab",
    room: `Lab ${((d + seed) % 4) + 1}`,
    faculty: lab.faculty,
    batch: ["B1", "B2", "B3"][(d + seed) % 3],
  });
  return slots;
}

/* ───────────────────────── Community (DEMONSTRATION DATA) ───────────────────────── */
export type CommunityStep = {
  key: "clubs" | "communities" | "discussions" | "events";
  title: string;
  serif: string;
  body: string;
  photo: Img;
};

export const COMMUNITY_STEPS: CommunityStep[] = [
  {
    key: "clubs",
    title: "Clubs",
    serif: "that meet",
    body: "Browse student clubs, see what each one is about, and follow the ones you want to hear from.",
    photo: IMG.guitar,
  },
  {
    key: "communities",
    title: "Communities",
    serif: "by interest",
    body: "Open spaces for a branch, a hobby or a year group. Join in, share something, or just read along.",
    photo: IMG.circuit,
  },
  {
    key: "discussions",
    title: "Discussions",
    serif: "worth having",
    body: "Posts and threads where you can ask a question, answer one, or keep a useful conversation going.",
    photo: IMG.chess,
  },
  {
    key: "events",
    title: "Events",
    serif: "around campus",
    body: "Talks, workshops and fests in one feed, with the time, the venue and who's organising.",
    photo: IMG.stage,
  },
];

/* ───────────────────────── Marketplace (SAMPLE IMAGERY) ───────────────────────── */
export type MarketCategory = {
  id: string;
  title: string;
  serif: string;
  blurb: string;
  examples: string[];
  backdrop: Img;
  stack: [Img, Img];
};

export const MARKET: MarketCategory[] = [
  {
    id: "books",
    title: "Books",
    serif: "& notes",
    blurb: "Last semester's reference books, handed on to the people who need them now.",
    examples: ["Reference texts", "Lab manuals", "Exam guides"],
    backdrop: IMG.books,
    stack: [IMG.booksBlue, IMG.booksClose],
  },
  {
    id: "electronics",
    title: "Electronics",
    serif: "& gear",
    blurb: "Calculators, headphones and accessories from students in your year.",
    examples: ["Calculators", "Headphones", "Accessories"],
    backdrop: IMG.laptopFlat,
    stack: [IMG.deskFlat, IMG.cozyDesk],
  },
  {
    id: "furniture",
    title: "Furniture",
    serif: "for rooms",
    blurb: "Chairs, tables and shelves, usually from students who are moving out.",
    examples: ["Study chairs", "Tables", "Shelving"],
    backdrop: IMG.tableLamp,
    stack: [IMG.chair, IMG.cabinet],
  },
  {
    id: "clothing",
    title: "Clothing",
    serif: "pre-loved",
    blurb: "Jackets and clothes that someone else can still get plenty of use from.",
    examples: ["Jackets", "Formals", "Event wear"],
    backdrop: IMG.sweaters,
    stack: [IMG.sweaterStack, IMG.sweatersWhite],
  },
  {
    id: "household",
    title: "Household",
    serif: "essentials",
    blurb: "Kettles, kitchenware and other everyday things for a hostel room or a shared flat.",
    examples: ["Kitchenware", "Kettles", "Storage"],
    backdrop: IMG.kitchen,
    stack: [IMG.kettle, IMG.teapot],
  },
];

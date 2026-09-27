/* QLEX.RUN — site content. Experiments and notes are still placeholders; the operator block is real
 */
window.QLEX = {
  site: {
    name: 'QLEX',
    domain: 'qlex.run',
    tagline: 'Experimental Computing',
    status: 'ONLINE',
    model: 'MODEL 1976 · SER. Nº 0014',
  },
  nav: [
    { n: '01', label: 'Experiments', href: '#experiments' },
    { n: '02', label: 'Field Notes', href: '#notes' },
    { n: '03', label: 'Operator', href: '#operator' },
    { n: '04', label: 'About', href: '#about' },
  ],
  hero: {
    title: 'QLEX',
    sub: 'Personal computing laboratory',
    lead: 'A small corner of the internet where I put the things I make.',
    alt: 'I build things. Some are useful. Most are experiments.',
    cta1: 'RUN EXPERIMENT',
    cta2: 'READ NOTES',
  },
  experiments: [
    { n: '014', name: 'Draw Six', desc: 'A small tool for studying opening hands in Altered.', status: 'ACTIVE', type: 'Web application', stack: ['Laravel', 'Inertia', 'Vue', 'D3'], year: 2026 },
    { n: '013', name: 'Mana Machine', desc: 'A pocket calculator for mana curves that nobody asked for.', status: 'ACTIVE', type: 'Tool', stack: ['Vue', 'TypeScript'], year: 2026 },
    { n: '012', name: 'Tiny Orbit', desc: 'A 2 kB gravity toy. Click to add a planet, watch it go wrong.', status: 'DORMANT', type: 'Game', stack: ['Canvas', 'JavaScript'], year: 2025 },
    { n: '011', name: 'Stripe Generator', desc: 'Generates 1970s stripe patterns from a seed. Used on this very site.', status: 'STABLE', type: 'CSS experiment', stack: ['CSS', 'SVG'], year: 2025 },
    { n: '010', name: 'Deck Lab', desc: 'Deck-building sandbox with probability tables and bad advice.', status: 'ARCHIVED', type: 'Web application', stack: ['Laravel', 'Vue'], year: 2024 },
    { n: '009', name: 'Clockwork', desc: 'A cron expression explainer that talks back.', status: 'STABLE', type: 'Tool', stack: ['PHP'], year: 2024 },
  ],
  notes: [
    { n: '027', date: '2026-09-26', title: 'Why I keep rebuilding the same stupid side project', cat: 'THOUGHTS', mins: 6 },
    { n: '026', date: '2026-09-18', title: 'Things I learned running Laravel queues at scale', cat: 'CODE', mins: 9 },
    { n: '025', date: '2026-09-04', title: 'A completely unnecessary experiment with PixiJS filters', cat: 'DESIGN', mins: 4 },
    { n: '024', date: '2026-08-21', title: 'Opening hands, hypergeometric distributions and other lies', cat: 'GAMES', mins: 11 },
    { n: '023', date: '2026-08-02', title: 'Notes on the 1976 Sol-20 and why walnut matters', cat: 'MISC', mins: 5 },
  ],
  operator: {
    name: 'Alexandre Wavelet',
    role: 'Senior Backend Developer',
    location: 'Lille, France',
    summary: 'Backend developer who ends up doing the lead work: architecture, reviews, mentoring, and lately the agentic-AI tooling.',
    status: 'OPERATIONAL · OPEN TO STRANGE PROJECTS',
    current: { company: 'GlobalExam', role: 'Senior Backend Developer', period: '2021 — PRESENT' },
    history: [
      { company: 'AssessFirst', role: 'Lead Developer', period: '2019 — 2021' },
      { company: 'CareerBuilder', role: 'Software Engineer', period: '2014 — 2019' },
    ],
    education: [
      { school: 'IUT de Calais', degree: 'Licence pro RSC, option DII', period: '2013 — 2014' },
      { school: 'Lycée Jean Bart, Dunkerque', degree: 'BTS SIO, option SLAM', period: '2011 — 2013' },
    ],
    modes: {
      operating: ['Tech lead in practice', 'Mentoring juniors', 'Code-review culture', 'Working with product owners', 'Technical training (FR & US)'],
      architecture: ['Legacy migrations (Zend 2 → Laravel)', 'Modular monoliths & clean boundaries', 'Queues & background jobs', 'API design & third-party integrations', 'Testing strategy'],
      ai: ['Claude Code workflows', 'MCP servers & tool design', 'Multi-agent orchestration', 'Skills & prompt engineering', 'Dev environment tooling (Omarchy, Hyprland)'],
    },
    stack: {
      primary: ['PHP', 'Laravel', 'Symfony'],
      secondary: ['Vue', 'MySQL', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'AWS'],
      exploring: ['PixiJS', 'Rust', 'WebGPU'],
    },
    /* alias kept while the pages still read `equipment` */
    equipment: {
      primary: ['PHP', 'Laravel', 'Symfony'],
      secondary: ['Vue', 'PostgreSQL', 'Redis'],
      exploring: ['PixiJS', 'Rust', 'WebGPU'],
    },
  },
  about: [
    'QLEX is a small corner of the internet where I put things I have made.',
    'Imagine a tiny computing laboratory founded in 1977 that somehow kept running until today. The equipment changed. The habit of building slightly unnecessary things did not.',
    'Nobody knows what the Q stands for. This is intentional.',
  ],
  footer: {
    line: 'PERSONAL COMPUTING / EXPERIMENTAL SOFTWARE',
    links: [
      { label: 'GITHUB', href: '#' },
      { label: 'EMAIL', href: '#' },
      { label: 'RSS', href: '#' },
    ],
    status: 'SYSTEM STATUS: OPERATIONAL',
    copy: '© 2026 QLEX',
  },
  index: [
    { n: '01', label: 'HOME' },
    { n: '02', label: 'EXPERIMENTS' },
    { n: '03', label: 'FIELD NOTES' },
    { n: '04', label: 'OPERATOR' },
    { n: '05', label: 'ARCHIVE' },
  ],
};

/* Small helpers shared by mockups */
window.QLEX.fmtDate = function (iso, style) {
  const [y, m, d] = iso.split('-');
  if (style === 'dots') return `${d}.${m}.${y.slice(2)}`;
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return `${d} ${months[+m - 1]} ${y}`;
};

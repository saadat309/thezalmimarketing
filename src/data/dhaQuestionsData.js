export const DHA_CATEGORIES = [
  { id: "top", label: "Top Questions", icon: "Sparkles" },
  { id: "investment", label: "Investment", icon: "TrendingUp" },
  { id: "budget", label: "Budget", icon: "Wallet" },
  { id: "phases", label: "DHA Phases", icon: "MapPin" },
  { id: "buying", label: "Buying", icon: "Home" },
  { id: "selling", label: "Selling", icon: "Tag" },
  { id: "overseas", label: "Overseas Pakistanis", icon: "Globe" },
  { id: "personal", label: "Personal Use", icon: "Users" },
];

export const HOOK_ROTATING_QUESTIONS = [
  "Is DHA Lahore still worth investing in?",
  "Which phase should I choose?",
  "What can I buy with my budget?",
  "Should I buy a plot or a house?",
  "Am I paying too much?",
  "What are the risks?"
];

export const DHA_QUESTIONS = [
  // INVESTMENT
  {
    id: "dha-investment-worth",
    category: "investment",
    isTop: true,
    question: "Is DHA Lahore still a good investment?",
    shortLabel: "Is DHA still worth investing in?",
    answer: "DHA Lahore remains one of Pakistan's premier real estate markets due to its master planning, secure title transfers, robust infrastructure, and high liquidity. While short-term market fluctuations depend on macroeconomic conditions, long-term investors historically benefit from steady appreciation, especially in developing phases and commercial sectors. However, returns vary significantly based on location, plot category (corner, park-facing, main boulevard), and holding capacity.",
    followUps: ["dha-buy-now-or-wait", "dha-best-phase-investment", "dha-plot-vs-house", "dha-risks-investing"]
  },
  {
    id: "dha-buy-now-or-wait",
    category: "investment",
    isTop: true,
    question: "Should I invest now or wait?",
    shortLabel: "Should I invest now or wait?",
    answer: "Timing the real estate market depends on your liquidity and investment horizon. Waiting can sometimes mean missing out on undervalued properties or lower entry prices before infrastructure milestones (such as ring road connections or commercial launches). On the other hand, buying during market consolidation allows for careful selection without panic bidding. Speak with our experts to review current market sentiment and active listings.",
    followUps: ["dha-investment-worth", "dha-best-phase-investment", "dha-holding-period"]
  },
  {
    id: "dha-best-phase-investment",
    category: "investment",
    isTop: true,
    question: "Which DHA phase has the best investment potential?",
    shortLabel: "Best phase for investment?",
    answer: "Investment potential differs by phase characteristics: Established phases (like Phase 5 and Phase 6) offer high rental yields and stable liquidity. Emerging or expanding phases (like Phase 9 Town, Phase 11 Rahbar, or newer blocks of Phase 8 and Phase 12/Multan Road sectors) offer lower entry thresholds with higher capital appreciation potential as infrastructure matures.",
    followUps: ["dha-phase-investment", "dha-phase-longterm", "dha-budget-1cr"]
  },
  {
    id: "dha-plot-vs-house",
    category: "investment",
    isTop: true,
    question: "Plot or house — which is better for investment?",
    shortLabel: "Plot or house for investment?",
    answer: "Plots generally require lower maintenance, have simpler transfer procedures, and offer flexible exit strategies without tenant management hassles. Constructed houses, however, can generate immediate rental income and appeal to end-users looking for move-in readiness. For pure capital growth with minimal upkeep, plots in developing phases are popular; for cash flow, ready homes in populated phases excel.",
    followUps: ["dha-investment-worth", "dha-plot-or-house", "dha-ready-to-move"]
  },
  {
    id: "dha-easiest-to-sell",
    category: "investment",
    question: "What type of property is easiest to sell later?",
    shortLabel: "What property sells easiest?",
    answer: "Standard residential plots (5 Marla, 10 Marla, and 1 Kanal) in possession-announced, well-connected blocks enjoy the highest market liquidity. Non-category, non-controversial files and commercial plots on main boulevards also trade swiftly when priced competitively according to prevailing market rates.",
    followUps: ["dha-investment-worth", "dha-ease-of-selling", "dha-resale-value-factors"]
  },
  {
    id: "dha-what-to-look-for",
    category: "investment",
    question: "What should I look for before investing?",
    shortLabel: "What to look for before investing?",
    answer: "Key factors include: possession status (on-ground reality vs. paper allocation), litigation-free title history verified through DHA records, proximity to commercial hubs and main access roads (like Ring Road or Bedian/Ferozepur links), developer reputation, and current development pace in the surrounding blocks.",
    followUps: ["dha-documents-verify", "dha-risks-investing", "dha-fair-pricing"]
  },
  {
    id: "dha-risks-investing",
    category: "investment",
    isTop: true,
    question: "What are the biggest risks when investing in DHA?",
    shortLabel: "What are the investment risks?",
    answer: "Common risks include buying non-verified files, underestimating holding costs (such as non-utilization fees or development charges), selecting remote unpaved blocks with delayed infrastructure, and market liquidity mismatches if you need emergency cash out. Thorough due diligence through authorized real estate consultants like The Zalmi Marketing mitigates these risks.",
    followUps: ["dha-documents-verify", "dha-investment-worth", "dha-buying-mistakes"]
  },
  {
    id: "dha-holding-period",
    category: "investment",
    question: "How long should I plan to hold the property?",
    shortLabel: "Ideal property holding period?",
    answer: "Real estate in master-planned communities like DHA is ideally viewed as a medium to long-term commitment (3 to 5+ years). This horizon allows you to ride past short-term market cycles, benefit from civic infrastructure completions, and maximize capital appreciation.",
    followUps: ["dha-investment-worth", "dha-buy-now-or-wait"]
  },

  // BUDGET
  {
    id: "dha-budget-50l",
    category: "budget",
    isTop: true,
    question: "What can I buy in DHA Lahore with 50 lakh?",
    shortLabel: "What to buy with 50 Lakh?",
    answer: "With a budget around 50 lakh PKR, your options typically include files or fractional investment opportunities in upcoming/newer phases or files of developing sectors (subject to current market valuations and down payment structures). Direct developed residential plots usually require higher capital.",
    followUps: ["dha-budget-1cr", "dha-limited-budget", "dha-best-phase-investment"]
  },
  {
    id: "dha-budget-1cr",
    category: "budget",
    isTop: true,
    question: "What can I buy with 1 crore?",
    shortLabel: "What to buy with 1 Crore?",
    answer: "A 1 crore PKR budget opens up options for 5 Marla plots in developing sectors/phases, various DHA file allocations (such as Phase 9 Prism, Phase 7, or Quaid-e-Azam Town / Lahore Directorate files), or down payments on larger properties with installment plans. Availability fluctuates with market dynamics.",
    followUps: ["dha-budget-50l", "dha-budget-2cr", "dha-phase-investment"]
  },
  {
    id: "dha-budget-2cr",
    category: "budget",
    question: "What can I buy with 2 crore?",
    shortLabel: "What to buy with 2 Crore?",
    answer: "A 2 crore PKR budget provides strong purchasing power for developed 5 Marla plots in prime phases (Phase 5, 6, 8), 10 Marla plots in developing or semi-developed blocks, or smaller apartments/commercial options depending on current market offerings.",
    followUps: ["dha-budget-1cr", "dha-phase-living", "dha-plot-or-house"]
  },
  {
    id: "dha-limited-budget",
    category: "budget",
    question: "What is the best property for a limited budget?",
    shortLabel: "Best property for limited budget?",
    answer: "For limited budgets, focus on verified files or smaller plot sizes (like 5 Marla) in well-planned phases with steady development rather than speculative remote plots. Diversification and verified title safety should take priority over chasing hyped plots.",
    followUps: ["dha-budget-50l", "dha-budget-1cr", "dha-buying-mistakes"]
  },
  {
    id: "dha-stretch-budget",
    category: "budget",
    question: "Should I stretch my budget for a better location?",
    shortLabel: "Should I stretch my budget?",
    answer: "Stretching your budget for a superior location (e.g., closer to main boulevards, commercial squares, or fully populated phases) is generally advisable if your cash flow permits. Prime locations experience faster appreciation, higher rental demand, and superior liquidity during market uptturns.",
    followUps: ["dha-investment-worth", "dha-phase-living", "dha-fair-pricing"]
  },

  // DHA PHASES
  {
    id: "dha-phase-living",
    category: "phases",
    isTop: true,
    question: "Which DHA phase is best for living?",
    shortLabel: "Which phase is best for living?",
    answer: "Phases 5, 6, and 8 are widely considered among the best for family living due to established commercial markets, elite schools, parks, Jamia mosques, 24/7 security, and high population density. Phase 5 and 6 offer mature community vibes, while Phase 8 provides proximity to the airport and wide boulevards.",
    followUps: ["dha-family-living", "dha-phase-difference", "dha-accessibility-amenities"]
  },
  {
    id: "dha-phase-investment",
    category: "phases",
    question: "Which phase is better for investment?",
    shortLabel: "Which phase for investment?",
    answer: "Phases with ongoing infrastructure expansion—such as Phase 9 Prism, newer blocks of Phase 8, and Phase 12 (EME) or peripheral extensions—often attract investors seeking capital growth as development milestones are achieved and occupancy increases.",
    followUps: ["dha-investment-worth", "dha-best-phase-investment", "dha-phase-longterm"]
  },
  {
    id: "dha-phase-difference",
    category: "phases",
    question: "What's the difference between DHA phases?",
    shortLabel: "Difference between DHA phases?",
    answer: "Phases differ by age, location relative to Lahore's center, development stage, plot size availability, commercial density, and price per marla. Older phases (Phase 1–4) are fully built out with central locations; intermediate phases (Phase 5–6) are prime and vibrant; newer phases (Phase 7–9+) offer broader layouts and future growth runway.",
    followUps: ["dha-phase-living", "dha-phase-developed", "dha-phase-future-growth"]
  },
  {
    id: "dha-phase-developed",
    category: "phases",
    question: "Which phases are more developed?",
    shortLabel: "Which phases are most developed?",
    answer: "Phases 1 through 6 are fully developed with near 100% possession, bustling commercial zones, gas/electricity infrastructure, and thriving communities. Portions of Phase 7, 8, and 9 are also heavily populated and active.",
    followUps: ["dha-phase-living", "dha-ready-to-move"]
  },
  {
    id: "dha-phase-longterm",
    category: "phases",
    question: "Which phase suits a long-term investor?",
    shortLabel: "Phase for long-term investors?",
    answer: "Long-term investors often look at large-scale master projects like Phase 9 Prism or developing sectors where land consolidation and future civic linkages will unlock substantial value over a 5 to 7 year horizon.",
    followUps: ["dha-holding-period", "dha-best-phase-investment"]
  },
  {
    id: "dha-phase-future-growth",
    category: "phases",
    question: "Where should I invest if I want future growth?",
    shortLabel: "Where is future growth expected?",
    answer: "Growth is typically concentrated around upcoming Ring Road interchanges, major arterial road expansions, and sectors transitioning from ballot files to on-ground possession with active construction. Consult our team for current on-ground status updates.",
    followUps: ["dha-investment-worth", "dha-best-phase-investment"]
  },

  // BUYING
  {
    id: "dha-plot-or-house",
    category: "buying",
    isTop: true,
    question: "Should I buy a plot or constructed house?",
    shortLabel: "Plot or constructed house?",
    answer: "Buying a plot gives you the freedom to design and construct according to your exact taste and budget over time, often yielding higher percentage gains on raw land in developing areas. Buying a constructed house eliminates construction hassles, contractor delays, and material price inflation, letting you move in or rent out immediately.",
    followUps: ["dha-ready-to-move", "dha-buy-or-build-house", "dha-plot-vs-house"]
  },
  {
    id: "dha-ready-to-move",
    category: "buying",
    question: "Should I buy ready-to-move property?",
    shortLabel: "Should I buy ready-to-move?",
    answer: "Ready-to-move properties are ideal for end-users who want to avoid the stress of building and want immediate residence or rental yields. Ensure a thorough structural and waterproofing inspection is conducted before finalizing.",
    followUps: ["dha-plot-or-house", "dha-buy-or-build-house"]
  },
  {
    id: "dha-check-before-buying",
    category: "buying",
    question: "What should I check before buying?",
    shortLabel: "What to check before buying?",
    answer: "Key checks include: DHA ownership verification, clearance of all utility bills and development charges, non-dues certificate, physical demarcation of plot boundaries on ground, and ensuring the seller is the verified owner or holds a legal, registered power of attorney.",
    followUps: ["dha-documents-verify", "dha-fair-pricing", "dha-buying-mistakes"]
  },
  {
    id: "dha-fair-pricing",
    category: "buying",
    question: "How do I know if a property is fairly priced?",
    shortLabel: "How to judge fair pricing?",
    answer: "Fair pricing is determined by comparing recent transfer rates of similar properties in the exact same block (considering category features like park-facing, corner, or dead-end). Consulting recent market transaction records with a trusted agency like The Zalmi Marketing prevents overpaying.",
    followUps: ["dha-check-before-buying", "dha-buying-mistakes"]
  },
  {
    id: "dha-documents-verify",
    category: "buying",
    question: "What documents should I verify?",
    shortLabel: "What documents to verify?",
    answer: "Verify the Allotment/Transfer Letter, DHA Transfer Affidavit, CNIC copies of the seller, Token Tax payment proofs, and official DHA Computerized Record Office verification stamp. Never rely solely on photocopies.",
    followUps: ["dha-check-before-buying", "dha-overseas-verify", "dha-risks-investing"]
  },
  {
    id: "dha-buying-mistakes",
    category: "buying",
    question: "What mistakes should I avoid when buying?",
    shortLabel: "Mistakes to avoid when buying?",
    answer: "Avoid dealing with unverified middlemen, ignoring transfer fee liabilities, failing to check on-ground plot location, overlooking development charges, and making cash payments without official DHA receipt or token agreements.",
    followUps: ["dha-check-before-buying", "dha-documents-verify"]
  },

  // SELLING
  {
    id: "dha-good-time-to-sell",
    category: "selling",
    question: "Is this a good time to sell?",
    shortLabel: "Is it a good time to sell?",
    answer: "Whether it's a good time to sell depends on your personal financial goals, whether your property has achieved your target appreciation, and alternative reinvestment opportunities available in the market. Our experts can provide a comparative market analysis (CMA) for your specific block.",
    followUps: ["dha-ease-of-selling", "dha-sell-now-or-hold", "dha-resale-value-factors"]
  },
  {
    id: "dha-ease-of-selling",
    category: "selling",
    question: "How easy is it to sell property in DHA?",
    shortLabel: "How easy is selling in DHA?",
    answer: "DHA Lahore has a highly active secondary market with transparent transfer procedures at DHA offices. Properties priced competitively in popular sizes sell relatively quickly when marketed through established real estate networks.",
    followUps: ["dha-easiest-to-sell", "dha-resale-value-factors"]
  },
  {
    id: "dha-resale-value-factors",
    category: "selling",
    question: "What affects resale value?",
    shortLabel: "What affects resale value?",
    answer: "Key factors include location (block popularity, proximity to parks/commercials), plot attributes (corner, wide road, park-facing), construction quality and modern elevation (for houses), and clear title with zero pending dues.",
    followUps: ["dha-easiest-to-sell", "dha-good-time-to-sell"]
  },
  {
    id: "dha-sell-now-or-hold",
    category: "selling",
    question: "Should I sell now or hold?",
    shortLabel: "Should I sell now or hold?",
    answer: "If you need liquidity or want to capitalize on peak valuation in your block, selling can lock in gains. If your property is in an upcoming phase where major infrastructure is nearing completion, holding for a couple more years may yield higher returns.",
    followUps: ["dha-holding-period", "dha-good-time-to-sell"]
  },

  // OVERSEAS PAKISTANIS
  {
    id: "dha-overseas-safe",
    category: "overseas",
    isTop: true,
    question: "Can an overseas Pakistani invest safely in DHA?",
    shortLabel: "Safe for overseas Pakistanis?",
    answer: "Yes, DHA has dedicated Overseas Pakistani enclosures, streamlined online portals, and secure digital banking channels. However, to ensure 100% safety against fraud, overseas buyers should work with a trusted, reputable registered agency like The Zalmi Marketing to manage power of attorney and physical verifications.",
    followUps: ["dha-overseas-verify", "dha-overseas-remote-management", "dha-overseas-transfer-funds"]
  },
  {
    id: "dha-overseas-verify",
    category: "overseas",
    question: "What should overseas buyers verify?",
    shortLabel: "What should overseas buyers verify?",
    answer: "Overseas buyers should verify original allotment letters, ensure valid NICOP/CNIC documentation, use official banking channels for funds transfer, and execute a legally sound Special Power of Attorney (SPA) attested by Pakistani embassies/consulates when not present in person.",
    followUps: ["dha-overseas-safe", "dha-documents-verify", "dha-overseas-transfer-funds"]
  },
  {
    id: "dha-overseas-remote-management",
    category: "overseas",
    question: "Which property types are easier to manage remotely?",
    shortLabel: "Best property for remote management?",
    answer: "Plots and managed residential units or branded apartments require the least day-to-day oversight compared to standalone rental houses, which require tenant management, maintenance upkeep, and utility bill tracking.",
    followUps: ["dha-overseas-safe", "dha-plot-vs-house"]
  },
  {
    id: "dha-overseas-transfer-funds",
    category: "overseas",
    question: "What should I consider before transferring money?",
    shortLabel: "Things before transferring funds?",
    answer: "Always use official banking channels (such as Roshan Digital Account - RDA or formal wire transfers), ensure payments match verified seller titles in DHA records, and obtain official receipts and tokens backed by signed agreements.",
    followUps: ["dha-overseas-safe", "dha-documents-verify"]
  },

  // PERSONAL USE
  {
    id: "dha-family-living",
    category: "personal",
    isTop: true,
    question: "Which phase is best for family living?",
    shortLabel: "Best phase for family living?",
    answer: "Phases 5, 6, and 8 offer exceptional family living environments with gated security, world-class schools, hospitals, family parks, commercial markets, and active community welfare organizations.",
    followUps: ["dha-phase-living", "dha-buy-or-build-house", "dha-accessibility-amenities"]
  },
  {
    id: "dha-buy-or-build-house",
    category: "personal",
    question: "Should I buy a house or build one?",
    shortLabel: "Should I buy or build a house?",
    answer: "Building allows complete customization of floor plans, interior finishes, and modern architectural features to your exact liking. Buying an already constructed house saves you from contractor supervision stress, material cost escalations, and 12-18 months of construction time.",
    followUps: ["dha-plot-or-house", "dha-ready-to-move"]
  },
  {
    id: "dha-location-considerations",
    category: "personal",
    question: "What should I consider when choosing a location?",
    shortLabel: "What to consider in location?",
    answer: "Consider daily commute routes to workplaces/schools, proximity to main commercial boulevards, distance from grid stations or high-tension wires, park proximity, and street width.",
    followUps: ["dha-phase-living", "dha-accessibility-amenities"]
  },
  {
    id: "dha-accessibility-amenities",
    category: "personal",
    question: "Which areas are best for accessibility and amenities?",
    shortLabel: "Best areas for amenities?",
    answer: "Phases with central commercial zones (like Sector CCA in Phase 4, 5, and 6) and direct access to Lahore Ring Road offer the fastest commute times to key city hubs, airport, and educational institutions.",
    followUps: ["dha-phase-living", "dha-location-considerations"]
  }
];

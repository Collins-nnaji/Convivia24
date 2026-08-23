/**
 * Taste notes (per product) + brand history (per house) shown via the info
 * icon on shop cards, product pages, and cart lines.
 */

export const TASTE_NOTES: Record<string, string> = {
  "hennessy-vs": "Young and punchy — oak, dried fruit, and a peppery finish built to carry a mixer.",
  "jameson-original": "Light and easy-going — green apple and vanilla, barely a bite, disappears into cola.",
  "johnnie-walker-black": "Smoky dried fruit and toffee over a long, warming finish — the benchmark blend.",
  "ciroc-snap-frost": "Grape-distilled, so it drinks softer than grain vodka — citrus zest, faint pear, clean exit.",
  "moet-imperial": "Green apple and brioche with a fine, fast mousse — bright rather than heavy.",
  "veuve-yellow-label": "Fuller-bodied than Moët — toasted bread, ripe stone fruit, a rounder finish.",
  "gh-mumm-cordon-rouge": "Pinot-led and crisp — green apple, brioche, fine bubbles under the red cordon.",
  "jameson-black-barrel": "Double-charred casks push it toward vanilla, dark toffee, and a warmer spice finish.",
  "glenmorangie-original": "Floral and citrus-led — lemon, peach, a light honey finish. The gentlest single malt on the list.",
  "glenmorangie-lasanta": "Sherry cask sweetness — raisin, orange peel, and dark chocolate over the Highland base.",
  "glenmorangie-signet": "Roasted espresso and dark chocolate from specially malted \"chocolate barley\" — dense and rich.",
  "chivas-12": "Honey and ripe apple with a soft, malty core — built to be easy at any volume.",
  "chivas-18": "Deeper than the 12 — dried fig, dark chocolate, a longer honeyed finish.",
  "famous-grouse": "Light heather honey and toffee — mixes clean, priced for the whole table.",
  "monkey-shoulder": "Vanilla, orange, and a touch of spice from three Speyside malts — made to go into a shaker.",
  "jack-daniels": "Charcoal-mellowed through the Lincoln County Process — caramel, banana, a soft char finish.",
  "gentlemen-jack": "Charcoal-mellowed twice — smoother and rounder than No. 7, with more vanilla up front.",
  "johnnie-walker-gold": "Honeyed and creamy with soft fruit — richer than Black, gentler than the older labels.",
  "johnnie-walker-green": "All-malt, so it reads grassier and more mineral — green apple, mint, a drier finish.",
  "johnnie-walker-blue": "Silky and layered — dried fruit, smoke, and honey with almost no burn on the way down.",
  "glenfiddich-12": "Pear and fresh oak — the classic first single malt, light and clean.",
  "glenfiddich-gran-reserva": "Rum-cask finished — tropical fruit and molasses laid over a 21-year Speyside base.",
  "glenlivet-founders": "Bright citrus and vanilla — the softest entry point into The Glenlivet range.",
  "glenlivet-12": "Orchard fruit, pineapple, and a clean vanilla finish — the house style at its most balanced.",
  "glenlivet-18": "Fuller and spicier than the 12 — dried fruit, ginger, and a long, warming close.",
  "macallan-12": "Vanilla and dried fruit from a mix of sherry and bourbon casks — sweet, rounded, instantly recognisable.",
  "macallan-18": "Deep sherry-cask character — orange, dark chocolate, and cinnamon, built for slow sipping.",
  "macallan-25": "Decades of sherry oak — treacle, antique wood, and dried fruit that lingers for minutes.",
  "ballantines-finest": "Soft and light with a touch of heather — the easiest mixer whisky on the shelf.",
  "martell-vs": "Grape and fresh oak up front — the youngest, brightest pour in the Martell range.",
  "martell-blue-swift": "Bourbon-cask finished, so it drinks rounder and a little sweeter — vanilla over the Cognac fruit.",
  "martell-xo": "Dried fig, cocoa, and toasted spice from a long ageing — built for a slower table.",
  "hennessy-vsop": "Rounder and spicier than VS — dried apricot, cinnamon, a longer finish.",
  "hennessy-xo": "Dense and layered — dark chocolate, leather, and dried fruit from decades in oak.",
  "remy-martin-vsop": "Fine Champagne cognac — vanilla and ripe fruit with a soft, warm finish.",
  "remy-martin-1738": "Between VSOP and XO — cocoa and toasted spice with more weight than the standard VSOP.",
  "casamigos-reposado": "Rested in oak for months, not years — vanilla and light caramel over an agave base, easy to sip neat.",
  "casamigos-anejo": "A full year in oak brings caramel, dark chocolate, and a rounder, warmer agave finish.",
  "clase-azul-reposado": "Sweet agave and cinnamon in a hand-painted ceramic bottle — as much a centrepiece as a pour.",
  "don-julio-1942": "Añejo-aged for 2.5 years — caramel, vanilla, and roasted agave with a long, smooth finish.",
  "absolut-vodka": "Neutral grain vodka with a faint grainy sweetness — built to disappear into a mix.",
  "absolut-citron": "The classic Absolut base with real lemon peel distillate layered in — sharp citrus, clean finish.",
  "ciroc-red-berry": "Grape vodka infused with berry — sweeter and fruitier than the Snap Frost original.",
  "ciroc-mango": "Tropical and juicy — mango up front over the same soft, grape-distilled base.",
  "chardonnay-house": "Crisp citrus and green apple with no oak weight — a cold-climate style built for warm evenings.",
  "prosecco-brut": "Pear and white flowers with a soft, fast fizz — lighter and less yeasty than Champagne.",
  "smirnoff-ice-pack": "Lemon-lime and vodka, lightly carbonated — sweet, cold, and built for a cooler bag.",
  "flying-fish-pack": "Citrus-forward malt cocktail — light body, low bitterness, easy across a long afternoon.",
  "brutal-fruit-pack": "Berry-forward and lightly sparkling — sweeter and softer than a standard cider.",
  "hunters-dry-pack": "Crisp apple and a dry, clean finish — the least sweet of the canned lineup.",
  "ace-berry-pack": "Mixed berry, sweet and straightforward — built for volume, not sipping.",
  "orijin-rtd-pack": "Herbal bitters in a can — the same bittersweet profile as the bottle, pre-mixed and cold.",
  "desperados-pack": "Malt beer with a tequila twist — light lime and agave notes over a lager base.",
  "breezer-peach-pack": "Sweet peach and vodka, lightly carbonated — a cooler-friendly sipper.",
  "tiger-cranberry": "Tart cranberry, zero ABV — built to keep a mixer table stocked without the alcohol.",
  "schweppes-tonic-pack": "Bitter quinine and light citrus — the classic gin partner, nothing fancy.",
};

export type BrandInfo = {
  origin: string;
  founded: string;
  history: string;
  style: string;
};

export const BRAND_INFO: Record<string, BrandInfo> = {
  "Hennessy": {
    origin: "Cognac, France",
    founded: "1765",
    history:
      "Founded by an Irish soldier turned merchant, Richard Hennessy, in the Cognac region. It became the world's best-selling Cognac house and the name most requested at Lagos bottle-service tables.",
    style: "Cognac — grape brandy aged in French oak, graded VS through XO by time in cask.",
  },
  "Jameson": {
    origin: "Dublin, Ireland",
    founded: "1780",
    history:
      "John Jameson set up his distillery on Dublin's Bow Street in 1780. Triple distillation became the house signature, giving a lighter, smoother whiskey than most Scotch — built to mix easily.",
    style: "Irish whiskey — triple-distilled, smoother and lighter-bodied than Scotch.",
  },
  "Johnnie Walker": {
    origin: "Kilmarnock, Scotland",
    founded: "1820",
    history:
      "Started as a grocer's blend by John Walker, then carried worldwide by his son and grandson under the \"Striding Man\" mark. The colour-coded labels (Red through Blue) still signal how long and how rare the blend is.",
    style: "Blended Scotch whisky — malt and grain whiskies married for consistency across the range.",
  },
  "Cîroc": {
    origin: "Gaillac, France",
    founded: "2003",
    history:
      "A modern vodka distilled from French grapes rather than grain or potato, developed with Diageo and fronted by Sean \"Diddy\" Combs' marketing push — built from the start for the club and lounge circuit.",
    style: "Grape-distilled vodka — five distillations for a softer mouthfeel than grain vodka.",
  },
  "Moët & Chandon": {
    origin: "Épernay, France",
    founded: "1743",
    history:
      "One of the oldest Champagne houses, founded by Claude Moët in the heart of the Champagne region. Napoleon was reportedly a regular guest at the estate — the house has been tied to celebration ever since.",
    style: "Champagne — traditional-method sparkling wine from Chardonnay, Pinot Noir, and Pinot Meunier.",
  },
  "Veuve Clicquot": {
    origin: "Reims, France",
    founded: "1772",
    history:
      "Barbe-Nicole Clicquot took over the house as a young widow (\"veuve\") in 1805 and pioneered the riddling process still used to clarify Champagne today — one of the first women to run a major business of her era.",
    style: "Champagne — the Yellow Label is a fuller, riper house style than most.",
  },
  "G.H. Mumm": {
    origin: "Reims, France",
    founded: "1827",
    history:
      "Named for the Mumm family of German merchants who settled in Champagne. The red cordon sash became the house signature — Cordon Rouge is the bottle most people recognise first.",
    style: "Champagne — Pinot Noir–led, crisp apple and brioche, built for celebration.",
  },
  "Glenmorangie": {
    origin: "Tain, Scottish Highlands",
    founded: "1843",
    history:
      "Distilled using the tallest stills in Scotland, which strip out heavier oils and give a notably light, floral spirit before it ever touches a cask. Owned by LVMH since 2004.",
    style: "Highland single malt — floral and citrus-forward, often finished in secondary casks.",
  },
  "Chivas Regal": {
    origin: "Speyside, Scotland",
    founded: "1801",
    history:
      "Started as a grocer's shop in Aberdeen that supplied Queen Victoria; the Chivas brothers began blending their own whisky in the 1850s. The 12-year became one of the first age-stated blends sold worldwide.",
    style: "Blended Scotch whisky — honeyed and fruit-forward, aged a minimum of 12 or 18 years.",
  },
  "The Famous Grouse": {
    origin: "Perth, Scotland",
    founded: "1896",
    history:
      "Matthew Gloag named the blend after the game bird native to the Scottish moors. It became Scotland's best-selling whisky at home — an everyday blend rather than a luxury one.",
    style: "Blended Scotch whisky — light, honeyed, and built for mixing.",
  },
  "Monkey Shoulder": {
    origin: "Dufftown, Speyside",
    founded: "2005",
    history:
      "Named for the repetitive-strain shoulder injury malt-men once got from turning barley by hand. Blended from three Speyside malts specifically to work in cocktails rather than be sipped neat.",
    style: "Blended malt Scotch whisky — three single malts married, no grain whisky added.",
  },
  "Jack Daniel's": {
    origin: "Lynchburg, Tennessee, USA",
    founded: "1866",
    history:
      "Registered as America's first legal distillery, run by Jasper \"Jack\" Daniel. Every drop is filtered through ten feet of sugar-maple charcoal before ageing — the Lincoln County Process that defines Tennessee whiskey.",
    style: "Tennessee whiskey — charcoal-mellowed before barrelling, giving it a soft, sweet char.",
  },
  "Glenfiddich": {
    origin: "Dufftown, Speyside",
    founded: "1887",
    history:
      "Built by William Grant and family, who by legend carried the stones for the distillery by hand. Still family-owned, and the malt most people picture when they think \"single malt Scotch.\"",
    style: "Speyside single malt — pear and fresh oak, a classic entry point into single malts.",
  },
  "The Glenlivet": {
    origin: "Speyside, Scotland",
    founded: "1824",
    history:
      "George Smith was the first distiller in the Speyside glen to hold a legal licence after the 1823 Excise Act, at real risk from smugglers who'd run it illegally for decades. \"The Glenlivet\" name is still legally protected.",
    style: "Speyside single malt — soft orchard fruit, considered the archetype of the region's style.",
  },
  "The Macallan": {
    origin: "Speyside, Scotland",
    founded: "1824",
    history:
      "Distilled with the shortest stills in Speyside, giving a rich, oily spirit that takes especially well to sherry-seasoned oak — the cask policy The Macallan is best known for.",
    style: "Speyside single malt — sherry-cask driven, dried fruit and dark chocolate character.",
  },
  "Ballantine's": {
    origin: "Dumbarton, Scotland",
    founded: "1827",
    history:
      "George Ballantine started as a grocer in Edinburgh before moving into whisky blending. Now one of the best-selling Scotch blends worldwide, built for easy, everyday drinking.",
    style: "Blended Scotch whisky — light and approachable.",
  },
  "Martell": {
    origin: "Cognac, France",
    founded: "1715",
    history:
      "The oldest of the major Cognac houses, founded by Jean Martell, a trader from Jersey. Known for double-distilling in small pot stills and ageing largely in fine-grained Cognac oak rather than heavier Limousin oak.",
    style: "Cognac — typically lighter and fruitier than some houses, thanks to its cask choices.",
  },
  "Rémy Martin": {
    origin: "Cognac, France",
    founded: "1724",
    history:
      "Uses only \"Fine Champagne\" Cognac — a blend of grapes from the two best-rated growing zones in the region — a rule the house has held to since founding.",
    style: "Fine Champagne Cognac — rounder and more floral than a standard-blend Cognac.",
  },
  "Casamigos": {
    origin: "Jalisco, Mexico",
    founded: "2013",
    history:
      "Started by George Clooney and friends as the tequila they wanted to drink at their own house in Mexico (\"casa amigos\") before it became a commercial brand — sold to Diageo in 2017 for close to a billion dollars.",
    style: "100% blue agave tequila — slow-cooked and rested for a smoother, less peppery profile.",
  },
  "Clase Azul": {
    origin: "Jalisco, Mexico",
    founded: "1997",
    history:
      "Built the brand around hand-painted ceramic decanters made by artisans in Guanajuato — no two bottles identical — turning the packaging itself into part of the product.",
    style: "100% blue agave tequila — slow, traditional production for a sweet, rounded finish.",
  },
  "Don Julio": {
    origin: "Jalisco, Mexico",
    founded: "1942",
    history:
      "Don Julio González started distilling at 17 and spent decades refining a slower, more careful process than the tequila norms of his era — the 1942 expression is named for the year he began.",
    style: "100% blue agave tequila — the 1942 Añejo is aged 2.5 years for a rounder, caramel-heavy profile.",
  },
  "Absolut": {
    origin: "Åhus, Sweden",
    founded: "1879",
    history:
      "Distilled from Swedish winter wheat in the same small town since the brand's modern launch in 1979. The apothecary-style bottle, based on an old Swedish medicine bottle, became one of the most recognisable in spirits.",
    style: "Grain vodka — continuous-distilled, no sugar added, a clean neutral base.",
  },
  "Convivia": {
    origin: "Lagos, Nigeria",
    founded: "2024",
    history:
      "Convivia24's own house selections and party packs — wines, sparkling, and bundles curated for Lagos nights rather than tied to one importer's label.",
    style: "House pours and multi-brand bundles, picked for the occasion rather than one distillery.",
  },
  "Smirnoff Ice": {
    origin: "Nigeria (licensed)",
    founded: "1999",
    history:
      "A ready-to-drink spin-off of the Smirnoff vodka name, built for the flavoured malt beverage category that took off in the late 90s — grab-and-go rather than a mixed drink.",
    style: "Flavoured malt beverage — lemon-lime, lightly carbonated, low ABV.",
  },
  "Flying Fish": {
    origin: "Nigeria",
    founded: "2000s",
    history:
      "A locally popular flavoured malt cocktail brand built for Nigeria's outdoor day-party and beach scene — priced and packaged for volume.",
    style: "Flavoured malt cocktail — citrus-led, light body.",
  },
  "Brutal Fruit": {
    origin: "South Africa",
    founded: "1990s",
    history:
      "A South African fruit cider brand that expanded across West Africa on the back of its sweet, low-alcohol, high-drinkability profile.",
    style: "Fruit cider — sweet, lightly sparkling, berry-forward.",
  },
  "Hunter's": {
    origin: "South Africa",
    founded: "1985",
    history:
      "One of South Africa's original commercial ciders. \"Hunter's Gold\" and \"Dry\" built a following on being crisper and less sweet than the fruit-cocktail ciders around them.",
    style: "Dry cider — crisp apple, less sweet than most canned RTDs.",
  },
  "Ace": {
    origin: "Nigeria",
    founded: "2010s",
    history:
      "A West African ready-to-drink cocktail line built around canned fruit flavours for cooler bags and day parties.",
    style: "Flavoured malt cocktail — berry-forward, straightforward and sweet.",
  },
  "Orijin": {
    origin: "Lagos, Nigeria",
    founded: "2013",
    history:
      "Launched by Guinness Nigeria, blending herbal bitters with fruit and spice extracts aimed squarely at Nigeria's bitters-drinking culture — now sold as both a bottle and a canned RTD.",
    style: "Herbal bitters cocktail — bittersweet, spiced, distinctly Nigerian.",
  },
  "Desperados": {
    origin: "France (Fischer Brewing)",
    founded: "1995",
    history:
      "A tequila-flavoured beer created by French brewer Fischer to bring tequila's profile into a lager format — one of the first \"flavoured beer\" brands to go global.",
    style: "Tequila-flavoured malt beer — lager base with lime and agave notes.",
  },
  "Breezer": {
    origin: "India (Bacardi)",
    founded: "1995",
    history:
      "Launched by Bacardi as a lighter, fruit-flavoured alternative to straight spirits — peach became one of its most recognisable flavours across African and Asian markets.",
    style: "Flavoured vodka cooler — sweet, low ABV, lightly carbonated.",
  },
  "Tiger": {
    origin: "Nigeria",
    founded: "2000s",
    history:
      "A Nigerian energy-mixer brand built to keep non-alcoholic drinkers and mixer tables stocked at the same volume as everyone else's pours.",
    style: "Zero-ABV energy mixer — fruit-flavoured, built for cutting spirits or drinking straight.",
  },
  "Schweppes": {
    origin: "Geneva, Switzerland",
    founded: "1783",
    history:
      "Jacob Schweppe developed one of the first commercial processes for carbonating water. The tonic line became the standard mixer for gin worldwide, and still is.",
    style: "Tonic water — bitter quinine base, the default gin partner.",
  },
};

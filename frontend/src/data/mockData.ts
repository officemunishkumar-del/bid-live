import { AuctionItem, AuctionHouse, FeaturedAuction, SearchCategory } from "@/types/auction";
import { formatCurrency, getTimeRemaining } from "@/utils/formatters";

const futureDate = (days: number, hours = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(d.getHours() + hours);
  return d.toISOString();
};

export const categories = [
  "Art", "Jewelry", "Asian Antiques", "Furniture", "Collectibles",
  "Coins", "Home & Décor", "Fashion", "Watches", "Books"
];

export const auctionHouses: AuctionHouse[] = [
  { id: "ah1", name: "Bonhams", logo: "B", location: "London, UK", rating: 4.8, reviewCount: 2340 },
  { id: "ah2", name: "Heritage Auctions", logo: "H", location: "Dallas, TX", rating: 4.7, reviewCount: 5120 },
  { id: "ah3", name: "Phillips", logo: "P", location: "New York, NY", rating: 4.9, reviewCount: 1890 },
  { id: "ah4", name: "Sotheby's", logo: "S", location: "New York, NY", rating: 4.9, reviewCount: 8900 },
  { id: "ah5", name: "Christie's", logo: "C", location: "London, UK", rating: 4.8, reviewCount: 7650 },
  { id: "ah6", name: "Doyle", logo: "D", location: "New York, NY", rating: 4.5, reviewCount: 1230 },
];

export const auctionItems: AuctionItem[] = [
  {
    id: "1", title: "14.94 ctw 14K Yellow Gold Tennis Necklace", category: "Jewelry",
    images: ["https://images.unsplash.com/photo-1515562141589-67f0d569b6f5?w=600", "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600", "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=600"],
    estimateLow: 14330, estimateHigh: 16380, currentBid: 6100, bidCount: 12,
    auctioneer: "Heritage Auctions", auctioneerRating: 4.7, auctioneerReviews: 5120,
    endTime: futureDate(0, 2), lotNumber: "55551367", featured: true, currency: "$",
    startingPrice: 6100,
    description: "A stunning 14.94 carat total weight 14K yellow gold tennis necklace featuring round brilliant-cut diamonds set in a classic four-prong setting. The necklace measures approximately 18 inches in length and features a secure box clasp with safety latch.",
    conditionReport: "Excellent condition. All stones present and secure. Clasp functions properly. Minor surface wear consistent with gentle use. No repairs or modifications noted.",
    shippingInfo: "Insured shipping available worldwide. Domestic shipping: $25. International shipping: $65. Items ship within 5-7 business days after payment clears."
  },
  {
    id: "2", title: "Claude Monet - Water Lilies Study, Oil on Canvas", category: "Art",
    images: ["https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600", "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600"],
    estimateLow: 45000, estimateHigh: 65000, currentBid: 38000, bidCount: 24,
    auctioneer: "Sotheby's", auctioneerRating: 4.9, auctioneerReviews: 8900,
    endTime: futureDate(1, 5), lotNumber: "55551368", featured: true, currency: "$",
    startingPrice: 30000,
    description: "An exceptional impressionist study of water lilies attributed to the school of Claude Monet. Oil on canvas, circa 1910. Presented in a period-appropriate gilt frame.",
    conditionReport: "Canvas in good condition with minor craquelure. Frame shows age-appropriate patina. Professionally cleaned and restored in 2019.",
    shippingInfo: "White-glove delivery available. Crated shipping: $350 domestic, $750 international. Art insurance included."
  },
  {
    id: "3", title: "18th Century Georgian Mahogany Secretaire", category: "Furniture",
    images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600", "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600"],
    estimateLow: 8000, estimateHigh: 12000, currentBid: 5200, bidCount: 8,
    auctioneer: "Bonhams", auctioneerRating: 4.8, auctioneerReviews: 2340,
    endTime: futureDate(3), lotNumber: "55551369", featured: false, currency: "£",
    startingPrice: 4000,
    description: "A fine Georgian mahogany secretaire bookcase, circa 1780. The upper section with two glazed doors enclosing adjustable shelves, the lower section with a fall-front secretaire drawer fitted with pigeonholes and small drawers.",
    conditionReport: "Good overall condition. Some restoration to veneer on lower section. Original brass hardware. Locks functional with key.",
    shippingInfo: "Specialist furniture shipping required. Quote upon request. Collection available from London warehouse."
  },
  {
    id: "4", title: "1893 Morgan Silver Dollar MS-65", category: "Coins",
    images: ["https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=600"],
    estimateLow: 2500, estimateHigh: 3500, currentBid: 1800, bidCount: 15,
    auctioneer: "Heritage Auctions", auctioneerRating: 4.7, auctioneerReviews: 5120,
    endTime: futureDate(0, 6), lotNumber: "55551370", featured: false, currency: "$",
    startingPrice: 1500,
    description: "1893 Morgan Silver Dollar graded MS-65 by PCGS. Brilliant luster with light golden toning. One of the key dates in the Morgan series.",
    conditionReport: "PCGS MS-65. No visible marks under magnification. Full mint luster retained.",
    shippingInfo: "Insured registered mail: $15 domestic, $35 international."
  },
  {
    id: "5", title: "Hermès Birkin 30 in Bleu Nuit Togo Leather", category: "Fashion",
    images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600", "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600"],
    estimateLow: 18000, estimateHigh: 25000, currentBid: 16500, bidCount: 31,
    auctioneer: "Christie's", auctioneerRating: 4.8, auctioneerReviews: 7650,
    endTime: futureDate(2, 3), lotNumber: "55551371", featured: true, currency: "$",
    startingPrice: 12000,
    description: "Hermès Birkin 30 in Bleu Nuit Togo leather with palladium hardware. Includes lock, keys, clochette, dust bag, and original box. Date stamp [A] 2017.",
    conditionReport: "Excellent condition. Corners show minimal wear. Interior clean. Hardware shows light scratching. All accessories present.",
    shippingInfo: "Signature required delivery. $45 domestic, $95 international. Full insurance included."
  },
  {
    id: "6", title: "Ming Dynasty Blue and White Porcelain Vase", category: "Asian Antiques",
    images: ["https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600"],
    estimateLow: 35000, estimateHigh: 50000, currentBid: 28000, bidCount: 18,
    auctioneer: "Bonhams", auctioneerRating: 4.8, auctioneerReviews: 2340,
    endTime: futureDate(4, 2), lotNumber: "55551372", featured: true, currency: "$",
    startingPrice: 20000,
    description: "A rare Ming Dynasty blue and white porcelain vase decorated with dragons among clouds. Bearing a six-character Xuande reign mark to the base. Height: 38cm.",
    conditionReport: "Very good condition for age. No chips or cracks. Minor kiln imperfections consistent with period production. Old collection label to base.",
    shippingInfo: "Custom crating included. $200 domestic, $450 international with full insurance."
  },
  {
    id: "7", title: "Art Deco Diamond & Platinum Bracelet", category: "Jewelry",
    images: ["https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600", "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600"],
    estimateLow: 22000, estimateHigh: 28000, currentBid: 19500, bidCount: 22,
    auctioneer: "Phillips", auctioneerRating: 4.9, auctioneerReviews: 1890,
    endTime: futureDate(1, 8), lotNumber: "55551373", featured: false, currency: "$",
    startingPrice: 15000,
    description: "An Art Deco diamond and platinum bracelet, circa 1925. Set with old European-cut diamonds totaling approximately 8.50 carats. Geometric design with milgrain detailing throughout.",
    conditionReport: "Excellent condition. All stones present. Clasp functions smoothly. Minimal platinum wear.",
    shippingInfo: "Insured shipping: $35 domestic, $85 international."
  },
  {
    id: "8", title: "Pablo Picasso - Ceramic Plate 'Visage' 1956", category: "Art",
    images: ["https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600"],
    estimateLow: 12000, estimateHigh: 18000, currentBid: 9800, bidCount: 14,
    auctioneer: "Sotheby's", auctioneerRating: 4.9, auctioneerReviews: 8900,
    endTime: futureDate(5), lotNumber: "55551374", featured: false, currency: "€",
    startingPrice: 8000,
    description: "Pablo Picasso (1881-1973). 'Visage' ceramic plate, 1956. Stamped and marked 'Edition Picasso / Madoura'. Diameter: 25cm. Edition of 450.",
    conditionReport: "Very good condition. No chips or repairs. Light surface wear. Stamps clearly legible.",
    shippingInfo: "Specialty ceramic packaging. $75 domestic, $150 international."
  },
  {
    id: "9", title: "Victorian Rosewood Piano-Top Davenport Desk", category: "Furniture",
    images: ["https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600"],
    estimateLow: 3000, estimateHigh: 5000, currentBid: 2200, bidCount: 6,
    auctioneer: "Doyle", auctioneerRating: 4.5, auctioneerReviews: 1230,
    endTime: futureDate(2), lotNumber: "55551375", featured: false, currency: "$",
    startingPrice: 1500,
    description: "A Victorian rosewood piano-top Davenport desk, circa 1860. The sloped leather-inset writing surface lifting to reveal compartments. Four side drawers with turned wood handles.",
    conditionReport: "Good condition with age-appropriate wear. Leather top replaced at some point. All drawers slide smoothly.",
    shippingInfo: "Freight shipping required. $250-500 domestic depending on location."
  },
  {
    id: "10", title: "Rolex Submariner Date Ref. 116610LN", category: "Watches",
    images: ["https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=600", "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600"],
    estimateLow: 12000, estimateHigh: 15000, currentBid: 11200, bidCount: 28,
    auctioneer: "Phillips", auctioneerRating: 4.9, auctioneerReviews: 1890,
    endTime: futureDate(0, 4), lotNumber: "55551376", featured: true, currency: "$",
    startingPrice: 9000,
    description: "Rolex Submariner Date Reference 116610LN. Black dial and Cerachrom bezel. Stainless steel Oyster case, 40mm. Complete with box, papers, and hang tag. Circa 2018.",
    conditionReport: "Very good pre-owned condition. Light desk-diving marks on bracelet. Crystal perfect. Movement running within COSC specification.",
    shippingInfo: "FedEx Priority with signature and full insurance: $50 domestic, $100 international."
  },
  {
    id: "11", title: "Collection of 12 Rare First Edition Books", category: "Collectibles",
    images: ["https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600"],
    estimateLow: 5000, estimateHigh: 8000, currentBid: 4100, bidCount: 9,
    auctioneer: "Heritage Auctions", auctioneerRating: 4.7, auctioneerReviews: 5120,
    endTime: futureDate(6), lotNumber: "55551377", featured: false, currency: "$",
    startingPrice: 3000,
    description: "A collection of twelve rare first edition novels from the 20th century, including works by Hemingway, Fitzgerald, and Faulkner. All in original dust jackets.",
    conditionReport: "Condition varies from Good to Very Good. Most jackets show edge wear. Detailed condition list available on request.",
    shippingInfo: "Media mail: $15 domestic. Priority international: $55."
  },
  {
    id: "12", title: "Jade Emperor Seal, Qing Dynasty", category: "Asian Antiques",
    images: ["https://images.unsplash.com/photo-1596568362037-5e1e5b845d32?w=600"],
    estimateLow: 40000, estimateHigh: 60000, currentBid: 35000, bidCount: 20,
    auctioneer: "Christie's", auctioneerRating: 4.8, auctioneerReviews: 7650,
    endTime: futureDate(3, 5), lotNumber: "55551378", featured: true, currency: "$",
    startingPrice: 25000,
    description: "A magnificent imperial jade seal from the Qing Dynasty, carved with a dragon finial. The seal face inscribed with official characters. Provenance: distinguished European private collection since 1920s.",
    conditionReport: "Excellent condition. Rich, even celadon color. No cracks or repairs. Minor natural inclusions.",
    shippingInfo: "Hand-delivered by specialist courier. Quote upon request."
  },
  {
    id: "13", title: "Mid-Century Eames Lounge Chair & Ottoman", category: "Furniture",
    images: ["https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600"],
    estimateLow: 6000, estimateHigh: 9000, currentBid: 4800, bidCount: 11,
    auctioneer: "Doyle", auctioneerRating: 4.5, auctioneerReviews: 1230,
    endTime: futureDate(1), lotNumber: "55551379", featured: false, currency: "$",
    startingPrice: 3500,
    description: "Charles and Ray Eames lounge chair and ottoman for Herman Miller, circa 1970. Rosewood veneer shells with black leather cushions. Original shock mounts.",
    conditionReport: "Good vintage condition. Leather shows gentle patina. One shock mount replaced. Ottoman tilt mechanism functions properly.",
    shippingInfo: "Blanket-wrapped freight: $200-400 domestic."
  },
  {
    id: "14", title: "2.03ct Fancy Vivid Yellow Diamond Ring", category: "Jewelry",
    images: ["https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600"],
    estimateLow: 55000, estimateHigh: 75000, currentBid: 48000, bidCount: 35,
    auctioneer: "Sotheby's", auctioneerRating: 4.9, auctioneerReviews: 8900,
    endTime: futureDate(2, 7), lotNumber: "55551380", featured: true, currency: "$",
    startingPrice: 40000,
    description: "A spectacular 2.03 carat Fancy Vivid Yellow diamond ring. The cushion-cut center stone set in 18K yellow gold with a platinum mounting, flanked by trapezoid-cut white diamonds totaling 0.65ct. GIA certified.",
    conditionReport: "New condition. Accompanied by GIA report #12345678.",
    shippingInfo: "Armored courier delivery included for purchases over $25,000."
  },
  {
    id: "15", title: "Banksy - 'Girl with Balloon' Screen Print", category: "Art",
    images: ["https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600"],
    estimateLow: 80000, estimateHigh: 120000, currentBid: 72000, bidCount: 42,
    auctioneer: "Phillips", auctioneerRating: 4.9, auctioneerReviews: 1890,
    endTime: futureDate(4), lotNumber: "55551381", featured: true, currency: "£",
    startingPrice: 60000,
    description: "Banksy (b. 1974). 'Girl with Balloon', 2004. Screenprint in black and red on wove paper. Signed and numbered from the edition of 150. Sheet: 70 x 50 cm.",
    conditionReport: "Excellent condition. Colors vibrant. Paper shows no foxing or discoloration. Professionally framed with UV-protective glass.",
    shippingInfo: "Art logistics partner handles shipping. $200 domestic, $500 international. Climate-controlled transport available."
  },
  {
    id: "16", title: "1909-S VDB Lincoln Cent PCGS MS-64", category: "Coins",
    images: ["https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=600"],
    estimateLow: 1800, estimateHigh: 2500, currentBid: 1400, bidCount: 19,
    auctioneer: "Heritage Auctions", auctioneerRating: 4.7, auctioneerReviews: 5120,
    endTime: futureDate(1, 3), lotNumber: "55551382", featured: false, currency: "$",
    startingPrice: 1000,
    description: "1909-S VDB Lincoln Wheat Cent graded MS-64 Red-Brown by PCGS. The key date of the Lincoln cent series with the designer's initials on the reverse.",
    conditionReport: "PCGS MS-64 RB. Predominantly red surfaces with light brown toning. Strike is sharp. Eye-appealing example.",
    shippingInfo: "Insured registered mail: $15 domestic, $35 international."
  },
  {
    id: "17", title: "Louis Vuitton Trunk, Circa 1920", category: "Fashion",
    images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600"],
    estimateLow: 8000, estimateHigh: 12000, currentBid: 6500, bidCount: 13,
    auctioneer: "Bonhams", auctioneerRating: 4.8, auctioneerReviews: 2340,
    endTime: futureDate(5, 4), lotNumber: "55551383", featured: false, currency: "€",
    startingPrice: 5000,
    description: "A Louis Vuitton monogram canvas trunk, circa 1920. Brass hardware and locks. Original interior tray and compartments. Dimensions: 80 x 52 x 30cm.",
    conditionReport: "Good condition for age. Canvas shows even patina. Brass hardware has been polished. Interior lining replaced at some point. All locks function with original key.",
    shippingInfo: "Freight shipping: $300 domestic, $600 international. Custom crating included."
  },
  {
    id: "18", title: "Pair of Tiffany Studios Bronze Candlesticks", category: "Home & Décor",
    images: ["https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=600"],
    estimateLow: 4000, estimateHigh: 6000, currentBid: 3200, bidCount: 7,
    auctioneer: "Doyle", auctioneerRating: 4.5, auctioneerReviews: 1230,
    endTime: futureDate(3, 6), lotNumber: "55551384", featured: false, currency: "$",
    startingPrice: 2500,
    description: "A pair of Tiffany Studios patinated bronze candlesticks with blown Favrile glass bobeches. Each signed 'Tiffany Studios New York' with model number. Height: 12 inches.",
    conditionReport: "Very good condition. Original patina intact. Glass bobeches free of chips or cracks.",
    shippingInfo: "Padded shipping: $45 domestic, $95 international."
  },
  {
    id: "19", title: "Omega Speedmaster Professional 'Moonwatch'", category: "Watches",
    images: ["https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=600"],
    estimateLow: 6000, estimateHigh: 8000, currentBid: 5400, bidCount: 16,
    auctioneer: "Christie's", auctioneerRating: 4.8, auctioneerReviews: 7650,
    endTime: futureDate(2, 1), lotNumber: "55551385", featured: false, currency: "$",
    startingPrice: 4500,
    description: "Omega Speedmaster Professional Reference 311.30.42.30.01.005. Manual-wind chronograph. Black dial with luminous indices. Hesalite crystal. Complete with box, papers, and NASA velcro strap.",
    conditionReport: "Good pre-owned condition. Case shows light wear. Crystal free of scratches. Chronograph functions properly. Service history unknown.",
    shippingInfo: "FedEx Priority insured: $50 domestic, $100 international."
  },
  {
    id: "20", title: "Ancient Roman Gold Aureus, Emperor Augustus", category: "Coins",
    images: ["https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=600"],
    estimateLow: 25000, estimateHigh: 35000, currentBid: 22000, bidCount: 27,
    auctioneer: "Sotheby's", auctioneerRating: 4.9, auctioneerReviews: 8900,
    endTime: futureDate(6, 3), lotNumber: "55551386", featured: true, currency: "$",
    startingPrice: 18000,
    description: "A gold aureus of Emperor Augustus (27 BC - 14 AD). Obverse: Laureate head right. Reverse: Caius and Lucius Caesars standing facing. Weight: 7.85 grams. Struck at the Lugdunum mint, circa 2 BC - 4 AD.",
    conditionReport: "Near Extremely Fine. Excellent portrait detail. Slight die wear on reverse. Minor edge marks. Attractive golden tone.",
    shippingInfo: "Registered insured mail: $25 domestic, $50 international."
  },
];

export const featuredAuctions: FeaturedAuction[] = [
  {
    id: "fa1",
    title: "14.94 ctw Gold Tennis Necklace",
    category: "Jewelry",
    description: "A stunning 14.94 carat total weight 14K yellow gold tennis necklace.",
    auctioneer: "Heritage Auctions",
    date: "Ends in 2 hours",
    image: "https://images.unsplash.com/photo-1515562141589-67f0d569b6f5?w=600",
    images: ["https://images.unsplash.com/photo-1515562141589-67f0d569b6f5?w=600"],
    lotCount: 1,
    lotNumber: "55551367",
    estimate: "$14,330 - $16,380",
    location: "Dallas, TX"
  },
  {
    id: "fa2",
    title: "Claude Monet - Water Lilies Study",
    category: "Art",
    description: "An exceptional impressionist study of water lilies.",
    auctioneer: "Sotheby's",
    date: "Ends in 1 day",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600",
    images: ["https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600"],
    lotCount: 1,
    lotNumber: "55551368",
    estimate: "$45,000 - $65,000",
    location: "New York, NY"
  }
];

export const searchCategories: SearchCategory[] = [
  { id: "sc1", name: "Furniture", icon: "🪑", itemCount: 2450, followerCount: 1200, images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200", "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=200", "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=200"] },
  { id: "sc2", name: "Fine Art", icon: "🎨", itemCount: 3800, followerCount: 2100, images: ["https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=200", "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=200", "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=200"] },
  { id: "sc3", name: "Watches", icon: "⌚", itemCount: 1890, followerCount: 950, images: ["https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=200", "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=200", "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=200"] },
  { id: "sc4", name: "Jewelry", icon: "💎", itemCount: 5200, followerCount: 3400, images: ["https://images.unsplash.com/photo-1515562141589-67f0d569b6f5?w=200", "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=200", "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200"] },
];

import Scheme from '../models/Scheme.js';
import MarketPrice from '../models/MarketPrice.js';

const SCHEMES = [
  {
    name: 'Pradhan Mantri Kisan Samman Nidhi',
    shortName: 'PM-KISAN',
    description: 'Income support of ₹6000 per year to small and marginal farmers in three equal installments.',
    category: 'income_support',
    benefits: ['₹6000 per year direct to bank', 'No middlemen', 'Direct benefit transfer'],
    eligibility: { minLandSize: 0, maxLandSize: 2, states: [], crops: [] },
    applicationUrl: 'https://pmkisan.gov.in',
    helplineNumber: '155261',
    isNational: true,
    isActive: true,
  },
  {
    name: 'Pradhan Mantri Fasal Bima Yojana',
    shortName: 'PMFBY',
    description: 'Crop insurance scheme providing financial support to farmers suffering crop loss due to calamities.',
    category: 'insurance',
    benefits: ['Low premium rates', 'Full insurance cover', 'Quick claim settlement'],
    eligibility: { minLandSize: 0, maxLandSize: 100, states: [], crops: [] },
    applicationUrl: 'https://pmfby.gov.in',
    helplineNumber: '14447',
    isNational: true,
    isActive: true,
  },
  {
    name: 'Kisan Credit Card',
    shortName: 'KCC',
    description: 'Provides farmers with affordable credit for agricultural needs including cultivation and equipment.',
    category: 'loan',
    benefits: ['Low interest rate 4%', 'Flexible repayment', 'Up to ₹3 lakh credit'],
    eligibility: { minLandSize: 0, maxLandSize: 100, states: [], crops: [] },
    applicationUrl: 'https://www.nabard.org',
    helplineNumber: '1800-180-1551',
    isNational: true,
    isActive: true,
  },
  {
    name: 'PM Krishi Sinchai Yojana',
    shortName: 'PMKSY',
    description: 'Provides end-to-end irrigation solutions to expand cultivable area under irrigation.',
    category: 'subsidy',
    benefits: ['Drip irrigation subsidy', 'Sprinkler subsidy up to 55%', 'Water conservation'],
    eligibility: { minLandSize: 0, maxLandSize: 100, states: [], crops: [] },
    applicationUrl: 'https://pmksy.gov.in',
    helplineNumber: '1800-180-1551',
    isNational: true,
    isActive: true,
  },
  {
    name: 'Sub Mission on Agricultural Mechanization',
    shortName: 'SMAM',
    description: 'Subsidy on farm machinery and equipment to promote mechanization in agriculture.',
    category: 'equipment',
    benefits: ['50% subsidy on tractors', '40-50% subsidy on equipment', 'Custom hiring centers'],
    eligibility: { minLandSize: 0, maxLandSize: 100, states: [], crops: [] },
    applicationUrl: 'https://agrimachinery.nic.in',
    helplineNumber: '1800-180-1551',
    isNational: true,
    isActive: true,
  },
  {
    name: 'Soil Health Card Scheme',
    shortName: 'SHC',
    description: 'Provides soil health cards to farmers with crop-wise recommendations of nutrients and fertilizers.',
    category: 'training',
    benefits: ['Free soil testing', 'Fertilizer recommendations', 'Crop-wise advice'],
    eligibility: { minLandSize: 0, maxLandSize: 100, states: [], crops: [] },
    applicationUrl: 'https://soilhealth.dac.gov.in',
    helplineNumber: '1800-180-1551',
    isNational: true,
    isActive: true,
  },
];

const CROPS = ['Wheat', 'Rice', 'Maize', 'Cotton', 'Soybean', 'Mustard'];
const MANDIS = [
  { name: 'Ludhiana',  district: 'Ludhiana',  state: 'Punjab' },
  { name: 'Amritsar',  district: 'Amritsar',  state: 'Punjab' },
  { name: 'Karnal',    district: 'Karnal',    state: 'Haryana' },
  { name: 'Nagpur',    district: 'Nagpur',    state: 'Maharashtra' },
  { name: 'Coimbatore',district: 'Coimbatore',state: 'Tamil Nadu' },
];

const BASE_PRICES = {
  Wheat:   { min: 2100, modal: 2200, max: 2350 },
  Rice:    { min: 2000, modal: 2100, max: 2250 },
  Maize:   { min: 1800, modal: 1900, max: 2000 },
  Cotton:  { min: 6000, modal: 6200, max: 6500 },
  Soybean: { min: 4200, modal: 4400, max: 4600 },
  Mustard: { min: 5200, modal: 5400, max: 5600 },
};

const generateMarketData = () => {
  const data = [];
  const today = new Date();

  for (const crop of CROPS) {
    for (const mandi of MANDIS) {
      // Generate 30 days of history
      for (let day = 30; day >= 0; day--) {
        const date = new Date(today);
        date.setDate(date.getDate() - day);

        const base   = BASE_PRICES[crop];
        const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
        const fluctuation = random(-200, 200);

        data.push({
          crop,
          mandi: { name: mandi.name, district: mandi.district, state: mandi.state },
          prices: {
            min:   base.min   + fluctuation - 50,
            modal: base.modal + fluctuation,
            max:   base.max   + fluctuation + 50,
          },
          date,
          prediction: {
            price7Days:     base.modal + fluctuation + random(50, 200),
            price14Days:    base.modal + fluctuation + random(100, 400),
            trend:          ['rising', 'falling', 'stable'][random(0, 2)],
            recommendation: ['sell_now', 'wait', 'hold'][random(0, 2)],
          },
          arrivals: random(100, 5000),
        });
      }
    }
  }
  return data;
};

export const seedDatabase = async () => {
  try {
    // Seed schemes
    const schemeCount = await Scheme.countDocuments();
    if (schemeCount === 0) {
      await Scheme.insertMany(SCHEMES);
      console.log(`✅ Seeded ${SCHEMES.length} schemes`);
    } else {
      console.log(`✅ Schemes already seeded (${schemeCount} found)`);
    }

    // Seed market prices
    const marketCount = await MarketPrice.countDocuments();
    if (marketCount === 0) {
      const marketData = generateMarketData();
      await MarketPrice.insertMany(marketData);
      console.log(`✅ Seeded ${marketData.length} market price records`);
    } else {
      console.log(`✅ Market prices already seeded (${marketCount} found)`);
    }

  } catch (err) {
    console.error('❌ Seed error:', err.message);
  }
};
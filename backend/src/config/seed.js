import Scheme from '../models/Scheme.js';
import MarketPrice from '../models/MarketPrice.js';

const SCHEMES = [
  {
    name: 'Pradhan Mantri Kisan Samman Nidhi',
    shortName: 'PM-KISAN',
    description: 'Direct income support of Rs.6000 per year to small and marginal farmer families.',
    category: 'income_support',
    benefits: ['Rs.6000 per year in 3 installments', 'Direct bank transfer', 'No middlemen'],
    eligibility: { minLandSize: 0, maxLandSize: 5, states: [], crops: [] },
    applicationUrl: 'https://pmkisan.gov.in',
    helplineNumber: '155261',
    isNational: true,
    isActive: true,
  },
  {
    name: 'Pradhan Mantri Fasal Bima Yojana',
    shortName: 'PMFBY',
    description: 'Comprehensive crop insurance providing financial support to farmers suffering crop loss due to calamities.',
    category: 'insurance',
    benefits: ['Low premium 2% for Kharif', '1.5% for Rabi crops', 'Full insured sum coverage', 'Quick settlement'],
    eligibility: { minLandSize: 0, maxLandSize: 100, states: [], crops: [] },
    applicationUrl: 'https://pmfby.gov.in',
    helplineNumber: '14447',
    isNational: true,
    isActive: true,
  },
  {
    name: 'Kisan Credit Card',
    shortName: 'KCC',
    description: 'Provides farmers with timely and adequate credit support for agricultural operations at low interest rates.',
    category: 'loan',
    benefits: ['Credit up to Rs.3 lakh', 'Interest rate 4% per annum', 'Flexible repayment', 'No collateral up to Rs.1.6 lakh'],
    eligibility: { minLandSize: 0, maxLandSize: 100, states: [], crops: [] },
    applicationUrl: 'https://www.nabard.org',
    helplineNumber: '1800-180-1551',
    isNational: true,
    isActive: true,
  },
  {
    name: 'PM Krishi Sinchai Yojana',
    shortName: 'PMKSY',
    description: 'End-to-end solutions in irrigation supply chain creating sources, distribution network and farm level applications.',
    category: 'subsidy',
    benefits: ['Drip irrigation subsidy 55%', 'Sprinkler subsidy 55%', 'Water conservation', 'Per drop more crop'],
    eligibility: { minLandSize: 0, maxLandSize: 100, states: [], crops: [] },
    applicationUrl: 'https://pmksy.gov.in',
    helplineNumber: '1800-180-1551',
    isNational: true,
    isActive: true,
  },
  {
    name: 'Sub Mission on Agricultural Mechanization',
    shortName: 'SMAM',
    description: 'Promotes farm mechanization to reduce drudgery, cost of cultivation and increase productivity.',
    category: 'equipment',
    benefits: ['50% subsidy on tractors', '40-50% on farm equipment', 'Custom hiring centers', 'Training support'],
    eligibility: { minLandSize: 0, maxLandSize: 100, states: [], crops: [] },
    applicationUrl: 'https://agrimachinery.nic.in',
    helplineNumber: '1800-180-1551',
    isNational: true,
    isActive: true,
  },
  {
    name: 'Soil Health Card Scheme',
    shortName: 'SHC',
    description: 'Issues soil health cards to farmers with crop-wise recommendations of nutrients and fertilizers.',
    category: 'training',
    benefits: ['Free soil testing', 'Nutrient recommendations', 'Crop-wise fertilizer advice', 'Reduce input costs'],
    eligibility: { minLandSize: 0, maxLandSize: 100, states: [], crops: [] },
    applicationUrl: 'https://soilhealth.dac.gov.in',
    helplineNumber: '1800-180-1551',
    isNational: true,
    isActive: true,
  },
  {
    name: 'National Agriculture Market',
    shortName: 'e-NAM',
    description: 'Online trading platform for agricultural commodities to create a unified national market for farmers.',
    category: 'income_support',
    benefits: ['Better price discovery', 'Transparent auction', 'Online payment', 'Reduced transaction costs'],
    eligibility: { minLandSize: 0, maxLandSize: 100, states: [], crops: [] },
    applicationUrl: 'https://www.enam.gov.in',
    helplineNumber: '1800-270-0224',
    isNational: true,
    isActive: true,
  },
  {
    name: 'Paramparagat Krishi Vikas Yojana',
    shortName: 'PKVY',
    description: 'Promotes organic farming through cluster approach and PGS certification.',
    category: 'subsidy',
    benefits: ['Rs.50000 per hectare for 3 years', 'Organic certification support', 'Marketing assistance', 'Training'],
    eligibility: { minLandSize: 0, maxLandSize: 100, states: [], crops: [] },
    applicationUrl: 'https://pgsindia-ncof.gov.in',
    helplineNumber: '1800-180-1551',
    isNational: true,
    isActive: true,
  },
  {
    name: 'Pradhan Mantri Kisan Maandhan Yojana',
    shortName: 'PM-KMY',
    description: 'Pension scheme for small and marginal farmers providing Rs.3000 per month after age 60.',
    category: 'income_support',
    benefits: ['Rs.3000 monthly pension after 60', 'Government co-contribution', 'Life insurance cover', 'Family pension'],
    eligibility: { minLandSize: 0, maxLandSize: 2, states: [], crops: [] },
    applicationUrl: 'https://maandhan.in/farmer',
    helplineNumber: '1800-267-6888',
    isNational: true,
    isActive: true,
  },
  {
    name: 'National Food Security Mission',
    shortName: 'NFSM',
    description: 'Increases production of rice, wheat, pulses through area expansion and productivity enhancement.',
    category: 'subsidy',
    benefits: ['Subsidized seeds', 'Subsidized fertilizers', 'Farm machinery subsidy', 'Training and demonstration'],
    eligibility: { minLandSize: 0, maxLandSize: 100, states: [], crops: ['Rice', 'Wheat', 'Pulses'] },
    applicationUrl: 'https://nfsm.gov.in',
    helplineNumber: '1800-180-1551',
    isNational: true,
    isActive: true,
  },
  {
    name: 'Rashtriya Krishi Vikas Yojana',
    shortName: 'RKVY',
    description: 'Provides flexibility to states to plan and execute schemes for agriculture development.',
    category: 'training',
    benefits: ['Agricultural infrastructure', 'Technology adoption', 'Farmer training', 'Agri-entrepreneurship'],
    eligibility: { minLandSize: 0, maxLandSize: 100, states: [], crops: [] },
    applicationUrl: 'https://rkvy.nic.in',
    helplineNumber: '1800-180-1551',
    isNational: true,
    isActive: true,
  },
  {
    name: 'Pradhan Mantri Annadata Aay Sanrakshan Abhiyan',
    shortName: 'PM-AASHA',
    description: 'Ensures remunerative prices to farmers for their produce to protect from distress sales.',
    category: 'income_support',
    benefits: ['MSP procurement', 'Price deficiency payment', 'Private procurement', 'Oil palm support'],
    eligibility: { minLandSize: 0, maxLandSize: 100, states: [], crops: [] },
    applicationUrl: 'https://farmer.gov.in',
    helplineNumber: '1551',
    isNational: true,
    isActive: true,
  },
  {
    name: 'Agricultural Infrastructure Fund',
    shortName: 'AIF',
    description: 'Financing facility for investment in viable projects for post-harvest management infrastructure.',
    category: 'loan',
    benefits: ['Rs.1 lakh crore fund', '3% interest subvention', 'Credit guarantee', 'Storage infrastructure'],
    eligibility: { minLandSize: 0, maxLandSize: 100, states: [], crops: [] },
    applicationUrl: 'https://agriinfra.dac.gov.in',
    helplineNumber: '1800-180-1551',
    isNational: true,
    isActive: true,
  },
  {
    name: 'Formation and Promotion of FPOs',
    shortName: 'FPO Scheme',
    description: 'Promotes formation of 10000 Farmer Producer Organizations for collective farming benefits.',
    category: 'training',
    benefits: ['Rs.15 lakh equity grant', 'Credit guarantee', 'Professional management', 'Market linkage'],
    eligibility: { minLandSize: 0, maxLandSize: 100, states: [], crops: [] },
    applicationUrl: 'https://sfacindia.com',
    helplineNumber: '1800-180-1551',
    isNational: true,
    isActive: true,
  },
  {
    name: 'Micro Irrigation Fund',
    shortName: 'MIF',
    description: 'Dedicated fund to incentivize states to mobilize resources for micro irrigation beyond PMKSY.',
    category: 'subsidy',
    benefits: ['Rs.5000 crore fund', 'Low interest loans', 'Drip irrigation expansion', 'Water efficiency'],
    eligibility: { minLandSize: 0, maxLandSize: 100, states: [], crops: [] },
    applicationUrl: 'https://nabard.org',
    helplineNumber: '1800-180-1551',
    isNational: true,
    isActive: true,
  },
  {
    name: 'Punjab Kisan Karj Mafi Yojana',
    shortName: 'PKKMY',
    description: 'Punjab state scheme for loan waiver for small and marginal farmers.',
    category: 'loan',
    benefits: ['Loan waiver up to Rs.2 lakh', 'Relief to distressed farmers', 'Fresh credit eligibility'],
    eligibility: { minLandSize: 0, maxLandSize: 5, states: ['Punjab'], crops: [] },
    applicationUrl: 'https://punjab.gov.in',
    helplineNumber: '1800-180-2222',
    isNational: false,
    isActive: true,
  },
  {
    name: 'Maharashtra Shetkari Sanman Yojana',
    shortName: 'MSSY',
    description: 'Maharashtra state scheme providing direct income support to farmers.',
    category: 'income_support',
    benefits: ['Rs.6000 per year additional support', 'State top-up on PM-KISAN', 'Direct bank transfer'],
    eligibility: { minLandSize: 0, maxLandSize: 100, states: ['Maharashtra'], crops: [] },
    applicationUrl: 'https://maharashtra.gov.in',
    helplineNumber: '1800-233-4522',
    isNational: false,
    isActive: true,
  },
  {
    name: 'Tamil Nadu Chief Minister Farmers Welfare Scheme',
    shortName: 'CMFWS',
    description: 'Tamil Nadu provides financial assistance to farmers for agricultural development.',
    category: 'income_support',
    benefits: ['Rs.1000 per month support', 'Free electricity 100 units', 'Crop insurance premium subsidy'],
    eligibility: { minLandSize: 0, maxLandSize: 100, states: ['Tamil Nadu'], crops: [] },
    applicationUrl: 'https://tn.gov.in',
    helplineNumber: '1800-425-1144',
    isNational: false,
    isActive: true,
  },
  {
    name: 'Telangana Rythu Bandhu Scheme',
    shortName: 'RBS',
    description: 'Telangana provides Rs.10000 per acre per season as investment support to farmers.',
    category: 'income_support',
    benefits: ['Rs.10000 per acre per season', 'Pre-season investment support', 'Direct to bank account'],
    eligibility: { minLandSize: 0, maxLandSize: 100, states: ['Telangana'], crops: [] },
    applicationUrl: 'https://rythubandhu.telangana.gov.in',
    helplineNumber: '1800-425-2977',
    isNational: false,
    isActive: true,
  },
  {
    name: 'Andhra Pradesh YSR Free Crop Insurance',
    shortName: 'YSR-FCI',
    description: 'Andhra Pradesh provides free crop insurance premium to farmers under PMFBY.',
    category: 'insurance',
    benefits: ['Free crop insurance', 'Premium paid by government', 'Full coverage', 'Quick claims'],
    eligibility: { minLandSize: 0, maxLandSize: 100, states: ['Andhra Pradesh'], crops: [] },
    applicationUrl: 'https://ap.gov.in',
    helplineNumber: '1800-425-2977',
    isNational: false,
    isActive: true,
  },
];

const CROPS_LIST = ['Wheat', 'Rice', 'Maize', 'Cotton', 'Soybean', 'Mustard'];
const MANDIS = [
  { name: 'Ludhiana',   district: 'Ludhiana',   state: 'Punjab'      },
  { name: 'Amritsar',   district: 'Amritsar',   state: 'Punjab'      },
  { name: 'Karnal',     district: 'Karnal',     state: 'Haryana'     },
  { name: 'Nagpur',     district: 'Nagpur',     state: 'Maharashtra' },
  { name: 'Coimbatore', district: 'Coimbatore', state: 'Tamil Nadu'  },
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
  const data  = [];
  const today = new Date();
  for (const crop of CROPS_LIST) {
    for (const mandi of MANDIS) {
      for (let day = 30; day >= 0; day--) {
        const date        = new Date(today);
        date.setDate(date.getDate() - day);
        const base        = BASE_PRICES[crop];
        const random      = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
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
    // Seed schemes — always update if less than 20
    const schemeCount = await Scheme.countDocuments();
    if (schemeCount < 20) {
      await Scheme.deleteMany({});
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

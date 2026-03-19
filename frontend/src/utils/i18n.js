// frontend/src/utils/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      welcome: 'Welcome',
      dashboard: 'Dashboard',
      advisory: 'Advisory',
      cropDoctor: 'Crop Doctor',
      market: 'Market Prices',
      schemes: 'Govt. Schemes',
      community: 'Community',
      logout: 'Logout',
      todayAdvisory: "Today's Advisory",
      weather: 'Weather',
      myFarm: 'My Farm',
      login: 'Login',
      register: 'Register',
      phone: 'Phone Number',
      password: 'Password',
      name: 'Full Name',
      village: 'Village',
      state: 'State',
      landSize: 'Land Size (acres)',
      soilType: 'Soil Type',
      selectCrop: 'Select Crop',
      analyze: 'Analyze',
      uploadImage: 'Upload crop photo',
      sellNow: 'Sell Now',
      wait: 'Wait',
      apply: 'Apply Now',
    }
  },
  hi: {
    translation: {
      welcome: 'स्वागत है',
      dashboard: 'डैशबोर्ड',
      advisory: 'सलाह',
      cropDoctor: 'फसल डॉक्टर',
      market: 'मंडी भाव',
      schemes: 'सरकारी योजनाएं',
      community: 'समुदाय',
      logout: 'लॉग आउट',
      todayAdvisory: 'आज की सलाह',
      weather: 'मौसम',
      myFarm: 'मेरी खेती',
      login: 'लॉगिन',
      register: 'रजिस्टर',
      phone: 'फोन नंबर',
      password: 'पासवर्ड',
      name: 'पूरा नाम',
      village: 'गांव',
      state: 'राज्य',
      landSize: 'जमीन (एकड़)',
      soilType: 'मिट्टी का प्रकार',
      selectCrop: 'फसल चुनें',
      analyze: 'जांच करें',
      uploadImage: 'फसल की फोटो अपलोड करें',
      sellNow: 'अभी बेचें',
      wait: 'रुकें',
      apply: 'आवेदन करें',
    }
  },
  pa: {
    translation: {
      welcome: 'ਜੀ ਆਇਆਂ ਨੂੰ',
      dashboard: 'ਡੈਸ਼ਬੋਰਡ',
      advisory: 'ਸਲਾਹ',
      cropDoctor: 'ਫਸਲ ਡਾਕਟਰ',
      market: 'ਮੰਡੀ ਭਾਅ',
      schemes: 'ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ',
      community: 'ਭਾਈਚਾਰਾ',
      logout: 'ਲੌਗ ਆਉਟ',
      todayAdvisory: 'ਅੱਜ ਦੀ ਸਲਾਹ',
      weather: 'ਮੌਸਮ',
      myFarm: 'ਮੇਰੀ ਖੇਤੀ',
      login: 'ਲੌਗਿਨ',
      register: 'ਰਜਿਸਟਰ',
      phone: 'ਫੋਨ ਨੰਬਰ',
      password: 'ਪਾਸਵਰਡ',
      name: 'ਪੂਰਾ ਨਾਮ',
      village: 'ਪਿੰਡ',
      state: 'ਰਾਜ',
      landSize: 'ਜ਼ਮੀਨ (ਏਕੜ)',
      soilType: 'ਮਿੱਟੀ ਦੀ ਕਿਸਮ',
      selectCrop: 'ਫਸਲ ਚੁਣੋ',
      analyze: 'ਜਾਂਚ ਕਰੋ',
      uploadImage: 'ਫਸਲ ਦੀ ਫੋਟੋ ਅਪਲੋਡ ਕਰੋ',
      sellNow: 'ਹੁਣੇ ਵੇਚੋ',
      wait: 'ਉਡੀਕ ਕਰੋ',
      apply: 'ਅਰਜ਼ੀ ਦਿਓ',
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('km_lang') || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
});

export default i18n;
// backend/src/services/advisory.service.js
import cron from 'node-cron';
import User from '../models/User.js';
import Advisory from '../models/Advisory.js';
import { getWeatherByCoords } from './weather.service.js';
import { sendAdvisoryNotification } from './notification.service.js';

export const startAdvisoryCron = () => {
  // Every day at 6:00 AM IST
  cron.schedule('0 6 * * *', async () => {
    console.log('⏰ Running daily advisory cron...');
    try {
      const farmers = await User.find({ role: 'farmer', isActive: true })
        .limit(100)
        .select('_id location crops');

      for (const farmer of farmers) {
        try {
          const lat = farmer.location?.coordinates?.lat || 28.6;
          const lng = farmer.location?.coordinates?.lng || 77.2;

          const weather = await getWeatherByCoords(lat, lng);
          const wc      = weather.current;

          const advisory = await Advisory.create({
            farmer:   farmer._id,
            type:     'daily',
            priority: wc.rainfall > 5 ? 'high' : 'medium',
            title:    'Daily Farm Advisory',
            message:  weather.farmingAdvice[0] || 'Check your crops today.',
            weatherContext: {
              temperature: wc.temp,
              humidity:    wc.humidity,
              rainfall:    wc.rainfall,
              condition:   wc.condition
            },
            cropStage: 'vegetative'
          });

          await sendAdvisoryNotification(farmer._id, advisory);

        } catch (err) {
          console.error(`Advisory failed for farmer ${farmer._id}:`, err.message);
        }
      }

      console.log(`✅ Advisory cron complete for ${farmers.length} farmers`);
    } catch (err) {
      console.error('Advisory cron error:', err);
    }
  }, { timezone: 'Asia/Kolkata' });

  console.log('✅ Advisory cron scheduled (6 AM IST daily)');
};
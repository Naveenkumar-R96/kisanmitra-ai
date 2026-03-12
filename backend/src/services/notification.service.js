// backend/src/services/notification.service.js
import webpush from 'web-push';
import User from '../models/User.js';

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export const sendPushToUser = async (userId, payload) => {
  try {
    const user = await User.findById(userId).select('pushSubscription');
    if (!user?.pushSubscription) return;

    await webpush.sendNotification(
      user.pushSubscription,
      JSON.stringify(payload)
    );
  } catch (err) {
    console.error('Push notification failed:', err.message);
  }
};

export const sendPushToAll = async (payload) => {
  try {
    const users = await User.find({
      pushSubscription: { $exists: true, $ne: null }
    }).select('pushSubscription');

    const promises = users.map(user =>
      webpush.sendNotification(
        user.pushSubscription,
        JSON.stringify(payload)
      ).catch(err => console.error(`Push failed for user:`, err.message))
    );

    await Promise.allSettled(promises);
    console.log(`✅ Push sent to ${users.length} users`);
  } catch (err) {
    console.error('Bulk push failed:', err.message);
  }
};

export const sendAdvisoryNotification = async (userId, advisory) => {
  const priorityEmoji = {
    urgent: '🚨', high: '⚡', medium: '📌', low: '📝'
  };

  await sendPushToUser(userId, {
    title: `${priorityEmoji[advisory.priority] || '🌾'} ${advisory.title}`,
    body:  advisory.message.slice(0, 100),
    url:   '/advisory'
  });
};
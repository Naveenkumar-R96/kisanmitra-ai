// frontend/src/hooks/usePushNotification.js
import { useState, useEffect } from 'react';
import client from '../api/client';

export const usePushNotification = () => {
  const [permission,   setPermission]   = useState(Notification.permission);
  const [subscribed,   setSubscribed]   = useState(false);
  const [vapidKey,     setVapidKey]     = useState(null);

  useEffect(() => {
    // Fetch VAPID key
    client.get('/notifications/vapid-key')
      .then(res => setVapidKey(res.data.publicKey))
      .catch(() => {});
  }, []);

  const urlBase64ToUint8Array = (base64String) => {
    const padding  = '='.repeat((4 - base64String.length % 4) % 4);
    const base64   = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData  = window.atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
  };

  const subscribe = async () => {
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') return false;

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      });

      await client.post('/notifications/subscribe', { subscription: sub });
      setSubscribed(true);
      return true;
    } catch (err) {
      console.error('Push subscription failed:', err);
      return false;
    }
  };

  const unsubscribe = async () => {
    try {
      await client.post('/notifications/unsubscribe');
      setSubscribed(false);
    } catch (err) {
      console.error('Unsubscribe failed:', err);
    }
  };

  return { permission, subscribed, subscribe, unsubscribe };
};
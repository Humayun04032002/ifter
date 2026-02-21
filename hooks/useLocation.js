import { useState, useEffect } from 'react';

export default function useLocation(defaultPos = [23.8103, 90.4125]) {
  const [position, setPosition] = useState(defaultPos);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("আপনার ব্রাউজার লোকেশন সাপোর্ট করে না।");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => {
        setError("লোকেশন পারমিশন পাওয়া যায়নি।");
      },
      { enableHighAccuracy: true }
    );
  }, []);

  return { position, error };
}
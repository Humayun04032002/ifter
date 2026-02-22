import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getDistance } from '@/lib/haversine'; 

export function useIftarData(userLat, userLng) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userLat || !userLng) return;

    // ১. সঠিক লোকাল তারিখ বের করার ফাংশন (টাইমজোন বাগ ফিক্সড)
    const getTodayStr = () => {
        const now = new Date();
        // বাংলাদেশের অফসেট অনুযায়ী লোকাল ডেট ফরম্যাট (YYYY-MM-DD)
        const offset = now.getTimezoneOffset() * 60000;
        return new Date(now - offset).toISOString().split('T')[0];
    };
    
    const today = getTodayStr();

    // ২. ফায়ারবেস থেকে রিয়েল-টাইম ডাটা কুয়েরি
    const q = query(
      collection(db, "iftar_locations"), 
      orderBy("createdAt", "desc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allData = snapshot.docs.map(doc => {
        const data = doc.data();
        
        // ৩. ভোট গণনা লজিক
        const votes = data.votes || {};
        const upVotes = Object.values(votes).filter(v => v === true).length;
        const downVotes = Object.values(votes).filter(v => v === false).length;

        return {
          id: doc.id,
          ...data,
          upVotes,
          downVotes,
          // ৪. ভেরিফাইড স্ট্যাটাস (কমপক্ষে ৫টি পজিটিভ ভোট)
          isVerified: (upVotes - downVotes) >= 5,
          // ৫. ডিসটেন্স ক্যালকুলেশন
          distance: getDistance(userLat, userLng, data.lat, data.lng)
        };
      });

      // ৬. মাল্টিপল ফিল্টার লজিক: 
      const filtered = allData.filter(loc => {
        // - ২০ কিমি ডিসটেন্স ফিল্টার
        const withinDistance = loc.distance <= 20;
        
        // - শুধুমাত্র আজকের বা ভবিষ্যতের তারিখের ইফতার (পুরনো দিনের গুলো দেখাবে না)
        // loc.date যদি today এর চেয়ে ছোট হয় তবে সেটি বাদ যাবে
        const isNotExpired = loc.date ? loc.date >= today : true; 

        return withinDistance && isNotExpired;
      });

      // ৭. ডিসটেন্স অনুযায়ী সর্টিং (কাছের গুলো আগে)
      filtered.sort((a, b) => a.distance - b.distance);

      setLocations(filtered);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userLat, userLng]);

  return { locations, loading };
}
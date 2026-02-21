import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getDistance } from '@/lib/haversine'; 

export function useIftarData(userLat, userLng) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userLat || !userLng) return;

    // আজকের তারিখ বের করা (YYYY-MM-DD ফরম্যাটে)
    const today = new Date().toISOString().split('T')[0];

    // ১. ফায়ারবেস থেকে রিয়েল-টাইম ডাটা কুয়েরি
    const q = query(
      collection(db, "iftar_locations"), 
      orderBy("createdAt", "desc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allData = snapshot.docs.map(doc => {
        const data = doc.data();
        
        // ২. ভোট গণনা লজিক
        const votes = data.votes || {};
        const upVotes = Object.values(votes).filter(v => v === true).length;
        const downVotes = Object.values(votes).filter(v => v === false).length;

        return {
          id: doc.id,
          ...data,
          upVotes,
          downVotes,
          // ৩. ভেরিফাইড স্ট্যাটাস
          isVerified: (upVotes - downVotes) >= 5,
          // ৪. ডিসটেন্স ক্যালকুলেশন
          distance: getDistance(userLat, userLng, data.lat, data.lng)
        };
      });

      // ৫. মাল্টিপল ফিল্টার লজিক: 
      // - ২০ কিমি ডিসটেন্স ফিল্টার
      // - শুধুমাত্র আজকের তারিখের ইফতার (পুরনো দিনের গুলো দেখাবে না)
      const filtered = allData.filter(loc => {
        const withinDistance = loc.distance <= 20;
        
        // যদি ডাটাবেজে date না থাকে তবে সেটাকে আজকের জন্য বৈধ ধরা হবে (অপশনাল)
        // কিন্তু ডিলিট লজিকের জন্য 'date' ফিল্ড থাকা জরুরি
        const isToday = loc.date === today; 

        return withinDistance && isToday;
      });

      // ৬. ডিসটেন্স অনুযায়ী সর্টিং (কাছের গুলো আগে)
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
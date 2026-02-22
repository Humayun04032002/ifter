"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Plus, LocateFixed, Calendar } from 'lucide-react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { signInAnonymously } from 'firebase/auth';
import useLocation from '@/hooks/useLocation';
import { useIftarData } from '@/hooks/useIftarData';
import Swal from 'sweetalert2';

import CategoryChips from '@/components/home/CategoryChips';
import IftarCard from '@/components/home/IftarCard';

const MapView = dynamic(() => import('@/components/map/MapView'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-50 flex items-center justify-center font-black text-slate-400">ম্যাপ লোড হচ্ছে...</div>
});

export default function Home() {
  const router = useRouter();
  const { position: userPos } = useLocation();
  const { locations } = useIftarData(userPos[0], userPos[1]);
  
  const [selectedLoc, setSelectedLoc] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("সব");

  const Toast = Swal.mixin({
    toast: true,
    position: typeof window !== 'undefined' && window.innerWidth < 768 ? 'top' : 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    customClass: {
      container: 'z-[9999]', 
      popup: 'rounded-2xl shadow-2xl border border-slate-100',
      title: 'font-sans font-bold text-sm'
    },
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  });

  useEffect(() => {
    signInAnonymously(auth).catch(err => console.error("Auth Error", err));
  }, []);

  // --- আপডেট করা ফিল্টার লজিক ---
  const filteredLocations = locations.filter(loc => {
    // ১. আজকের তারিখের শুরু (রাত ১২:০০) বের করা
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    // ২. ডাটাবেসের তারিখকে টাইমস্ট্যাম্পে রূপান্তর (যদি তারিখ না থাকে তবে আজকের তারিখ ধরে নেবে)
    const eventDate = loc.date ? new Date(loc.date).getTime() : todayStart;
    
    // ৩. ফিল্টারিং শর্ত: 
    // - তারিখ আজকের বা ভবিষ্যতের হতে হবে
    // - ক্যাটাগরি মিলতে হবে
    const isUpcoming = eventDate >= todayStart;
    const matchesCategory = selectedCategory === "সব" || loc.foodType === selectedCategory;
    
    return isUpcoming && matchesCategory;
  });

  const handleVote = async (id, isTrue) => {
    const votedItems = JSON.parse(localStorage.getItem('voted_iftars') || '{}');
    if (votedItems[id]) {
      Toast.fire({ icon: 'warning', title: 'আপনি ইতিমধ্যে ভোট দিয়েছেন!', background: '#fff', color: '#1e293b' });
      return;
    }

    const userId = auth.currentUser?.uid || "guest";
    const ref = doc(db, "iftar_locations", id);
    try {
      await updateDoc(ref, { [`votes.${userId}`]: isTrue });
      votedItems[id] = true;
      localStorage.setItem('voted_iftars', JSON.stringify(votedItems));
      Toast.fire({ icon: 'success', title: 'ভোট সফলভাবে জমা হয়েছে!', background: '#fff', color: '#1e293b' });
    } catch (err) { 
      Toast.fire({ icon: 'error', title: 'ভোট দেওয়া সম্ভব হয়নি।', background: '#fff', color: '#1e293b' });
    }
  };

  const handleComment = async (name, text) => {
    const ref = doc(db, "iftar_locations", selectedLoc.id);
    try {
      await updateDoc(ref, {
        comments: arrayUnion({
          name: name || "অচেনা পথিক",
          text: text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
      });
      Toast.fire({ icon: 'success', title: 'মন্তব্য সফলভাবে যোগ হয়েছে!', background: '#fff', color: '#1e293b' });
    } catch (err) { 
      Toast.fire({ icon: 'error', title: 'কমেন্ট সেভ করা যায়নি।', background: '#fff', color: '#1e293b' });
    }
  };

  const handleShare = async (loc) => {
    // Google Maps URL বাগ ফিক্স
    const mapsUrl = `https://www.google.com/maps?q=${loc.lat},${loc.lng}`;
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const text = `🌙 ইফতার আপডেট: ${loc.mosqueName}\n🍱 মেনু: ${loc.foodType}\n📍 ম্যাপ: ${mapsUrl}\n🔗 আরও দেখুন: ${siteUrl}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: 'ইফতার পয়েন্ট', text });
        return;
      } catch (err) { console.log("Share skipped"); }
    }

    try {
      await navigator.clipboard.writeText(text);
      Toast.fire({ icon: 'info', title: 'লিংক কপি করা হয়েছে!', background: '#fff', color: '#1e293b' });
    } catch (err) {
      Toast.fire({ icon: 'error', title: 'শেয়ার করা সম্ভব হয়নি' });
    }
  };

  return (
    <main className="relative h-screen w-full overflow-hidden bg-slate-50 font-sans">
      <div className="absolute top-6 inset-x-0 z-[1001] flex flex-col gap-4 px-6 pointer-events-none">
        <div className="flex justify-between items-center max-w-lg mx-auto w-full">
            <div className="bg-white/90 backdrop-blur-xl px-4 py-2.5 rounded-2xl flex items-center gap-2 border border-white shadow-xl pointer-events-auto">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                {/* এখানে locations.length এর বদলে filteredLocations.length ব্যবহার করা হয়েছে */}
                <p className="text-slate-900 text-[11px] font-black uppercase">আশেপাশে <span className="text-indigo-600 ml-1">{filteredLocations.length}টি ইফতার</span></p>
            </div>
            <div className="bg-slate-900 px-4 py-2.5 rounded-2xl shadow-xl pointer-events-auto flex items-center gap-2 border border-slate-800">
                <Calendar size={12} className="text-indigo-400" />
                <p className="text-white text-[10px] font-bold uppercase tracking-widest">Live Update</p>
            </div>
        </div>
        <CategoryChips selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
      </div>

      <MapView userPos={userPos} locations={filteredLocations} onMarkerClick={(loc) => setSelectedLoc(loc)} />

      <div className="absolute bottom-20 right-6 z-[1001] flex flex-col items-end gap-4 pointer-events-none">
        <button 
          onClick={() => window.location.reload()} 
          className="pointer-events-auto bg-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center border border-slate-100 transition-transform active:scale-90 hover:bg-slate-50 text-slate-700"
        >
          <LocateFixed size={20} />
        </button>

        <button 
          onClick={() => router.push('/add-iftar')} 
          className="pointer-events-auto h-14 px-6 rounded-2xl bg-slate-900 text-white font-black shadow-2xl flex items-center gap-2 transition-transform active:scale-95 hover:bg-slate-800"
        >
          <Plus size={22} /> 
          <span className="text-sm tracking-wide">যোগ করুন</span>
        </button>
      </div>

      {selectedLoc && (
        <IftarCard 
          selectedLoc={selectedLoc} 
          onClose={() => setSelectedLoc(null)} 
          onVote={handleVote}
          onComment={handleComment}
          onShare={handleShare}
        />
      )}
    </main>
  );
}
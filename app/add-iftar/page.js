"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic'; 
import 'leaflet/dist/leaflet.css';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { X, Clock, MapPin, ArrowRight, LocateFixed, MessageSquareText } from 'lucide-react';
import useLocation from '@/hooks/useLocation';
import { showToast } from '@/lib/toast'; 
import Swal from 'sweetalert2';

// Leaflet কম্পোনেন্টগুলোকে সার্ভার সাইড রেন্ডারিং (SSR) থেকে আলাদা করা
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const MapUpdater = dynamic(() => Promise.resolve(ChangeView), { ssr: false });
const EventManager = dynamic(() => Promise.resolve(LocationSelector), { ssr: false });

function ChangeView({ center, useMap }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.panTo(center); 
            setTimeout(() => map.invalidateSize(), 100);
        }
    }, [center, map]);
    return null;
}

function LocationSelector({ useMapEvents, setManualPos, setIsSearching }) {
    useMapEvents({
        moveend: (e) => {
            const center = e.target.getCenter();
            setManualPos([center.lat, center.lng]);
            setIsSearching(false);
        },
    });
    return null;
}

export default function AddIftarPage() {
    const router = useRouter();
    const { position: userPos } = useLocation();
    const [leaflet, setLeaflet] = useState(null);
    const [leafletModules, setLeafletModules] = useState(null);
    
    const [manualPos, setManualPos] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [nearbyMosques, setNearbyMosques] = useState([]);

    // সঠিক লোকাল তারিখ বের করার ফাংশন (টাইমজোন বাগ ফিক্সড)
    const getLocalDate = () => {
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        return new Date(now - offset).toISOString().split('T')[0];
    };

    const [formData, setFormData] = useState({
        mosqueName: '',
        description: '',
        foodType: 'খিচুড়ি',
        time: '18:15',
        date: getLocalDate() // ডিফল্ট তারিখ আজকের লোকাল তারিখ
    });

    const foodItems = [
        { id: 'khichuri', name: 'খিচুড়ি', icon: '🥘' },
        { id: 'biryani', name: 'বিরিয়ানি', icon: '🍛' },
        { id: 'tehari', name: 'তেহারি', icon: '🍚' },
        { id: 'box', name: 'বক্স ইফতার', icon: '🍱' },
        { id: 'chola', name: 'ছোলা-মুড়ি', icon: '🥣' },
    ];

    useEffect(() => {
        if (typeof window !== 'undefined') {
            Promise.all([
                import('leaflet'),
                import('react-leaflet')
            ]).then(([L, RL]) => {
                setLeaflet(L);
                setLeafletModules(RL);
            });
        }
    }, []);

    useEffect(() => {
        const targetPos = manualPos || userPos;
        if (targetPos) {
            const query = `[out:json];node["amenity"="place_of_worship"]["religion"="muslim"](around:1000,${targetPos[0]},${targetPos[1]});out;`;
            fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`)
                .then(res => res.json())
                .then(data => {
                    if (data.elements) {
                        const mosques = data.elements.map(m => ({
                            id: m.id,
                            lat: m.lat,
                            lng: m.lon,
                            name: m.tags.name || "মসজিদ"
                        }));
                        setNearbyMosques(mosques);
                    }
                }).catch(err => console.error(err));
        }
    }, [manualPos, userPos]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.length > 2 && isSearching) {
                fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}&countrycodes=bd&limit=5`)
                    .then(res => res.json())
                    .then(data => setSearchResults(data));
            } else {
                setSearchResults([]);
            }
        }, 400);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, isSearching]);

    useEffect(() => {
        if (manualPos && !isSearching) {
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${manualPos[0]}&lon=${manualPos[1]}`)
                .then(res => res.json())
                .then(data => {
                    if (data.display_name) {
                        const addr = data.display_name.split(',');
                        setSearchQuery(addr[0] + (addr[1] ? ',' + addr[1] : ''));
                    }
                });
        }
    }, [manualPos]);

    const colorfulMosqueIcon = useMemo(() => {
        if (!leaflet) return null;
        return new leaflet.divIcon({
            html: `<div style="font-size: 26px; background: #4f46e5; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; border-radius: 12px; box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4); border: 2px solid white; transform: rotate(-45deg); margin-top: -10px;">
                    <div style="transform: rotate(45deg);">🕌</div>
                   </div>`,
            className: 'custom-mosque-marker',
            iconSize: [42, 42],
            iconAnchor: [21, 42],
        });
    }, [leaflet]);

    const handleMosqueClick = (mosque) => {
        setFormData(prev => ({ ...prev, mosqueName: mosque.name }));
        setSearchQuery(mosque.name);
        setManualPos([mosque.lat, mosque.lng]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const finalPos = manualPos || userPos;
        if(!finalPos) {
            showToast("লোকেশন পাওয়া যায়নি!", "error");
            return;
        }
        setLoading(true);
        try {
            await addDoc(collection(db, "iftar_locations"), {
                ...formData,
                locationName: searchQuery,
                lat: finalPos[0],
                lng: finalPos[1],
                upVotes: 0,
                downVotes: 0,
                createdAt: serverTimestamp(),
                comments: []
            });

            await Swal.fire({
                title: 'মা-শা-আল্লাহ!',
                text: 'ইফতারের তথ্যটি সফলভাবে শেয়ার করা হয়েছে।',
                icon: 'success',
                confirmButtonText: 'জাজাকাল্লাহু খাইরান',
                confirmButtonColor: '#4f46e5',
                background: '#ffffff',
                customClass: { popup: 'rounded-[2rem]', confirmButton: 'rounded-xl px-6 py-3 font-bold' }
            });
            router.push('/');
        } catch (err) {
            showToast("তথ্য সেভ করা যায়নি।", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="h-screen w-full bg-white overflow-y-auto flex flex-col items-center px-6 pt-8 pb-32 custom-scrollbar font-sans">
            <div className="w-full max-w-lg flex items-center justify-between mb-8 flex-shrink-0">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">ইফতারের তথ্য দিন</h2>
                    <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mt-1">রোজাদারদের সঠিক তথ্য শেয়ার করে এলাকায় ভাই ও বন্ধুদের সঙ্গে বিরিয়ানি উপভোগ করার সুযোগ করে দিন।</p>
                </div>
                <button onClick={() => router.back()} className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm active:scale-90 transition-all">
                    <X size={24} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-6">
                <div className="group">
                    <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest ml-1">মসজিদ বা মাদ্রাসার নাম:</label>
                    <input 
                        type="text" required placeholder="উদা: বায়তুল মোকাররম মসজিদ"
                        className="w-full p-5 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 bg-slate-50/50"
                        value={formData.mosqueName}
                        onChange={(e) => setFormData({...formData, mosqueName: e.target.value})}
                    />
                </div>

                <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">আজকের ইফতার মেনু:</label>
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {foodItems.map((item) => (
                            <button
                                key={item.id} type="button"
                                onClick={() => setFormData({...formData, foodType: item.name})}
                                className={`flex-shrink-0 px-6 py-4 rounded-[1.5rem] font-bold text-sm transition-all border-2 flex items-center gap-2 shadow-sm
                                    ${formData.foodType === item.name ? 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-100' : 'bg-white border-slate-100 text-slate-400'}`}
                            >
                                <span className="text-lg">{item.icon}</span> {item.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-indigo-600 p-6 rounded-[2.5rem] shadow-xl shadow-indigo-100 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock size={12} className="text-white" />
                        <span className="text-[10px] font-black text-indigo-100 uppercase tracking-widest">ইফতারের সময় ও তারিখ</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {/* min attribute যোগ করা হয়েছে যাতে আজকের আগের তারিখ সিলেক্ট করা না যায় */}
                        <input 
                            type="date" 
                            min={getLocalDate()} 
                            value={formData.date} 
                            className="w-full p-4 rounded-2xl bg-white/10 border border-white/20 outline-none font-bold text-white" 
                            onChange={(e) => setFormData({...formData, date: e.target.value})} 
                        />
                        <input 
                            type="time" 
                            value={formData.time} 
                            className="w-full p-4 rounded-2xl bg-white/10 border border-white/20 outline-none font-bold text-white" 
                            onChange={(e) => setFormData({...formData, time: e.target.value})} 
                        />
                    </div>
                </div>

                <div className="space-y-3 relative">
                    <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest ml-1">সঠিক লোকেশন পিন করুন:</label>
                    <div className="relative group">
                        <input 
                            type="text" placeholder="এলাকার নাম লিখে খুঁজুন"
                            className="w-full p-4 pr-14 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 outline-none font-bold text-slate-700 transition-all bg-slate-50/50"
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setIsSearching(true); }}
                        />
                        <button 
                            type="button" onClick={() => setManualPos(userPos)}
                            className="absolute right-2 top-2 w-11 h-11 bg-white shadow-sm border border-slate-100 text-indigo-600 rounded-xl flex items-center justify-center active:scale-90"
                        >
                            <LocateFixed size={20} />
                        </button>

                        {searchResults.length > 0 && (
                            <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[9999] max-h-60 overflow-y-auto">
                                {searchResults.map((place, idx) => (
                                    <div 
                                        key={idx}
                                        onClick={() => {
                                            setManualPos([parseFloat(place.lat), parseFloat(place.lon)]);
                                            setSearchQuery(place.display_name);
                                            setSearchResults([]);
                                            setIsSearching(false);
                                        }}
                                        className="p-4 border-b border-slate-50 hover:bg-indigo-50 cursor-pointer transition-all text-xs font-bold text-slate-700"
                                    >
                                        {place.display_name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="h-72 w-full rounded-[2.5rem] border-4 border-slate-50 z-10 shadow-sm overflow-hidden relative">
                        {typeof window !== "undefined" && leaflet && leafletModules && (userPos || manualPos) ? (
                            <MapContainer 
                                center={manualPos || userPos} 
                                zoom={16} 
                                className="h-full w-full z-0"
                                scrollWheelZoom={true} 
                            >
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <MapUpdater center={manualPos || userPos} useMap={leafletModules.useMap} />
                                <EventManager 
                                    useMapEvents={leafletModules.useMapEvents} 
                                    setManualPos={setManualPos} 
                                    setIsSearching={setIsSearching} 
                                />
                                {nearbyMosques.map(mosque => (
                                    <Marker 
                                        key={mosque.id} 
                                        position={[mosque.lat, mosque.lng]} 
                                        icon={colorfulMosqueIcon} 
                                        eventHandlers={{ click: () => handleMosqueClick(mosque) }}
                                    />
                                ))}
                            </MapContainer>
                        ) : (
                            <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center font-bold text-slate-400">লোকেশন লোড হচ্ছে...</div>
                        )}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-[400] pointer-events-none">
                            <MapPin size={36} className="text-indigo-600 drop-shadow-2xl animate-bounce" />
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white space-y-3">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                        <MessageSquareText size={12} className="text-indigo-400" /> বিশেষ কোনো নির্দেশনা (ঐচ্ছিক):
                    </label>
                    <textarea 
                        rows="3" placeholder="যেমন: অতিরিক্ত প্যাকেট পাওয়া যাবে কি না, কে ইফতার দিচ্ছেন ইত্যাদি..."
                        className="w-full p-4 rounded-xl bg-white/10 border border-white/10 outline-none font-bold text-sm text-white focus:bg-white/20 transition-all"
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                    ></textarea>
                </div>

                <button 
                    type="submit" disabled={loading}
                    className={`w-full py-5 rounded-[2rem] font-black text-xl transition-all flex items-center justify-center gap-3
                    ${loading ? 'bg-slate-200 text-slate-400' : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-lg shadow-indigo-100'}`}
                >
                    {loading ? "পাবলিশ হচ্ছে..." : <><span>পাবলিশ করুন</span> <ArrowRight size={22} /></>}
                </button>
            </form>
        </main>
    );
}
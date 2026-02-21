"use client";
import { MapContainer, TileLayer, Marker, useMapEvents, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState, useMemo } from 'react';

// ১. ম্যাপ ভিউ আপডেট করার সাব-কম্পোনেন্ট
function ChangeView({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center && center[0] && center[1]) {
            map.setView(center, map.getZoom());
            setTimeout(() => {
                map.invalidateSize();
            }, 100);
        }
    }, [center, map]);
    return null;
}

export default function MapView({ userPos, locations = [], isAdding, setManualPos, onMarkerClick }) {
    const [leaflet, setLeaflet] = useState(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            import('leaflet').then((L) => {
                // ডিফল্ট মার্কার শ্যাডো ফিক্স
                delete L.Icon.Default.prototype._getIconUrl;
                L.Icon.Default.mergeOptions({
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                });
                setLeaflet(L);
            });
        }
    }, []);

    // ২. খাবারের ধরণ অনুযায়ী কালারফুল ও প্রিমিয়াম আইকন সেট করা
    const getFoodIcon = (foodType) => {
    if (!leaflet) return null;

    // খাবার অনুযায়ী ইমোজি ম্যাপিং
    const emojiMapping = {
        'খিচুড়ি': '🥘',
        'বিরিয়ানি': '🍛',
        'তেহারি': '🍚',
        'বক্স ইফতার': '🍱',
        'ছোলা-মুড়ি': '🥣',
    };

    const emoji = emojiMapping[foodType] || '🌙'; // ডিফল্ট ইমোজি

    // divIcon ব্যবহার করে ইমোজিকে মার্কার বানানো
    return new leaflet.divIcon({
        html: `<div style="
                font-size: 30px; 
                background: white; 
                width: 45px; 
                height: 45px; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                border-radius: 50%; 
                box-shadow: 0 4px 10px rgba(0,0,0,0.2);
                border: 2px solid #4f46e5;
                ">
                ${emoji}
               </div>`,
        className: 'custom-emoji-marker',
        iconSize: [45, 45],
        iconAnchor: [22, 45], // নিচ বরাবর এঙ্কর করতে
    });

        return new leaflet.Icon({
            iconUrl: iconUrl,
            iconSize: [42, 42], // সামান্য বড় করা হয়েছে যাতে দেখতে সুন্দর লাগে
            iconAnchor: [21, 42],
            popupAnchor: [1, -34],
            className: 'drop-shadow-2xl animate-in zoom-in duration-300' // এনিমেশন এবং শ্যাডো যোগ করা হয়েছে
        });
    };

    // ৩. ইউজারের নিজের লোকেশনের জন্য প্রিমিয়াম ব্লু ডট আইকন
    const userLocationIcon = useMemo(() => {
        if (!leaflet) return null;
        return new leaflet.Icon({
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/7133/7133312.png', // Blue pulse/Navigation icon
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
    }, [leaflet]);

    // ৪. আশেপাশের মসজিদের জন্য ছোট আইকন (isAdding mode এ)
    const smallMosqueIcon = useMemo(() => {
        if (!leaflet) return null;
        return new leaflet.Icon({
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/2800/2800318.png',
            iconSize: [24, 24],
            iconAnchor: [12, 24],
            className: 'nearby-mosque-pointer opacity-70 grayscale-[0.3]'
        });
    }, [leaflet]);

    // লোকেশন সিলেক্টর লজিক (ড্র্যাগ করে পিন সেট করা)
    function LocationSelector() {
        useMapEvents({
            moveend: (e) => {
                if (isAdding && setManualPos) {
                    const center = e.target.getCenter();
                    setManualPos([center.lat, center.lng]);
                }
            },
        });
        return null;
    }

    if (!leaflet || !userPos) {
        return (
            <div className="h-full w-full bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-black text-slate-400 text-sm uppercase tracking-widest">ম্যাপ লোড হচ্ছে...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full relative">
            <MapContainer 
                key={isAdding ? 'adding-map' : 'view-map'}
                center={userPos} 
                zoom={16} 
                className="h-full w-full z-0"
                scrollWheelZoom={true}
                zoomControl={false} // কাস্টম ইউআই এর জন্য ডিফল্ট কন্ট্রোল অফ
            >
                {/* প্রিমিয়াম ম্যাপ স্টাইল (CartoDB Light) ব্যবহার করা যেতে পারে অথবা স্ট্যান্ডার্ড OSM */}
                <TileLayer 
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; OpenStreetMap'
                />
                
                <ChangeView center={userPos} />
                <LocationSelector />
                
                {/* ইউজারের নিজের বর্তমান লোকেশন মার্কার */}
                {!isAdding && userPos && (
                    <Marker position={userPos} icon={userLocationIcon} />
                )}

                {isAdding ? (
                    // ইফতার যোগ করার সময় আশেপাশের সম্ভাব্য মসজিদগুলো
                    locations.map((loc, idx) => (
                        <Marker 
                            key={`mosque-${idx}`} 
                            position={[loc.lat, loc.lng]} 
                            icon={smallMosqueIcon}
                        />
                    ))
                ) : (
                    // হোম পেজে খাবার অনুযায়ী কালারফুল আইকন
                    locations.map((loc) => (
                        <Marker 
                            key={loc.id} 
                            position={[loc.lat, loc.lng]} 
                            icon={getFoodIcon(loc.foodType)} 
                            eventHandlers={{ 
                                click: () => onMarkerClick && onMarkerClick(loc) 
                            }}
                        />
                    ))
                )}

                {/* ৫. ইউজারের এলাকার জন্য একটি সুন্দর ভিজ্যুয়াল সার্কেল */}
                {!isAdding && userPos && (
                    <Circle 
                        center={userPos} 
                        radius={400} 
                        pathOptions={{ 
                            color: '#6366f1', 
                            fillColor: '#6366f1', 
                            fillOpacity: 0.04, 
                            weight: 1,
                            dashArray: '5, 10' 
                        }} 
                    />
                )}
            </MapContainer>
        </div>
    );
}
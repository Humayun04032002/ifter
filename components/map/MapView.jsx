"use client";
import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// ১. Leaflet কম্পোনেন্টগুলো ডায়নামিকভাবে ইমপোর্ট করা
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then((mod) => mod.Circle), { ssr: false });
const MapUpdater = dynamic(() => Promise.resolve(ChangeView), { ssr: false });
const EventManager = dynamic(() => Promise.resolve(LocationSelector), { ssr: false });

// ম্যাপ ভিউ আপডেট করার সাব-কম্পোনেন্ট
function ChangeView({ center, useMap }) {
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

// লোকেশন সিলেক্টর লজিক
function LocationSelector({ isAdding, setManualPos, useMapEvents }) {
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

export default function MapView({ userPos, locations = [], isAdding, setManualPos, onMarkerClick }) {
    const [leaflet, setLeaflet] = useState(null);
    const [leafletModules, setLeafletModules] = useState(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            Promise.all([
                import('leaflet'),
                import('react-leaflet')
            ]).then(([L, RL]) => {
                // ডিফল্ট মার্কার ফিক্স
                delete L.Icon.Default.prototype._getIconUrl;
                L.Icon.Default.mergeOptions({
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                });
                setLeaflet(L);
                setLeafletModules(RL);
            });
        }
    }, []);

    // ২. ইমোজি আইকন জেনারেটর
    const getFoodIcon = (foodType) => {
        if (!leaflet) return null;
        const emojiMapping = {
            'খিচুড়ি': '🥘',
            'বিরিয়ানি': '🍛',
            'তেহারি': '🍚',
            'বক্স ইফতার': '🍱',
            'ছোলা-মুড়ি': '🥣',
        };
        const emoji = emojiMapping[foodType] || '🌙';

        return new leaflet.divIcon({
            html: `<div style="
                    font-size: 26px; 
                    background: white; 
                    width: 42px; 
                    height: 42px; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    border-radius: 14px; 
                    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
                    border: 2.5px solid #4f46e5;
                    ">
                    ${emoji}
                   </div>`,
            className: 'custom-emoji-marker',
            iconSize: [42, 42],
            iconAnchor: [21, 42],
        });
    };

    // ৩. ইউজারের বর্তমান লোকেশন আইকন
    const userLocationIcon = useMemo(() => {
        if (!leaflet) return null;
        return new leaflet.divIcon({
            html: `<div class="relative">
                    <div class="absolute -inset-2 bg-indigo-500 rounded-full animate-ping opacity-20"></div>
                    <div class="relative bg-indigo-600 w-4 h-4 rounded-full border-2 border-white shadow-lg"></div>
                   </div>`,
            className: 'user-pos-marker',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        });
    }, [leaflet]);

    // ৪. আশেপাশের মসজিদের ছোট আইকন
    const smallMosqueIcon = useMemo(() => {
        if (!leaflet) return null;
        return new leaflet.divIcon({
            html: `<div style="font-size: 18px; opacity: 0.8;">🕌</div>`,
            className: 'mosque-pointer',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });
    }, [leaflet]);

    if (!leaflet || !leafletModules || !userPos) {
        return (
            <div className="h-full w-full bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-bold text-slate-400 text-[10px] uppercase tracking-[0.2em]">ম্যাপ প্রস্তুত হচ্ছে...</p>
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
                zoomControl={false}
            >
                <TileLayer 
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; OpenStreetMap'
                />
                
                <MapUpdater center={userPos} useMap={leafletModules.useMap} />
                
                <EventManager 
                    isAdding={isAdding} 
                    setManualPos={setManualPos} 
                    useMapEvents={leafletModules.useMapEvents} 
                />
                
                {!isAdding && userPos && (
                    <>
                        <Marker position={userPos} icon={userLocationIcon} />
                        <Circle 
                            center={userPos} 
                            radius={500} 
                            pathOptions={{ 
                                color: '#6366f1', 
                                fillColor: '#6366f1', 
                                fillOpacity: 0.03, 
                                weight: 1,
                                dashArray: '4, 8' 
                            }} 
                        />
                    </>
                )}

                {isAdding ? (
                    locations.map((loc, idx) => (
                        <Marker 
                            key={`mosque-${idx}`} 
                            position={[loc.lat, loc.lng]} 
                            icon={smallMosqueIcon}
                        />
                    ))
                ) : (
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
            </MapContainer>
        </div>
    );
}
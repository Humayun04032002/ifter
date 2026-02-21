import L from 'leaflet';

export const getFoodIcon = (foodType) => {
  const icons = {
    'বিরিয়ানি': '🍛',
    'খিচুড়ি': '🥘',
    'তেহারি': '🍚',
    'বক্স ইফতার': '🍱',
    'ফল ও শরবত': '🥤',
  };

  return L.divIcon({
    html: `<div class="bg-white p-2 rounded-full shadow-xl border-2 border-indigo-500 text-2xl flex items-center justify-center animate-bounce-slow">
             ${icons[foodType] || '🕌'}
           </div>`,
    className: 'custom-marker',
    iconSize: [45, 45],
    iconAnchor: [22, 45]
  });
};
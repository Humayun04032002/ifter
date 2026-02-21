import { Search, MapPin } from 'lucide-react';

export default function SearchBar({ value, onChange }) {
  return (
    <div className="absolute top-6 inset-x-0 z-[1000] px-6 pointer-events-none">
      <div className="max-w-md mx-auto bg-white/90 backdrop-blur-xl border border-white shadow-2xl rounded-3xl flex items-center px-5 py-2 pointer-events-auto">
        <Search size={20} className="text-indigo-600" />
        <input 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="কাছের ইফতার খুঁজুন..." 
          className="flex-1 bg-transparent border-none outline-none p-3 font-bold text-slate-700 text-sm"
        />
        <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
           <MapPin size={18} />
        </div>
      </div>
    </div>
  );
}
// components/home/CategoryChips.jsx
"use client";

const categories = [
  { id: 1, name: "সব", emoji: "🌙" },
  { id: 2, name: "খিচুড়ি", emoji: "🥘" },
  { id: 3, name: "বিরিয়ানি", emoji: "🍛" },
  { id: 4, name: "তেহারি", emoji: "🍚" },
  { id: 5, name: "বক্স ইফতার", emoji: "🍱" },
  { id: 6, name: "ছোলা-মুড়ি", emoji: "🥣" },
];

export default function CategoryChips({ selectedCategory, setSelectedCategory }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pointer-events-auto py-2">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => setSelectedCategory(cat.name)}
          className={`flex items-center gap-2 px-5 py-3.5 rounded-[1.25rem] font-black text-xs whitespace-nowrap transition-all border
          ${selectedCategory === cat.name 
            ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-200' 
            : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50 shadow-sm'}`}
        >
          <span>{cat.emoji}</span>
          {cat.name}
        </button>
      ))}
    </div>
  );
}
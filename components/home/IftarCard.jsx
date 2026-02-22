"use client";
import React, { useState } from 'react';
import { X, Clock, ThumbsUp, ThumbsDown, MessageSquare, Send, Share2, Navigation, MapPin, CheckCircle2, ChevronDown, Edit3, Info, Calendar, Utensils } from 'lucide-react';

export default function IftarCard({ selectedLoc, onClose, onVote, onComment, onShare }) {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [showVoteOptions, setShowVoteOptions] = useState(false);
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");

  if (!selectedLoc) return null;

  // সময়কে AM/PM ফরম্যাটে রূপান্তর
  const formatTimeAMPM = (timeStr) => {
    if (!timeStr) return "--:--";
    try {
      const [hours, minutes] = timeStr.split(':');
      let h = parseInt(hours);
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      return `${h}:${minutes} ${ampm}`;
    } catch (e) { return timeStr; }
  };

  // তারিখ ফরম্যাট
  const formatDate = (dateStr) => {
    if (!dateStr) return "আজকের ইফতার";
    const options = { day: 'numeric', month: 'long' };
    return new Date(dateStr).toLocaleDateString('bn-BD', options);
  };

  // ভোট পারসেন্টেজ ক্যালকুলেশন
  const totalVotes = (selectedLoc.upVotes || 0) + (selectedLoc.downVotes || 0);
  const upPercentage = totalVotes > 0 ? Math.round((selectedLoc.upVotes / totalVotes) * 100) : 0;
  const downPercentage = totalVotes > 0 ? 100 - upPercentage : 0;

  const getFoodVisual = (type) => {
    switch(type) {
      case 'খিচুড়ি': return { emoji: '🥘', color: 'bg-orange-100 text-orange-600' };
      case 'বিরিয়ানি': return { emoji: '🍛', color: 'bg-yellow-100 text-yellow-700' };
      case 'তেহারি': return { emoji: '🍚', color: 'bg-amber-100 text-amber-700' };
      case 'বক্স ইফতার': return { emoji: '🍱', color: 'bg-emerald-100 text-emerald-700' };
      case 'ছোলা-মুড়ি': return { emoji: '🥣', color: 'bg-red-100 text-red-600' };
      default: return { emoji: '🌙', color: 'bg-indigo-100 text-indigo-700' };
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    onComment(commentName, commentText);
    setCommentName(""); setCommentText(""); setShowCommentForm(false);
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${selectedLoc.lat},${selectedLoc.lng}`;

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-900/60 backdrop-blur-[4px] flex items-end md:items-center md:justify-center p-0 md:p-6 overflow-hidden">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative bg-white w-full md:max-w-xl md:rounded-[3rem] rounded-t-[3.5rem] max-h-[95vh] md:max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom md:zoom-in duration-500 overflow-hidden">
        
        <div className="w-14 h-1.5 bg-slate-200 rounded-full mx-auto mt-5 mb-2 shrink-0 md:hidden" />

        {/* Header */}
        <div className="px-6 md:px-10 pt-4 pb-6 flex justify-between items-start shrink-0">
          <div className="flex items-center gap-4 md:gap-6">
            <div className={`w-14 h-14 md:w-20 md:h-20 ${getFoodVisual(selectedLoc.foodType).color} rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center text-3xl md:text-5xl shadow-inner border border-white`}>
              {getFoodVisual(selectedLoc.foodType).emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl md:text-3xl font-black text-slate-900 leading-tight truncate">{selectedLoc.mosqueName}</h2>
              <div className="flex flex-col gap-0.5 mt-1">
                <div className="flex items-center gap-1.5 text-slate-500">
                   <MapPin size={14} className="text-rose-500 shrink-0" />
                   <p className="text-[12px] md:text-sm font-bold truncate">{selectedLoc.locationName || "লোকেশন পাওয়া যায়নি"}</p>
                </div>
                <p className="text-[10px] md:text-xs font-black text-indigo-600 ml-5 uppercase tracking-wider">
                   {selectedLoc.distance?.toFixed(1)} কিমি দূরে
                </p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 md:p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-400 transition-colors shrink-0">
            <ChevronDown size={28} className="md:hidden block" />
            <X size={24} className="md:block hidden" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 md:px-10 space-y-4 no-scrollbar pb-6">
          
          {/* ১. সময় এবং তারিখ */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-indigo-50/50 p-4 rounded-[2rem] border border-indigo-100">
              <p className="text-[10px] font-black text-indigo-400 uppercase mb-1 tracking-widest">সময়সূচী</p>
              <p className="font-black text-indigo-900 text-sm md:text-base flex items-center gap-2">
                <Clock size={14} /> {formatTimeAMPM(selectedLoc.time)}
              </p>
            </div>
            <div className="bg-rose-50/50 p-4 rounded-[2rem] border border-rose-100">
              <p className="text-[10px] font-black text-rose-400 uppercase mb-1 tracking-widest">তারিখ</p>
              <p className="font-black text-rose-900 text-sm md:text-base flex items-center gap-2">
                <Calendar size={14} /> {formatDate(selectedLoc.date)}
              </p>
            </div>
          </div>

          {/* ২. খাবারের মেনু */}
          <div className="bg-slate-50 p-5 rounded-[2.5rem] border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">আজকের মেনু</p>
              <p className="font-black text-slate-800 text-lg md:text-xl flex items-center gap-2">
                <Utensils size={18} className="text-indigo-600"/> {selectedLoc.foodType}
              </p>
            </div>
            <span className="text-4xl opacity-20">{getFoodVisual(selectedLoc.foodType).emoji}</span>
          </div>

          {/* ৩. ভোটের পারসেন্টেজ (সঠিক বনাম ভুল) */}
          <div className="bg-white border border-slate-100 p-5 rounded-[2.5rem] shadow-sm">
             <div className="flex justify-between items-end mb-2 px-1">
                <span className="text-[10px] font-black text-emerald-600 uppercase">সঠিক: {upPercentage}%</span>
                <span className="text-[10px] font-black text-rose-600 uppercase">ভুল: {downPercentage}%</span>
             </div>
             {/* প্রগ্রেস বার */}
             <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                <div style={{ width: `${upPercentage}%` }} className="h-full bg-emerald-500 transition-all duration-1000" />
                <div style={{ width: `${downPercentage}%` }} className="h-full bg-rose-500 transition-all duration-1000" />
             </div>
             <p className="text-center text-[9px] text-slate-400 font-bold mt-2 uppercase tracking-tighter">মোট {totalVotes} জন তাদের মতামত দিয়েছেন</p>
          </div>

          {/* ৪. তথ্য যাচাই বাটন */}
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-[2.5rem] p-5">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[11px] font-black text-indigo-600 uppercase flex items-center gap-1.5"><CheckCircle2 size={14}/> আপনার মতামত</p>
                <p className="text-xs text-indigo-900 font-bold">এই তথ্যটি কি সঠিক?</p>
              </div>
              <button onClick={() => setShowVoteOptions(!showVoteOptions)} className="px-4 py-2 rounded-xl font-black text-xs bg-indigo-600 text-white active:scale-95 transition-transform">ভোট দিন</button>
            </div>
            {showVoteOptions && (
              <div className="grid grid-cols-2 gap-3 mt-4 animate-in fade-in zoom-in">
                <button onClick={() => onVote(selectedLoc.id, true)} className="flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white rounded-xl font-black text-[10px]"><ThumbsUp size={14} /> সঠিক</button>
                <button onClick={() => onVote(selectedLoc.id, false)} className="flex items-center justify-center gap-2 py-3 bg-rose-500 text-white rounded-xl font-black text-[10px]"><ThumbsDown size={14} /> ভুল</button>
              </div>
            )}
          </div>

          {/* বাকি সব (Description, Comments) */}
          {selectedLoc.description && (
            <div className="bg-amber-50/50 border border-amber-100 p-5 rounded-[2.5rem]">
               <p className="text-slate-700 text-xs font-bold italic leading-relaxed">"{selectedLoc.description}"</p>
            </div>
          )}

          {/* Comments Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-black text-slate-800 text-base flex items-center gap-2"><MessageSquare size={18} className="text-indigo-600"/> রিভিউ ({selectedLoc.comments?.length || 0})</h3>
              <button onClick={() => setShowCommentForm(!showCommentForm)} className="text-indigo-600 font-black text-[10px] bg-indigo-50 px-3 py-1.5 rounded-lg flex items-center gap-1"><Edit3 size={12}/> লিখুন</button>
            </div>

            {showCommentForm && (
              <form onSubmit={handleCommentSubmit} className="bg-slate-900 p-5 rounded-[2rem] space-y-3">
                <input required placeholder="আপনার নাম" className="w-full p-3 bg-white/10 rounded-xl text-xs text-white outline-none border border-white/5" value={commentName} onChange={e => setCommentName(e.target.value)} />
                <div className="relative">
                  <textarea required rows="2" placeholder="আপনার অভিজ্ঞতা..." className="w-full p-3 pr-12 bg-white/10 rounded-xl text-xs text-white outline-none border border-white/5" value={commentText} onChange={e => setCommentText(e.target.value)} />
                  <button type="submit" className="absolute right-2 bottom-2 bg-indigo-600 p-2 rounded-lg text-white"><Send size={16}/></button>
                </div>
              </form>
            )}

            <div className="space-y-3 pb-2">
              {selectedLoc.comments?.map((c, i) => (
                <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-black text-indigo-600 text-[10px] uppercase">{c.name}</p>
                    <p className="text-[9px] text-slate-400 font-bold">{c.time}</p>
                  </div>
                  <p className="text-slate-700 text-xs font-bold leading-relaxed">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-6 border-t border-slate-50 grid grid-cols-2 gap-4 bg-white shrink-0">
          <button onClick={() => onShare(selectedLoc)} className="bg-slate-100 text-slate-700 py-4 rounded-[2rem] font-black flex items-center justify-center gap-2 active:scale-95 transition-all text-sm">
            <Share2 size={18} /> শেয়ার
          </button>
          <button onClick={() => window.open(googleMapsUrl, '_blank')} className="bg-slate-900 text-white py-4 rounded-[2rem] font-black flex items-center justify-center gap-2 active:scale-95 transition-all text-sm shadow-xl shadow-slate-200">
            <Navigation size={18} /> ম্যাপ দেখুন
          </button>
        </div>
      </div>
    </div>
  );
}
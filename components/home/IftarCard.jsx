"use client";
import React, { useState } from 'react';
import { X, Clock, Users, ThumbsUp, ThumbsDown, MessageSquare, Send, Share2, Navigation, MapPin, CheckCircle2, ChevronDown, Edit3, Info } from 'lucide-react';

export default function IftarCard({ selectedLoc, onClose, onVote, onComment, onShare }) {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [showVoteOptions, setShowVoteOptions] = useState(false);
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");

  if (!selectedLoc) return null;

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
    setCommentName("");
    setCommentText("");
    setShowCommentForm(false);
  };

  // গুগল ম্যাপস এর সঠিক লিংক জেনারেটর
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
                   <p className="text-[12px] md:text-sm font-bold truncate">{selectedLoc.locationName || "লোকেশন নাম পাওয়া যায়নি"}</p>
                </div>
                <p className="text-[10px] md:text-xs font-black text-indigo-600 ml-5 uppercase tracking-wider">
                   {selectedLoc.distance?.toFixed(1)} কিমি দূরে
                </p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 md:p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-400 transition-colors shrink-0">
            <X size={24} className="md:block hidden" />
            <ChevronDown size={28} className="md:hidden block" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 md:px-10 space-y-6 md:space-y-8 no-scrollbar pb-6">
          
          {/* Main Info Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 md:p-6 rounded-[2rem] border border-slate-100">
              <p className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase mb-1 tracking-wider">সময়সূচী</p>
              <p className="font-black text-slate-800 text-base md:text-xl flex items-center gap-2"><Clock size={16} className="text-indigo-500"/> {selectedLoc.time}</p>
            </div>
            <div className="bg-slate-50 p-4 md:p-6 rounded-[2rem] border border-slate-100">
              <p className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase mb-1 tracking-wider">খাবার</p>
              <p className="font-black text-slate-800 text-base md:text-xl flex items-center gap-2"> {selectedLoc.foodType}</p>
            </div>
          </div>

          {/* Description / Additional Info */}
          {selectedLoc.description && (
            <div className="bg-amber-50/50 border border-amber-100 p-5 md:p-7 rounded-[2.5rem]">
               <p className="text-[11px] font-black text-amber-600 uppercase flex items-center gap-1.5 mb-2">
                 <Info size={14}/> অতিরিক্ত তথ্য
               </p>
               <p className="text-slate-700 text-sm md:text-base font-bold leading-relaxed italic">
                 "{selectedLoc.description}"
               </p>
            </div>
          )}

          {/* Voting */}
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-[2.5rem] p-5 md:p-7">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[11px] font-black text-indigo-600 uppercase flex items-center gap-1.5"><CheckCircle2 size={14}/> তথ্য যাচাইকরণ</p>
                <p className="text-sm md:text-base text-indigo-900 font-bold mt-0.5">তথ্যটি সঠিক কি না নিশ্চিত করুন</p>
              </div>
              <button onClick={() => setShowVoteOptions(!showVoteOptions)} className="px-5 py-3 rounded-2xl font-black text-xs md:text-sm bg-indigo-600 text-white shadow-lg shadow-indigo-200 active:scale-95 transition-transform shrink-0">ভোট দিন</button>
            </div>
            {showVoteOptions && (
              <div className="grid grid-cols-2 gap-3 mt-5 animate-in fade-in zoom-in duration-300">
                <button onClick={() => onVote(selectedLoc.id, true)} className="flex items-center justify-center gap-2 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-[11px] transition-colors"><ThumbsUp size={16} /> সঠিক ({selectedLoc.upVotes || 0})</button>
                <button onClick={() => onVote(selectedLoc.id, false)} className="flex items-center justify-center gap-2 py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black text-[11px] transition-colors"><ThumbsDown size={16} /> ভুল ({selectedLoc.downVotes || 0})</button>
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-slate-800 flex items-center gap-2 text-lg md:text-xl"><MessageSquare size={22} className="text-indigo-600"/> রিভিউ ({selectedLoc.comments?.length || 0})</h3>
              <button onClick={() => setShowCommentForm(!showCommentForm)} className="text-indigo-600 font-black text-xs bg-indigo-50 px-4 py-2 rounded-xl flex items-center gap-1 hover:bg-indigo-100 transition-colors"><Edit3 size={14}/> লিখুন</button>
            </div>

            {showCommentForm && (
              <form onSubmit={handleCommentSubmit} className="bg-slate-900 p-5 md:p-7 rounded-[2.5rem] space-y-4 animate-in slide-in-from-top duration-300">
                <input required placeholder="আপনার নাম" className="w-full p-4 bg-white/10 rounded-2xl text-xs text-white outline-none border border-white/5 focus:border-indigo-500 transition-colors" value={commentName} onChange={e => setCommentName(e.target.value)} />
                <div className="relative">
                  <textarea required rows="2" placeholder="আপনার অভিজ্ঞতা লিখুন..." className="w-full p-4 pr-14 bg-white/10 rounded-2xl text-sm text-white outline-none border border-white/5 focus:border-indigo-500 transition-colors" value={commentText} onChange={e => setCommentText(e.target.value)} />
                  <button type="submit" className="absolute right-3 bottom-3 bg-indigo-600 hover:bg-indigo-500 p-3 rounded-xl text-white transition-all active:scale-90"><Send size={18}/></button>
                </div>
              </form>
            )}

            <div className="space-y-4 pb-4">
              {selectedLoc.comments?.length > 0 ? (
                selectedLoc.comments.map((c, i) => (
                  <div key={i} className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 hover:border-indigo-100 transition-colors">
                    <div className="flex justify-between items-center mb-1.5">
                      <p className="font-black text-indigo-600 text-[11px] md:text-xs uppercase tracking-tighter">{c.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold tracking-tight">{c.time}</p>
                    </div>
                    <p className="text-slate-700 text-sm md:text-base font-bold leading-relaxed">{c.text}</p>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center">
                  <p className="text-slate-400 font-bold text-sm italic">এখনো কোনো রিভিউ নেই। প্রথম রিভিউটি আপনি লিখুন!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 md:px-10 py-6 md:py-8 border-t border-slate-50 grid grid-cols-2 gap-4 bg-white shrink-0">
          <button 
            onClick={() => onShare(selectedLoc)} 
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-4 md:py-5 rounded-[2.5rem] font-black flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Share2 size={20} /> শেয়ার
          </button>
          <button 
            onClick={() => window.open(googleMapsUrl, '_blank')} 
            className="bg-slate-900 hover:bg-slate-800 text-white py-4 md:py-5 rounded-[2.5rem] font-black flex items-center justify-center gap-2 shadow-2xl shadow-slate-200 transition-all active:scale-95"
          >
            <Navigation size={20} /> ম্যাপ দেখুন
          </button>
        </div>
      </div>
    </div>
  );
}
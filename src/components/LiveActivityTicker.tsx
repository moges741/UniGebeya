import React, { useEffect, useState } from 'react';
import { Flame, ShieldCheck, Sparkles, TrendingUp, Users } from 'lucide-react';

interface ActivityItem {
  id: string;
  badge: string;
  badgeColor: string;
  text: string;
  campus: string;
  timeAgo: string;
}

const ACTIVITIES: ActivityItem[] = [
  {
    id: '1',
    badge: 'APPROVED',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    text: 'MacBook Air M2 (16GB RAM)',
    campus: 'AAiT (5 Kilo)',
    timeAgo: 'Just now',
  },
  {
    id: '2',
    badge: 'RENTAL BOOKED',
    badgeColor: 'bg-amber-100 text-amber-800',
    text: 'Sony A7 III Camera Kit for Graduation',
    campus: 'Main Campus (6 Kilo)',
    timeAgo: '4m ago',
  },
  {
    id: '3',
    badge: 'VERIFIED MERCHANT',
    badgeColor: 'bg-blue-100 text-blue-800',
    text: 'Arat Kilo Campus Print & Copy Hub joined',
    campus: '4 Kilo Science',
    timeAgo: '12m ago',
  },
  {
    id: '4',
    badge: 'NEW LISTING',
    badgeColor: 'bg-purple-100 text-purple-800',
    text: 'Calculus & Engineering Textbook Pack',
    campus: 'AAiT Library',
    timeAgo: '18m ago',
  },
  {
    id: '5',
    badge: 'SERVICE OFFER',
    badgeColor: 'bg-indigo-100 text-indigo-800',
    text: 'Startup Pitch Deck & Figma UI Design',
    campus: 'EiABC Campus',
    timeAgo: '26m ago',
  },
];

export function LiveActivityTicker() {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % ACTIVITIES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const current = ACTIVITIES[currentIdx];

  return (
    <div className="bg-[#036A39]/8 border-y border-[#036A39]/12 py-2 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Left: Live Pulse Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#036A39]"></span>
            </span>
            <span className="font-bold text-[#036A39] tracking-wider uppercase text-[11px] flex items-center gap-1">
              Live Activity
            </span>
          </div>

          <div className="h-3.5 w-px bg-[#036A39]/20 hidden sm:block" />

          {/* Animated Activity Item */}
          <div className="flex items-center gap-2 overflow-hidden">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase shrink-0 transition-all ${current.badgeColor}`}
            >
              {current.badge}
            </span>
            <span className="font-semibold text-[#023B1F] truncate max-w-[200px] sm:max-w-xs md:max-w-md">
              {current.text}
            </span>
            <span className="text-[#023B1F]/60 hidden md:inline">·</span>
            <span className="text-[#9D7F32] font-medium hidden md:inline shrink-0">
              {current.campus}
            </span>
            <span className="text-[#023B1F]/50 text-[11px] shrink-0">({current.timeAgo})</span>
          </div>
        </div>

        {/* Right: Key Value Props Quick Trust Badges */}
        <div className="hidden lg:flex items-center gap-5 text-[#023B1F]/75 font-medium shrink-0">
          <div className="flex items-center gap-1 text-[#036A39]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C0A14E]" />
            <span>100% Moderated</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-[#036A39]" />
            <span>6 Campuses Connected</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-[#036A39]" />
            <span>Zero Broker Fees</span>
          </div>
        </div>
      </div>
    </div>
  );
}

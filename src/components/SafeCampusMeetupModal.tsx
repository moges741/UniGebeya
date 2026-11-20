import React, { useEffect } from 'react';
import {
  AlertTriangle,
  Building,
  CheckCircle,
  Clock,
  Eye,
  MapPin,
  Shield,
  ShieldCheck,
  Sun,
  X,
  Zap,
} from 'lucide-react';

interface SafeCampusMeetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const JU_SAFE_ZONES = [
  {
    campus: 'JiT (Kito Furdisa)',
    location: 'Innovation Center Gate & Tech Student Lounge',
    details: '24/7 security booth, well-lit seating area, and working AC power outlets to test laptops, phones, and chargers.',
    recommendedHours: '9:00 AM – 6:00 PM',
  },
  {
    campus: 'JU Main Campus',
    location: 'Central Library Plaza & Hachalu Hundessa Hall',
    details: 'High student foot traffic, visible campus security guards, and spacious public waiting zones.',
    recommendedHours: '8:30 AM – 6:30 PM',
  },
  {
    campus: 'JUMC (Health Campus)',
    location: 'Specialized Hospital Main Entrance & Student Cafeteria',
    details: 'Ideal for exchanging medical equipment, stethoscopes, lab coats, and reference books in public daylight.',
    recommendedHours: '9:00 AM – 5:30 PM',
  },
  {
    campus: 'JUCAVM (Agri / Eladale)',
    location: 'Administration Building Plaza',
    details: 'Secure open courtyard directly facing administrative offices and campus security checkpoint.',
    recommendedHours: '9:00 AM – 5:00 PM',
  },
];

export function SafeCampusMeetupModal({ isOpen, onClose }: SafeCampusMeetupModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative w-full max-w-3xl bg-[#F2F2F2] rounded-3xl shadow-2xl border border-[#036A39]/20 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#036A39] text-[#F2F2F2]">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-[#C0A14E]" />
            <div>
              <h2 className="text-lg font-bold">JU Safe Campus Meetup Guide</h2>
              <p className="text-xs text-[#F2F2F2]/80">
                Official verified meetup zones &amp; anti-fraud guidelines across Jimma University
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-[#F2F2F2]/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8">
          {/* 4 Essential Safety Rules */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#036A39] uppercase tracking-wider flex items-center gap-2">
              <Sun className="w-4 h-4 text-[#C0A14E]" />
              <span>The 4 Golden Rules of Campus Trading</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="bg-white p-4 rounded-2xl border border-[#036A39]/12 space-y-1.5 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-[#036A39]">
                  <Sun className="w-4 h-4 text-[#C0A14E]" />
                  <span>1. Trade in Daylight Only</span>
                </div>
                <p className="text-xs text-[#023B1F]/75 leading-relaxed">
                  Never meet at night, in secluded dorm corridors, or off-campus deserted alleys. Always meet during daylight hours.
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#036A39]/12 space-y-1.5 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-[#036A39]">
                  <Zap className="w-4 h-4 text-[#C0A14E]" />
                  <span>2. Test Electronics on Campus Outlets</span>
                </div>
                <p className="text-xs text-[#023B1F]/75 leading-relaxed">
                  When buying laptops, chargers, or cameras, use power outlets at the JiT Innovation Lounge or Central Library to inspect functionality.
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#036A39]/12 space-y-1.5 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-[#036A39]">
                  <AlertTriangle className="w-4 h-4 text-[#C0A14E]" />
                  <span>3. Zero Upfront Transfers</span>
                </div>
                <p className="text-xs text-[#023B1F]/75 leading-relaxed">
                  Never send Telebirr or CBE Birr advance "deposits" or "shipping fees". Pay only after physically inspecting the item.
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#036A39]/12 space-y-1.5 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-[#036A39]">
                  <CheckCircle className="w-4 h-4 text-[#C0A14E]" />
                  <span>4. Verify Student ID</span>
                </div>
                <p className="text-xs text-[#023B1F]/75 leading-relaxed">
                  Ask to see the counterparty&apos;s Jimma University student ID. Honest student peers will always gladly show it.
                </p>
              </div>
            </div>
          </div>

          {/* Verified Safe Meetup Zones Across JU */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#036A39] uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#C0A14E]" />
              <span>Designated Safe Meetup Locations at Jimma University</span>
            </h3>

            <div className="space-y-3">
              {JU_SAFE_ZONES.map((zone, idx) => (
                <div
                  key={idx}
                  className="bg-[#DEE0DF]/60 p-4 sm:p-5 rounded-2xl border border-[#036A39]/12 space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#036A39] text-[#F2F2F2] text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-[#036A39]">{zone.campus}</h4>
                      <span className="text-xs text-[#9D7F32] font-semibold hidden sm:inline">
                        — {zone.location}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#036A39] bg-[#036A39]/10 px-2.5 py-0.5 rounded-full w-fit">
                      <Clock className="w-3 h-3" />
                      <span>{zone.recommendedHours}</span>
                    </span>
                  </div>

                  <p className="text-xs text-[#023B1F]/80 leading-relaxed sm:pl-8">
                    {zone.details}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#DEE0DF]/60 border-t border-[#036A39]/12 flex items-center justify-between">
          <p className="text-xs text-[#023B1F]/70">
            Emergency on campus? Contact JU Campus Security at the main gates.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#036A39] text-[#F2F2F2] text-xs font-bold rounded-xl hover:bg-[#024D29] transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}

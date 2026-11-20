import React, { useState } from 'react';
import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  ChevronRight,
  Handshake,
  Megaphone,
  Send,
  Sparkles,
  Store,
  Users,
  X,
} from 'lucide-react';

interface PartnerInquiryForm {
  businessName: string;
  contactPerson: string;
  phone: string;
  campusVicinity: string;
  category: string;
  note: string;
}

export function BusinessPartnerShowcase() {
  const [modalOpen, setModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<PartnerInquiryForm>({
    businessName: '',
    contactPerson: '',
    phone: '',
    campusVicinity: 'AAiT (5 Kilo)',
    category: 'Electronics & Repairs',
    note: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setModalOpen(false);
    setForm({
      businessName: '',
      contactPerson: '',
      phone: '',
      campusVicinity: 'AAiT (5 Kilo)',
      category: 'Electronics & Repairs',
      note: '',
    });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Editorial Header */}
      <div className="bg-[#036A39] text-[#F2F2F2] rounded-3xl p-8 sm:p-12 border border-[#C0A14E]/30 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C0A14E]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C0A14E]/20 text-[#C0A14E] rounded-full text-xs font-bold uppercase tracking-wider">
              <Handshake className="w-3.5 h-3.5" />
              <span>Campus Business Partnership Program</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#F2F2F2] leading-tight">
              Grow your business with direct access to 25,000+ university students.
            </h2>

            <p className="text-sm sm:text-base text-[#F2F2F2]/85 leading-relaxed max-w-2xl">
              From laptop repair shops and photo studios to campus printing hubs and cafes—UNi GEBEYA
              gives local merchants verified trust badges, catalog showcase placement, and instant
              broadcast across our high-engagement campus Telegram community.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="px-6 py-3 bg-[#C0A14E] text-[#023B1F] text-sm font-bold rounded-xl hover:bg-[#cbb061] transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <span>Apply for Verified Business Badge</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <a
                href="https://t.me/uni_gebeya"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 border border-[#F2F2F2]/30 text-[#F2F2F2] text-sm font-medium rounded-xl hover:bg-[#F2F2F2]/10 transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4 text-[#229ED9]" />
                <span>Join @uni_gebeya Channel</span>
              </a>
            </div>
          </div>

          {/* Quick Metrics & Trust Card */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <div className="bg-[#024D29]/70 backdrop-blur-sm border border-[#C0A14E]/20 p-5 rounded-2xl space-y-1">
              <p className="text-2xl sm:text-3xl font-extrabold text-[#C0A14E] font-[JetBrains_Mono]">
                100%
              </p>
              <p className="text-xs font-semibold text-[#F2F2F2]">Verified Moderation</p>
              <p className="text-[11px] text-[#F2F2F2]/70 leading-snug">
                Every commercial listing inspected before public release.
              </p>
            </div>

            <div className="bg-[#024D29]/70 backdrop-blur-sm border border-[#C0A14E]/20 p-5 rounded-2xl space-y-1">
              <p className="text-2xl sm:text-3xl font-extrabold text-[#C0A14E] font-[JetBrains_Mono]">
                6+
              </p>
              <p className="text-xs font-semibold text-[#F2F2F2]">Addis Campuses</p>
              <p className="text-[11px] text-[#F2F2F2]/70 leading-snug">
                AAiT, 6 Kilo, 4 Kilo, Lideta, FBE, Tikur Anbessa.
              </p>
            </div>

            <div className="bg-[#024D29]/70 backdrop-blur-sm border border-[#C0A14E]/20 p-5 rounded-2xl space-y-1">
              <p className="text-2xl sm:text-3xl font-extrabold text-[#C0A14E] font-[JetBrains_Mono]">
                24/7
              </p>
              <p className="text-xs font-semibold text-[#F2F2F2]">Telegram Bot Sync</p>
              <p className="text-[11px] text-[#F2F2F2]/70 leading-snug">
                Instant notification to active buyer networks.
              </p>
            </div>

            <div className="bg-[#024D29]/70 backdrop-blur-sm border border-[#C0A14E]/20 p-5 rounded-2xl space-y-1">
              <p className="text-2xl sm:text-3xl font-extrabold text-[#C0A14E] font-[JetBrains_Mono]">
                0%
              </p>
              <p className="text-xs font-semibold text-[#F2F2F2]">Commission On Sales</p>
              <p className="text-[11px] text-[#F2F2F2]/70 leading-snug">
                Direct transactions between buyers and sellers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Merchant Showcase Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#F2F2F2] border border-[#036A39]/12 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-[#036A39]/30 transition-colors">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#036A39]/10 text-[#036A39] flex items-center justify-center">
              <Store className="w-5 h-5 text-[#036A39]" />
            </div>
            <h3 className="text-base font-bold text-[#036A39]">Campus Print &amp; Thesis Hub</h3>
            <p className="text-xs text-[#023B1F]/75 leading-relaxed">
              Fast, high-volume thesis binding, poster printing, and project drafting for engineering
              and architecture students with student discount pricing.
            </p>
          </div>
          <div className="pt-3 border-t border-[#036A39]/10 flex items-center justify-between text-xs">
            <span className="font-semibold text-[#036A39]">Verified Partner</span>
            <span className="text-[#9D7F32] font-medium">5 Kilo AAiT</span>
          </div>
        </div>

        <div className="bg-[#F2F2F2] border border-[#036A39]/12 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-[#036A39]/30 transition-colors">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#036A39]/10 text-[#036A39] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#C0A14E]" />
            </div>
            <h3 className="text-base font-bold text-[#036A39]">Tech Fix &amp; Laptop Diagnostics</h3>
            <p className="text-xs text-[#023B1F]/75 leading-relaxed">
              Same-day SSD upgrades, screen replacements, thermal paste service, and OS setup
              specifically tailored for university student hardware needs.
            </p>
          </div>
          <div className="pt-3 border-t border-[#036A39]/10 flex items-center justify-between text-xs">
            <span className="font-semibold text-[#036A39]">Verified Partner</span>
            <span className="text-[#9D7F32] font-medium">4 Kilo Science</span>
          </div>
        </div>

        <div className="bg-[#F2F2F2] border border-[#036A39]/12 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-[#036A39]/30 transition-colors">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#036A39]/10 text-[#036A39] flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-[#036A39]" />
            </div>
            <h3 className="text-base font-bold text-[#036A39]">Media, Camera &amp; Studio Rentals</h3>
            <p className="text-xs text-[#023B1F]/75 leading-relaxed">
              Daily and weekend equipment rentals (Sony, Canon, audio mics, lighting, projectors)
              for graduation ceremonies, student clubs, and creative projects.
            </p>
          </div>
          <div className="pt-3 border-t border-[#036A39]/10 flex items-center justify-between text-xs">
            <span className="font-semibold text-[#036A39]">Verified Partner</span>
            <span className="text-[#9D7F32] font-medium">6 Kilo Main</span>
          </div>
        </div>
      </div>

      {/* Business Partner Inquiry Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg bg-[#F2F2F2] rounded-2xl shadow-2xl border border-[#036A39]/20 p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-[#023B1F]/60 hover:text-[#023B1F] rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[#036A39]">
                    <BadgeCheck className="w-5 h-5 text-[#C0A14E]" />
                    <h3 className="text-xl font-bold">Partner with UNi GEBEYA</h3>
                  </div>
                  <p className="text-xs text-[#023B1F]/75">
                    Connect your shop, studio, or service with students across university campuses.
                  </p>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <label className="block text-xs font-semibold text-[#036A39] mb-1">
                      Business or Shop Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.businessName}
                      onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                      placeholder="e.g. Arat Kilo Print & Copy Express"
                      className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-[#036A39]/20 text-sm focus:border-[#036A39] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#036A39] mb-1">
                        Contact Person *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.contactPerson}
                        onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                        placeholder="Your name"
                        className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-[#036A39]/20 text-sm focus:border-[#036A39] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#036A39] mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+251 9..."
                        className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-[#036A39]/20 text-sm focus:border-[#036A39] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#036A39] mb-1">
                        Campus Vicinity
                      </label>
                      <select
                        value={form.campusVicinity}
                        onChange={(e) => setForm({ ...form, campusVicinity: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-[#036A39]/20 text-sm focus:border-[#036A39] focus:outline-none"
                      >
                        <option value="AAiT (5 Kilo)">AAiT (5 Kilo)</option>
                        <option value="Main Campus (6 Kilo)">Main Campus (6 Kilo)</option>
                        <option value="Science (4 Kilo)">Science (4 Kilo)</option>
                        <option value="EiABC (Lideta)">EiABC (Lideta)</option>
                        <option value="Black Lion (Tikur Anbessa)">Black Lion (Tikur Anbessa)</option>
                        <option value="FBE (Business & Economics)">FBE (Business & Economics)</option>
                        <option value="All Campuses">Multiple Campuses</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#036A39] mb-1">
                        Business Category
                      </label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-[#036A39]/20 text-sm focus:border-[#036A39] focus:outline-none"
                      >
                        <option value="Electronics & Repairs">Electronics & Repairs</option>
                        <option value="Printing & Stationery">Printing & Stationery</option>
                        <option value="Equipment & Camera Rentals">Equipment & Camera Rentals</option>
                        <option value="Books & Academic Supplies">Books & Academic Supplies</option>
                        <option value="Cafe & Food Delivery">Cafe & Food Delivery</option>
                        <option value="Student Housing / Hostel">Student Housing / Hostel</option>
                        <option value="Other Campus Service">Other Campus Service</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#036A39] mb-1">
                      Notes / What do you offer students?
                    </label>
                    <textarea
                      rows={2}
                      value={form.note}
                      onChange={(e) => setForm({ ...form, note: e.target.value })}
                      placeholder="e.g. 15% discount for verified university students on print jobs"
                      className="w-full px-3.5 py-2 bg-white rounded-lg border border-[#036A39]/20 text-sm focus:border-[#036A39] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-medium text-[#023B1F]/70 hover:text-[#023B1F]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#036A39] text-[#F2F2F2] text-xs font-bold rounded-lg hover:bg-[#024D29] transition-colors"
                  >
                    Submit Partnership Request
                  </button>
                </div>
              </form>
            ) : (
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-[#036A39]">
                    Partnership Request Received!
                  </h3>
                  <p className="text-xs text-[#023B1F]/75 max-w-sm mx-auto">
                    Thank you, <strong>{form.contactPerson}</strong>. Our campus business team will
                    contact you at <strong>{form.phone}</strong> to review your business verification.
                  </p>
                </div>
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-6 py-2.5 bg-[#036A39] text-[#F2F2F2] text-xs font-bold rounded-lg hover:bg-[#024D29] transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

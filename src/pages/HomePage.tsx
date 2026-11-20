import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ExternalLink,
  Flame,
  Handshake,
  MapPin,
  Megaphone,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { ListingCard } from '../components/ListingCard';
import { LiveActivityTicker } from '../components/LiveActivityTicker';
import { QuickViewModal } from '../components/QuickViewModal';
import { BusinessPartnerShowcase } from '../components/BusinessPartnerShowcase';
import {
  DEFAULT_CATEGORIES,
  HERO_IMAGE_URL,
  SHOWCASE_DEMO_LISTINGS,
} from '../data/seedData';
import { fetchApprovedListings, fetchCategories } from '../services/marketplaceService';
import { Category, Listing } from '../types/marketplace';

const CAMPUS_HUBS = [
  { name: 'All Campuses', query: '' },
  { name: 'JiT (Kito Furdisa)', query: 'JiT' },
  { name: 'JU Main Campus', query: 'Main' },
  { name: 'JUMC (Health)', query: 'Health' },
  { name: 'JUCAVM (Agri)', query: 'Agri' },
  { name: 'Jimma Town (Kochi)', query: 'Jimma' },
];

export function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [quickViewListing, setQuickViewListing] = useState<Listing | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('unigebeya_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const navigate = useNavigate();

  useEffect(() => {
    try {
      localStorage.setItem('unigebeya_bookmarks', JSON.stringify(bookmarkedIds));
    } catch {}
  }, [bookmarkedIds]);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const { data: liveCategories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const { data: liveListings = [], isLoading } = useQuery({
    queryKey: ['approved-listings'],
    queryFn: fetchApprovedListings,
  });

  const categories: Category[] =
    liveCategories.length > 0
      ? liveCategories
      : DEFAULT_CATEGORIES.map((c) => ({ ...c, createdAt: null, updatedAt: null }));

  const isUsingPreviewCatalog = !isLoading && liveListings.length === 0;

  const displayListings: Listing[] = isUsingPreviewCatalog
    ? SHOWCASE_DEMO_LISTINGS.map((item) => ({
        ...item,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    : liveListings;

  const featuredListings = displayListings.filter((l) => l.isFeatured).slice(0, 3);
  const recentListings = displayListings.slice(0, 6);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    navigate(trimmed ? `/marketplace?q=${encodeURIComponent(trimmed)}` : '/marketplace');
  };

  return (
    <div className="space-y-16">
      {/* Real-time Campus Velocity Ticker */}
      <LiveActivityTicker />

      {/* 1. Split Editorial Storefront Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Focal Column */}
          <div className="lg:col-span-7 bg-[#F2F2F2] border border-[#036A39]/12 rounded-3xl p-7 sm:p-10 lg:p-12 flex flex-col justify-between gap-8 shadow-sm">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#036A39]/8 text-[#036A39] rounded-full text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-[#C0A14E]" />
                <span>UNi GEBEYA · ዩኒ ገበያ — Campus Marketplace</span>
              </div>

              <h1
                className="font-[Bricolage_Grotesque] font-extrabold tracking-tight text-[#036A39] leading-[1.08]"
                style={{ fontSize: 'clamp(2.15rem, 3.8vw, 3.4rem)' }}
              >
                Buy, sell, rent, and hire across your university community.
              </h1>

              <p className="text-base text-[#023B1F]/80 leading-relaxed max-w-xl">
                The trusted digital marketplace connecting university students and local businesses.
                Discover verified laptops, engineering textbooks, camera gear rentals, and student
                services—every single listing reviewed by moderators before going live.
              </p>

              {/* Campus Quick-Select Chips */}
              <div className="pt-1">
                <p className="text-xs font-semibold text-[#023B1F]/60 mb-2 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C0A14E]" />
                  <span>Explore by Campus Vicinity:</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {CAMPUS_HUBS.map((hub) => (
                    <button
                      key={hub.name}
                      type="button"
                      onClick={() =>
                        navigate(hub.query ? `/marketplace?q=${encodeURIComponent(hub.query)}` : '/marketplace')
                      }
                      className="px-3 py-1 text-xs font-semibold bg-[#DEE0DF]/60 hover:bg-[#036A39] hover:text-[#F2F2F2] text-[#023B1F]/80 rounded-lg border border-[#036A39]/10 transition-all"
                    >
                      {hub.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Integrated Search Bar */}
              <form
                onSubmit={handleSearchSubmit}
                className="flex flex-col sm:flex-row gap-2.5 bg-[#DEE0DF]/60 p-2 rounded-2xl border border-[#036A39]/15"
              >
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#036A39]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search laptops, cameras, textbooks, tutoring, rentals..."
                    aria-label="Search marketplace listings"
                    className="w-full pl-10 pr-4 py-3 bg-[#F2F2F2] text-sm text-[#023B1F] placeholder:text-[#023B1F]/50 rounded-xl border border-transparent focus:border-[#036A39]/35 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#036A39] text-[#F2F2F2] text-sm font-bold rounded-xl hover:bg-[#024D29] transition-all whitespace-nowrap shrink-0 shadow-sm"
                >
                  Search Listings
                </button>
              </form>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm pt-1">
                <Link
                  to="/marketplace"
                  className="inline-flex items-center gap-1.5 font-bold text-[#036A39] hover:text-[#024D29] transition-colors"
                >
                  <span>Explore full catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/submit"
                  className="font-semibold text-[#023B1F]/75 hover:text-[#036A39] transition-colors"
                >
                  Post a listing for free
                </Link>
              </div>
            </div>
          </div>

          {/* Right Media & Omnichannel Bridge Column */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="relative flex-1 rounded-3xl overflow-hidden border border-[#036A39]/15 min-h-[280px] shadow-sm">
              <img
                src={HERO_IMAGE_URL}
                alt="University students trading laptops, books, and camera gear on campus"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#023B1F]/95 via-[#023B1F]/60 to-transparent p-6 sm:p-7">
                <div className="flex items-center gap-2 text-xs font-bold text-[#C0A14E] mb-1 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified Student &amp; Merchant Exchange</span>
                </div>
                <p className="text-sm text-[#F2F2F2]/95 leading-snug">
                  Evolved from our active campus Telegram marketplace into a structured, searchable
                  and secure web platform.
                </p>
              </div>
            </div>

            {/* Telegram Channel Spotlight Card */}
            <div className="bg-[#229ED9]/10 border border-[#229ED9]/30 rounded-2xl p-5 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#229ED9] uppercase tracking-wider flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5" />
                  <span>Telegram Community Sync</span>
                </p>
                <p className="text-xs text-[#023B1F]/80">
                  Approved web listings automatically broadcast to the <strong>@uni_gebeya</strong> Telegram channel.
                </p>
              </div>
              <a
                href="https://t.me/uni_gebeya"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#229ED9] text-white text-xs font-bold rounded-lg hover:bg-[#1e8cc2] transition-colors whitespace-nowrap shrink-0 shadow-sm flex items-center gap-1.5"
              >
                <span>Join Channel</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Clean Category Navigation Strip */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {categories.slice(0, 6).map((cat) => (
            <Link
              key={cat.id}
              to={`/marketplace?category=${encodeURIComponent(cat.id)}`}
              className="group bg-[#F2F2F2] border border-[#036A39]/12 rounded-2xl px-4 py-4 hover:border-[#036A39]/40 hover:shadow-md transition-all flex flex-col justify-between gap-1.5"
            >
              <span className="text-sm font-bold text-[#036A39] group-hover:text-[#024D29] line-clamp-1">
                {cat.name}
              </span>
              <span className="text-xs text-[#023B1F]/65 line-clamp-1 flex items-center gap-1">
                <span>Explore</span>
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 2. Featured & Recent Approved Marketplace Listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#036A39]/15 pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#036A39] tracking-tight">
                Featured &amp; Recent Listings
              </h2>
              <span className="px-2.5 py-0.5 bg-[#036A39]/10 text-[#036A39] text-xs font-bold rounded-full">
                Live
              </span>
            </div>
            <p className="text-sm text-[#023B1F]/75">
              Approved listings currently active across campus.
              {isUsingPreviewCatalog && ' Showing demo preview items until admin seeds or approves listings.'}
            </p>
          </div>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#036A39] hover:text-[#024D29] whitespace-nowrap shrink-0"
          >
            <span>View all listings</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-[#F2F2F2] border border-[#036A39]/10 rounded-2xl overflow-hidden animate-pulse"
              >
                <div className="aspect-[4/3] bg-[#DEE0DF]" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-1/2 bg-[#DEE0DF] rounded" />
                  <div className="h-5 w-4/5 bg-[#DEE0DF] rounded" />
                  <div className="h-4 w-1/3 bg-[#DEE0DF] rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            {featuredListings.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold tracking-wider text-[#9D7F32] uppercase flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-[#C0A14E]" />
                    <span>Featured on Campus</span>
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredListings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      onQuickView={setQuickViewListing}
                      isBookmarked={bookmarkedIds.includes(listing.id)}
                      onToggleBookmark={toggleBookmark}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <p className="text-xs font-bold tracking-wider text-[#023B1F]/70 uppercase">
                Recently Published
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onQuickView={setQuickViewListing}
                    isBookmarked={bookmarkedIds.includes(listing.id)}
                    onToggleBookmark={toggleBookmark}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 3. Business Partnership Program Showcase (Crucial for Business Stakeholders!) */}
      <BusinessPartnerShowcase />

      {/* 4. How It Works: Campus Moderation Standard */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Editorial Process Steps */}
          <div className="lg:col-span-6 bg-[#F2F2F2] border border-[#036A39]/12 rounded-3xl p-8 sm:p-10 space-y-8 shadow-sm">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#036A39]/10 text-[#036A39] text-xs font-bold rounded">
                Moderated Publishing
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#036A39] tracking-tight">
                How UNi GEBEYA protects students &amp; buyers
              </h2>
              <p className="text-sm text-[#023B1F]/75 leading-relaxed">
                Built on the same human moderation standard that made our Telegram channel trusted,
                now structured for search, categories, and transparent status tracking.
              </p>
            </div>

            <ol className="space-y-6 divide-y divide-[#036A39]/10">
              <li className="pt-1 space-y-1.5">
                <h3 className="text-base font-bold text-[#036A39] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#036A39] text-[#F2F2F2] text-xs flex items-center justify-center font-bold">
                    1
                  </span>
                  <span>Submit your product, rental, or service</span>
                </h3>
                <p className="text-sm text-[#023B1F]/75 leading-relaxed pl-8">
                  Create an account, upload clear photos, add your price, campus location, and
                  direct phone or Telegram handle.
                </p>
              </li>
              <li className="pt-5 space-y-1.5">
                <h3 className="text-base font-bold text-[#036A39] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#036A39] text-[#F2F2F2] text-xs flex items-center justify-center font-bold">
                    2
                  </span>
                  <span>Admin review &amp; quality approval</span>
                </h3>
                <p className="text-sm text-[#023B1F]/75 leading-relaxed pl-8">
                  New submissions stay in Pending review until a Uni Gebeya administrator verifies
                  details, filters out spam, and approves them for publication.
                </p>
              </li>
              <li className="pt-5 space-y-1.5">
                <h3 className="text-base font-bold text-[#036A39] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#036A39] text-[#F2F2F2] text-xs flex items-center justify-center font-bold">
                    3
                  </span>
                  <span>Connect directly on campus</span>
                </h3>
                <p className="text-sm text-[#023B1F]/75 leading-relaxed pl-8">
                  Once approved, buyers discover your listing and contact you directly by phone or
                  Telegram to inspect and trade safely in daylight on campus.
                </p>
              </li>
            </ol>
          </div>

          {/* Forest Green Value Proposition & CTA */}
          <div className="lg:col-span-6 bg-[#036A39] text-[#F2F2F2] rounded-3xl p-8 sm:p-10 flex flex-col justify-between gap-8 shadow-sm">
            <div className="space-y-6">
              <div className="flex items-center gap-2.5 text-[#C0A14E]">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-xs font-bold tracking-wider uppercase">
                  Built for University Ecosystems
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-[#F2F2F2] tracking-tight">
                Empowering students and local businesses across Jimma University.
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2.5">
                  <h3 className="text-base font-bold text-[#C0A14E]">For Students</h3>
                  <ul className="space-y-2 text-sm text-[#F2F2F2]/85">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#C0A14E] shrink-0 mt-0.5" />
                      <span>Sell used laptops, phones, and textbooks to peers nearby</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#C0A14E] shrink-0 mt-0.5" />
                      <span>Rent cameras or projectors for projects instead of buying</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#C0A14E] shrink-0 mt-0.5" />
                      <span>Promote tutoring, coding, design, and photography skills</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-2.5">
                  <h3 className="text-base font-bold text-[#C0A14E]">For Local Businesses</h3>
                  <ul className="space-y-2 text-sm text-[#F2F2F2]/85">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#C0A14E] shrink-0 mt-0.5" />
                      <span>Reach thousands of active campus buyers directly</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#C0A14E] shrink-0 mt-0.5" />
                      <span>Advertise repair shops, rentals, print hubs, and student deals</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#C0A14E] shrink-0 mt-0.5" />
                      <span>Stand out inside a clean, moderated commercial catalog</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#F2F2F2]/15 flex flex-wrap items-center gap-4">
              <Link
                to="/submit"
                className="px-6 py-3 bg-[#C0A14E] text-[#023B1F] text-sm font-bold rounded-xl hover:bg-[#cbb061] transition-all whitespace-nowrap shadow-md"
              >
                Post Your First Listing
              </Link>
              <Link
                to="/marketplace"
                className="px-6 py-3 border border-[#F2F2F2]/30 text-[#F2F2F2] text-sm font-medium rounded-xl hover:bg-[#F2F2F2]/10 transition-colors whitespace-nowrap"
              >
                Browse Marketplace
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Quick View Modal */}
      <QuickViewModal
        listing={quickViewListing}
        isOpen={Boolean(quickViewListing)}
        onClose={() => setQuickViewListing(null)}
        isBookmarked={Boolean(quickViewListing && bookmarkedIds.includes(quickViewListing.id))}
        onToggleBookmark={toggleBookmark}
      />
    </div>
  );
}

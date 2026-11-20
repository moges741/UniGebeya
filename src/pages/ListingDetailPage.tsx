import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Building2,
  Check,
  Copy,
  Heart,
  Mail,
  MapPin,
  Package,
  Phone,
  Send,
  Share2,
  ShieldAlert,
  ShieldCheck,
  User,
} from 'lucide-react';
import { ListingCard } from '../components/ListingCard';
import { QuickViewModal } from '../components/QuickViewModal';
import { SHOWCASE_DEMO_LISTINGS } from '../data/seedData';
import { fetchApprovedListings, fetchListingById } from '../services/marketplaceService';
import {
  formatDate,
  formatPrice,
  LISTING_STATUS_LABEL,
  LISTING_TYPE_LABEL,
  Listing,
} from '../types/marketplace';

export function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [quickViewListing, setQuickViewListing] = useState<Listing | null>(null);

  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('unigebeya_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('unigebeya_bookmarks', JSON.stringify(bookmarkedIds));
    } catch {}
  }, [bookmarkedIds]);

  const toggleBookmark = (listingId: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(listingId) ? prev.filter((item) => item !== listingId) : [...prev, listingId]
    );
  };

  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => fetchListingById(id || ''),
    enabled: Boolean(id),
  });

  const { data: approvedListings = [] } = useQuery({
    queryKey: ['approved-listings'],
    queryFn: fetchApprovedListings,
  });

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(label);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      setCopiedField(null);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing?.title || 'UNi GEBEYA Listing',
          text: `Check out this listing on UNi GEBEYA: ${listing?.title}`,
          url,
        });
        return;
      } catch {}
    }
    await handleCopy(url, 'share');
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
          <div className="lg:col-span-7 aspect-[4/3] bg-[#F2F2F2] rounded-3xl" />
          <div className="lg:col-span-5 h-96 bg-[#F2F2F2] rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="bg-[#F2F2F2] border border-[#036A39]/15 rounded-3xl p-10 text-center space-y-4 shadow-sm">
          <h1 className="text-2xl font-bold text-[#036A39]">Listing not found</h1>
          <p className="text-sm text-[#023B1F]/75">
            This listing may have been removed, or it may still be pending moderator approval.
          </p>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#036A39] text-[#F2F2F2] text-sm font-bold rounded-xl hover:bg-[#024D29] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Marketplace</span>
          </Link>
        </div>
      </div>
    );
  }

  const images = listing.images && listing.images.length > 0 ? listing.images : [];
  const mainImage = images[activeImageIdx] || images[0];

  const candidateRelated =
    approvedListings.length > 0
      ? approvedListings
      : SHOWCASE_DEMO_LISTINGS.map((d) => ({ ...d, createdAt: new Date(), updatedAt: new Date() }));

  const relatedListings = candidateRelated
    .filter(
      (item) =>
        item.id !== listing.id &&
        (item.categoryId === listing.categoryId || item.listingType === listing.listingType)
    )
    .slice(0, 3);

  const telegramUsername = listing.contactTelegram.replace(/^@/, '').trim();
  const isBookmarked = bookmarkedIds.includes(listing.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
      {/* Top Navigation & Share Bar */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#036A39] hover:text-[#024D29] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F2F2F2] border border-[#036A39]/15 rounded-lg text-xs font-semibold text-[#036A39] hover:bg-[#DEE0DF]/60 transition-colors shadow-sm"
          >
            {copiedField === 'share' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Listing</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => toggleBookmark(listing.id)}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark listing'}
            className={`p-2 rounded-lg border transition-colors shadow-sm ${
              isBookmarked
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-[#F2F2F2] border-[#036A39]/15 text-[#023B1F]/70 hover:text-rose-600'
            }`}
          >
            <Heart className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Status Notice for Non-Approved Views (Owner / Admin Preview) */}
      {listing.status !== 'APPROVED' && (
        <div className="bg-[#F2F2F2] border border-[#C0A14E] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-[#9D7F32] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-[#023B1F]">
                Status: {LISTING_STATUS_LABEL[listing.status]}
              </p>
              <p className="text-xs text-[#023B1F]/75 mt-0.5">
                {listing.status === 'PENDING'
                  ? 'This listing is currently visible only to you and marketplace administrators until approved.'
                  : `Rejected by moderator: ${listing.rejectionReason || 'Please edit and resubmit.'}`}
              </p>
            </div>
          </div>
          <Link
            to="/my-listings"
            className="text-xs font-bold text-[#036A39] hover:underline whitespace-nowrap shrink-0"
          >
            Manage in My Listings
          </Link>
        </div>
      )}

      {/* Main Split Gallery + Contiguous Purchase / Contact Module */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Sticky Gallery & Description */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#F2F2F2] border border-[#036A39]/12 rounded-3xl overflow-hidden shadow-sm">
            <div className="aspect-[4/3] w-full bg-[#DEE0DF]/65 overflow-hidden">
              {mainImage && !imgError ? (
                <img
                  src={mainImage}
                  alt={listing.title}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#036A39]/60 p-8">
                  <Package className="w-12 h-12 text-[#C0A14E]" />
                  <span className="text-sm font-medium">{listing.title}</span>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="p-4 flex items-center gap-3 border-t border-[#036A39]/10 overflow-x-auto">
                {images.map((src, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setImgError(false);
                      setActiveImageIdx(idx);
                    }}
                    className={`w-20 aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      idx === activeImageIdx
                        ? 'border-[#036A39] ring-2 ring-[#036A39]/20'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={src}
                      alt={`${listing.title} photo ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description Panel */}
          <div className="bg-[#F2F2F2] border border-[#036A39]/12 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
            <h2 className="text-lg font-bold text-[#036A39]">Description &amp; Overview</h2>
            <p className="text-sm sm:text-base text-[#023B1F]/85 leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          {/* Campus Trust Guarantee */}
          <div className="bg-[#036A39]/8 border border-[#036A39]/15 rounded-2xl p-5 flex items-start gap-3.5">
            <ShieldCheck className="w-5 h-5 text-[#036A39] shrink-0 mt-0.5" />
            <div className="text-xs text-[#023B1F]/85 leading-relaxed">
              <span className="font-bold text-[#036A39]">Verified Campus Marketplace:</span> Every
              listing on UNi GEBEYA is reviewed by student moderators. We never charge middleman fees.
              Always meet in designated campus areas (such as AAiT Library Square or Main Gate) to
              inspect gear before paying.
            </div>
          </div>
        </div>

        {/* Right: Contiguous Summary & Direct Seller Contact Module */}
        <aside className="lg:col-span-5 lg:sticky lg:top-24 space-y-5">
          <div className="bg-[#F2F2F2] border border-[#036A39]/15 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-[#023B1F]/70">
                <span className="px-2 py-0.5 bg-[#036A39]/10 text-[#036A39] font-bold rounded">
                  {LISTING_TYPE_LABEL[listing.listingType]}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-[#036A39]">{listing.categoryName}</span>
                <span aria-hidden="true">·</span>
                <span>Posted {formatDate(listing.createdAt)}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#023B1F] leading-tight">
                {listing.title}
              </h1>

              <p className="font-[JetBrains_Mono] text-3xl font-bold text-[#036A39] tabular-nums">
                {formatPrice(listing.price, listing.currency, listing.listingType)}
              </p>

              <div className="flex items-center gap-1.5 text-sm font-medium text-[#023B1F]/80 pt-1">
                <MapPin className="w-4 h-4 text-[#C0A14E] shrink-0" />
                <span>{listing.location}</span>
              </div>
            </div>

            {/* Seller Information */}
            <div className="pt-5 border-t border-[#036A39]/12 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[#9D7F32] uppercase tracking-wider">Posted By</p>
                <span className="px-2 py-0.5 bg-[#036A39]/10 text-[#036A39] text-[11px] font-bold rounded">
                  Verified Member
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-[#023B1F]">
                <User className="w-4 h-4 text-[#036A39]" />
                <span>{listing.sellerName}</span>
              </div>
              {listing.sellerOrg && (
                <div className="flex items-center gap-2 text-xs text-[#023B1F]/75 font-medium">
                  <Building2 className="w-3.5 h-3.5 text-[#036A39]/70 shrink-0" />
                  <span>{listing.sellerOrg}</span>
                </div>
              )}
            </div>

            {/* Direct Contact Actions */}
            <div className="pt-5 border-t border-[#036A39]/12 space-y-3">
              <p className="text-xs font-bold text-[#023B1F]/75 uppercase tracking-wider">
                Direct Seller Contact
              </p>

              {telegramUsername && (
                <div className="flex items-center gap-2">
                  <a
                    href={`https://t.me/${telegramUsername}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#229ED9] text-white text-sm font-bold rounded-xl hover:bg-[#1e8cc2] transition-colors shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    <span>Telegram @{telegramUsername}</span>
                  </a>
                  <button
                    type="button"
                    aria-label="Copy Telegram handle"
                    onClick={() => void handleCopy(`@${telegramUsername}`, 'telegram')}
                    className="p-3 border border-[#036A39]/25 text-[#036A39] rounded-xl hover:bg-[#036A39]/8 transition-colors"
                  >
                    {copiedField === 'telegram' ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}

              {listing.contactPhone && (
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${listing.contactPhone.replace(/\s+/g, '')}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#036A39] text-[#F2F2F2] text-sm font-bold rounded-xl hover:bg-[#024D29] transition-colors shadow-sm"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call {listing.contactPhone}</span>
                  </a>
                  <button
                    type="button"
                    aria-label="Copy phone number"
                    onClick={() => void handleCopy(listing.contactPhone, 'phone')}
                    className="p-3 border border-[#036A39]/25 text-[#036A39] rounded-xl hover:bg-[#036A39]/8 transition-colors"
                  >
                    {copiedField === 'phone' ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}

              {listing.contactEmail && (
                <a
                  href={`mailto:${listing.contactEmail}?subject=${encodeURIComponent(`UNi GEBEYA Inquiry: ${listing.title}`)}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-[#036A39]/25 text-[#036A39] text-sm font-semibold rounded-xl hover:bg-[#036A39]/8 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email Seller</span>
                </a>
              )}
            </div>

            <p className="text-xs text-[#023B1F]/65 leading-relaxed pt-2 border-t border-[#036A39]/10">
              Campus reminder: Meet in well-lit campus spots (main library, student union, or campus
              gate) and inspect items before cash exchange.
            </p>
          </div>
        </aside>
      </div>

      {/* Related Approved Listings */}
      {relatedListings.length > 0 && (
        <section className="space-y-6 pt-6 border-t border-[#036A39]/15">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#036A39]">Related Campus Listings</h2>
            <Link
              to="/marketplace"
              className="text-xs font-bold text-[#036A39] hover:underline"
            >
              Browse all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedListings.map((item) => (
              <ListingCard
                key={item.id}
                listing={item}
                onQuickView={setQuickViewListing}
                isBookmarked={bookmarkedIds.includes(item.id)}
                onToggleBookmark={toggleBookmark}
              />
            ))}
          </div>
        </section>
      )}

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

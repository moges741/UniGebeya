import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Heart,
  MapPin,
  Package,
  Phone,
  Send,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import {
  formatPrice,
  Listing,
  LISTING_TYPE_LABEL,
} from '../types/marketplace';

interface QuickViewModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (listingId: string) => void;
}

export function QuickViewModal({
  listing,
  isOpen,
  onClose,
  isBookmarked = false,
  onToggleBookmark,
}: QuickViewModalProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  useEffect(() => {
    setActiveImageIdx(0);
    setImgError(false);
  }, [listing?.id]);

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

  if (!isOpen || !listing) return null;

  const images = listing.images && listing.images.length > 0 ? listing.images : [];
  const currentImage = images[activeImageIdx] || images[0];

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    } catch {
      setCopiedText(null);
    }
  };

  const telegramUrl = listing.contactTelegram
    ? `https://t.me/${listing.contactTelegram.replace('@', '')}`
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative w-full max-w-4xl bg-[#F2F2F2] rounded-2xl shadow-2xl border border-[#036A39]/20 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#036A39]/12 bg-[#F2F2F2]">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 bg-[#036A39]/10 text-[#036A39] text-xs font-semibold rounded-full uppercase tracking-wider">
              {LISTING_TYPE_LABEL[listing.listingType]}
            </span>
            <span className="text-xs text-[#023B1F]/65 font-medium truncate max-w-[200px] sm:max-w-none">
              {listing.categoryName}
            </span>
            {listing.isFeatured && (
              <span className="px-2 py-0.5 bg-[#C0A14E]/20 text-[#9D7F32] text-xs font-bold rounded-full">
                ★ Featured
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onToggleBookmark && (
              <button
                type="button"
                onClick={() => onToggleBookmark(listing.id)}
                aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark listing'}
                className={`p-2 rounded-full transition-colors ${
                  isBookmarked
                    ? 'text-rose-600 bg-rose-50'
                    : 'text-[#023B1F]/60 hover:text-rose-600 hover:bg-black/5'
                }`}
              >
                <Heart className="w-5 h-5 fill-current" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="p-2 text-[#023B1F]/60 hover:text-[#023B1F] hover:bg-black/5 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Media Column */}
          <div className="md:col-span-6 space-y-3">
            <div className="relative aspect-[4/3] w-full bg-[#DEE0DF] rounded-xl overflow-hidden border border-[#036A39]/15">
              {currentImage && !imgError ? (
                <img
                  src={currentImage}
                  alt={listing.title}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#036A39]/60 p-6 text-center">
                  <Package className="w-12 h-12 text-[#C0A14E]" />
                  <span className="text-xs font-medium">{listing.title}</span>
                </div>
              )}

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1))
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#F2F2F2]/90 rounded-full shadow hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-[#036A39]" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0))
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#F2F2F2]/90 rounded-full shadow hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-[#036A39]" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                      activeImageIdx === idx
                        ? 'border-[#036A39] ring-2 ring-[#036A39]/20'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Trust Assurance Badge */}
            <div className="bg-[#DEE0DF]/60 border border-[#036A39]/12 rounded-xl p-3.5 flex items-start gap-3 text-xs text-[#023B1F]/80">
              <ShieldCheck className="w-4 h-4 text-[#036A39] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#036A39]">Verified Campus Moderation:</span>{' '}
                Reviewed for authenticity. Always inspect gear in person before paying.
              </div>
            </div>
          </div>

          {/* Right Details Column */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Title & Price */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#036A39] leading-snug">
                  {listing.title}
                </h2>
                <div className="mt-2 flex items-baseline gap-3">
                  <span className="font-[JetBrains_Mono] text-2xl font-bold text-[#036A39] tabular-nums">
                    {formatPrice(listing.price, listing.currency, listing.listingType)}
                  </span>
                </div>
              </div>

              {/* Campus Location Badge */}
              <div className="flex items-center gap-2 text-sm text-[#023B1F]/85 font-medium">
                <MapPin className="w-4 h-4 text-[#C0A14E] shrink-0" />
                <span>{listing.location}</span>
              </div>

              {/* Description */}
              <div className="text-sm text-[#023B1F]/85 leading-relaxed bg-[#DEE0DF]/40 rounded-xl p-4 border border-[#036A39]/8 max-h-40 overflow-y-auto">
                <p className="whitespace-pre-line">{listing.description}</p>
              </div>

              {/* Seller Information Card */}
              <div className="bg-[#DEE0DF]/70 rounded-xl p-4 border border-[#036A39]/12 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#036A39]">
                    <User className="w-4 h-4 text-[#C0A14E]" />
                    <span>{listing.sellerName || 'Verified Member'}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-[#036A39]/10 text-[#036A39] text-[11px] font-semibold rounded">
                    Verified Seller
                  </span>
                </div>

                {listing.sellerOrg && (
                  <div className="flex items-center gap-2 text-xs text-[#023B1F]/70">
                    <Building2 className="w-3.5 h-3.5 text-[#C0A14E] shrink-0" />
                    <span>{listing.sellerOrg}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {telegramUrl && (
                  <a
                    href={telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#229ED9] text-white text-sm font-semibold rounded-lg hover:bg-[#1E8CC2] transition-colors shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    <span>Chat on Telegram</span>
                  </a>
                )}

                {listing.contactPhone && (
                  <a
                    href={`tel:${listing.contactPhone}`}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#036A39] text-[#F2F2F2] text-sm font-semibold rounded-lg hover:bg-[#024D29] transition-colors shadow-sm"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Seller</span>
                  </a>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#036A39]/12">
                {listing.contactPhone && (
                  <button
                    type="button"
                    onClick={() => handleCopy(listing.contactPhone, 'phone')}
                    className="inline-flex items-center gap-1.5 text-xs text-[#023B1F]/75 hover:text-[#036A39] font-medium"
                  >
                    {copiedText === 'phone' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#036A39]" />
                        <span>Phone copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy {listing.contactPhone}</span>
                      </>
                    )}
                  </button>
                )}

                <Link
                  to={`/listings/${listing.id}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#036A39] hover:text-[#024D29]"
                >
                  <span>Full Listing Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

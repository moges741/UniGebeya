import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Heart, MapPin, Package, ShieldCheck } from 'lucide-react';
import {
  formatPrice,
  Listing,
  LISTING_TYPE_LABEL,
} from '../types/marketplace';

interface ListingCardProps {
  listing: Listing;
  onQuickView?: (listing: Listing) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (listingId: string) => void;
}

export function ListingCard({
  listing,
  onQuickView,
  isBookmarked = false,
  onToggleBookmark,
}: ListingCardProps) {
  const [imgError, setImgError] = useState(false);
  const coverImage = listing.images?.[0];

  const handleQuickViewClick = (e: React.MouseEvent) => {
    if (onQuickView) {
      e.preventDefault();
      e.stopPropagation();
      onQuickView(listing);
    }
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    if (onToggleBookmark) {
      e.preventDefault();
      e.stopPropagation();
      onToggleBookmark(listing.id);
    }
  };

  return (
    <div className="group relative flex flex-col bg-[#F2F2F2] border border-[#036A39]/12 rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-[#036A39]/30">
      {/* 4:3 Image Container with Badges & Quick Action Overlay */}
      <Link to={`/listings/${listing.id}`} className="relative aspect-[4/3] w-full bg-[#DEE0DF]/65 overflow-hidden block">
        {coverImage && !imgError ? (
          <img
            src={coverImage}
            alt={listing.title}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#DEE0DF] to-[#F2F2F2] text-[#036A39]/60 p-6 text-center">
            <Package className="w-8 h-8 text-[#C0A14E]" />
            <span className="text-xs font-medium line-clamp-2">{listing.title}</span>
          </div>
        )}

        {/* Top Badges Overlay */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between gap-1 pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 bg-[#036A39]/90 text-[#F2F2F2] text-[11px] font-bold rounded-md backdrop-blur-sm shadow-sm tracking-wide">
              {LISTING_TYPE_LABEL[listing.listingType]}
            </span>
            {listing.isFeatured && (
              <span className="px-2 py-0.5 bg-[#C0A14E] text-[#023B1F] text-[10px] font-extrabold rounded-md shadow-sm">
                ★ FEATURED
              </span>
            )}
          </div>

          {/* Bookmark Button */}
          {onToggleBookmark && (
            <button
              type="button"
              onClick={handleBookmarkClick}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark listing'}
              className={`p-1.5 rounded-full pointer-events-auto backdrop-blur-md transition-all shadow ${
                isBookmarked
                  ? 'bg-white text-rose-600 scale-110'
                  : 'bg-white/85 text-[#023B1F]/70 hover:bg-white hover:text-rose-600'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        {/* Quick View Button on Hover */}
        {onQuickView && (
          <div className="absolute inset-x-0 bottom-3 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <button
              type="button"
              onClick={handleQuickViewClick}
              className="pointer-events-auto px-3.5 py-1.5 bg-[#F2F2F2]/95 backdrop-blur-md text-[#036A39] text-xs font-bold rounded-lg shadow-md hover:bg-white hover:scale-105 transition-all flex items-center gap-1.5 border border-[#036A39]/15"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Quick View</span>
            </button>
          </div>
        )}
      </Link>

      {/* Metadata & Title */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-xs text-[#023B1F]/70">
            <span className="truncate max-w-[150px] font-medium text-[#036A39]">
              {listing.categoryName}
            </span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1 text-[#023B1F]/75">
              <ShieldCheck className="w-3 h-3 text-[#036A39]" />
              <span className="text-[11px]">Verified</span>
            </span>
          </div>

          <Link to={`/listings/${listing.id}`}>
            <h3 className="text-base font-bold text-[#023B1F] leading-snug line-clamp-2 group-hover:text-[#036A39] transition-colors">
              {listing.title}
            </h3>
          </Link>
        </div>

        {/* Tabular Price & Campus Location */}
        <div className="pt-3 border-t border-[#036A39]/10 flex items-baseline justify-between gap-3">
          <span className="font-[JetBrains_Mono] text-base font-bold text-[#036A39] tabular-nums whitespace-nowrap">
            {formatPrice(listing.price, listing.currency, listing.listingType)}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-[#023B1F]/75 truncate max-w-[130px] sm:max-w-[160px]">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-[#C0A14E]" />
            <span className="truncate">{listing.location}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

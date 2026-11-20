import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Package } from 'lucide-react';
import {
  formatPrice,
  Listing,
  LISTING_TYPE_LABEL,
} from '../types/marketplace';

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const [imgError, setImgError] = useState(false);
  const coverImage = listing.images?.[0];

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="group flex flex-col bg-[#F2F2F2] border border-[#036A39]/12 rounded-xl overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 hover:border-[#036A39]/30"
    >
      {/* Uniform 4:3 Image Frame */}
      <div className="relative aspect-[4/3] w-full bg-[#DEE0DF]/65 overflow-hidden">
        {coverImage && !imgError ? (
          <img
            src={coverImage}
            alt={listing.title}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#DEE0DF] to-[#F2F2F2] text-[#036A39]/60 p-6 text-center">
            <Package className="w-8 h-8 text-[#C0A14E]" />
            <span className="text-xs font-medium line-clamp-2">{listing.title}</span>
          </div>
        )}
      </div>

      {/* Clean Unboxed Metadata + Title + Tabular Price */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-xs text-[#023B1F]/70">
            <span className="font-medium text-[#036A39]">{LISTING_TYPE_LABEL[listing.listingType]}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate max-w-[160px]">{listing.categoryName}</span>
            {listing.isDemo && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-[#9D7F32]">Demo</span>
              </>
            )}
          </div>

          <h3 className="text-base font-semibold text-[#023B1F] leading-snug line-clamp-2 group-hover:text-[#036A39] transition-colors">
            {listing.title}
          </h3>
        </div>

        <div className="pt-3 border-t border-[#036A39]/10 flex items-baseline justify-between gap-3">
          <span className="font-[JetBrains_Mono] text-sm font-semibold text-[#036A39] tabular-nums whitespace-nowrap">
            {formatPrice(listing.price, listing.currency, listing.listingType)}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-[#023B1F]/70 truncate">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-[#C0A14E]" />
            <span className="truncate">{listing.location}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { ListingCard } from '../components/ListingCard';
import { DEFAULT_CATEGORIES, SHOWCASE_DEMO_LISTINGS } from '../data/seedData';
import { fetchApprovedListings, fetchCategories } from '../services/marketplaceService';
import {
  Category,
  Listing,
  LISTING_TYPE_OPTIONS,
  ListingType,
} from '../types/marketplace';

const ITEMS_PER_PAGE = 6;

export function MarketplacePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'ALL';
  const initialType = (searchParams.get('type') as ListingType | 'ALL') || 'ALL';

  const [queryText, setQueryText] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedType, setSelectedType] = useState<ListingType | 'ALL'>(initialType);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  const [page, setPage] = useState(1);

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

  const isPreviewMode = !isLoading && liveListings.length === 0;

  const sourceListings: Listing[] = useMemo(() => {
    if (isPreviewMode) {
      return SHOWCASE_DEMO_LISTINGS.map((item) => ({
        ...item,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
    }
    return liveListings;
  }, [isPreviewMode, liveListings]);

  const filteredListings = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    const min = minPrice.trim() !== '' ? Number(minPrice) : null;
    const max = maxPrice.trim() !== '' ? Number(maxPrice) : null;

    const list = sourceListings.filter((item) => {
      if (selectedCategory !== 'ALL' && item.categoryId !== selectedCategory) {
        return false;
      }
      if (selectedType !== 'ALL' && item.listingType !== selectedType) {
        return false;
      }
      if (min !== null && !Number.isNaN(min) && item.price < min) {
        return false;
      }
      if (max !== null && !Number.isNaN(max) && item.price > max) {
        return false;
      }
      if (q) {
        const haystack = [
          item.title,
          item.description,
          item.location,
          item.categoryName,
          item.sellerName,
          item.sellerOrg,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    if (sortBy === 'price_asc') {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price_desc') {
      return [...list].sort((a, b) => b.price - a.price);
    }
    return list;
  }, [sourceListings, queryText, selectedCategory, selectedType, minPrice, maxPrice, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredListings.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginatedListings = filteredListings.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  const hasActiveFilters =
    queryText.trim() !== '' ||
    selectedCategory !== 'ALL' ||
    selectedType !== 'ALL' ||
    minPrice !== '' ||
    maxPrice !== '';

  const resetFilters = () => {
    setQueryText('');
    setSelectedCategory('ALL');
    setSelectedType('ALL');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#036A39]/15 pb-6">
        <div className="space-y-1.5">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#036A39] tracking-tight">
            Marketplace
          </h1>
          <p className="text-sm text-[#023B1F]/75">
            Browse verified, administrator-approved products, rentals, and campus services.
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="font-[JetBrains_Mono] text-xs font-medium text-[#023B1F]/75 tabular-nums">
            {filteredListings.length} {filteredListings.length === 1 ? 'listing' : 'listings'}
          </span>
          <Link
            to="/submit"
            className="px-4 py-2 bg-[#036A39] text-[#F2F2F2] text-xs font-semibold rounded-lg hover:bg-[#024D29] transition-colors whitespace-nowrap shrink-0"
          >
            Submit Listing
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar Panel */}
      <section className="bg-[#F2F2F2] border border-[#036A39]/12 rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Search Input */}
          <div className="lg:col-span-5 relative">
            <Search className="w-4 h-4 text-[#036A39]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={queryText}
              onChange={(e) => {
                setQueryText(e.target.value);
                setPage(1);
              }}
              placeholder="Search title, campus location, or skill..."
              aria-label="Search marketplace"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#DEE0DF]/45 border border-[#036A39]/15 rounded-lg text-[#023B1F] placeholder:text-[#023B1F]/50 focus:bg-[#F2F2F2] focus:border-[#036A39]/40 focus:outline-none"
            />
          </div>

          {/* Min / Max Price */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-2.5">
            <input
              type="number"
              min={0}
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                setPage(1);
              }}
              placeholder="Min price (ETB)"
              aria-label="Minimum price"
              className="w-full px-3.5 py-2.5 text-sm bg-[#DEE0DF]/45 border border-[#036A39]/15 rounded-lg text-[#023B1F] placeholder:text-[#023B1F]/50 tabular-nums focus:bg-[#F2F2F2] focus:outline-none"
            />
            <input
              type="number"
              min={0}
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setPage(1);
              }}
              placeholder="Max price (ETB)"
              aria-label="Maximum price"
              className="w-full px-3.5 py-2.5 text-sm bg-[#DEE0DF]/45 border border-[#036A39]/15 rounded-lg text-[#023B1F] placeholder:text-[#023B1F]/50 tabular-nums focus:bg-[#F2F2F2] focus:outline-none"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="lg:col-span-3 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#036A39]/70 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'price_asc' | 'price_desc')}
              aria-label="Sort listings"
              className="w-full px-3 py-2.5 text-sm bg-[#DEE0DF]/45 border border-[#036A39]/15 rounded-lg text-[#023B1F] focus:bg-[#F2F2F2] focus:outline-none"
            >
              <option value="newest">Newest Published</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Listing Type Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-semibold text-[#023B1F]/70 mr-1">Type:</span>
          <button
            type="button"
            onClick={() => {
              setSelectedType('ALL');
              setPage(1);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              selectedType === 'ALL'
                ? 'bg-[#036A39] text-[#F2F2F2]'
                : 'bg-[#DEE0DF]/65 text-[#023B1F] hover:bg-[#DEE0DF]'
            }`}
          >
            All Types
          </button>
          {LISTING_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setSelectedType(opt.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                selectedType === opt.value
                  ? 'bg-[#036A39] text-[#F2F2F2]'
                  : 'bg-[#DEE0DF]/65 text-[#023B1F] hover:bg-[#DEE0DF]'
              }`}
            >
              {opt.shortLabel}
            </button>
          ))}
        </div>

        {/* Category Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#036A39]/10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#023B1F]/70 mr-1">Category:</span>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('ALL');
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === 'ALL'
                  ? 'bg-[#C0A14E] text-[#023B1F] font-semibold'
                  : 'bg-[#DEE0DF]/65 text-[#023B1F] hover:bg-[#DEE0DF]'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-[#C0A14E] text-[#023B1F] font-semibold'
                    : 'bg-[#DEE0DF]/65 text-[#023B1F] hover:bg-[#DEE0DF]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#036A39] hover:text-[#024D29] whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset filters
            </button>
          )}
        </div>
      </section>

      {/* Catalog Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="bg-[#F2F2F2] border border-[#036A39]/10 rounded-xl overflow-hidden animate-pulse"
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
      ) : paginatedListings.length === 0 ? (
        <div className="bg-[#F2F2F2] border border-[#036A39]/12 rounded-2xl p-12 text-center space-y-4">
          <h2 className="text-xl font-semibold text-[#036A39]">No matching listings found</h2>
          <p className="text-sm text-[#023B1F]/75 max-w-md mx-auto">
            Try adjusting your search keywords, price range, or category filters—or post a Wanted
            listing so sellers on campus can reach you.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-2 text-sm font-medium border border-[#036A39]/30 text-[#036A39] rounded-lg hover:bg-[#036A39]/8 transition-colors"
            >
              Clear All Filters
            </button>
            <Link
              to="/submit"
              className="px-4 py-2 text-sm font-semibold bg-[#036A39] text-[#F2F2F2] rounded-lg hover:bg-[#024D29] transition-colors"
            >
              Post a Wanted Listing
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-[#036A39]/15">
              <p className="text-xs text-[#023B1F]/70 tabular-nums">
                Page {safePage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-semibold text-[#036A39] bg-[#F2F2F2] border border-[#036A39]/20 rounded-lg hover:border-[#036A39] disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-semibold text-[#036A39] bg-[#F2F2F2] border border-[#036A39]/20 rounded-lg hover:border-[#036A39] disabled:opacity-40 transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

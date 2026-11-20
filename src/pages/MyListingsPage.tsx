import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Lock,
  Package,
  Pencil,
  Plus,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { deleteListing, fetchUserListings } from '../services/marketplaceService';
import {
  formatDate,
  formatPrice,
  LISTING_STATUS_LABEL,
  LISTING_TYPE_LABEL,
  ListingStatus,
} from '../types/marketplace';

export function MyListingsPage() {
  const { firebaseUser, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<'ALL' | ListingStatus>('ALL');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const { data: myListings = [], isLoading } = useQuery({
    queryKey: ['my-listings', firebaseUser?.uid],
    queryFn: () => fetchUserListings(firebaseUser!.uid),
    enabled: Boolean(firebaseUser?.uid),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteListing(id),
    onSuccess: async () => {
      setConfirmDeleteId(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['my-listings'] }),
        queryClient.invalidateQueries({ queryKey: ['approved-listings'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-listings'] }),
      ]);
    },
  });

  if (authLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 pt-16 text-center text-sm text-[#023B1F]/75">
        Loading your listings...
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="max-w-xl mx-auto px-4 pt-16">
        <div className="bg-[#F2F2F2] border border-[#036A39]/15 rounded-2xl p-8 sm:p-10 text-center space-y-5">
          <Lock className="w-8 h-8 text-[#C0A14E] mx-auto" />
          <h1 className="text-2xl font-bold text-[#036A39]">Sign in to view your listings</h1>
          <p className="text-sm text-[#023B1F]/75">
            Track Pending, Approved, and Rejected marketplace submissions from your personal
            dashboard.
          </p>
          <button
            type="button"
            onClick={() => navigate('/auth', { state: { from: '/my-listings' } })}
            className="px-5 py-2.5 bg-[#036A39] text-[#F2F2F2] text-sm font-semibold rounded-lg hover:bg-[#024D29] transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const pendingCount = myListings.filter((l) => l.status === 'PENDING').length;
  const approvedCount = myListings.filter((l) => l.status === 'APPROVED').length;
  const rejectedCount = myListings.filter((l) => l.status === 'REJECTED').length;

  const visibleListings =
    statusFilter === 'ALL'
      ? myListings
      : myListings.filter((l) => l.status === statusFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#036A39]/15 pb-6">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-bold text-[#036A39]">My Listings</h1>
          <p className="text-sm text-[#023B1F]/75">
            Track moderator approval status, edit posts, or remove sold items.
          </p>
        </div>
        <Link
          to="/submit"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#036A39] text-[#F2F2F2] text-sm font-semibold rounded-lg hover:bg-[#024D29] transition-colors self-start sm:self-auto whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Submit New Listing
        </Link>
      </div>

      {/* Summary Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#F2F2F2] border border-[#036A39]/12 rounded-xl p-5">
          <p className="text-xs font-medium text-[#023B1F]/70">Total Submitted</p>
          <p className="font-[JetBrains_Mono] text-2xl font-bold text-[#036A39] mt-1 tabular-nums">
            {myListings.length}
          </p>
        </div>
        <div className="bg-[#F2F2F2] border border-[#C0A14E]/60 rounded-xl p-5">
          <p className="text-xs font-medium text-[#9D7F32]">Pending Approval</p>
          <p className="font-[JetBrains_Mono] text-2xl font-bold text-[#023B1F] mt-1 tabular-nums">
            {pendingCount}
          </p>
        </div>
        <div className="bg-[#F2F2F2] border border-[#036A39]/12 rounded-xl p-5">
          <p className="text-xs font-medium text-[#036A39]">Approved &amp; Live</p>
          <p className="font-[JetBrains_Mono] text-2xl font-bold text-[#036A39] mt-1 tabular-nums">
            {approvedCount}
          </p>
        </div>
        <div className="bg-[#F2F2F2] border border-[#036A39]/12 rounded-xl p-5">
          <p className="text-xs font-medium text-red-800/80">Rejected</p>
          <p className="font-[JetBrains_Mono] text-2xl font-bold text-red-800 mt-1 tabular-nums">
            {rejectedCount}
          </p>
        </div>
      </div>

      {/* Segmented Status Filter */}
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            { key: 'ALL', label: `All (${myListings.length})` },
            { key: 'PENDING', label: `Pending (${pendingCount})` },
            { key: 'APPROVED', label: `Approved (${approvedCount})` },
            { key: 'REJECTED', label: `Rejected (${rejectedCount})` },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 tabular-nums ${
              statusFilter === tab.key
                ? 'bg-[#036A39] text-[#F2F2F2]'
                : 'bg-[#F2F2F2] text-[#023B1F] border border-[#036A39]/15 hover:border-[#036A39]/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Submissions List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 bg-[#F2F2F2] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : visibleListings.length === 0 ? (
        <div className="bg-[#F2F2F2] border border-[#036A39]/12 rounded-2xl p-12 text-center space-y-4">
          <Package className="w-8 h-8 text-[#C0A14E] mx-auto" />
          <h2 className="text-lg font-semibold text-[#036A39]">
            {statusFilter === 'ALL'
              ? 'You have not submitted any listings yet'
              : `No ${LISTING_STATUS_LABEL[statusFilter].toLowerCase()} listings`}
          </h2>
          <p className="text-sm text-[#023B1F]/75 max-w-md mx-auto">
            Post a laptop, textbook, rental, or campus skill to reach students and local buyers.
          </p>
          <Link
            to="/submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#036A39] text-[#F2F2F2] text-sm font-semibold rounded-lg hover:bg-[#024D29] transition-colors"
          >
            Submit Your First Listing
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleListings.map((listing) => {
            const cover = listing.images?.[0];
            return (
              <div
                key={listing.id}
                className="bg-[#F2F2F2] border border-[#036A39]/12 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row gap-5"
              >
                {/* Thumbnail */}
                <div className="w-full md:w-44 aspect-[4/3] rounded-lg overflow-hidden bg-[#DEE0DF] shrink-0">
                  {cover ? (
                    <img
                      src={cover}
                      alt={listing.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#036A39]/50">
                      <Package className="w-6 h-6" />
                    </div>
                  )}
                </div>

                {/* Info & Status */}
                <div className="flex-1 flex flex-col justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-xs text-[#023B1F]/70">
                        <span className="font-semibold text-[#036A39]">
                          {LISTING_TYPE_LABEL[listing.listingType]}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{listing.categoryName}</span>
                        <span aria-hidden="true">·</span>
                        <span>Submitted {formatDate(listing.createdAt)}</span>
                      </div>

                      {/* Explicit Status Indicator (Icon + Text, never color alone) */}
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                          listing.status === 'APPROVED'
                            ? 'text-[#036A39]'
                            : listing.status === 'PENDING'
                              ? 'text-[#9D7F32]'
                              : 'text-red-700'
                        }`}
                      >
                        {listing.status === 'APPROVED' && <CheckCircle2 className="w-4 h-4" />}
                        {listing.status === 'PENDING' && <Clock className="w-4 h-4" />}
                        {listing.status === 'REJECTED' && <XCircle className="w-4 h-4" />}
                        {LISTING_STATUS_LABEL[listing.status]}
                      </span>
                    </div>

                    <h2 className="text-lg font-semibold text-[#023B1F]">{listing.title}</h2>
                    <p className="font-[JetBrains_Mono] text-sm font-semibold text-[#036A39] tabular-nums">
                      {formatPrice(listing.price, listing.currency, listing.listingType)}
                    </p>

                    {listing.status === 'REJECTED' && listing.rejectionReason && (
                      <div className="mt-2 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-900">
                        <strong>Moderator note:</strong> {listing.rejectionReason}
                      </div>
                    )}
                  </div>

                  {/* Row Actions */}
                  <div className="pt-3 border-t border-[#036A39]/10 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Link
                        to={`/listings/${listing.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#036A39] border border-[#036A39]/25 rounded-lg hover:bg-[#036A39]/8 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Preview
                      </Link>
                      <Link
                        to={`/edit/${listing.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#023B1F] border border-[#036A39]/20 rounded-lg hover:bg-[#DEE0DF]/60 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit &amp; Resubmit
                      </Link>
                    </div>

                    {confirmDeleteId === listing.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-800 font-medium">Delete permanently?</span>
                        <button
                          type="button"
                          disabled={deleteMutation.isPending}
                          onClick={() => deleteMutation.mutate(listing.id)}
                          className="px-3 py-1.5 text-xs font-semibold bg-red-700 text-white rounded-lg hover:bg-red-800"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2.5 py-1.5 text-xs font-medium text-[#023B1F] hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(listing.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

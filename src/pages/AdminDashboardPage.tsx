import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CheckCircle2,
  Clock,
  Database,
  FolderKanban,
  MapPin,
  Package,
  Pencil,
  Phone,
  Search,
  Send,
  ShieldAlert,
  Star,
  Trash2,
  Users,
  UserCheck,
  UserMinus,
  UserX,
  Shield,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  adminApproveListing,
  adminDeleteUser,
  adminEditListing,
  adminRejectListing,
  adminToggleFeatured,
  adminToggleUserRole,
  clearDemoListingsAdmin,
  createCategory,
  deleteCategory,
  deleteListing,
  fetchAllListingsAdmin,
  fetchAllUsersAdmin,
  fetchCategories,
  seedDemoCatalogAdmin,
  updateCategory,
} from '../services/marketplaceService';
import {
  Category,
  categoryFormSchema,
  CategoryFormValues,
  formatDate,
  formatPrice,
  Listing,
  LISTING_STATUS_LABEL,
  LISTING_TYPE_LABEL,
  ListingStatus,
} from '../types/marketplace';

type AdminTab = 'submissions' | 'categories' | 'users';

export function AdminDashboardPage() {
  const { firebaseUser, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<AdminTab>('submissions');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ListingStatus>('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | 'ADMIN' | 'USER'>('ALL');
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState<string | null>(null);
  const [actionBanner, setActionBanner] = useState<string | null>(null);

  const { data: allListings = [], isLoading: listingsLoading } = useQuery({
    queryKey: ['admin-listings'],
    queryFn: fetchAllListingsAdmin,
    enabled: Boolean(firebaseUser && isAdmin),
  });

  const { data: allUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: fetchAllUsersAdmin,
    enabled: Boolean(firebaseUser && isAdmin),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    enabled: Boolean(firebaseUser && isAdmin),
  });

  const notify = (message: string) => {
    setActionBanner(message);
    setTimeout(() => setActionBanner(null), 4000);
  };

  const refreshAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] }),
      queryClient.invalidateQueries({ queryKey: ['approved-listings'] }),
      queryClient.invalidateQueries({ queryKey: ['my-listings'] }),
      queryClient.invalidateQueries({ queryKey: ['categories'] }),
      queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
    ]);
  };

  const approveMutation = useMutation({
    mutationFn: (id: string) =>
      adminApproveListing(id, firebaseUser?.email || 'admin'),
    onSuccess: async () => {
      setShowRejectBox(false);
      setRejectReason('');
      await refreshAll();
      notify('Listing approved and published to the public marketplace.');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminRejectListing(id, reason),
    onSuccess: async () => {
      setShowRejectBox(false);
      setRejectReason('');
      await refreshAll();
      notify('Listing rejected and hidden from public marketplace.');
    },
  });

  const featureMutation = useMutation({
    mutationFn: ({ id, next }: { id: string; next: boolean }) =>
      adminToggleFeatured(id, next),
    onSuccess: async () => {
      await refreshAll();
      notify('Featured status updated.');
    },
  });

  const editListingMutation = useMutation({
    mutationFn: () =>
      adminEditListing(editingListing!.id, {
        title: editTitle.trim(),
        price: Number(editPrice) || 0,
        location: editLocation.trim(),
      }),
    onSuccess: async () => {
      setEditingListing(null);
      await refreshAll();
      notify('Listing details updated by administrator.');
    },
  });

  const deleteListingMutation = useMutation({
    mutationFn: (id: string) => deleteListing(id),
    onSuccess: async () => {
      setConfirmDeleteId(null);
      setSelectedListingId(null);
      await refreshAll();
      notify('Listing deleted permanently.');
    },
  });

  const seedMutation = useMutation({
    mutationFn: () =>
      seedDemoCatalogAdmin(firebaseUser!.uid, firebaseUser!.email || 'admin'),
    onSuccess: async (count) => {
      await refreshAll();
      notify(
        count > 0
          ? `Seeded ${count} demo listings and default categories into Firestore.`
          : 'Default categories verified; demo catalog already exists in Firestore.'
      );
    },
  });

  const clearDemoMutation = useMutation({
    mutationFn: () => clearDemoListingsAdmin(),
    onSuccess: async (count) => {
      await refreshAll();
      notify(`Removed ${count} demo listings. Real user submissions remain untouched.`);
    },
  });

  const toggleUserRoleMutation = useMutation({
    mutationFn: ({ uid, role, email }: { uid: string; role: 'ADMIN' | 'USER'; email?: string }) =>
      adminToggleUserRole(uid, role, email),
    onSuccess: async (_, variables) => {
      await refreshAll();
      notify(
        variables.role === 'ADMIN'
          ? `User promoted to Administrator successfully.`
          : `User demoted to standard User.`
      );
    },
    onError: (err: any) => {
      notify(`Failed to update user role: ${err.message || 'Permission denied'}`);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (uid: string) => adminDeleteUser(uid),
    onSuccess: async () => {
      setConfirmDeleteUserId(null);
      await refreshAll();
      notify('User account and administrative records deleted.');
    },
    onError: (err: any) => {
      notify(`Failed to delete user: ${err.message || 'Error occurred'}`);
    },
  });

  const {
    register: regCat,
    handleSubmit: handleCatSubmit,
    reset: resetCatForm,
    setValue: setCatValue,
    formState: { errors: catErrors, isSubmitting: catSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: '', slug: '', description: '', sortOrder: 10 },
  });

  const onSaveCategory = async (values: CategoryFormValues) => {
    if (editingCategory) {
      await updateCategory(editingCategory.id, values);
      setEditingCategory(null);
      notify(`Updated category "${values.name}".`);
    } else {
      await createCategory(values);
      notify(`Created category "${values.name}".`);
    }
    resetCatForm({ name: '', slug: '', description: '', sortOrder: categories.length + 1 });
    await refreshAll();
  };

  const deleteCatMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: async () => {
      await refreshAll();
      notify('Category deleted.');
    },
  });

  // KPI Metrics
  const pendingCount = allListings.filter((l) => l.status === 'PENDING').length;
  const approvedCount = allListings.filter((l) => l.status === 'APPROVED').length;
  const rejectedCount = allListings.filter((l) => l.status === 'REJECTED').length;
  const demoCount = allListings.filter((l) => l.isDemo).length;

  const filteredSubmissions = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return allListings.filter((item) => {
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
      if (q) {
        const hay = [item.title, item.sellerName, item.categoryName, item.location]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [allListings, statusFilter, searchTerm]);

  const activeListing =
    filteredSubmissions.find((l) => l.id === selectedListingId) ||
    filteredSubmissions[0] ||
    null;

  if (authLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 pt-16 text-center text-sm text-[#023B1F]/75">
        Verifying administrator privileges...
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="max-w-xl mx-auto px-4 pt-16">
        <div className="bg-[#F2F2F2] border border-[#036A39]/15 rounded-2xl p-8 text-center space-y-4">
          <ShieldAlert className="w-8 h-8 text-[#C0A14E] mx-auto" />
          <h1 className="text-2xl font-bold text-[#036A39]">Administrator Sign-In Required</h1>
          <p className="text-sm text-[#023B1F]/75">
            Sign in with an authorized UNi GEBEYA administrator account to moderate listings.
          </p>
          <button
            type="button"
            onClick={() => navigate('/auth', { state: { from: '/admin' } })}
            className="px-5 py-2.5 bg-[#036A39] text-[#F2F2F2] text-sm font-semibold rounded-lg"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 pt-16">
        <div className="bg-[#F2F2F2] border border-red-300 rounded-2xl p-8 text-center space-y-4">
          <ShieldAlert className="w-8 h-8 text-red-700 mx-auto" />
          <h1 className="text-2xl font-bold text-[#023B1F]">Access Restricted</h1>
          <p className="text-sm text-[#023B1F]/75 leading-relaxed">
            Your account ({firebaseUser.email}) does not have administrator privileges. Standard
            users cannot approve listings or access moderation tools.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              to="/my-listings"
              className="px-4 py-2 bg-[#036A39] text-[#F2F2F2] text-sm font-semibold rounded-lg"
            >
              My Listings
            </Link>
            <Link
              to="/marketplace"
              className="px-4 py-2 border border-[#036A39]/25 text-[#036A39] text-sm font-semibold rounded-lg"
            >
              Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
      {/* Header + Demo Data Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-[#036A39]/15 pb-6">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-[#9D7F32]">UNi GEBEYA Moderation Console</p>
          <h1 className="text-3xl font-bold text-[#036A39]">Admin Dashboard</h1>
          <p className="text-sm text-[#023B1F]/75">
            Review pending submissions, manage categories, and oversee registered campus members.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            disabled={seedMutation.isPending}
            onClick={() => seedMutation.mutate()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#F2F2F2] border border-[#036A39]/25 text-[#036A39] rounded-lg hover:border-[#036A39] transition-colors whitespace-nowrap"
          >
            <Database className="w-3.5 h-3.5 text-[#C0A14E]" />
            {seedMutation.isPending ? 'Seeding...' : 'Seed Demo Catalog'}
          </button>
          {demoCount > 0 && (
            <button
              type="button"
              disabled={clearDemoMutation.isPending}
              onClick={() => clearDemoMutation.mutate()}
              className="px-3.5 py-2 text-xs font-medium text-red-700 bg-[#F2F2F2] border border-red-200 rounded-lg hover:bg-red-50 transition-colors whitespace-nowrap"
            >
              Clear Demo Data ({demoCount})
            </button>
          )}
        </div>
      </div>

      {actionBanner && (
        <div className="bg-[#036A39] text-[#F2F2F2] px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between">
          <span>{actionBanner}</span>
          <button
            type="button"
            onClick={() => setActionBanner(null)}
            className="text-xs text-[#C0A14E] hover:underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 5-Column Overview KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-[#F2F2F2] border border-[#036A39]/12 rounded-xl p-5">
          <p className="text-xs font-medium text-[#023B1F]/70">Total Users</p>
          <p className="font-[JetBrains_Mono] text-2xl font-bold text-[#036A39] mt-1 tabular-nums">
            {allUsers.length}
          </p>
        </div>
        <div className="bg-[#F2F2F2] border border-[#036A39]/12 rounded-xl p-5">
          <p className="text-xs font-medium text-[#023B1F]/70">Total Listings</p>
          <p className="font-[JetBrains_Mono] text-2xl font-bold text-[#036A39] mt-1 tabular-nums">
            {allListings.length}
          </p>
        </div>
        <div className="bg-[#F2F2F2] border border-[#C0A14E] rounded-xl p-5">
          <p className="text-xs font-semibold text-[#9D7F32]">Pending Review</p>
          <p className="font-[JetBrains_Mono] text-2xl font-bold text-[#023B1F] mt-1 tabular-nums">
            {pendingCount}
          </p>
        </div>
        <div className="bg-[#F2F2F2] border border-[#036A39]/12 rounded-xl p-5">
          <p className="text-xs font-medium text-[#036A39]">Approved Live</p>
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

      {/* Primary Admin Workspace Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#036A39]/15 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('submissions')}
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'submissions'
              ? 'bg-[#036A39] text-[#F2F2F2]'
              : 'bg-[#F2F2F2] text-[#023B1F] hover:bg-[#F2F2F2]/80'
          }`}
        >
          <Clock className="w-4 h-4" />
          Submissions Queue ({pendingCount} pending)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'categories'
              ? 'bg-[#036A39] text-[#F2F2F2]'
              : 'bg-[#F2F2F2] text-[#023B1F] hover:bg-[#F2F2F2]/80'
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          Categories ({categories.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-[#036A39] text-[#F2F2F2]'
              : 'bg-[#F2F2F2] text-[#023B1F] hover:bg-[#F2F2F2]/80'
          }`}
        >
          <Users className="w-4 h-4" />
          Users Directory ({allUsers.length})
        </button>
      </div>

      {/* ================================================================= */}
      {/* TAB 1: SUBMISSIONS MODERATION QUEUE                               */}
      {/* ================================================================= */}
      {activeTab === 'submissions' && (
        <div className="space-y-6">
          {/* Status Filter & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  { key: 'PENDING', label: `Pending (${pendingCount})` },
                  { key: 'APPROVED', label: `Approved (${approvedCount})` },
                  { key: 'REJECTED', label: `Rejected (${rejectedCount})` },
                  { key: 'ALL', label: `All (${allListings.length})` },
                ] as const
              ).map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => {
                    setStatusFilter(s.key);
                    setSelectedListingId(null);
                    setShowRejectBox(false);
                  }}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap tabular-nums ${
                    statusFilter === s.key
                      ? 'bg-[#C0A14E] text-[#023B1F]'
                      : 'bg-[#F2F2F2] text-[#023B1F] border border-[#036A39]/15'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-[#036A39]/60 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter by title, seller, category..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#F2F2F2] border border-[#036A39]/15 rounded-lg text-[#023B1F] focus:outline-none"
              />
            </div>
          </div>

          {listingsLoading ? (
            <div className="h-64 bg-[#F2F2F2] rounded-2xl animate-pulse" />
          ) : filteredSubmissions.length === 0 ? (
            <div className="bg-[#F2F2F2] border border-[#036A39]/12 rounded-2xl p-12 text-center space-y-3">
              <CheckCircle2 className="w-8 h-8 text-[#036A39] mx-auto" />
              <h2 className="text-lg font-semibold text-[#036A39]">
                {statusFilter === 'PENDING'
                  ? 'No pending submissions waiting for review'
                  : 'No listings match this filter'}
              </h2>
              <p className="text-sm text-[#023B1F]/70">
                When users submit new marketplace posts, they appear here immediately for approval.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Queue List */}
              <div className="lg:col-span-5 space-y-2.5 max-h-[760px] overflow-y-auto pr-1">
                {filteredSubmissions.map((item) => {
                  const isSelected = activeListing?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedListingId(item.id);
                        setShowRejectBox(false);
                        setRejectReason('');
                        setEditingListing(null);
                        setConfirmDeleteId(null);
                      }}
                      className={`w-full text-left p-4 rounded-xl border transition-colors flex gap-3.5 ${
                        isSelected
                          ? 'bg-[#F2F2F2] border-[#036A39] ring-1 ring-[#036A39]/25'
                          : 'bg-[#F2F2F2]/85 border-[#036A39]/12 hover:border-[#036A39]/35'
                      }`}
                    >
                      <div className="w-20 aspect-[4/3] rounded-lg overflow-hidden bg-[#DEE0DF] shrink-0">
                        {item.images?.[0] ? (
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#036A39]/40">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2 text-[11px]">
                          <span className="font-semibold text-[#036A39] truncate">
                            {item.categoryName}
                          </span>
                          <span
                            className={`font-semibold whitespace-nowrap ${
                              item.status === 'APPROVED'
                                ? 'text-[#036A39]'
                                : item.status === 'PENDING'
                                  ? 'text-[#9D7F32]'
                                  : 'text-red-700'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-[#023B1F] line-clamp-1">
                          {item.title}
                        </p>
                        <div className="flex items-center justify-between gap-2 text-xs text-[#023B1F]/70">
                          <span className="truncate">{item.sellerName}</span>
                          <span className="font-[JetBrains_Mono] font-semibold text-[#036A39] tabular-nums whitespace-nowrap">
                            {formatPrice(item.price, item.currency, item.listingType)}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#023B1F]/55">
                          {formatDate(item.createdAt)}
                          {item.isDemo ? ' · Demo Seed' : ' · User Submission'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right Moderation Preview & Action Panel */}
              {activeListing && (
                <div className="lg:col-span-7 bg-[#F2F2F2] border border-[#036A39]/15 rounded-2xl p-6 sm:p-7 space-y-6 lg:sticky lg:top-24">
                  {/* Top Bar of Preview */}
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#036A39]/12 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center flex-wrap gap-x-2 text-xs text-[#023B1F]/70">
                        <span className="font-semibold text-[#036A39]">
                          {LISTING_TYPE_LABEL[activeListing.listingType]}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{activeListing.categoryName}</span>
                        <span aria-hidden="true">·</span>
                        <span>{formatDate(activeListing.createdAt)}</span>
                      </div>
                      <h2 className="text-xl font-bold text-[#023B1F]">{activeListing.title}</h2>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                        activeListing.status === 'APPROVED'
                          ? 'text-[#036A39]'
                          : activeListing.status === 'PENDING'
                            ? 'text-[#9D7F32]'
                            : 'text-red-700'
                      }`}
                    >
                      {activeListing.status === 'APPROVED' && <CheckCircle2 className="w-4 h-4" />}
                      {activeListing.status === 'PENDING' && <Clock className="w-4 h-4" />}
                      {activeListing.status === 'REJECTED' && <XCircle className="w-4 h-4" />}
                      {LISTING_STATUS_LABEL[activeListing.status]}
                    </span>
                  </div>

                  {/* Images Preview */}
                  {activeListing.images && activeListing.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {activeListing.images.map((src, i) => (
                        <div
                          key={i}
                          className="aspect-[4/3] rounded-xl overflow-hidden bg-[#DEE0DF] border border-[#036A39]/10"
                        >
                          <img
                            src={src}
                            alt={`${activeListing.title} preview ${i + 1}`}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Price, Location, Seller Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#DEE0DF]/45 rounded-xl p-4 text-xs">
                    <div className="space-y-1.5">
                      <p className="font-semibold text-[#9D7F32]">Listing Pricing &amp; Campus</p>
                      <p className="font-[JetBrains_Mono] text-base font-bold text-[#036A39] tabular-nums">
                        {formatPrice(
                          activeListing.price,
                          activeListing.currency,
                          activeListing.listingType
                        )}
                      </p>
                      <p className="inline-flex items-center gap-1 text-[#023B1F]/80">
                        <MapPin className="w-3.5 h-3.5 text-[#C0A14E]" />
                        {activeListing.location}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="font-semibold text-[#9D7F32]">Seller &amp; Contact</p>
                      <p className="font-semibold text-[#023B1F] text-sm">
                        {activeListing.sellerName}
                      </p>
                      {activeListing.sellerOrg && (
                        <p className="text-[#023B1F]/70">{activeListing.sellerOrg}</p>
                      )}
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[#023B1F]/80 pt-0.5">
                        {activeListing.contactPhone && (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {activeListing.contactPhone}
                          </span>
                        )}
                        {activeListing.contactTelegram && (
                          <span className="inline-flex items-center gap-1">
                            <Send className="w-3 h-3" /> {activeListing.contactTelegram}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Full Description */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-[#023B1F]/70">Full Description</p>
                    <p className="text-sm text-[#023B1F]/85 leading-relaxed whitespace-pre-line">
                      {activeListing.description}
                    </p>
                  </div>

                  {activeListing.status === 'REJECTED' && activeListing.rejectionReason && (
                    <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-900">
                      <strong>Current Rejection Reason:</strong> {activeListing.rejectionReason}
                    </div>
                  )}

                  {/* Inline Quick Admin Edit Form */}
                  {editingListing?.id === activeListing.id && (
                    <div className="p-4 rounded-xl bg-[#DEE0DF]/55 border border-[#036A39]/20 space-y-3">
                      <p className="text-xs font-semibold text-[#036A39]">Quick Admin Edit</p>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#F2F2F2] border border-[#036A39]/20 rounded-lg text-[#023B1F]"
                        placeholder="Title"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-[#F2F2F2] border border-[#036A39]/20 rounded-lg text-[#023B1F] tabular-nums"
                          placeholder="Price"
                        />
                        <input
                          type="text"
                          value={editLocation}
                          onChange={(e) => setEditLocation(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-[#F2F2F2] border border-[#036A39]/20 rounded-lg text-[#023B1F]"
                          placeholder="Location"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={editListingMutation.isPending}
                          onClick={() => editListingMutation.mutate()}
                          className="px-3.5 py-1.5 text-xs font-semibold bg-[#036A39] text-[#F2F2F2] rounded-lg"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingListing(null)}
                          className="px-3 py-1.5 text-xs text-[#023B1F] hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Inline Reject Form */}
                  {showRejectBox && (
                    <div className="p-4 rounded-xl bg-red-50/70 border border-red-200 space-y-3">
                      <label className="block text-xs font-semibold text-red-900">
                        Reason for Rejection (visible to the seller)
                      </label>
                      <textarea
                        rows={2}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="e.g., Blurry photo, missing price, or prohibited item..."
                        className="w-full px-3 py-2 text-xs bg-white border border-red-200 rounded-lg text-[#023B1F] focus:outline-none"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={rejectMutation.isPending}
                          onClick={() =>
                            rejectMutation.mutate({
                              id: activeListing.id,
                              reason: rejectReason,
                            })
                          }
                          className="px-4 py-2 text-xs font-semibold bg-red-700 text-white rounded-lg hover:bg-red-800"
                        >
                          {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowRejectBox(false)}
                          className="px-3 py-2 text-xs text-[#023B1F] hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Primary Moderation Actions */}
                  <div className="pt-4 border-t border-[#036A39]/12 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      {activeListing.status !== 'APPROVED' && (
                        <button
                          type="button"
                          disabled={approveMutation.isPending}
                          onClick={() => approveMutation.mutate(activeListing.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#036A39] text-[#F2F2F2] text-xs font-semibold rounded-lg hover:bg-[#024D29] transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          {approveMutation.isPending ? 'Approving...' : 'Approve & Publish'}
                        </button>
                      )}

                      {activeListing.status !== 'REJECTED' && (
                        <button
                          type="button"
                          onClick={() => setShowRejectBox((prev) => !prev)}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-red-300 text-red-800 text-xs font-semibold rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      )}

                      {activeListing.status === 'APPROVED' && (
                        <button
                          type="button"
                          disabled={featureMutation.isPending}
                          onClick={() =>
                            featureMutation.mutate({
                              id: activeListing.id,
                              next: !activeListing.isFeatured,
                            })
                          }
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                            activeListing.isFeatured
                              ? 'bg-[#C0A14E] text-[#023B1F] border-[#C0A14E]'
                              : 'border-[#036A39]/25 text-[#036A39] hover:bg-[#036A39]/8'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5" />
                          {activeListing.isFeatured ? 'Featured' : 'Mark Featured'}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingListing(activeListing);
                          setEditTitle(activeListing.title);
                          setEditPrice(String(activeListing.price));
                          setEditLocation(activeListing.location);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-[#023B1F] border border-[#036A39]/20 rounded-lg hover:bg-[#DEE0DF]/60"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>

                      {confirmDeleteId === activeListing.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={deleteListingMutation.isPending}
                            onClick={() => deleteListingMutation.mutate(activeListing.id)}
                            className="px-3 py-2 text-xs font-semibold bg-red-700 text-white rounded-lg"
                          >
                            Confirm Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-2 text-xs text-[#023B1F]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(activeListing.id)}
                          className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 2: CATEGORIES MANAGER                                         */}
      {/* ================================================================= */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Category Form */}
          <form
            onSubmit={handleCatSubmit(onSaveCategory)}
            className="lg:col-span-5 bg-[#F2F2F2] border border-[#036A39]/12 rounded-2xl p-6 space-y-4"
          >
            <h2 className="text-lg font-semibold text-[#036A39]">
              {editingCategory ? `Edit "${editingCategory.name}"` : 'Add New Category'}
            </h2>

            <div>
              <label className="block text-xs font-semibold text-[#023B1F] mb-1">
                Category Name *
              </label>
              <input
                type="text"
                {...regCat('name', {
                  onChange: (e) => {
                    if (!editingCategory) {
                      const slug = String(e.target.value)
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-|-$/g, '');
                      setCatValue('slug', slug);
                    }
                  },
                })}
                placeholder="e.g., Dorm Furniture"
                className="w-full px-3.5 py-2 text-sm bg-[#DEE0DF]/40 border border-[#036A39]/20 rounded-lg text-[#023B1F] focus:bg-[#F2F2F2]"
              />
              {catErrors.name && (
                <p className="text-xs text-red-700 mt-1">{catErrors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-[#023B1F] mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  {...regCat('slug')}
                  placeholder="dorm-furniture"
                  className="w-full px-3.5 py-2 text-sm bg-[#DEE0DF]/40 border border-[#036A39]/20 rounded-lg text-[#023B1F] font-mono"
                />
                {catErrors.slug && (
                  <p className="text-xs text-red-700 mt-1">{catErrors.slug.message}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#023B1F] mb-1">Order</label>
                <input
                  type="number"
                  {...regCat('sortOrder', { valueAsNumber: true })}
                  className="w-full px-3 py-2 text-sm bg-[#DEE0DF]/40 border border-[#036A39]/20 rounded-lg text-[#023B1F] tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#023B1F] mb-1">
                Description
              </label>
              <textarea
                rows={3}
                {...regCat('description')}
                placeholder="Short summary of items in this category..."
                className="w-full px-3.5 py-2 text-sm bg-[#DEE0DF]/40 border border-[#036A39]/20 rounded-lg text-[#023B1F]"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={catSubmitting}
                className="px-4 py-2 bg-[#036A39] text-[#F2F2F2] text-xs font-semibold rounded-lg hover:bg-[#024D29]"
              >
                {editingCategory ? 'Update Category' : 'Create Category'}
              </button>
              {editingCategory && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingCategory(null);
                    resetCatForm({ name: '', slug: '', description: '', sortOrder: 10 });
                  }}
                  className="px-3 py-2 text-xs text-[#023B1F] hover:underline"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* Existing Categories List */}
          <div className="lg:col-span-7 bg-[#F2F2F2] border border-[#036A39]/12 rounded-2xl divide-y divide-[#036A39]/10">
            {categories.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#023B1F]/70">
                No categories found. Add one or click Seed Demo Catalog above.
              </div>
            ) : (
              categories.map((cat) => {
                const count = allListings.filter((l) => l.categoryId === cat.id).length;
                return (
                  <div
                    key={cat.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-[#023B1F]">{cat.name}</h3>
                        <span className="font-mono text-[11px] text-[#023B1F]/55">/{cat.slug}</span>
                      </div>
                      <p className="text-xs text-[#023B1F]/70">{cat.description}</p>
                      <p className="text-[11px] font-medium text-[#036A39] tabular-nums">
                        {count} {count === 1 ? 'listing' : 'listings'} · Sort #{cat.sortOrder}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategory(cat);
                          resetCatForm({
                            name: cat.name,
                            slug: cat.slug,
                            description: cat.description,
                            sortOrder: cat.sortOrder,
                          });
                        }}
                        className="px-3 py-1.5 text-xs font-medium text-[#036A39] border border-[#036A39]/25 rounded-lg hover:bg-[#036A39]/8"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={deleteCatMutation.isPending}
                        onClick={() => deleteCatMutation.mutate(cat.id)}
                        className="px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 rounded-lg"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 3: USERS DIRECTORY & ROLE MANAGEMENT                          */}
      {/* ================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-[#F2F2F2] border border-[#036A39]/12 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#036A39]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                placeholder="Search user by name, email, or phone..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-[#DEE0DF]/45 border border-[#036A39]/15 rounded-xl text-[#023B1F] placeholder:text-[#023B1F]/50 focus:bg-[#F2F2F2] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setUserRoleFilter('ALL')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  userRoleFilter === 'ALL'
                    ? 'bg-[#036A39] text-[#F2F2F2]'
                    : 'bg-[#DEE0DF]/60 text-[#023B1F] hover:bg-[#DEE0DF]'
                }`}
              >
                All Users ({allUsers.length})
              </button>
              <button
                type="button"
                onClick={() => setUserRoleFilter('ADMIN')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  userRoleFilter === 'ADMIN'
                    ? 'bg-[#C0A14E] text-[#023B1F]'
                    : 'bg-[#DEE0DF]/60 text-[#023B1F] hover:bg-[#DEE0DF]'
                }`}
              >
                Admins ({allUsers.filter((u) => u.role === 'ADMIN').length})
              </button>
              <button
                type="button"
                onClick={() => setUserRoleFilter('USER')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  userRoleFilter === 'USER'
                    ? 'bg-[#036A39] text-[#F2F2F2]'
                    : 'bg-[#DEE0DF]/60 text-[#023B1F] hover:bg-[#DEE0DF]'
                }`}
              >
                Standard ({allUsers.filter((u) => u.role !== 'ADMIN').length})
              </button>
            </div>
          </div>

          {/* Users List Container */}
          <div className="bg-[#F2F2F2] border border-[#036A39]/12 rounded-2xl overflow-hidden shadow-sm">
            {usersLoading ? (
              <div className="p-8 text-center text-sm text-[#023B1F]/70">Loading users...</div>
            ) : allUsers.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#023B1F]/70">No registered users yet.</div>
            ) : (
              (() => {
                const searchQ = userSearchTerm.trim().toLowerCase();
                const filteredUsers = allUsers.filter((u) => {
                  if (userRoleFilter === 'ADMIN' && u.role !== 'ADMIN') return false;
                  if (userRoleFilter === 'USER' && u.role === 'ADMIN') return false;
                  if (searchQ) {
                    const matchName = u.fullName?.toLowerCase().includes(searchQ);
                    const matchEmail = u.email?.toLowerCase().includes(searchQ);
                    const matchPhone = u.phone?.toLowerCase().includes(searchQ);
                    return matchName || matchEmail || matchPhone;
                  }
                  return true;
                });

                if (filteredUsers.length === 0) {
                  return (
                    <div className="p-8 text-center text-sm text-[#023B1F]/70">
                      No users match your search criteria.
                    </div>
                  );
                }

                return (
                  <div className="divide-y divide-[#036A39]/10">
                    {filteredUsers.map((u) => {
                      const userPosts = allListings.filter((l) => l.userId === u.uid);
                      const isExpanded = expandedUserId === u.uid;
                      const isCurrentUser = u.uid === firebaseUser?.uid;
                      const isUserAdmin = u.role === 'ADMIN';

                      return (
                        <div key={u.uid} className="p-5 space-y-3 hover:bg-[#DEE0DF]/20 transition-colors">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-bold text-[#023B1F]">
                                  {u.fullName || 'Anonymous Student'}
                                </span>
                                {isUserAdmin ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#036A39]/12 text-[#036A39] border border-[#036A39]/25">
                                    <ShieldCheck className="w-3.5 h-3.5 text-[#C0A14E]" />
                                    Admin
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#DEE0DF]/60 text-[#023B1F]/75">
                                    Student User
                                  </span>
                                )}
                                {isCurrentUser && (
                                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                    You
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[#023B1F]/70">
                                <span className="font-mono text-[#036A39]">{u.email}</span>
                                {u.phone ? ` · Tel: ${u.phone}` : ''}
                                {u.organization ? ` · ${u.organization}` : ''}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-[#023B1F]/60 pt-0.5">
                                <span className="font-[JetBrains_Mono] text-[#036A39] font-semibold tabular-nums">
                                  {userPosts.length} {userPosts.length === 1 ? 'listing' : 'listings'}
                                </span>
                                <span>·</span>
                                <span>Joined {formatDate(u.createdAt)}</span>
                                {userPosts.length > 0 && (
                                  <>
                                    <span>·</span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setExpandedUserId(isExpanded ? null : u.uid)
                                      }
                                      className="text-xs font-semibold text-[#036A39] hover:underline"
                                    >
                                      {isExpanded ? 'Hide listings' : 'View listings'}
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* User Management Actions */}
                            <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
                              {!isCurrentUser ? (
                                <>
                                  {/* Role Toggle Button */}
                                  {isUserAdmin ? (
                                    <button
                                      type="button"
                                      disabled={toggleUserRoleMutation.isPending}
                                      onClick={() =>
                                        toggleUserRoleMutation.mutate({
                                          uid: u.uid,
                                          role: 'USER',
                                          email: u.email,
                                        })
                                      }
                                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-amber-700/30 text-amber-900 bg-amber-50 hover:bg-amber-100 transition-colors flex items-center gap-1.5"
                                      title="Revoke admin privileges and change to standard user"
                                    >
                                      <UserMinus className="w-3.5 h-3.5" />
                                      <span>Demote to User</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      disabled={toggleUserRoleMutation.isPending}
                                      onClick={() =>
                                        toggleUserRoleMutation.mutate({
                                          uid: u.uid,
                                          role: 'ADMIN',
                                          email: u.email,
                                        })
                                      }
                                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#036A39] text-[#F2F2F2] hover:bg-[#024D29] transition-colors flex items-center gap-1.5 shadow-sm"
                                      title="Promote user to Platform Administrator"
                                    >
                                      <Shield className="w-3.5 h-3.5 text-[#C0A14E]" />
                                      <span>Promote to Admin</span>
                                    </button>
                                  )}

                                  {/* Delete User Button & Confirmation */}
                                  {confirmDeleteUserId === u.uid ? (
                                    <div className="flex items-center gap-1.5 bg-red-50 p-1 rounded-lg border border-red-300">
                                      <span className="text-[11px] font-semibold text-red-800 pl-1">
                                        Delete user?
                                      </span>
                                      <button
                                        type="button"
                                        disabled={deleteUserMutation.isPending}
                                        onClick={() => deleteUserMutation.mutate(u.uid)}
                                        className="px-2 py-1 text-xs font-bold bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                      >
                                        Yes, Delete
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setConfirmDeleteUserId(null)}
                                        className="px-2 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-200 rounded transition-colors"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteUserId(u.uid)}
                                      className="px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-colors flex items-center gap-1"
                                      title="Delete user account"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>Delete</span>
                                    </button>
                                  )}
                                </>
                              ) : (
                                <span className="text-xs italic text-[#023B1F]/60 px-2 py-1">
                                  Current Active Session
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Expanded Listings */}
                          {isExpanded && userPosts.length > 0 && (
                            <div className="pt-3 pl-4 border-t border-[#036A39]/10 space-y-2">
                              {userPosts.map((post) => (
                                <div
                                  key={post.id}
                                  className="flex flex-wrap items-center justify-between gap-2 text-xs py-1"
                                >
                                  <Link
                                    to={`/listings/${post.id}`}
                                    className="font-medium text-[#036A39] hover:underline"
                                  >
                                    {post.title}
                                  </Link>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[#023B1F]/65">{post.categoryName}</span>
                                    <span className="font-mono text-[#023B1F]/80">
                                      {formatPrice(post.price)}
                                    </span>
                                    <span
                                      className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                                        post.status === 'APPROVED'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : post.status === 'PENDING'
                                            ? 'bg-amber-100 text-amber-800'
                                            : post.status === 'SOLD'
                                              ? 'bg-neutral-200 text-neutral-800'
                                              : 'bg-red-100 text-red-800'
                                      }`}
                                    >
                                      {post.status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()
            )}
          </div>
        </div>
      )}
    </div>
  );
}

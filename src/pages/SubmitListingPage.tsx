import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  Clock,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { ImageUploader } from '../components/ImageUploader';
import { useAuth } from '../context/AuthContext';
import {
  createListing,
  ensureDefaultCategoriesAdmin,
  fetchCategories,
  fetchListingById,
  updateOwnListing,
} from '../services/marketplaceService';
import {
  LISTING_TYPE_OPTIONS,
  listingFormSchema,
  ListingFormValues,
} from '../types/marketplace';

export function SubmitListingPage() {
  const { id: editId } = useParams<{ id?: string }>();
  const isEditMode = Boolean(editId);
  const { firebaseUser, profile, isAdmin, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [images, setImages] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedListingId, setSubmittedListingId] = useState<string | null>(null);
  const [bootstrappingCats, setBootstrappingCats] = useState(false);

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const { data: existingListing, isLoading: existingLoading } = useQuery({
    queryKey: ['listing', editId],
    queryFn: () => fetchListingById(editId || ''),
    enabled: isEditMode && Boolean(firebaseUser),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      title: '',
      description: '',
      listingType: 'FOR_SALE',
      categoryId: '',
      price: 0,
      currency: 'ETB',
      location: '',
      contactPhone: '',
      contactTelegram: '',
      contactEmail: '',
      sellerName: '',
      sellerOrg: '',
    },
  });

  // Pre-fill seller profile on create mode
  useEffect(() => {
    if (!isEditMode && profile) {
      reset((prev) => ({
        ...prev,
        sellerName: prev.sellerName || profile.fullName || '',
        sellerOrg: prev.sellerOrg || profile.organization || '',
        contactPhone: prev.contactPhone || profile.phone || '',
        contactEmail: prev.contactEmail || profile.email || '',
        categoryId: prev.categoryId || categories[0]?.id || '',
      }));
    }
  }, [isEditMode, profile, categories, reset]);

  // Pre-fill existing listing on edit mode
  useEffect(() => {
    if (isEditMode && existingListing) {
      reset({
        title: existingListing.title,
        description: existingListing.description,
        listingType: existingListing.listingType,
        categoryId: existingListing.categoryId,
        price: existingListing.price,
        currency: existingListing.currency,
        location: existingListing.location,
        contactPhone: existingListing.contactPhone,
        contactTelegram: existingListing.contactTelegram,
        contactEmail: existingListing.contactEmail,
        sellerName: existingListing.sellerName,
        sellerOrg: existingListing.sellerOrg,
      });
      setImages(existingListing.images || []);
    }
  }, [isEditMode, existingListing, reset]);

  const handleInitCategories = async () => {
    setBootstrappingCats(true);
    try {
      await ensureDefaultCategoriesAdmin();
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
    } finally {
      setBootstrappingCats(false);
    }
  };

  const onSubmit = async (values: ListingFormValues) => {
    if (!firebaseUser) return;
    setImageError(null);
    setSubmitError(null);

    if (images.length === 0) {
      setImageError('Please add at least one photo of your item or service.');
      return;
    }

    const categoryObj = categories.find((c) => c.id === values.categoryId);
    if (!categoryObj) {
      setSubmitError('Please select a valid marketplace category.');
      return;
    }

    try {
      if (isEditMode && editId) {
        await updateOwnListing({
          listingId: editId,
          values,
          categoryName: categoryObj.name,
          images,
        });
        setSubmittedListingId(editId);
      } else {
        const newId = await createListing({
          userId: firebaseUser.uid,
          values,
          categoryName: categoryObj.name,
          images,
        });
        setSubmittedListingId(newId);
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['my-listings'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-listings'] }),
        queryClient.invalidateQueries({ queryKey: ['approved-listings'] }),
      ]);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Unable to submit listing. Please try again.'
      );
    }
  };

  if (authLoading || (isEditMode && existingLoading)) {
    return (
      <div className="max-w-3xl mx-auto px-4 pt-16 text-center text-sm text-[#023B1F]/75">
        Loading submission form...
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="max-w-xl mx-auto px-4 pt-16">
        <div className="bg-[#F2F2F2] border border-[#036A39]/15 rounded-2xl p-8 sm:p-10 text-center space-y-5">
          <Lock className="w-8 h-8 text-[#C0A14E] mx-auto" />
          <h1 className="text-2xl font-bold text-[#036A39]">Sign in to post a listing</h1>
          <p className="text-sm text-[#023B1F]/75 leading-relaxed">
            Create an account or sign in to submit products, rentals, or services to UNi GEBEYA and
            track admin approval status.
          </p>
          <button
            type="button"
            onClick={() => navigate('/auth', { state: { from: '/submit' } })}
            className="px-5 py-2.5 bg-[#036A39] text-[#F2F2F2] text-sm font-semibold rounded-lg hover:bg-[#024D29] transition-colors"
          >
            Continue to Sign In
          </button>
        </div>
      </div>
    );
  }

  if (
    isEditMode &&
    existingListing &&
    existingListing.userId !== firebaseUser.uid &&
    !isAdmin
  ) {
    return (
      <div className="max-w-xl mx-auto px-4 pt-16">
        <div className="bg-[#F2F2F2] border border-[#036A39]/15 rounded-2xl p-8 text-center space-y-4">
          <h1 className="text-xl font-bold text-[#036A39]">Not authorized to edit this listing</h1>
          <p className="text-sm text-[#023B1F]/75">
            You can only edit listings submitted from your own account.
          </p>
          <Link
            to="/my-listings"
            className="inline-block px-4 py-2 bg-[#036A39] text-[#F2F2F2] text-sm font-semibold rounded-lg"
          >
            Go to My Listings
          </Link>
        </div>
      </div>
    );
  }

  // Confirmation Screen after Successful Submission
  if (submittedListingId) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-14">
        <div className="bg-[#F2F2F2] border border-[#036A39]/18 rounded-2xl p-8 sm:p-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#036A39] text-[#F2F2F2] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-[#C0A14E]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#9D7F32]">Status: Pending Approval</p>
              <h1 className="text-2xl font-bold text-[#036A39]">
                {isEditMode ? 'Listing updated for review' : 'Listing submitted for admin review'}
              </h1>
            </div>
          </div>

          <p className="text-sm text-[#023B1F]/80 leading-relaxed">
            Your listing has been saved to the database with{' '}
            <strong className="text-[#036A39]">PENDING</strong> status. To maintain marketplace
            trust, only administrator-approved posts appear on the public marketplace. You can track
            its approval status anytime from <strong>My Listings</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/my-listings"
              className="px-5 py-2.5 bg-[#036A39] text-[#F2F2F2] text-sm font-semibold rounded-lg hover:bg-[#024D29] transition-colors"
            >
              View My Listings
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#C0A14E] text-[#023B1F] text-sm font-bold rounded-lg hover:bg-[#cbb061] transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                Review in Admin Dashboard
              </Link>
            )}
            <button
              type="button"
              onClick={() => {
                setSubmittedListingId(null);
                setImages([]);
                reset();
              }}
              className="px-4 py-2.5 border border-[#036A39]/25 text-[#036A39] text-sm font-medium rounded-lg hover:bg-[#036A39]/8 transition-colors"
            >
              Post Another Listing
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
      <div className="border-b border-[#036A39]/15 pb-5 space-y-1.5">
        <h1 className="text-3xl font-bold text-[#036A39]">
          {isEditMode ? 'Edit Listing' : 'Submit a Marketplace Listing'}
        </h1>
        <p className="text-sm text-[#023B1F]/75">
          {isEditMode
            ? 'Updating your listing returns it to Pending status for quick moderator review.'
            : 'All new submissions enter Pending review and go live immediately upon administrator approval.'}
        </p>
      </div>

      {!categoriesLoading && categories.length === 0 && (
        <div className="bg-[#F2F2F2] border border-[#C0A14E] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[#023B1F]">
              Marketplace categories have not been initialized yet
            </p>
            <p className="text-xs text-[#023B1F]/75">
              {isAdmin
                ? 'Initialize the 6 default UNi GEBEYA categories in Firestore so users can submit listings.'
                : 'An administrator needs to initialize marketplace categories before listings can be submitted.'}
            </p>
          </div>
          {isAdmin && (
            <button
              type="button"
              disabled={bootstrappingCats}
              onClick={() => void handleInitCategories()}
              className="px-4 py-2 bg-[#036A39] text-[#F2F2F2] text-xs font-semibold rounded-lg hover:bg-[#024D29] whitespace-nowrap shrink-0"
            >
              {bootstrappingCats ? 'Initializing...' : 'Initialize Categories'}
            </button>
          )}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-[#F2F2F2] border border-[#036A39]/12 rounded-2xl p-6 sm:p-8 space-y-8"
      >
        {submitError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
            {submitError}
          </div>
        )}

        {/* Section 1: Core Listing Information */}
        <div className="space-y-5">
          <h2 className="text-base font-semibold text-[#036A39] border-b border-[#036A39]/10 pb-2">
            01. Listing Details
          </h2>

          <div>
            <label className="block text-xs font-semibold text-[#023B1F] mb-1.5">
              Listing Title *
            </label>
            <input
              type="text"
              placeholder="e.g., HP EliteBook 840 G7 (16GB RAM) or Canon EOS M50 Rental"
              {...register('title')}
              className="w-full px-3.5 py-2.5 text-sm bg-[#DEE0DF]/40 border border-[#036A39]/20 rounded-lg text-[#023B1F] focus:bg-[#F2F2F2] focus:outline-none"
            />
            {errors.title && <p className="text-xs text-red-700 mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#023B1F] mb-1.5">
                Listing Type *
              </label>
              <select
                {...register('listingType')}
                className="w-full px-3.5 py-2.5 text-sm bg-[#DEE0DF]/40 border border-[#036A39]/20 rounded-lg text-[#023B1F] focus:bg-[#F2F2F2] focus:outline-none"
              >
                {LISTING_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#023B1F] mb-1.5">
                Category *
              </label>
              <select
                {...register('categoryId')}
                className="w-full px-3.5 py-2.5 text-sm bg-[#DEE0DF]/40 border border-[#036A39]/20 rounded-lg text-[#023B1F] focus:bg-[#F2F2F2] focus:outline-none"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-xs text-red-700 mt-1">{errors.categoryId.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#023B1F] mb-1.5">
                Price (enter 0 for open exchange / negotiable) *
              </label>
              <input
                type="number"
                min={0}
                step="any"
                {...register('price', { valueAsNumber: true })}
                className="w-full px-3.5 py-2.5 text-sm bg-[#DEE0DF]/40 border border-[#036A39]/20 rounded-lg text-[#023B1F] tabular-nums focus:bg-[#F2F2F2] focus:outline-none"
              />
              {errors.price && <p className="text-xs text-red-700 mt-1">{errors.price.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#023B1F] mb-1.5">
                Currency *
              </label>
              <select
                {...register('currency')}
                className="w-full px-3.5 py-2.5 text-sm bg-[#DEE0DF]/40 border border-[#036A39]/20 rounded-lg text-[#023B1F] focus:bg-[#F2F2F2] focus:outline-none"
              >
                <option value="ETB">ETB (Birr)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#023B1F] mb-1.5">
              Description *
            </label>
            <textarea
              rows={5}
              placeholder="Include item condition, specifications, rental terms, service turnaround, or meetup details..."
              {...register('description')}
              className="w-full px-3.5 py-2.5 text-sm bg-[#DEE0DF]/40 border border-[#036A39]/20 rounded-lg text-[#023B1F] focus:bg-[#F2F2F2] focus:outline-none"
            />
            {errors.description && (
              <p className="text-xs text-red-700 mt-1">{errors.description.message}</p>
            )}
          </div>
        </div>

        {/* Section 2: Photos */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-[#036A39] border-b border-[#036A39]/10 pb-2">
            02. Photos *
          </h2>
          <ImageUploader
            images={images}
            onChange={(next) => {
              setImages(next);
              if (next.length > 0) setImageError(null);
            }}
          />
          {imageError && <p className="text-xs text-red-700 font-medium">{imageError}</p>}
        </div>

        {/* Section 3: Location & Direct Contact */}
        <div className="space-y-5">
          <h2 className="text-base font-semibold text-[#036A39] border-b border-[#036A39]/10 pb-2">
            03. Location &amp; Contact Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#023B1F] mb-1.5">
                Campus or Neighborhood Location *
              </label>
              <input
                type="text"
                placeholder="e.g., JiT Kito Furdisa Gate, JU Main Campus Library, Kochi"
                {...register('location')}
                className="w-full px-3.5 py-2.5 text-sm bg-[#DEE0DF]/40 border border-[#036A39]/20 rounded-lg text-[#023B1F] focus:bg-[#F2F2F2] focus:outline-none"
              />
              {errors.location && (
                <p className="text-xs text-red-700 mt-1">{errors.location.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#023B1F] mb-1.5">
                Seller Display Name *
              </label>
              <input
                type="text"
                placeholder="Your full name or business name"
                {...register('sellerName')}
                className="w-full px-3.5 py-2.5 text-sm bg-[#DEE0DF]/40 border border-[#036A39]/20 rounded-lg text-[#023B1F] focus:bg-[#F2F2F2] focus:outline-none"
              />
              {errors.sellerName && (
                <p className="text-xs text-red-700 mt-1">{errors.sellerName.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#023B1F] mb-1.5">
              Department, Campus, or Local Business (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Software Engineering 4th Year / Selam Media Studio"
              {...register('sellerOrg')}
              className="w-full px-3.5 py-2.5 text-sm bg-[#DEE0DF]/40 border border-[#036A39]/20 rounded-lg text-[#023B1F] focus:bg-[#F2F2F2] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#023B1F] mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+251 9XX XXX XXX"
                {...register('contactPhone')}
                className="w-full px-3.5 py-2.5 text-sm bg-[#DEE0DF]/40 border border-[#036A39]/20 rounded-lg text-[#023B1F] focus:bg-[#F2F2F2] focus:outline-none"
              />
              {errors.contactPhone && (
                <p className="text-xs text-red-700 mt-1">{errors.contactPhone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#023B1F] mb-1.5">
                Telegram Username
              </label>
              <input
                type="text"
                placeholder="@username"
                {...register('contactTelegram')}
                className="w-full px-3.5 py-2.5 text-sm bg-[#DEE0DF]/40 border border-[#036A39]/20 rounded-lg text-[#023B1F] focus:bg-[#F2F2F2] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#023B1F] mb-1.5">
                Contact Email
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                {...register('contactEmail')}
                className="w-full px-3.5 py-2.5 text-sm bg-[#DEE0DF]/40 border border-[#036A39]/20 rounded-lg text-[#023B1F] focus:bg-[#F2F2F2] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Footer */}
        <div className="pt-4 border-t border-[#036A39]/12 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="inline-flex items-center gap-2 text-xs text-[#023B1F]/70">
            <CheckCircle2 className="w-4 h-4 text-[#C0A14E] shrink-0" />
            Submissions are reviewed by Uni Gebeya admins before appearing publicly.
          </p>
          <button
            type="submit"
            disabled={isSubmitting || categories.length === 0}
            className="px-6 py-3 bg-[#036A39] text-[#F2F2F2] text-sm font-semibold rounded-lg hover:bg-[#024D29] disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
          >
            {isSubmitting
              ? 'Submitting...'
              : isEditMode
                ? 'Save Changes & Resubmit'
                : 'Submit Listing for Approval'}
          </button>
        </div>
      </form>
    </div>
  );
}

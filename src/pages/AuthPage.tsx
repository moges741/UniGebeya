import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, LogOut, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BRAND_LOGO_URL } from '../data/seedData';
import { profileFormSchema, ProfileFormValues } from '../types/marketplace';

export function AuthPage() {
  const {
    firebaseUser,
    profile,
    isAdmin,
    isLoading,
    authError,
    signInWithGoogle,
    signOutUser,
    updateUserProfile,
  } = useAuth();

  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTarget = (location.state as { from?: string } | null)?.from;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: profile?.fullName || '',
      phone: profile?.phone || '',
      organization: profile?.organization || '',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        organization: profile.organization || '',
      });
    }
  }, [profile, reset]);

  const handleGoogleLogin = async () => {
    setIsSubmittingAuth(true);
    try {
      await signInWithGoogle();
      if (redirectTarget) {
        navigate(redirectTarget, { replace: true });
      }
    } catch {
      // Error surfaced via AuthContext
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const onSaveProfile = async (values: ProfileFormValues) => {
    setSavedNotice(false);
    await updateUserProfile(values);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-16 text-center text-sm text-[#023B1F]/75">
        Loading account...
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-12 bg-[#F2F2F2] border border-[#036A39]/15 rounded-2xl overflow-hidden">
          {/* Left Brand Panel */}
          <div className="md:col-span-5 bg-[#036A39] text-[#F2F2F2] p-8 flex flex-col justify-between gap-8">
            <div className="space-y-4">
              <img
                src={BRAND_LOGO_URL}
                alt="UNi GEBEYA logo"
                className="w-12 h-12 rounded-full ring-1 ring-[#C0A14E]/60"
              />
              <h1 className="text-2xl font-bold text-[#F2F2F2] leading-snug">
                Join UNi GEBEYA | ዩኒ ገበያ
              </h1>
              <p className="text-sm text-[#F2F2F2]/80 leading-relaxed">
                Sign in with your verified Google account to publish listings, track approval status
                in real time, and manage your campus storefront.
              </p>
            </div>
            <ul className="space-y-2.5 text-xs text-[#F2F2F2]/85">
              <li>• Instant account creation with verified email</li>
              <li>• Track Pending, Approved, and Rejected submissions</li>
              <li>• Role-protected moderation for marketplace trust</li>
            </ul>
          </div>

          {/* Right Sign-In Action Panel */}
          <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-[#036A39]">Sign in or create account</h2>
              <p className="text-sm text-[#023B1F]/75">
                New members are automatically registered as Uni Gebeya community users on first
                sign-in.
              </p>
            </div>

            {authError && (
              <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">
                {authError}
              </div>
            )}

            <button
              type="button"
              disabled={isSubmittingAuth}
              onClick={() => void handleGoogleLogin()}
              className="w-full py-3 px-5 bg-[#036A39] text-[#F2F2F2] text-sm font-semibold rounded-xl hover:bg-[#024D29] disabled:opacity-55 transition-colors flex items-center justify-center gap-3"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M21.35 11.1h-9.18v2.92h5.27c-.23 1.24-.92 2.29-1.96 3v2.49h3.17c1.86-1.71 2.93-4.23 2.93-7.21 0-.41-.04-.81-.1-1.2z"
                />
                <path
                  fill="currentColor"
                  d="M12.17 22c2.65 0 4.88-.88 6.5-2.38l-3.17-2.49c-.88.59-2 .94-3.33.94-2.56 0-4.73-1.73-5.51-4.05H3.38v2.56C5 19.79 8.33 22 12.17 22z"
                />
                <path
                  fill="currentColor"
                  d="M6.66 14.02c-.2-.59-.31-1.22-.31-1.87s.11-1.28.31-1.87V7.72H3.38A9.85 9.85 0 0 0 2.33 12.15c0 1.59.38 3.1 1.05 4.43l3.28-2.56z"
                />
                <path
                  fill="currentColor"
                  d="M12.17 6.23c1.44 0 2.74.5 3.76 1.47l2.82-2.82C17.04 3.29 14.82 2.3 12.17 2.3 8.33 2.3 5 4.51 3.38 7.72l3.28 2.56c.78-2.32 2.95-4.05 5.51-4.05z"
                />
              </svg>
              {isSubmittingAuth ? 'Signing in...' : 'Continue with Google'}
            </button>

            <p className="text-xs text-[#023B1F]/65 leading-relaxed">
              Need email/password sign-in later? You can enable Email/Password under Authentication
              → Sign-in method in your Firebase Console at any time.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#036A39]/15 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-[#036A39]">Account &amp; Profile</h1>
          <p className="text-sm text-[#023B1F]/75">
            Signed in as <span className="font-semibold text-[#023B1F]">{firebaseUser.email}</span>
            {' · '}
            <span className="font-medium text-[#9D7F32]">
              {isAdmin ? 'Administrator' : 'Community Member'}
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => void signOutUser()}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#036A39] bg-[#F2F2F2] border border-[#036A39]/25 rounded-lg hover:bg-[#036A39]/8 transition-colors self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Form */}
        <form
          onSubmit={handleSubmit(onSaveProfile)}
          className="lg:col-span-7 bg-[#F2F2F2] border border-[#036A39]/12 rounded-2xl p-6 sm:p-8 space-y-5"
        >
          <div className="flex items-center gap-2 text-[#036A39]">
            <UserCheck className="w-5 h-5 text-[#C0A14E]" />
            <h2 className="text-lg font-semibold">Seller &amp; Campus Details</h2>
          </div>
          <p className="text-xs text-[#023B1F]/70">
            These details pre-fill your contact information whenever you submit a new listing.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#023B1F] mb-1.5">
                Full Name or Business Name
              </label>
              <input
                type="text"
                {...register('fullName')}
                className="w-full px-3.5 py-2.5 text-sm bg-[#DEE0DF]/40 border border-[#036A39]/20 rounded-lg text-[#023B1F] focus:bg-[#F2F2F2] focus:outline-none"
              />
              {errors.fullName && (
                <p className="text-xs text-red-700 mt-1">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#023B1F] mb-1.5">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                placeholder="+251 9XX XXX XXX"
                {...register('phone')}
                className="w-full px-3.5 py-2.5 text-sm bg-[#DEE0DF]/40 border border-[#036A39]/20 rounded-lg text-[#023B1F] focus:bg-[#F2F2F2] focus:outline-none"
              />
              {errors.phone && (
                <p className="text-xs text-red-700 mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#023B1F] mb-1.5">
                University Campus, Department, or Local Business
              </label>
              <input
                type="text"
                placeholder="e.g., JiT Kito Furdisa Software Engineering / Jimma Print Hub"
                {...register('organization')}
                className="w-full px-3.5 py-2.5 text-sm bg-[#DEE0DF]/40 border border-[#036A39]/20 rounded-lg text-[#023B1F] focus:bg-[#F2F2F2] focus:outline-none"
              />
              {errors.organization && (
                <p className="text-xs text-red-700 mt-1">{errors.organization.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#036A39] text-[#F2F2F2] text-sm font-semibold rounded-lg hover:bg-[#024D29] disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Saving...' : 'Save Profile'}
            </button>
            {savedNotice && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#036A39]">
                <CheckCircle2 className="w-4 h-4 text-[#C0A14E]" />
                Profile updated
              </span>
            )}
          </div>
        </form>

        {/* Quick Workspace Links */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#F2F2F2] border border-[#036A39]/12 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-[#036A39]">Quick Actions</h2>
            <div className="space-y-2.5">
              <Link
                to="/submit"
                className="block w-full text-center px-4 py-2.5 bg-[#036A39] text-[#F2F2F2] text-sm font-semibold rounded-lg hover:bg-[#024D29] transition-colors"
              >
                Submit a New Listing
              </Link>
              <Link
                to="/my-listings"
                className="block w-full text-center px-4 py-2.5 border border-[#036A39]/25 text-[#036A39] text-sm font-semibold rounded-lg hover:bg-[#036A39]/8 transition-colors"
              >
                View My Listings &amp; Status
              </Link>
            </div>
          </div>

          {isAdmin && (
            <div className="bg-[#036A39] text-[#F2F2F2] rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-[#C0A14E]">
                <ShieldCheck className="w-5 h-5" />
                <h2 className="text-base font-semibold">Administrator Access</h2>
              </div>
              <p className="text-xs text-[#F2F2F2]/80 leading-relaxed">
                Review pending student &amp; business listings, approve or reject posts, manage
                categories, and oversee community users.
              </p>
              <Link
                to="/admin"
                className="inline-block px-4 py-2 bg-[#C0A14E] text-[#023B1F] text-xs font-bold rounded-lg hover:bg-[#cbb061] transition-colors"
              >
                Open Admin Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

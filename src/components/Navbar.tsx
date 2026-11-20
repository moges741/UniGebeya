import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BRAND_LOGO_URL } from '../data/seedData';

export function Navbar() {
  const { firebaseUser, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium whitespace-nowrap shrink-0 pb-0.5 transition-colors duration-150 ${
      isActive
        ? 'text-[#036A39] border-b-2 border-[#C0A14E]'
        : 'text-[#023B1F]/75 hover:text-[#036A39]'
    }`;

  const primaryActionPath = firebaseUser ? '/submit' : '/auth';
  const primaryActionLabel = firebaseUser ? 'Post Listing' : 'Sign In';

  return (
    <header className="sticky top-0 z-40 bg-[#F2F2F2]/95 backdrop-blur-sm border-b border-[#036A39]/12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <Link
          to="/"
          className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group"
          onClick={() => setMobileOpen(false)}
        >
          <img
            src={BRAND_LOGO_URL}
            alt="UNi GEBEYA logo"
            className="w-8 h-8 rounded-full object-cover shrink-0"
          />
          <span className="font-[Bricolage_Grotesque] text-lg font-bold tracking-tight text-[#036A39] whitespace-nowrap">
            UNi GEBEYA
          </span>
        </Link>

        {/* Zone 2: 4–5 Clean Single-Line Navigation Links */}
        <nav
          aria-label="Main navigation"
          className="hidden md:flex items-center gap-7"
        >
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/marketplace" className={navLinkClass}>
            Marketplace
          </NavLink>
          <NavLink to="/my-listings" className={navLinkClass}>
            My Listings
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={navLinkClass}>
              Admin
            </NavLink>
          )}
          {firebaseUser && (
            <NavLink to="/auth" className={navLinkClass}>
              Account
            </NavLink>
          )}
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="hidden md:flex items-center shrink-0">
          <button
            type="button"
            onClick={() => navigate(primaryActionPath)}
            className="px-4 py-2 text-sm font-semibold text-[#F2F2F2] bg-[#036A39] rounded-lg hover:bg-[#024D29] transition-colors duration-150 whitespace-nowrap shrink-0"
          >
            {primaryActionLabel}
          </button>
        </div>

        {/* Mobile Drawer Toggle */}
        <button
          type="button"
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setMobileOpen((prev) => !prev)}
          className="md:hidden p-2.5 text-[#036A39] hover:bg-[#036A39]/8 rounded-lg transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Navigation Panel */}
      {mobileOpen && (
        <div className="md:hidden bg-[#F2F2F2] border-t border-[#036A39]/12 px-4 py-4 space-y-2">
          <NavLink
            to="/"
            end
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2.5 text-sm font-medium text-[#036A39] rounded-lg hover:bg-[#DEE0DF]/70"
          >
            Home
          </NavLink>
          <NavLink
            to="/marketplace"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2.5 text-sm font-medium text-[#036A39] rounded-lg hover:bg-[#DEE0DF]/70"
          >
            Marketplace
          </NavLink>
          <NavLink
            to="/my-listings"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2.5 text-sm font-medium text-[#036A39] rounded-lg hover:bg-[#DEE0DF]/70"
          >
            My Listings
          </NavLink>
          {isAdmin && (
            <NavLink
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium text-[#036A39] rounded-lg hover:bg-[#DEE0DF]/70"
            >
              Admin Dashboard
            </NavLink>
          )}
          {firebaseUser && (
            <NavLink
              to="/auth"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium text-[#036A39] rounded-lg hover:bg-[#DEE0DF]/70"
            >
              Account & Profile
            </NavLink>
          )}
          <div className="pt-2 border-t border-[#036A39]/10">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                navigate(primaryActionPath);
              }}
              className="w-full py-2.5 px-4 text-sm font-semibold text-[#F2F2F2] bg-[#036A39] rounded-lg hover:bg-[#024D29] transition-colors"
            >
              {primaryActionLabel}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

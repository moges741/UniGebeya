import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ExternalLink, Menu, Send, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BRAND_LOGO_URL } from '../data/seedData';

export function Navbar() {
  const { firebaseUser, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-semibold whitespace-nowrap shrink-0 pb-0.5 transition-colors duration-150 ${
      isActive
        ? 'text-[#036A39] border-b-2 border-[#C0A14E]'
        : 'text-[#023B1F]/75 hover:text-[#036A39]'
    }`;

  const primaryActionPath = firebaseUser ? '/submit' : '/auth';
  const primaryActionLabel = firebaseUser ? '+ Post Listing' : 'Sign In';

  return (
    <header className="sticky top-0 z-40 bg-[#F2F2F2]/95 backdrop-blur-md border-b border-[#036A39]/12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Single-line Brand Wordmark */}
        <Link
          to="/"
          className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group"
          onClick={() => setMobileOpen(false)}
        >
          <img
            src={BRAND_LOGO_URL}
            alt="UNi GEBEYA logo"
            className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-[#036A39]/20"
          />
          <div className="flex items-baseline gap-1.5">
            <span className="font-[Bricolage_Grotesque] text-lg font-bold tracking-tight text-[#036A39] whitespace-nowrap">
              UNi GEBEYA
            </span>
            <span className="text-xs text-[#9D7F32] font-semibold hidden sm:inline">
              | ዩኒ ገበያ
            </span>
          </div>
        </Link>

        {/* Zone 2: Navigation Links */}
        <nav
          aria-label="Main navigation"
          className="hidden md:flex items-center gap-6 lg:gap-7"
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

        {/* Zone 3: Telegram Pill + Primary Action */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <a
            href="https://t.me/uni_gebeya"
            target="_blank"
            rel="noopener noreferrer"
            title="Join Uni Gebeya on Telegram"
            className="px-3 py-1.5 bg-[#229ED9]/10 text-[#229ED9] hover:bg-[#229ED9]/20 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>@uni_gebeya</span>
          </a>

          <button
            type="button"
            onClick={() => navigate(primaryActionPath)}
            className="px-4 py-2 text-xs font-bold text-[#F2F2F2] bg-[#036A39] rounded-xl hover:bg-[#024D29] transition-all whitespace-nowrap shrink-0 shadow-sm hover:shadow"
          >
            {primaryActionLabel}
          </button>
        </div>

        {/* Mobile Drawer Toggle */}
        <button
          type="button"
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setMobileOpen((prev) => !prev)}
          className="md:hidden p-2 text-[#036A39] hover:bg-[#036A39]/8 rounded-lg transition-colors"
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
            className="block px-3 py-2 text-sm font-semibold text-[#036A39] rounded-lg hover:bg-[#DEE0DF]/70"
          >
            Home
          </NavLink>
          <NavLink
            to="/marketplace"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 text-sm font-semibold text-[#036A39] rounded-lg hover:bg-[#DEE0DF]/70"
          >
            Marketplace
          </NavLink>
          <NavLink
            to="/my-listings"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 text-sm font-semibold text-[#036A39] rounded-lg hover:bg-[#DEE0DF]/70"
          >
            My Listings
          </NavLink>
          {isAdmin && (
            <NavLink
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-[#036A39] rounded-lg hover:bg-[#DEE0DF]/70"
            >
              Admin Dashboard
            </NavLink>
          )}
          {firebaseUser && (
            <NavLink
              to="/auth"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-[#036A39] rounded-lg hover:bg-[#DEE0DF]/70"
            >
              Account & Profile
            </NavLink>
          )}

          <div className="pt-2 border-t border-[#036A39]/10 space-y-2">
            <a
              href="https://t.me/uni_gebeya"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 text-xs font-bold text-[#229ED9] bg-[#229ED9]/10 rounded-lg flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Join @uni_gebeya on Telegram</span>
            </a>

            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                navigate(primaryActionPath);
              }}
              className="w-full py-2.5 px-4 text-xs font-bold text-[#F2F2F2] bg-[#036A39] rounded-xl hover:bg-[#024D29] transition-colors"
            >
              {primaryActionLabel}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

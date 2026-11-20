import { Link } from 'react-router-dom';
import { BRAND_LOGO_URL } from '../data/seedData';

export function Footer() {
  return (
    <footer className="bg-[#036A39] text-[#F2F2F2] border-t border-[#C0A14E]/30 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-[#F2F2F2]/15">
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={BRAND_LOGO_URL}
                alt="UNi GEBEYA emblem"
                className="w-10 h-10 rounded-full object-cover ring-1 ring-[#C0A14E]/50"
              />
              <div>
                <p className="font-[Bricolage_Grotesque] text-lg font-bold tracking-tight text-[#F2F2F2]">
                  UNi GEBEYA <span className="text-[#C0A14E] font-medium">| ዩኒ ገበያ</span>
                </p>
                <p className="text-xs text-[#F2F2F2]/75">
                  University Digital Marketplace
                </p>
              </div>
            </div>
            <p className="text-sm text-[#F2F2F2]/80 leading-relaxed max-w-md">
              Connecting university students and nearby local businesses to buy, sell, rent
              equipment, and offer trusted campus skills. Every listing is reviewed by moderators
              before going live.
            </p>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h3 className="text-sm font-semibold text-[#C0A14E]">Marketplace</h3>
            <ul className="space-y-2.5 text-sm text-[#F2F2F2]/80">
              <li>
                <Link to="/marketplace" className="hover:text-[#F2F2F2] transition-colors">
                  Browse All Listings
                </Link>
              </li>
              <li>
                <Link
                  to="/marketplace?type=FOR_SALE"
                  className="hover:text-[#F2F2F2] transition-colors"
                >
                  Products For Sale
                </Link>
              </li>
              <li>
                <Link
                  to="/marketplace?type=RENTAL"
                  className="hover:text-[#F2F2F2] transition-colors"
                >
                  Equipment Rentals
                </Link>
              </li>
              <li>
                <Link
                  to="/marketplace?type=SERVICE"
                  className="hover:text-[#F2F2F2] transition-colors"
                >
                  Student Skills & Services
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h3 className="text-sm font-semibold text-[#C0A14E]">Account</h3>
            <ul className="space-y-2.5 text-sm text-[#F2F2F2]/80">
              <li>
                <Link to="/submit" className="hover:text-[#F2F2F2] transition-colors">
                  Post a Listing
                </Link>
              </li>
              <li>
                <Link to="/my-listings" className="hover:text-[#F2F2F2] transition-colors">
                  My Listings
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-[#F2F2F2] transition-colors">
                  Sign In / Register
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h3 className="text-sm font-semibold text-[#C0A14E]">Community</h3>
            <p className="text-sm text-[#F2F2F2]/80 leading-relaxed">
              Born from campus Telegram channels and built for university startup communities.
            </p>
            <p className="text-xs text-[#C0A14E]">
              Moderated for campus trust.
            </p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F2F2F2]/70">
          <p>© {new Date().getFullYear()} UNi GEBEYA (ዩኒ ገበያ). All rights reserved.</p>
          <p>Direct student & local business trade — meet safely on campus.</p>
        </div>
      </div>
    </footer>
  );
}

import { Link } from 'react-router-dom';
import { Send, ShieldCheck, Sparkles } from 'lucide-react';
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
                className="w-10 h-10 rounded-full object-cover ring-2 ring-[#C0A14E]/50"
              />
              <div>
                <p className="font-[Bricolage_Grotesque] text-lg font-bold tracking-tight text-[#F2F2F2]">
                  UNi GEBEYA <span className="text-[#C0A14E] font-medium">| ዩኒ ገበያ</span>
                </p>
                <p className="text-xs text-[#F2F2F2]/75">
                  University Digital Marketplace &amp; Business Network
                </p>
              </div>
            </div>
            <p className="text-sm text-[#F2F2F2]/80 leading-relaxed max-w-md">
              Connecting university students and local businesses across Jimma to buy, sell,
              rent equipment, and discover trusted campus services. Every listing is reviewed by
              human moderators before publishing.
            </p>
            <div className="pt-2">
              <a
                href="https://t.me/uni_gebeya"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#229ED9] text-white text-xs font-bold rounded-lg hover:bg-[#1e8cc2] transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Join @uni_gebeya on Telegram</span>
              </a>
            </div>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h3 className="text-sm font-bold text-[#C0A14E] uppercase tracking-wider">
              Marketplace
            </h3>
            <ul className="space-y-2.5 text-sm text-[#F2F2F2]/80 font-medium">
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
                  Laptops &amp; Products For Sale
                </Link>
              </li>
              <li>
                <Link
                  to="/marketplace?type=RENTAL"
                  className="hover:text-[#F2F2F2] transition-colors"
                >
                  Camera &amp; Equipment Rentals
                </Link>
              </li>
              <li>
                <Link
                  to="/marketplace?type=SERVICE"
                  className="hover:text-[#F2F2F2] transition-colors"
                >
                  Student Skills &amp; Services
                </Link>
              </li>
              <li>
                <Link
                  to="/marketplace?type=WANTED"
                  className="text-[#C0A14E] hover:text-[#F2F2F2] transition-colors font-bold"
                >
                  🎯 Student Requests / Wanted Board
                </Link>
              </li>
              <li>
                <Link
                  to="/marketplace?category=local-business"
                  className="hover:text-[#F2F2F2] transition-colors"
                >
                  Verified Local Business Offers
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h3 className="text-sm font-bold text-[#C0A14E] uppercase tracking-wider">Account</h3>
            <ul className="space-y-2.5 text-sm text-[#F2F2F2]/80 font-medium">
              <li>
                <Link to="/submit" className="hover:text-[#F2F2F2] transition-colors">
                  Post a Free Listing
                </Link>
              </li>
              <li>
                <Link to="/my-listings" className="hover:text-[#F2F2F2] transition-colors">
                  My Active Listings
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-[#F2F2F2] transition-colors">
                  Sign In with Google
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h3 className="text-sm font-bold text-[#C0A14E] uppercase tracking-wider">
              Trust &amp; Safety
            </h3>
            <div className="space-y-2 text-xs text-[#F2F2F2]/80 leading-relaxed">
              <div className="flex items-center gap-1.5 text-[#C0A14E] font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Moderated</span>
              </div>
              <p>
                Zero spam, zero scams. We review every listing to maintain campus community integrity.
              </p>
              <p className="text-[11px] text-[#F2F2F2]/65">
                Always meet on campus grounds for safe exchanges.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F2F2F2]/70">
          <p>© {new Date().getFullYear()} UNi GEBEYA (ዩኒ ገበያ). Empowering university commerce.</p>
          <p>Jimma, Ethiopia · Direct student &amp; local merchant exchange.</p>
        </div>
      </div>
    </footer>
  );
}

import { Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import sidbiLogo from "@/assets/sidbi-logo.png";

const GovFooter = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <img src={sidbiLogo} alt="SIDBI" className="h-12 object-contain mb-1 -ml-1" />
            <p className="text-sm opacity-80 leading-relaxed">
              Small Industries Development Bank of India (SIDBI) set up under an Act of Indian Parliament,
              acts as the Principal Financial Institution for Promotion, Financing and Development of the MSME sector.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-primary-foreground/20 pb-2">Quick Links</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link to="/" className="hover:underline">Home</Link></li>
              <li><Link to="/#guidelines" className="hover:underline">Guidelines</Link></li>
              <li><Link to="/#faqs" className="hover:underline">FAQs</Link></li>
              <li><Link to="/#contact" className="hover:underline">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-primary-foreground/20 pb-2">Legal</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li><a href="#" className="hover:underline">Privacy Policy</a></li>
              <li><a href="#" className="hover:underline">Terms & Conditions</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-primary-foreground/20 pb-2">Contact Us</h3>
            <ul className="space-y-3 text-sm opacity-80">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>SIDBI Tower, 15 Ashok Marg, Lucknow - 226001</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <span>0522-2288546 / 47 / 48 / 49, 0522-4259700 </span>
              </li>
              





            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-primary-foreground/20 text-center text-xs opacity-60">
          <p>© {new Date().getFullYear()} Small Industries Development Bank of India. All Rights Reserved.</p>
          <p className="mt-1">Content Owned, Maintained and Updated by SIDBI.</p>
        </div>
      </div>
    </footer>);};

export default GovFooter;
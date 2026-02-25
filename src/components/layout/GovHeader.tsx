import { Link, useLocation } from "react-router-dom";
import sidbiLogo from "@/assets/sidbi-logo.png";
import { Phone, MessageCircle } from "lucide-react";

interface GovHeaderProps {
  showNav?: boolean;
}

const navItems = [
  { label: "Home", href: "/" },
  { label: "Guidelines", href: "/#guidelines" },
  { label: "FAQs", href: "/#faqs" },
  { label: "Contact", href: "/#contact" },
];

const GovHeader = ({ showNav = true }: GovHeaderProps) => {
  const location = useLocation();

  return (
    <header className="w-full">
      {/* Top Utility Bar */}
      <div className="bg-gradient-to-r from-[hsl(170,40%,45%)] to-[hsl(140,35%,55%)] text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-1.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <MessageCircle className="h-3 w-3" />
            <span>+91 86930 33333</span>
          </div>
          <div className="flex items-center gap-1">
            <Phone className="h-3 w-3" />
            <span>Toll Free Number: 180-022-6753</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-card border-b-2 border-primary">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={sidbiLogo} alt="SIDBI - Small Industries Development Bank of India" className="h-12 object-contain" />
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-primary leading-tight">SIDBI</p>
              <p className="text-xs text-muted-foreground leading-tight">Small Industries Development Bank of India</p>
              <p className="text-xs text-muted-foreground leading-tight">Government of India</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold border border-primary text-primary hover:bg-primary/10 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation */}
      {showNav && (
        <nav className="bg-primary" aria-label="Main navigation">
          <div className="mx-auto max-w-7xl px-4">
            <ul className="flex flex-wrap items-center gap-0">
              {navItems.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className={`block px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-secondary transition-colors ${
                      location.pathname === item.href ? "bg-secondary" : ""
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      )}
    </header>
  );
};

export default GovHeader;

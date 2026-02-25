import { Link, useLocation, useNavigate } from "react-router-dom";
import sidbiLogo from "@/assets/sidbi-logo.png";
import { clearSession, getSession } from "@/lib/authStore";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface GovInternalHeaderProps {
  title: string;
  subtitle?: string;
  navItems?: NavItem[];
  children?: React.ReactNode;
}

const GovInternalHeader = ({ title, subtitle, children }: GovInternalHeaderProps) => {
  const session = getSession();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  return (
    <header className="bg-primary text-primary-foreground border-b-4 border-secondary">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={sidbiLogo} alt="SIDBI" className="h-10 object-contain" />
          <div>
            <p className="font-bold text-sm tracking-wide">{title}</p>
            {subtitle && <p className="text-xs opacity-70">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {children}
          <span className="text-xs opacity-70 hidden sm:block">
            Logged in as: <span className="font-semibold">{session?.email}</span>
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary-foreground hover:bg-primary-foreground/10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-1" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

interface GovSidebarProps {
  items: NavItem[];
  activeHref?: string;
}

const GovSidebar = ({ items, activeHref }: GovSidebarProps) => {
  const location = useLocation();
  const current = activeHref || location.pathname;

  return (
    <aside className="w-60 bg-card border-r border-border min-h-[calc(100vh-60px)] shrink-0">
      <nav className="py-4">
        <ul className="space-y-0.5">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-colors border-l-4 ${
                  current === item.href
                    ? "border-secondary bg-muted text-primary font-bold"
                    : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export { GovInternalHeader, GovSidebar };

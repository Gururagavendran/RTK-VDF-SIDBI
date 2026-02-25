import { Link } from "react-router-dom";
import sidbiLogo from "@/assets/sidbi-logo.png";
import GovFooter from "@/components/layout/GovFooter";
import { ArrowLeft } from "lucide-react";

interface PublicLayoutProps {
  subtitle: string;
  backTo?: string;
  backLabel?: string;
  children: React.ReactNode;
}

const PublicLayout = ({ subtitle, backTo, backLabel, children }: PublicLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground border-b-4 border-secondary">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <img src={sidbiLogo} alt="SIDBI" className="h-10 object-contain" />
            </Link>
            <div>
              <p className="font-bold text-sm tracking-wide">SIDBI Portal</p>
              <p className="text-xs opacity-70">{subtitle}</p>
            </div>
          </div>
          {backTo && (
            <Link
              to={backTo}
              className="flex items-center gap-1 text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {backLabel || "Back"}
            </Link>
          )}
        </div>
      </header>

      <div className="flex-1">
        {children}
      </div>

      <GovFooter />
    </div>
  );
};

export default PublicLayout;

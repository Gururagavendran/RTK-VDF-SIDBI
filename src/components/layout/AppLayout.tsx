import { useNavigate } from "react-router-dom";
import { GovInternalHeader } from "@/components/layout/GovInternal";
import GovFooter from "@/components/layout/GovFooter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight } from "lucide-react";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface AppLayoutProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  backTo?: string;
  backLabel?: string;
  headerChildren?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
  noPadding?: boolean;
}

const AppLayout = ({
  title,
  subtitle,
  breadcrumbs,
  backTo,
  backLabel,
  headerChildren,
  children,
  maxWidth,
  noPadding = false,
}: AppLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <GovInternalHeader title={title} subtitle={subtitle}>
        {headerChildren}
      </GovInternalHeader>

      {/* Breadcrumb / Back navigation bar */}
      {(breadcrumbs || backTo) && (
        <div className="bg-card border-b border-border">
          <div className={`mx-auto ${maxWidth || "max-w-7xl"} px-4 py-2 flex items-center gap-2`}>
            {backTo && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-foreground -ml-2"
                onClick={() => navigate(backTo)}
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                {backLabel || "Back"}
              </Button>
            )}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="flex items-center gap-1 text-xs" aria-label="Breadcrumb">
                {breadcrumbs.map((crumb, idx) => (
                  <span key={idx} className="flex items-center gap-1">
                    {idx > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                    {crumb.href ? (
                      <button
                        onClick={() => navigate(crumb.href!)}
                        className="text-primary hover:underline font-medium"
                      >
                        {crumb.label}
                      </button>
                    ) : (
                      <span className="text-muted-foreground font-medium">{crumb.label}</span>
                    )}
                  </span>
                ))}
              </nav>
            )}
          </div>
        </div>
      )}

      <div className={`flex-1 ${noPadding ? "" : "px-4 py-6"}`}>
        {children}
      </div>

      <GovFooter />
    </div>
  );
};

export default AppLayout;

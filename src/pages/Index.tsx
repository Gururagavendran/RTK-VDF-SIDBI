import { Link } from "react-router-dom";
import GovHeader from "@/components/layout/GovHeader";
import GovFooter from "@/components/layout/GovFooter";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <GovHeader showNav={true} />

      {/* Hero Section */}
      <section className="flex-1 bg-card border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold text-primary leading-tight">Venture Debt and Incubator Fund

            </h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Digital, Transparent, Structured Credit Support for Growth-Stage Enterprises
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/login">
                <Button size="lg" className="text-sm font-bold uppercase tracking-wider px-8">
                  Login <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="lg" className="text-sm font-bold uppercase tracking-wider px-8 border-primary text-primary">
                  Register <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <GovFooter />
    </div>);

};

export default Index;
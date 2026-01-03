import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Home, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 pt-24">
        <div className="text-center max-w-md">
          {/* 404 Number - Subtle, not screaming */}
          <div className="mb-6">
            <span className="font-display text-[100px] md:text-[140px] font-bold text-slate-200 leading-none select-none">
              404
            </span>
          </div>

          {/* Headline - Relatable, cycling reference */}
          <h1 className="font-display font-bold text-2xl md:text-3xl text-slate-900 mb-3">
            You Took a Wrong Turn 🚴
          </h1>

          {/* Subtext - Short. Self-aware. */}
          <p className="text-slate-500 mb-8 leading-relaxed">
            This route doesn't exist.<br />
            <span className="text-slate-400">Happens even with GPS.</span>
          </p>

          {/* CTAs - Clear prioritization */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="gap-2 rounded-xl">
              <Link to="/">
                <Home className="w-4 h-4" />
                Re-route to Home
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="gap-2 rounded-xl">
              <Link to="/dashboard">
                <LayoutDashboard className="w-4 h-4" />
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;

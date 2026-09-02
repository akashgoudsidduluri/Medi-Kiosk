import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { Activity, Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-parchment/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-vintage-blue to-vintage-teal flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-foreground" style={{ fontFamily: "Georgia, serif" }}>
                MediKiosk
              </span>
              <span className="hidden sm:inline text-[10px] ml-1.5 text-muted-foreground uppercase tracking-widest">
                Prototype
              </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-sm text-muted-foreground hover:text-foreground"
              onClick={() => {
                const el = document.getElementById("how-it-works");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              How It Works
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-sm text-muted-foreground hover:text-foreground"
              onClick={() => {
                const el = document.getElementById("for-patients");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              For Patients
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-sm text-muted-foreground hover:text-foreground"
              onClick={() => {
                const el = document.getElementById("for-doctors");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              For Doctors
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-sm text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/technology")}
            >
              Technology
            </Button>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-sm"
              onClick={() => navigate("/doctor/login")}
            >
              Doctor Login
            </Button>
            <Button
              size="sm"
              className="text-sm bg-vintage-blue hover:bg-vintage-blue/90 text-white"
              onClick={() => navigate("/patient/login")}
            >
              Patient Login / Signup
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-muted transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-sm"
              onClick={() => {
                setMobileMenuOpen(false);
                const el = document.getElementById("how-it-works");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              How It Works
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm"
              onClick={() => {
                setMobileMenuOpen(false);
                const el = document.getElementById("for-patients");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              For Patients
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm"
              onClick={() => {
                setMobileMenuOpen(false);
                const el = document.getElementById("for-doctors");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              For Doctors
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/technology");
              }}
            >
              Technology
            </Button>
            <div className="pt-2 border-t border-border space-y-2">
              <Button
                variant="outline"
                className="w-full text-sm"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/doctor/login");
                }}
              >
                Doctor Login
              </Button>
              <Button
                className="w-full text-sm bg-vintage-blue hover:bg-vintage-blue/90 text-white"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/patient/login");
                }}
              >
                Patient Login / Signup
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

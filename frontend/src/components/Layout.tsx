import { Outlet, useNavigate, useLocation } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useAdminQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Beef,
  Users,
  Truck,
  LogOut,
  Menu,
  X,
  Droplets,
  Package,
} from 'lucide-react';
import { useState } from 'react';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/cattle', label: 'Cattle', icon: Beef },
  { to: '/milk', label: 'Milk Production', icon: Droplets },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/deliveries', label: 'Deliveries', icon: Truck },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { clear, identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/admin-login' });
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-farm-bg">
      {/* Top Nav */}
      <header className="bg-white sticky top-0 z-20 shadow-sm border-b border-farm-border">
        <div className="px-4 flex items-center justify-between h-16 max-w-[1400px] mx-auto">
          {/* Logo */}
          <button
            onClick={() => navigate({ to: '/dashboard' })}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0"
          >
            <img
              src="/assets/generated/ao-farms-logo.dim_120x80.png"
              alt="AO Farms"
              className="h-12 w-auto"
            />
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <button
                key={to}
                onClick={() => navigate({ to: to as any })}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                  isActive(to)
                    ? 'bg-farm-primary text-white'
                    : 'text-farm-text hover:text-farm-primary hover:bg-farm-primary/10'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-farm-text/70 hover:text-farm-primary hover:bg-farm-primary/10 hidden md:flex"
              >
                <LogOut className="h-4 w-4 mr-1.5" />
                Sign Out
              </Button>
            )}
            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-farm-text p-1"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-farm-border px-4 py-3 space-y-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <button
                key={to}
                onClick={() => {
                  navigate({ to: to as any });
                  setMobileOpen(false);
                }}
                className={`flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                  isActive(to)
                    ? 'bg-farm-primary text-white'
                    : 'text-farm-text hover:text-farm-primary hover:bg-farm-primary/10'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-semibold text-farm-text/70 hover:text-farm-primary hover:bg-farm-primary/10"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        )}
      </header>

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-farm-text/50 border-t border-farm-border bg-white">
        <p>
          © {new Date().getFullYear()} AO Farms · Built with{' '}
          <span className="text-red-500">♥</span> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-farm-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

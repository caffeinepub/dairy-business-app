import { Link, useRouterState } from '@tanstack/react-router';
import { LayoutDashboard, Beef, Droplets, Package, Menu, X, Users, Truck, BarChart3 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/cattle', label: 'Cattle', icon: Beef },
    { to: '/milk', label: 'Milk Production', icon: Droplets },
    { to: '/inventory', label: 'Inventory', icon: Package },
    { to: '/customers', label: 'Customers', icon: Users },
    { to: '/deliveries', label: 'Deliveries', icon: Truck },
    { to: '/reports', label: 'Reports', icon: BarChart3 },
];

export default function Layout({ children }: { children: React.ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const routerState = useRouterState();
    const currentPath = routerState.location.pathname;

    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Top Navigation */}
            <header className="sticky top-0 z-50 bg-card border-b border-border shadow-xs print:hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20 md:h-24">
                        {/* Logo */}
                        <Link to="/" className="flex items-center shrink-0">
                            <img
                                src="/assets/ChatGPT Image Feb 23, 2026, 01_57_16 PM.png"
                                alt="AO Farms logo"
                                className="h-12 md:h-16 w-auto object-contain"
                            />
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden lg:flex items-center gap-1">
                            {navLinks.map(({ to, label, icon: Icon }) => {
                                const isActive = to === '/' ? currentPath === '/' : currentPath.startsWith(to);
                                return (
                                    <Link
                                        key={to}
                                        to={to}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                                            isActive
                                                ? 'bg-primary text-primary-foreground'
                                                : 'text-foreground hover:bg-secondary hover:text-secondary-foreground'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {label}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Mobile menu button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Nav */}
                {mobileOpen && (
                    <div className="lg:hidden border-t border-border bg-card px-4 py-3 space-y-1">
                        {navLinks.map(({ to, label, icon: Icon }) => {
                            const isActive = to === '/' ? currentPath === '/' : currentPath.startsWith(to);
                            return (
                                <Link
                                    key={to}
                                    to={to}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                                        isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-foreground hover:bg-secondary'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-border bg-card mt-auto print:hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
                    <span>© {new Date().getFullYear()} AO Farms. All rights reserved.</span>
                    <span className="flex items-center gap-1">
                        Built with{' '}
                        <span className="text-destructive">♥</span>{' '}
                        using{' '}
                        <a
                            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'ao-farms')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-primary hover:underline"
                        >
                            caffeine.ai
                        </a>
                    </span>
                </div>
            </footer>
        </div>
    );
}

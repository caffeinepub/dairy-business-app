import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ShieldCheck, User } from 'lucide-react';

export default function LoginSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-admin-bg via-green-50 to-customer-bg flex flex-col">
      {/* Header */}
      <header className="bg-admin-dark text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-center">
          <img
            src="/assets/generated/ao-farms-logo.dim_320x160.png"
            alt="AO Farms"
            className="h-9 object-contain brightness-0 invert"
          />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <img
            src="/assets/generated/ao-farms-logo.dim_400x400.png"
            alt="AO Farms Logo"
            className="h-24 w-24 object-contain mx-auto mb-5 rounded-2xl shadow-card"
          />
          <h1 className="text-4xl font-bold text-admin-dark tracking-tight">Welcome to AO Farms</h1>
          <p className="text-muted-foreground mt-3 text-lg max-w-md mx-auto">
            Your trusted dairy farm management system. Please select how you'd like to sign in.
          </p>
        </div>

        {/* Login Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
          {/* Admin Card */}
          <button
            onClick={() => navigate({ to: '/admin-login' })}
            className="group bg-white rounded-2xl border-2 border-border shadow-card hover:border-primary hover:shadow-lg transition-all duration-200 p-8 flex flex-col items-center gap-4 text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <div className="h-16 w-16 rounded-2xl bg-admin-dark/10 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
              <ShieldCheck className="h-8 w-8 text-admin-dark group-hover:text-primary transition-colors" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-admin-dark group-hover:text-primary transition-colors">
                Admin Login
              </h2>
              <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed">
                Access the management panel to manage cattle, customers, and orders.
              </p>
            </div>
            <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              Sign in as Admin →
            </span>
          </button>

          {/* Customer Card */}
          <button
            onClick={() => navigate({ to: '/customer-login' })}
            className="group bg-white rounded-2xl border-2 border-border shadow-card hover:border-primary hover:shadow-lg transition-all duration-200 p-8 flex flex-col items-center gap-4 text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <div className="h-16 w-16 rounded-2xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
              <User className="h-8 w-8 text-primary transition-colors" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-admin-dark group-hover:text-primary transition-colors">
                Customer Login
              </h2>
              <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed">
                Sign in to place orders, track deliveries, and manage your account.
              </p>
            </div>
            <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              Sign in as Customer →
            </span>
          </button>
        </div>

        <p className="mt-10 text-sm text-muted-foreground text-center">
          Need access? Contact your AO Farms administrator.
        </p>
      </main>

      {/* Footer */}
      <footer className="bg-admin-dark text-white/60 py-5 text-center text-sm">
        <p>
          © {new Date().getFullYear()} AO Farms. Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

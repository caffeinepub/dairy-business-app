import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, User, Milk } from 'lucide-react';

export default function LoginSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-admin-bg">
      {/* Hero Section */}
      <div
        className="relative w-full h-48 md:h-64 bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: 'url(/assets/generated/farm-hero-bg.dim_1440x320.png)' }}
      >
        <div className="absolute inset-0 bg-primary/60" />
        <div className="relative z-10 text-center text-white px-4">
          <img
            src="/assets/generated/ao-farms-logo.dim_320x160.png"
            alt="AO Farms"
            className="h-14 mx-auto mb-2 drop-shadow-lg"
          />
          <h1 className="text-3xl md:text-4xl font-bold font-display drop-shadow">AO Farms</h1>
          <p className="text-white/90 mt-1 text-sm md:text-base">Premium Dairy Business Management</p>
        </div>
      </div>

      {/* Login Cards */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground font-display mb-2 text-center">
          Welcome Back
        </h2>
        <p className="text-muted-foreground mb-10 text-center">
          Choose your login type to continue
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          {/* Admin Card */}
          <Card
            className="cursor-pointer hover:shadow-card-hover transition-all duration-200 border-2 hover:border-primary group"
            onClick={() => navigate({ to: '/admin-login' })}
          >
            <CardHeader className="text-center pb-3">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl font-display">Admin Login</CardTitle>
              <CardDescription>
                Manage cattle, customers, orders, and reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate({ to: '/admin-login' })}>
                Login as Admin
              </Button>
            </CardContent>
          </Card>

          {/* Customer Card */}
          <Card
            className="cursor-pointer hover:shadow-card-hover transition-all duration-200 border-2 hover:border-farm-green group"
            onClick={() => navigate({ to: '/customer-login' })}
          >
            <CardHeader className="text-center pb-3">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-farm-green/10 group-hover:bg-farm-green/20 transition-colors">
                <User className="h-8 w-8 text-farm-green" />
              </div>
              <CardTitle className="text-xl font-display">Customer Login</CardTitle>
              <CardDescription>
                Place orders and track your deliveries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full border-farm-green text-farm-green hover:bg-farm-green hover:text-white"
                onClick={() => navigate({ to: '/customer-login' })}
              >
                Login as Customer
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Product Showcase */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
            <Milk className="h-5 w-5" />
            <span className="text-sm font-medium">Fresh Dairy Products</span>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {['Fresh Milk', 'Pure Ghee', 'Paneer', 'Curd', 'Butter'].map((product) => (
              <span
                key={product}
                className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
              >
                {product}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-muted-foreground border-t border-border">
        <p>
          © {new Date().getFullYear()} AO Farms. Built with{' '}
          <span className="text-red-500">♥</span> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

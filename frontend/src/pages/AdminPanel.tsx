import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import AdminCattleManagement from '../components/AdminCattleManagement';
import AdminCustomerManagement from '../components/AdminCustomerManagement';
import AdminOrdersDeliveries from '../components/AdminOrdersDeliveries';
import { Loader2, LogOut, ShieldCheck, Beef, Users, Package } from 'lucide-react';

export default function AdminPanel() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const qc = useQueryClient();
  const isAuthenticated = !!identity;

  const { data: isAdmin, isLoading: adminLoading } = useQuery({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
  });

  const handleLogin = async () => {
    try {
      await login();
    } catch (e: any) {
      if (e?.message === 'User is already authenticated') {
        await clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  const handleLogout = async () => {
    await clear();
    qc.clear();
  };

  const isLoggingIn = loginStatus === 'logging-in';
  const isChecking = actorFetching || adminLoading;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-admin-bg to-admin-bg/80 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-border">
          <CardContent className="pt-8 pb-8 px-8 flex flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-3">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold text-admin-dark">Admin Panel</h1>
                <p className="text-muted-foreground text-sm mt-1">AO Farms Management System</p>
              </div>
            </div>
            <div className="w-full space-y-3">
              <p className="text-sm text-center text-muted-foreground">
                Sign in with your admin credentials to access the management panel.
              </p>
              <Button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 text-base"
              >
                {isLoggingIn ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Signing in...</>
                ) : (
                  'Sign In as Admin'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isChecking) {
    return (
      <div className="min-h-screen bg-admin-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-admin-bg flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="pt-8 pb-8 px-8 flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <ShieldCheck className="h-8 w-8 text-destructive" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-destructive">Access Denied</h2>
              <p className="text-muted-foreground text-sm mt-2">
                Your account does not have admin privileges. Please contact the system administrator.
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-admin-bg">
      {/* Admin Header */}
      <header className="bg-admin-dark text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/assets/generated/ao-farms-logo.dim_320x160.png" alt="AO Farms" className="h-8 object-contain brightness-0 invert" />
            <div className="hidden sm:block">
              <span className="font-bold text-lg">Admin Panel</span>
              <span className="text-white/60 text-sm ml-2">Management System</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-white/10 rounded-full px-3 py-1">
              <ShieldCheck className="h-4 w-4 text-green-300" />
              <span className="text-sm text-white/90">Admin</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-white hover:bg-white/10 gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-admin-dark">Dashboard</h1>
          <p className="text-muted-foreground">Manage your cattle, customers, and orders from one place.</p>
        </div>

        <Tabs defaultValue="cattle" className="space-y-6">
          <TabsList className="bg-white border border-border shadow-sm h-12 p-1 gap-1">
            <TabsTrigger value="cattle" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Beef className="h-4 w-4" />
              <span className="hidden sm:inline">Cattle</span>
            </TabsTrigger>
            <TabsTrigger value="customers" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Customers</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Orders & Deliveries</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cattle">
            <div className="bg-white rounded-xl border border-border shadow-sm p-6">
              <AdminCattleManagement />
            </div>
          </TabsContent>

          <TabsContent value="customers">
            <div className="bg-white rounded-xl border border-border shadow-sm p-6">
              <AdminCustomerManagement />
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <div className="bg-white rounded-xl border border-border shadow-sm p-6">
              <AdminOrdersDeliveries />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} AO Farms. Built with ❤️ using{' '}
          <a href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">caffeine.ai</a>
        </p>
      </footer>
    </div>
  );
}

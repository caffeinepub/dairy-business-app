import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import ProfileSetupModal from '../components/ProfileSetupModal';
import ProductCatalog from '../components/ProductCatalog';
import CustomerDeliveryList from '../components/CustomerDeliveryList';
import { LogIn, LogOut, Package, Truck, User, ShoppingBag } from 'lucide-react';

export default function CustomerPortal() {
  const { login, clear, loginStatus, identity, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();

  const showProfileSetup =
    isAuthenticated && !profileLoading && profileFetched && userProfile === null;

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: unknown) {
      const err = error as Error;
      if (err?.message === 'User is already authenticated') {
        await clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  // Loading state while checking identity
  if (isInitializing) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Not authenticated — show login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 px-4">
        {/* Hero */}
        <div className="relative rounded-2xl overflow-hidden w-full max-w-2xl h-40">
          <img
            src="/assets/generated/farm-hero.dim_1200x300.png"
            alt="AO Farms"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center px-6">
            <div>
              <h1 className="text-2xl font-bold text-white font-display">Customer Portal</h1>
              <p className="text-white/80 text-sm mt-1">Track your deliveries & explore products</p>
            </div>
          </div>
        </div>

        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-primary/10">
                <ShoppingBag className="w-10 h-10 text-primary" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold font-display">Welcome to AO Farms Portal</h2>
              <p className="text-sm text-muted-foreground">
                Log in to view your delivery history, track orders, and browse our fresh dairy
                products.
              </p>
            </div>

            <div className="space-y-3 text-left bg-muted/50 rounded-lg p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                What you can do:
              </p>
              <div className="space-y-2">
                {[
                  { icon: Package, text: 'Browse our full product catalog' },
                  { icon: Truck, text: 'View your personal delivery history' },
                  { icon: User, text: 'Report delivery issues to our team' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-sm text-foreground">
                    <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full"
              size="lg"
            >
              {isLoggingIn ? (
                <>
                  <span className="animate-spin mr-2 inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                  Logging in…
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Login with Internet Identity
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground">
              Secure login using passkeys, Google, or Apple — no password needed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Authenticated — show portal content
  return (
    <>
      <ProfileSetupModal open={showProfileSetup} />

      <div className="space-y-6">
        {/* Portal Header */}
        <div className="relative rounded-2xl overflow-hidden h-36">
          <img
            src="/assets/generated/farm-hero.dim_1200x300.png"
            alt="AO Farms"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center justify-between px-6">
            <div>
              <h1 className="text-2xl font-bold text-white font-display">Customer Portal</h1>
              {userProfile && (
                <p className="text-white/80 text-sm mt-1">
                  Welcome back, <span className="font-semibold text-white">{userProfile.name}</span>!
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {userProfile && (
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  <User className="w-3 h-3 mr-1" />
                  {userProfile.name}
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="catalog">
          <TabsList className="grid w-full grid-cols-2 max-w-sm">
            <TabsTrigger value="catalog" className="flex items-center gap-1.5">
              <Package className="w-4 h-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="deliveries" className="flex items-center gap-1.5">
              <Truck className="w-4 h-4" />
              My Deliveries
            </TabsTrigger>
          </TabsList>

          <TabsContent value="catalog" className="mt-6">
            <ProductCatalog />
          </TabsContent>

          <TabsContent value="deliveries" className="mt-6">
            <CustomerDeliveryList />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

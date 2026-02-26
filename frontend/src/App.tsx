import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CattleManagement from './pages/CattleManagement';
import MilkProduction from './pages/MilkProduction';
import InventoryManagement from './pages/InventoryManagement';
import CustomerManagement from './pages/CustomerManagement';
import DeliveryReports from './pages/DeliveryReports';
import MonthlyReports from './pages/MonthlyReports';
import CustomerPortal from './pages/CustomerPortal';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Dashboard,
});

const cattleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cattle',
  component: CattleManagement,
});

const milkRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/milk',
  component: MilkProduction,
});

const inventoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/inventory',
  component: InventoryManagement,
});

const customersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/customers',
  component: CustomerManagement,
});

const deliveriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/deliveries',
  component: DeliveryReports,
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reports',
  component: MonthlyReports,
});

const customerPortalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/portal',
  component: CustomerPortal,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  cattleRoute,
  milkRoute,
  inventoryRoute,
  customersRoute,
  deliveriesRoute,
  reportsRoute,
  customerPortalRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}

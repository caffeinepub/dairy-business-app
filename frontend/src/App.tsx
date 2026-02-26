import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CattleManagement from './pages/CattleManagement';
import MilkProduction from './pages/MilkProduction';
import InventoryManagement from './pages/InventoryManagement';
import CustomerManagement from './pages/CustomerManagement';
import DeliveryReports from './pages/DeliveryReports';
import MonthlyReports from './pages/MonthlyReports';
import CustomerPortal from './pages/CustomerPortal';
import AdminPanel from './pages/AdminPanel';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'layout',
  component: Layout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/',
  component: Dashboard,
});

const cattleRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/cattle',
  component: CattleManagement,
});

const milkRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/milk',
  component: MilkProduction,
});

const inventoryRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/inventory',
  component: InventoryManagement,
});

const customersRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/customers',
  component: CustomerManagement,
});

const deliveriesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/deliveries',
  component: DeliveryReports,
});

const reportsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/reports',
  component: MonthlyReports,
});

const portalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/portal',
  component: CustomerPortal,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPanel,
});

const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    dashboardRoute,
    cattleRoute,
    milkRoute,
    inventoryRoute,
    customersRoute,
    deliveriesRoute,
    reportsRoute,
  ]),
  portalRoute,
  adminRoute,
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
      <CustomerAuthProvider>
        <RouterProvider router={router} />
        <Toaster richColors position="top-right" />
      </CustomerAuthProvider>
    </QueryClientProvider>
  );
}

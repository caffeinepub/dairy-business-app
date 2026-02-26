import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import Layout from './components/Layout';
import LoginSelection from './pages/LoginSelection';
import AdminLogin from './pages/AdminLogin';
import CustomerLogin from './pages/CustomerLogin';
import AdminPanel from './pages/AdminPanel';
import CustomerPortal from './pages/CustomerPortal';
import Dashboard from './pages/Dashboard';
import CattleManagement from './pages/CattleManagement';
import CustomerManagement from './pages/CustomerManagement';
import DeliveryReports from './pages/DeliveryReports';
import MonthlyReports from './pages/MonthlyReports';
import MilkProduction from './pages/MilkProduction';
import InventoryManagement from './pages/InventoryManagement';
import { CustomerAuthProvider } from './context/CustomerAuthContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
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

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LoginSelection,
});

const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin-login',
  component: AdminLogin,
});

const customerLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/customer-login',
  component: CustomerLogin,
});

const adminPanelRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/admin',
  component: AdminPanel,
});

const customerPortalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/portal',
  component: CustomerPortal,
});

const dashboardRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/dashboard',
  component: Dashboard,
});

const cattleManagementRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/cattle',
  component: CattleManagement,
});

const milkProductionRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/milk',
  component: MilkProduction,
});

const inventoryManagementRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/inventory',
  component: InventoryManagement,
});

const customerManagementRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/customers',
  component: CustomerManagement,
});

const deliveryReportsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/deliveries',
  component: DeliveryReports,
});

const monthlyReportsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/reports',
  component: MonthlyReports,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  adminLoginRoute,
  customerLoginRoute,
  customerPortalRoute,
  layoutRoute.addChildren([
    adminPanelRoute,
    dashboardRoute,
    cattleManagementRoute,
    milkProductionRoute,
    inventoryManagementRoute,
    customerManagementRoute,
    deliveryReportsRoute,
    monthlyReportsRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        <CustomerAuthProvider>
          <RouterProvider router={router} />
          <Toaster richColors position="top-right" />
        </CustomerAuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

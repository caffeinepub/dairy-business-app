import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CattleManagement from './pages/CattleManagement';
import MilkProduction from './pages/MilkProduction';
import InventoryManagement from './pages/InventoryManagement';
import CustomerManagement from './pages/CustomerManagement';
import DeliveryReports from './pages/DeliveryReports';
import MonthlyReports from './pages/MonthlyReports';

// Root route with Layout wrapper
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

const routeTree = rootRoute.addChildren([
    indexRoute,
    cattleRoute,
    milkRoute,
    inventoryRoute,
    customersRoute,
    deliveriesRoute,
    reportsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

export default function App() {
    return <RouterProvider router={router} />;
}

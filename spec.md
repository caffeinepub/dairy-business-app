# Specification

## Summary
**Goal:** Build a full Cattle & Customer Management System with separate Admin Panel and Customer Portal, backed by a Motoko canister handling cattle records, customer accounts, authentication, and orders.

**Planned changes:**
- Add backend Motoko actor with CRUD for Cattle records (tagNumber, breed, dateOfPurchase, milkingCapacity, purchasePrice, availability, healthStatus), admin-only mutations
- Add backend CRUD for Customer accounts (name, phone, address, username, passwordHash, isActive), admin-only
- Add backend `customerLogin(username, password)` function returning a session token; rejects inactive or unknown accounts
- Add backend Order management (placeOrder for customers, updateOrderStatus/getAllOrders for admin, getMyOrders for customers)
- Build Admin Panel frontend at `/admin` with protected login and three sections: Cattle Management table, Customer Management table, and Orders & Deliveries table with status update controls
- Build Customer Portal frontend at `/portal` with username/password login, Place Order tab (available cattle by tag/breed), and My Deliveries tab (own orders with status badges)
- Block inactive or non-existent customers from portal access with a clear "Access denied" message
- Apply consistent green-and-white professional theme with earthy accents across both portals; admin panel is data-dense, customer portal is simple and friendly

**User-visible outcome:** Admins can log in to manage cattle inventory, customer accounts, and track/update orders. Customers can log in (with admin-created credentials) to place orders and view their delivery statuses.

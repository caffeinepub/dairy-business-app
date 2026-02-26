# Specification

## Summary
**Goal:** Split the single login page into a selection screen with separate Admin and Customer login entry points, and update routing to protect each portal accordingly.

**Planned changes:**
- Add a new login selection landing page at `/` with two clearly labeled buttons: "Admin Login" and "Customer Login"
- Create a dedicated Admin Login page using Internet Identity authentication, with backend `isAdmin` role verification and redirect to the admin dashboard on success; show an error for non-admin principals
- Create a dedicated Customer Login page with username and password fields, authenticating via the backend `loginCustomer` call and redirecting to the customer portal on success
- Update app routing so `/` renders the login selection page, admin routes redirect unauthenticated/non-admin users to the admin login page, and customer portal routes redirect unauthenticated customers to the customer login page

**User-visible outcome:** Users visiting the app first see a selection screen to choose Admin or Customer login. Each portal has its own login flow with proper authentication and route protection, preventing unauthorized access to either dashboard.

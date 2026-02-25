# Specification

## Summary
**Goal:** Add a Monthly Reports page to the AO Farms app that aggregates delivery and milk production data for a selected month and year, with a print-friendly view.

**Planned changes:**
- Add `getDeliveryRecordsByMonth(month, year)` and `getMilkRecordsByMonth(month, year)` backend methods to the Motoko actor
- Add React Query hooks for both new backend methods
- Create a new `/reports` route and Monthly Reports page using the existing farm-themed layout
- Add a month/year selector (defaulting to the current month/year) that refreshes all report data on change
- Display a Monthly Delivery Report section with: summary totals card (total deliveries, missed, liters), per-customer breakdown table, and per-delivery-boy performance table
- Display a Monthly Milk Production Report section with: summary card (total liters produced) and per-cattle breakdown table
- Add a "Print Report" button that triggers `window.print()` with print CSS hiding the nav bar, selector, and action buttons
- Add a "Reports" navigation link to the Layout component's desktop and mobile nav menus pointing to `/reports`

**User-visible outcome:** Users can navigate to a Reports page, select any month and year, and view aggregated delivery and milk production summaries with detailed breakdowns. They can also print the report cleanly from the browser.

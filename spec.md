# Specification

## Summary
**Goal:** Add a CSV export/download button to the Milk Production page so users can export the currently displayed (filtered) records.

**Planned changes:**
- Add a "Download CSV" button to the Milk Production page, near the records table or filter controls
- Clicking the button triggers a browser download of a `.csv` file named with the pattern `milk-production-YYYY-MM-DD.csv`
- The exported CSV includes a header row and columns for Date, Cattle ID/Name, and Milk Quantity (Liters), matching any other relevant fields shown in the table
- Only the currently filtered records are exported (respects active date range, cattle, or other filters)
- The button is disabled or shows a message when there are no records to export
- Reuse the existing CSV export utility pattern (`csvExport.ts`) for consistency

**User-visible outcome:** Users can click "Download CSV" on the Milk Production page to download the currently visible records as a CSV file for offline use or reporting.

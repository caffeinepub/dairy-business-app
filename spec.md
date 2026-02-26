# Specification

## Summary
**Goal:** Add a customer-facing portal with Internet Identity login, product catalog, personal delivery history, and a feedback system, along with admin tools to view and resolve flagged customer feedback.

**Planned changes:**
- Extend backend delivery records with a `customerId` field (linked to Internet Identity principal) and add a query function returning only the calling customer's deliveries
- Add a customer feedback system to the backend: `submitFeedback(deliveryId, message)` callable by authenticated customers, storing feedback with `flagged=true` and a timestamp
- Add `getFlaggedFeedback()` accessible only by the admin principal
- Add `resolveFeedback(feedbackId, newDeliveryStatus)` callable only by admin, which updates the delivery status and marks feedback as resolved
- Create a `/customer` route in the React app requiring Internet Identity login, showing a product catalog, personal delivery history with status labels, and a "Report Issue" feedback form on delivered items
- Add a "Flagged Feedback" section to the existing admin panel displaying all flagged feedback with delivery details, customer message, timestamp, and a resolve action

**User-visible outcome:** Customers can log in via Internet Identity, browse the product catalog, view their own delivery history, and report issues on delivered items. Admins can view all flagged feedback and resolve it by updating the corresponding delivery status.

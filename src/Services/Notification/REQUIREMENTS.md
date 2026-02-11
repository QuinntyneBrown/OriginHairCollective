# Notification Service — Requirements

## Overview
The Notification Service handles all outbound communications for Origin Hair Collective. It consumes events from Order, Payment, and Inquiry services to send email notifications for order confirmations, payment receipts, shipping updates, refund confirmations, inquiry acknowledgments, and wholesale follow-ups.

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/notifications` | List all notification logs |
| GET | `/notifications/recipient/{email}` | Get notifications for a recipient |

## Domain Entities

### NotificationLog
- Id, Recipient, Subject, Type (enum), Channel (enum)
- ReferenceId?, IsSent, ErrorMessage?, CreatedAt, SentAt?

## Enums
- **NotificationType**: OrderConfirmation, PaymentReceipt, PaymentFailed, ShippingUpdate, RefundConfirmation, InquiryAcknowledgment, WholesaleFollowUp
- **NotificationChannel**: Email

## Business Rules
1. Each consumed event produces exactly one notification log entry
2. Shipping notifications only fire for "Shipped" status transitions
3. Wholesale inquiries get a dedicated follow-up template
4. Failed sends are logged with error details for retry

## Event Contracts

### Consumes
- `OrderCreatedEvent` — sends order confirmation email
- `PaymentCompletedEvent` — sends payment receipt email
- `OrderStatusChangedEvent` — sends shipping update (when status = Shipped)
- `RefundIssuedEvent` — sends refund confirmation email
- `InquiryReceivedEvent` — sends inquiry acknowledgment or wholesale follow-up

### Publishes
- None

## Dependencies
- **Order Service** — consumes order events
- **Payment Service** — consumes payment events
- **Inquiry Service** — consumes inquiry events
- **SMTP Provider** — future: SendGrid/Mailgun integration

## Database
- SQLite: `notification.db`
- Tables: NotificationLogs

## Implementation Roadmap

### Phase 1 — Foundation (current)
- [x] Core entities, enums, interfaces
- [x] Infrastructure: DbContext, repository
- [x] Application: DTOs, mapping, services, consumers
- [x] API: Controllers, Program.cs
- [x] Event consumers for all notification types

### Phase 2 — Email Delivery
- [ ] SMTP / SendGrid integration
- [ ] HTML email templates (Razor)
- [ ] Send failure retry with exponential backoff

### Phase 3 — Advanced Features
- [ ] Notification preferences per user
- [ ] SMS channel support
- [ ] Digest/batch email for multiple events
- [ ] Unsubscribe management

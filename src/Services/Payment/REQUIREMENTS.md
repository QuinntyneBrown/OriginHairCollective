# Payment Service — Requirements

## Overview
The Payment Service handles payment processing for Origin Hair Collective. It manages payment intent creation, confirmation, and refunds. In production it will wrap the Stripe SDK; currently it operates with a mock payment flow suitable for development and testing.

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/payments` | Create a new payment |
| POST | `/payments/{id}/confirm` | Confirm payment with external transaction ID |
| GET | `/payments/{id}` | Get payment by ID |
| GET | `/payments/order/{orderId}` | Get payment for an order |
| POST | `/payments/refunds` | Issue a refund |

## Domain Entities

### PaymentRecord
- Id, OrderId, CustomerEmail, Amount, Method (enum), Status (enum)
- ExternalTransactionId?, FailureReason?, CreatedAt, CompletedAt?

### RefundRecord
- Id, PaymentId, OrderId, CustomerEmail, Amount, Reason, CreatedAt

## Enums
- **PaymentStatus**: Pending, Processing, Completed, Failed, Refunded
- **PaymentMethod**: CreditCard, DebitCard, BankTransfer

## Business Rules
1. Payment amount must be positive
2. Only processing payments can be confirmed
3. Only completed payments can be refunded
4. Refund amount must not exceed payment amount

## Event Contracts

### Publishes
- `PaymentCompletedEvent` — after payment is confirmed
- `PaymentFailedEvent` — when payment processing fails
- `RefundIssuedEvent` — when a refund is processed

### Consumes
- `OrderCreatedEvent` — logs new orders for payment readiness

## Dependencies
- **Order Service** — receives order events
- **Notification Service** — consumes payment events for emails
- **Stripe SDK** — future: real payment processing

## Database
- SQLite: `payment.db`
- Tables: Payments, Refunds

## Implementation Roadmap

### Phase 1 — Foundation (current)
- [x] Core entities, enums, interfaces
- [x] Infrastructure: DbContext, repositories
- [x] Application: DTOs, mapping, services
- [x] API: Controllers, Program.cs

### Phase 2 — Stripe Integration
- [ ] Stripe SDK wrapper service
- [ ] Webhook endpoint for async payment confirmation
- [ ] Payment failure handling with retry

### Phase 3 — Advanced Features
- [ ] Partial refunds
- [ ] Payment method storage (tokenized)
- [ ] Transaction audit log

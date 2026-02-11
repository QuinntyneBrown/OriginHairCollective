# Order Service — Requirements

## Overview
The Order Service manages shopping cart operations and the full order lifecycle for Origin Hair Collective. It handles cart management (add/remove/clear items), checkout (converting cart to order), and order status tracking through the fulfillment pipeline.

## API Endpoints

### Cart
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/cart/{sessionId}` | Get cart items for a session |
| POST | `/cart/{sessionId}` | Add item to cart |
| DELETE | `/cart/items/{itemId}` | Remove item from cart |
| DELETE | `/cart/{sessionId}` | Clear entire cart |

### Orders
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/orders/{sessionId}` | Create order from cart |
| GET | `/orders/{id}` | Get order by ID |
| GET | `/orders/user/{userId}` | Get orders for a user |
| PATCH | `/orders/{id}/status` | Update order status |

## Domain Entities

### CustomerOrder
- Id, UserId?, CustomerEmail, CustomerName, ShippingAddress
- TrackingNumber?, Status (enum), TotalAmount
- CreatedAt, UpdatedAt?, Items[]

### OrderItem
- Id, OrderId, ProductId, ProductName, Quantity, UnitPrice

### CartItem
- Id, SessionId, UserId?, ProductId, ProductName, UnitPrice, Quantity, AddedAt

## Enums
- **OrderStatus**: Pending, PaymentProcessing, Confirmed, Shipped, Delivered, Cancelled, Refunded

## Business Rules
1. Cart must have at least one item to create an order
2. Cart is cleared after successful order creation
3. Order total is computed from line item totals
4. Status transitions are validated on update

## Event Contracts

### Publishes
- `OrderCreatedEvent` — when a new order is placed
- `OrderStatusChangedEvent` — when order status changes

### Consumes
- `PaymentCompletedEvent` — confirms the order after payment succeeds

## Dependencies
- **Catalog Service** — product data (future: validate prices via HTTP)
- **Payment Service** — receives payment confirmation events
- **Notification Service** — consumes order events for emails

## Database
- SQLite: `order.db`
- Tables: CustomerOrders, OrderItems, CartItems

## Implementation Roadmap

### Phase 1 — Foundation (current)
- [x] Core entities, enums, interfaces
- [x] Infrastructure: DbContext, repositories
- [x] Application: DTOs, mapping, services
- [x] API: Controllers, Program.cs

### Phase 2 — Validation & Error Handling
- [ ] FluentValidation for DTOs
- [ ] Price verification via Catalog HTTP call
- [ ] Idempotency keys for order creation

### Phase 3 — Advanced Features
- [ ] Order cancellation with refund trigger
- [ ] Shipping rate calculation
- [ ] Order history pagination
- [ ] Cart item quantity limits

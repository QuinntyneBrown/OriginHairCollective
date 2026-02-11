# Chat Feature - Technical Design

## 1. Overview

This document describes the technical design for adding real-time chat to the Origin Hair Collective application. The chat feature enables customers to communicate directly with support staff (admins) for product inquiries, order questions, and general assistance. It also provides an admin-facing interface for managing and responding to conversations.

### 1.1 Goals

- Allow authenticated customers to initiate chat conversations from the customer-facing site
- Allow admins to view, respond to, and manage chat conversations from the admin dashboard
- Deliver messages in real time using WebSocket connections (SignalR)
- Persist all messages for history, audit, and analytics
- Integrate with the existing event-driven architecture to trigger notifications for new conversations
- Follow the established microservice patterns (clean architecture, database-per-service, MassTransit events)

### 1.2 Non-Goals

- AI-powered chatbot / automated responses (future phase)
- File/image attachments in chat (future phase)
- Group conversations or multi-party chat
- Video or voice calls

---

## 2. Architecture

### 2.1 New Microservice: Chat Service

A new `Chat` microservice will be added following the same layered structure as existing services:

```
src/Services/Chat/
  OriginHairCollective.Chat.Core/
    Entities/
      Conversation.cs
      ChatMessage.cs
    Enums/
      ConversationStatus.cs
      MessageSender.cs
    Interfaces/
      IConversationRepository.cs
      IChatMessageRepository.cs
  OriginHairCollective.Chat.Infrastructure/
    Data/
      ChatDbContext.cs
    Repositories/
      ConversationRepository.cs
      ChatMessageRepository.cs
  OriginHairCollective.Chat.Application/
    Dtos/
      ConversationDto.cs
      ChatMessageDto.cs
      CreateConversationDto.cs
      SendMessageDto.cs
      ConversationSummaryDto.cs
    Mapping/
      ChatMappingExtensions.cs
    Services/
      IChatService.cs
      ChatService.cs
    Consumers/
      OrderCreatedChatConsumer.cs
  OriginHairCollective.Chat.Api/
    Controllers/
      ConversationsController.cs
    Hubs/
      ChatHub.cs
    Program.cs
```

### 2.2 System Context

```
                   +-----------------+
                   |  Angular SPA    |
                   |  (Customer)     |
                   +--------+--------+
                            |
                   HTTP + WebSocket (SignalR)
                            |
                   +--------v--------+
                   |  API Gateway    |
                   |  (YARP)         |
                   +--------+--------+
                            |
              +-------------+-------------+
              |                           |
     HTTP REST (YARP)          WebSocket passthrough
              |                           |
     +--------v--------+     +-----------v-----------+
     |  Chat Service   |     |  Chat Service         |
     |  REST API       |     |  SignalR Hub           |
     |  /conversations |     |  /hubs/chat            |
     +--------+--------+     +-----------+-----------+
              |                           |
              +-------------+-------------+
                            |
                   +--------v--------+
                   |  ChatDbContext   |
                   |  (SQLite)       |
                   |  chat.db        |
                   +--------+--------+
                            |
                   +--------v--------+
                   |  RabbitMQ       |
                   |  (MassTransit)  |
                   +-----------------+
```

### 2.3 Integration Points

| Component | Integration | Purpose |
|-----------|-------------|---------|
| API Gateway (YARP) | New route `/api/chat/{**catch-all}` + WebSocket route `/hubs/chat/{**catch-all}` | Route REST and WebSocket traffic to Chat Service |
| Aspire AppHost | New project reference `chat-api` | Service orchestration and discovery |
| Identity Service | JWT validation on Hub and REST endpoints | Authenticate users and extract userId/role |
| Notification Service | Consumes `ChatConversationStartedEvent` | Send email when a new conversation is created (for admin alerting) |
| Shared Contracts | New events: `ChatConversationStartedEvent`, `ChatMessageSentEvent` | Cross-service event communication |

---

## 3. Domain Model

### 3.1 Entities

#### Conversation

```csharp
public sealed class Conversation
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public Guid? AssignedAdminId { get; set; }
    public ConversationStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastMessageAt { get; set; }
    public DateTime? ClosedAt { get; set; }
    public ICollection<ChatMessage> Messages { get; set; } = [];
}
```

#### ChatMessage

```csharp
public sealed class ChatMessage
{
    public Guid Id { get; set; }
    public Guid ConversationId { get; set; }
    public Guid SenderId { get; set; }
    public MessageSender SenderType { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime SentAt { get; set; }
    public bool IsRead { get; set; }
    public Conversation Conversation { get; set; } = null!;
}
```

### 3.2 Enums

```csharp
public enum ConversationStatus
{
    Open,
    AwaitingCustomer,
    AwaitingAdmin,
    Closed
}

public enum MessageSender
{
    Customer,
    Admin
}
```

### 3.3 Database Schema (SQLite - chat.db)

```sql
CREATE TABLE Conversations (
    Id              TEXT PRIMARY KEY,
    CustomerId      TEXT NOT NULL,
    CustomerName    TEXT NOT NULL,
    CustomerEmail   TEXT NOT NULL,
    Subject         TEXT NOT NULL,
    AssignedAdminId TEXT NULL,
    Status          INTEGER NOT NULL DEFAULT 0,
    CreatedAt       TEXT NOT NULL,
    LastMessageAt   TEXT NULL,
    ClosedAt        TEXT NULL
);

CREATE INDEX IX_Conversations_CustomerId ON Conversations(CustomerId);
CREATE INDEX IX_Conversations_Status ON Conversations(Status);
CREATE INDEX IX_Conversations_AssignedAdminId ON Conversations(AssignedAdminId);

CREATE TABLE ChatMessages (
    Id              TEXT PRIMARY KEY,
    ConversationId  TEXT NOT NULL,
    SenderId        TEXT NOT NULL,
    SenderType      INTEGER NOT NULL,
    Content         TEXT NOT NULL,
    SentAt          TEXT NOT NULL,
    IsRead          INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (ConversationId) REFERENCES Conversations(Id)
);

CREATE INDEX IX_ChatMessages_ConversationId ON ChatMessages(ConversationId);
```

---

## 4. API Design

### 4.1 REST Endpoints

All endpoints require JWT authentication. Admin-only endpoints are noted.

#### Conversations

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/conversations` | Customer | Create a new conversation |
| `GET` | `/conversations` | Admin | List all conversations (filterable by status) |
| `GET` | `/conversations/my` | Customer | List authenticated customer's conversations |
| `GET` | `/conversations/{id}` | Customer/Admin | Get conversation with messages |
| `PATCH` | `/conversations/{id}/status` | Admin | Update conversation status (assign, close) |
| `PATCH` | `/conversations/{id}/assign` | Admin | Assign conversation to an admin |

#### Messages

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/conversations/{id}/messages` | Customer/Admin | Send a message (fallback if WebSocket unavailable) |
| `GET` | `/conversations/{id}/messages` | Customer/Admin | Get paginated message history |
| `PATCH` | `/conversations/{id}/messages/read` | Customer/Admin | Mark messages as read |

### 4.2 DTOs

```csharp
// Request DTOs
public sealed record CreateConversationDto(string Subject, string InitialMessage);
public sealed record SendMessageDto(string Content);
public sealed record UpdateConversationStatusDto(ConversationStatus Status);
public sealed record AssignConversationDto(Guid AdminId);

// Response DTOs
public sealed record ConversationDto(
    Guid Id,
    Guid CustomerId,
    string CustomerName,
    string Subject,
    ConversationStatus Status,
    Guid? AssignedAdminId,
    DateTime CreatedAt,
    DateTime? LastMessageAt,
    int UnreadCount,
    ChatMessageDto? LastMessage);

public sealed record ConversationSummaryDto(
    Guid Id,
    string CustomerName,
    string Subject,
    ConversationStatus Status,
    DateTime? LastMessageAt,
    int UnreadCount);

public sealed record ChatMessageDto(
    Guid Id,
    Guid SenderId,
    MessageSender SenderType,
    string Content,
    DateTime SentAt,
    bool IsRead);
```

### 4.3 Gateway Configuration

Add to `src/Gateway/OriginHairCollective.ApiGateway/appsettings.json`:

```json
{
  "ReverseProxy": {
    "Routes": {
      "chat-route": {
        "ClusterId": "chat-cluster",
        "Match": {
          "Path": "/api/chat/{**catch-all}"
        },
        "Transforms": [
          { "PathRemovePrefix": "/api/chat" }
        ]
      },
      "chat-hub-route": {
        "ClusterId": "chat-cluster",
        "Match": {
          "Path": "/hubs/chat/{**catch-all}"
        }
      }
    },
    "Clusters": {
      "chat-cluster": {
        "Destinations": {
          "chat-api": {
            "Address": "http://chat-api"
          }
        }
      }
    }
  }
}
```

The WebSocket route (`/hubs/chat`) does not strip a prefix because SignalR negotiation requires the full path. YARP supports WebSocket proxying natively.

---

## 5. Real-Time Communication (SignalR)

### 5.1 Hub Design

```csharp
[Authorize]
public sealed class ChatHub : Hub
{
    // Client joins a conversation room
    public async Task JoinConversation(Guid conversationId);

    // Client leaves a conversation room
    public async Task LeaveConversation(Guid conversationId);

    // Client sends a message
    public async Task SendMessage(Guid conversationId, string content);

    // Client marks messages as read
    public async Task MarkAsRead(Guid conversationId);
}
```

### 5.2 Server-to-Client Events

| Event | Payload | Recipients | Trigger |
|-------|---------|------------|---------|
| `ReceiveMessage` | `ChatMessageDto` | All users in the conversation group | A message is sent |
| `MessagesRead` | `{ conversationId, readByUserId }` | All users in the conversation group | Messages are marked read |
| `ConversationStatusChanged` | `{ conversationId, newStatus }` | All users in the conversation group | Status is updated |
| `NewConversation` | `ConversationSummaryDto` | Admin group | A customer starts a new conversation |
| `ConversationAssigned` | `{ conversationId, adminId }` | Admin group | An admin is assigned |

### 5.3 SignalR Groups

- **Conversation group** (`conversation-{id}`): Both the customer and the assigned admin(s) join this group when viewing a conversation.
- **Admin group** (`admins`): All connected admins join this group on connect. Used for broadcasting new conversation alerts and assignment updates.

### 5.4 Connection Lifecycle

```
Customer connects to /hubs/chat
  -> JWT validated via query string token (SignalR standard pattern)
  -> User added to connection mapping
  -> If user has open conversations, no auto-join (lazy join on navigation)

Admin connects to /hubs/chat
  -> JWT validated
  -> Auto-join "admins" group
  -> Receive new conversation notifications

Either party navigates to a conversation
  -> Client calls JoinConversation(conversationId)
  -> Server validates access (customer owns it, or user is admin)
  -> User added to conversation-{id} group

User navigates away
  -> Client calls LeaveConversation(conversationId)
  -> User removed from group

Disconnect
  -> Automatic group cleanup by SignalR
```

### 5.5 Authentication for WebSocket

SignalR over WebSocket cannot pass JWT in HTTP headers after the initial handshake. The standard pattern is used:

```csharp
// Program.cs - JWT configuration
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // ... standard JWT config ...
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs/chat"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });
```

---

## 6. Event Integration

### 6.1 New Shared Contract Events

Add to `src/Shared/OriginHairCollective.Shared.Contracts/`:

```csharp
public sealed record ChatConversationStartedEvent(
    Guid ConversationId,
    Guid CustomerId,
    string CustomerName,
    string CustomerEmail,
    string Subject,
    DateTime OccurredAt);

public sealed record ChatMessageSentEvent(
    Guid MessageId,
    Guid ConversationId,
    Guid SenderId,
    MessageSender SenderType,
    DateTime OccurredAt);
```

### 6.2 Events Published by Chat Service

| Event | Trigger | Consumers |
|-------|---------|-----------|
| `ChatConversationStartedEvent` | Customer creates a new conversation | Notification Service (sends admin alert email) |
| `ChatMessageSentEvent` | A message is sent in a conversation | Notification Service (optional: email if recipient is offline) |

### 6.3 Events Consumed by Chat Service

| Event | Publisher | Action |
|-------|-----------|--------|
| `OrderCreatedEvent` | Order Service | Auto-create a system message in conversations linked to that customer (optional enhancement for proactive support) |

### 6.4 Notification Service Consumer

A new consumer in the Notification Service handles chat events:

```csharp
public sealed class ChatConversationStartedNotificationConsumer
    : IConsumer<ChatConversationStartedEvent>
{
    public async Task Consume(ConsumeContext<ChatConversationStartedEvent> context)
    {
        // Log notification for admin alerting
        // Future: Send email to admin team
    }
}
```

---

## 7. Frontend Design

### 7.1 Customer-Facing App (`origin-hair-collective`)

#### Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `ChatWidgetComponent` | Floating widget (global) | Persistent chat launcher button on all pages |
| `ChatWindowComponent` | Overlay / slide-in panel | Full chat window with conversation list and message thread |
| `ConversationListComponent` | Inside ChatWindow | Shows customer's active conversations |
| `MessageThreadComponent` | Inside ChatWindow | Displays messages and input for a single conversation |
| `NewConversationComponent` | Inside ChatWindow | Form to start a new conversation (subject + first message) |

#### UX Flow

1. Authenticated customer clicks the floating chat icon (bottom-right corner)
2. Chat window slides in showing their conversation list (or empty state)
3. Customer can start a new conversation (enters subject + initial message)
4. Messages appear in real time via SignalR
5. Chat window can be minimized back to the floating icon
6. Unread message badge appears on the chat icon

#### Angular Service

```typescript
@Injectable({ providedIn: 'root' })
export class ChatService {
  private hubConnection: signalR.HubConnection;

  // Observable streams for components
  readonly messages$ = new Subject<ChatMessage>();
  readonly newConversation$ = new Subject<ConversationSummary>();
  readonly conversationStatusChanged$ = new Subject<{ id: string; status: string }>();

  connect(token: string): void { /* establish SignalR connection */ }
  disconnect(): void { /* close connection */ }
  joinConversation(id: string): void { /* invoke hub method */ }
  leaveConversation(id: string): void { /* invoke hub method */ }
  sendMessage(conversationId: string, content: string): void { /* invoke hub method */ }
  markAsRead(conversationId: string): void { /* invoke hub method */ }

  // REST fallbacks
  getMyConversations(): Observable<ConversationSummary[]> { /* GET /api/chat/conversations/my */ }
  getConversation(id: string): Observable<Conversation> { /* GET /api/chat/conversations/{id} */ }
  createConversation(subject: string, message: string): Observable<Conversation> { /* POST */ }
}
```

### 7.2 Admin Dashboard (`origin-hair-collective-admin`)

#### Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `ChatDashboardPage` | New route `/chat` | Full-page chat management view |
| `ConversationListPanel` | Left panel | Filterable list of all conversations |
| `ConversationDetailPanel` | Right panel | Selected conversation messages + reply input |
| `ConversationFilters` | Above list | Filter by status, search by customer name |
| `AssignAdminDialog` | Modal | Assign a conversation to a specific admin |

#### UX Flow

1. Admin navigates to Chat section in the dashboard sidebar
2. Left panel shows all open conversations sorted by most recent activity
3. Admin clicks a conversation to view the message thread
4. Admin types and sends responses in real time
5. Admin can change status (close, mark as awaiting customer) or assign to another admin
6. New conversation notifications appear with visual indicator (badge on sidebar nav)

### 7.3 Shared Component Library (`components`)

New reusable components for the shared library:

| Component | Purpose |
|-----------|---------|
| `MessageBubbleComponent` | Renders a single chat message (left/right alignment by sender) |
| `ChatInputComponent` | Text input with send button (supports Enter to send) |
| `TypingIndicatorComponent` | Animated dots shown when the other party is typing |
| `UnreadBadgeComponent` | Numeric badge for unread count |

---

## 8. Aspire Orchestration

### 8.1 AppHost Registration

Add to `src/Aspire/OriginHairCollective.AppHost/Program.cs`:

```csharp
var chatApi = builder.AddProject<Projects.OriginHairCollective_Chat_Api>("chat-api")
    .WithReference(messaging);

var apiGateway = builder.AddProject<Projects.OriginHairCollective_ApiGateway>("api-gateway")
    .WithReference(catalogApi)
    .WithReference(inquiryApi)
    .WithReference(orderApi)
    .WithReference(paymentApi)
    .WithReference(contentApi)
    .WithReference(notificationApi)
    .WithReference(identityApi)
    .WithReference(chatApi);  // Add chat-api reference
```

### 8.2 Service Configuration (Program.cs)

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

// Database
builder.Services.AddDbContext<ChatDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("ChatDb")));

// Repositories
builder.Services.AddScoped<IConversationRepository, ConversationRepository>();
builder.Services.AddScoped<IChatMessageRepository, ChatMessageRepository>();

// Services
builder.Services.AddScoped<IChatService, ChatService>();

// MassTransit
builder.Services.AddMassTransit(x =>
{
    x.AddConsumer<OrderCreatedChatConsumer>();
    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host(builder.Configuration.GetConnectionString("messaging"));
        cfg.ConfigureEndpoints(context);
    });
});

// SignalR
builder.Services.AddSignalR();

// Auth
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = "OriginHairCollective.Identity",
            ValidateAudience = true,
            ValidAudience = "OriginHairCollective",
            ValidateLifetime = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken)
                    && path.StartsWithSegments("/hubs/chat"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();
app.MapDefaultEndpoints();
app.MapControllers();
app.MapHub<ChatHub>("/hubs/chat");

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ChatDbContext>();
    db.Database.EnsureCreated();
}

app.Run();
```

---

## 9. Data Access Patterns

### 9.1 Repository Interfaces

```csharp
public interface IConversationRepository
{
    Task<Conversation?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Conversation?> GetByIdWithMessagesAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<Conversation>> GetByCustomerIdAsync(Guid customerId, CancellationToken ct = default);
    Task<IReadOnlyList<Conversation>> GetByStatusAsync(ConversationStatus status, CancellationToken ct = default);
    Task<IReadOnlyList<Conversation>> GetAllAsync(CancellationToken ct = default);
    Task AddAsync(Conversation conversation, CancellationToken ct = default);
    Task UpdateAsync(Conversation conversation, CancellationToken ct = default);
}

public interface IChatMessageRepository
{
    Task<IReadOnlyList<ChatMessage>> GetByConversationIdAsync(
        Guid conversationId, int skip = 0, int take = 50, CancellationToken ct = default);
    Task AddAsync(ChatMessage message, CancellationToken ct = default);
    Task MarkAsReadAsync(Guid conversationId, Guid readByUserId, CancellationToken ct = default);
    Task<int> GetUnreadCountAsync(Guid conversationId, Guid userId, CancellationToken ct = default);
}
```

### 9.2 Message Pagination

Messages are loaded in reverse chronological order with cursor-based pagination:

- Default page size: 50 messages
- Client requests older messages by passing a `skip` parameter
- Most recent messages load first (matching standard chat UX where newest messages are at the bottom)

---

## 10. Security Considerations

### 10.1 Authorization Rules

| Action | Customer | Admin |
|--------|----------|-------|
| Create conversation | Own conversations only | No (admins respond, not initiate) |
| View conversation | Own conversations only | All conversations |
| Send message | In own conversations only | In any conversation |
| Change status | Cannot | All conversations |
| Assign admin | Cannot | All conversations |
| Mark as read | In own conversations only | In any conversation |

### 10.2 SignalR Authorization

- Hub-level `[Authorize]` attribute ensures only authenticated users connect
- `JoinConversation` validates that the requesting user is either the conversation's customer or an admin before adding them to the group
- User identity is extracted from the JWT claims (no client-supplied userId)

### 10.3 Input Validation

- Message content: Required, max 2000 characters, trimmed, HTML-sanitized
- Subject: Required, max 200 characters
- Rate limiting: Max 30 messages per minute per user (prevents spam)

### 10.4 Data Privacy

- Messages are stored in the Chat Service database only
- No message content is included in MassTransit events (only metadata)
- Admin access to conversations should be logged for audit purposes

---

## 11. Scalability Considerations

### 11.1 Current Phase (SQLite + Single Instance)

For the initial implementation with SQLite:

- SignalR uses in-memory groups (single server instance)
- SQLite handles the expected volume (low concurrent chat sessions for a hair product business)
- This matches the approach of all other services in the system

### 11.2 Future Scaling Path

If the application needs to scale beyond a single instance:

- **Database**: Migrate from SQLite to PostgreSQL (same EF Core provider swap as other services)
- **SignalR Backplane**: Add Redis backplane for multi-instance SignalR (`AddStackExchangeRedis()`)
- **Message archival**: Move old closed conversations to cold storage after a configurable retention period

---

## 12. Implementation Phases

### Phase 1: Core Chat Service

- Create Chat microservice with clean architecture layers
- Implement domain entities, database context, repositories
- Build REST API endpoints for conversations and messages
- Register in Aspire AppHost and API Gateway
- Add shared contract events

### Phase 2: Real-Time Messaging

- Add SignalR hub with authentication
- Implement group management (conversation rooms, admin group)
- Wire up real-time message delivery and read receipts
- Configure YARP WebSocket proxying

### Phase 3: Customer Frontend

- Build `ChatService` (Angular service with SignalR client)
- Create floating chat widget component
- Implement chat window with conversation list and message thread
- Add new conversation form
- Add unread badge indicator

### Phase 4: Admin Frontend

- Build chat dashboard page with two-panel layout
- Implement conversation list with filtering
- Build conversation detail panel with reply functionality
- Add assign and status management controls
- Add sidebar notification badge for new conversations

### Phase 5: Event Integration and Notifications

- Publish `ChatConversationStartedEvent` and `ChatMessageSentEvent`
- Add consumer in Notification Service for admin alerts
- Optionally consume `OrderCreatedEvent` for proactive chat context

---

## 13. Dependencies

### Backend NuGet Packages

| Package | Purpose |
|---------|---------|
| `Microsoft.AspNetCore.SignalR` | Real-time WebSocket communication (included in ASP.NET Core) |
| `Microsoft.AspNetCore.Authentication.JwtBearer` | JWT auth for Hub and REST endpoints |
| `Microsoft.EntityFrameworkCore.Sqlite` | SQLite database provider |
| `MassTransit.RabbitMQ` | Event bus integration |
| `Aspire.Hosting.AppHost` | Service orchestration |

### Frontend npm Packages

| Package | Purpose |
|---------|---------|
| `@microsoft/signalr` | SignalR JavaScript client for Angular |

---

## 14. Testing Strategy

### Backend

- **Unit tests**: ChatService business logic (message validation, authorization checks, status transitions)
- **Integration tests**: Repository tests against in-memory SQLite, Hub integration tests with test server
- **Consumer tests**: Verify MassTransit consumers handle events correctly using the MassTransit test harness

### Frontend

- **Component tests** (Vitest): Chat widget rendering, message thread display, form validation
- **E2E tests** (Playwright): Full chat flow - open widget, create conversation, send messages, verify real-time delivery between two browser contexts (customer + admin)

---

## 15. Observability

The Chat Service inherits the standard observability stack from Aspire ServiceDefaults:

- **Distributed tracing**: OpenTelemetry traces for REST endpoints and SignalR hub method invocations
- **Metrics**: Connection count, messages sent per minute, average response latency
- **Health checks**: `/health` and `/alive` endpoints (standard pattern)
- **Logging**: Structured logging for connection events, message sends, and errors

Custom metrics to track:

| Metric | Type | Description |
|--------|------|-------------|
| `chat.connections.active` | Gauge | Number of active SignalR connections |
| `chat.messages.sent` | Counter | Total messages sent (tagged by sender type) |
| `chat.conversations.created` | Counter | New conversations created |
| `chat.conversations.avg_response_time` | Histogram | Time from customer message to first admin reply |

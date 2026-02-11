# Identity Service — Requirements

## Overview
The Identity Service manages user authentication and account management for Origin Hair Collective. It handles user registration, login with JWT token issuance, profile management, and provides user identity for the Order service to associate orders with accounts.

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/auth/register` | Register a new user account |
| POST | `/auth/login` | Login and receive JWT token |
| GET | `/auth/profile/{userId}` | Get user profile |
| PUT | `/auth/profile/{userId}` | Update user profile |

## Domain Entities

### AppUser
- Id, Email (unique), PasswordHash, FirstName, LastName
- Phone?, Role (enum), IsActive, CreatedAt, LastLoginAt?

## Enums
- **UserRole**: Customer, Admin

## Business Rules
1. Email addresses must be unique
2. Passwords are hashed with PBKDF2-SHA256 (100k iterations, 16-byte salt)
3. JWT tokens expire after 24 hours
4. Only active users can log in
5. Login updates LastLoginAt timestamp

## Event Contracts
- None currently (future: UserRegisteredEvent)

## Dependencies
- **Order Service** — uses UserId to associate orders with accounts
- No messaging dependency (REST-only service)

## Database
- SQLite: `identity.db`
- Tables: Users (unique index on Email)

## Security
- PBKDF2-SHA256 password hashing with random salt
- Constant-time password comparison (CryptographicOperations.FixedTimeEquals)
- JWT with HMAC-SHA256 signing
- Dev secret key in appsettings (must be replaced in production)

## Implementation Roadmap

### Phase 1 — Foundation (current)
- [x] Core entities, enums, interfaces
- [x] Infrastructure: DbContext, repository
- [x] Application: DTOs, mapping, services (auth + JWT)
- [x] API: Controllers, Program.cs

### Phase 2 — Security Hardening
- [ ] Password complexity validation
- [ ] Account lockout after failed attempts
- [ ] Refresh token support
- [ ] Email verification flow

### Phase 3 — Advanced Features
- [ ] OAuth2 social login (Google, Apple)
- [ ] Role-based authorization middleware
- [ ] Password reset via email
- [ ] Two-factor authentication

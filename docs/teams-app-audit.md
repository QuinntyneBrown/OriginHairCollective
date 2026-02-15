# Teams App - Feature Completeness Audit

**Date:** 2026-02-14
**Scope:** `src/CrownCommerce.Web/projects/teams` + supporting backend services
**Purpose:** Identify all partially complete features, mock data usage, authentication gaps, and seeding requirements prior to launch.

---

## Executive Summary

The Teams module has 4 pages with responsive layouts across desktop, tablet, and mobile breakpoints. Read-only data display is fully wired to the Scheduling backend API. However, **all write/action features are UI shells with no implementation**, authentication is absent, and the current user is hardcoded. Of 24 identifiable UI features, **12 are functional (50%)**.

---

## 1. Authentication & User Identity

### Current State: NOT IMPLEMENTED

| Item | Status | Detail |
|------|--------|--------|
| Login page | Missing | No login route or component exists |
| Auth guards | Missing | All routes accessible without authentication |
| JWT token handling | Unused | `AuthService` and `authInterceptor` exist in the shared `api` library but are not wired into the Teams app |
| Current user context | Hardcoded | Layout template hardcodes `"Quinn M."` / `"QM"` / `"Team Lead"` |
| Current employee ID | Assumed | Chat and Home pages call `getEmployees()` and use `employees[0]` as the current user |
| Logout | Missing | No logout button or flow |
| Session persistence | Missing | No token storage or session management in the Teams app |

### Backend Auth Status

- **Identity Service** exists at `/api/identity/auth/` with `login`, `register`, and `profile` endpoints
- **JWT token generation** is implemented in the Identity service
- **Scheduling API has zero authentication** - no `[Authorize]` attributes on any controller, no JWT middleware configured
- All Scheduling endpoints are fully public

### Required Before Launch

1. Add JWT authentication middleware to the Scheduling API (`Program.cs`)
2. Add `[Authorize]` attributes to all Scheduling controllers
3. Create a login page in the Teams app
4. Wire `AuthService` and `authInterceptor` into `app.config.ts`
5. Add auth guards to all routes
6. Replace hardcoded user in layout with data from `AuthService.user` signal
7. Replace `employees[0]` assumption with the authenticated user's employee record
8. Add a way to link Identity `userId` to Scheduling `employeeId` (lookup or claim)

---

## 2. Mock Data Inventory

**File:** `src/app/data/mock-data.ts`

| Export | Used By | Status | Action Required |
|--------|---------|--------|-----------------|
| `TEAM_MEMBERS[]` | Nothing | Dead code | Remove |
| `CHAT_CHANNELS[]` | Nothing | Dead code | Remove |
| `CHAT_MESSAGES[]` | Nothing | Dead code | Remove |
| `MEETINGS[]` | Nothing | Dead code | Remove |
| `ACTIVITY_ITEMS[]` | Nothing | Dead code | Remove |
| `TIME_ZONES[]` | `HomePage` | **Active - hardcoded** | Move to backend or keep as static config |

### Hardcoded Data in TypeScript

| File | Data | Action Required |
|------|------|-----------------|
| `home.ts` line 10 | `MEETING_COLORS` - 6 hex colors for meeting badges | Acceptable (presentation logic) |
| `home.ts` line 11 | `ACTIVITY_COLORS` - 4 hex colors keyed by activity type | Acceptable (presentation logic) |
| `teams-layout.ts` template | User name `"Quinn M."`, initials `"QM"`, role `"Team Lead"` | Replace with authenticated user data |
| `mock-data.ts` | Type interfaces (`Meeting`, `ChatChannel`, `ChatMessage`, etc.) | Keep (used by components as view models) |

### Recommendation

- Delete all unused mock data constants (`TEAM_MEMBERS`, `CHAT_CHANNELS`, `CHAT_MESSAGES`, `MEETINGS`, `ACTIVITY_ITEMS`)
- Keep type/interface definitions (they serve as view-model contracts)
- `TIME_ZONES` is acceptable as static config data (cities/offsets don't change) or can be moved to a separate config file
- Color palettes in `home.ts` are presentation-only and acceptable

---

## 3. Database Seeding Requirements

### Current Seed Data (SchedulingDbSeeder.cs)

| Entity | Count | Detail |
|--------|-------|--------|
| Employees | 5 | Quinn, Amara, Wanjiku, Sophia, James - with presence status |
| Meetings | 4 | Daily Standup, Design Review, Sprint Planning, 1:1 with Amara |
| Meeting Attendees | 9 | Distributed across the 4 meetings |
| Channels | 7 | 5 public (general, design, engineering, product, random) + 2 DMs |
| Channel Participants | 29 | All employees in public channels; specific pairs in DMs |
| Messages | 12 | Sample messages across all channels |

### Seeding Required Before Launch?

**Yes** - The seeder must run on first startup to populate the database. The app displays empty states without seed data but is not designed for an empty-database experience (no onboarding flow, no "create your first channel" prompts).

### Gaps in Seed Data

| Gap | Impact | Recommendation |
|-----|--------|----------------|
| No linked Identity users | Cannot authenticate seeded employees | Seed corresponding Identity users with matching `userId` GUIDs, or create an admin setup script |
| Only 5 employees | Thin for realistic testing | Adequate for MVP; expand for demo/staging environments |
| Meeting times are relative to `DateTime.UtcNow` | Meetings shift each restart | Acceptable for dev; production should have real scheduled data |
| No read receipts seeded | All channels show 0 unread on first load | Acceptable; unread counts populate naturally through usage |

---

## 4. Page-by-Page Feature Audit

### 4.1 Home Page (`/home`)

| Feature | Status | Data Source | Notes |
|---------|--------|-------------|-------|
| Greeting (Good morning/afternoon/evening) | Complete | Client-side | Time-based greeting |
| Date display | Complete | Client-side | Formatted current date |
| Time zone cards | Complete | `TIME_ZONES` (static) | 6 cities including Nairobi; live clock calculation |
| Upcoming meetings list | Complete | `GET /meetings/upcoming` | Shows next 3 meetings with participants |
| Activity feed | Complete | `GET /activity` | Shows 6 recent items via employee lookup |
| Notifications button | **Non-functional** | - | Button renders, no click handler |
| Search button | **Non-functional** | - | Button renders, no click handler |

### 4.2 Chat Page (`/chat`)

| Feature | Status | Data Source | Notes |
|---------|--------|-------------|-------|
| Channel list (public) | Complete | `GET /channels` | Displays with icons and unread badges |
| Channel list (DMs) | Complete | `GET /channels` | Filtered by `channelType === 'DirectMessage'` |
| Message display | Complete | `GET /channels/{id}/messages` | Sender name, initials, timestamps, own-message styling |
| Mark channel as read | Complete | `POST /channels/{id}/read` | Fires on channel select |
| Channel selection | Complete | Client-side | Updates messages; mobile toggles between list/detail |
| **Send message** | **Not implemented** | `sendChannelMessage()` exists in service | Input field and send button have no event bindings |
| **Attach file** | **Not implemented** | No backend support | Button renders, no handler |
| **Search conversations** | **Not implemented** | No backend support | Input field not bound to any logic |
| **Create new conversation** | **Not implemented** | `createChannel()` exists in service | Edit button renders, no handler |
| **Video call** | **Not implemented** | No backend support | Button renders, no handler |
| **Phone call** | **Not implemented** | No backend support | Button renders, no handler |
| **More options menu** | **Not implemented** | - | Button renders, no handler |

### 4.3 Meetings Page (`/meetings`)

| Feature | Status | Data Source | Notes |
|---------|--------|-------------|-------|
| Week calendar picker | Complete | Client-side | 7-day view, today indicator, date selection |
| Meeting list for selected date | Complete | `GET /meetings/calendar` | Filtered by date range; color-coded |
| Participant avatars | Complete | API response | Shows attendee initials |
| **Create new meeting** | **Not implemented** | `createMeeting()` exists in service | "New Meeting" button has no handler |
| **Join meeting** | **Not implemented** | No backend support | Videocam button on each meeting has no handler |
| **Edit/cancel meeting** | **Not implemented** | `updateMeeting()` / `cancelMeeting()` exist in service | No UI affordance |
| **RSVP to meeting** | **Not implemented** | `respondToMeeting()` exists in service | No UI affordance |
| **Export to iCal** | **Not implemented** | `exportMeetingToICal()` exists in service | No UI affordance |

### 4.4 Team Members Page (`/team`)

| Feature | Status | Data Source | Notes |
|---------|--------|-------------|-------|
| Member list with avatars | Complete | `GET /employees` | Name, role, department, presence |
| Search by name/role/department | Complete | Client-side | Real-time filtering |
| Status filter (All/Online/Away) | Complete | Client-side | Tab counts update dynamically |
| Presence indicators | Complete | API `presence` field | Online (green), Away (yellow), Offline (gray) |
| **Invite member** | **Not implemented** | No backend support | "Invite" button has no handler |
| **Chat with member** | **Not implemented** | Could use `createChannel()` | Chat icon button has no handler |
| **Video call member** | **Not implemented** | No backend support | Videocam button has no handler |

---

## 5. Backend API Gaps

Features the frontend needs but the backend does not yet support:

| Feature | Needed For | Current State | Effort |
|---------|-----------|---------------|--------|
| JWT auth on Scheduling API | All pages | No auth middleware configured | Medium |
| Real-time messaging (SignalR) | Chat | REST-only; no WebSocket hub | High |
| Employee search endpoint | Team Members search, Chat | Client-side filtering only; works for small datasets | Low |
| Message search | Chat search | No endpoint exists | Medium |
| File upload/attachments | Chat attachments | No endpoint or storage | High |
| Video/voice calling | Chat, Team Members | No infrastructure | Very High (external service) |
| Typing indicators | Chat | No SignalR support | Medium |
| Message editing/deletion | Chat | No PUT/DELETE on messages | Low |
| Thread replies | Chat | Flat message model only | Medium |
| @mention notifications | Chat | No mention parsing | Medium |
| Message reactions | Chat | No data model | Low |
| Pagination on list endpoints | All pages (at scale) | Most endpoints return all results | Low |
| User-to-employee mapping | Login flow | No link between Identity userId and Scheduling employeeId | Medium |

---

## 6. Shared API Library Status

**Location:** `projects/api/`

### Services with Methods Available but Unused by Teams

| Service Method | Available | Used by Teams |
|----------------|-----------|---------------|
| `SchedulingService.sendChannelMessage()` | Yes | **No** |
| `SchedulingService.createChannel()` | Yes | **No** |
| `SchedulingService.createMeeting()` | Yes | **No** |
| `SchedulingService.updateMeeting()` | Yes | **No** |
| `SchedulingService.cancelMeeting()` | Yes | **No** |
| `SchedulingService.respondToMeeting()` | Yes | **No** |
| `SchedulingService.exportMeetingToICal()` | Yes | **No** |
| `SchedulingService.updatePresence()` | Yes | **No** |
| `SchedulingService.createEmployee()` | Yes | **No** |
| `AuthService.login()` | Yes | **No** |
| `AuthService.register()` | Yes | **No** |
| `AuthService.logout()` | Yes | **No** |
| `AuthService.getProfile()` | Yes | **No** |

These service methods are implemented and exported but have no UI wiring in the Teams app.

---

## 7. Summary of Required Work Before Launch

### P0 - Blockers (Must Have)

1. **Authentication flow** - Login page, auth guards, JWT integration, user context
2. **Send chat messages** - Wire existing input/button to `sendChannelMessage()`
3. **Remove dead mock data** - Delete unused constants from `mock-data.ts`
4. **Database seeding** - Ensure seeder runs; seed matching Identity users for login

### P1 - Core Functionality

5. **Create new meeting** - Dialog/form wired to `createMeeting()`
6. **Create new conversation/DM** - Dialog wired to `createChannel()`
7. **Dynamic user in layout** - Replace hardcoded "Quinn M." with authenticated user
8. **Update presence** - Call `updatePresence()` on login/activity/idle detection
9. **RSVP to meetings** - Accept/decline UI wired to `respondToMeeting()`

### P2 - Enhanced Experience

10. **Real-time messaging** - Add SignalR hub to Scheduling API for live message delivery
11. **Chat with team member** - Wire team member chat button to create/navigate to DM
12. **Conversation search** - Add search endpoint; bind chat search input
13. **Meeting join link** - Define what "join" means (external URL, in-app, etc.)
14. **Pagination** - Add skip/take to list endpoints for scale

### P3 - Nice to Have

15. **File attachments** - Upload endpoint + storage + UI
16. **Message editing/deletion** - Backend endpoints + UI affordance
17. **Typing indicators** - SignalR events
18. **@mentions** - Parse, notify, highlight
19. **Message reactions** - Data model + UI
20. **Notifications** - Wire notification button on home page to real notification feed
21. **Video/voice calling** - Requires external service integration (e.g., Twilio, Daily)

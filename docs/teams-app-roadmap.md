# Teams App - Implementation Roadmap

**Date:** 2026-02-14
**Source:** [teams-app-audit.md](teams-app-audit.md)
**Structure:** Sequential phases with numbered work items. Each phase must be completed before the next begins. Items within a phase are ordered by dependency.

---

## Phase 1: Code Cleanup

Remove dead code and mock data remnants before building new features on top of them.

### 1.1 Delete unused mock data constants
- **File:** `projects/teams/src/app/data/mock-data.ts`
- Delete `TEAM_MEMBERS`, `CHAT_CHANNELS`, `CHAT_MESSAGES`, `MEETINGS`, `ACTIVITY_ITEMS` constants
- Keep all `interface` / `type` exports (used as view-model contracts by components)
- Keep `TIME_ZONES` (actively used by Home page)
- Verify no component imports reference the deleted constants

### 1.2 Remove stale mock data imports
- Audit each page component for leftover imports from `mock-data.ts`
- Remove any `import { TEAM_MEMBERS, ... }` statements that reference deleted constants
- Run `ng build teams` to confirm zero compilation errors

---

## Phase 2: Authentication & User Identity

All interactive features depend on knowing who the current user is. This phase establishes that foundation.

### 2.1 Add JWT authentication middleware to the Scheduling API
- **File:** `src/Services/Scheduling/CrownCommerce.Scheduling.Api/Program.cs`
- Add `builder.Services.AddAuthentication().AddJwtBearer()` configured with the same issuer/audience/key as the Identity service
- Add `app.UseAuthentication()` and `app.UseAuthorization()` to the pipeline
- Reference the Identity service's JWT settings (issuer: `CrownCommerce.Identity`, audience: `CrownCommerce`)

### 2.2 Add `[Authorize]` attributes to Scheduling controllers
- **Files:** All controllers in `src/Services/Scheduling/CrownCommerce.Scheduling.Api/Controllers/`
- Add `[Authorize]` at the controller level on `EmployeesController`, `MeetingsController`, `TeamChannelsController`, `ActivityFeedController`, `ConversationsController`
- Verify endpoints return `401 Unauthorized` when called without a token

### 2.3 Implement user-to-employee mapping
- **File:** `src/Services/Scheduling/CrownCommerce.Scheduling.Application/Services/SchedulingService.cs`
- Add a method `GetEmployeeByUserIdAsync(Guid userId)` that looks up an employee by their `UserId` field
- Add corresponding repository method and controller endpoint: `GET /employees/me?userId={userId}` or extract `userId` from the JWT `sub` claim
- This enables the frontend to resolve the authenticated user to their employee record

### 2.4 Seed Identity users for existing employees
- **File:** `src/Services/Scheduling/CrownCommerce.Scheduling.Infrastructure/Data/SchedulingDbSeeder.cs`
- Assign deterministic `UserId` GUIDs to seeded employees (instead of `Guid.NewGuid()`)
- **New file or script:** Seed corresponding users in the Identity service database with matching `userId` values, known email/password credentials (e.g., `quinn@crowncommerce.com` / `Password123!`)
- Document the test credentials

### 2.5 Create the login page
- **New file:** `projects/teams/src/app/pages/login/login.ts` (+ `.html`, `.scss`)
- Form with email and password fields
- Call `AuthService.login()` on submit
- On success: store token, redirect to `/home`
- On failure: display error message
- Add route `/login` to `app.routes.ts` (outside the `TeamsLayout` wrapper)

### 2.6 Wire AuthService and auth interceptor into the Teams app
- **File:** `projects/teams/src/app/app.config.ts`
- Add `provideHttpClient(withInterceptors([authInterceptor]))` to providers
- Ensure `AuthService` is provided at the root level

### 2.7 Add auth guards to protected routes
- **New file:** `projects/teams/src/app/guards/auth.guard.ts`
- Implement `CanActivate` guard that checks `AuthService.isAuthenticated`
- If not authenticated, redirect to `/login`
- Apply guard to the `TeamsLayout` parent route in `app.routes.ts`

### 2.8 Replace hardcoded user in layout
- **File:** `projects/teams/src/app/layout/teams-layout.ts` (+ `.html`)
- Inject `AuthService`, read the `user` signal for display name and role
- On app init, call `GetEmployeeByUserId` (from step 2.3) to get the employee record
- Replace `"Quinn M."`, `"QM"`, `"Team Lead"` with dynamic values from the authenticated employee
- Add a logout button to the sidebar bottom section that calls `AuthService.logout()` and navigates to `/login`

### 2.9 Replace `employees[0]` current-user assumption
- **Files:** `pages/home/home.ts`, `pages/chat/chat.ts`
- Instead of fetching all employees and using index 0, use the authenticated employee ID (resolved in step 2.8 and stored in a shared signal/service)
- Pass the real employee ID to `getChannels()`, `getActivityFeed()`, `markChannelAsRead()`

---

## Phase 3: Chat - Send Messages

The chat page displays messages but cannot send them. This is the most visible missing feature.

### 3.1 Bind the message input field
- **File:** `projects/teams/src/app/pages/chat/chat.ts` (+ `.html`)
- Add a `messageText` signal to track input value
- Bind the `<input class="message-input">` to the signal with `(input)` or `[(ngModel)]`
- Enable the send button only when `messageText().trim().length > 0`

### 3.2 Implement the send handler
- **File:** `projects/teams/src/app/pages/chat/chat.ts`
- Add a `sendMessage()` method
- Resolve the selected channel's GUID from `channelIdMap`
- Call `schedulingService.sendChannelMessage(channelGuid, { employeeId: currentEmployeeId, content: messageText() })`
- On success: clear the input, append the new message to the local `messages` signal, scroll to bottom
- On error: display inline error

### 3.3 Wire the send button and Enter key
- **File:** `projects/teams/src/app/pages/chat/chat.html`
- Add `(click)="sendMessage()"` to the send button
- Add `(keydown.enter)="sendMessage()"` to the input field

---

## Phase 4: Meeting Management

Wire the existing "New Meeting" button and add RSVP capability.

### 4.1 Create a new-meeting dialog component
- **New file:** `projects/teams/src/app/pages/meetings/new-meeting-dialog.ts` (+ `.html`, `.scss`)
- Form fields: title, description, date, start time, end time, location (optional), attendees (multi-select from employees list)
- Use Angular Material `MatDialogModule`, `MatDatepickerModule`, `MatSelectModule`
- On submit: call `schedulingService.createMeeting()`

### 4.2 Wire the "New Meeting" button
- **File:** `projects/teams/src/app/pages/meetings/meetings.ts` (+ `.html`)
- Add `(click)="openNewMeetingDialog()"` to the existing button
- Open the dialog from step 4.1
- On dialog close with result: refresh the meetings list for the selected date

### 4.3 Add RSVP to meeting cards
- **File:** `projects/teams/src/app/pages/meetings/meetings.ts` (+ `.html`)
- Add accept/decline buttons to each meeting card (or a dropdown)
- Call `schedulingService.respondToMeeting(meetingId, employeeId, { response: 'Accepted' | 'Declined' })`
- Update the meeting card state locally to reflect the response

### 4.4 Add meeting cancel/edit capability
- **File:** `projects/teams/src/app/pages/meetings/meetings.ts` (+ `.html`)
- Add a menu (mat-menu) to each meeting card with options: Edit, Cancel, Export iCal
- Edit: open a pre-filled version of the new-meeting dialog, call `updateMeeting()` on save
- Cancel: confirmation dialog, then call `cancelMeeting()`
- Export iCal: call `exportMeetingToICal()`, trigger file download

---

## Phase 5: Channel & Conversation Management

### 5.1 Create a new-channel dialog component
- **New file:** `projects/teams/src/app/pages/chat/new-channel-dialog.ts` (+ `.html`, `.scss`)
- Form fields: channel name, type (public/private), icon selection
- On submit: call `schedulingService.createChannel()`

### 5.2 Wire the new-conversation button
- **File:** `projects/teams/src/app/pages/chat/chat.ts` (+ `.html`)
- Add `(click)="openNewChannelDialog()"` to the edit-square icon button
- On dialog close with result: refresh channel list, select the new channel

### 5.3 Wire "Chat with member" on Team Members page
- **File:** `projects/teams/src/app/pages/team-members/team-members.ts` (+ `.html`)
- Add `(click)="startChat(member)"` to the chat icon button on each member card
- Check if a DM channel already exists with that employee (filter existing channels)
- If exists: navigate to `/chat` and select that channel
- If not: call `schedulingService.createChannel()` to create a DM, then navigate

---

## Phase 6: Presence Management

### 6.1 Update presence on login
- After successful authentication (step 2.5), call `schedulingService.updatePresence(employeeId, { status: 'Online' })`

### 6.2 Update presence on logout / tab close
- On logout button click: call `updatePresence(employeeId, { status: 'Offline' })` before clearing the token
- Add a `beforeunload` event listener to set presence to Offline when the browser tab closes

### 6.3 Detect idle state
- Implement an idle detection mechanism (track mouse/keyboard activity)
- After configurable idle timeout (e.g., 5 minutes): call `updatePresence(employeeId, { status: 'Away' })`
- On activity resume: call `updatePresence(employeeId, { status: 'Online' })`

---

## Phase 7: Home Page Actions

### 7.1 Wire the notifications button
- **File:** `projects/teams/src/app/pages/home/home.ts` (+ `.html`)
- Add `(click)="toggleNotifications()"` to the notifications icon button
- Option A: Open a dropdown/panel showing recent activity (reuse activity feed data)
- Option B: Navigate to a dedicated notifications page
- Requires: decide on notification strategy (in-app only, or integrate with Notification service)

### 7.2 Wire the search button
- **File:** `projects/teams/src/app/pages/home/home.ts` (+ `.html`)
- Add `(click)="toggleSearch()"` to the search icon button
- Implement a global search overlay or expandable search bar
- Search scope: employees, channels, meetings (client-side filtering across loaded data is acceptable for MVP)

---

## Phase 8: Real-Time Messaging (SignalR)

### 8.1 Add a SignalR hub to the Scheduling API
- **New file:** `src/Services/Scheduling/CrownCommerce.Scheduling.Api/Hubs/TeamHub.cs`
- Methods: `SendMessage(channelId, message)`, `JoinChannel(channelId)`, `LeaveChannel(channelId)`
- Broadcast new messages to all connected clients in the channel group
- Configure SignalR in `Program.cs` with `builder.Services.AddSignalR()` and `app.MapHub<TeamHub>("/hubs/team")`

### 8.2 Add SignalR route to API Gateway
- **File:** `src/Gateway/CrownCommerce.ApiGateway/appsettings.json`
- Add a route for `/api/hubs/team/{**catch-all}` pointing to the Scheduling API
- Configure WebSocket passthrough

### 8.3 Create an Angular SignalR service
- **New file:** `projects/api/src/lib/services/team-hub.service.ts`
- Install `@microsoft/signalr` package
- Manage connection lifecycle (connect on login, disconnect on logout)
- Expose observables for incoming messages, presence changes
- Export from `public-api.ts`

### 8.4 Integrate real-time messages into Chat page
- **File:** `projects/teams/src/app/pages/chat/chat.ts`
- Subscribe to the `TeamHubService` message stream
- When a new message arrives for the selected channel: append to messages list
- When a new message arrives for a different channel: increment unread count
- Send messages through SignalR instead of REST (or keep REST and use SignalR for receive only)

### 8.5 Integrate real-time presence updates
- Subscribe to presence change events from the hub
- Update employee presence indicators on Team Members page in real-time
- Update sidebar user presence dot

---

## Phase 9: Chat Enhancements

### 9.1 Implement conversation search
- **Backend:** Add `GET /channels/{id}/messages/search?query=` endpoint to `TeamChannelsController`
- **Frontend:** Bind the chat search input to filter channels by name (client-side) and optionally search message content (server-side)

### 9.2 Add message editing and deletion
- **Backend:** Add `PUT /conversations/{conversationId}/messages/{messageId}` and `DELETE` endpoints
- **Frontend:** Add a context menu (right-click or long-press) on own messages with Edit and Delete options
- Edit: inline editing with save/cancel
- Delete: confirmation, then remove from list

### 9.3 Add message reactions
- **Backend:** New `MessageReaction` entity, `POST /messages/{id}/reactions`, `DELETE /messages/{id}/reactions/{reactionId}`
- **Frontend:** Emoji picker on hover/click, display reaction counts below messages

### 9.4 Add typing indicators
- **Backend:** SignalR methods `StartTyping(channelId)` and `StopTyping(channelId)` that broadcast to the channel group
- **Frontend:** Show "X is typing..." indicator below the message list when another user is typing

### 9.5 Add @mention support
- **Frontend:** Detect `@` in the message input, show an autocomplete dropdown of employees
- **Backend:** Parse mentions on message save, create notification entries for mentioned users
- **Frontend:** Render mentions as highlighted links in message display

---

## Phase 10: Pagination & Performance

### 10.1 Add pagination to channel messages
- **Backend:** Add `skip` and `take` query parameters to `GET /channels/{id}/messages`
- **Frontend:** Implement infinite scroll / "load more" in the chat message list

### 10.2 Add pagination to employee list
- **Backend:** Add `skip`, `take`, `search` query parameters to `GET /employees`
- **Frontend:** Implement pagination or infinite scroll on Team Members page (needed at scale)

### 10.3 Add pagination to meetings
- **Backend:** Already filtered by date range, but add `skip`/`take` for days with many meetings
- **Frontend:** Handle gracefully if a day has more meetings than fit on screen

### 10.4 Add pagination to activity feed
- **Backend:** `GET /activity` already accepts `count`; add `skip` for paging
- **Frontend:** "Show more" button or infinite scroll on the Home page activity section

---

## Phase 11: File Attachments

### 11.1 Add file storage infrastructure
- Choose storage backend (Azure Blob Storage, local file system for dev)
- Add a file upload endpoint: `POST /files` returning a file URL/ID
- Add a file metadata entity to the Scheduling database

### 11.2 Extend message model for attachments
- **Backend:** Add optional `attachments` array to `ConversationMessage` entity
- Update `SendChannelMessageDto` to accept file references
- Update `ChannelMessageDto` to return attachment metadata (name, size, URL, type)

### 11.3 Implement file upload UI in chat
- **Frontend:** Wire the attach button to a file picker
- Upload the file, then include the file reference in the `sendChannelMessage()` call
- Display attachments in message bubbles (image preview for images, download link for others)

---

## Phase 12: Video & Voice Calling

### 12.1 Select and integrate a calling provider
- Evaluate options: Twilio, Daily.co, Vonage, or WebRTC peer-to-peer
- Add provider SDK and API keys to configuration

### 12.2 Implement call initiation
- **Backend:** Endpoint to create a call room/session and return a join URL
- **Frontend:** Wire video/phone buttons on Chat and Team Members pages
- Open call in a new window or embedded component

### 12.3 Add meeting join links
- **Backend:** Add optional `joinUrl` field to Meeting entity
- When a meeting is created with `isVirtual: true`, auto-generate a call room
- **Frontend:** Wire the "Join" button on meeting cards to open the `joinUrl`

---

## Verification Checkpoints

After each phase, verify:

| Phase | Verification |
|-------|-------------|
| 1 | `ng build teams` compiles with zero errors; no runtime console errors |
| 2 | Can log in, see own name in sidebar, log out; unauthenticated access redirects to login |
| 3 | Can type and send a message in any channel; message appears in the list |
| 4 | Can create a meeting; it appears on the calendar; can accept/decline |
| 5 | Can create a new channel; can start a DM from Team Members page |
| 6 | Presence dot updates on login/logout; goes to Away after idle |
| 7 | Notifications and search buttons respond to clicks |
| 8 | Messages from another browser tab appear in real-time without refresh |
| 9 | Can search, edit, delete messages; reactions and mentions work |
| 10 | Large datasets load incrementally; no UI freezes |
| 11 | Can attach and view files in chat messages |
| 12 | Can initiate and join video/voice calls |

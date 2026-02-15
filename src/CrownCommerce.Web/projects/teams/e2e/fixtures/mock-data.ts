// ── Auth ──

export const mockAuthResponse = {
  userId: 'usr-001',
  email: 'quinn@company.com',
  firstName: 'Quinn',
  lastName: 'Mitchell',
  token: 'mock-jwt-token-12345',
};

// ── Employees ──

export const mockCurrentEmployee = {
  id: 'emp-001',
  userId: 'usr-001',
  email: 'quinn@company.com',
  firstName: 'Quinn',
  lastName: 'Mitchell',
  phone: null,
  jobTitle: 'Software Engineer',
  department: 'Engineering',
  timeZone: 'America/New_York',
  status: 'Active',
  presence: 'Online',
  lastSeenAt: null,
  createdAt: '2024-01-15T00:00:00Z',
};

export const mockEmployees = [
  mockCurrentEmployee,
  {
    id: 'emp-002',
    userId: 'usr-002',
    email: 'sarah@company.com',
    firstName: 'Sarah',
    lastName: 'Lee',
    phone: null,
    jobTitle: 'Product Manager',
    department: 'Product',
    timeZone: 'America/Los_Angeles',
    status: 'Active',
    presence: 'Online',
    lastSeenAt: null,
    createdAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 'emp-003',
    userId: 'usr-003',
    email: 'alex@company.com',
    firstName: 'Alex',
    lastName: 'Chen',
    phone: null,
    jobTitle: 'Designer',
    department: 'Design',
    timeZone: 'Europe/London',
    status: 'Active',
    presence: 'Away',
    lastSeenAt: '2024-01-15T08:00:00Z',
    createdAt: '2024-01-05T00:00:00Z',
  },
  {
    id: 'emp-004',
    userId: 'usr-004',
    email: 'jordan@company.com',
    firstName: 'Jordan',
    lastName: 'Davis',
    phone: null,
    jobTitle: 'Backend Engineer',
    department: 'Engineering',
    timeZone: 'America/New_York',
    status: 'Active',
    presence: 'Offline',
    lastSeenAt: '2024-01-14T18:00:00Z',
    createdAt: '2024-01-02T00:00:00Z',
  },
];

// ── Channels ──

export const mockChannels = [
  {
    id: 'ch-001',
    name: 'general',
    icon: 'tag',
    channelType: 'Public',
    unreadCount: 3,
    lastMessage: 'Hey team!',
    lastMessageTime: '2024-01-15T10:30:00Z',
    participantCount: 8,
  },
  {
    id: 'ch-002',
    name: 'engineering',
    icon: 'code',
    channelType: 'Public',
    unreadCount: 0,
    lastMessage: 'PR merged',
    lastMessageTime: '2024-01-15T09:15:00Z',
    participantCount: 5,
  },
  {
    id: 'ch-003',
    name: 'Sarah Lee',
    icon: null,
    channelType: 'DirectMessage',
    unreadCount: 1,
    lastMessage: 'Thanks!',
    lastMessageTime: '2024-01-15T11:00:00Z',
    participantCount: 2,
  },
];

// ── Channel Messages ──

export const mockChannelMessages = [
  {
    id: 'msg-001',
    senderEmployeeId: 'emp-002',
    senderName: 'Sarah Lee',
    senderInitials: 'SL',
    content: 'Hey everyone! Welcome to the general channel.',
    sentAt: '2024-01-15T10:00:00Z',
    reactions: [],
    attachments: [],
  },
  {
    id: 'msg-002',
    senderEmployeeId: 'emp-001',
    senderName: 'Quinn Mitchell',
    senderInitials: 'QM',
    content: 'Thanks Sarah! Glad to be here.',
    sentAt: '2024-01-15T10:05:00Z',
    reactions: [{ emoji: '\uD83D\uDC4D', count: 2, hasReacted: true }],
    attachments: [],
  },
  {
    id: 'msg-003',
    senderEmployeeId: 'emp-003',
    senderName: 'Alex Chen',
    senderInitials: 'AC',
    content: 'Looking forward to collaborating!',
    sentAt: '2024-01-15T10:10:00Z',
    reactions: [],
    attachments: [],
  },
];

export const mockSentMessage = {
  id: 'msg-new-001',
  senderEmployeeId: 'emp-001',
  senderName: 'Quinn Mitchell',
  senderInitials: 'QM',
  content: 'Hello from test!',
  sentAt: new Date().toISOString(),
  reactions: [],
  attachments: [],
};

// ── Meetings ──

const today = new Date();
const todayStr = today.toISOString().split('T')[0];

export const mockUpcomingMeetings = [
  {
    id: 'mtg-001',
    title: 'Sprint Planning',
    description: 'Weekly sprint planning session',
    startTimeUtc: `${todayStr}T14:00:00Z`,
    endTimeUtc: `${todayStr}T15:00:00Z`,
    location: null,
    joinUrl: 'https://meet.example.com/sprint',
    status: 'Scheduled',
    organizerId: 'emp-002',
    createdAt: '2024-01-10T00:00:00Z',
    attendees: [
      { id: 'att-001', employeeId: 'emp-001', employeeName: 'Quinn Mitchell', employeeEmail: 'quinn@company.com', response: 'Pending', respondedAt: null },
      { id: 'att-002', employeeId: 'emp-002', employeeName: 'Sarah Lee', employeeEmail: 'sarah@company.com', response: 'Accepted', respondedAt: '2024-01-12T00:00:00Z' },
    ],
  },
  {
    id: 'mtg-002',
    title: 'Design Review',
    description: 'Review latest design mockups',
    startTimeUtc: `${todayStr}T16:00:00Z`,
    endTimeUtc: `${todayStr}T17:00:00Z`,
    location: 'Conference Room A',
    joinUrl: null,
    status: 'Scheduled',
    organizerId: 'emp-003',
    createdAt: '2024-01-11T00:00:00Z',
    attendees: [
      { id: 'att-003', employeeId: 'emp-003', employeeName: 'Alex Chen', employeeEmail: 'alex@company.com', response: 'Accepted', respondedAt: '2024-01-11T00:00:00Z' },
    ],
  },
];

export const mockCalendarEvents = [
  {
    id: 'mtg-001',
    title: 'Sprint Planning',
    startTimeUtc: `${todayStr}T14:00:00Z`,
    endTimeUtc: `${todayStr}T15:00:00Z`,
    location: null,
    joinUrl: 'https://meet.example.com/sprint',
    status: 'Scheduled',
    attendeeCount: 5,
    organizerName: 'Sarah Lee',
  },
  {
    id: 'mtg-002',
    title: 'Design Review',
    startTimeUtc: `${todayStr}T16:00:00Z`,
    endTimeUtc: `${todayStr}T17:00:00Z`,
    location: 'Conference Room A',
    joinUrl: null,
    status: 'Scheduled',
    attendeeCount: 3,
    organizerName: 'Alex Chen',
  },
  {
    id: 'mtg-003',
    title: 'Team Standup',
    startTimeUtc: `${todayStr}T09:00:00Z`,
    endTimeUtc: `${todayStr}T09:30:00Z`,
    location: null,
    joinUrl: 'https://meet.example.com/standup',
    status: 'Scheduled',
    attendeeCount: 8,
    organizerName: 'Quinn Mitchell',
  },
];

// ── Activity Feed ──

export const mockActivityFeed = [
  {
    id: 'act-001',
    type: 'message',
    icon: 'chat',
    title: 'New message in #general',
    description: 'Sarah Lee sent a message',
    occurredAt: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: 'act-002',
    type: 'meeting',
    icon: 'calendar_month',
    title: 'Meeting scheduled',
    description: 'Sprint Planning at 2:00 PM',
    occurredAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'act-003',
    type: 'task',
    icon: 'task_alt',
    title: 'Task completed',
    description: 'Code review finished',
    occurredAt: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
];

export const mockCreatedMeeting = {
  id: 'mtg-new-001',
  title: 'New Test Meeting',
  description: 'Test meeting description',
  startTimeUtc: `${todayStr}T18:00:00Z`,
  endTimeUtc: `${todayStr}T19:00:00Z`,
  location: null,
  joinUrl: null,
  status: 'Scheduled',
  organizerId: 'emp-001',
  createdAt: new Date().toISOString(),
  attendees: [],
};

export const mockCreatedChannel = {
  id: 'ch-new-001',
  name: 'test-channel',
  icon: 'tag',
  channelType: 'Public',
  unreadCount: 0,
  lastMessage: null,
  lastMessageTime: null,
  participantCount: 1,
};

export interface TeamMember {
  id: number;
  name: string;
  initials: string;
  role: string;
  department: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
  email: string;
}

export interface ChatChannel {
  id: number;
  name: string;
  icon: string;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  isPrivate: boolean;
}

export interface ChatMessage {
  id: number;
  channelId: number;
  senderId: number;
  senderName: string;
  senderInitials: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

export interface Meeting {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  date: string;
  color: string;
  participants: { name: string; initials: string }[];
  location?: string;
  isVirtual: boolean;
}

export interface ActivityItem {
  id: number;
  type: 'message' | 'meeting' | 'task' | 'file';
  icon: string;
  title: string;
  description: string;
  time: string;
  color: string;
}

export interface TimeZoneCard {
  city: string;
  timezone: string;
  offset: string;
  flag: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  { id: 1, name: 'Sarah Chen', initials: 'SC', role: 'Product Designer', department: 'Design', avatar: '', status: 'online', email: 'sarah@team.com' },
  { id: 2, name: 'Marcus Johnson', initials: 'MJ', role: 'Frontend Engineer', department: 'Engineering', avatar: '', status: 'online', email: 'marcus@team.com' },
  { id: 3, name: 'Aisha Patel', initials: 'AP', role: 'Backend Engineer', department: 'Engineering', avatar: '', status: 'away', email: 'aisha@team.com' },
  { id: 4, name: 'David Kim', initials: 'DK', role: 'Product Manager', department: 'Product', avatar: '', status: 'online', email: 'david@team.com' },
  { id: 5, name: 'Elena Rodriguez', initials: 'ER', role: 'UX Researcher', department: 'Design', avatar: '', status: 'offline', email: 'elena@team.com' },
  { id: 6, name: 'James Wilson', initials: 'JW', role: 'DevOps Engineer', department: 'Engineering', avatar: '', status: 'online', email: 'james@team.com' },
  { id: 7, name: 'Priya Sharma', initials: 'PS', role: 'QA Engineer', department: 'Engineering', avatar: '', status: 'away', email: 'priya@team.com' },
  { id: 8, name: 'Tom Anderson', initials: 'TA', role: 'Tech Lead', department: 'Engineering', avatar: '', status: 'online', email: 'tom@team.com' },
  { id: 9, name: 'Lisa Chang', initials: 'LC', role: 'Marketing Lead', department: 'Marketing', avatar: '', status: 'offline', email: 'lisa@team.com' },
  { id: 10, name: 'Ryan O\'Brien', initials: 'RO', role: 'Data Analyst', department: 'Analytics', avatar: '', status: 'online', email: 'ryan@team.com' },
  { id: 11, name: 'Mia Torres', initials: 'MT', role: 'Content Strategist', department: 'Marketing', avatar: '', status: 'away', email: 'mia@team.com' },
  { id: 12, name: 'Noah Baker', initials: 'NB', role: 'Full Stack Dev', department: 'Engineering', avatar: '', status: 'online', email: 'noah@team.com' },
];

export const CHAT_CHANNELS: ChatChannel[] = [
  { id: 1, name: 'general', icon: 'tag', unreadCount: 3, lastMessage: 'Hey team, standup in 5!', lastMessageTime: '2m ago', isPrivate: false },
  { id: 2, name: 'design', icon: 'palette', unreadCount: 0, lastMessage: 'New mockups uploaded', lastMessageTime: '15m ago', isPrivate: false },
  { id: 3, name: 'engineering', icon: 'code', unreadCount: 7, lastMessage: 'PR #142 is ready for review', lastMessageTime: '1h ago', isPrivate: false },
  { id: 4, name: 'product', icon: 'inventory_2', unreadCount: 1, lastMessage: 'Sprint planning tomorrow', lastMessageTime: '2h ago', isPrivate: false },
  { id: 5, name: 'random', icon: 'casino', unreadCount: 0, lastMessage: 'Anyone for lunch?', lastMessageTime: '3h ago', isPrivate: false },
  { id: 6, name: 'Sarah Chen', icon: 'person', unreadCount: 2, lastMessage: 'Can you review my designs?', lastMessageTime: '30m ago', isPrivate: true },
  { id: 7, name: 'David Kim', icon: 'person', unreadCount: 0, lastMessage: 'Meeting notes shared', lastMessageTime: '1h ago', isPrivate: true },
];

export const CHAT_MESSAGES: ChatMessage[] = [
  { id: 1, channelId: 1, senderId: 4, senderName: 'David Kim', senderInitials: 'DK', content: 'Good morning everyone! Quick reminder about our standup in 5 minutes.', timestamp: '9:25 AM', isOwn: false },
  { id: 2, channelId: 1, senderId: 1, senderName: 'Sarah Chen', senderInitials: 'SC', content: 'Thanks David! I\'ll be there. Just finishing up the new dashboard mockups.', timestamp: '9:26 AM', isOwn: false },
  { id: 3, channelId: 1, senderId: 2, senderName: 'Marcus Johnson', senderInitials: 'MJ', content: 'On my way! Also, I pushed the new component library updates to staging.', timestamp: '9:27 AM', isOwn: false },
  { id: 4, channelId: 1, senderId: 0, senderName: 'You', senderInitials: 'QM', content: 'Great work Marcus! I\'ll review the staging deployment after standup.', timestamp: '9:28 AM', isOwn: true },
  { id: 5, channelId: 1, senderId: 3, senderName: 'Aisha Patel', senderInitials: 'AP', content: 'Running a few minutes late, please start without me. I\'ll catch up on the notes.', timestamp: '9:29 AM', isOwn: false },
  { id: 6, channelId: 1, senderId: 8, senderName: 'Tom Anderson', senderInitials: 'TA', content: 'No worries Aisha. Team, let\'s also discuss the Q2 roadmap items during standup.', timestamp: '9:30 AM', isOwn: false },
  { id: 7, channelId: 1, senderId: 0, senderName: 'You', senderInitials: 'QM', content: 'Sounds good. I have some updates on the API integration work as well.', timestamp: '9:31 AM', isOwn: true },
  { id: 8, channelId: 1, senderId: 6, senderName: 'James Wilson', senderInitials: 'JW', content: 'Hey team, standup in 5!', timestamp: '9:55 AM', isOwn: false },
];

export const MEETINGS: Meeting[] = [
  {
    id: 1, title: 'Daily Standup', startTime: '9:30 AM', endTime: '9:45 AM',
    date: '2026-02-14', color: '#6366F1',
    participants: [{ name: 'Sarah Chen', initials: 'SC' }, { name: 'Marcus Johnson', initials: 'MJ' }, { name: 'David Kim', initials: 'DK' }],
    isVirtual: true,
  },
  {
    id: 2, title: 'Design Review', startTime: '11:00 AM', endTime: '12:00 PM',
    date: '2026-02-14', color: '#FF6B6B',
    participants: [{ name: 'Sarah Chen', initials: 'SC' }, { name: 'Elena Rodriguez', initials: 'ER' }],
    location: 'Room 3B', isVirtual: false,
  },
  {
    id: 3, title: 'Sprint Planning', startTime: '2:00 PM', endTime: '3:30 PM',
    date: '2026-02-14', color: '#22C55E',
    participants: [{ name: 'David Kim', initials: 'DK' }, { name: 'Tom Anderson', initials: 'TA' }, { name: 'Aisha Patel', initials: 'AP' }, { name: 'Marcus Johnson', initials: 'MJ' }],
    isVirtual: true,
  },
  {
    id: 4, title: '1:1 with Tom', startTime: '4:00 PM', endTime: '4:30 PM',
    date: '2026-02-14', color: '#FCD34D',
    participants: [{ name: 'Tom Anderson', initials: 'TA' }],
    isVirtual: true,
  },
  {
    id: 5, title: 'Product Sync', startTime: '10:00 AM', endTime: '10:30 AM',
    date: '2026-02-15', color: '#6366F1',
    participants: [{ name: 'David Kim', initials: 'DK' }, { name: 'Lisa Chang', initials: 'LC' }],
    isVirtual: true,
  },
  {
    id: 6, title: 'Code Review Session', startTime: '1:00 PM', endTime: '2:00 PM',
    date: '2026-02-16', color: '#FF6B6B',
    participants: [{ name: 'Marcus Johnson', initials: 'MJ' }, { name: 'James Wilson', initials: 'JW' }, { name: 'Noah Baker', initials: 'NB' }],
    isVirtual: false, location: 'Engineering Lab',
  },
];

export const ACTIVITY_ITEMS: ActivityItem[] = [
  { id: 1, type: 'message', icon: 'chat', title: 'New message in #design', description: 'Sarah shared new mockups for the dashboard redesign', time: '5 min ago', color: '#6366F1' },
  { id: 2, type: 'meeting', icon: 'videocam', title: 'Design Review starting soon', description: 'In 30 minutes - Room 3B', time: '30 min', color: '#FF6B6B' },
  { id: 3, type: 'task', icon: 'check_circle', title: 'Task completed', description: 'Marcus completed "Update component library"', time: '1h ago', color: '#22C55E' },
  { id: 4, type: 'file', icon: 'description', title: 'New file shared', description: 'Q2 Roadmap.pdf was shared in #product', time: '2h ago', color: '#FCD34D' },
  { id: 5, type: 'message', icon: 'chat', title: 'Mention in #engineering', description: 'Tom mentioned you in a thread about API integration', time: '3h ago', color: '#6366F1' },
  { id: 6, type: 'task', icon: 'check_circle', title: 'New task assigned', description: 'Review PR #142 - Component library updates', time: '4h ago', color: '#22C55E' },
];

export const TIME_ZONES: TimeZoneCard[] = [
  { city: 'San Francisco', timezone: 'PST', offset: 'UTC-8', flag: '🇺🇸' },
  { city: 'New York', timezone: 'EST', offset: 'UTC-5', flag: '🇺🇸' },
  { city: 'London', timezone: 'GMT', offset: 'UTC+0', flag: '🇬🇧' },
  { city: 'Tokyo', timezone: 'JST', offset: 'UTC+9', flag: '🇯🇵' },
  { city: 'Sydney', timezone: 'AEDT', offset: 'UTC+11', flag: '🇦🇺' },
];

export interface NotificationLog {
  id: string;
  recipient: string;
  subject: string;
  type: string;
  channel: string;
  referenceId: string | null;
  isSent: boolean;
  errorMessage: string | null;
  createdAt: string;
  sentAt: string | null;
}

export interface SubscribeRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  tags?: string[];
}

export interface SubscribeResponse {
  message: string;
}

export interface Subscriber {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  status: string;
  tags: string[];
  confirmedAt: string | null;
  createdAt: string;
  unsubscribedAt: string | null;
}

export interface SubscriberStats {
  totalActive: number;
  totalPending: number;
  totalUnsubscribed: number;
  recentSubscribers: number;
}

export interface CreateCampaignRequest {
  subject: string;
  htmlBody: string;
  plainTextBody?: string;
  targetTag?: string;
  scheduledAt?: string;
}

export interface UpdateCampaignRequest {
  subject?: string;
  htmlBody?: string;
  plainTextBody?: string;
  targetTag?: string;
  scheduledAt?: string;
}

export interface Campaign {
  id: string;
  subject: string;
  status: string;
  targetTag: string | null;
  totalRecipients: number;
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  totalUnsubscribed: number;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
}

export interface CampaignDetail {
  id: string;
  subject: string;
  htmlBody: string;
  plainTextBody: string | null;
  status: string;
  targetTag: string | null;
  totalRecipients: number;
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  totalUnsubscribed: number;
  scheduledAt: string | null;
  sentAt: string | null;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface CampaignRecipient {
  id: string;
  email: string;
  status: string;
  sentAt: string | null;
  openedAt: string | null;
  clickedAt: string | null;
  errorMessage: string | null;
}

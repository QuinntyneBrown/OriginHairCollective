export interface Vendor {
  id: string;
  companyName: string;
  platform: string;
  contactName: string;
  contactEmail: string;
  contactWhatsApp: string | null;
  factoryLocation: string | null;
  hairOriginCountry: string;
  websiteUrl: string | null;
  dateEvaluated: string | null;
  evaluatedBy: string | null;
  notes: string | null;
  status: string;
  grandTotal: number;
  maxTotal: number;
  rating: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface VendorDetail extends Vendor {
  scores: VendorScore[];
  redFlags: VendorRedFlag[];
  followUps: VendorFollowUp[];
}

export interface VendorScore {
  id: string;
  section: string;
  criterionNumber: string;
  criterionLabel: string;
  score: number;
  maxScore: number;
  notes: string | null;
}

export interface VendorRedFlag {
  id: string;
  description: string;
  isCleared: boolean;
}

export interface VendorFollowUp {
  id: string;
  vendorId: string;
  subject: string;
  body: string;
  isSent: boolean;
  errorMessage: string | null;
  createdAt: string;
  sentAt: string | null;
}

export interface CreateVendorRequest {
  companyName: string;
  platform: string;
  contactName: string;
  contactEmail: string;
  contactWhatsApp?: string;
  factoryLocation?: string;
  hairOriginCountry: string;
  websiteUrl?: string;
  evaluatedBy?: string;
  notes?: string;
}

export interface UpdateVendorRequest {
  companyName: string;
  platform: string;
  contactName: string;
  contactEmail: string;
  contactWhatsApp?: string;
  factoryLocation?: string;
  hairOriginCountry: string;
  websiteUrl?: string;
  evaluatedBy?: string;
  notes?: string;
  status: string;
}

export interface SaveScoresRequest {
  scores: ScoreItem[];
}

export interface ScoreItem {
  section: string;
  criterionNumber: string;
  criterionLabel: string;
  score: number;
  maxScore: number;
  notes?: string;
}

export interface SaveRedFlagsRequest {
  redFlags: RedFlagItem[];
}

export interface RedFlagItem {
  description: string;
  isCleared: boolean;
}

export interface CreateFollowUpRequest {
  subject: string;
  body: string;
}

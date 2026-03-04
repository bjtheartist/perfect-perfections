export const LEAD_STATUSES = ["new", "contacted", "booked", "closed"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  event_date?: string | null;
  event_type?: string | null;
  guests?: number | null;
  message?: string | null;
  status: LeadStatus;
  created_at: string;
}

export interface LeadCreateRequest {
  name: string;
  email: string;
  phone?: string;
  event_date?: string;
  event_type?: string;
  guests?: number;
  message?: string;
}

export interface LeadUpdateRequest {
  status: LeadStatus;
}

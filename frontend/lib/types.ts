export interface AuthResponse {
  token: string;
  userId: string;
  userName: string;
  email: string;
}

export interface UserProfile {
  id: string;
  userName: string;
  email: string;
  phoneNumber: string | null;
  availableNumberOfInvites: number;
  createdAt: string;
}

export interface EventData {
  id: string;
  inviteBy: string;
  numberOfInvites: number;
  dateOfTheEvent: string;
  eventDone: boolean;
  usedTemplate: string | null;
  createdAt: string;
}

export interface InviteeData {
  id: string;
  eventId: string;
  phoneNumber: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'NO_RESPONSE';
  sentAt: string | null;
  templateId: string | null;
}

export interface TemplateData {
  id: string;
  template: string;
  createdAt: string;
}

export interface PaymentData {
  id: string;
  userId: string;
  amount: number;
  numberOfInvites: number;
  paymentAt: string;
}

export interface PublicInviteData {
  invitee: InviteeData;
  event: EventData;
  template: TemplateData | null;
}

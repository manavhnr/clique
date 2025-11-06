export interface AuthUser {
  id: string;
  phoneNumber: string;
  isVerified: boolean;
  isHost: boolean;
  createdAt?: string;
  // Profile information
  username?: string;
  name?: string;
  age?: number;
  city?: string;
  email?: string;
  socialActivityLevel?: 'rarely' | 'occasionally' | 'frequently' | 'very_frequently';
  isProfileComplete?: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  price: number;
  capacity: number;
  hostId: string;
  hostName: string;
  hostPhone: string;
  imageUrl?: string;
  category: 'party' | 'music' | 'food' | 'sports' | 'culture' | 'other';
  tags: string[];
  isActive: boolean;
  createdAt: string;
}

export interface Booking {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userPhone: string;
  numberOfTickets: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  bookingDate: string;
  qrCode?: string;
}

export interface User {
  id: string;
  phone_number: string;
  is_verified: boolean;
  is_host: boolean;
  created_at: string;
  // Profile information
  username?: string;
  name?: string;
  age?: number;
  city?: string;
  email?: string;
  social_activity_level?: 'rarely' | 'occasionally' | 'frequently' | 'very_frequently';
  is_profile_complete?: boolean;
}
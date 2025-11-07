export interface BookingRequest {
  id: string;
  eventId: string;
  userId: string;
  hostId: string;
  status: 'pending' | 'approved' | 'payment_pending' | 'paid' | 'rejected';
  ticketTier: string;
  price: number;
  requestedAt: string;
  respondedAt?: string;
  paymentStatus?: 'not_required' | 'pending' | 'completed' | 'failed';
  paymentCompletedAt?: string;
  qrCode?: string; // Generated only after payment
  userProfile: {
    id: string;
    name: string;
    username?: string;
    email: string;
    avatar?: string;
    age?: number;
    city?: string;
    socialActivityLevel?: 'rarely' | 'occasionally' | 'frequently' | 'very_frequently';
  };
  eventDetails: {
    title: string;
    date: string;
    time: string;
    location: {
      name: string;
      address: string;
    };
  };
}

export interface UserBooking {
  id: string;
  eventId: string;
  status: 'pending' | 'approved' | 'payment_pending' | 'paid' | 'rejected';
  ticketTier: string;
  price: number;
  requestedAt: string;
  respondedAt?: string;
  paymentStatus?: 'not_required' | 'pending' | 'completed' | 'failed';
  paymentCompletedAt?: string;
  qrCode?: string; // Generated only after payment is completed
  eventDetails: {
    title: string;
    date: string;
    time: string;
    location: {
      name: string;
      address: string;
    };
    images: string[];
  };
}
export type UserRole = 'USER' | 'ADMIN' | 'BUSINESS' | 'DRIVER';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  userId: string;
  make: string;
  model: string;
  color: string;
  plateNumber: string;
  notes?: string;
  createdAt: string;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type BookingMode = 'HOURLY' | 'TRIP';

export interface Booking {
  id: string;
  userId: string;
  driverId?: string;
  vehicleId: string;
  pickupCoarseText: string;
  destinationText?: string;
  scheduleTime: string;
  mode: BookingMode;
  status: BookingStatus;
  priceEstimate: number;
  finalPrice?: number;
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  provider: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  createdAt: string;
}

export interface IncidentReport {
  id: string;
  bookingId?: string;
  reporterUserId: string;
  category: string;
  description: string;
  createdAt: string;
}

export interface ShareToken {
  token: string;
  bookingId: string;
  expiresAt: string;
}

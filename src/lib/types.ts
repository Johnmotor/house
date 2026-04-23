export interface Room {
  id: string;
  number: string;
  type: 'single' | 'double' | 'suite';
  status: 'idle' | 'occupied' | 'cleaning';
  currentBookingId?: string;
}

export interface Booking {
  id: string;
  roomId: string;
  roomNumber: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  status: 'active' | 'checked_out';
  createdAt: string;
}

export interface LinenItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  threshold: number;
  unit: string;
  standardUsage: Record<string, number>; // roomType -> quantity
}

export interface LinenUsage {
  id: string;
  date: string;
  roomId: string;
  roomNumber: string;
  linenId: string;
  linenName: string;
  quantity: number;
  operator: string;
  bookingId: string;
}

export interface CleaningTask {
  id: string;
  roomId: string;
  roomNumber: string;
  status: 'pending' | 'completed';
  assignee: string;
  completedAt?: string;
  createdAt: string;
  bookingId: string;
}

export interface AppData {
  rooms: Room[];
  bookings: Booking[];
  linens: LinenItem[];
  linenUsage: LinenUsage[];
  cleaningTasks: CleaningTask[];
}

export const ROOM_TYPE_LABELS: Record<string, string> = {
  single: '单人间',
  double: '双人间',
  suite: '套房',
};

export const ROOM_STATUS_LABELS: Record<string, string> = {
  idle: '空闲',
  occupied: '入住中',
  cleaning: '清洁中',
};

export const ROOM_STATUS_COLORS: Record<string, string> = {
  idle: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  occupied: 'bg-amber-100 text-amber-700 border-amber-200',
  cleaning: 'bg-sky-100 text-sky-700 border-sky-200',
};

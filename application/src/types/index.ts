export interface User {
  _id: string;
  name: string;
  email: string;
  nickname?: string;
  role: 'admin' | 'user';
  mobile?: string;
  alternateMobile?: string;
  address?: string;
  spouse?: string;
  children?: string[];
  nativePlace?: string;
  church?: string;
  avatar?: string;
   photos?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Contact extends User {
  groups?: string[];
}

export interface Group {
  _id: string;
  name: string;
  members: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  _id: string;
  title: string;
  description?: string;
  date: Date;
  time: string;
  location?: string;
  image?: string;
  createdBy: string;
  attendees?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'meeting' | 'message' | 'reminder' | 'update' | 'general';
  userId: string;
  read: boolean;
  data?: any;
  image?: string;
  createdAt: Date;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T = any> {
  url(url: any): unknown;
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
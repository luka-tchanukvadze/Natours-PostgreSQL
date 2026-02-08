import { Request as ExpressRequest } from 'express';

// Define a custom interface for the User object
export interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
  password?: string;
  role: 'user' | 'guide' | 'lead-guide' | 'admin';
  password_changed_at?: Date;
  password_reset_token?: string;
  password_reset_expires?: Date;
  active?: boolean;
}

// Define a custom interface for the Tour object
export interface Tour {
  id: string;
  name: string;
  duration: number;
  max_group_size: number;
  difficulty: 'easy' | 'medium' | 'difficult';
  rating: number;
  ratings_quantity: number;
  price: number;
  price_discount?: number;
  summary: string;
  description: string;
  image_cover: string;
  images?: string[];
  start_dates?: Date[];
  slug: string;
  secret_tour?: boolean;
  start_location_type?: string;
  start_location_coordinates?: number[];
  start_location_address?: string;
  start_location_description?: string;
  locations?: any[]; // You might want to define a more specific interface for locations
  guides?: string[]; // Array of user IDs or a more specific guide interface
  reviews?: Review[]; // Populate reviews
}

// Define a custom interface for the Review object
export interface Review {
  id: string;
  review: string;
  rating: number;
  created_at: Date;
  tour_id: string;
  user_id: string;
  user_name?: string; // For populated reviews
  user_photo?: string; // For populated reviews
}

// Define a custom interface for the Decoded JWT Token
export interface DecodedToken {
  id: string;
  iat: number;
  exp: number;
}

// Define the AppError interface if it's not already defined as a class
export interface AppError {
  statusCode: number;
  status: string;
  isOperational: boolean;
  message: string;
  stack?: string;
  code?: string; // For duplicate key errors (e.g., '23505' from PostgreSQL)
  path?: string; // For CastError
  value?: string; // For CastError
  detail?: string; // For duplicate key errors from PostgreSQL
  errors?: any; // For validation errors
  name?: string; // For JWT errors
}

// Extend the Express Request interface to include custom properties
declare module 'express' {
  interface Request {
    requestTime?: string;
    user?: User;
    body: {
      [key: string]: any;
      password?: string;
      password_confirm?: string;
      email?: string;
      name?: string;
      photo?: string;
      role?: 'user' | 'guide' | 'lead-guide' | 'admin';
      review?: string;
      rating?: number;
      tour_id?: string;
      user_id?: string;
      password_current?: string;
    };
    params: {
      [key: string]: string;
      id?: string;
      tourId?: string;
      year?: string;
      distance?: string;
      latlng?: string;
      unit?: string;
      token?: string;
    };
    query: {
      [key: string]: string | undefined;
      page?: string;
      sort?: string;
      limit?: string;
      fields?: string;
    };
  }
}

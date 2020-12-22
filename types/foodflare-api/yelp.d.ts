// Type definitions for foodflare-api 1.0.2
// Project: https://github.com/cbnventures/foodflare-api
// Definitions by: Jacky Liang <https://github.com/mrjackyliang>
// TypeScript Version: 3.9.7

export type YelpDollars = '$' | '$$' | '$$$' | '$$$$';

export type YelpCategories = YelpCategory[];

export interface YelpCategory {
  alias: string;
  title: string;
}

export type YelpServices = YelpService[];

export type YelpService = 'pickup' | 'delivery' | 'restaurant_reservation';

export type YelpHours = YelpHour[];

export interface YelpHour {
  open: YelpHourDay[];
  hours_type: 'REGULAR';
  is_open_now: boolean;
}

export interface YelpHourDay {
  is_overnight: boolean;
  start: string;
  end: string;
  day: number;
}

export type YelpPhotos = YelpPhoto[];

export type YelpPhoto = string;

export type YelpReviews = YelpReview[];

export interface YelpReview {
  id: string;
  url: string;
  text: string;
  rating: number;
  time_created: string;
  user: YelpReviewUser;
}

export interface YelpReviewUser {
  id: string;
  profile_url: string;
  image_url: string;
  name: string;
}

export interface YelpError {
  error: {
    code: string;
    description: string;
    new_business_id?: string;
    field?: string;
    instance?: number | null;
  };
}

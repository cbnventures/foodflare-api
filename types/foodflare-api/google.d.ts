// Type definitions for foodflare-api 1.0.1
// Project: https://github.com/cbnventures/foodflare-api
// Definitions by: Jacky Liang <https://github.com/mrjackyliang>
// TypeScript Version: 3.9.7

export type GoogleCategories = GoogleCategory[];

export type GoogleCategory = 'bakery' | 'bar' | 'cafe' | 'night_club' | 'restaurant';

export type GoogleServices = GoogleService[];

export type GoogleService = 'meal_delivery' | 'meal_takeaway';

export interface GoogleHours {
  open_now: true;
  periods: GoogleHoursDay[];
  weekday_text: string[];
}

export interface GoogleHoursDay {
  close?: GoogleHoursDayPartial;
  open: GoogleHoursDayPartial;
}

export interface GoogleHoursDayPartial {
  day: number;
  time: string;
}

export type GooglePhotos = GooglePhoto[];

export interface GooglePhoto {
  photo_reference: string;
  html_attributions: string[];
  width: number;
  height: number;

}

export type GoogleReviews = GoogleReview[];

export interface GoogleReview {
  author_name: string;
  author_url: string;
  language: string;
  profile_photo_url: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

export interface GoogleError {
  error_message?: string;
  html_attributions?: [];
  results?: [];
  status: string;
}

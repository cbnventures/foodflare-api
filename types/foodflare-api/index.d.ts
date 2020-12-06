// Type definitions for foodflare-api 1.0.1
// Project: https://github.com/cbnventures/foodflare-api
// Definitions by: Jacky Liang <https://github.com/mrjackyliang>
// TypeScript Version: 3.9.7

export type Payload =
  PayloadAuth
  | PayloadCoordinates
  | PayloadSearch
  | PayloadDetails
  | PayloadPhoto
  | PayloadReviews;

export interface PayloadAuth {
  platform: 'web' | 'mobile';
}

export interface PayloadCoordinates {
  latitude: number;
  longitude: number;
}

export interface PayloadSearch extends PayloadCoordinates {
  term: string;
  category: string[];
  sort: 'distance' | 'least_expensive' | 'most_reviewed';
  price: number[];
  min_rating: number;
  open_now: boolean;
}

export interface PayloadDetails extends PayloadCoordinates {
  id: string;
}

export interface PayloadPhoto {
  reference: string;
  max_width: number;
  max_height: number;
}

export interface PayloadReviews {
  id: string;
}

export type FetchResponse =
  FetchResponseSearch[]
  | FetchResponseDetails
  | FetchResponseGeocode
  | FetchResponsePhoto
  | FetchResponseReviews
  | FetchResponseToken;

export interface FetchResponseSearch {
  source: 'google' | 'yelp';
  id: string;
  name: string;
  price: number;
  rating: number;
  review_count: number;
  categories:CategoryService[];
  services:CategoryService[];
  coordinates: {
    latitude: number;
    longitude: number;
  };
  distance: number;
}

export interface FetchResponseDetails extends FetchResponseSearch {
  address: string;
  url: string;
  phone: {
    display: string;
    raw: string;
  };
  hours: Hours;
  photos: Photos;
  reviews: Reviews;
}

export interface FetchResponseGeocode {
  neighborhood?: string;
  sublocality_level_1?: string;
  locality?: string;
  administrative_area_level_1?: string;
  country?: string;
}

export interface FetchResponsePhoto {
  data_url: string;
}

export interface FetchResponseReviews {
  reviews: Reviews;
}

export interface FetchResponseToken {
  token: string;
}

export type ErrorResponse = ErrorResponseNode | ErrorResponseCustom;

export interface ErrorResponseNode {
  name: string;
  message: string;
}

export interface ErrorResponseCustom {
  status: string;
  description: string;
}

export type CategoriesServices = CategoryService[];

export interface CategoryService {
  tag: string;
  name: string;
}

export interface Hours {
  open_now: boolean;
  open_days: HoursDay[];
}

export interface HoursDay {
  day: number;
  start: string;
  end: string;
  is_overnight: boolean;
}

export type Photos = PhotoReference[] | PhotoUrl[];

export interface PhotoReference {
  reference: string;
  width: number;
  height: number;
}

export interface PhotoUrl {
  url: string;
}

export type Reviews = Review[];

export interface Review {
  text: string;
  url: string;
  rating: number;
  time: number;
  user: ReviewUser;
}

export interface ReviewUser {
  name: string;
  image_url: string;
}

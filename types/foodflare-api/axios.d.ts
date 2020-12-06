// Type definitions for foodflare-api 1.0.1
// Project: https://github.com/cbnventures/foodflare-api
// Definitions by: Jacky Liang <https://github.com/mrjackyliang>
// TypeScript Version: 3.9.7

import { GoogleError } from './google';
import { YelpError } from './yelp';

export interface AxiosError {
  status?: number;
  statusText?: string;
  response?: {
    status: number;
    data: GoogleError | YelpError;
  };
  data?: GoogleError | YelpError;
  isAxiosError?: boolean;
}

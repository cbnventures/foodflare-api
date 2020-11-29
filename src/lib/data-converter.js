const moment = require('moment-timezone');
const _ = require('lodash');

/**
 * Convert Google/Yelp address to custom address data.
 *
 * @param {string|string[]} address - Address data from Google/Yelp.
 *
 * @returns {string} Custom address data.
 *
 * @since 1.0.0
 */
function convertToAddressData(address) {
  let newAddress = '';

  // Pre-check.
  if (
    (_.isEmpty(address) || !_.isString(address))
    && (!_.isArray(address) || !_.every(address, _.isString))
  ) {
    return newAddress;
  }

  // Google "formatted_address".
  if (!_.isEmpty(address) && _.isString(address)) {
    newAddress = address;

    // Fix food truck intersection and remove ", USA".
    newAddress = newAddress.replace(/&,/g, '&');
    newAddress = newAddress.replace(/and,/g, 'and');
    newAddress = newAddress.replace(/, USA/g, '');
  }

  // Yelp "location.display_address".
  if (_.isArray(address) && _.every(address, _.isString)) {
    newAddress = address.join(', ');
  }

  return newAddress;
}

/**
 * Convert API error code to custom error message.
 *
 * @param {string} code - Error code returned from Axios, Google, or Yelp.
 *
 * @returns {string} Custom error message.
 *
 * @since 1.0.0
 */
function convertToApiErrorMessage(code) {
  let message;

  switch (code) {
    case 'ZERO_RESULTS': // No results returned (google).
      message = 'The requested resource was found, but returned no results';
      break;
    case 'INVALID_REQUEST': // Invalid request (google).
      message = 'The requested resource is invalid because of missing parameters';
      break;
    case 'BAD_REQUEST': // HTTP status 400 (api, google).
      message = 'The requested resource cannot be accessed';
      break;
    case 'FORBIDDEN': // HTTP status 403 (api).
      message = 'You do not have permission to access the requested resource';
      break;
    case 'NOT_FOUND': // HTTP status 404 (api).
      message = 'The requested resource could not be found';
      break;
    case 'CONNECTION_REFUSED': // Connection refused (api).
      message = 'The requested resource cannot be reached due to a network issue';
      break;
    case 'UNKNOWN_ERROR': // Server error (api, google).
      message = 'An unknown server error has occurred';
      break;
    default: // Fallback.
      message = '';
      break;
  }

  return message;
}

/**
 * Convert API error object to custom error object.
 *
 * @param {Error|AxiosError} errorObject - Node or Axios error object.
 *
 * @returns {ErrorResponse} Custom error object.
 *
 * @since 1.0.0
 */
function convertToApiErrorObject(errorObject) {
  const newErrorObject = {
    isAxiosError: false,
    status: undefined,
    data: undefined,
  };

  // Set "newErrorObject.isAxiosError".
  if (_.get(errorObject, 'isAxiosError')) {
    newErrorObject.isAxiosError = errorObject.isAxiosError;
  }

  // Set "newErrorObject.status".
  if (_.get(errorObject, 'response.status')) {
    newErrorObject.status = errorObject.response.status;
  } else if (_.get(errorObject, 'status')) {
    newErrorObject.status = errorObject.status;
  }

  // Set "newErrorObject.data".
  if (_.get(errorObject, 'response.data')) {
    newErrorObject.data = errorObject.response.data;
  } else if (_.get(errorObject, 'data')) {
    newErrorObject.data = errorObject.data;
  }

  // Google error object.
  const googleCode = _.get(newErrorObject, 'data.status');
  const googleMessage = _.get(newErrorObject, 'data.error_message');

  // Yelp error object.
  const yelpCode = _.get(newErrorObject, 'data.error.code');
  const yelpMessage = _.get(newErrorObject, 'data.error.description');

  let status;
  let description;

  // Re-assign error codes and messages.
  if (
    newErrorObject.isAxiosError
    && _.isUndefined(newErrorObject.status)
    && _.isUndefined(newErrorObject.data)
  ) {
    status = 'CONNECTION_REFUSED';
    description = convertToApiErrorMessage(status);
  } else if (googleCode) {
    status = googleCode;
    description = googleMessage || convertToApiErrorMessage(googleCode);
  } else if (yelpCode) {
    status = yelpCode;
    description = yelpMessage || convertToApiErrorMessage(yelpCode);
  } else {
    const is400Error = (newErrorObject.status === 400) ? 'BAD_REQUEST' : undefined;
    const is403Error = (newErrorObject.status === 403) ? 'FORBIDDEN' : undefined;
    const is404Error = (newErrorObject.status === 404) ? 'NOT_FOUND' : undefined;

    status = is400Error || is403Error || is404Error || 'UNKNOWN_ERROR';
    description = convertToApiErrorMessage(status);
  }

  return {
    status,
    description,
  };
}

/**
 * Convert Google/Yelp categories data to custom categories data.
 *
 * @param {GoogleCategories|YelpCategories} categories - Categories data from Google/Yelp.
 *
 * @returns {CategoriesServices} Array of categories.
 *
 * @since 1.0.0
 */
function convertToCategoriesData(categories) {
  let newCategories = [];

  // Pre-check.
  if (
    (!_.isArray(categories) || !_.every(categories, _.isString))
    && (!_.isArray(categories) || !_.every(categories, _.isPlainObject))
  ) {
    return newCategories;
  }

  // Filter categories (First Google, then Yelp).
  if (_.isArray(categories) && _.every(categories, _.isString)) {
    newCategories = _.filter(categories, (category) => [
      'bakery',
      'bar',
      'cafe',
      'night_club',
      'restaurant',
    ].includes(category));
  } else if (_.isArray(categories) && _.every(categories, _.isPlainObject)) {
    newCategories = categories;
  }

  return _.map(newCategories, (newCategory) => {
    let categoryTag;
    let categoryName;

    // Google "types".
    if (_.isString(newCategory)) {
      categoryTag = newCategory;
      categoryName = categoryTag
        .replace(/_/g, ' ')
        .replace(/(\w+)/g, (word) => word[0].toUpperCase() + word.substring(1));

      return {
        tag: categoryTag,
        name: categoryName,
      };
    }

    // Yelp "categories".
    if (_.isPlainObject(newCategory)) {
      categoryTag = _.get(newCategory, 'alias', 'unknown');
      categoryName = _.get(newCategory, 'title', 'Unknown');

      return {
        tag: categoryTag,
        name: categoryName,
      };
    }

    return undefined;
  });
}

/**
 * Convert URL to clean URL.
 *
 * @param {string} url - Non-converted URL.
 *
 * @returns {string} Clean URL.
 *
 * @since 1.0.0
 */
function convertToCleanUrl(url) {
  let newUrl = '';

  // Pre-check.
  if (_.isEmpty(url) || !_.isString(url)) {
    return newUrl;
  }

  newUrl = url;

  // Remove UTM tracking parameters and fix "?&".
  newUrl = newUrl.replace(/&?utm_(.*?)=[^&]+/g, '');
  newUrl = newUrl.replace(/\?&/g, '?');

  return newUrl;
}

/**
 * Convert phone number to E.164 phone number.
 *
 * @param {string} phoneNumber - Non-formatted phone number.
 *
 * @returns {string} E.164 phone number.
 *
 * @since 1.0.0
 */
function convertToE164PhoneNumber(phoneNumber) {
  let newPhoneNumber = '';

  // Pre-check.
  if (_.isEmpty(phoneNumber) || !_.isString(phoneNumber)) {
    return newPhoneNumber;
  }

  // Keep only first 14 digits.
  newPhoneNumber = phoneNumber.replace(/[\D]/g, '');
  newPhoneNumber = newPhoneNumber.slice(0, 14);

  return `+${newPhoneNumber}`;
}

/**
 * Convert two latitude/longitude coordinates to GPS distance.
 *
 * Haversine formula definitions:
 * Radius (R) - Earth's mean radius (meters).
 * Phi (φ)    - Latitude in radians.
 * Lambda (λ) - Longitude in radians.
 * Delta (Δ)  - The change in x.
 *
 * @param {number} latitude1  - Latitude for location 1.
 * @param {number} longitude1 - Longitude for location 1.
 * @param {number} latitude2  - Latitude for location 2.
 * @param {number} longitude2 - Longitude for location 2.
 *
 * @returns {number} Distance in meters.
 *
 * @since 1.0.0
 */
function convertToGpsDistance(latitude1, longitude1, latitude2, longitude2) {
  const R = 6371000;
  const phi1 = (latitude1 * Math.PI) / 180;
  const phi2 = (latitude2 * Math.PI) / 180;
  const deltaPhi = ((latitude2 - latitude1) * Math.PI) / 180;
  const deltaLambda = ((longitude2 - longitude1) * Math.PI) / 180;

  // sin²(Δφ/2) + cos φ1 * cos φ2 * sin²(Δλ/2).
  const aLat = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2);
  const aLng = Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const aPhi = Math.cos(phi1) * Math.cos(phi2);
  const a = (aLat + aLng) * aPhi;

  // 2 * atan2( √a, √(1−a) ).
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Convert Google/Yelp hours data to custom hours data.
 *
 * @param {GoogleHours|YelpHours} hours - Hours data from Google/Yelp.
 *
 * @returns {Hours} Custom hours data.
 *
 * @since 1.0.0
 */
function convertToHoursData(hours) {
  const newHours = {};
  const googleOpen = _.get(hours, 'open_now');
  const googleDays = _.get(hours, 'periods');
  const yelpOpen = _.get(hours, '[0].is_open_now');
  const yelpDays = _.get(hours, '[0].open');

  let openNow = false;
  let openDays = [];

  // Pre-check.
  if (
    (!_.isBoolean(googleOpen) || !_.isArray(googleDays) || !_.every(googleDays, _.isPlainObject))
    && (!_.isBoolean(yelpOpen) || !_.isArray(yelpDays) || !_.every(yelpDays, _.isPlainObject))
  ) {
    return newHours;
  }

  // Google hours.
  if (_.isBoolean(googleOpen) && _.isArray(googleDays) && _.every(googleDays, _.isPlainObject)) {
    openNow = googleOpen;

    // If business is 24/7, else regular schedule.
    if (
      _.get(googleDays, '[0].open.day') === 0
      && _.get(googleDays, '[0].open.time') === '0000'
      && _.get(googleDays, '[0].close') === undefined
    ) {
      for (let i = 0; i < 7; i += 1) {
        openDays.push({
          day: i,
          start: '0000',
          end: '0000',
          is_overnight: true,
        });
      }
    } else {
      googleDays.forEach((googleDay) => {
        const closeDay = _.get(googleDay, 'close.day');
        const closeTime = _.get(googleDay, 'close.time');
        const openDay = _.get(googleDay, 'open.day');
        const openTime = _.get(googleDay, 'open.time');

        // If less than 24 hours, else more than 24 hours.
        if (openDay === closeDay) {
          openDays.push({
            day: openDay,
            start: openTime,
            end: closeTime,
          });
        } else {
          const daysOpen = (closeDay > openDay) ? closeDay - openDay : (closeDay - openDay) + 7;
          const iteratee = (closeTime <= '0600') ? daysOpen - 1 : daysOpen;

          let currentDay = openDay;

          for (let i = 0; i <= iteratee; i += 1) {
            openDays.push({
              day: (currentDay >= 7) ? currentDay - 7 : currentDay,
              start: (i === 0) ? openTime : '0000',
              end: (i === iteratee) ? closeTime : '0000',
            });

            currentDay += 1;
          }
        }
      });

      // Add "is_overnight" information.
      openDays.forEach((openDay) => _.assign(openDay, { is_overnight: (openDay.end <= openDay.start) }));
    }
  }

  // Yelp hours.
  if (_.isBoolean(yelpOpen) && _.isArray(yelpDays) && _.every(yelpDays, _.isPlainObject)) {
    openNow = yelpOpen;
    openDays = _.map(yelpDays, (yelpDay) => {
      const isOvernight = _.get(yelpDay, 'is_overnight');
      const start = _.get(yelpDay, 'start');
      const end = _.get(yelpDay, 'end');
      const day = _.get(yelpDay, 'day');

      // Day of week is Sunday (0) to Saturday (6).
      const dayOfWeek = (day + 1 === 7) ? 0 : day + 1;

      return {
        day: dayOfWeek,
        start,
        end,
        is_overnight: isOvernight,
      };
    });
  }

  // Sort keys "day" and "start" by ascending.
  openDays = _.sortBy(openDays, ['day', 'start'], ['asc', 'asc']);

  // Set to "newHours".
  _.set(newHours, 'open_now', openNow);
  _.set(newHours, 'open_days', openDays);

  return newHours;
}

/**
 * Convert time to ISO 8601 date and time.
 *
 * @param {number|string} dateTime - Unix timestamp or RFC 2822/ISO 8601 date and time.
 *
 * @returns {string} ISO 8601 (in UTC time zone).
 *
 * @since 1.0.0
 */
function convertToIso8601DateTime(dateTime) {
  let newDateTime = '';

  // Pre-check.
  if (
    !_.isFinite(dateTime)
    && (_.isEmpty(dateTime) || !_.isString(dateTime))
  ) {
    return newDateTime;
  }

  // Google Unix timestamp (in UTC time zone).
  if (_.isFinite(dateTime)) {
    newDateTime = moment.unix(dateTime).utc().format('YYYY-MM-DD[T]HH:mm:ss[Z]');
  }

  // Yelp ISO 8601 (in PST time zone).
  if (!_.isEmpty(dateTime) && _.isString(dateTime)) {
    newDateTime = moment.tz(dateTime, 'America/Los_Angeles').utc().format('YYYY-MM-DD[T]HH:mm:ss[Z]');
  }

  return newDateTime;
}

/**
 * Convert Google/Yelp photos data to custom photos data.
 *
 * @param {GooglePhotos|YelpPhotos} photos - Photos data from Google/Yelp.
 *
 * @returns {Photos} Array of photos.
 *
 * @since 1.0.0
 */
function convertToPhotosData(photos) {
  let newPhotos = [];

  // Pre-check.
  if (
    (!_.isArray(photos) || !_.every(photos, _.isPlainObject))
    && (!_.isArray(photos) || !_.every(photos, _.isString))
  ) {
    return newPhotos;
  }

  // Google "photos".
  if (_.isArray(photos) && _.every(photos, _.isPlainObject)) {
    // TODO Photos limited to one only. Working on premium user privileges.
    const availablePhotos = photos.slice(0, 1);

    newPhotos = _.map(availablePhotos, (availablePhoto) => {
      const photoReference = _.get(availablePhoto, 'photo_reference');
      const width = _.get(availablePhoto, 'width');
      const height = _.get(availablePhoto, 'height');

      return {
        reference: photoReference,
        width,
        height,
      };
    });
  }

  // Yelp "photos".
  if (_.isArray(photos) && _.every(photos, _.isString)) {
    newPhotos = _.map(photos, (photo) => ({
      url: photo,
    }));
  }

  return newPhotos;
}

/**
 * Convert Yelp dollar signs to price level.
 *
 * @param {YelpDollars} dollars - Yelp dollar signs.
 *
 * @returns {number} Price level.
 *
 * @since 1.0.0
 */
function convertToPriceLevel(dollars) {
  let priceLevel;

  switch (dollars) {
    case '$':
      priceLevel = 1;
      break;
    case '$$':
      priceLevel = 2;
      break;
    case '$$$':
      priceLevel = 3;
      break;
    case '$$$$':
      priceLevel = 4;
      break;
    default:
      priceLevel = 0;
      break;
  }

  return priceLevel;
}

/**
 * Convert Google reviews data to custom reviews data.
 *
 * @param {GoogleReviews} reviews - Reviews data from Google.
 *
 * @returns {Reviews} Array of reviews.
 *
 * @since 1.0.0
 */
function convertToReviewsData(reviews) {
  let newReviews = [];

  // Pre-check.
  if (!_.isArray(reviews) || !_.every(reviews, _.isPlainObject)) {
    return newReviews;
  }

  // Google "reviews".
  if (_.isArray(reviews) && _.every(reviews, _.isPlainObject)) {
    newReviews = _.map(reviews, (review) => {
      const authorName = _.get(review, 'author_name');
      const profilePhotoUrl = _.get(review, 'profile_photo_url');
      const rating = _.get(review, 'rating');
      const text = _.get(review, 'text');
      const time = _.get(review, 'time');

      return {
        text,
        url: '',
        rating,
        time: convertToIso8601DateTime(time),
        user: {
          name: authorName,
          image_url: profilePhotoUrl,
        },
      };
    });
  }

  return newReviews;
}

/**
 * Convert Google/Yelp services data to custom services data.
 *
 * @param {GoogleServices|YelpServices} services - Services data from Google/Yelp.
 *
 * @returns {CategoriesServices} Array of services.
 *
 * @since 1.0.0
 */
function convertToServicesData(services) {
  let newServices = [];

  // Pre-check.
  if (!_.every(services, _.isString)) {
    return newServices;
  }

  // Return valid services.
  newServices = _.filter(services, (service) => [
    'meal_delivery',
    'meal_takeaway',
    'delivery',
    'pickup',
    'restaurant_reservation',
  ].includes(service));

  return _.map(newServices, (newService) => {
    let tagName;
    let serviceName;

    switch (newService) {
      case 'meal_delivery':
      case 'delivery':
        tagName = 'delivery';
        serviceName = 'Delivery';
        break;
      case 'meal_takeaway':
      case 'pickup':
        tagName = 'takeout';
        serviceName = 'Takeout';
        break;
      case 'restaurant_reservation':
        tagName = 'reservation';
        serviceName = 'Reservations';
        break;
      default:
        tagName = 'unknown';
        serviceName = 'Unknown';
        break;
    }

    return {
      tag: tagName,
      name: serviceName,
    };
  });
}

module.exports = {
  convertToAddressData,
  convertToApiErrorObject,
  convertToCategoriesData,
  convertToCleanUrl,
  convertToE164PhoneNumber,
  convertToGpsDistance,
  convertToHoursData,
  convertToIso8601DateTime,
  convertToPhotosData,
  convertToPriceLevel,
  convertToReviewsData,
  convertToServicesData,
};

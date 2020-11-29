const axios = require('axios').default;
const dotenv = require('dotenv');
const _ = require('lodash');

const {
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
} = require('./data-converter');

dotenv.config();

/**
 * Fetch Google Geocode.
 *
 * @param {string}             apiHandler - The API route handler.
 * @param {PayloadCoordinates} content    - Body content.
 *
 * @returns {FetchResponseGeocode} Fetch response.
 *
 * @since 1.0.0
 */
function fetchGoogleGeocode(apiHandler, content) {
  const { latitude, longitude } = content;

  return axios.get(
    'https://maps.googleapis.com/maps/api/geocode/json',
    {
      params: {
        latlng: `${latitude},${longitude}`,
        result_type: 'street_address',
        key: process.env.GOOGLE_API_KEY,
      },
    },
  )
    .then((response) => {
      const axiosStatus = _.get(response, 'statusText');
      const googleStatus = _.get(response, 'data.status');

      if (axiosStatus !== 'OK' || googleStatus !== 'OK') {
        throw response;
      }

      console.log(`${apiHandler} fetchGoogleGeocode`, response);

      return response.data;
    })
    .then((responseData) => {
      const theAddressComponents = _.get(responseData, 'results[0].address_components');

      // Re-map data provided by Google.
      const theAddress = _.transform(theAddressComponents, (result, theAddressComponent) => {
        const theOldTypes = _.get(theAddressComponent, 'types');
        const theNewTypes = _.without(theOldTypes, 'political', 'sublocality', 'administrative_area');
        const theLongName = _.get(theAddressComponent, 'long_name');

        _.assign(result, { [theNewTypes[0]]: theLongName });

        return result;
      }, {});

      // Keys used for reverse geo-decoding.
      const theModel = [
        'neighborhood',
        'sublocality_level_1',
        'locality',
        'administrative_area_level_1',
        'country',
      ];

      return _.pick(theAddress, theModel);
    })
    .catch((error) => {
      console.error(`${apiHandler} fetchGoogleGeocode`, error);

      throw convertToApiErrorObject(error);
    });
}

/**
 * Fetch Google Places details.
 *
 * @param {string}         apiHandler - The API route handler.
 * @param {PayloadDetails} content    - Body content.
 *
 * @returns {FetchResponseDetails} Fetch response.
 *
 * @since 1.0.0
 */
function fetchGooglePlacesDetails(apiHandler, content) {
  const { id, latitude, longitude } = content;

  return axios.get(
    'https://maps.googleapis.com/maps/api/place/details/json',
    {
      params: {
        place_id: id,
        key: process.env.GOOGLE_API_KEY,
      },
    },
  )
    .then((response) => {
      const axiosStatus = _.get(response, 'statusText');
      const googleStatus = _.get(response, 'data.status');

      if (axiosStatus !== 'OK' || googleStatus !== 'OK') {
        throw response;
      }

      console.log(`${apiHandler} fetchGooglePlacesDetails`, response);

      return response.data;
    })
    .then((responseData) => {
      const theResult = _.get(responseData, 'result', {});
      const theFormattedAddress = _.get(theResult, 'formatted_address', '');
      const theFormattedPhoneNumber = _.get(theResult, 'formatted_phone_number', '');
      const theGeometryLocationLat = _.get(theResult, 'geometry.location.lat', 0);
      const theGeometryLocationLng = _.get(theResult, 'geometry.location.lng', 0);
      const theInternationalPhoneNumber = _.get(theResult, 'international_phone_number', '');
      const theName = _.get(theResult, 'name', '');
      const theOpeningHours = _.get(theResult, 'opening_hours', {});
      const thePhotos = _.get(theResult, 'photos', []);
      const thePlaceId = _.get(theResult, 'place_id', '');
      const thePriceLevel = _.get(theResult, 'price_level', 0);
      const theRating = _.get(theResult, 'rating', 1.0);
      const theReviews = _.get(theResult, 'reviews', []);
      const theTypes = _.get(theResult, 'types', []);
      const theUrl = _.get(theResult, 'url', '');
      const theUserRatingsTotal = _.get(theResult, 'user_ratings_total', 0);

      // Re-map data provided by Google.
      return {
        source: 'google',
        id: thePlaceId,
        name: theName,
        price: thePriceLevel,
        rating: theRating,
        review_count: theUserRatingsTotal,
        categories: convertToCategoriesData(theTypes),
        services: convertToServicesData(theTypes),
        address: convertToAddressData(theFormattedAddress),
        coordinates: {
          latitude: theGeometryLocationLat,
          longitude: theGeometryLocationLng,
        },
        distance: convertToGpsDistance(latitude, longitude, theGeometryLocationLat, theGeometryLocationLng),
        url: theUrl,
        phone: {
          display: theFormattedPhoneNumber,
          raw: convertToE164PhoneNumber(theInternationalPhoneNumber),
        },
        hours: convertToHoursData(theOpeningHours),
        photos: convertToPhotosData(thePhotos),
        reviews: convertToReviewsData(theReviews),
      };
    })
    .catch((error) => {
      console.error(`${apiHandler} fetchGooglePlacesDetails`, error);

      throw convertToApiErrorObject(error);
    });
}

/**
 * Fetch Google Places photo.
 *
 * @param {string}       apiHandler - The API route handler.
 * @param {PayloadPhoto} content    - Body content.
 *
 * @returns {FetchResponsePhoto} Fetch response.
 *
 * @since 1.0.0
 */
function fetchGooglePlacesPhoto(apiHandler, content) {
  const { reference } = content;
  const maxWidth = content.max_width;
  const maxHeight = content.max_height;

  return axios.get(
    'https://maps.googleapis.com/maps/api/place/photo',
    {
      params: {
        photoreference: reference,
        maxwidth: maxWidth,
        maxheight: maxHeight,
        key: process.env.GOOGLE_API_KEY,
      },
      responseType: 'arraybuffer',
    },
  )
    .then((response) => {
      const axiosStatus = _.get(response, 'statusText');

      if (axiosStatus !== 'OK') {
        throw response;
      }

      console.log(`${apiHandler} fetchGooglePlacesPhoto`, response);

      return response;
    })
    .then((responseData) => {
      const contentType = responseData.headers['content-type'].toLowerCase();
      const base64 = Buffer.from(responseData.data, 'binary').toString('base64');
      const dataUrl = `data:${contentType};base64,${base64}`;

      return {
        data_url: dataUrl,
      };
    })
    .catch((error) => {
      console.error(`${apiHandler} fetchGooglePlacesPhoto`, error);

      throw convertToApiErrorObject(error);
    });
}

/**
 * Fetch Google Places search.
 *
 * @param {string}        apiHandler - The API route handler.
 * @param {PayloadSearch} content    - Body content.
 *
 * @returns {FetchResponseSearch} Fetch response.
 *
 * @since 1.0.0
 */
function fetchGooglePlacesSearch(apiHandler, content) {
  const {
    term,
    latitude,
    longitude,
    category,
    sort,
    price,
  } = content;
  const minRating = content.min_rating;
  const openNow = content.open_now;

  return axios.get(
    'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
    {
      params: {
        location: `${latitude},${longitude}`,
        type: _.first(category),
        keyword: term,
        ...(openNow) ? { opennow: '' } : {}, // Key cannot be null or undefined.
        minprice: _.first(_.sortBy(price)),
        maxprice: _.last(_.sortBy(price)),
        rankby: 'distance',
        key: process.env.GOOGLE_API_KEY,
      },
    },
  )
    .then((response) => {
      const axiosStatus = _.get(response, 'statusText');
      const googleStatus = _.get(response, 'data.status');

      if (axiosStatus !== 'OK' || googleStatus !== 'OK') {
        throw response;
      }

      console.log(`${apiHandler} fetchGooglePlacesSearch`, response);

      return response.data;
    })
    .then((responseData) => {
      const theResults = _.get(responseData, 'results', []);
      const theFilteredResults = _.filter(theResults, (result) => result.rating >= minRating);

      // Re-map data provided by Google.
      const theNewResults = _.map(theFilteredResults, (theFilteredResult) => {
        const theGeometryLocationLat = _.get(theFilteredResult, 'geometry.location.lat', 0);
        const theGeometryLocationLng = _.get(theFilteredResult, 'geometry.location.lng', 0);
        const theName = _.get(theFilteredResult, 'name', '');
        const thePlaceId = _.get(theFilteredResult, 'place_id', '');
        const thePriceLevel = _.get(theFilteredResult, 'price_level', 0);
        const theRating = _.get(theFilteredResult, 'rating', 1.0);
        const theUserRatingsTotal = _.get(theFilteredResult, 'user_ratings_total', 0);

        return {
          source: 'google',
          id: thePlaceId,
          name: theName,
          price: thePriceLevel,
          rating: theRating,
          review_count: theUserRatingsTotal,
          distance: convertToGpsDistance(latitude, longitude, theGeometryLocationLat, theGeometryLocationLng),
        };
      });

      // Sort then return.
      switch (sort) {
        case 'most_reviewed':
          return _.orderBy(theNewResults, ['review_count'], ['desc']);
        case 'least_expensive':
          return _.orderBy(theNewResults, ['price', 'distance'], ['asc', 'asc']);
        case 'distance':
        default:
          return _.orderBy(theNewResults, ['distance'], ['asc']);
      }
    })
    .catch((error) => {
      console.error(`${apiHandler} fetchGooglePlacesSearch`, error);

      throw convertToApiErrorObject(error);
    });
}

/**
 * Fetch Yelp Fusion details.
 *
 * @param {string}         apiHandler - The API route handler.
 * @param {PayloadDetails} content    - Body content.
 *
 * @returns {FetchResponseDetails} Fetch response.
 *
 * @since 1.0.0
 */
function fetchYelpFusionDetails(apiHandler, content) {
  const { id, latitude, longitude } = content;

  return axios.get(
    `https://api.yelp.com/v3/businesses/${id}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.YELP_API_KEY}`,
      },
    },
  )
    .then((response) => {
      const axiosStatus = _.get(response, 'statusText');
      const yelpError = _.get(response, 'data.error');

      if (axiosStatus !== 'OK' || yelpError !== undefined) {
        throw response;
      }

      console.log(`${apiHandler} fetchYelpFusionDetails`, response);

      return response.data;
    })
    .then((responseData) => {
      const theId = _.get(responseData, 'id', '');
      const theName = _.get(responseData, 'name', '');
      const theUrl = _.get(responseData, 'url', '');
      const thePhone = _.get(responseData, 'phone', '');
      const theDisplayPhone = _.get(responseData, 'display_phone', '');
      const theReviewCount = _.get(responseData, 'review_count', 0);
      const theCategories = _.get(responseData, 'categories', []);
      const theRating = _.get(responseData, 'rating', 1.0);
      const theLocationDisplayAddress = _.get(responseData, 'location.display_address', []);
      const theCoordinatesLatitude = _.get(responseData, 'coordinates.latitude', 0.0);
      const theCoordinatesLongitude = _.get(responseData, 'coordinates.longitude', 0.0);
      const thePhotos = _.get(responseData, 'photos', []);
      const thePrice = _.get(responseData, 'price', '');
      const theHours = _.get(responseData, 'hours', []);
      const theTransactions = _.get(responseData, 'transactions', []);

      // Re-map data provided by Yelp.
      return {
        source: 'yelp',
        id: theId,
        name: theName,
        price: convertToPriceLevel(thePrice),
        rating: theRating,
        review_count: theReviewCount,
        categories: convertToCategoriesData(theCategories),
        services: convertToServicesData(theTransactions),
        address: convertToAddressData(theLocationDisplayAddress),
        coordinates: {
          latitude: theCoordinatesLatitude,
          longitude: theCoordinatesLongitude,
        },
        distance: convertToGpsDistance(latitude, longitude, theCoordinatesLatitude, theCoordinatesLongitude),
        url: convertToCleanUrl(theUrl),
        phone: {
          display: theDisplayPhone,
          raw: thePhone,
        },
        hours: convertToHoursData(theHours),
        photos: convertToPhotosData(thePhotos),
        reviews: [],
      };
    })
    .catch((error) => {
      console.error(`${apiHandler} fetchYelpFusionDetails`, error);

      throw convertToApiErrorObject(error);
    });
}

/**
 * Fetch Yelp Fusion reviews.
 *
 * @param {string}         apiHandler - The API route handler.
 * @param {PayloadReviews} content    - Body content.
 *
 * @returns {FetchResponseReviews} Fetch response.
 *
 * @since 1.0.0
 */
function fetchYelpFusionReviews(apiHandler, content) {
  const { id } = content;

  return axios.get(
    `https://api.yelp.com/v3/businesses/${id}/reviews`,
    {
      headers: {
        Authorization: `Bearer ${process.env.YELP_API_KEY}`,
      },
    },
  )
    .then((response) => {
      const axiosStatus = _.get(response, 'statusText');
      const yelpError = _.get(response, 'data.error');

      if (axiosStatus !== 'OK' || yelpError !== undefined) {
        throw response;
      }

      console.log(`${apiHandler} fetchYelpFusionReviews`, response);

      return response.data;
    })
    .then((responseData) => {
      const theReviews = _.get(responseData, 'reviews', []);
      const theNewReviews = _.map(theReviews, (theReview) => {
        const url = _.get(theReview, 'url', '');
        const text = _.get(theReview, 'text', '');
        const rating = _.get(theReview, 'rating', 0);
        const timeCreated = _.get(theReview, 'time_created', '');
        const userImageUrl = _.get(theReview, 'user.image_url', '');
        const userName = _.get(theReview, 'user.name', '');

        return {
          text,
          url: convertToCleanUrl(url),
          rating,
          time: convertToIso8601DateTime(timeCreated),
          user: {
            name: userName,
            image_url: userImageUrl,
          },
        };
      });

      return {
        reviews: theNewReviews,
      };
    })
    .catch((error) => {
      console.error(`${apiHandler} fetchYelpFusionReviews`, error);

      throw convertToApiErrorObject(error);
    });
}

/**
 * Fetch Yelp Fusion search.
 *
 * @param {string}        apiHandler - The API route handler.
 * @param {PayloadSearch} content    - Body content.
 *
 * @returns {FetchResponseSearch} Fetch response.
 *
 * @since 1.0.0
 */
function fetchYelpFusionSearch(apiHandler, content) {
  const {
    term,
    latitude,
    longitude,
    category,
    sort,
    price,
  } = content;
  const minRating = content.min_rating;
  const openNow = content.open_now;

  return axios.get(
    'https://api.yelp.com/v3/businesses/search',
    {
      headers: {
        Authorization: `Bearer ${process.env.YELP_API_KEY}`,
      },
      params: {
        term,
        latitude,
        longitude,
        categories: category.join(),
        price: _.sortBy(price).join(),
        open_now: openNow,
      },
    },
  )
    .then((response) => {
      const axiosStatus = _.get(response, 'statusText');
      const yelpError = _.get(response, 'data.error');

      if (axiosStatus !== 'OK' || yelpError !== undefined) {
        throw response;
      }

      console.log(`${apiHandler} fetchYelpFusionSearch`, response);

      return response.data;
    })
    .then((responseData) => {
      const theBusinesses = _.get(responseData, 'businesses', []);
      const theFilteredBusinesses = _.filter(theBusinesses, (result) => result.rating >= minRating);

      // Re-map data provided by Yelp.
      const theNewBusinesses = _.map(theFilteredBusinesses, (theFilteredBusiness) => {
        const theId = _.get(theFilteredBusiness, 'id', '');
        const theName = _.get(theFilteredBusiness, 'name', '');
        const theReviewCount = _.get(theFilteredBusiness, 'review_count', 0);
        const theRating = _.get(theFilteredBusiness, 'rating', 1.0);
        const theCoordinatesLatitude = _.get(theFilteredBusiness, 'coordinates.latitude', 0.0);
        const theCoordinatesLongitude = _.get(theFilteredBusiness, 'coordinates.longitude', 0.0);
        const thePrice = _.get(theFilteredBusiness, 'price', '');

        return {
          source: 'yelp',
          id: theId,
          name: theName,
          price: convertToPriceLevel(thePrice),
          rating: theRating,
          review_count: theReviewCount,
          distance: convertToGpsDistance(latitude, longitude, theCoordinatesLatitude, theCoordinatesLongitude),
        };
      });

      // Sort then return.
      switch (sort) {
        case 'most_reviewed':
          return _.orderBy(theNewBusinesses, ['review_count'], ['desc']);
        case 'least_expensive':
          return _.orderBy(theNewBusinesses, ['price', 'distance'], ['asc', 'asc']);
        case 'distance':
        default:
          return _.orderBy(theNewBusinesses, ['distance'], ['asc']);
      }
    })
    .catch((error) => {
      console.error(`${apiHandler} fetchYelpFusionSearch`, error);

      throw convertToApiErrorObject(error);
    });
}

module.exports = {
  fetchGoogleGeocode,
  fetchGooglePlacesDetails,
  fetchGooglePlacesPhoto,
  fetchGooglePlacesSearch,
  fetchYelpFusionDetails,
  fetchYelpFusionReviews,
  fetchYelpFusionSearch,
};

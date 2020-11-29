const { fetchGooglePlacesSearch, fetchGooglePlacesDetails, fetchGooglePlacesPhoto } = require('../lib/fetch-api');
const { successResponse, failedResponse } = require('../lib/response-template');
const {
  checkForCoordinates,
  checkForSearch,
  checkForDetails,
  checkForPhoto,
  checkIfEmptyOrInvalid,
  checkIfMalicious,
} = require('../lib/verification');

/**
 * /places route.
 *
 * @param {module:claudia-api-builder.ApiBuilder} api - Claudia API Builder instance.
 *
 * @since 1.0.0
 */
module.exports = (api) => {
  /**
   * /places/search route handler.
   *
   * @since 1.0.0
   */
  api.post('/places/search', async (request) => {
    const { body } = request;

    try {
      const parsedBody = JSON.parse(body);
      const validBody = checkIfEmptyOrInvalid('/places/search', parsedBody);
      const cleanBody = checkIfMalicious('/places/search', validBody);
      const coordinateBody = checkForCoordinates('/places/search', cleanBody);
      const verifiedBody = checkForSearch('/places/search', coordinateBody);
      const fetchResult = await fetchGooglePlacesSearch('/places/search', verifiedBody);

      return successResponse('/places/search', 'PLACES_SEARCH', fetchResult);
    } catch (error) {
      return failedResponse('/places/search', 'PLACES_SEARCH', error);
    }
  }, {
    apiKeyRequired: true,
    customAuthorizer: 'defaultAuth',
  });

  /**
   * /places/details route handler.
   *
   * @since 1.0.0
   */
  api.post('/places/details', async (request) => {
    const { body } = request;

    try {
      const parsedBody = JSON.parse(body);
      const validBody = checkIfEmptyOrInvalid('/places/details', parsedBody);
      const cleanBody = checkIfMalicious('/places/details', validBody);
      const coordinateBody = checkForCoordinates('/places/details', cleanBody);
      const verifiedBody = checkForDetails('/places/details', coordinateBody);
      const fetchResult = await fetchGooglePlacesDetails('/places/details', verifiedBody);

      return successResponse('/places/details', 'PLACES_DETAILS', fetchResult);
    } catch (error) {
      return failedResponse('/places/details', 'PLACES_DETAILS', error);
    }
  }, {
    apiKeyRequired: true,
    customAuthorizer: 'defaultAuth',
  });

  /**
   * /places/photo route handler.
   *
   * @since 1.0.0
   */
  api.post('/places/photo', async (request) => {
    const { body } = request;

    try {
      const parsedBody = JSON.parse(body);
      const validBody = checkIfEmptyOrInvalid('/places/photo', parsedBody);
      const cleanBody = checkIfMalicious('/places/photo', validBody);
      const verifiedBody = checkForPhoto('/places/photo', cleanBody);
      const fetchResult = await fetchGooglePlacesPhoto('/places/photo', verifiedBody);

      return successResponse('/places/photo', 'PLACES_PHOTO', fetchResult);
    } catch (error) {
      return failedResponse('/places/photo', 'PLACES_PHOTO', error);
    }
  }, {
    apiKeyRequired: true,
    customAuthorizer: 'defaultAuth',
  });
};

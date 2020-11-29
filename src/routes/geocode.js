const { fetchGoogleGeocode } = require('../lib/fetch-api');
const { successResponse, failedResponse } = require('../lib/response-template');
const { checkForCoordinates, checkIfEmptyOrInvalid, checkIfMalicious } = require('../lib/verification');

/**
 * /geocode route.
 *
 * @param {module:claudia-api-builder.ApiBuilder} api - Claudia API Builder instance.
 *
 * @since 1.0.0
 */
module.exports = (api) => {
  /**
   * /geocode/locate route handler.
   *
   * @since 1.0.0
   */
  api.post('/geocode/locate', async (request) => {
    const { body } = request;

    try {
      const parsedBody = JSON.parse(body);
      const validBody = checkIfEmptyOrInvalid('/geocode/locate', parsedBody);
      const cleanBody = checkIfMalicious('/geocode/locate', validBody);
      const verifiedBody = checkForCoordinates('/geocode/locate', cleanBody);
      const fetchResult = await fetchGoogleGeocode('/geocode/locate', verifiedBody);

      return successResponse('/geocode/locate', 'GEOCODE_LOCATE', fetchResult);
    } catch (error) {
      return failedResponse('/geocode/locate', 'GEOCODE_LOCATE', error);
    }
  }, {
    apiKeyRequired: true,
    customAuthorizer: 'defaultAuth',
  });
};

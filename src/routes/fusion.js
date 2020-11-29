const { fetchYelpFusionSearch, fetchYelpFusionDetails, fetchYelpFusionReviews } = require('../lib/fetch-api');
const { successResponse, failedResponse } = require('../lib/response-template');
const {
  checkForCoordinates,
  checkForSearch,
  checkForDetails,
  checkForReviews,
  checkIfEmptyOrInvalid,
  checkIfMalicious,
} = require('../lib/verification');

/**
 * /fusion route.
 *
 * @param {module:claudia-api-builder.ApiBuilder} api - Claudia API Builder instance.
 *
 * @since 1.0.0
 */
module.exports = (api) => {
  /**
   * /fusion/search route handler.
   *
   * @since 1.0.0
   */
  api.post('/fusion/search', async (request) => {
    const { body } = request;

    try {
      const parsedBody = JSON.parse(body);
      const validBody = checkIfEmptyOrInvalid('/fusion/search', parsedBody);
      const cleanBody = checkIfMalicious('/fusion/search', validBody);
      const coordinateBody = checkForCoordinates('/fusion/search', cleanBody);
      const verifiedBody = checkForSearch('/fusion/search', coordinateBody);
      const fetchResult = await fetchYelpFusionSearch('/fusion/search', verifiedBody);

      return successResponse('/fusion/search', 'FUSION_SEARCH', fetchResult);
    } catch (error) {
      return failedResponse('/fusion/search', 'FUSION_SEARCH', error);
    }
  }, {
    apiKeyRequired: true,
    customAuthorizer: 'defaultAuth',
  });

  /**
   * /fusion/details route handler.
   *
   * @since 1.0.0
   */
  api.post('/fusion/details', async (request) => {
    const { body } = request;

    try {
      const parsedBody = JSON.parse(body);
      const validBody = checkIfEmptyOrInvalid('/fusion/details', parsedBody);
      const cleanBody = checkIfMalicious('/fusion/details', validBody);
      const coordinateBody = checkForCoordinates('/fusion/details', cleanBody);
      const verifiedBody = checkForDetails('/fusion/details', coordinateBody);
      const fetchResult = await fetchYelpFusionDetails('/fusion/details', verifiedBody);

      return successResponse('/fusion/details', 'FUSION_DETAILS', fetchResult);
    } catch (error) {
      return failedResponse('/fusion/details', 'FUSION_DETAILS', error);
    }
  }, {
    apiKeyRequired: true,
    customAuthorizer: 'defaultAuth',
  });

  /**
   * /fusion/reviews route handler.
   *
   * @since 1.0.0
   */
  api.post('/fusion/reviews', async (request) => {
    const { body } = request;

    try {
      const parsedBody = JSON.parse(body);
      const validBody = checkIfEmptyOrInvalid('/fusion/reviews', parsedBody);
      const cleanBody = checkIfMalicious('/fusion/reviews', validBody);
      const verifiedBody = checkForReviews('/fusion/reviews', cleanBody);
      const fetchResult = await fetchYelpFusionReviews('/fusion/reviews', verifiedBody);

      return successResponse('/fusion/reviews', 'FUSION_REVIEWS', fetchResult);
    } catch (error) {
      return failedResponse('/fusion/reviews', 'FUSION_REVIEWS', error);
    }
  }, {
    apiKeyRequired: true,
    customAuthorizer: 'defaultAuth',
  });
};

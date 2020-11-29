const { successResponse, failedResponse } = require('../lib/response-template');
const { signToken } = require('../lib/token');
const { checkForAuth, checkIfEmptyOrInvalid, checkIfMalicious } = require('../lib/verification');

/**
 * /auth route.
 *
 * @param {module:claudia-api-builder.ApiBuilder} api - Claudia API Builder instance.
 *
 * @since 1.0.0
 */
module.exports = (api) => {
  /**
   * /auth/session route handler.
   *
   * @since 1.0.0
   */
  api.post('/auth/session', (request) => {
    const { body, context } = request;
    const { sourceIp, userAgent } = context;

    try {
      const parsedBody = JSON.parse(body);
      const validBody = checkIfEmptyOrInvalid('/auth/session', parsedBody);
      const cleanBody = checkIfMalicious('/auth/session', validBody);
      const verifiedBody = checkForAuth('/auth/session', cleanBody);

      return successResponse('/auth/session', 'AUTHORIZATION', {
        token: signToken(verifiedBody, sourceIp, userAgent),
      });
    } catch (error) {
      return failedResponse('/auth/session', 'AUTHORIZATION', error);
    }
  }, {
    apiKeyRequired: true,
  });
};

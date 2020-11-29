const _ = require('lodash');

/**
 * CORS configuration.
 *
 * @param {module:claudia-api-builder.ApiBuilder} api - Claudia API Builder instance.
 *
 * @since 1.0.0
 */
module.exports = (api) => {
  /**
   * Set "Access-Control-Allow-Headers" header.
   *
   * @since 1.0.0
   */
  api.corsHeaders('Authorization,X-Api-Key');

  /**
   * Set "Access-Control-Max-Age" header.
   *
   * @since 1.0.0
   */
  api.corsMaxAge(600);

  /**
   * Set "Access-Control-Allow-Origin" header.
   *
   * @since 1.0.0
   */
  api.corsOrigin((request) => {
    const expectedOrigin = /foodflare.app$/;
    const origin = _.get(request, 'normalizedHeaders.origin');

    if (expectedOrigin.test(origin)) {
      return origin;
    }

    return '';
  });
};

const dotenv = require('dotenv');

dotenv.config();

/**
 * Authorizer.
 *
 * @param {module:claudia-api-builder.ApiBuilder} api - Claudia API Builder instance.
 *
 * @since 1.0.0
 */
module.exports = (api) => {
  /**
   * Register authorizer.
   *
   * @since 1.0.0
   */
  api.registerAuthorizer('defaultAuth', {
    lambdaName: 'foodflareAuth',
    lambdaVersion: true,
    headerName: 'Authorization',
    resultTtl: Number(process.env.AUTHORIZER_TTL),
    type: 'TOKEN',
  });
};

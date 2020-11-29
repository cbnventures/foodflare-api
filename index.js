const ApiBuilder = require('claudia-api-builder');
const Authorizer = require('./src/config/authorizer');
const Cors = require('./src/config/cors');
const GatewayResponses = require('./src/config/gateway-responses');
const Auth = require('./src/routes/auth');
const Fusion = require('./src/routes/fusion');
const Geocode = require('./src/routes/geocode');
const Places = require('./src/routes/places');

/**
 * ApiBuilder instance.
 *
 * @type {module:claudia-api-builder.ApiBuilder}
 *
 * @since 1.0.0
 */
const api = new ApiBuilder({
  requestFormat: 'CLAUDIA_API_BUILDER',
});

module.exports = api;

/**
 * ApiBuilder Configuration.
 *
 * @since 1.0.0
 */
Authorizer(api);
Cors(api);
GatewayResponses(api);

/**
 * API Routes.
 *
 * @since 1.0.0
 */
Auth(api);
Fusion(api);
Geocode(api);
Places(api);

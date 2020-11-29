/**
 * Gateway responses.
 *
 * @param {module:claudia-api-builder.ApiBuilder} api - Claudia API Builder instance.
 *
 * @since 1.0.0
 */
module.exports = (api) => {
  /**
   * Default gateway configuration.
   *
   * @since 1.0.0
   */
  const gatewayConfiguration = {
    headers: {
      'Content-Type': 'application/json',
    },
    responseTemplates: {
      'application/json': JSON.stringify({
        action: 'API_GATEWAY',
        success: false,
        info: {
          status: '$context.error.responseType',
          description: '$context.error.message',
        },
      }),
    },
    defaultResponse: true,
  };

  /**
   * Set gateway responses.
   *
   * @since 1.0.0
   */
  api.setGatewayResponse('ACCESS_DENIED', gatewayConfiguration);
  api.setGatewayResponse('API_CONFIGURATION_ERROR', gatewayConfiguration);
  api.setGatewayResponse('AUTHORIZER_CONFIGURATION_ERROR', gatewayConfiguration);
  api.setGatewayResponse('AUTHORIZER_FAILURE', gatewayConfiguration);
  api.setGatewayResponse('BAD_REQUEST_PARAMETERS', gatewayConfiguration);
  api.setGatewayResponse('BAD_REQUEST_BODY', gatewayConfiguration);
  api.setGatewayResponse('DEFAULT_4XX', gatewayConfiguration);
  api.setGatewayResponse('DEFAULT_5XX', gatewayConfiguration);
  api.setGatewayResponse('EXPIRED_TOKEN', gatewayConfiguration);
  api.setGatewayResponse('INTEGRATION_FAILURE', gatewayConfiguration);
  api.setGatewayResponse('INTEGRATION_TIMEOUT', gatewayConfiguration);
  api.setGatewayResponse('INVALID_API_KEY', gatewayConfiguration);
  api.setGatewayResponse('INVALID_SIGNATURE', gatewayConfiguration);
  api.setGatewayResponse('MISSING_AUTHENTICATION_TOKEN', gatewayConfiguration);
  api.setGatewayResponse('QUOTA_EXCEEDED', gatewayConfiguration);
  api.setGatewayResponse('REQUEST_TOO_LARGE', gatewayConfiguration);
  api.setGatewayResponse('RESOURCE_NOT_FOUND', gatewayConfiguration);
  api.setGatewayResponse('THROTTLED', gatewayConfiguration);
  api.setGatewayResponse('UNAUTHORIZED', gatewayConfiguration);
  api.setGatewayResponse('UNSUPPORTED_MEDIA_TYPE', gatewayConfiguration);
  api.setGatewayResponse('WAF_FILTERED', gatewayConfiguration);
};

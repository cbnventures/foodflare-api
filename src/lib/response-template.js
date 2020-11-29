const _ = require('lodash');

const { ApiResponse } = require('claudia-api-builder');

/**
 * Response.
 *
 * @param {string}                      action   - Type of action.
 * @param {number}                      httpCode - HTTP response status code.
 * @param {FetchResponse|ErrorResponse} content  - Response content.
 *
 * @returns {module:claudia-api-builder.ApiResponse} A configured response.
 *
 * @since 1.0.0
 */
function response(action, httpCode, content) {
  const responseObject = {
    action,
    success: (httpCode < 400),
    info: content,
  };

  return new ApiResponse(responseObject, {}, httpCode);
}

/**
 * Success response.
 *
 * @param {string}        apiHandler     - The API route handler.
 * @param {string}        action         - Type of action.
 * @param {FetchResponse} successContent - Success content.
 *
 * @returns {module:claudia-api-builder.ApiResponse} A configured response.
 *
 * @since 1.0.0
 */
function successResponse(apiHandler, action, successContent) {
  console.log(`${apiHandler} successResponse`, successContent);

  return response(action, 200, successContent);
}

/**
 * Failed response.
 *
 * @param {string}        apiHandler   - The API route handler.
 * @param {string}        action       - Type of action.
 * @param {ErrorResponse} errorContent - Error content.
 *
 * @returns {module:claudia-api-builder.ApiResponse} A configured response.
 *
 * @since 1.0.0
 */
function failedResponse(apiHandler, action, errorContent) {
  let status;
  let description;

  // Re-format Node.js error object.
  if (_.isError(errorContent)) {
    if (errorContent.name === 'Error') {
      status = 'SYSTEM_ERROR';
    } else {
      status = errorContent.name.replace(/^(.+)(Error)$/, '$1_$2').toUpperCase();
    }

    description = errorContent.message;
  } else {
    status = errorContent.status;
    description = errorContent.description;
  }

  console.error(`${apiHandler} failedResponse`, {
    status,
    description,
  });

  return response(action, 400, {
    status,
    description,
  });
}

module.exports = {
  successResponse,
  failedResponse,
};

const _ = require('lodash');

/**
 * Check body for "auth" content.
 *
 * @param {string}  apiHandler - The API route handler.
 * @param {Payload} content    - Payload content.
 *
 * @returns {Payload} Payload content.
 *
 * @since 1.0.0
 */
function checkForAuth(apiHandler, content) {
  const { type } = content;

  console.log(`${apiHandler} checkForAuth`, content);

  if (type.match(/^(web|app)$/) === null) {
    throw new SyntaxError('The "type" key does not match expression');
  }

  return content;
}

/**
 * Check body for "coordinates" content.
 *
 * @param {string}  apiHandler - The API route handler.
 * @param {Payload} content    - Payload content.
 *
 * @returns {Payload} Payload content.
 *
 * @since 1.0.0
 */
function checkForCoordinates(apiHandler, content) {
  const { latitude, longitude } = content;

  console.log(`${apiHandler} checkForCoordinates`, content);

  if (!_.isFinite(latitude)) {
    throw new SyntaxError('The "latitude" key is not a finite number');
  }

  if (!_.isFinite(longitude)) {
    throw new SyntaxError('The "longitude" key is not a finite number');
  }

  if (
    latitude < -90
    || latitude > 90
    || longitude < -180
    || longitude > 180
  ) {
    throw new SyntaxError('The "latitude" or "longitude" key has exceeded the allowed value');
  }

  return content;
}

/**
 * Check body for "details" content.
 *
 * @param {string}  apiHandler - The API route handler.
 * @param {Payload} content    - Payload content.
 *
 * @returns {Payload} Payload content.
 *
 * @since 1.0.0
 */
function checkForDetails(apiHandler, content) {
  const { id } = content;

  console.log(`${apiHandler} checkForDetails`, content);

  if (_.isEmpty(id) || !_.isString(id)) {
    throw new SyntaxError('The "id" key is empty or not a string');
  }

  return content;
}

/**
 * Check body for "photo" content.
 *
 * @param {string}  apiHandler - The API route handler.
 * @param {Payload} content    - Payload content.
 *
 * @returns {Payload} Payload content.
 *
 * @since 1.0.0
 */
function checkForPhoto(apiHandler, content) {
  const { reference } = content;
  const maxWidth = content.max_width;
  const maxHeight = content.max_height;

  console.log(`${apiHandler} checkForPhoto`, content);

  if (_.isEmpty(reference) || !_.isString(reference)) {
    throw new SyntaxError('The "reference" key is empty or not a string');
  }

  if (!_.isFinite(maxWidth)) {
    throw new SyntaxError('The "max_width" key is not a number');
  }

  if (!_.isFinite(maxHeight)) {
    throw new SyntaxError('The "max_height" key is not a number');
  }

  return content;
}

/**
 * Check body for "reviews" content.
 *
 * @param {string}  apiHandler - The API route handler.
 * @param {Payload} content    - Payload content.
 *
 * @returns {Payload} Payload content.
 *
 * @since 1.0.0
 */
function checkForReviews(apiHandler, content) {
  const { id } = content;

  console.log(`${apiHandler} checkForReviews`, content);

  if (_.isEmpty(id) || !_.isString(id)) {
    throw new SyntaxError('The "id" key is empty or not a string');
  }

  return content;
}

/**
 * Check body for "search" content.
 *
 * @param {string}  apiHandler - The API route handler.
 * @param {Payload} content    - Payload content.
 *
 * @returns {Payload} Payload content.
 *
 * @since 1.0.0
 */
function checkForSearch(apiHandler, content) {
  const {
    term,
    category,
    sort,
    price,
  } = content;
  const minRating = content.min_rating;
  const openNow = content.open_now;

  console.log(`${apiHandler} checkForSearch`, content);

  if (_.isEmpty(term) || !_.isString(term)) {
    throw new SyntaxError('The "term" key is empty or not a string');
  }

  if (!_.isArray(category)
    || !_.every(category, _.isString)
    || _.some(category, _.isEmpty)
    || _.size(category) < 1
  ) {
    throw new SyntaxError('The "category" key is not a string[] or wrong size');
  }

  if (sort.match(/^(distance|least_expensive|most_reviewed)$/) === null) {
    throw new SyntaxError('The "sort" key does not match expression');
  }

  if (
    !_.isArray(price)
    || !_.every(price, _.isFinite)
    || _.size(price) < 1
    || _.size(price) > 4
  ) {
    throw new SyntaxError('The "price" key is not a finite number[] or wrong size');
  }

  if (!_.isFinite(minRating)) {
    throw new SyntaxError('The "min_rating" key is not a number');
  }

  if (!_.isBoolean(openNow)) {
    throw new SyntaxError('The "open_now" key is not a boolean');
  }

  return content;
}

/**
 * Check if body is empty or invalid.
 *
 * @param {string}  apiHandler - The API route handler.
 * @param {Payload} content    - Payload content.
 *
 * @returns {Payload} Payload content.
 *
 * @since 1.0.0
 */
function checkIfEmptyOrInvalid(apiHandler, content) {
  console.log(`${apiHandler} checkIfEmptyOrInvalid`, content);

  if (_.isEmpty(content) || !_.isPlainObject(content)) {
    throw new SyntaxError('The content is empty or invalid');
  }

  return content;
}

/**
 * Check if body is malicious.
 *
 * @param {string}  apiHandler - The API route handler.
 * @param {Payload} content    - Payload content.
 *
 * @returns {Payload} Payload content.
 *
 * @since 1.0.0
 */
function checkIfMalicious(apiHandler, content) {
  console.log(`${apiHandler} checkIfMalicious`, content);

  if (
    _.has(content, 'ip')
    || _.has(content, 'ua')
    || _.has(content, 'iat')
    || _.has(content, 'exp')
  ) {
    throw new Error('The content is malicious');
  }

  return content;
}

module.exports = {
  checkForAuth,
  checkForCoordinates,
  checkForDetails,
  checkForPhoto,
  checkForReviews,
  checkForSearch,
  checkIfEmptyOrInvalid,
  checkIfMalicious,
};

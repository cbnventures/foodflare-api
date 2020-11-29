const dotenv = require('dotenv');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

dotenv.config();

/**
 * Inject source information.
 *
 * @param {Payload} payloadContent - Payload content.
 * @param {string}  sourceIp       - Source IP address from context.
 * @param {string}  userAgent      - User agent from context.
 *
 * @returns {string} A signed JSON Web Token.
 *
 * @since 1.0.0
 */
function signToken(payloadContent, sourceIp, userAgent) {
  const { JWT_ALGORITHM, JWT_EXPIRES_IN } = process.env;

  const privateKey = fs.readFileSync(`${__dirname}/../../certs/private.pem`);
  const sourceInfo = {
    ip: sourceIp,
    ua: userAgent,
  };

  // Modify "sourceInfo" instead of "payloadContent".
  _.merge(sourceInfo, payloadContent);

  return jwt.sign(sourceInfo, privateKey, {
    algorithm: JWT_ALGORITHM,
    expiresIn: JWT_EXPIRES_IN,
  });
}

module.exports = {
  signToken,
};

const crypto = require('crypto');
const lodash = require('lodash');

function sortKeys(obj) {
  return lodash.fromPairs(
    lodash.keys(obj)
      .sort()
      .map(k => [k, obj[k]]),
  );
}

function dropUndefinedValues(obj) {
  lodash.forEach(obj, (value, key) => {
    if (value === undefined) {
      delete obj[key];
    }
  });
  return obj;
}

function objToUri(obj) {
  return lodash
    .map(obj, (v, k) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

function sha1Base64(string, secret) {
  return crypto.createHmac('sha1', secret).update(string).digest('base64');
}

module.exports = {
  sortKeys,
  dropUndefinedValues,
  objToUri,
  sha1Base64,
};

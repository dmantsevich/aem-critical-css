exports.createHash = (size) => {
  const crypto = require('crypto');
  let hash = crypto.createHash('sha256');
  hash = hash.update([Date.now(), Math.random(), Math.random(), Math.random()].join('~')).digest('hex');
  return size ? hash.substr(0, size) : hash;
}
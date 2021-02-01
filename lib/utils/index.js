exports.createHash = (size) => {
  const crypto = require('crypto');
  let hash = crypto.createHash('sha256');
  hash = hash.update([Date.now(), Math.random(), Math.random(), Math.random()].join('~')).digest('hex');
  return size ? hash.substr(0, size) : hash;
};

exports.gzipSize = (data) => {
  const gzipSize = require('gzip-size');
  return gzipSize.sync(data);
};

exports.normalizeUrl = (url) => {
  const path = require('path');
  return path.normalize(url).split(path.sep).join(path.posix.sep);
};

exports.getJCRPath = (path) => {
  return exports.normalizeUrl(path.replace(/(.*)jcr_root/, ''));
};
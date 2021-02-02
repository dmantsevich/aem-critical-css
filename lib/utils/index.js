const path = require('path');

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
  return path.normalize(url).split(path.sep).join(path.posix.sep);
};

exports.getJCRPath = (path) => {
  return exports.normalizeUrl(path.replace(/(.*)jcr_root/, ''));
};

exports.changeJCRRoot = (oldPath, newPath) => {
  return path.resolve(newPath + exports.getJCRPath(oldPath));
};

exports.resolveByGzipSize = function resolveByGzipSize(component) {
  const logger = require('./logger');
  const gzip = exports.gzipSize(component.css);
  const filesize = require('filesize');
  const { INJECTION_TYPES } = require('./../const');
  const type = (gzip < component.config.criticalCSS.gzipSize) ? INJECTION_TYPES.INLINE : INJECTION_TYPES.LINK;
  logger.info(`<fn>injectionTypeAutoResolver</fn>: <path>${component.cssSourceFile}</path> <blue>gzip size</blue> is <number>${filesize(gzip)}</number>. Injection type: <value>${type}</value>`);
  return type;
};
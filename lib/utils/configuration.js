const { resolve, join, normalize, parse } = require('path');
const { CRITICAL_CSS_INJECTION_TYPE, CSS_TYPES } = require('./../const');
const { createHash } = require('./index');

exports.prepareConfiguration = (config) => {
  config.AEM.projectRoot = resolve(config.AEM.projectRoot);
  config.AEM.components = join(config.AEM.projectRoot, config.AEM.components);
  config.css.sourceRoot = resolve(config.css.sourceRoot);
  if (config.web.hash === true) {
    config.web.hash = createHash(config.web.hashSize);
  }
};

exports.validateCriticalCSSSourceFile = async (config, source, sourceFile) => {
  const fs = require('fs');
  if (!source) {
    throw new Error(`"${config.criticalCSS.sourceAttr}" attribute is empty.`);
  }

  const parsed = parse(source);
  const approved = Object.values(CSS_TYPES);
  if (approved.indexOf(parsed.ext) === -1) {
    throw new Error(`Invalid source file ("${source}") format. Supports only: ${approved.join(', ')}.`);
  }

  try {
    await fs.promises.access(sourceFile, fs.constants.F_OK);
  } catch (e) {
    throw new Error(`Could not find source file with styles. File "${sourceFile}" doesn't exist.`);
  }

  return true;
};

exports.validateCriticalCSSinjectionType = async (config, injectionType) => {
  const allTypes = Object.values(CRITICAL_CSS_INJECTION_TYPE);
  if (allTypes.indexOf(injectionType) !== -1) return true;
  throw new Error(`Invalid "${config.criticalCSS.injectionTypeAttr}" attribute value. Possible values: ${allTypes.join(', ')}`);
};
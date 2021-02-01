const { resolve, join, parse } = require('path');
const { INJECTION_TYPES, CSS_SOURCE_TYPES, RESOURCES_FOLDER } = require('./../const');
const { createHash, getJCRPath } = require('./index');
const logger = require('./logger');

exports.prepareConfiguration = (config) => {
  config.AEM.projectRoot = resolve(config.AEM.projectRoot);
  config.AEM.components = join(config.AEM.projectRoot, config.AEM.components);
  config.css.sourceRoot = resolve(config.css.sourceRoot);
  if (config.web.hash === true) {
    config.web.hash = createHash(config.web.hashSize);
  }
  config.criticalCSS.file += `.${config.criticalCSS.type}`;
  config.criticalCSS.useAPIService = join(config.AEM.projectRoot, config.criticalCSS.useAPIService);
  if (!config.criticalCSS.useAPIServiceJCRPath) {
    config.criticalCSS.useAPIServiceJCRPath = getJCRPath(config.criticalCSS.useAPIService);
  }

  config.web.publicClientlib += RESOURCES_FOLDER;

  config.web._localClientlib = join(config.AEM.projectRoot, config.web.localClientlib);
  config.web.localClientlib = join(config.web._localClientlib, RESOURCES_FOLDER);
};

exports.validateCriticalCSSSourceFile = async (config, source, sourceFile) => {
  const fs = require('fs');
  if (!source) {
    throw new Error(`"${config.criticalCSS.sourceAttr}" attribute is empty.`);
  }

  const parsed = parse(source);
  const approved = Object.values(CSS_SOURCE_TYPES);
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
  const allTypes = Object.values(INJECTION_TYPES);
  if (allTypes.indexOf(injectionType) !== -1) return true;
  throw new Error(`Invalid "${config.criticalCSS.injectionTypeAttr}" attribute value. Possible values: ${allTypes.join(', ')}`);
};

exports.resolveInjectionType = async (component) => {
  const { INJECTION_TYPES } = require('./../const');
  const { AUTO, INLINE, LINK } = INJECTION_TYPES;
  let { config, injectionType } = component;
  if (injectionType === AUTO) {
    const { injectionTypeAutoResolver } = config.criticalCSS;
    if (typeof injectionTypeAutoResolver === 'function') {
      component.injectionType = injectionType = await injectionTypeAutoResolver(component);
    }
  }

  if (injectionType !== LINK && injectionType !== INLINE) {
    logger.error(`Invalid <key>injection type</key> option. Supports only: <value>${INLINE}</value>, <value>${LINK}</value>.`);
    throw new Error(`Invalid "injection type" option. Supports only: ${INLINE}, ${LINK}`);
  }

  component.injectionType = injectionType;
};
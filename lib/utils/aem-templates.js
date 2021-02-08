const logger = require('./logger');
const { readFile } = require('fs').promises;
const { getAttributes, getAttribute, resolveJCRPath } = require('./index');

async function getTemplates (config) {
  const globby = require('globby');
  const templates = await globby('**/*.html', { cwd: config.AEM.components, absolute: true }) || [];
  logger.info(`Have <fn>found</fn> "<number>${templates.length}</number>" HTL templates.`);
  return templates;
}

function createCriticalCSSMap (criticalCSSAttrs, config) {
  if (criticalCSSAttrs) {
    const criticalCSSMap = {};
    criticalCSSAttrs.map(({ ns, value, pattern }) => {
      criticalCSSMap[ns] = {
        pattern: [pattern], // attribute definition
        ns, // namespace
        criticalCSS: value, // Critical css definition via attribute
        cssSourceFile: config.css.sourceFilePathResolver(value, config), // Path to CSS source file
        injectionType: config.criticalCSS.injectionType // Injection type
      };
    });
    return criticalCSSMap;
  }
  return null;
}

function printAttrs (criticalCSSMap) {
  return Object.values(criticalCSSMap).map(({pattern}) => pattern.join('\n')).join('\n');
}

async function processTemplate (config, file, fileContent) {
  logger.info(`Start <fn>processing HTL template</fn>: <path>${file}</path>`);

  const sourceAttr = config.criticalCSS.sourceAttr;
  const injectionTypeAttr = config.criticalCSS.injectionTypeAttr;

  if (fileContent.indexOf(config.criticalCSS.sourceAttr) === -1) {
    logger.warn(`Could not parse expression. Attribute <value>${sourceAttr}</value> is not present. Template: <path>${file}</path>`);
    return null;
  }

  const { validateCriticalCSSMap } = require('./configuration');

  const criticalCSSMap = createCriticalCSSMap(getAttributes(fileContent, sourceAttr), config);

  if (!Object.keys(criticalCSSMap).length) {
    logger.throwFatal(`Could not parse your critical css definition in <path>${file}</path> (<blue>${sourceAttr}</blue> attributes). Please, <!>check your configuration, template & read documentation</!>.`);
  }

  const inejectionTypeAttrs = getAttributes(fileContent, injectionTypeAttr);
  inejectionTypeAttrs.forEach(({ pattern, ns, value }) => {
    if (criticalCSSMap[ns]) {
      criticalCSSMap[ns].injectionType = value;
      criticalCSSMap[ns].pattern.push(pattern);
    } else {
      logger.warn(`Invalid "<blue>${ns}</blue>" namespace for <blue>${injectionTypeAttr}</blue>. Could not find namespace <blue>${ns}</blue> for <blue>${sourceAttr}</blue> attribute.`);
    }
  });

  let serviceAttr = getAttribute(fileContent, config.criticalCSS.serviceAttr);
  if (serviceAttr) {
    serviceAttr.value = resolveJCRPath(serviceAttr.value, file);
  }

  try {
    await validateCriticalCSSMap(config, criticalCSSMap);
  } catch (e) {
    logger.error(`${e.message}  
<key>Template</key>\t: <path>${file}</path> 
<key>Attributes</key>\t: 
${printAttrs(criticalCSSMap)}
${serviceAttr ? serviceAttr.pattern.trim() : ''}`);
    throw e;
  }

  Object.values(criticalCSSMap).map(( { cssSourceFile, injectionType, ns } ) => {
    logger.info(`Found <fn>AEM critical CSS rule</fn>: <path>${file}</path> <blue>(${ns})</blue> -> <path>${cssSourceFile}</path> <blue>(${injectionType})</blue>`);
  });

  const Component = require('./../Component');

  return new Component(config, {
    template: file, // Path to template
    criticalCSSMap,
    service: serviceAttr ? serviceAttr.value : null
  });

}

exports.analyzeTemplates = async (config) => {
  const components = [];
  logger.info(`<fn>analyzeTemplates</fn>: Start analyzing AEM HTL templates. AEM Components folder: <path>${config.AEM.components}</path>`);
  const templates = await getTemplates(config); // Get all HTML templates for components

  if (!templates.length) {
    logger.throwError(`Could not find AEM HTL templates. Check folder & configuration: <path>${config.AEM.components}</path>.`);
  }

  await Promise.all(templates.map(async (file) => {
    const fileContent = await readFile(file);
    if (fileContent.indexOf(config.criticalCSS.file) !== -1) { // quick check
      const component = await processTemplate(config, file, fileContent.toString());
      component && components.push(component);
    }
  }));

  return components;
};

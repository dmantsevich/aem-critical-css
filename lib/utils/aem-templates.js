const logger = require('./logger');
const { readFile } = require('fs').promises;
const { join } = require('path');

async function getTemplates (config) {
  const globby = require('globby');
  const templates = await globby('**/*.html', { cwd: config.AEM.components, absolute: true }) || [];
  logger.info(`Have found "<value>${templates.length}</value>" HTL templates.`);
  return templates;
}

function getAttribute(fileContent, attr) {
  const regPattern = new RegExp(`\\s${attr}="(.*?)"`, 'g');
  const parseResult = regPattern.exec(fileContent);
  return (parseResult && parseResult[1]) ? parseResult[1].trim() : null;
}

async function processTemplate (config, file, fileContent) {
  logger.info(`Start processing HTL template: "<path>${file}</path>"`);

  if (fileContent.indexOf(config.criticalCSS.sourceAttr) === -1) {
    logger.warn(`Could not parse expression. Attribute <value>${config.criticalCSS.sourceAttr}</value> is not present. Template: <path>${file}</path>`);
    return null;
  }

  const { validateCriticalCSSSourceFile, validateCriticalCSSinjectionType } = require('./configuration');

  const criticalCSSSource = getAttribute(fileContent, config.criticalCSS.sourceAttr);
  const criticalCSSSourceFile = join(config.css.sourceRoot, criticalCSSSource);

  try {
    await validateCriticalCSSSourceFile(config, criticalCSSSource, criticalCSSSourceFile);
  } catch (e) {
    logger.error(`${e.message}  
<key>Template</key>\t: <path>${file}</path> 
<key>Attribute</key>\t: <blue>${config.criticalCSS.sourceAttr}</blue>=<value>"${criticalCSSSource}"</value>
<key>File</key>\t\t: <path>${criticalCSSSourceFile}</path>`);
    throw e;
  }

  const criticalCSSinjectionType = getAttribute(fileContent, config.criticalCSS.injectionTypeAttr) || config.criticalCSS.injectionType;
  try {
    await validateCriticalCSSinjectionType(config, criticalCSSinjectionType);
  } catch (e) {
    logger.error(`${e.message}  
<key>Template</key>\t: <path>${file}</path> 
<key>Attribute</key>\t: <blue>${config.criticalCSS.injectionTypeAttr}</blue>=<value>"${criticalCSSinjectionType}"</value>`);
    throw e;
  }
  logger.info(`Found AEM critical CSS rule: <path>${file}</path> -> <path>${criticalCSSSourceFile}</path> <blue>(${criticalCSSinjectionType})</blue>`);

  const Component = require('./../Component');

  return new Component(config, {
    template: file, // Path to template
    criticalCSS: criticalCSSSource, // Critical css definition via attribute
    cssSourceFile: criticalCSSSourceFile, // Path to CSS source file
    injectionType: criticalCSSinjectionType // Injection type
  });

}

exports.analyzeTemplates = async (config) => {
  const components = [];
  logger.info(`Start analyzing AEM HTL templates. AEM Components folder: <path>${config.AEM.components}</path>`);
  const templates = await getTemplates(config); // Get all HTML templates for components

  if (!templates.length) {
    logger.error(`Could not find AEM HTL templates. Check folder & configuration: <path>${config.AEM.components}</path>.`);
    throw new Error(`Could not find AEM HTL templates.`);
  }

  await Promise.all(templates.map(async (file) => {
    const fileContent = await readFile(file);
    if (fileContent.indexOf(config.criticalCSS.file) !== -1) { // quick check
      const component = await processTemplate(config, file, fileContent);
      component && components.push(component);
    }
  }));

  return components;
};

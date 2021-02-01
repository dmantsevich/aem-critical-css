const logger = require('./../utils/logger');
const tag = {
  link(component) {
    return `<link href="${component.publicCSSPath}" rel="stylesheet" type="text/css" />`;
  },
  inline(component) {
    return `<style>${component.css}</style>`;
  }
};

module.exports = (component) => {
  const UglifyJS = require('uglify-js');
  const code = `
use(function () {

    ${component.config._AEMCriticalCSSService}

    const shouldInject = CSSLoadingService.shouldInject('${component.criticalCSS}');
    const cssContent = '<!-- @aem-critical-css: "${component.criticalCSS}" -->\\n${tag[component.injectionType](component)}';
    const alreadyInjected = '<!-- @aem-critical-css: "${component.criticalCSS}" already injected -->';
    
    return {
        inject: shouldInject ? cssContent : alreadyInjected
    }
});
`;
  const result = UglifyJS.minify(code);
  if (result.error) {
    logger.error(`<red>${result.error}</red>`);
    throw new Error(result.error);
  }
  return result.code;
};
const logger = require('./../utils/logger');
const { getJCRPath } = require('./../utils');
const { comment, commentAlreadyInjected, minifyJS, tag, getAllCriticalCSS } = require('./utils');

function createVars(criticalCSS) {
  const ns = criticalCSS.ns;
  return `
const cssContent_${ns} = '${comment(criticalCSS)}\\n${tag[criticalCSS.injectionType](criticalCSS)}';
const alreadyInjected_${ns} = '${commentAlreadyInjected(criticalCSS)}';
inject.push(CSSLoadingService.shouldInject('${criticalCSS.criticalCSS}') ? cssContent_${ns} : alreadyInjected_${ns});
`;
}

module.exports = (component) => {
  const commonBanner = require('./common-banner');
  const criticalCSSMap = Object.values(component.criticalCSSMap);
  const code = `
/*! 
${commonBanner({ CSS: getAllCriticalCSS(component.criticalCSSMap), Component: getJCRPath(component.template) })}
*/

use(function () {

    ${component.config._AEMCriticalCSSService}
    var inject = [];
    ${criticalCSSMap.map((criticalCSS) => createVars(criticalCSS)).join('\n')}
    
    return {
        inject: inject.join('\\n'),
        ${criticalCSSMap.map(({ns}) => `inject_${ns}: cssContent_${ns}`).join(',\n        ')}
    }
});
`;
  const result = minifyJS(component.config, code);
  if (result.error) {
    logger.error(`<red>${result.error}</red>`);
    throw new Error(result.error);
  }
  return result.code;
};

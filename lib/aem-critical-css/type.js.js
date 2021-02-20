const logger = require('./../utils/logger');
const { getJCRPath } = require('./../utils');
const { comment, commentAlreadyInjected, minifyJS, tag, getAllCriticalCSS } = require('./utils');

function createVars(criticalCSS) {
  const ns = criticalCSS.ns;
  return `
const inject_${ns} = '${comment(criticalCSS)}\\n${tag[criticalCSS.injectionType](criticalCSS)}';
const ignore_${ns} = '${commentAlreadyInjected(criticalCSS)}';
inject.push(CSSLoadingService.shouldInject('${criticalCSS.criticalCSS}') ? inject_${ns} : ignore_${ns});
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
        ${criticalCSSMap.map(({ns}) => `inject_${ns}: inject_${ns}`).join(',\n        ')}
    }
});
`;
  const result = minifyJS(component.config, code);
  if (result.error) {
    logger.throwError(`<red>${result.error}</red>`);
  }
  return result.code;
};

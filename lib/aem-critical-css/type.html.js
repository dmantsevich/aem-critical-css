const { getJCRPath } = require('./../utils');
const { tag, comment, getAllCriticalCSS, minifyHTML } = require('./utils');

function service(component) {
  let useAPIService = component.service || component.config.criticalCSS;
  if (typeof useAPIService === 'function') {
    useAPIService = useAPIService(component);
  }
  const params = Object.values(component.criticalCSSMap).map(( { criticalCSS, injectionType, ns } ) => `${ns}='${criticalCSS}', ${ns}InjectionType='${injectionType}'`).join(', ');
  return `\${'${useAPIService}' @ ${params}}`;
}

function createTemplate(criticalCSS) {
  return `<sly data-sly-template.inject_${criticalCSS.ns}>
    ${comment(criticalCSS)}
    ${tag[criticalCSS.injectionType](criticalCSS)}
</sly>`;
}

function createCall(criticalCSS) {
  const _if = `service.shouldInject_${criticalCSS.ns}`;
  return `
    <sly data-sly-test="\${${_if} == true}">
        <sly data-sly-call="\${inject_${criticalCSS.ns}}"/>
    </sly>
    <sly data-sly-test="\${${_if} != true}">
        ${comment(criticalCSS, `\${${_if} || 'ignored'}`)}
    </sly>`;
}

module.exports = (component) => {
  const commonBanner = require('./common-banner');
  const criticalCSSMap = Object.values(component.criticalCSSMap);
  const code = `
<!--/* 
${commonBanner({ CSS: getAllCriticalCSS(component.criticalCSSMap), Component: getJCRPath(component.template) })}
*/-->
<sly data-sly-template.inject>
    <sly data-sly-use.service="${service(component)}"/>
${criticalCSSMap.map((criticalCSS) => createCall(criticalCSS)).join('\n')}
</sly>
${criticalCSSMap.map((criticalCSS) => createTemplate(criticalCSS)).join('\n')}
`;
  const result = minifyHTML(component.config, code);
  if (result.error) {
    logger.throwError(`<red>${result.error}</red>`);
  }
  return result.code;
};
const { getJCRPath } = require('./../utils');
const { tag, comment, getAllCriticalCSS } = require('./utils');

function service(component) {
  const useAPIService = component.service || component.config.criticalCSS;
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
  return `
<!--/* 
${commonBanner({ CSS: getAllCriticalCSS(component.criticalCSSMap), Component: getJCRPath(component.template) })}
*/-->
<sly data-sly-template.inject>
    <sly data-sly-use.service="${service(component)}"/>
${criticalCSSMap.map((criticalCSS) => createCall(criticalCSS)).join('\n')}
</sly>
${criticalCSSMap.map((criticalCSS) => createTemplate(criticalCSS)).join('\n')}
`;
};
const { INJECTION_TYPES } = require('./../const');
const filesize = require('filesize');

function statOne(component, criticalCSS) {
  return `\t [${criticalCSS.ns}]
\t\t * Source file: <path>${criticalCSS.cssSourceFile}</path>
\t\t * Injection type: <blue>${criticalCSS.injectionType}</blue>
\t\t * WEB Path: <yellow>${criticalCSS.injectionType === INJECTION_TYPES.LINK ? criticalCSS.publicCSSPath : 'none'}</yellow>
\t\t * Local Path: ${criticalCSS.injectionType === INJECTION_TYPES.LINK ? '<path>' + criticalCSS.localCSSPath + '</path>' : '<yellow>none</yellow>'}
\t\t * CSS size: <number>${filesize(criticalCSS.cssSize)}</number>
`
}

module.exports = (components) => {
  let status = '';
  components.forEach((component) => {
    const criticalCSSMap = Object.values(component.criticalCSSMap).map((criticalCSS) => statOne(component, criticalCSS)).join('');
    status += `
- <path>${component.template}</path>: 
   - Critical CSS File: <path>${component.aemCriticalCSSFilePath}</path> ${component.service ? `\n   - Service: <yellow>${component.service}</yellow>` : ''}
   - Result:
${criticalCSSMap}
`
  });
  return status;
};
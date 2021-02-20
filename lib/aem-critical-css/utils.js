exports.comment = (criticalCSS, comment = '') => `<!-- @aem-critical-css: "${criticalCSS.criticalCSS}" ${comment} -->`;
exports.commentAlreadyInjected = (criticalCSS) => exports.comment(criticalCSS, 'ignored');

exports.getAllCriticalCSS = (criticalCSSMap) => {
  return Object.values(criticalCSSMap).map(( { criticalCSS } ) => criticalCSS).join(', ');
};

exports.minifyJS = (config, code) => {
  const UglifyJS = require('uglify-js');
  if (config.criticalCSS.minifyOutput) {
    return UglifyJS.minify(code, { output: {comments: 'all'} });
  } else {
    return { code };
  }
};

exports.minifyHTML = (config, code) => {
  const htmlMinifier = require('html-minifier').minify;
  if (config.criticalCSS.minifyOutput) {
    try {
      return {
        code: htmlMinifier(code, {
          html5: false,
          keepClosingSlash: true,
          removeAttributeQuotes: false,
          collapseWhitespace: true
        })
      };
    } catch (e) {
      return { error: e.message };
    }
  } else {
    return { code };
  }
};

exports.tag = {
  link(component) {
    return `<link href="${component.publicCSSPath}" rel="stylesheet" type="text/css" />`;
  },
  inline(component) {
    return `<style>${component.css}</style>`;
  }
};
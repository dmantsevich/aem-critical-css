const logger = require('./../utils/logger');
const { parse } = require('path');
const filesize = require('filesize');


async function compileCSS (component) {
  const cssSourceFile = component.cssSourceFile;
  const { ext } = parse(cssSourceFile);
  logger.info(`<fn>css-compiler</fn>: Start compiling <path>${cssSourceFile}</path> to CSS. Format: <blue>${ext.toUpperCase()}</blue>.`);
  try {
    let compile = component.config.css.compile;
    if (typeof compile !== 'function') {
      compile = require(`./compiler${ext}`);
    }
    const css = await compile(component);
    component.css = css && css.toString();
    if (component.css && component.css.trim()) {
      logger.info(`<fn>css-compiler</fn>: Compilation for <path>${cssSourceFile}</path> was <green>successful</green>. Output size: <blue>${filesize(component.css.length)}</blue>`);
    } else {
      throw new Error(`Compilation result: empty output`);
    }
  } catch (e) {
    logger.error(`Could not compile <path>${cssSourceFile}</path> file. ${e.message}`);
    throw e;
  }
  return component;
}

module.exports = async (component) => {
  await compileCSS(component); // compile to css

  const postcss = require('./postcss');
  await postcss.process(component); // go through postcss plugins
  return component;
};
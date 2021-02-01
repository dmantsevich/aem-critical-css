const less = require('less');
const { readFile } = require('fs').promises;

module.exports = async (component) => {
  const lessSourcefile = await readFile(component.cssSourceFile);
  return await less
    .render(lessSourcefile.toString(), { filename: component.cssSourceFile })
    .then((output) => output.css);
};
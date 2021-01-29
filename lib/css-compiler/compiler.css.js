const { readFile } = require('fs').promises;

module.exports = async (component) => {
  return await readFile(component.cssSourceFile);
};
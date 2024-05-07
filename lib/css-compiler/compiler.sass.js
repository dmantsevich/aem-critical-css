const sass = require(`sass`);

module.exports = async (component) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = sass.compile(component.cssSourceFile);
      resolve(result.css);
    } catch (err) {
      reject(err);
    }
  });
};
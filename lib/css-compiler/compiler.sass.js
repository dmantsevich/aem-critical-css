const sass = require(`node-sass`);

module.exports = async (component) => {
  return new Promise((resolve, reject) => {
    sass.render({
      file: component.cssSourceFile
    }, (err, result) => {
      if (err) {
        reject(err);
        return ;
      }
      resolve(result.css);
    })
  });
};
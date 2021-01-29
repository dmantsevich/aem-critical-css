const { CSS_TYPES } = require('./const');
const { parse } = require('path');

class Component {

  constructor(config, options) {
    Object.assign(this, options);
    this.config = config;
  }

  async process() {
    await require('./css-compiler')(this);
  }

}

module.exports = Component;
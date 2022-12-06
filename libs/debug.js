const debug = require('debug');

module.exports = (n) => {
    return debug(`puglist:v1:${n}`);
};
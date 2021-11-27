/* eslint-disable @typescript-eslint/no-var-requires */
// const { exec } = require('shelljs');

module.exports = function () {
  return {
    autoDetect: true,
    teardown() {
      return require('shelljs').exec('pnpm clear:test');
    },
    runMode: 'onsave',
    trace: true,
  };
};

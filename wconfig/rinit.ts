import { log } from '@core_chlbri/core';
import { emptyDirSync } from 'fs-extra';

function main() {
  emptyDirSync('node_modules');
  log('Empty node_modules', 'done');
}

main();

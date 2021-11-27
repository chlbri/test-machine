import fs from 'fs';
import { exec } from 'shelljs';
import editjson from 'edit-json-file';
import { log } from 'console';

// DO NOT DELETE THIS FILE
// This file is used by build system to build a clean npm package with the compiled js files in the root of the package.
// It will not be included in the npm package.

const COPY_COMMAND = 'xcopy "dist" .';
const REMOVE_COMMAND = 'rimraf -rf dist src test';
const CLEAN_COMMAND = 'git clean -fd & git checkout -- .';
const PACKAGE = './package.json';

function resetToMain(data: any) {
  let _data = '';
  if (typeof data !== 'string') return _data;
  if (data.startsWith('dist/')) {
    _data = data.slice(5);
  }
  return _data;
}

function main() {
  exec(COPY_COMMAND);
  exec(REMOVE_COMMAND);
  const file = editjson(PACKAGE);

  // #region my own
  file.unset('devDependencies');
  file.unset('scripts');
  // #endregion

  // #region Config
  const versions = (file.get('version') as string).split('.');
  const versionN = Number.parseInt(versions[versions.length - 1]) + 1;
  versions.pop();
  versions.push(versionN + '');
  const typings = resetToMain(file.get('typings'));
  file.set('typings', typings);
  const _main = resetToMain(file.get('main'));
  file.set('main', _main);
  const version = versions.join('.');
  file.set('version', version);
  // #endregion

  file.save();
}

main();

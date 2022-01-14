import editjson from 'edit-json-file';
import { exec } from 'shelljs';

// DO NOT DELETE THIS FILE
// This file is used by build system to build a clean npm package with the compiled js files in the root of the package.
// It will not be included in the npm package.

const COPY_COMMAND = 'cp -R dist/* .';
// const REMOVE_COMMAND = 'rimraf -rf dist src test';
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
  // exec(REMOVE_COMMAND);
  const file = editjson(PACKAGE);

  // #region my own
  file.unset('devDependencies');
  file.unset('scripts');
  // #endregion

  // #region Config
  const typings = resetToMain(file.get('typings'));
  file.set('typings', typings);
  const _main = resetToMain(file.get('main'));
  file.set('main', _main);
  // #endregion

  file.save();
}

main();

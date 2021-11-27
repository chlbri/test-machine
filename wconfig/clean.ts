import editjson from 'edit-json-file';
import { exec } from 'shelljs';

// DO NOT DELETE THIS FILE
// This file is used by build system to build a clean npm package with the compiled js files in the root of the package.
// It will not be included in the npm package.

const CLEAN_COMMAND1 = 'git clean -fd && git checkout -- .';
const CLEAN_COMMAND2 = 'git add . && git commit -am "clean"';
const PACKAGE = './package.json';

function main() {
  exec(CLEAN_COMMAND1).stdout;

  // #region Config
  const file = editjson(PACKAGE);

  const versions = (file.get('version') as string).split('.');
  const versionN = Number.parseInt(versions[versions.length - 1]) + 1;
  versions.pop();
  versions.push(versionN + '');
  const version = versions.join('.');
  file.set('version', version);
  // #endregion

  file.save();
}

main();

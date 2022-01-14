import editjson from 'edit-json-file';
import { exec } from 'shelljs';

// DO NOT DELETE THIS FILE
// This file is used by build system to build a clean npm package with the compiled js files in the root of the package.
// It will not be included in the npm package.

const CLEAN_COMMAND2 = 'git add . && git commit -am "clean"';
const CLEAN_COMMAND35 = 'yarn git-push';
const CLEAN_COMMAND4 = 'git checkout dev && git merge main';
const CLEAN_COMMAND6 = 'git checkout dev';
const PACKAGE = './package.json';

function main() {
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
  exec(CLEAN_COMMAND2);
  exec(CLEAN_COMMAND35);
  exec(CLEAN_COMMAND4);
  exec(CLEAN_COMMAND35);
  exec(CLEAN_COMMAND6);
}

main();

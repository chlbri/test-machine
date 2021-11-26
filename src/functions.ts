import { isNullish } from '@core_chlbri/core';
import { customAlphabet } from 'nanoid';
import { isSpawnedActor } from 'xstate/lib/Actor';

export function withoutSpawnRef(arg?: any) {
  return arg
    ? Object.entries(arg)
        .filter(
          ([_, value]) => !isNullish(value) && !isSpawnedActor(value),
        )
        .reduce((prev, [key, value]) => {
          return Object.assign(prev, { [key]: value });
        }, {})
    : {};
}

export function getAllIndexes<T extends readonly string[]>(
  arr: T,
  val: string,
) {
  const indexes: number[] = [];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === val) {
      indexes.push(i);
    }
  }
  return indexes;
}

export function getReferences<T extends readonly string[]>(args: T) {
  const names = new Set(args);
  const out: any = {};
  names.forEach(name => {
    const indexes = getAllIndexes(args, name);
    out[name] = indexes;
  });
  return out as { [key in T[number]]: number[] };
}

export function createInvite(args: string[]) {
  const generator = customAlphabet('1234567890ABCEDFGHIJK', 5);
  return args.map(arg => {
    arg = 'State ===> ' + arg;
    arg += ` ------- ( ${generator()} )`;
    return arg;
  });
}

import { isSpawnedActor } from 'xstate/lib/Actor';

export function withoutSpawnRef(arg?: any) {
  return arg
    ? Object.entries(arg)
        .filter(([_, value]) => !isNullish(value) && !isSpawnedActor(value))
        .reduce((prev, [key, value]) => {
          return Object.assign(prev, { [key]: value });
        }, {})
    : {};
}

export function sleep(millis: number) {
  return new Promise(resolve => setTimeout(resolve, millis));
}

export function isNullish(val: any): val is undefined | null {
  return val === null || val === undefined;
}


export function getAllIndexes<T extends readonly string[]>(arr: T, val: string) {
  const indexes: number[] = [];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === val) {
      indexes.push(i);
    }
  }
  return indexes;
}

export function dynamicCross<T extends readonly string[]>(args: T) {
  const names = new Set(args);
  const out: any = {};
  names.forEach(name => {
    const indexes = getAllIndexes(args, name);
    out[name] = indexes;
  });
  return out as { [key in T[number]]: number[] };
}
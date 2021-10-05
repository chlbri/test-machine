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

import { isSpawnedActor } from 'xstate/lib/Actor';

export function withoutSpawnRef(arg?: any) {
  return arg
    ? Object.values(arg).filter(
        value => !isNullish(value) && !isSpawnedActor(value)
      )
    : [];
}

export function sleep(millis: number) {
  return new Promise(resolve => setTimeout(resolve, millis));
}

export function isNullish(val: any): val is undefined | null {
  return val === null || val === undefined;
}

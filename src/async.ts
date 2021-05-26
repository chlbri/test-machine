import { nanoid } from 'nanoid';
import { EventObject, interpret, createMachine } from 'xstate';
import { sleep, withoutSpawnRef } from './functions';
import { GenerateAsyncTestsForMachineArgs } from './types';

export * from './functions';
export * from './types';

export async function generateAsyncMachineTest<
  TContext,
  TEvent extends EventObject
>({
  initialContext,
  invite,
  initialState,
  machine,
  events,
  waiterBeforeEachEvent = 100,
  contexts = [] as any,
  values,
  timeout = 5000,
  subscribers = [],
}: GenerateAsyncTestsForMachineArgs<TContext, TEvent>) {
  const _machine = createMachine(machine.config, machine.options).withContext({
    ...machine.initialState.context,
    ...initialContext,
  });

  const service = interpret(_machine).start(initialState);

  subscribers.forEach(subscribe => {
    service.subscribe(subscribe);
  });

  const states = [service.state];

  const obs = service.subscribe(state => {
    if (state.changed) states.push(state);
  });

  const sleeper = () => {
    return sleep(timeout).finally(() => {
      obs.unsubscribe();
      service.stop();
    });
  };

  describe(invite, () => {
    beforeAll(sleeper);
    for (let index = 0; index < values.length; index++) {
      describe(`(${nanoid()}) ==> ${values[index]}`, () => {
        it('The state matches', () => {
          const value = values[index];
          const state = states[index];
          expect(value).toBeDefined();
          expect(state).toBeDefined();
          expect(state.matches(value)).toBe(true);
        });
        if (contexts[index]) {
          it('The context matches', () => {
            const state = states[index];
            const context = contexts[index];
            const _context = withoutSpawnRef(state.context);
            expect(context).toStrictEqual(_context);
          });
        }
      });
    }
    it('The number of states shoulds be the same', () => {
      expect(states.length).toBe(values.length);
    });
  });

  for (const event of events) {
    sleep(waiterBeforeEachEvent).then(() => {
      if (service.status < 2) service.send(event);
    });
  }
}

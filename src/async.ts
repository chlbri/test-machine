import { nanoid } from 'nanoid';
import { EventObject, interpret } from 'xstate';
import { sleep } from './functions';
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
  waiterBeforeEachEvent = 0,
  contexts = [] as any,
  values,
  timeout = 5000,
  subscribers = [],
  beforeAll: _beforeAll,
  beforeEach: _beforeEach,
  afterAll: _afterAll,
  afterEach: _afterEach,
}: GenerateAsyncTestsForMachineArgs<TContext, TEvent>) {
  const _machine = machine.withContext({
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

  const tester = () => {
    beforeAll(sleeper);
    _beforeAll && beforeAll(_beforeAll.fn, _beforeAll.timeout);
    _afterAll && afterAll(_afterAll.fn, _afterAll.timeout);

    for (let index = 0; index < values.length; index++) {
      _beforeEach && beforeAll(_beforeEach.fn, _beforeEach.timeout);
      _afterEach && afterAll(_afterEach.fn, _afterEach.timeout);
      describe(`(${nanoid()}) ==> ${values[index]}`, () => {
        it('The state matches', () => {
          const value = values[index];
          const state = states[index];
          expect(value).toBeDefined();
          expect(state).toBeDefined();
          expect(state.matches(value)).toBe(true);
        }, 2000);
        if (contexts[index]) {
          it('The context matches', () => {
            const state = states[index];
            const context = contexts[index];
            const _context = state.context;
            for (const key in context) {
              if (Object.prototype.hasOwnProperty.call(context, key)) {
                const element = context[key];
                const _element = _context[key]
                expect(element).toStrictEqual(_element);
              }
            }
          }, 2000);
        }
      });
    }
    it('The number of states shoulds be the same', () => {
      expect(states.length).toBe(values.length);
    });
  };

  invite
    ? describe(invite, () => {
        tester();
      })
    : tester();

  for (const event of events) {
    sleep(waiterBeforeEachEvent).then(() => {
      if (service.status < 2) service.send(event);
    });
  }
}

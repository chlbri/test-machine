import { dataCompare, log, sleep } from '@core_chlbri/core';
import { EventObject, interpret, State, StateSchema } from 'xstate';
import {
  INVITE_CONTEXT,
  INVITE_NUMBER_STATES,
  INVITE_VALUE,
} from './constants/strings';
import { createInvite } from './functions';
import type { GenerateAsyncTestsForMachineArgs } from './types';

export * from './functions';
export * from './types';

export async function generateAsyncMachineTest<
  TContext,
  TEvent extends EventObject,
>({
  initialContext,
  invite,
  initialState,
  machine,
  events,
  waiterBeforeEachEvent = 10,
  tests,
  timeout = 2000,
  subscribers = [],
  beforeAll: _beforeAll,
  beforeEach: _beforeEach,
  afterAll: _afterAll,
  afterEach: _afterEach,
}: GenerateAsyncTestsForMachineArgs<TContext, TEvent>): Promise<void> {
  const _machine = machine.withContext({
    ...machine.initialState.context,
    ...initialContext,
  });

  const _invites = createInvite(tests.map(test => test.value));

  const service = interpret(_machine).start(initialState);

  subscribers.forEach(subscribe => {
    service.subscribe(subscribe);
  });

  const states = [service.state];

  const obs = service.subscribe(state => {
    if (state.changed) states.push(state);
  });

  // jest.setTimeout(timeout);

  const sleeper = async () => {
    return sleep(timeout).finally(() => {
      obs.unsubscribe();
      service.stop();
    });
  };

  states.map(state => state.value); //?

  const tester = () => {
    beforeAll(sleeper, timeout + 1000);
    _beforeAll && beforeAll(_beforeAll.fn, _beforeAll.timeout);
    _afterAll && afterAll(_afterAll.fn, _afterAll.timeout);

    for (let index = 0; index < tests.length; index++) {
      const _invite = _invites[index];
      const test = tests[index];
      const value = test.value;
      const _context = test.context;
      let state: State<
        TContext,
        TEvent,
        StateSchema<any>,
        {
          value: any;
          context: TContext;
        }
      >;
      describe(_invite, () => {
        _beforeEach && beforeAll(_beforeEach.fn, _beforeEach.timeout);
        _afterEach && afterAll(_afterEach.fn, _afterEach.timeout);
        beforeAll(() => {
          state = states[index];
        });
        it(INVITE_VALUE, () => {
          expect(value).toBeDefined();
          expect(state).toBeDefined();
          expect(state.matches(value)).toBe(true);
        });
        if (_context) {
          it(INVITE_CONTEXT, () => {
            const expected = _context;
            const received = state.context;
            const assertion = dataCompare(received, expected);
            log('received', received);
            log('expected', expected);
            log('assertion', assertion);
            expect(assertion).toBe(true);
          });
        }
      });
    }
    it(INVITE_NUMBER_STATES, () => {
      expect(states.length).toBe(tests.length);
    });
  };

  for (const event of events) {
    sleep(waiterBeforeEachEvent).then(() => {
      if (service.status < 2) service.send(event);
    });
  }
  return describe(invite, () => {
    tester();
  });
}

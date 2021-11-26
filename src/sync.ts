import { dataCompare, log } from '@core_chlbri/core';
import { EventObject, interpret, State, StateSchema } from 'xstate/lib';
import {
  INVITE_CONTEXT,
  INVITE_NUMBER_STATES,
  INVITE_VALUE,
} from './constants/strings';
import { createInvite } from './functions';
import type { GenerateSyncTestsForMachineArgs } from './types';

export function generateSyncMachineTest<
  TContext,
  TEvent extends EventObject,
>({
  initialContext,
  initialState,
  machine,
  events,
  tests,
  subscribers = [],
  invite,
  beforeAll: _beforeAll,
  beforeEach: _beforeEach,
  afterAll: _afterAll,
  afterEach: _afterEach,
}: GenerateSyncTestsForMachineArgs<TContext, TEvent>) {
  if (!tests || !tests.length) {
    return;
  }
  const _machine = machine.withContext({
    ...machine.initialState.context,
    ...initialContext,
  });

  const service = interpret(_machine).start(initialState);
  const { subscribe, send } = service;

  subscribers.forEach(sub => {
    subscribe(sub);
  });

  const states = [service.state];

  const obs = service.subscribe(state => {
    if (state.changed) states.push(state);
  });

  const _invites = createInvite(tests.map(test => test.value));

  const tester = () => {
    afterAll(() => {
      obs.unsubscribe();
      service.stop();
    });
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
        { value: any; context: TContext }
      >;
      const sender = () => {
        if (index > 0) {
          const event = events[index - 1];
          send(event);
        }
        state = states[index];
      };

      describe(_invite, () => {
        beforeAll(sender);
        _beforeEach && beforeAll(_beforeEach.fn, _beforeEach.timeout);
        _afterEach && afterAll(_afterEach.fn, _afterEach.timeout);
        it(INVITE_VALUE, async () => {
          expect(value).toBeDefined();
          expect(state).toBeDefined();
          expect(state.matches(value)).toBeTruthy();
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
  describe(invite, () => {
    tester();
  });
}

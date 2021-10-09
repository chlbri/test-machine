import { nanoid } from 'nanoid';
import { EventObject, interpret, State } from 'xstate/lib';
import { GenerateSyncTestsForMachineArgs } from './types';

export function generateSyncMachineTest<TContext, TEvent extends EventObject>({
  initialContext,
  initialState,
  machine,
  events,
  contexts = [] as any,
  values,
  subscribers = [],
  invite,
  beforeAll: _beforeAll,
  beforeEach: _beforeEach,
  afterAll: _afterAll,
  afterEach: _afterEach,
}: GenerateSyncTestsForMachineArgs<TContext, TEvent>) {
  const _machine = machine.withContext({
    ...machine.initialState.context,
    ...initialContext,
  });

  const service = interpret(_machine).start(initialState);
  const { subscribe, send } = service;

  subscribers.forEach(sub => {
    subscribe(sub);
  });

  const machineStates: State<TContext, TEvent>[] = [];

  service.subscribe(state => {
    const matcher = state.value === initialState || state.value === 'idle';
    if (matcher || state.changed) {
      machineStates.push(state);
    } else {
      state;
    }
  });

  const tester = () => {
    _beforeAll && beforeAll(_beforeAll.fn, _beforeAll.timeout);
    _afterAll && afterAll(_afterAll.fn, _afterAll.timeout);
    for (let index = 0; index < values.length; index++) {
      const value = values[index];
      let state: State<TContext, TEvent>;
      const event = events[index - 1];
      const sender = () => {
        send(event);
      };
      const _context = contexts[index];
      _beforeEach && beforeAll(_beforeEach.fn, _beforeEach.timeout);
      _afterEach && afterAll(_afterEach.fn, _afterEach.timeout);
      (() => {
        if (index === 0) {
          describe(`${nanoid()}___${value}`, () => {
            state = machineStates[index];
            it(`for "${value}"`, () => {
              expect(state.matches(value)).toBeTruthy();
            });
            if (_context) {
              it('Context is the same', () => {
                const expected = _context;
                const actual = service.state.context;

                expect(actual).toStrictEqual(expected);
              });
            }
          });
        } else {
          describe(nanoid(), () => {
            beforeAll(sender);
            it(`Value is the ${value}`, async () => {
              state = machineStates[index];
              expect(state.matches(value)).toBeTruthy();
            });
            if (_context) {
              it('Context is the same', () => {
                const expected = _context;
                const actual = service.state.context;

                expect(actual).toStrictEqual(expected);
              });
            }
          });
        }
      })();
    }
  };

  invite
    ? describe(invite, () => {
        tester();
      })
    : tester();
}

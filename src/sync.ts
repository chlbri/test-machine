import { nanoid } from 'nanoid';
import { createMachine, EventObject, interpret, State } from 'xstate/lib';
import { withoutSpawnRef } from './functions';
import { GenerateSyncTestsForMachineArgs } from './types';

export function generateSyncMachineTest<TContext, TEvent extends EventObject>({
  initialContext,
  initialState,
  machine,
  events,
  contexts = [] as any,
  values,
  subscribers = [],
}: GenerateSyncTestsForMachineArgs<TContext, TEvent>) {
  const _machine = createMachine(machine.config, machine.options).withContext({
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
    const matcher = state.matches(initialState ?? 'idle');
    if (matcher || state.changed) {
      machineStates.push(state);
    }
  });

  for (let index = 0; index < values.length; index++) {
    const value = values[index];
    let state: State<TContext, TEvent>;
    const event = events[index-1];
    const sender = () => {
      send(event);
    };
    const _context = contexts[index];
    (() => {
      if (index === 0) {
        describe(`${nanoid()}___${value}`, () => {
          state = machineStates[index];
          it(`for "${value}"`, () => {
            expect(state.matches(value)).toBeTruthy();
          });
          if (_context) {
            it('Context is the same', () => {
              const expected = withoutSpawnRef(_context);
              const actual = withoutSpawnRef(service.state.context);

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
              const expected = withoutSpawnRef(_context);
              const actual = withoutSpawnRef(service.state.context);

              expect(actual).toStrictEqual(expected);
            });
          }
        });
      }
    })();
  }
}

import { assign, createMachine } from 'xstate/lib';
import { generateAsyncMachineTest, generateSyncMachineTest } from '../src';

// const remoteMachine = createMachine({
//   id: 'remote',
//   initial: 'offline',
//   states: {
//     offline: {
//       on: {
//         WAKE: 'online',
//       },
//     },
//     online: {
//       on: {
//         WAKE: 'offline',
//       },
//     },
//   },
// });

export const context = {
  elapsed: 0,
  canWalk: false,
};

export type LightEvent = { type: 'TIMER'; dete: string };

export const lightMachine = createMachine<typeof context, LightEvent>(
  {
    initial: 'idle',
    context,
    states: {
      idle: {
        on: {
          TIMER: 'green',
        },
      },
      green: {
        entry: 'inc',
        on: {
          TIMER: 'yellow',
        },
      },
      yellow: {
        entry: 'inc',
        on: {
          TIMER: 'red',
        },
      },
      red: {
        entry: 'setCanWalk',
        initial: 'walk',
        states: {
          walk: {
            entry: 'inc',
            on: {
              TIMER: {
                target: 'stop',
                cond: 'searchValid',
              },
            },
          },

          stop: {
            entry: 'inc',
            id: 'red_stop',
          },
        },
        on: {
          TIMER: {
            target: 'green',
            in: '#red_stop',
            actions: 'setCannotWalk',
          },
        },
      },
    },
  },
  {
    guards: {
      searchValid: ({ canWalk }) => canWalk,
    },
    actions: {
      setCanWalk: assign({
        canWalk: (_) => true,
      }),
      setCannotWalk: assign({
        canWalk: (_) => false,
      }),
      inc: assign({
        elapsed: ({ elapsed }) => {
          return ++elapsed;
        },
      }),
    },
  }
);

generateAsyncMachineTest({
  invite: 'Async',
  machine: lightMachine,
  events: ['TIMER', 'TIMER'],
  tests: [
    {
      value: 'red',
      context: { canWalk: true, elapsed: 3 },
    },
    {
      value: 'red',
      context: { canWalk: true, elapsed: 4 },
    },
    {
      value: 'green',
    },
  ],
  initialState: { red: 'walk' },
  initialContext: { canWalk: true, elapsed: 3 },
  timeout: 1000,
});

generateSyncMachineTest({
  invite: 'Sync',
  machine: lightMachine,
  events: ['TIMER', 'TIMER', 'TIMER', 'TIMER', 'TIMER', 'TIMER'],
  tests: [
    {
      value: 'idle',
      context: {
        elapsed: 0,
        canWalk: false,
      },
    },
    {
      value: 'green',
      context: {
        elapsed: 1,
        canWalk: false,
      },
    },
    {
      value: 'yellow',
      context: { elapsed: 2, canWalk: false },
    },
    {
      value: 'red',
      context: { elapsed: 3, canWalk: true },
    },
    {
      value: 'red',
      context: { elapsed: 4, canWalk: true },
    },
    {
      value: 'green',
      context: { elapsed: 5, canWalk: false },
    },
    {
      value: 'yellow',
    },
  ],
});

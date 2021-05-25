import { assign, createMachine, forwardTo, send, spawn } from 'xstate/lib';
import { generateAsyncMachineTest, generateSyncMachineTest } from '../src';

const remoteMachine = createMachine({
  id: 'remote',
  initial: 'offline',
  states: {
    offline: {
      on: {
        WAKE: 'online',
      },
    },
    online: {
      on: {
        WAKE: 'offline',
      },
    },
  },
});

export const context = {
  elapsed: 0,
  canWalk: false,
  spawn: spawn(remoteMachine),
};

export type LightEvent =
  | { type: 'TIMER'; dete: string }
  | { type: 'NEXT'; minQueryLength: number };

export const lightMachine = createMachine<typeof context, LightEvent>(
  {
    initial: 'idle',
    context,
    states: {
      idle: {
        on: {
          TIMER: {
            target: 'green',
            actions: 'inc',
          },
        },
      },
      green: {
        on: {
          TIMER: {
            target: 'yellow',
            actions: 'inc',
          },
        },
      },
      yellow: {
        on: {
          TIMER: { target: 'red', actions: 'inc' },
        },
      },
      red: {
        initial: 'walk',
        states: {
          walk: {
            entry: 'setCanSearch',

            on: {
              TIMER: {
                target: 'stop',
                cond: 'searchValid',
                actions: ['inc', 'spawn'],
              },
            },
          },

          stop: {
            id: 'red_stop',
          },
        },
        on: {
          TIMER: {
            target: 'green',
            in: '#red_stop',
            actions: ['inc', 'sendTo', 'setCannotSearch'],
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
      setCanSearch: assign({
        canWalk: _ => true,
      }),
      setCannotSearch: assign({
        canWalk: _ => false,
      }),
      inc: assign({
        elapsed: ({ elapsed }) => {
          return ++elapsed;
        },
      }),
      spawn: assign({
        spawn: () => spawn(remoteMachine),
      }),
      forwardTo: forwardTo(ctx => ctx.spawn!),
      sendTo: send('WAKE', { to: ctx => ctx.spawn! }),
    },
    services: {
      remote: () => spawn(remoteMachine),
    },
  }
);

describe('Async', () => {
  generateAsyncMachineTest({
    invite: 'Async',
    machine: lightMachine,
    events: ['TIMER', 'TIMER'],
    values: ['red', 'red', 'green'],
    initialState: { red: 'walk' },
    initialContext: { canWalk: true, elapsed: 3 },
  });
});

describe('Sync', () => {
  generateSyncMachineTest({
    machine: lightMachine,
    events: ['TIMER', 'TIMER', 'TIMER', 'TIMER', 'TIMER', 'TIMER'],
    values: ['idle', 'green', 'yellow', 'red', 'red', 'green'],
    contexts: [
      {
        elapsed: 0,
        canWalk: false,
      },
      {
        elapsed: 1,
        canWalk: false,
      },
      { elapsed: 2, canWalk: false },
      { elapsed: 3, canWalk: true },
      { elapsed: 4, canWalk: true },
      { elapsed: 5, canWalk: false },
    ],
  });
});

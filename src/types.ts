import type { NExclude, Nullish } from 'core';
import {
  ActorRefFrom as XActorRefFrom,
  Event,
  EventObject,
  State as MachineState,
  StateMachine as XStateMachine,
  StateSchema,
  StateValue,
} from 'xstate';

export type Undefiny<T = unknown> = NExclude<Nullish<T>, null>;

type StateMachine<
  TContext = any,
  TEvent extends EventObject = EventObject,
> = XStateMachine<TContext, StateSchema<any>, TEvent>;

type ActorReFrom<
  TContext = any,
  TEvent extends EventObject = EventObject,
> = XActorRefFrom<StateMachine<TContext, TEvent>>;

export type ActorReFromMachine<T extends StateMachine = StateMachine> =
  XActorRefFrom<T>;

export type Subscriber<TContext, TEvent extends EventObject> = (
  state: MachineState<
    TContext,
    TEvent,
    any,
    {
      value: any;
      context: TContext;
    }
  >,
) => void | undefined;

export type Test<TContext> = {
  value: string;
  context?: SimpleContext<TContext>;
};

export type GenerateSyncTestsForMachineArgs<
  TContext,
  TEvent extends EventObject,
> = {
  initialContext?: SimpleContext<TContext>;
  initialState?: StateValue;
  machine: StateMachine<TContext, TEvent>;
  events: Event<TEvent>[];
  tests: Test<TContext>[];
  // contexts?: Nullish<SimpleContext<TContext>>[];
  // values: string[];
  subscribers?: Subscriber<TContext, TEvent>[];
  invite: string;
  beforeAll?: { fn: jest.ProvidesCallback; timeout?: number };
  afterAll?: { fn: jest.ProvidesCallback; timeout?: number };
  beforeEach?: { fn: jest.ProvidesCallback; timeout?: number };
  afterEach?: { fn: jest.ProvidesCallback; timeout?: number };
};

export type SimpleContext<T> = {
  [key in keyof T as T[key] extends ActorReFrom ? never : key]?: T[key];
};

export type GenerateAsyncTestsForMachineArgs<
  TContext,
  TEvent extends EventObject,
> = GenerateSyncTestsForMachineArgs<TContext, TEvent> & {
  waiterBeforeEachEvent?: number;
  timeout?: number;
};

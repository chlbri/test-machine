import {
  ActorRefFrom as XActorRefFrom,
  Event,
  EventObject,
  State as MachineState,
  StateMachine as XStateMachine,
  StateSchema,
  StateValue
} from "xstate";

export type Nullish<T = unknown> = T | null | undefined;

type StateMachine<
  TContext = any,
  TEvent extends EventObject = EventObject
> = XStateMachine<TContext, StateSchema<any>, TEvent>;

type ActorReFrom<
  TContext = any,
  TEvent extends EventObject = EventObject
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
  >
) => void | undefined;


export type GenerateSyncTestsForMachineArgs<
  TContext,
  TEvent extends EventObject
> = {
  initialContext?: SimpleContext<TContext>;
  initialState?: StateValue;
  machine: StateMachine<TContext, TEvent>;
  events: Event<TEvent>[];
  contexts?: Nullish<SimpleContext<TContext>>[];
  values: StateValue[];
  subscribers?: Subscriber<TContext, TEvent>[];
};

export type SimpleContext<T> = {
  [key in keyof T as T[key] extends ActorReFrom ? never : key]?: T[key];
};

export type GenerateAsyncTestsForMachineArgs<
  TContext,
  TEvent extends EventObject
> = GenerateSyncTestsForMachineArgs<TContext, TEvent> & {
  waiterBeforeEachEvent?: number;
  timeout?: number;
  invite: string;
};

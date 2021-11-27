/// <reference types="jest" />
import type { NExclude, Nullish } from '@core_chlbri/core';
import { ActorRefFrom as XActorRefFrom, Event, EventObject, State as MachineState, StateMachine as XStateMachine, StateSchema, StateValue } from 'xstate';
export declare type Undefiny<T = unknown> = NExclude<Nullish<T>, null>;
declare type StateMachine<TContext = any, TEvent extends EventObject = EventObject> = XStateMachine<TContext, StateSchema<any>, TEvent>;
declare type ActorReFrom<TContext = any, TEvent extends EventObject = EventObject> = XActorRefFrom<StateMachine<TContext, TEvent>>;
export declare type ActorReFromMachine<T extends StateMachine = StateMachine> = XActorRefFrom<T>;
export declare type Subscriber<TContext, TEvent extends EventObject> = (state: MachineState<TContext, TEvent, any, {
    value: any;
    context: TContext;
}>) => void | undefined;
export declare type Test<TContext> = {
    value: string;
    context?: SimpleContext<TContext>;
};
export declare type GenerateSyncTestsForMachineArgs<TContext, TEvent extends EventObject> = {
    initialContext?: SimpleContext<TContext>;
    initialState?: StateValue;
    machine: StateMachine<TContext, TEvent>;
    events: Event<TEvent>[];
    tests: Test<TContext>[];
    subscribers?: Subscriber<TContext, TEvent>[];
    invite: string;
    beforeAll?: {
        fn: jest.ProvidesCallback;
        timeout?: number;
    };
    afterAll?: {
        fn: jest.ProvidesCallback;
        timeout?: number;
    };
    beforeEach?: {
        fn: jest.ProvidesCallback;
        timeout?: number;
    };
    afterEach?: {
        fn: jest.ProvidesCallback;
        timeout?: number;
    };
};
export declare type SimpleContext<T> = {
    [key in keyof T as T[key] extends ActorReFrom ? never : key]?: T[key];
};
export declare type GenerateAsyncTestsForMachineArgs<TContext, TEvent extends EventObject> = GenerateSyncTestsForMachineArgs<TContext, TEvent> & {
    waiterBeforeEachEvent?: number;
    timeout?: number;
};
export {};

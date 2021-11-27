import { EventObject } from 'xstate';
import type { GenerateAsyncTestsForMachineArgs } from './types';
export * from './functions';
export * from './types';
export declare function generateAsyncMachineTest<TContext, TEvent extends EventObject>({ initialContext, invite, initialState, machine, events, waiterBeforeEachEvent, tests, timeout, subscribers, beforeAll: _beforeAll, beforeEach: _beforeEach, afterAll: _afterAll, afterEach: _afterEach, }: GenerateAsyncTestsForMachineArgs<TContext, TEvent>): Promise<void>;

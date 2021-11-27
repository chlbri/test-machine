import { EventObject } from 'xstate/lib';
import type { GenerateSyncTestsForMachineArgs } from './types';
export declare function generateSyncMachineTest<TContext, TEvent extends EventObject>({ initialContext, initialState, machine, events, tests, subscribers, invite, beforeAll: _beforeAll, beforeEach: _beforeEach, afterAll: _afterAll, afterEach: _afterEach, }: GenerateSyncTestsForMachineArgs<TContext, TEvent>): void;

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAsyncMachineTest = void 0;
const core_1 = require("@core_chlbri/core");
const xstate_1 = require("xstate");
const strings_1 = require("./constants/strings");
const functions_1 = require("./functions");
__exportStar(require("./functions"), exports);
__exportStar(require("./types"), exports);
async function generateAsyncMachineTest({ initialContext, invite, initialState, machine, events, waiterBeforeEachEvent = 10, tests, timeout = 2000, subscribers = [], beforeAll: _beforeAll, beforeEach: _beforeEach, afterAll: _afterAll, afterEach: _afterEach, }) {
    const _machine = machine.withContext({
        ...machine.initialState.context,
        ...initialContext,
    });
    const _invites = (0, functions_1.createInvite)(tests.map(test => test.value));
    const service = (0, xstate_1.interpret)(_machine).start(initialState);
    subscribers.forEach(subscribe => {
        service.subscribe(subscribe);
    });
    const states = [service.state];
    const obs = service.subscribe(state => {
        if (state.changed)
            states.push(state);
    });
    // jest.setTimeout(timeout);
    const sleeper = async () => {
        for (const event of events) {
            await (0, core_1.sleep)(waiterBeforeEachEvent).then(() => {
                if (service.status < 2)
                    service.send(event);
            });
        }
    };
    states.map(state => state.value); //?
    const tester = () => {
        beforeAll(sleeper, timeout + 1000);
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
            let state;
            describe(_invite, () => {
                _beforeEach && beforeAll(_beforeEach.fn, _beforeEach.timeout);
                _afterEach && afterAll(_afterEach.fn, _afterEach.timeout);
                beforeAll(() => {
                    state = states[index];
                });
                it(strings_1.INVITE_VALUE, () => {
                    expect(value).toBeDefined();
                    expect(state).toBeDefined();
                    expect(state.matches(value)).toBe(true);
                });
                if (_context) {
                    it(strings_1.INVITE_CONTEXT, () => {
                        const expected = _context;
                        const received = state.context;
                        const assertion = (0, core_1.dataCompare)(received, expected);
                        (0, core_1.log)('received', received);
                        (0, core_1.log)('expected', expected);
                        (0, core_1.log)('assertion', assertion);
                        expect(assertion).toBe(true);
                    });
                }
            });
        }
        it(strings_1.INVITE_NUMBER_STATES, () => {
            expect(states.length).toBe(tests.length);
        });
    };
    describe(invite, tester);
}
exports.generateAsyncMachineTest = generateAsyncMachineTest;

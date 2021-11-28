"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSyncMachineTest = void 0;
const core_1 = require("@core_chlbri/core");
const lib_1 = require("xstate/lib");
const strings_1 = require("./constants/strings");
const functions_1 = require("./functions");
function generateSyncMachineTest({ initialContext, initialState, machine, events, tests, subscribers = [], invite, beforeAll: _beforeAll, beforeEach: _beforeEach, afterAll: _afterAll, afterEach: _afterEach, }) {
    if (!tests || !tests.length) {
        return;
    }
    const _machine = machine.withContext({
        ...machine.initialState.context,
        ...initialContext,
    });
    const service = (0, lib_1.interpret)(_machine).start(initialState);
    const { subscribe, send } = service;
    subscribers.forEach(sub => {
        subscribe(sub);
    });
    const states = [service.state];
    const obs = service.subscribe(state => {
        if (state.changed)
            states.push(state);
    });
    const _invites = (0, functions_1.createInvite)(tests.map(test => test.value));
    const tester = () => {
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
            const sender = () => {
                if (index > 0) {
                    const event = events[index - 1];
                    send(event);
                }
                state = states[index];
            };
            describe(_invite, () => {
                beforeAll(sender);
                _beforeEach && beforeAll(_beforeEach.fn, _beforeEach.timeout);
                _afterEach && afterAll(_afterEach.fn, _afterEach.timeout);
                it(strings_1.INVITE_VALUE, async () => {
                    expect(value).toBeDefined();
                    expect(state).toBeDefined();
                    expect(state.matches(value)).toBeTruthy();
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
    return describe(invite, () => {
        tester();
    });
}
exports.generateSyncMachineTest = generateSyncMachineTest;

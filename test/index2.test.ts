import { interpret, createMachine } from "xstate";

const teste = interpret(
  createMachine({
    initial: 'dashboard',
    states: {
      splash: {},
      dashboard: {
        type: 'parallel',
        states: {
          do1: {},
          do23: {},
        },
      },
      selected: {},
      parmas: {},
    },
  })
).start();

console.log(teste.initialState.value);

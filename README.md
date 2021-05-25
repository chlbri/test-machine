# For testing xstate machines

The package helps to run test for Observable Xstate machine

It's built with **tsdx** framework



### Two functions are used :

## `generateSyncMachineTest` :

As the name says, it's for synchronous machines which don't use promises



## `generateAsyncMachineTest` :

The main function with an **waiterBeforeEachEvent** variable. It is responsible to wait before each emission of an event.

Since we deal with Observable, we add an **timeout** variable to cancel test after a certain amount of time.

`Hope you enjoy these two functions !`
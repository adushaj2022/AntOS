/* ------------------------------
     DeviceDriver.ts

     The "base class" for all Device Drivers.
     ------------------------------ */

module TSOS {
  export class ProcessControlBlock {
    pid: number = 0;
    state: "waiting" | "running" | "new" | "ready" | "terminated" = "new";
    iRegister: number = 0;
    xRegister: number = 0;
    yRegister: number = 0;
    zRegister: number = 0;
    programCounter: number = 0;
    memoryPartitionId: number = 0;
    accumulator: number = 0;
    cycle: cycle = cycle.fetch;
    activeAddress: number = 0;
    printString: boolean = false;
    printNumber: boolean = false;
    stringCounter: number = 0;
    address: number = 0;
    lob: number = 0;
    public constructor() {}
  }
}

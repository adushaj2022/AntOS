/* ------------------------------
     DeviceDriver.ts

     The "base class" for all Device Drivers.
     ------------------------------ */

module TSOS {
  export class ProcessControlBlock {
    pid: number = 0;
    state: "waiting" | "termintating" | "exiting" | "ready" = "ready";
    iRegister: number = 0;
    xRegister: number = 0;
    yRegister: number = 0;
    zRegister: number = 0;
    programCounter: number = 0;
    public constructor() {}
  }
}

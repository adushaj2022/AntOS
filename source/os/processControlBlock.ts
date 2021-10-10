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
    public constructor() {}
  }
}

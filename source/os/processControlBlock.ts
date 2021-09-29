/* ------------------------------
     DeviceDriver.ts

     The "base class" for all Device Drivers.
     ------------------------------ */

module TSOS {
  export class ProcessControlBlock {
    pid: number;
    state: "waiting" | "termintating" | "exiting";
    xRegister: number;
    yRegister: number;
    zRegister: number;
    programCounter: number;
    public constructor() {}
  }
}

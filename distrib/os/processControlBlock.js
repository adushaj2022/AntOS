/* ------------------------------
     DeviceDriver.ts

     The "base class" for all Device Drivers.
     ------------------------------ */
var TSOS;
(function (TSOS) {
    class ProcessControlBlock {
        constructor() {
            this.pid = 0;
            this.state = "ready";
            this.xRegister = 0;
            this.yRegister = 0;
            this.zRegister = 0;
            this.programCounter = 0;
        }
    }
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=processControlBlock.js.map
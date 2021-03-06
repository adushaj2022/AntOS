var TSOS;
(function (TSOS) {
    class ProcessControlBlock {
        constructor() {
            this.pid = 0;
            this.state = "new";
            this.iRegister = 0;
            this.xRegister = 0;
            this.yRegister = 0;
            this.zRegister = 0;
            this.programCounter = 0;
            this.memoryPartitionId = 0;
            this.accumulator = 0;
            this.cycle = TSOS.cycle.fetch;
            this.activeAddress = 0;
            this.printString = false;
            this.printNumber = false;
            this.stringCounter = 0;
            this.address = 0;
            this.lob = 0;
        }
    }
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=processControlBlock.js.map
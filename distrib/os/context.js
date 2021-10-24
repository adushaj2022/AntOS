/**
 * Switch information from our process to our cpu
 */
var TSOS;
(function (TSOS) {
    class Context {
        // set cpu with new info
        static setCpuInfo(pcb) {
            _CPU.accumulator = pcb.accumulator;
            _CPU.program_counter = pcb.programCounter;
            _CPU.x_register = pcb.xRegister;
            _CPU.y_register = pcb.yRegister;
            _CPU.zFlag = pcb.zRegister;
            _CPU.curr_cycle = pcb.cycle;
            _CPU.insuction_register = pcb.iRegister;
            _CPU.printNumber = pcb.printNumber;
            _CPU.printString = pcb.printString;
            _CPU.stringCounter = pcb.stringCounter;
            _CPU.lob = pcb.lob;
        }
        // lets set the info on the pcbs here
        static setPcbInfo(pcb) {
            pcb.accumulator = _CPU.accumulator;
            pcb.programCounter = _CPU.program_counter;
            pcb.xRegister = _CPU.x_register;
            pcb.yRegister = _CPU.y_register;
            pcb.zRegister = _CPU.zFlag;
            pcb.cycle = _CPU.curr_cycle;
            pcb.iRegister = _CPU.insuction_register;
            pcb.printNumber = _CPU.printNumber;
            pcb.printString = _CPU.printString;
            pcb.stringCounter = _CPU.stringCounter;
            pcb.address = _CPU.address;
            pcb.lob = _CPU.lob;
            this.processMap.set(pcb.pid, pcb);
        }
        static getInfo(pid) {
            return this.processMap.get(pid);
        }
    }
    // easy to way to keep track of pcb data
    Context.processMap = new Map();
    TSOS.Context = Context;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=context.js.map
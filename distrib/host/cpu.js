/* ------------
     CPU.ts

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    let cycle;
    (function (cycle) {
        cycle[cycle["fetch"] = 0] = "fetch";
        cycle[cycle["decode"] = 1] = "decode";
        cycle[cycle["execute"] = 2] = "execute";
    })(cycle = TSOS.cycle || (TSOS.cycle = {}));
    class Cpu {
        constructor() {
            this.accumulator = 0;
            this.x_register = 0;
            this.y_register = 0;
            this.insuction_register = 0;
            this.program_counter = 0;
            this.curr_cycle = cycle.fetch;
            this.zFlag = 0; //zFLag to tell us if we can branch
            this.isExecuting = false;
            this.memory = _MemoryAccessor;
            this.printString = false;
            this.printNumber = false;
            this.stringCounter = 0;
            this.lob = -1;
            this.address = 0;
        }
        resetRegisters() {
            this.accumulator = 0;
            this.x_register = 0;
            this.y_register = 0;
            this.insuction_register = 0;
            this.program_counter = 0;
            this.curr_cycle = cycle.fetch;
            this.zFlag = 0;
            this.isExecuting = false;
            this.printString = false;
            this.printNumber = false;
            this.stringCounter = 0;
            this.lob = -1;
            this.address = 0;
        }
        setInsctrutionRegister(insuction_register) {
            this.insuction_register = insuction_register;
        }
        getInstructionRegister() {
            return this.insuction_register;
        }
        setAccumulator(accumulator) {
            this.accumulator = accumulator;
        }
        getAccumulator() {
            return this.accumulator;
        }
        set_y_register(y_register) {
            this.y_register = y_register;
        }
        get_y_register() {
            return this.y_register;
        }
        set_x_register(x_register) {
            this.x_register = x_register;
        }
        get_x_register() {
            return this.x_register;
        }
        fetch() {
            let instruction = this.memory.readIntermediate(this.program_counter);
            this.setInsctrutionRegister(instruction);
            this.program_counter += 1;
        }
        decode() {
            let curr_instr = this.getInstructionRegister();
            let value = this.memory.readIntermediate(this.program_counter);
            switch (curr_instr) {
                case 0xa9:
                    this.setAccumulator(value);
                    break;
                case 0xad:
                    this.lob = this.memory.readIntermediate(this.program_counter + 1);
                    this.memory.setHighOrderByte(value);
                    this.memory.setLowOrderByte(this.lob);
                    this.address = this.memory.convert_to_li_format();
                    this.setAccumulator(this.memory.readIntermediate(this.address));
                    this.program_counter += 1;
                    break;
                case 0x8d:
                    this.lob = this.memory.readIntermediate(this.program_counter + 1);
                    this.memory.setHighOrderByte(value);
                    this.memory.setLowOrderByte(this.lob);
                    this.address = this.memory.convert_to_li_format();
                    this.program_counter += 1;
                    break;
                // we store the value in memory when we execute
                case 0x6d:
                    this.lob = this.memory.readIntermediate(this.program_counter + 1);
                    this.memory.setHighOrderByte(value);
                    this.memory.setLowOrderByte(this.lob);
                    this.address = this.memory.convert_to_li_format();
                    this.setAccumulator(this.getAccumulator() + this.memory.readIntermediate(this.address));
                    this.program_counter += 1;
                    break;
                case 0xa2:
                    this.set_x_register(value);
                    break;
                case 0xae:
                    this.lob = this.memory.readIntermediate(this.program_counter + 1);
                    this.memory.setHighOrderByte(value);
                    this.memory.setLowOrderByte(this.lob);
                    this.address = this.memory.convert_to_li_format();
                    this.set_x_register(this.memory.readIntermediate(this.address));
                    this.program_counter += 1;
                    break;
                case 0xa0:
                    this.set_y_register(value);
                    break;
                case 0xac:
                    this.lob = this.memory.readIntermediate(this.program_counter + 1);
                    this.memory.setHighOrderByte(value);
                    this.memory.setLowOrderByte(this.lob);
                    this.address = this.memory.convert_to_li_format();
                    this.set_y_register(this.memory.readIntermediate(this.address));
                    this.program_counter += 2;
                case 0xea:
                    this.program_counter -= 1;
                    break; // no op
                case 0x00:
                    // End of a program
                    if (!TSOS.RoundRobinScheduler.isActivated &&
                        !TSOS.FirstComeFirstServe.isActivated) {
                        this.isExecuting = false;
                        this.program_log("terminated");
                    }
                    else if (TSOS.RoundRobinScheduler.isActivated) {
                        // if all processes are terminated, lets stop executing
                        TSOS.Context.processMap.get(_CurrentPcbId).state = "terminated";
                        if (TSOS.Context.allTerminated()) {
                            this.isExecuting = false;
                            TSOS.RoundRobinScheduler.isActivated = false;
                            // lets update our GUI
                            _OsShell.handleInput("", true, () => _Console.putText("ALL programs completed"));
                            return;
                        }
                    }
                    else if (TSOS.FirstComeFirstServe.isActivated) {
                        TSOS.FirstComeFirstServe.shouldAdvance = true;
                        if (_ReadyQueue.getSize() === 1) {
                            this.isExecuting = false;
                            TSOS.FirstComeFirstServe.isActivated = false;
                        }
                        this.program_log("terminated");
                    }
                    _OsShell.handleInput("", true, _OsShell.shellMessage);
                    break;
                case 0xec:
                    this.lob = this.memory.readIntermediate(this.program_counter + 1);
                    this.memory.setHighOrderByte(value);
                    this.memory.setLowOrderByte(this.lob);
                    this.address = this.memory.convert_to_li_format();
                    let currValue = this.memory.readIntermediate(this.address);
                    if (currValue === this.get_x_register()) {
                        this.zFlag = 1;
                    }
                    else {
                        this.zFlag = 0;
                    }
                    this.program_counter++;
                    break;
                // HANDLE OVERFLOWS
                case 0xd0:
                    if (this.zFlag === 0) {
                        let space = PARTITION_SIZE;
                        if (this.program_counter + value > space) {
                            this.program_counter -= TSOS.Utils.twos_comp(value);
                        }
                        else {
                            this.program_counter += value;
                        }
                    }
                    break;
                case 0xee:
                    this.lob = this.memory.readIntermediate(this.program_counter + 1);
                    this.memory.setHighOrderByte(value);
                    this.memory.setLowOrderByte(this.lob);
                    this.address = this.memory.convert_to_li_format();
                    // save for execute
                    this.program_counter += 1;
                    break;
                case 0xff:
                    if (this.get_x_register() === 1) {
                        this.printNumber = true;
                    }
                    else if (this.get_x_register() === 2) {
                        this.printString = true;
                        this.stringCounter = this.get_y_register(); // dont forget to reset
                    }
                    this.program_counter -= 1;
                    break;
                default:
                    break;
            }
            this.program_counter++;
        }
        execute() {
            let curr_instr = this.getInstructionRegister();
            let val;
            switch (curr_instr) {
                case 0x8d:
                    val = this.getAccumulator();
                    this.memory.writeIntermediate(this.address, val);
                    break;
                case 0xee:
                    val = this.memory.readIntermediate(this.address) + 1;
                    this.memory.writeIntermediate(this.address, val);
                    break;
                case 0xff:
                    if (this.printNumber) {
                        _Console.lwPutText(this.get_y_register(), true);
                        this.printNumber = false;
                    }
                    else if (this.printString) {
                        let num = this.memory.readIntermediate(this.stringCounter);
                        if (num === 0x00) {
                            this.printString = false;
                        }
                        else {
                            _Console.lwPutText(TSOS.Ascii.fromCharCode(num), true);
                            this.stringCounter++;
                        }
                    }
                default:
                    break;
            }
        }
        cycle() {
            this.program_log();
            switch (this.curr_cycle) {
                case cycle.fetch:
                    this.fetch();
                    this.curr_cycle = cycle.decode;
                    break;
                case cycle.decode:
                    this.decode();
                    this.curr_cycle = cycle.execute;
                    break;
                case cycle.execute:
                    this.execute();
                    if (this.printString) {
                        this.execute();
                    }
                    else {
                        this.curr_cycle = cycle.fetch;
                    }
                    break;
                default:
                    break;
            }
        }
        // log to see the current cpu state
        program_log(pcbState = null) {
            // lets make a copy of our PCB, we dont want a global object or a reference to a pcb, this causes trouble
            let _displayPcb = {
                iRegister: this.insuction_register,
                xRegister: this.x_register,
                yRegister: this.y_register,
                pid: _CurrentPcbId,
                programCounter: this.program_counter,
                state: pcbState !== null && pcbState !== void 0 ? pcbState : "running",
            };
            TSOS.Control.hostDisplayPcbs(_displayPcb);
            TSOS.Control.hostDisplayCpu(this);
            TSOS.Control.hostDisplayMemory(this.memory.memory.mainMemory);
        }
    }
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpu.js.map
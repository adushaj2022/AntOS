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
        cycle[cycle["write_back"] = 3] = "write_back";
    })(cycle || (cycle = {}));
    class Cpu {
        constructor() {
            this.accumulator = 0; //accumulator initialized to 0
            this.x_register = 0; //x reg initialized to 0
            this.y_register = 0; //y reg initialized to 0
            this.insuction_register = 0; //current instruction initialzied to 0
            this.program_counter = 0; //program counter
            this.cpuClockCount = 0; //clockCount to count pulses
            this.curr_steps = 0; //keep track of which operand we are on for two operand instructions
            this.curr_cycle = cycle.fetch;
            this.postdecode = 0; //switch to tell us we finished a decode
            this.postexecute = 0; //switch to tell us we finished a execute
            this.preinterrupt = 0; //switch to tell us we need to perform an interrupt
            this.oneStep = false; //switch to tell us we have one operand to deal with
            this.twoStep = false; //switch to tell us we have two operands to deal with
            this.doExecute = false; //switch to tell us we need to execute
            this.doWriteBack = false; //switch to tell us we need a writeback
            this.process_String = false; //switch to tell us we have a string that needs processing
            this.executeTwo = false; //switch to tell us that we have to two executes
            this.zFlag = true; //zFLag to tell us if we can branch
            this.isExecuting = false;
            this.memory = _MemoryAccessor;
            this.map = TSOS.Utils.instructionSetMap();
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
            //fetch cycle, grab contents of memory at location of program counter
            let instruction = this.memory.readIntermediate(this.program_counter++);
            this.setInsctrutionRegister(instruction);
        }
        decode() {
            //although its one decode function, it handles one decode and multiple
            let instr = this.getInstructionRegister();
            //first case is for single op codes (usually a constant)
            if (this.oneStep) {
                //we know we are in this if statement if we finished a first decode and saw it has an operand
                this.memory.setMDR(this.memory.readIntermediate(this.program_counter++));
                if (instr === 0xa9) {
                    this.setAccumulator(this.memory.getMDR());
                }
                else if (instr === 0xa2) {
                    this.set_x_register(this.memory.getMDR());
                }
                else if (instr === 0xa0) {
                    this.set_y_register(this.memory.getMDR());
                }
                else if (instr === 0xd0) {
                    /*
                                branches
                            */
                    let twos_comp = TSOS.Utils.twos_comp(this.memory.getMDR());
                    if (this.zFlag) {
                        this.program_counter -= twos_comp;
                    }
                }
                this.doExecute = false; //no need to execute //this should be false already
                this.oneStep = false; //set to false, we do not know the next instr
                return; //return so we do not override any flags
            }
            else if (this.twoStep) {
                //we know we are in this if statement if we finished a first decode and saw it has two operands
                let curr_byte = this.memory.readIntermediate(this.program_counter++);
                ++this.curr_steps; //this will keep track of which part of the decode we are on
                if (this.curr_steps === 1) {
                    //if count is 1, we know we are at a LOB
                    this.memory.setHighOrderByte(curr_byte);
                    this.twoStep = true;
                    this.doExecute = false;
                }
                else if (this.curr_steps === 2) {
                    //if count is 2, we know we are at a HOB
                    this.memory.setLowOrderByte(curr_byte);
                    this.curr_steps = 0; //reset count for next time
                    //now that we know we are on the last part of the decode, find which instr we are in and act accordingly
                    if (this.curr_steps === 0) {
                        this.doExecute = true;
                    }
                    this.twoStep = false;
                }
                return;
            }
            //-----------------------------------------------------------------------------------------------------
            //this indicates we are in the first part of a decode       (INITIAL DECODES)
            if (this.map.has(instr) && this.map.get(instr) == 0) {
                //ok, handle instructions that have no opcodes
                if (instr === 0x8a) {
                    this.setAccumulator(this.get_x_register());
                    this.doExecute = false; //similarly, these instructions have no executes so we set doExe flag to false
                }
                else if (instr === 0x98) {
                    //we will use this flag in pulse to appropriately pick the next cycle
                    this.setAccumulator(this.get_y_register());
                    this.doExecute = false;
                }
                else if (instr === 0xaa) {
                    this.set_x_register(this.getAccumulator());
                    this.doExecute = false;
                }
                else if (instr === 0xa8) {
                    this.set_y_register(this.getAccumulator());
                    this.doExecute = false;
                }
                else if (instr === 0xea) {
                    this.doExecute = false;
                }
                else if (instr === 0x00) {
                    this.doExecute = false;
                    this.isExecuting = false;
                    // Need to update PCB row in table
                    _Pcb.iRegister = this.insuction_register;
                    _Pcb.xRegister = this.x_register;
                    _Pcb.yRegister = this.y_register;
                    _Pcb.zRegister = this.zFlag;
                    _Pcb.programCounter = this.program_counter;
                    _Pcb.state = "done";
                    TSOS.Control.hostDisplayPcbs(_Pcb);
                    _OsShell.handleInput("", true, _OsShell.shellMessage);
                }
                else if (instr === 0xff) {
                    //process system calls,
                    if (this.get_x_register() === 1 || this.get_x_register() === 2) {
                        //if one is in no need to decode
                        this.doExecute = true;
                    }
                }
            }
            else if (this.map.has(instr) && this.map.get(instr) == 1) {
                //handle insctructions with one opcode
                this.oneStep = true; //this flag will help us to decode twice
                this.doExecute = false; //this flag will make sure we do not execute, becayse we set the accumulator inside decode
            }
            else if (this.map.has(instr) && this.map.get(instr) === 2) {
                this.twoStep = true; //this switch will help us decode three times (2 after the initial one)
                this.doExecute = false;
            }
        }
        execute() {
            let curr_instruction = this.getInstructionRegister();
            if (this.process_String) {
                //Case for a string
                if (this.memory.readIntermediate(this.memory.getMAR()) === 0x00) {
                    //make sure we are not a halt
                    this.process_String = false;
                    return;
                }
                _Console.lwPutText(TSOS.Ascii.fromCharCode(this.memory.readIntermediate(this.memory.getMAR()))); // print char
                this.memory.setMAR(this.memory.getMAR() + 1); // increment MAR
                return;
            }
            if (this.executeTwo) {
                if (curr_instruction == 0xee) {
                    //increment has a second execute
                    let accumulator_data = this.getAccumulator();
                    this.setAccumulator(++accumulator_data);
                    this.executeTwo = false;
                    this.doWriteBack = true;
                    return;
                }
            }
            if (curr_instruction == 0xad) {
                //initial executes
                let address_register = this.memory.convert_to_li_format();
                let data = this.memory.readIntermediate(address_register);
                this.setAccumulator(data);
            }
            else if (curr_instruction == 0x8d) {
                let address_register = this.memory.convert_to_li_format();
                let data_register = this.getAccumulator();
                this.memory.writeIntermediate(address_register, data_register);
            }
            else if (curr_instruction === 0x6d) {
                let address = this.memory.convert_to_li_format();
                let data = this.memory.readIntermediate(address);
                let accum_data = this.getAccumulator() + data;
                this.setAccumulator(accum_data);
            }
            else if (curr_instruction === 0xae) {
                let address = this.memory.convert_to_li_format();
                let data = this.memory.readIntermediate(address);
                this.set_x_register(data);
            }
            else if (curr_instruction === 0xac) {
                let address = this.memory.convert_to_li_format();
                let data = this.memory.readIntermediate(address);
                this.set_y_register(data);
            }
            else if (curr_instruction === 0xee) {
                let address = this.memory.convert_to_li_format();
                let data = this.memory.readIntermediate(address);
                this.setAccumulator(data);
                this.doExecute = true;
                this.executeTwo = true;
            }
            else if (curr_instruction === 0xec) {
                let address = this.memory.convert_to_li_format();
                let data = this.memory.readIntermediate(address);
                if (data === this.get_x_register()) {
                    this.zFlag = false;
                }
            }
            else if (curr_instruction === 0xff) {
                if (this.get_x_register() == 1) {
                    _Console.lwPutText(this.get_y_register().toString(16));
                }
                else {
                    this.process_String = true;
                    this.memory.setMAR(this.get_y_register());
                }
            }
        }
        write_back() {
            //this cycle is only for EE
            let address = this.memory.convert_to_li_format();
            let data = this.getAccumulator();
            this.memory.writeIntermediate(address, data);
            this.doWriteBack = false;
        }
        /*
            Real 6502s can only complete one insctrution cycle per pulse
            We take this into account
        */
        cycle() {
            this.program_log(); // show output to table
            _Kernel.krnTrace("Cpu executing");
            // If we are at processing a string, return and execute
            if (this.process_String) {
                this.execute();
                return;
            }
            if (this.postexecute === 1) {
                //check to see if we just finished an execute, we will check for second execute &| write back
                if (this.executeTwo) {
                    //if we executed, but need another lets do another
                    this.postexecute = 1;
                    this.execute();
                    return;
                }
                if (this.doWriteBack && !this.executeTwo) {
                    //after we finish second execute we now
                    //have writeback set to true and twoExecute to false
                    //therefore we do the write back and reset the execute switch
                    this.curr_cycle = cycle.fetch; //move pointer to fetch
                    this.doExecute = false;
                    this.write_back();
                    return;
                }
            } //if we just finished an execute lets check for a writeback (this is only for EE (Increment))
            if (this.postdecode === 1) {
                //this indicates we just finished a decode
                if (this.process_String) {
                    //check for String
                    this.curr_cycle = cycle.execute;
                }
                else if (this.doExecute) {
                    //if the instruction is ready for an execute -- go ahead and execute
                    this.doExecute = false;
                    this.curr_cycle = cycle.execute; //change pointer to fetch to grab new instrc
                    ++this.postexecute;
                }
                //if oneStep and twoStep are false, this indicates we are in a no operand instr like "98"
                //similarly these instructions also do not have executes (with FF as an exception)
                else if (!this.oneStep && !this.twoStep && !this.doExecute) {
                    this.curr_cycle = cycle.fetch; // fetch again, this is the end of the cycle
                }
                //this is the case for a single op code operand-- A9 06, we will call the second decode, then reset its one step
                // and two step to false and then the above condition will get triggered next time around
                else if (this.oneStep) {
                    this.curr_cycle = cycle.decode;
                }
                //this is the case for a two operand instr like 8D 00 40, first decode grabs 8d, second grabs 00
                //third grabs 40, and when the third finishes it, we will make the "doExecute" set to true
                //we do this because we then need to write to memory
                else if (this.twoStep) {
                    if (!this.doExecute) {
                        this.curr_cycle = cycle.decode;
                    }
                }
                this.postdecode = 0; //reset the switch
            }
            //use these three cycles to do what they need, but above we will have to navigate to pick the right one
            //some are concominate like fetch always always points to a decode
            //-------------------------------------------------------------------------------------
            if (this.curr_cycle === cycle.fetch) {
                this.curr_cycle = cycle.decode;
                this.fetch();
            }
            else if (this.curr_cycle === cycle.decode) {
                ++this.postdecode;
                this.decode();
            }
            else if (this.curr_cycle === cycle.execute) {
                this.curr_cycle = cycle.fetch;
                this.postexecute = 1;
                this.execute();
            }
        }
        program_log() {
            //log to see the current cpu state
            TSOS.Control.hostDisplayCpu(this);
        }
    }
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpu.js.map
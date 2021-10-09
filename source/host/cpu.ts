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

module TSOS {
  enum cycle { ///enum to represent the cycles
    fetch,
    decode,
    execute,
  }

  export class Cpu {
    public accumulator: number = 0; //accumulator initialized to 0
    public x_register: number = 0; //x reg initialized to 0
    public y_register: number = 0; //y reg initialized to 0
    public insuction_register: number = 0; //current instruction initialzied to 0
    public program_counter = 0; //program counter
    public curr_cycle: cycle = cycle.fetch;
    public map: Map<number, number>; //hashmap of insctrutions
    public zFlag = 0; //zFLag to tell us if we can branch
    public isExecuting = false;
    public memory: MemoryAccessor = _MemoryAccessor;

    public printString = false;
    public printNumber = false;

    public prev_pc = -1;

    public stringCounter = 0;

    public lob = -1;
    public address = 0;

    constructor() {
      this.map = Utils.instructionSetMap();
    }

    private setInsctrutionRegister(insuction_register: number): void {
      this.insuction_register = insuction_register;
    }

    private getInstructionRegister(): number {
      return this.insuction_register;
    }

    private setAccumulator(accumulator: number): void {
      this.accumulator = accumulator;
    }

    private getAccumulator(): number {
      return this.accumulator;
    }

    private set_y_register(y_register: number): void {
      this.y_register = y_register;
    }

    private get_y_register(): number {
      return this.y_register;
    }

    private set_x_register(x_register: number): void {
      this.x_register = x_register;
    }

    private get_x_register(): number {
      return this.x_register;
    }

    public fetch(): void {
      let instruction = this.memory.readIntermediate(this.program_counter);
      this.setInsctrutionRegister(instruction);
      this.program_counter += 1;
    }

    public decode(): void {
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
          this.setAccumulator(
            this.getAccumulator() + this.memory.readIntermediate(this.address)
          );
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
          console.log(Utils.showHexValue(this.address));
          this.set_y_register(this.memory.readIntermediate(this.address));
          this.program_counter += 2; // this seems to be one step behind, increment 2
        case 0xea: // leave here for readability, I know its useless
          this.program_counter -= 1;
          break; // no op
        case 0x00:
          this.isExecuting = false;
          _Pcb.iRegister = this.insuction_register;
          _Pcb.xRegister = this.x_register;
          _Pcb.yRegister = this.y_register;
          _Pcb.zRegister = this.zFlag;
          _Pcb.programCounter = this.program_counter;
          _Pcb.state = "done";
          Control.hostDisplayPcbs(_Pcb);
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
          } else {
            this.zFlag = 0;
          }
          this.program_counter++;
          break;

        // HANDLE OVERFLOWS
        case 0xd0:
          if (this.zFlag === 0) {
            let space = _MemoryManager.totalAddressableSpace();
            if (this.program_counter + value > space) {
              // this.program_counter =
              //   ((this.program_counter + value) % space) - 1;
              this.program_counter -= Utils.twos_comp(value);
            } else {
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
          } else if (this.get_x_register() === 2) {
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

    public execute(): void {
      let curr_instr = this.getInstructionRegister();
      let val: number;
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
            _Console.lwPutText(this.get_y_register());
            this.printNumber = false;
          } else if (this.printString) {
            let num = this.memory.readIntermediate(this.stringCounter);
            if (num === 0x00) {
              this.printString = false;
            } else {
              _Console.lwPutText(Ascii.fromCharCode(num));
              this.stringCounter++;
            }
          }
        // string or int
        default:
          break;
      }
    }

    public cycle(): void {
      this.program_log();
      // for debugging
      // console.log({
      //   acc: this.getAccumulator(),
      //   z: this.zFlag,
      //   pc: this.program_counter,
      //   x: Utils.showHexValue(this.get_x_register()),
      //   y: Utils.showHexValue(this.get_y_register()),
      //   ir: Utils.showHexValue(this.getInstructionRegister()),
      // });
      Control.hostDisplayMemory(this.memory.memory.mainMemory);
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
          } else {
            this.curr_cycle = cycle.fetch;
          }
          break;
        default:
          // uh oh
          break;
      }
    }

    public program_log(): void {
      //log to see the current cpu state
      Control.hostDisplayCpu(this);
    }
  }
}

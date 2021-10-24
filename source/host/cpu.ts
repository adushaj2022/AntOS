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
  export enum cycle { ///enum to represent the cycles
    fetch,
    decode,
    execute,
  }

  export class Cpu {
    public accumulator: number = 0;
    public x_register: number = 0;
    public y_register: number = 0;
    public insuction_register: number = 0;
    public program_counter = 0;
    public curr_cycle: cycle = cycle.fetch;
    public zFlag = 0; //zFLag to tell us if we can branch
    public isExecuting = false;
    public memory: MemoryAccessor = _MemoryAccessor;

    public printString = false;
    public printNumber = false;

    public stringCounter = 0;

    public lob = -1;
    public address = 0;

    constructor() {}

    public resetRegisters() {
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
      let instruction = this.memory.readIntermediate(
        this.program_counter + 256 * _CurrentPartition
      );
      this.setInsctrutionRegister(instruction);
      this.program_counter += 1;
    }

    public decode(): void {
      let curr_instr = this.getInstructionRegister();
      let value = this.memory.readIntermediate(
        this.program_counter + 256 * _CurrentPartition
      );

      switch (curr_instr) {
        case 0xa9:
          this.setAccumulator(value);
          break;
        case 0xad:
          this.lob = this.memory.readIntermediate(
            this.program_counter + 1 + 256 * _CurrentPartition
          );
          this.memory.setHighOrderByte(value);
          this.memory.setLowOrderByte(this.lob);
          this.address = this.memory.convert_to_li_format();
          this.setAccumulator(
            this.memory.readIntermediate(this.address + 256 * _CurrentPartition)
          );
          this.program_counter += 1;
          break;
        case 0x8d:
          this.lob = this.memory.readIntermediate(
            this.program_counter + 1 + 256 * _CurrentPartition
          );
          this.memory.setHighOrderByte(value);
          this.memory.setLowOrderByte(this.lob);
          this.address = this.memory.convert_to_li_format();
          this.program_counter += 1;
          break;
        // we store the value in memory when we execute
        case 0x6d:
          this.lob = this.memory.readIntermediate(
            this.program_counter + 1 + 256 * _CurrentPartition
          );
          this.memory.setHighOrderByte(value);
          this.memory.setLowOrderByte(this.lob);
          this.address = this.memory.convert_to_li_format();
          this.setAccumulator(
            this.getAccumulator() +
              this.memory.readIntermediate(
                this.address + 256 * _CurrentPartition
              )
          );
          this.program_counter += 1;
          break;
        case 0xa2:
          this.set_x_register(value);
          break;
        case 0xae:
          this.lob = this.memory.readIntermediate(
            this.program_counter + 1 + 256 * _CurrentPartition
          );
          this.memory.setHighOrderByte(value);
          this.memory.setLowOrderByte(this.lob);
          this.address = this.memory.convert_to_li_format();
          this.set_x_register(
            this.memory.readIntermediate(this.address + 256 * _CurrentPartition)
          );
          this.program_counter += 1;
          break;

        case 0xa0:
          this.set_y_register(value);
          break;
        case 0xac:
          this.lob = this.memory.readIntermediate(
            this.program_counter + 1 + 256 * _CurrentPartition
          );
          this.memory.setHighOrderByte(value);
          this.memory.setLowOrderByte(this.lob);
          this.address = this.memory.convert_to_li_format();
          this.set_y_register(
            this.memory.readIntermediate(this.address + 256 * _CurrentPartition)
          );
          this.program_counter += 2;
        case 0xea:
          this.program_counter -= 1;
          break; // no op
        case 0x00:
          // End of a program
          if (!RoundRobinScheduler.isActivated) {
            this.isExecuting = false;
          } else {
            // if all processes are terminated, lets stop executing
            Context.processMap.get(_CurrentPcbId).state = "terminated";
            if (Context.allTerminated()) {
              this.isExecuting = false;
              RoundRobinScheduler.isActivated = false;

              // lets update our GUI
              _OsShell.handleInput("", true, () =>
                _Console.putText("ALL programs completed")
              );
              this.program_log("terminated");
              return;
            }
          }

          _OsShell.handleInput("", true, _OsShell.shellMessage);
          break;

        case 0xec:
          this.lob = this.memory.readIntermediate(
            this.program_counter + 1 + 256 * _CurrentPartition
          );
          this.memory.setHighOrderByte(value);
          this.memory.setLowOrderByte(this.lob);
          this.address = this.memory.convert_to_li_format();
          let currValue = this.memory.readIntermediate(
            this.address + 256 * _CurrentPartition
          );
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
            let space = PARTITION_SIZE;
            if (this.program_counter + value > space) {
              this.program_counter -= Utils.twos_comp(value);
            } else {
              this.program_counter += value;
            }
          }
          break;
        case 0xee:
          this.lob = this.memory.readIntermediate(
            this.program_counter + 1 + 256 * _CurrentPartition
          );
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
          this.memory.writeIntermediate(
            this.address + 256 * _CurrentPartition,
            val
          );
          break;

        case 0xee:
          val =
            this.memory.readIntermediate(
              this.address + 256 * _CurrentPartition
            ) + 1;
          this.memory.writeIntermediate(
            this.address + 256 * _CurrentPartition,
            val
          );
          break;

        case 0xff:
          if (this.printNumber) {
            _Console.lwPutText(this.get_y_register(), true);
            this.printNumber = false;
          } else if (this.printString) {
            let num = this.memory.readIntermediate(
              this.stringCounter + 256 * _CurrentPartition
            );
            if (num === 0x00) {
              this.printString = false;
            } else {
              _Console.lwPutText(Ascii.fromCharCode(num), true);
              this.stringCounter++;
            }
          }
        default:
          break;
      }
    }

    public cycle(): void {
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
          } else {
            this.curr_cycle = cycle.fetch;
          }
          break;
        default:
          break;
      }
    }

    // log to see the current cpu state
    public program_log(pcbState = null): void {
      // lets make a copy of our PCB, we dont want a global object or a reference to a pcb, this causes trouble
      let _displayPcb = {
        iRegister: this.insuction_register,
        xRegister: this.x_register,
        yRegister: this.y_register,
        pid: _CurrentPcbId,
        programCounter: this.program_counter,
        state: pcbState ?? "running",
      } as DisplayPCB;

      Control.hostDisplayPcbs(_displayPcb);
      Control.hostDisplayCpu(this);
      Control.hostDisplayMemory(this.memory.memory.mainMemory);
    }
  }
}

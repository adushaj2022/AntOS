module TSOS {
  export class MemoryAccessor {
    public memory: Memory;

    private lob: number = 0x00;
    private hob: number = 0x00;

    // Memory gets passed in, then we access its actual memory contents with methods here
    constructor(memory: Memory) {
      this.memory = memory;
    }

    public writeIntermediate(address: number, data: number): void {
      this.memory.setMAR(address + 256 * _CurrentPartition);
      this.memory.setMDR(data);
      if (this.getMDR() > _MemoryManager.totalAddressableSpace()) {
        _StdOut.putText("Memory out of bounds");
        _CPU.isExecuting = false; // stop program
      } else if (this.getMDR() > 256 * (_CurrentPcbId + 1)) {
        _StdOut.lwPutText(
          `PCB - ${_CurrentPcbId} does not have access to this portion of memory`
        );
        _CPU.isExecuting = false;
      } else {
        this.memory.write(); // valid write to memory
      }
    }

    public readIntermediate(address: number): number {
      this.setMAR(address + 256 * _CurrentPartition);
      return this.memory.read(); //accepts an address and gives us the data there
    }

    //Helper / Util method
    public setMAR(mar: number, martwo?: number): void {
      // this method will accept one pamemoryter or two (method overloading)
      if (typeof mar === "number" && typeof martwo === "undefined") {
        return this.memory.setMAR(mar); //in this case, it will accept a one 4 digit hex number and set it
      } else if (typeof mar === "number" && typeof martwo === "number") {
        this.setLowOrderByte(mar); //set the bytes
        this.setHighOrderByte(martwo); //set the bytes so we can convert on the next line
        return this.memory.setMAR(this.convert_to_li_format()); //in this case it will accept two two digit hex numbers and convert them then set the converted number
      }
    }

    public loadMemory(arr: Array<number>, offset: number = 0): number {
      for (let i = 0; i < arr.length; i++) {
        this.writeIntermediate(i + offset, arr[i]);
      }

      return arr.length + offset; // return the last index we used, needed for when were creating multiple pids
    }

    public setLowOrderByte(lob: number): void {
      this.lob = lob; //setter for low order byte
    }

    public setHighOrderByte(hob: number): void {
      this.hob = hob; //setter for high order byte
    }

    public getLowOrderByte(): number {
      return this.lob; //getter for low order byte
    }

    public getHighOrderByte(): number {
      return this.hob; //getter for high order byte
    }

    //Helper / Util method
    public getMAR(): number {
      return this.memory.getMAR();
    }

    //Helper / Util method
    public setMDR(mdr: number): void {
      this.memory.setMDR(mdr);
    }

    //Helper / Util method
    public getMDR(): number {
      return this.memory.getMDR();
    }

    //Helper / Util method
    public read(): number {
      return this.memory.read();
    }

    //Helper / Util method
    public write(): void {
      return this.memory.write();
    }

    public convert_to_li_format(): number {
      let b: number = this.getLowOrderByte(); //get LOB
      let a: number = this.getHighOrderByte(); //get HOB

      b = b << 8; //shift LOB two places left
      b += a; //add HOB --> final answer

      return b;
    }
  }
}

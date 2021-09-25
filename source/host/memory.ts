module TSOS {
  export class Memory {
    private mainMemory: number[] = new Array(0xffff); //representation of memory
    private mar: number = 0x0000; //Memory Address Reg
    private mdr: number = 0x00; //Memory Data Reg

    constructor() {}

    //setter for memory address register
    public setMAR(mar: number): void {
      this.mar = mar;
    }

    //getter for memory address register
    public getMAR(): number {
      return this.mar;
    }

    //setter for memory data register
    public setMDR(mdr: number): void {
      this.mdr = mdr;
    }

    //getter for memory data register
    public getMDR(): number {
      return this.mdr;
    }

    //sets mar, mdr, and all of memory to 0
    public init(): void {
      this.fillArray();
      this.setMAR(0x0000);
      this.setMDR(0x00);
    }

    //returns the data (mdr) from a specificed address (mar)
    public read(): number {
      return this.mainMemory[this.getMAR()];
    }

    //sets the data (mdr) from a specificed address (mar)
    public write(): void {
      this.mainMemory[this.getMAR()] = this.getMDR();
    }

    //reset memory
    public fillArray(): void {
      for (let i = 0x00; i < this.mainMemory.length; ++i) {
        this.mainMemory[i] = 0x00;
      }
    }

    //method to check if array has anything besides 0s (is it empty or not)
    public isMemoryEmpty(): boolean {
      for (let i = 0x00; i < this.mainMemory.length; ++i) {
        if (this.mainMemory[i] != 0x00) {
          return false;
        }
      }
      return true;
    }

    //get total addressable Space --> array is private therefore well use this to get the length
    public totalAddressableSpace(): number {
      return this.mainMemory.length + 0x01;
    }

    public memoryDump(
      fromAddress: number,
      toAddress: number
    ): Array<string | number> {
      let memoryContents = [];
      for (let i = fromAddress; i <= toAddress; ++i) {
        memoryContents.push[this.mainMemory[i]];
      }
      return memoryContents;
    }
  }
}

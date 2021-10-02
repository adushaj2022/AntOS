module TSOS {
  export class Memory {
    public mainMemory: number[] = new Array(0xff); //representation of memory
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

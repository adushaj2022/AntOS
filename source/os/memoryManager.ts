module TSOS {
  export class MemoryManager {
    public mainMemory: number[];
    constructor(mainMemory: number[]) {
      this.mainMemory = mainMemory;
    }

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

    public isAddressAvailable(start: number, end: number) {
      for (let i = start; i < end; i++) {
        if (this.mainMemory[i] !== 0x00) {
          return false;
        }
      }
      return true;
    }
  }
}

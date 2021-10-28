module TSOS {
  type TPartition = {
    id: 0 | 1 | 2;
    start: number;
    end: number;
    process: ProcessControlBlock | null;
  };

  export class MemoryManager {
    public mainMemory: number[];
    public partitions: Array<TPartition> = [];
    constructor(mainMemory: number[]) {
      this.mainMemory = mainMemory;
      this.setPartitions();
    }

    public isMemoryEmpty(): boolean {
      for (let i = 0x00; i < this.mainMemory.length; ++i) {
        if (this.mainMemory[i] != 0x00) {
          return false;
        }
      }
      return true;
    }
    public totalAddressableSpace(): number {
      return this.mainMemory.length;
    }

    public usePartition(pcb: ProcessControlBlock): boolean | number {
      let p = this.getFirstAvailablePartition() as any;
      if (!p) {
        return false;
      }
      p.process = pcb;
      return p.id;
    }

    public addToAvailablePartitions(givenPid: number) {
      this.partitions = this.partitions.map((pt) => {
        if (pt.id === givenPid) {
          pt.process = null;
        }
        return pt;
      });
    }

    public getFirstAvailablePartition(): boolean | TPartition {
      this.partitions.sort((a, b) => a.id - b.id);
      for (let p of this.partitions) {
        if (p.process === null) {
          return p;
        }
      }
      return false;
    }

    public setPartitions(): void {
      this.partitions = [
        {
          id: 0,
          start: 0,
          end: 255,
          process: null,
        },
        { id: 1, start: 256, end: 511, process: null },
        { id: 2, start: 512, end: 767, process: null },
      ];
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

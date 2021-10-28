var TSOS;
(function (TSOS) {
    class MemoryManager {
        constructor(mainMemory) {
            this.partitions = [];
            this.mainMemory = mainMemory;
            this.setPartitions();
        }
        isMemoryEmpty() {
            for (let i = 0x00; i < this.mainMemory.length; ++i) {
                if (this.mainMemory[i] != 0x00) {
                    return false;
                }
            }
            return true;
        }
        totalAddressableSpace() {
            return this.mainMemory.length;
        }
        usePartition(pcb) {
            let p = this.getFirstAvailablePartition();
            if (!p) {
                return false;
            }
            p.process = pcb;
            return p.id;
        }
        addToAvailablePartitions(givenPid) {
            this.partitions = this.partitions.map((pt) => {
                if (pt.id === givenPid) {
                    pt.process = null;
                }
                return pt;
            });
        }
        getFirstAvailablePartition() {
            this.partitions.sort((a, b) => a.id - b.id);
            for (let p of this.partitions) {
                if (p.process === null) {
                    return p;
                }
            }
            return false;
        }
        setPartitions() {
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
        isAddressAvailable(start, end) {
            for (let i = start; i < end; i++) {
                if (this.mainMemory[i] !== 0x00) {
                    return false;
                }
            }
            return true;
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map
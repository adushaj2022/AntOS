var TSOS;
(function (TSOS) {
    class MemoryManager {
        constructor(mainMemory) {
            this.mainMemory = mainMemory;
        }
        isMemoryEmpty() {
            for (let i = 0x00; i < this.mainMemory.length; ++i) {
                if (this.mainMemory[i] != 0x00) {
                    return false;
                }
            }
            return true;
        }
        //get total addressable Space --> array is private therefore well use this to get the length
        totalAddressableSpace() {
            return this.mainMemory.length;
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
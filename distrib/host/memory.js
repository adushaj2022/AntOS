var TSOS;
(function (TSOS) {
    class Memory {
        constructor() {
            this.mainMemory = new Array(0xffff); //representation of memory
            this.mar = 0x0000; //Memory Address Reg
            this.mdr = 0x00; //Memory Data Reg
        }
        //setter for memory address register
        setMAR(mar) {
            this.mar = mar;
        }
        //getter for memory address register
        getMAR() {
            return this.mar;
        }
        //setter for memory data register
        setMDR(mdr) {
            this.mdr = mdr;
        }
        //getter for memory data register
        getMDR() {
            return this.mdr;
        }
        //sets mar, mdr, and all of memory to 0
        init() {
            this.fillArray();
            this.setMAR(0x0000);
            this.setMDR(0x00);
        }
        //returns the data (mdr) from a specificed address (mar)
        read() {
            return this.mainMemory[this.getMAR()];
        }
        //sets the data (mdr) from a specificed address (mar)
        write() {
            this.mainMemory[this.getMAR()] = this.getMDR();
        }
        //reset memory
        fillArray() {
            for (let i = 0x00; i < this.mainMemory.length; ++i) {
                this.mainMemory[i] = 0x00;
            }
        }
        //method to check if array has anything besides 0s (is it empty or not)
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
            return this.mainMemory.length + 0x01;
        }
        memoryDump(fromAddress, toAddress) {
            let memoryContents = [];
            for (let i = fromAddress; i <= toAddress; ++i) {
                memoryContents.push[this.mainMemory[i]];
            }
            return memoryContents;
        }
    }
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memory.js.map
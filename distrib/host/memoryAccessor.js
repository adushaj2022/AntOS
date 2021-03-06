var TSOS;
(function (TSOS) {
    class MemoryAccessor {
        // Memory gets passed in, then we access its actual memory contents with methods here
        constructor(memory) {
            this.lob = 0x00;
            this.hob = 0x00;
            this.memory = memory;
        }
        writeIntermediate(address, data) {
            this.memory.setMAR(address + 256 * _CurrentPartition);
            this.memory.setMDR(data);
            this.memory.write(); // valid write to memory
        }
        readIntermediate(address, partition = _CurrentPartition) {
            this.setMAR(address + 256 * partition);
            return this.memory.read(); //accepts an address and gives us the data there
        }
        //Helper / Util method
        setMAR(mar, martwo) {
            // this method will accept one pamemoryter or two (method overloading)
            if (typeof mar === "number" && typeof martwo === "undefined") {
                return this.memory.setMAR(mar); //in this case, it will accept a one 4 digit hex number and set it
            }
            else if (typeof mar === "number" && typeof martwo === "number") {
                this.setLowOrderByte(mar); //set the bytes
                this.setHighOrderByte(martwo); //set the bytes so we can convert on the next line
                return this.memory.setMAR(this.convert_to_li_format()); //in this case it will accept two two digit hex numbers and convert them then set the converted number
            }
        }
        loadMemory(arr, offset = 0) {
            for (let i = 0; i < arr.length; i++) {
                this.writeIntermediate(i + offset, arr[i]);
            }
            return arr.length + offset; // return the last index we used, needed for when were creating multiple pids
        }
        setLowOrderByte(lob) {
            this.lob = lob; //setter for low order byte
        }
        setHighOrderByte(hob) {
            this.hob = hob; //setter for high order byte
        }
        getLowOrderByte() {
            return this.lob; //getter for low order byte
        }
        getHighOrderByte() {
            return this.hob; //getter for high order byte
        }
        //Helper / Util method
        getMAR() {
            return this.memory.getMAR();
        }
        //Helper / Util method
        setMDR(mdr) {
            this.memory.setMDR(mdr);
        }
        //Helper / Util method
        getMDR() {
            return this.memory.getMDR();
        }
        //Helper / Util method
        read() {
            return this.memory.read();
        }
        //Helper / Util method
        write() {
            return this.memory.write();
        }
        convert_to_li_format() {
            let b = this.getLowOrderByte(); //get LOB
            let a = this.getHighOrderByte(); //get HOB
            b = b << 8; //shift LOB two places left
            b += a; //add HOB --> final answer
            return b;
        }
    }
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryAccessor.js.map
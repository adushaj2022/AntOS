var TSOS;
(function (TSOS) {
    class MemoryAccessor {
        constructor(ram) {
            this.lob = 0x00;
            this.hob = 0x00;
            this.ram = ram;
        }
        writeIntermediate(address, data) {
            this.ram.setMAR(address);
            this.ram.setMDR(data);
            this.ram.write(); //set the MAR and MDR, then we can write to Memory
        }
        readIntermediate(address) {
            this.setMAR(address);
            return this.ram.read(); //accepts an address and gives us the data there
        }
        //Helper / Util method
        setMAR(mar, martwo) {
            // this method will accept one paramter or two (method overloading)
            if (typeof mar === "number" && typeof martwo === "undefined") {
                return this.ram.setMAR(mar); //in this case, it will accept a one 4 digit hex number and set it
            }
            else if (typeof mar === "number" && typeof martwo === "number") {
                this.setLowOrderByte(mar); //set the bytes
                this.setHighOrderByte(martwo); //set the bytes so we can convert on the next line
                return this.ram.setMAR(this.convert_to_li_format()); //in this case it will accept two two digit hex numbers and convert them then set the converted number
            }
        }
        /*
          Array of strings is passed because the string hex value will be passed, and we will parse it,
          offset will help us set memory at different locations other thanst arting for 0
        */
        loadMemory(arr, offset = 0) {
            for (let i = 0; i < arr.length; i++) {
                this.writeIntermediate(i + offset, parseInt(arr[i + offset], 16));
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
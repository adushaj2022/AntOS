module TSOS {
  export class MemoryAccessor {
    public ram: Memory;

    private lob: number = 0x00;
    private hob: number = 0x00;

    constructor(ram: Memory) {
      this.ram = ram;
    }

    public writeIntermediate(address: number, data: number): void {
      this.ram.setMAR(address);
      this.ram.setMDR(data);
      this.ram.write(); //set the MAR and MDR, then we can write to Memory
    }

    public readIntermediate(address: number): number {
      this.setMAR(address);
      return this.ram.read(); //accepts an address and gives us the data there
    }

    //Helper / Util method
    public setMAR(mar: number, martwo?: number): void {
      // this method will accept one paramter or two (method overloading)
      if (typeof mar === "number" && typeof martwo === "undefined") {
        return this.ram.setMAR(mar); //in this case, it will accept a one 4 digit hex number and set it
      } else if (typeof mar === "number" && typeof martwo === "number") {
        this.setLowOrderByte(mar); //set the bytes
        this.setHighOrderByte(martwo); //set the bytes so we can convert on the next line
        return this.ram.setMAR(this.convert_to_li_format()); //in this case it will accept two two digit hex numbers and convert them then set the converted number
      }
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

    public convert_to_li_format(): number {
      let b: number = this.getLowOrderByte(); //get LOB
      let a: number = this.getHighOrderByte(); //get HOB

      b = b << 8; //shift LOB two places left
      b += a; //add HOB --> final answer

      return b;
    }
  }
}

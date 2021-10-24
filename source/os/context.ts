/**
 * Switch information from our process to our cpu
 */
module TSOS {
  export class Context {
    // easy to way to keep track of pcb data
    static processMap = new Map<number, ProcessControlBlock>();

    // set cpu with new info
    static switch(process: ProcessControlBlock) {}

    // lets set the info on the pcbs here
    static setInfo(pcb: ProcessControlBlock) {}
  }
}

module TSOS {
  export class Dispatcher {
    static generateSoftwareInterrupt() {
      const interrupt = new Interrupt(SOFTWARE_IRQ, []);
      _KernelInterruptQueue.enqueue(interrupt);
    }

    static contextSwitch(prev: ProcessControlBlock, next: ProcessControlBlock) {
      Context.setPcbInfo(prev);
      Context.setCpuInfo(next);
    }
  }
}

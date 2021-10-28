module TSOS {
  export class Dispatcher {
    static generateSoftwareInterrupt() {
      const interrupt = new Interrupt(SOFTWARE_IRQ, []);
      _KernelInterruptQueue.enqueue(interrupt);
    }

    static contextSwitch(prev: ProcessControlBlock, next: ProcessControlBlock) {
      Control.hostLog(
        `Switching from PID - ${prev.pid} to PID - ${next.pid}`,
        "Dispatcher"
      );
      Context.setPcbInfo(prev);
      Context.setCpuInfo(next);
    }
  }
}

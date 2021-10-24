module TSOS {
  export class RoundRobinScheduler {
    static count = 0;
    static process: null | ProcessControlBlock = null;
    static isActivated = false;
    /**
     * Here the round robin will perform a cycle, every n cycles we need to switch processes,
     *  We switch by performing a context switch, we need to update the cpu with the information of the new process, but we also
     *  need to store the state of the previous process, the scheduling happens here, and context.ts file will update cpu and update our
     *  processes.
     */
    static doCycle() {
      if (this.count % _QUANTUM === 0 && this.count !== 0) {
        // update cpu here, and perform switch
        let top: ProcessControlBlock = _ReadyQueue.dequeue();
        if (top.state !== "terminated") _ReadyQueue.enqueue(top);

        let prev: ProcessControlBlock = top;
        let next: ProcessControlBlock = _ReadyQueue.peekFirst();

        Context.setPcbInfo(prev);
        Context.setCpuInfo(next);
      } else {
        this.process = _ReadyQueue.peekFirst();
        if (this.process) {
          _CurrentPartition = this.process.memoryPartitionId;
          _CurrentPcbId = this.process.pid;
        }
      }
      _CPU.cycle();
      this.count++;
    }
  }
}

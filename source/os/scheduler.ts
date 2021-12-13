module TSOS {
  export class RoundRobinScheduler {
    static count = 0;
    static process: null | ProcessControlBlock = null;
    static isActivated = true;
    /**
     * Here the round robin will perform a cycle, every n cycles we need to switch processes,
     *  We switch by performing a context switch, we need to update the cpu with the information of the new process, but we also
     *  need to store the state of the previous process, the scheduling happens here, and context.ts file will update cpu and update our
     *  processes.
     */
    static doCycle() {
      if (this.count % _QUANTUM === 0 && this.count !== 0) {
        Dispatcher.generateSoftwareInterrupt(); // generate interrupt
        // update cpu here, and perform switch
        let top: ProcessControlBlock = _ReadyQueue.dequeue();
        if (top.state !== "terminated") {
          _ReadyQueue.enqueue(top); // if its terminated we dont want it back in Queue
        } else {
          Control.hostDisplayPcbs(top);
        }

        let prev: ProcessControlBlock = top;
        let next: ProcessControlBlock = _ReadyQueue.peekFirst();

        if (next.location === "disk") {
          // swap
          // roll out
        }

        this.process = next;

        Dispatcher.contextSwitch(prev, next);
      } else {
        this.process = _ReadyQueue.peekFirst();
      }
      _CurrentPcbId = this.process.pid;
      _CurrentPartition = this.process.memoryPartitionId;
      _CPU.cycle();
      this.count++;
    }
  }

  export class FirstComeFirstServe {
    static isActivated = false;
    static process: null | ProcessControlBlock = null;
    static next: null | ProcessControlBlock;
    static shouldAdvance = false;
    static doCycle() {
      if (!this.isActivated) return;
      if (this.process === null) {
        this.process = _ReadyQueue.peekFirst();
      } else {
        if (this.shouldAdvance) {
          let top: ProcessControlBlock = _ReadyQueue.dequeue();
          let prev: ProcessControlBlock = top;
          let next: ProcessControlBlock = _ReadyQueue.peekFirst();
          this.process = next;
          if (next && prev) {
            Dispatcher.contextSwitch(prev, next);
          }
          this.shouldAdvance = false;
        }
        if (this.process) {
          _CurrentPcbId = this.process.pid;
          _CurrentPartition = this.process.memoryPartitionId;
          _CPU.cycle();
        }
      }
    }
  }
}

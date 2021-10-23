module TSOS {
  export class RoundRobinScheduler {
    static count = 0;
    static process: null | ProcessControlBlock = null;
    static isActivated = false;
    static doCycle() {
      if (this.count % _QUANTUM === 0 && this.count !== 0) {
        let top = _ReadyQueue.dequeue();
        _ReadyQueue.enqueue(top);
      } else {
        this.process = _ReadyQueue.peekFirst();
        console.log(this.process?.pid);
        // _CurrentPartition = 0;
        // _CPU.cycle();
      }
      this.count++;
    }
  }
}

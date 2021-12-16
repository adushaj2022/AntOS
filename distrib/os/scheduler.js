var TSOS;
(function (TSOS) {
    class RoundRobinScheduler {
        /**
         * Here the round robin will perform a cycle, every n cycles we need to switch processes,
         *  We switch by performing a context switch, we need to update the cpu with the information of the new process, but we also
         *  need to store the state of the previous process, the scheduling happens here, and context.ts file will update cpu and update our
         *  processes.
         */
        static doCycle() {
            if (this.count % _QUANTUM === 0 && this.count !== 0) {
                TSOS.Dispatcher.generateSoftwareInterrupt(); // generate interrupt
                // update cpu here, and perform switch
                let top = _ReadyQueue.dequeue();
                if (top.state !== "terminated") {
                    _ReadyQueue.enqueue(top); // if its terminated we dont want it back in Queue
                }
                else {
                    TSOS.Control.hostDisplayPcbs(top);
                }
                let prev = top;
                let next = _ReadyQueue.peekFirst();
                this.process = next;
                // if next program is disk, lets swap that program with the previous one in memory
                if (next.location === "disk") {
                    // swap
                    TSOS.Swapper.roll_out(next.memoryPartitionId, next.pid, prev.pid);
                    // change locations
                    prev.location = "disk";
                    next.location = "memory";
                }
                TSOS.Dispatcher.contextSwitch(prev, next);
            }
            else {
                this.process = _ReadyQueue.peekFirst();
            }
            _CurrentPcbId = this.process.pid;
            _CurrentPartition = this.process.memoryPartitionId;
            _CPU.cycle();
            this.count++;
        }
    }
    RoundRobinScheduler.count = 0;
    RoundRobinScheduler.process = null;
    RoundRobinScheduler.isActivated = true;
    TSOS.RoundRobinScheduler = RoundRobinScheduler;
    class FirstComeFirstServe {
        /**
         * Similar to round robin, but we simply want to dequeue a process,
         *  run the program until that process is over, next we advance and dequeue a new object,
         *  we are simply ,oving references from previous process to next process
         *
         */
        static doCycle() {
            if (!this.isActivated)
                return;
            if (this.process === null) {
                this.process = _ReadyQueue.peekFirst();
            }
            else {
                if (this.shouldAdvance) {
                    let top = _ReadyQueue.dequeue();
                    let prev = top;
                    let next = _ReadyQueue.peekFirst();
                    this.process = next;
                    // null checks, if one is null, no need to switch
                    if (next && prev) {
                        TSOS.Dispatcher.contextSwitch(prev, next);
                    }
                    // wait until next program is done
                    this.shouldAdvance = false;
                }
                // null check
                if (this.process) {
                    _CurrentPcbId = this.process.pid;
                    _CurrentPartition = this.process.memoryPartitionId;
                    _CPU.cycle();
                }
            }
        }
    }
    FirstComeFirstServe.isActivated = false;
    FirstComeFirstServe.process = null;
    FirstComeFirstServe.shouldAdvance = false;
    TSOS.FirstComeFirstServe = FirstComeFirstServe;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=scheduler.js.map
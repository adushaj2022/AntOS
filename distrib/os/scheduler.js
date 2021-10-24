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
                // update cpu here, and perform switch
                let top = _ReadyQueue.dequeue();
                if (top.state !== "terminated")
                    _ReadyQueue.enqueue(top);
                let prev = top;
                let next = _ReadyQueue.peekFirst();
                TSOS.Context.setPcbInfo(prev);
                TSOS.Context.setCpuInfo(next);
            }
            else {
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
    RoundRobinScheduler.count = 0;
    RoundRobinScheduler.process = null;
    RoundRobinScheduler.isActivated = false;
    TSOS.RoundRobinScheduler = RoundRobinScheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=scheduler.js.map
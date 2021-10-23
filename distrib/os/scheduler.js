var TSOS;
(function (TSOS) {
    class RoundRobinScheduler {
        static doCycle() {
            var _a;
            if (this.count % _QUANTUM === 0 && this.count !== 0) {
                let top = _ReadyQueue.dequeue();
                _ReadyQueue.enqueue(top);
            }
            else {
                this.process = _ReadyQueue.peekFirst();
                console.log((_a = this.process) === null || _a === void 0 ? void 0 : _a.pid);
                // _CurrentPartition = 0;
                // _CPU.cycle();
            }
            this.count++;
        }
    }
    RoundRobinScheduler.count = 0;
    RoundRobinScheduler.process = null;
    RoundRobinScheduler.isActivated = false;
    TSOS.RoundRobinScheduler = RoundRobinScheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=scheduler.js.map
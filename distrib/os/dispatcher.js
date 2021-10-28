var TSOS;
(function (TSOS) {
    class Dispatcher {
        static generateSoftwareInterrupt() {
            const interrupt = new TSOS.Interrupt(SOFTWARE_IRQ, []);
            _KernelInterruptQueue.enqueue(interrupt);
        }
        static contextSwitch(prev, next) {
            TSOS.Control.hostLog(`Switching from PID - ${prev.pid} to PID - ${next.pid}`, "Dispatcher");
            TSOS.Context.setPcbInfo(prev);
            TSOS.Context.setCpuInfo(next);
        }
    }
    TSOS.Dispatcher = Dispatcher;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=dispatcher.js.map
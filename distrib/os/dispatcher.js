var TSOS;
(function (TSOS) {
    class Dispatcher {
        static generateSoftwareInterrupt() {
            const interrupt = new TSOS.Interrupt(SOFTWARE_IRQ, []);
            _KernelInterruptQueue.enqueue(interrupt);
        }
    }
    TSOS.Dispatcher = Dispatcher;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=dispatcher.js.map
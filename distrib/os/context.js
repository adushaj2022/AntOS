/**
 * Switch information from our process to our cpu
 */
var TSOS;
(function (TSOS) {
    class Context {
        // set cpu with new info
        static switch(process) { }
        // lets set the info on the pcbs here
        static setInfo(pcb) { }
    }
    // easy to way to keep track of pcb data
    Context.processMap = new Map();
    TSOS.Context = Context;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=context.js.map
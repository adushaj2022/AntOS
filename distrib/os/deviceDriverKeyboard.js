/* ----------------------------------
   DeviceDriverKeyboard.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    class DeviceDriverKeyboard extends TSOS.DeviceDriver {
        constructor() {
            // Override the base method pointers.
            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            super();
            this.driverEntry = this.krnKbdDriverEntry;
            this.isr = this.krnKbdDispatchKeyPress;
        }
        krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }
        krnKbdDispatchKeyPress(params, osTrapError) {
            let [keyCode, isShifted, isCaps] = params; //destructure params array
            if (typeof keyCode !== "number" ||
                typeof isShifted !== "boolean" ||
                typeof isCaps !== "boolean") {
                osTrapError("Invalid params");
            }
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            // Check to see if we even want to deal with the key that was pressed.
            if (keyCode >= 65 && keyCode <= 90) {
                // letter
                if (isShifted === true || isCaps) {
                    chr = String.fromCharCode(keyCode); // Uppercase A-Z
                }
                else {
                    chr = String.fromCharCode(keyCode + 32); // Lowercase a-z
                }
                _KernelInputQueue.enqueue(chr);
            }
            else if ((keyCode >= 48 && keyCode <= 57) || // digits
                keyCode == 32 || // space
                keyCode == 13) {
                // enter
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            }
            else if ((keyCode >= 186 && keyCode <= 221) ||
                (keyCode <= 111 && keyCode >= 106)) {
                chr = String.fromCharCode(keyCode - 48 * Math.floor(keyCode / 48));
                _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode === 8) {
                _Console.deleteChar();
            }
            else if (keyCode === 38 || keyCode === 40) {
                // arrow key
                _Console.accessCommandHistory(keyCode); // type safety here
            }
        }
    }
    TSOS.DeviceDriverKeyboard = DeviceDriverKeyboard;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=deviceDriverKeyboard.js.map
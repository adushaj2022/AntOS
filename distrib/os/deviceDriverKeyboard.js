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
            let [keyCode, isShifted, isCaps, code, ctrl] = params; //destructure params array
            if (typeof keyCode !== "number" || typeof isShifted !== "boolean") {
                osTrapError("Invalid params");
            }
            _ctrl = ctrl; // store this in a global var
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            /*
              First deal with special characters, since keycode is depreciated, using
              code is prefered if we have caps or shift on then we know all these digits
              map to the correspoding characters
            */
            if (isShifted || isCaps) {
                switch (code) {
                    case "Digit1":
                        _KernelInputQueue.enqueue("!");
                        return;
                    case "Digit2":
                        _KernelInputQueue.enqueue("@");
                        return;
                    case "Digit3":
                        _KernelInputQueue.enqueue("#");
                        return;
                    case "Digit4":
                        _KernelInputQueue.enqueue("$");
                        return;
                    case "Digit5":
                        _KernelInputQueue.enqueue("%");
                        return;
                    case "Digit6":
                        _KernelInputQueue.enqueue("^");
                        return;
                    case "Digit7":
                        _KernelInputQueue.enqueue("&");
                        return;
                    case "Digit8":
                        _KernelInputQueue.enqueue("*");
                        return;
                    case "Digit9":
                        _KernelInputQueue.enqueue("(");
                        return;
                    case "Digit0":
                        _KernelInputQueue.enqueue(")");
                        return;
                    default:
                        break;
                }
            }
            // Check to see if we even want to deal with the key that was pressed.
            if (keyCode >= 65 && keyCode <= 90) {
                // letter
                if (isShifted || isCaps) {
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
                //backspace
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode === 38 || keyCode === 40) {
                // arrow key
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode === 9) {
                //tab
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            }
        }
    }
    TSOS.DeviceDriverKeyboard = DeviceDriverKeyboard;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=deviceDriverKeyboard.js.map
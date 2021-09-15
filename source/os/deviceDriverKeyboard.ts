/* ----------------------------------
   DeviceDriverKeyboard.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */

module TSOS {
  // Extends DeviceDriver
  export class DeviceDriverKeyboard extends DeviceDriver {
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

    public krnKbdDriverEntry() {
      // Initialization routine for this, the kernel-mode Keyboard Device Driver.
      this.status = "loaded";
      // More?
    }

    public krnKbdDispatchKeyPress(
      params: any[],
      osTrapError: (mess: any) => void
    ): boolean | void {
      let [keyCode, isShifted, isCaps, code] = params; //destructure params array
      if (typeof keyCode !== "number" || typeof isShifted !== "boolean") {
        osTrapError("Invalid params");
      }

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
        } else {
          chr = String.fromCharCode(keyCode + 32); // Lowercase a-z
        }
        _KernelInputQueue.enqueue(chr);
      } else if (
        (keyCode >= 48 && keyCode <= 57) || // digits
        keyCode == 32 || // space
        keyCode == 13
      ) {
        // enter
        chr = String.fromCharCode(keyCode);
        _KernelInputQueue.enqueue(chr);
      } else if (
        (keyCode >= 186 && keyCode <= 221) ||
        (keyCode <= 111 && keyCode >= 106)
      ) {
        chr = String.fromCharCode(keyCode - 48 * Math.floor(keyCode / 48));
        _KernelInputQueue.enqueue(chr);
      } else if (keyCode === 8) {
        //backspace
        chr = String.fromCharCode(keyCode);
        _KernelInputQueue.enqueue(chr);
      } else if (keyCode === 38 || keyCode === 40) {
        // arrow key
        chr = String.fromCharCode(keyCode);
        _KernelInputQueue.enqueue(chr);
      } else if (keyCode === 9) {
        //tab
        chr = String.fromCharCode(keyCode);
        _KernelInputQueue.enqueue(chr);
      }
    }
  }
}

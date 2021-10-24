/* ------------
     Console.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */
var TSOS;
(function (TSOS) {
    class Console {
        constructor(currentFont = _DefaultFontFamily, currentFontSize = _DefaultFontSize, currentXPosition = 0, currentYPosition = _DefaultFontSize, buffer = "") {
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
            this.commandHistory = [];
            this.commandIndex = null;
        }
        init() {
            this.clearScreen();
            this.resetXY();
        }
        clearScreen() {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
            this.commandHistory = []; //reset command history
        }
        resetXY() {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }
        handleInput() {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(38)) {
                    this.accessCommandHistory(38);
                }
                else if (chr === String.fromCharCode(40)) {
                    this.accessCommandHistory(40);
                }
                else if (chr === String.fromCharCode(8)) {
                    this.deleteChar();
                }
                else if (chr === String.fromCharCode(9)) {
                    this.commandCompletion();
                }
                else if (chr === String.fromCharCode(13)) {
                    // the Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    this.commandHistory.push(this.buffer);
                    this.commandIndex = this.commandHistory.length;
                    // ... and reset our buffer.
                    this.buffer = "";
                }
                else {
                    if (chr.toUpperCase() === String.fromCharCode(67) &&
                        _ctrl &&
                        _CPU.isExecuting) {
                        _CPU.isExecuting = false; // control C, break
                        _OsShell.handleInput("", true, () => {
                            this.putText("Program stopped");
                        });
                    }
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Add a case for Ctrl-C that would allow the user to break the current program.
            }
        }
        /**
         * Here we can make a function just to remove a line
         * this is because we can now use it for backspaces and accessing
         * previous commands via arrow keys
         */
        deleteText() {
            if (this.buffer.length === 0) {
                return;
            }
            const { width, height } = _Canvas;
            const y = this.currentYPosition;
            const PROMPT_WIDTH = 11;
            const LINE_HEIGHT = y - 14;
            _DrawingContext.clearRect(PROMPT_WIDTH, LINE_HEIGHT, width, height); // chop out current off line
            this.currentXPosition = PROMPT_WIDTH + 1; // start past the >
        }
        /**
         * Handle Backspace here
         */
        deleteChar() {
            this.deleteText(); //delete line
            const newBuffer = this.buffer.slice(0, -1);
            this.putText(newBuffer); // place new line with removed char
            this.buffer = newBuffer;
        }
        /*
          Here we handle using up and down keys to access previous commands, we have an array of commands
          and as we hit up or down key we simply move through the array in either direction
        */
        accessCommandHistory(key) {
            let upper = this.commandHistory.length;
            if (this.commandIndex === null) {
                this.commandIndex = upper;
            }
            let i = this.commandIndex;
            if (key === 38 && this.commandIndex > 0) {
                this.commandIndex = i - 1;
            }
            else if (key === 40 && this.commandIndex < upper) {
                this.commandIndex = i + 1;
            }
            this.deleteText();
            this.buffer = this.commandHistory[this.commandIndex] || ""; //default to empty
            this.putText(this.buffer);
        }
        commandCompletion() {
            if (this.buffer.length === 0) {
                return;
            }
            const commands = _OsShell.commandList;
            const similarCommands = [];
            commands.forEach(({ command }) => {
                if (command === null || command === void 0 ? void 0 : command.startsWith(this.buffer)) {
                    similarCommands.push(command);
                }
            });
            // we only have one command that has the same prefix
            if (similarCommands.length === 1) {
                this.deleteText();
                this.buffer = similarCommands[0];
                this.putText(this.buffer);
            }
            else if (similarCommands.length >= 2) {
                /**
                 * we have multiple strings with a common prefix
                 * so if we follow what bash does it will print those strings to the screen
                 */
                similarCommands.forEach((str) => {
                    this.advanceLine();
                    this.putText(str);
                });
                /**
                 * here we take the longest common prefix of our similar commands and make it our buffer
                 * here is an example:
                 *    Care
                 *    Cat
                 *    Capital
                 * Our longestr prefix is: Ca
                 **/
                this.buffer = TSOS.Utils.longestCommonPrefix(similarCommands);
                _OsShell.handleInput("", true, _OsShell.shellSimilarCommand);
                this.putText(this.buffer);
            }
        }
        putText(text) {
            //TODO: implement line wrap
            const XLIMIT = _Canvas.width - 4;
            if (text !== "") {
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                if (this.currentXPosition + offset >= XLIMIT) {
                    this.advanceLine();
                }
                else {
                    this.currentXPosition = this.currentXPosition + offset;
                }
            }
        }
        /**
         * lw -> line wrap
         * Very similar to put text but we will use that as a utility to write this function,
         * this allows for line wrap. The idea is pretty simple, identify the amount of chars that can go in a line
         * next, take that number and divide it by the length of the text. Example if we have a 100 character text
         * but a 20 character limit we know we need 5 lines. To print the right characters we use the built in
         * string.prototype.subtring method, so we can grab the first 0 - 20, then advance to 20 - 40 and so on
         * and so fourth. This is similar to paginating
         */
        lwPutText(text, output = false) {
            text = String(text);
            const CHAR_LIMIT = 55;
            let upper = CHAR_LIMIT; // average amount of characters that we can use to cover a whole line
            let paginate = Math.ceil(text.length / CHAR_LIMIT);
            let i = 0;
            let lower = 0;
            if (paginate === 1 && output) {
                return this.putText(text); // no need to wrap
            }
            while (i++ < paginate) {
                this.putText(text.substring(lower, upper).trimLeft());
                this.advanceLine();
                lower += CHAR_LIMIT;
                upper += CHAR_LIMIT;
            }
        }
        advanceLine() {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            const { width, height } = _Canvas;
            const line = _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;
            const y = this.currentYPosition;
            /*
             * if we exceed the height then we do not want our y value to change we want to
             * simply lower the contents of the canvas, we do this by replacing image data
             */
            if (y + line > height) {
                const data = _DrawingContext.getImageData(0, line, width, height);
                _DrawingContext.putImageData(data, 0, 0);
            }
            else {
                this.currentYPosition += line; // advance the line if it doesnt exceed
            }
        }
        displayBSOD(msg) {
            _DrawingContext.fillStyle = "blue";
            _DrawingContext.fillRect(0, 0, _Canvas.width, _Canvas.height);
            _StdOut.lwPutText(msg || "ERROR, THE OS HAS TRAPPED");
            TSOS.Control.hostBtnHaltOS_click(globalThis);
        }
    }
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=console.js.map
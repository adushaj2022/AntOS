/* ------------
     Console.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module TSOS {
  export class Console {
    private commandHistory: Array<string | null> = [];
    private commandIndex: number | null = null;

    constructor(
      public currentFont = _DefaultFontFamily,
      public currentFontSize = _DefaultFontSize,
      public currentXPosition = 0,
      public currentYPosition = _DefaultFontSize,
      public buffer = ""
    ) {}

    public init(): void {
      this.clearScreen();
      this.resetXY();
    }

    public clearScreen(): void {
      _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
      this.commandHistory = []; //reset command history
    }

    public resetXY(): void {
      this.currentXPosition = 0;
      this.currentYPosition = this.currentFontSize;
    }

    public handleInput(): void {
      while (_KernelInputQueue.getSize() > 0) {
        // Get the next character from the kernel input queue.
        var chr = _KernelInputQueue.dequeue();
        // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
        if (chr === String.fromCharCode(38)) {
          this.accessCommandHistory(38);
        } else if (chr === String.fromCharCode(40)) {
          this.accessCommandHistory(40);
        } else if (chr === String.fromCharCode(8)) {
          this.deleteChar();
        } else if (chr === String.fromCharCode(9)) {
          this.commandCompletion();
        } else if (chr === String.fromCharCode(13)) {
          // the Enter key
          // The enter key marks the end of a console command, so ...
          // ... tell the shell ...
          _OsShell.handleInput(this.buffer);
          this.commandHistory.push(this.buffer);
          this.commandIndex = this.commandHistory.length;
          // ... and reset our buffer.
          this.buffer = "";
        } else {
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
    public deleteText(): void {
      if (this.buffer.length === 0) {
        return;
      }

      const { width, height } = _Canvas;
      const y = this.currentYPosition;
      _DrawingContext.clearRect(11, y - 14, width, height); // chop out current off line
      this.currentXPosition = 12; // start past the >
    }

    /**
     * Handle Backspace here
     */
    public deleteChar(): void {
      this.deleteText(); //delete line
      const newBuffer = this.buffer.slice(0, -1);
      this.putText(newBuffer); // place new line with removed char
      this.buffer = newBuffer;
    }

    /*
      Here we handle using up and down keys to access previous commands, we have an array of commands
      and as we hit up or down key we simply move through the array in either direction
    */

    public accessCommandHistory(key?: number): void {
      let upper = this.commandHistory.length;

      if (this.commandIndex === null) {
        this.commandIndex = upper;
      }

      let i = this.commandIndex;

      if (key === 38 && this.commandIndex > 0) {
        this.commandIndex = i - 1;
      } else if (key === 40 && this.commandIndex < upper) {
        this.commandIndex = i + 1;
      }
      this.deleteText();
      this.buffer = this.commandHistory[this.commandIndex] || ""; //default to empty
      this.putText(this.buffer);
    }

    public commandCompletion(): void {
      if (this.buffer.length === 0) {
        return;
      }

      const commands = _OsShell.commandList;
      const similarCommands = [];
      let prefix = new String(this.buffer);
      commands.forEach(({ command }) => {
        if (command?.startsWith(this.buffer)) {
          similarCommands.push(command);
        }
      });

      // we only have one command that has the same prefix
      if (similarCommands.length === 1) {
        this.deleteText();
        this.buffer = similarCommands[0] as string;
        this.putText(this.buffer);
      } else if (similarCommands.length >= 2) {
        /**
         * we have multiple strings with a common prefix
         * so if we follow what bash does it will print those strings to the screen
         */
        similarCommands.forEach((str) => {
          this.advanceLine();
          this.putText(str);
        });

        _OsShell.handleInput("", true);
        this.buffer = prefix as string;
        this.putText(this.buffer);
      }
    }

    public putText(text): void {
      /*  My first inclination here was to write two functions: putChar() and putString().
                Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
                between the two. (Although TypeScript would. But we're compiling to JavaScipt anyway.)
                So rather than be like PHP and write two (or more) functions that
                do the same thing, thereby encouraging confusion and decreasing readability, I
                decided to write one function and use the term "text" to connote string or char.
            */

      //TODO: implement line wrap
      if (text !== "") {
        // Draw the text at the current X and Y coordinates.
        _DrawingContext.drawText(
          this.currentFont,
          this.currentFontSize,
          this.currentXPosition,
          this.currentYPosition,
          text
        );
        // Move the current X position.
        var offset = _DrawingContext.measureText(
          this.currentFont,
          this.currentFontSize,
          text
        );
        this.currentXPosition = this.currentXPosition + offset;
      }
    }

    public advanceLine(): void {
      this.currentXPosition = 0;
      /*
       * Font size measures from the baseline to the highest point in the font.
       * Font descent measures from the baseline to the lowest point in the font.
       * Font height margin is extra spacing between the lines.
       */
      const { width, height } = _Canvas;

      const line =
        _DefaultFontSize +
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
      } else {
        this.currentYPosition += line; // advance the line if it doesnt exceed
      }
    }
  }
}

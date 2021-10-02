/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

module TSOS {
  export class Shell {
    // Properties
    public promptStr = ">";
    public commandList = [];
    public curses =
      "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
    public apologies = "[sorry]";

    constructor() {}

    public init() {
      var sc: ShellCommand;
      //
      // Load the command list.

      // ver
      sc = new ShellCommand(
        this.shellVer,
        "ver",
        "- Displays the current version data."
      );
      this.commandList[this.commandList.length] = sc;

      // help
      sc = new ShellCommand(
        this.shellHelp,
        "help",
        "- This is the help command. Seek help."
      );
      this.commandList[this.commandList.length] = sc;

      // shutdown
      sc = new ShellCommand(
        this.shellShutdown,
        "shutdown",
        "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running."
      );
      this.commandList[this.commandList.length] = sc;

      // cls
      sc = new ShellCommand(
        this.shellCls,
        "cls",
        "- Clears the screen and resets the cursor position."
      );
      this.commandList[this.commandList.length] = sc;

      // man <topic>
      sc = new ShellCommand(
        this.shellMan,
        "man",
        "<topic> - Displays the MANual page for <topic>."
      );
      this.commandList[this.commandList.length] = sc;

      // trace <on | off>
      sc = new ShellCommand(
        this.shellTrace,
        "trace",
        "<on | off> - Turns the OS trace on or off."
      );
      this.commandList[this.commandList.length] = sc;

      // rot13 <string>
      sc = new ShellCommand(
        this.shellRot13,
        "rot13",
        "<string> - Does rot13 obfuscation on <string>."
      );
      this.commandList[this.commandList.length] = sc;

      // prompt <string>
      sc = new ShellCommand(
        this.shellPrompt,
        "prompt",
        "<string> - Sets the prompt."
      );
      this.commandList[this.commandList.length] = sc;

      // ps  - list the running processes and their IDs
      // kill <id> - kills the specified process id.

      sc = new ShellCommand(
        this.shellAbout,
        "about",
        "- Gives users more information about the project"
      );
      this.commandList[this.commandList.length] = sc;

      sc = new ShellCommand(
        this.shellWhereAmI,
        "whereami",
        "- Tells users where they are"
      );
      this.commandList[this.commandList.length] = sc;

      sc = new ShellCommand(this.shellDate, "date", "- Display current date");

      this.commandList[this.commandList.length] = sc;

      sc = new ShellCommand(this.shellTime, "time", "- Display current time");

      this.commandList[this.commandList.length] = sc;

      sc = new ShellCommand(
        this.shellNumberFact,
        "fact",
        "<number> - Displays random fact"
      );
      this.commandList[this.commandList.length] = sc;

      sc = new ShellCommand(
        this.shellStatus,
        "status",
        "<status> - Sets status"
      );

      this.commandList[this.commandList.length] = sc;

      sc = new ShellCommand(
        this.shellLoad,
        "load",
        "loads user code into memory"
      );

      this.commandList[this.commandList.length] = sc;

      sc = new ShellCommand(
        this.shellBSOD,
        "bsod",
        "displays bluescreen of death"
      );

      this.commandList[this.commandList.length] = sc;

      sc = new ShellCommand(this.shellRun, "run", "<pid> - runs that program");

      this.commandList[this.commandList.length] = sc;

      // Display the initial prompt.
      this.putPrompt();
    }

    public putPrompt() {
      _StdOut.putText(this.promptStr);
    }

    public handleInput(buffer, tab?: boolean) {
      _Kernel.krnTrace("Shell Command~" + buffer);
      //
      // Parse the input...
      //

      //if tab is true we know we are parsing an incomplete command
      if (tab) {
        this.execute(this.shellSimilarCommand);
        return;
      }
      var userCommand = this.parseInput(buffer);
      // ... and assign the command and args to local variables.
      var cmd = userCommand.command;
      var args = userCommand.args;
      //
      // Determine the command and execute it.
      //
      // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
      // command list in attempt to find a match.
      // TODO: Is there a better way? Probably. Someone work it out and tell me in class.
      var index: number = 0;
      var found: boolean = false;
      var fn = undefined;
      while (!found && index < this.commandList.length) {
        if (this.commandList[index].command === cmd) {
          found = true;
          fn = this.commandList[index].func;
        } else {
          ++index;
        }
      }
      if (found) {
        this.execute(fn, args); // Note that args is always supplied, though it might be empty.
      } else {
        // It's not found, so check for curses and apologies before declaring the command invalid.
        if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {
          // Check for curses.
          this.execute(this.shellCurse);
        } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {
          // Check for apologies.
          this.execute(this.shellApology);
        } else {
          // It's just a bad command. {
          this.execute(this.shellInvalidCommand);
        }
      }
    }

    // Note: args is an optional parameter, ergo the ? which allows TypeScript to understand that.
    public execute(fn, args?) {
      // We just got a command, so advance the line...
      _StdOut.advanceLine();
      // ... call the command function passing in the args with some über-cool functional programming ...
      fn(args);
      // Check to see if we need to advance the line again
      if (_StdOut.currentXPosition > 0) {
        _StdOut.advanceLine();
      }
      // ... and finally write the prompt again.
      this.putPrompt();
    }

    public parseInput(buffer: string): UserCommand {
      var retVal = new UserCommand();

      // 1. Remove leading and trailing spaces.
      buffer = Utils.trim(buffer);

      // 2. Lower-case it.
      let temp = buffer.split(" ");
      temp[0] = temp[0].toLowerCase();

      buffer = temp.join(" ");

      // 3. Separate on spaces so we can determine the command and command-line args, if any.
      var tempList = buffer.split(" ");

      // 4. Take the first (zeroth) element and use that as the command.
      var cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript. See the Queue class.
      // 4.1 Remove any left-over spaces.
      cmd = Utils.trim(cmd);
      // 4.2 Record it in the return value.
      retVal.command = cmd;

      // 5. Now create the args array from what's left.
      for (var i in tempList) {
        var arg = Utils.trim(tempList[i]);
        if (arg != "") {
          retVal.args[retVal.args.length] = tempList[i];
        }
      }
      return retVal;
    }

    //
    // Shell Command Functions. Kinda not part of Shell() class exactly, but
    // called from here, so kept here to avoid violating the law of least astonishment.
    //
    public shellInvalidCommand() {
      _StdOut.putText("Invalid Command. ");
      if (_SarcasticMode) {
        _StdOut.putText("Unbelievable. You, [subject name here],");
        _StdOut.advanceLine();
        _StdOut.putText("must be the pride of [subject hometown here].");
      } else {
        _StdOut.putText("Type 'help' for, well... help.");
      }
    }

    public shellSimilarCommand() {
      _StdOut.putText("Those are the most similar commands");
    }

    public shellCurse() {
      _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
      _StdOut.advanceLine();
      _StdOut.putText("Bitch.");
      _SarcasticMode = true;
    }

    public shellApology() {
      if (_SarcasticMode) {
        _StdOut.putText("I think we can put our differences behind us.");
        _StdOut.advanceLine();
        _StdOut.putText("For science . . . You monster.");
        _SarcasticMode = false;
      } else {
        _StdOut.putText("For what?");
      }
    }

    // Although args is unused in some of these functions, it is always provided in the
    // actual parameter list when this function is called, so I feel like we need it.

    public shellVer(args: string[]) {
      _StdOut.putText(APP_NAME + " current version " + APP_VERSION);
    }

    public shellHelp(args: string[]) {
      _StdOut.putText("Commands:");
      _StdOut.advanceLine();
      for (var i in _OsShell.commandList) {
        _StdOut.lwPutText(
          "  " +
            _OsShell.commandList[i].command +
            " " +
            _OsShell.commandList[i].description
        );
      }
    }

    public shellShutdown(args: string[]) {
      _StdOut.putText("Shutting down...");
      // Call Kernel shutdown routine.
      _Kernel.krnShutdown();
      // TODO: Stop the final prompt from being displayed. If possible. Not a high priority. (Damn OCD!)
    }

    public shellCls(args: string[]) {
      _StdOut.clearScreen();
      _StdOut.resetXY();
    }

    public shellMan(args: string[]) {
      if (args.length > 0) {
        var topic = args[0];
        switch (topic) {
          case "help":
            _StdOut.putText(
              "Help displays a list of (hopefully) valid commands."
            );
            break;
          case "about":
            _StdOut.putText("Gives information about the project");
            break;
          case "cls":
            _StdOut.putText("Clears screen, same as windows command");
          case "fact":
            _StdOut.putText("Provide a number and receive a random fact");
            _StdOut.advanceLine();
            _StdOut.putText(" associated with that number");
            break;
          case "ver":
            _StdOut.putText("Displays the current version of AntOS");
          case "whereami":
            _StdOut.putText("Find out where you (yes, you) currently are");
            break;
          case "time":
            _StdOut.putText("Displays the current time");
            break;
          case "shutdown":
            _StdOut.putText("Shutdown virtual OS :(");
            break;
          //add prompt, rot13
          case "rot13":
            _StdOut.putText("Performs a letter sub cypher on a string");
            break;
          case "prompt":
            _StdOut.putText("Accepts a string as a prompt");
            break;
          case "load":
            _StdOut.lwPutText(
              "Will load the users code into memory, only accepting hex code"
            );
            break;
          case "bsod":
            _StdOut.lwPutText("Display the blue screen of the death");
            break;
          case "run":
            _StdOut.lwPutText(
              "Accepts a parameter, pid number, it will then run that program"
            );
            break;
          default:
            _StdOut.putText("No manual entry for " + args[0] + ".");
        }
      } else {
        _StdOut.putText("Usage: man <topic>  Please supply a topic.");
      }
    }

    public shellTrace(args: string[]) {
      if (args.length > 0) {
        var setting = args[0];
        switch (setting) {
          case "on":
            if (_Trace && _SarcasticMode) {
              _StdOut.putText("Trace is already on, doofus.");
            } else {
              _Trace = true;
              _StdOut.putText("Trace ON");
            }
            break;
          case "off":
            _Trace = false;
            _StdOut.putText("Trace OFF");
            break;
          default:
            _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
        }
      } else {
        _StdOut.putText("Usage: trace <on | off>");
      }
    }

    public shellRot13(args: string[]) {
      if (args.length > 0) {
        // Requires Utils.ts for rot13() function.
        _StdOut.putText(
          args.join(" ") + " = '" + Utils.rot13(args.join(" ")) + "'"
        );
      } else {
        _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
      }
    }

    public shellPrompt(args: string[]) {
      if (args.length > 0) {
        _OsShell.promptStr = args[0];
      } else {
        _StdOut.putText("Usage: prompt <string>  Please supply a string.");
      }
    }

    public shellAbout(args: string[]) {
      _StdOut.lwPutText(
        `This is an online operating system based on the 6502 apple computer, it is written in typescript`
      );
    }

    public shellWhereAmI(args: string[]) {
      // gets coordinates, leaving commented for now, not sure if I want this feature
      //   navigator.geolocation.getCurrentPosition((position) => {
      //     _StdOut.putText(
      //       `Latitude: ${position.coords.latitude} & Longitude: ${position.coords.longitude}`
      //     );
      //   });
      _StdOut.putText("Tilted Towers");
    }

    public shellDate(args: string[]) {
      const date = new Date();
      _StdOut.putText(date.toDateString());
    }

    public shellTime(args: string[]) {
      const date = new Date();
      _StdOut.putText(date.toTimeString());
    }

    public shellNumberFact(args: string[]) {
      const number = args[0];
      if (/^-?\d+$/.test(number)) {
        fetch("http://numbersapi.com/" + number)
          .then((response) => response.text())
          .then((data) => {
            _StdOut.lwPutText(data);
          })
          .catch((err) => console.log(err));
      } else {
        _StdOut.putText("Please enter a number");
      }
    }

    public shellStatus(args: string[]) {
      const message = args.join(" "); // handle sentences
      if (message) {
        Control.setStatus(message);
        _StdOut.putText(`Status set to: ${message}`);
      } else {
        _StdOut.putText("Please provide a message");
      }
    }

    public shellLoad(args: string[]) {
      const data = Control.hostGetUserInput().trim();
      if (!data) {
        _StdOut.putText("Input is empty");
        return;
      }

      let numbers: number[] | string[] = data.split(" ");
      let valid = true;

      /**
       * check all the space seperated data, if its hex value does not equal itself we know
       * it is not a valid piece of data
       */
      numbers.forEach((num) => {
        if (Number(num) < 10) {
          return; // handle cases like 09 00 02 03, these are all valid
        }

        let hexValue = parseInt(num, 16).toString(16).toUpperCase();
        if (hexValue !== num.toUpperCase()) {
          valid = false;
        }
      });
      numbers = numbers.map((n) => parseInt(n, 16)); // convert to numbers, not string represention

      if (valid) {
        /*
          Here we will load our memory, and create our pcbs,
          we also utilize control to update GUI, when loading multiple proams into memory (project 3)
          we need to keep track of the startLocation and endLocation in memory for our
          pcbs. For npw just assume we start at 0 and end at the end of the program
        */
        _MemoryAccessor.loadMemory(numbers); // load memory
        _Pcb = new ProcessControlBlock(); // create pcb
        _Pcb.pid = _ReadyQueue.getSize() ?? 0;
        _ReadyQueue.enqueue(_Pcb);
        Control.hostDisplayPcbs(_Pcb); // display to gui
        Control.hostDisplayMemory(_MemoryAccessor.memory.mainMemory); // display to gui
        _StdOut.putText(`Process Control - PID: ${_Pcb.pid}`);
      } else {
        _StdOut.putText("Inproper input, data not loaded");
      }
    }

    public shellBSOD(args: string[]): void {
      _StdOut.displayBSOD();
    }

    public shellRun(args: string[]): void {
      const arg = args[0];

      if (!/^-?\d+$/.test(arg)) {
        _StdOut.putText("Please pass a number");
        return;
      }

      // iterate through Queue and find our pcb
      for (let pcb of _ReadyQueue.q) {
        if (pcb.pid === Number(arg)) {
          _CPU.isExecuting = true; // set this to true, time to run program
          _Pcb = pcb; // set global Pcb to current one being ran, we will access this from cpu
        }
      }

      // pcb doesnt exist
      if (!_CPU.isExecuting) {
        _StdOut.putText("No pid found");
      }
    }
  }
}

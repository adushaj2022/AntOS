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

      sc = new ShellCommand(
        this.shellClearMem,
        "clearmem",
        "clear all memory partitions"
      );

      this.commandList[this.commandList.length] = sc;

      sc = new ShellCommand(
        this.shellRunAll,
        "runall",
        "execute all cpu programs"
      );

      this.commandList[this.commandList.length] = sc;

      sc = new ShellCommand(this.shellPs, "ps", "displays active processes");

      this.commandList[this.commandList.length] = sc;

      sc = new ShellCommand(
        this.shellKill,
        "kill",
        "<pid> kill process by pid"
      );

      this.commandList[this.commandList.length] = sc;

      sc = new ShellCommand(this.shellKillAll, "killall", "kill all processes");

      this.commandList[this.commandList.length] = sc;

      sc = new ShellCommand(
        this.shellQuantum,
        "quantum",
        "<num> set round robin quantum"
      );

      this.commandList[this.commandList.length] = sc;

      sc = new ShellCommand(this.formatDisk, "format", "formatting the disk");
      this.commandList[this.commandList.length] = sc;

      sc = new ShellCommand(this.createFile, "create", "<name> create a file");
      this.commandList[this.commandList.length] = sc;

      sc = new ShellCommand(this.ls, "ls", "list out files");
      this.commandList[this.commandList.length] = sc;

      sc = new ShellCommand(
        this.writeToFile,
        "write",
        "<name> write to a given file."
      );
      this.commandList[this.commandList.length] = sc;

      sc = new ShellCommand(
        this.readFile,
        "read",
        "<name> read from a given file."
      );
      this.commandList[this.commandList.length] = sc;

      sc = new ShellCommand(this.deleteFile, "delete", "<name> delete a file.");
      this.commandList[this.commandList.length] = sc;

      sc = new ShellCommand(
        this.setSchedule,
        "setschedule",
        "<name> set cpu scheduler."
      );
      this.commandList[this.commandList.length] = sc;

      sc = new ShellCommand(
        this.getSchedule,
        "getschedule",
        "get current cpu scheduler."
      );
      this.commandList[this.commandList.length] = sc;

      // Display the initial prompt.
      this.putPrompt();
    }

    public putPrompt() {
      _StdOut.putText(this.promptStr);
    }

    public handleInput(buffer, tab?: boolean, cb?: () => any) {
      _Kernel.krnTrace("Shell Command~" + buffer);
      //
      // Parse the input...
      //

      //if tab is true we know we are parsing an incomplete command
      if (tab) {
        this.execute(cb);
        return;
      }
      var userCommand = this.parseInput(buffer);
      // ... and assign the command and args to local variables.
      var cmd = userCommand.command;
      var args = userCommand.args;
      //
      // Determine the command and execute it.
      //
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
          case "clearmem":
            _StdOut.putText("Clear all memory partitions, resets everything");
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
      _StdOut.lwPutText(
        "LIBERTY CITY, great place to visit; an even better place to leave :)"
      );
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
        _StdOut.lwPutText(`Status set to: ${message}`);
      } else {
        _StdOut.putText("Please provide a message");
      }
    }

    public shellMessage() {
      _StdOut.putText("Program complete");
    }

    public shellLoad(args: string[]) {
      let priority = typeof args[0] !== "undefined" ? Number(args[0]) : 0; // default to 0
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

        let hexValue = Utils.showHexValue(parseInt(num, 16), 2);
        if (hexValue !== num.toUpperCase()) {
          valid = false;
        }
      });
      numbers = numbers.map((n) => parseInt(n, 16)); // convert to numbers, not string represention

      if (valid) {
        let answer = _Kernel.krnLoadMemory(numbers, priority); // Kernel will return a message here, like pid: 1 or no more partitons
        _StdOut.putText(answer);
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

      /**
       * Here lets go through our resident list, if we see a process with the same pid as the one
       * the user entered, lets set that pcb to our global variable, next loop through partitions
       * and see if we have a corresping place in memory for our program, we need to se that id so the CPU
       *  can know how much to offset when reading and writing
       */
      for (let pcb of _ResidentList.q) {
        if (pcb.pid === Number(arg)) {
          _CPU.resetRegisters();
          _CPU.isExecuting = true; // set this to true, time to run program
          // _Pcb = pcb; // set global Pcb to current one being ran, we will access this from cpu
          pcb.state = "running";
          _CurrentPcbId = pcb.pid;
          Control.hostDisplayPcbs(pcb);
          _ReadyQueue.enqueue(pcb); // move to ready queue since we are now running
          for (let partition of _MemoryManager.partitions) {
            if (partition.process?.pid === pcb.pid) {
              _CurrentPartition = partition.id;
            }
          }
          // move out of resident list
          _ResidentList.q = _ResidentList.q.filter(
            (prcb) => prcb.pid !== Number(arg)
          );
        }
      }

      // pcb doesnt exist
      if (!_CPU.isExecuting) {
        _StdOut.putText("No pid found");
      }
    }
    public shellClearMem(args: string[]) {
      _Kernel.krnClearMemory();
      _StdOut.lwPutText(
        "All memory partitons cleared, all programs terminated"
      );
    }

    public shellRunAll(args: string[]) {
      if (_ResidentList.getSize() < 2) {
        return _StdOut.lwPutText("You need at least 2 programs to run runall");
      }
      _ReadyQueue.q = [..._ResidentList.q]; // move from resident list to ready queue
      _ResidentList.q.length = 0; // empty resident list
      for (let pcb of _ResidentList.q) {
        pcb.state = "running";
      }
      _CPU.isExecuting = true;

      FirstComeFirstServe.isActivated = false;
      RoundRobinScheduler.isActivated = false;

      switch (_currentSchedule) {
        case "fcfs":
          FirstComeFirstServe.isActivated = true;
        case "rr":
          RoundRobinScheduler.isActivated = true;
        case "priority":
          // dont overcomplicate it, reorder our queue based on priority
          _ReadyQueue.q.sort((a, b) => a.priority - b.priority);
          FirstComeFirstServe.isActivated = true;
        default:
          break;
      }
    }

    public shellPs(args: string[]) {
      let found = false;
      for (let process of _ReadyQueue.q) {
        _StdOut.lwPutText(JSON.stringify(process));
        found = true;
      }
      if (!found) {
        _StdOut.putText("No running processes, sorry");
      }
    }

    public shellKill(args: string[]) {
      const pid = Number(args[0]);
      if (typeof pid !== "number") {
        _StdOut.putText("Please enter a valid process id");
      } else {
        // if only one program is running, stop cpu
        if (_CurrentPcbId === pid && !RoundRobinScheduler.isActivated) {
          _CPU.isExecuting = false;
        } else if (RoundRobinScheduler.isActivated) {
          Context.processMap.get(_CurrentPcbId).state = "terminated";
        }
        _CPU.program_log("terminated");

        for (let process of _ReadyQueue.q) {
          if (process.pid === pid) {
            _MemoryManager.addToAvailablePartitions(process.memoryPartitionId);
          }
        }

        // take out of ready queue
        _ReadyQueue.q = _ReadyQueue.q.filter((pcb) => pcb.pid !== pid);
      }
    }

    public shellKillAll(args: string[]) {
      _Kernel.krnClearMemory();
      _StdOut.putText("All processes killed ");
    }

    public shellQuantum(args: string[]) {
      const q = Number(args[0]);
      if (typeof q !== "number") {
        _StdOut.putText("Please pass a number");
      } else {
        if (q <= 0) {
          _StdOut.lwPutText("Quantum must be greater than 0, sorry");
        } else {
          _StdOut.putText(`Quantum set to ${q}`);
          _QUANTUM = q;
        }
      }
    }

    public formatDisk(args: string[]) {
      if (!_Disk.isFormatted) {
        _Disk.initialize();
        Control.hostDisplayDisk();
        _StdOut.putText("Disk formatted and initialized");
      } else {
        _StdOut.putText("disk already formatted");
      }
    }

    public createFile(args: string[]) {
      if (!_Disk.isFormatted) {
        return _StdOut.putText("run format first to initialize disk");
      }

      let file_name = args.join(" ");

      // simple regex for checking if we only have english letters
      if (!/^([a-zA-Z0-9._-]+)$/.test(file_name)) {
        return _StdOut.lwPutText(
          "file name must be comprised of only english letters, numbers, period, dash or underscore"
        );
      }
      let response = _Disk.touch(file_name);

      _StdOut.lwPutText(response);

      // update gui
      Control.hostDisplayDisk();
    }

    public ls(args: string[]) {
      if (!_Disk.isFormatted) {
        return _StdOut.putText("run format first to initialize disk");
      }
      let opt = args[0];
      let files = _Disk.ls();
      if (files.length === 0) {
        return _StdOut.putText("no files found");
      }

      for (let file of files) {
        if (opt === "-l") {
          _StdOut.putText(file);
        } else {
          if (file[0] !== ".") {
            _StdOut.putText(file);
          }
        }
        _StdOut.advanceLine();
      }
    }

    public writeToFile(args: string[]) {
      if (!_Disk.isFormatted) {
        return _StdOut.putText("run format first to initialize disk");
      }
      let file_name = args[0];
      args.shift();
      let content = args.join(" ");
      let message = _Disk.echo(file_name, content);
      _StdOut.putText(message);
      Control.hostDisplayDisk();
    }

    public readFile(args: string[]) {
      if (!_Disk.isFormatted) {
        return _StdOut.putText("run format first to initialize disk");
      }
      let file_name = args[0];
      _StdOut.lwPutText(_Disk.cat(file_name));
    }

    public deleteFile(args: string[]) {
      if (!_Disk.isFormatted) {
        return _StdOut.putText("run format first to initialize disk");
      }
      let file_name = args[0];
      if (!file_name) {
        return _StdOut.putText("please supply a file");
      }
      let message = _Disk.rm(file_name);
      _StdOut.putText(message);
      Control.hostDisplayDisk();
    }

    public setSchedule(args: string[]) {
      let choice = args[0];
      if (!new Set(["rr", "fcfs", "priority"]).has(choice)) {
        return _StdOut.putText("please select: rr, fcfs, or priority");
      }

      _currentSchedule = choice as TSchedule;

      _StdOut.lwPutText(`schedule set to ${choice}`);
    }

    public getSchedule() {
      _StdOut.putText(_currentSchedule);
    }
  }
}

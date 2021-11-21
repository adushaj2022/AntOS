/* ------------
     Control.ts

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

//
// Control Services
//
module TSOS {
  export class Control {
    public static hostInit(): void {
      // This is called from index.html's onLoad event via the onDocumentLoad function pointer.

      // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
      _Canvas = <HTMLCanvasElement>document.getElementById("display");

      _Memory = new Memory();
      _Memory.init();
      _MemoryAccessor = new MemoryAccessor(_Memory); // pass in memory, we will access it through here

      // Get a global reference to the drawing context.
      _DrawingContext = _Canvas.getContext("2d");

      // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
      CanvasTextFunctions.enable(_DrawingContext); // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.

      // Clear the log text box.
      // Use the TypeScript cast to HTMLInputElement
      (<HTMLInputElement>document.getElementById("taHostLog")).value = "";

      // Set focus on the start button.
      // Use the TypeScript cast to HTMLInputElement
      (<HTMLInputElement>document.getElementById("btnStartOS")).focus();

      // Check for our testing and enrichment core, which
      // may be referenced here (from index.html) as function Glados().

      //here we will set the task bar with date, time, and message
      const taskBar = document.getElementById("taskBar");
      const dateTime = document.createElement("div");
      dateTime.id = "dateTime";
      const status = document.createElement("div");
      status.innerText = "Status: ";
      status.id = "statusText";
      taskBar.appendChild(dateTime);
      taskBar.appendChild(status);
      this.hostTimeDate();

      if (typeof Glados === "function") {
        // function Glados() is here, so instantiate Her into
        // the global (and properly capitalized) _GLaDOS variable.
        _GLaDOS = new Glados();
        _GLaDOS.init();
      }
    }

    public static setStatus(msg: string): void {
      document.getElementById("statusText").innerText = `Status: ${msg}`;
    }

    public static hostLog(msg: string, source: string = "?"): void {
      // Note the OS CLOCK.
      var clock: number = _OSclock;

      // Note the REAL clock in milliseconds since January 1, 1970.
      var now: number = new Date().getTime();

      // Build the log string.
      var str: string =
        "({ clock:" +
        clock +
        ", source:" +
        source +
        ", msg:" +
        msg +
        ", now:" +
        now +
        " })" +
        "\n";

      // Update the log console.
      var taLog = <HTMLInputElement>document.getElementById("taHostLog");
      taLog.value = str + taLog.value;

      // TODO in the future: Optionally update a log database or some streaming service.
    }

    //
    // Host Events
    //
    public static hostBtnStartOS_click(btn): void {
      // Disable the (passed-in) start button...
      btn.disabled = true;

      // .. enable the Halt and Reset buttons ...
      (<HTMLButtonElement>document.getElementById("btnHaltOS")).disabled =
        false;
      (<HTMLButtonElement>document.getElementById("btnReset")).disabled = false;

      (<HTMLButtonElement>document.getElementById("step")).disabled = false;

      document
        .getElementById("step")
        .addEventListener("click", Control.hostActivateSingleStep_click);

      document
        .getElementById("next")
        .addEventListener("click", Control.hostGetNextStep);

      // .. set focus on the OS console display ...
      document.getElementById("display").focus();

      // ... Create and initialize the CPU (because it's part of the hardware)  ...
      _CPU = new Cpu(); // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.

      this.hostDisplayMemory(_MemoryAccessor.memory.mainMemory); // display memory on start
      this.hostDisplayCpu(_CPU);

      // ... then set the host clock pulse ...
      // @ts-ignore
      _hardwareClockID = setInterval(
        Devices.hostClockPulse,
        CPU_CLOCK_INTERVAL
      );

      // .. and call the OS Kernel Bootstrap routine.
      _Kernel = new Kernel();
      _Kernel.krnBootstrap(); // _GLaDOS.afterStartup() will get called in there, if configured.
    }

    private static hostTimeDate() {
      const dateTime = document.getElementById("dateTime");
      const date = new Date();
      dateTime.innerText = date.toTimeString() + "  " + date.toDateString();
      setTimeout(Control.hostTimeDate, 1000);
    }

    public static hostBtnHaltOS_click(btn): void {
      Control.hostLog("Emergency halt", "host");
      Control.hostLog("Attempting Kernel shutdown.", "host");
      // Call the OS shutdown routine.
      _Kernel.krnShutdown();
      // Stop the interval that's simulating our clock pulse.
      clearInterval(_hardwareClockID);
      // TODO: Is there anything else we need to do here?
    }

    public static hostActivateSingleStep_click(e: any) {
      if (!_isSingleStep) {
        // Styles
        e.srcElement.classList.remove("is-link");
        e.srcElement.classList.add("is-danger");
        (<HTMLButtonElement>document.getElementById("next")).disabled = false;
      } else {
        (<HTMLButtonElement>document.getElementById("next")).disabled = true;
        e.srcElement.classList.add("is-link");
        e.srcElement.classList.remove("is-danger");
      }

      _isSingleStep = !_isSingleStep;
    }

    public static hostGetNextStep(_: any) {
      if (_isSingleStep) {
        _CPU.cycle();
      }
    }

    public static hostBtnReset_click(btn): void {
      // The easiest and most thorough way to do this is to reload (not refresh) the document.
      location.reload();
    }

    public static hostGetUserInput(): string {
      const { value } = document.getElementById(
        "taProgramInput"
      ) as HTMLInputElement;

      return value;
    }

    public static hostDisplayCpu(cpu: Cpu) {
      const cpuTable = document.getElementById("cpuBody");
      Utils.removeAllChildNodes(cpuTable);

      const row = document.createElement("tr");

      const pc = document.createElement("td");
      pc.innerText = Utils.showHexValue(cpu.program_counter);

      const ir = document.createElement("td");
      ir.innerText = Utils.showHexValue(cpu.insuction_register);

      const acc = document.createElement("td");
      acc.innerText = Utils.showHexValue(cpu.accumulator);

      const xr = document.createElement("td");
      xr.innerText = Utils.showHexValue(cpu.x_register);

      const yr = document.createElement("td");
      yr.innerText = Utils.showHexValue(cpu.y_register);

      const zr = document.createElement("td");
      zr.innerText = String(cpu.zFlag);

      row.insertAdjacentElement("beforeend", pc);
      row.insertAdjacentElement("beforeend", ir);
      row.insertAdjacentElement("beforeend", acc);
      row.insertAdjacentElement("beforeend", xr);
      row.insertAdjacentElement("beforeend", yr);
      row.insertAdjacentElement("beforeend", zr);
      cpuTable.insertAdjacentElement("beforeend", row);
    }

    public static hostDisplayMemory(memoryArray: Array<number>) {
      const contents = memoryArray;
      const memoryTable = document.getElementById("memoryBody");
      Utils.removeAllChildNodes(memoryTable); // reset the board
      let row = document.createElement("tr");
      let tds = [];
      for (let i = 0; i < contents.length; i++) {
        let td = document.createElement("td");
        td.innerHTML = `<small> ${Utils.showHexValue(contents[i])} </small>`;
        tds.push(td);

        // split table rows by 8
        if ((i + 1) % 8 === 0 && i !== 0) {
          const pre = document.createElement("td");
          pre.innerHTML = `<strong>0x${Utils.showHexValue(i + 1)}</strong>`;
          row.insertAdjacentElement("afterbegin", pre);
          for (let td of tds) {
            row.insertAdjacentElement("beforeend", td);
          }
          memoryTable.insertAdjacentElement("beforeend", row); // insert tow
          row = document.createElement("tr"); // re initilize
          tds = []; // reset row
        }
      }
    }

    public static hostDisplayPcbs(pcb: DisplayPCB) {
      const pcbTable = document.getElementById("pcbBody");
      const row = document.createElement("tr");

      // if null, then remove everything, and return, we have nothing to add here
      if (pcb === null) {
        return Utils.removeAllChildNodes(pcbTable);
      }

      // we dont want duplicates, and we want to presever order here too
      const prevRecord = document.getElementById(String(pcb.pid));
      if (prevRecord) {
        Utils.removeAllChildNodes(prevRecord);
        prevRecord?.remove();
      }

      // lets build our table row
      row.id = String(pcb.pid);

      const pid = document.createElement("td");
      pid.innerText = Utils.showHexValue(pcb.pid);

      const ir = document.createElement("td");
      ir.innerText = Utils.showHexValue(pcb.iRegister);

      const xr = document.createElement("td");
      xr.innerText = Utils.showHexValue(pcb.xRegister);

      const yr = document.createElement("td");
      yr.innerText = Utils.showHexValue(pcb.yRegister);

      const pc = document.createElement("td");
      pc.innerText = Utils.showHexValue(pcb.programCounter);

      const state = document.createElement("td");
      state.innerText = pcb.state;

      row.insertAdjacentElement("beforeend", pid);
      row.insertAdjacentElement("beforeend", ir);
      row.insertAdjacentElement("beforeend", xr);
      row.insertAdjacentElement("beforeend", yr);
      row.insertAdjacentElement("beforeend", pc);
      row.insertAdjacentElement("beforeend", state);

      pcbTable.insertAdjacentElement("beforeend", row);
    }

    public static hostRemoveProcessPid(pid: number) {
      document.getElementById(String(pid))?.remove();
    }
  }
}

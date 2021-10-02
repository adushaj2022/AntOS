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
var TSOS;
(function (TSOS) {
    class Control {
        static hostInit() {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.
            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = document.getElementById("display");
            _Memory = new TSOS.Memory();
            _Memory.init();
            _MemoryAccessor = new TSOS.MemoryAccessor(_Memory); // pass in memory, we will access it through here
            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");
            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            TSOS.CanvasTextFunctions.enable(_DrawingContext); // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.
            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("taHostLog").value = "";
            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("btnStartOS").focus();
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
        static setStatus(msg) {
            document.getElementById("statusText").innerText = `Status: ${msg}`;
        }
        static hostLog(msg, source = "?") {
            // Note the OS CLOCK.
            var clock = _OSclock;
            // Note the REAL clock in milliseconds since January 1, 1970.
            var now = new Date().getTime();
            // Build the log string.
            var str = "({ clock:" +
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
            var taLog = document.getElementById("taHostLog");
            taLog.value = str + taLog.value;
            // TODO in the future: Optionally update a log database or some streaming service.
        }
        //
        // Host Events
        //
        static hostBtnStartOS_click(btn) {
            // Disable the (passed-in) start button...
            btn.disabled = true;
            // .. enable the Halt and Reset buttons ...
            document.getElementById("btnHaltOS").disabled =
                false;
            document.getElementById("btnReset").disabled = false;
            // .. set focus on the OS console display ...
            document.getElementById("display").focus();
            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new TSOS.Cpu(); // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init(); //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.
            this.hostDisplayMemory(_MemoryAccessor.memory.mainMemory); // display memory on start
            this.hostDisplayCpu(_CPU);
            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(TSOS.Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new TSOS.Kernel();
            _Kernel.krnBootstrap(); // _GLaDOS.afterStartup() will get called in there, if configured.
        }
        static hostTimeDate() {
            const dateTime = document.getElementById("dateTime");
            const date = new Date();
            dateTime.innerText = date.toTimeString() + "  " + date.toDateString();
            setTimeout(Control.hostTimeDate, 1000);
        }
        static hostBtnHaltOS_click(btn) {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }
        static hostBtnReset_click(btn) {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload();
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        }
        static hostGetUserInput() {
            const { value } = document.getElementById("taProgramInput");
            return value;
        }
        static hostDisplayCpu(cpu) {
            const cpuTable = document.getElementById("cpuBody");
            TSOS.Utils.removeAllChildNodes(cpuTable);
            const row = document.createElement("tr");
            const pc = document.createElement("td");
            pc.innerText = String(cpu.PC);
            const ir = document.createElement("td");
            ir.innerText = String(cpu.iRegister);
            const acc = document.createElement("td");
            acc.innerText = String(cpu.Acc);
            const xr = document.createElement("td");
            xr.innerText = String(cpu.Xreg);
            const yr = document.createElement("td");
            yr.innerText = String(cpu.Yreg);
            const zr = document.createElement("td");
            zr.innerText = String(cpu.Zflag);
            row.insertAdjacentElement("beforeend", pc);
            row.insertAdjacentElement("beforeend", ir);
            row.insertAdjacentElement("beforeend", acc);
            row.insertAdjacentElement("beforeend", xr);
            row.insertAdjacentElement("beforeend", yr);
            row.insertAdjacentElement("beforeend", zr);
            cpuTable.insertAdjacentElement("beforeend", row);
        }
        static hostDisplayMemory(memoryArray) {
            const contents = memoryArray;
            const memoryTable = document.getElementById("memoryBody");
            TSOS.Utils.removeAllChildNodes(memoryTable); // reset the board
            let row = document.createElement("tr");
            let tds = [];
            for (let i = 0; i < contents.length; i++) {
                let td = document.createElement("td");
                td.innerHTML = `<small> ${TSOS.Utils.showHexValue(contents[i])} </small>`;
                tds.push(td);
                // split table rows by 8
                if ((i + 1) % 8 === 0 && i !== 0) {
                    for (let td of tds) {
                        row.insertAdjacentElement("beforeend", td);
                    }
                    memoryTable.insertAdjacentElement("beforeend", row); // insert tow
                    row = document.createElement("tr"); // re initilize
                    tds = []; // reset rowe
                }
            }
        }
        static hostDisplayPcbs(pcb) {
            const pcbTable = document.getElementById("pcbBody");
            const row = document.createElement("tr");
            /*
              in the future I may want to loop through PCB object and dynamically create tds,
              did not do this now because I fear the order may get messed up
            */
            const pid = document.createElement("td");
            pid.innerText = String(pcb.pid);
            const ir = document.createElement("td");
            ir.innerText = String(pcb.iRegister);
            const xr = document.createElement("td");
            xr.innerText = String(pcb.xRegister);
            const yr = document.createElement("td");
            yr.innerText = String(pcb.yRegister);
            const pc = document.createElement("td");
            pc.innerText = String(pcb.programCounter);
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
    }
    TSOS.Control = Control;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=control.js.map
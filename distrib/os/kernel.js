/* ------------
     Kernel.ts

     Routines for the Operating System, NOT the host.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    class Kernel {
        //
        // OS Startup and Shutdown Routines
        //
        krnBootstrap() {
            // Page 8. {
            TSOS.Control.hostLog("bootstrap", "host"); // Use hostLog because we ALWAYS want this, even if _Trace is off.
            _MemoryManager = new TSOS.MemoryManager(_Memory.mainMemory);
            // Initialize our global queues.
            _KernelInterruptQueue = new TSOS.Queue(); // A (currently) non-priority queue for interrupt requests (IRQs).
            _KernelBuffers = new Array(); // Buffers... for the kernel.
            _KernelInputQueue = new TSOS.Queue(); // Where device input lands before being processed out somewhere.
            _ReadyQueue = new TSOS.Queue();
            _ResidentList = new TSOS.Queue();
            // Initialize the console.
            _Console = new TSOS.Console(); // The command line interface / console I/O device.
            _Console.init();
            // Initialize standard input and output to the _Console.
            _StdIn = _Console;
            _StdOut = _Console;
            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new TSOS.DeviceDriverKeyboard(); // Construct it.
            _krnKeyboardDriver.driverEntry(); // Call the driverEntry() initialization routine.
            this.krnTrace(_krnKeyboardDriver.status);
            //
            // ... more?
            //
            // Starting up our disk
            _Disk = new TSOS.DeviceDisk();
            // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();
            // Launch the shell.
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new TSOS.Shell();
            _OsShell.init();
            // Finally, initiate student testing protocol.
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }
        }
        krnShutdown() {
            this.krnTrace("begin shutdown OS");
            // TODO: Check for running processes.  If there are some, alert and stop. Else...
            // ... Disable the Interrupts.
            this.krnTrace("Disabling the interrupts.");
            this.krnDisableInterrupts();
            //
            // Unload the Device Drivers?
            // More?
            //
            this.krnTrace("end shutdown OS");
        }
        krnOnCPUClockPulse() {
            /* This gets called from the host hardware simulation every time there is a hardware clock pulse.
               This is NOT the same as a TIMER, which causes an interrupt and is handled like other interrupts.
               This, on the other hand, is the clock pulse from the hardware / VM / host that tells the kernel
               that it has to look for interrupts and process them if it finds any.
            */
            // Check for an interrupt, if there are any. Page 560
            if (_KernelInterruptQueue.getSize() > 0) {
                // Process the first interrupt on the interrupt queue.
                // TODO (maybe): Implement a priority queue based on the IRQ number/id to enforce interrupt priority.
                var interrupt = _KernelInterruptQueue.dequeue();
                this.krnInterruptHandler(interrupt.irq, interrupt.params);
            }
            else if (_CPU.isExecuting && !_isSingleStep) {
                // If there are no interrupts then run one CPU cycle if there is anything being processed.
                if (TSOS.RoundRobinScheduler.isActivated && _ReadyQueue.getSize() > 1) {
                    this.krnScheduler();
                }
                else if (TSOS.FirstComeFirstServe.isActivated) {
                    TSOS.FirstComeFirstServe.doCycle();
                }
                else {
                    _CPU.cycle();
                }
            }
            else {
                // If there are no interrupts and there is nothing being executed then just be idle.
                this.krnTrace("Idle");
            }
        }
        //
        // Interrupt Handling
        //
        krnEnableInterrupts() {
            // Keyboard
            TSOS.Devices.hostEnableKeyboardInterrupt();
            // Put more here.
        }
        krnDisableInterrupts() {
            // Keyboard
            TSOS.Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        }
        krnInterruptHandler(irq, params) {
            // This is the Interrupt Handler Routine.  See pages 8 and 560.
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on. Page 766.
            this.krnTrace("Handling IRQ~" + irq);
            // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
            // TODO: Consider using an Interrupt Vector in the future.
            // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.
            //       Maybe the hardware simulation will grow to support/require that in the future.
            switch (irq) {
                case TIMER_IRQ:
                    this.krnTimerISR(); // Kernel built-in routine for timers (not the clock).
                    break;
                case KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params, this.krnTrapError); // Kernel mode device driver
                    _StdIn.handleInput();
                    break;
                case SOFTWARE_IRQ:
                    this.krnSoftwareInterrupt();
                    break;
                default:
                    this.krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
            }
        }
        krnTimerISR() {
            // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver). {
            // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
            // Or do it elsewhere in the Kernel. We don't really need this.
        }
        krnScheduler() {
            TSOS.RoundRobinScheduler.doCycle();
        }
        krnSoftwareInterrupt() {
            TSOS.Control.hostLog("Context switch is occuring", "OS");
        }
        //
        // System Calls... that generate software interrupts via tha Application Programming Interface library routines.
        //
        // Some ideas:
        // - ReadConsole
        // - WriteConsole
        // - CreateProcess
        // - ExitProcess
        // - WaitForProcessToExit
        // - CreateFile
        // - OpenFile
        // - ReadFile
        // - WriteFile
        // - CloseFile
        //
        // OS Utility Routines
        //
        krnTrace(msg) {
            // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
            if (_Trace) {
                if (msg === "Idle") {
                    // We can't log every idle clock pulse because it would quickly lag the browser quickly.
                    if (_OSclock % 10 == 0) {
                        // Check the CPU_CLOCK_INTERVAL in globals.ts for an
                        // idea of the tick rate and adjust this line accordingly.
                        TSOS.Control.hostLog(msg, "OS");
                    }
                }
                else {
                    TSOS.Control.hostLog(msg, "OS");
                }
            }
        }
        krnTrapError(msg) {
            TSOS.Control.hostLog("OS ERROR - TRAP: " + msg);
            // TODO: Display error on console, perhaps in some sort of colored screen. (Maybe blue?)
            this.krnShutdown();
            _OsShell.shellBSOD(msg);
        }
        krnLoadMemory(code, priority) {
            let p = new TSOS.ProcessControlBlock(); // create pcb
            p.pid = _PCB_ID_COUNT++;
            p.priority = priority;
            _ResidentList.enqueue(p); // add to resident queue
            let partitionId = _MemoryManager.usePartition(p);
            if (typeof partitionId === "boolean") {
                p.memoryPartitionId = DISK_PARTITION;
                p.location = "disk";
                TSOS.Swapper.roll_in(code);
            }
            else {
                p.memoryPartitionId = partitionId;
                p.location = "memory";
                console.log("your: ", partitionId);
                _MemoryAccessor.loadMemory(code, partitionId * 256); // load memory
            }
            TSOS.Control.hostDisplayPcbs(p);
            TSOS.Control.hostDisplayMemory(_MemoryAccessor.memory.mainMemory);
            return `PCB created - pid - ${p.pid}`;
        }
        krnClearMemory() {
            _MemoryManager.setPartitions(); // reset partitons
            _MemoryAccessor.memory.fillArray(); // reset to 0s
            _CPU.resetRegisters();
            _ReadyQueue.q.length = 0; // remove from all pcbs from queue
            _ResidentList.q.length = 0;
            _CurrentPartition = 0;
            TSOS.Control.hostDisplayMemory(_MemoryAccessor.memory.mainMemory); // update gui
            TSOS.Control.hostDisplayPcbs(null); // update gui
            TSOS.Control.hostDisplayCpu(_CPU);
        }
    }
    TSOS.Kernel = Kernel;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=kernel.js.map
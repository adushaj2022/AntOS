/* ------------
   Globals.ts

   Global CONSTANTS and _Variables.
   (Global over both the OS and Hardware Simulation / Host.)

   This code references page numbers in our text book:
   Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */

//
// Global CONSTANTS (TypeScript 1.5 introduced const. Very cool.)
//
let _ctrl = false; // Is control key clicked

const APP_NAME: string = "AntOS"; // 'cause Bob and I were at a loss for a better name.
const APP_VERSION: string = "1.01"; // What did you expect?

let _QUANTUM = 6;
const CPU_CLOCK_INTERVAL: number = 50; // This is in ms (milliseconds) so 1000 = 1 second.

const TIMER_IRQ: number = 0; // Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority).
// NOTE: The timer is different from hardware/host clock pulses. Don't confuse these.
const KEYBOARD_IRQ: number = 1;
const SOFTWARE_IRQ: number = 2;
const PARTITION_SIZE = 255;
//
// Global Variables
// TODO: Make a global object and use that instead of the "_" naming convention in the global namespace.
//

let _PCB_ID_COUNT = 0;
let _CurrentPcbId = 0;
// when a user hits run pid, we need to know which memory partition is being used
let _CurrentPartition = 0;

var _CPU: TSOS.Cpu; // Utilize TypeScript's type annotation system to ensure that _CPU is an instance of the Cpu class.

var _Memory: TSOS.Memory;
var _MemoryAccessor: TSOS.MemoryAccessor;
//	Software	(OS)
var _MemoryManager: TSOS.MemoryManager = null;

var _OSclock: number = 0; // Page 23.

var _Mode: number = 0; // (currently unused)  0 = Kernel Mode, 1 = User Mode.  See page 21.

var _Canvas: HTMLCanvasElement; // Initialized in Control.hostInit().
var _DrawingContext: any; // = _Canvas.getContext("2d");  // Assigned here for type safety, but re-initialized in Control.hostInit() for OCD and logic.
var _DefaultFontFamily: string = "sans"; // Ignored, I think. The was just a place-holder in 2008, but the HTML canvas may have use for it.
var _DefaultFontSize: number = 13;
var _FontHeightMargin: number = 4; // Additional space added to font size when advancing a line.

var _Trace: boolean = true; // Default the OS trace to be on.

// The OS Kernel and its queues.
var _Kernel: TSOS.Kernel;
var _KernelInterruptQueue: TSOS.Queue<any> = null;
var _KernelInputQueue: TSOS.Queue<any> = null;
var _KernelBuffers = null;
var _ReadyQueue: TSOS.Queue<TSOS.ProcessControlBlock> | null = null;
var _ResidentList: TSOS.Queue<TSOS.ProcessControlBlock> | null = null;
// Standard input and output
var _StdIn: TSOS.Console = null;
var _StdOut: TSOS.Console = null;

// UI
var _Console: TSOS.Console;
var _OsShell: TSOS.Shell;

// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode: boolean = false;

// Global Device Driver Objects - page 12
var _krnKeyboardDriver: TSOS.DeviceDriverKeyboard = null;

var _hardwareClockID: number = null;

// For testing (and enrichment)...
var Glados: any = null; // This is the function Glados() in glados-ip*.js http://alanclasses.github.io/TSOS/test/ .
var _GLaDOS: any = null; // If the above is linked in, this is the instantiated instance of Glados.

let _isSingleStep = false;

type DisplayPCB = {
  pid: number;
  iRegister: number;
  xRegister: number;
  yRegister: number;
  programCounter: number;
  state: string;
};

var onDocumentLoad = function () {
  TSOS.Control.hostInit();
};

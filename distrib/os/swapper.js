var TSOS;
(function (TSOS) {
    class Swapper {
        static roll_in(data) {
            // write to disk
            if (!_Disk.isFormatted) {
                _Disk.initialize();
            }
            // fill name will be `.process{id}`, we wont show this to users, so distinguish with . as file name
            let file_name = `.process${_PCB_ID_COUNT}`;
            _Disk.touch(file_name);
            // convert numbers back to strings
            let new_data = data.map((hex) => hex.toString(16));
            _Disk.echo(file_name, new_data, true);
            TSOS.Control.hostDisplayDisk();
        }
        static roll_out(partitionId, diskProcessId, prevId) {
            // put code from disk into memory, and write code from memory to disk
            // temp array of code from memory
            let memoryCode = [];
            for (let i = 0; i <= PARTITION_SIZE; i++) {
                memoryCode[i] = _MemoryAccessor
                    .readIntermediate(i, partitionId)
                    .toString(16);
            }
            let rawData = true;
            let fileName = `.process${diskProcessId + 1}`;
            let diskCode = _Disk.cat(fileName, rawData).split(",");
            if (diskCode.length > 255) {
                diskCode.length = 256;
            }
            else {
                let count = 0;
                while (count++ < 255) {
                    if (typeof diskCode[count] == "undefined") {
                        diskCode[count] = 0;
                    }
                }
            }
            diskCode = diskCode.map((num) => parseInt(num, 16));
            console.log(`SWITHCING FROM ${diskProcessId} TO ${prevId}`);
            // now we have our disk and memory code, we can swap
            for (let i = 0; i < PARTITION_SIZE; i++) {
                _MemoryManager.mainMemory[i + 256 * partitionId] = diskCode[i];
            }
            _Disk.rm(fileName);
            _Disk.touch(fileName);
            _Disk.echo(fileName, [...memoryCode], true);
            TSOS.Control.hostDisplayDisk();
        }
    }
    TSOS.Swapper = Swapper;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=swapper.js.map
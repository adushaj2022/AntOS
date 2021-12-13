var TSOS;
(function (TSOS) {
    class Swapper {
        static roll_in(data) {
            // write to disk
            if (!_Disk.isFormatted) {
                _Disk.initialize();
            }
            // fill name will be `process{id}`
            let file_name = `process${_PCB_ID_COUNT}`;
            _Disk.touch(file_name);
            // convert numbers back to strings
            let new_data = data.map((hex) => hex.toString(16));
            _Disk.echo(file_name, new_data, true);
            TSOS.Control.hostDisplayDisk();
        }
        static roll_out(partitionId, diskProcessId) {
            // put code from disk into memory, and write code from memory to disk
            // temporary array of code from memory
            let temp = [];
            for (let i = 0; i < PARTITION_SIZE - 1; i++) {
                temp[i] = _MemoryAccessor.readIntermediate(i, partitionId).toString(16);
            }
            for (let i = 0; i < temp.length - 1; i++) {
                if (temp[i] == "0" && temp[i] == temp[i + 1]) {
                    temp.length = i + 1; // chop off extra zeros
                    break;
                }
            }
            // write this temp code to disk
            // move code from disk into memory
            console.log(temp);
        }
    }
    TSOS.Swapper = Swapper;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=swapper.js.map
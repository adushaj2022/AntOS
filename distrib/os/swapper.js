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
        static roll_out() {
            // read from disk and place process on ready queue
        }
    }
    TSOS.Swapper = Swapper;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=swapper.js.map
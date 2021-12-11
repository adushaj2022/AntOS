module TSOS {
  export class Swapper {
    public static roll_in(data: Array<number>) {
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
      Control.hostDisplayDisk();
    }
    public static roll_out() {
      // read from disk and place process on ready queue
    }
  }
}

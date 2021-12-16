module TSOS {
  export class Swapper {
    /**
     * Simply loading programs into disk, we dont want to encode any data, so lets have our own method for this,
     * this will wrap the _Disk write file method, which I called echo to mimic Linux style commands
     * @param data
     */
    public static roll_in(data: Array<number>) {
      // write to disk
      if (!_Disk.isFormatted) {
        _Disk.initialize();
      }
      // fill name will be `.process{id}`, we wont show this to users, so distinguish with . as file name
      let file_name = `.process${_PCB_ID_COUNT}`;
      // create file
      _Disk.touch(file_name);
      // convert numbers back to strings
      let new_data = data.map((hex) => hex.toString(16));
      _Disk.echo(file_name, new_data, true);
      Control.hostDisplayDisk();
    }
    /**
     *
     *  put code from disk into memory, and write code from memory to disk
     */

    public static roll_out(
      partitionId: number,
      diskProcessId: number,
      prevId: number
    ) {
      // temp array of code from memory
      let memoryCode = [];
      for (let i = 0; i <= PARTITION_SIZE; i++) {
        memoryCode[i] = _MemoryAccessor
          .readIntermediate(i, partitionId)
          .toString(16);
      }

      // we want hex back
      let rawData = true;
      let fileName = `.process${diskProcessId + 1}`;
      let diskCode: any[] = _Disk.cat(fileName, rawData).split(",");

      if (diskCode.length > 255) {
        diskCode.length = 256;
      } else {
        let count = 0;
        // fill with zeros, length needs to be 256, and must contain 0s if not in use
        while (count++ < 255) {
          if (typeof diskCode[count] == "undefined") {
            diskCode[count] = 0;
          }
        }
      }
      diskCode = diskCode.map((num) => parseInt(num, 16)) as number[];

      console.log(`SWITHCING FROM ${diskProcessId} TO ${prevId}`);

      // now we have our disk and memory code, we can swap
      for (let i = 0; i < PARTITION_SIZE; i++) {
        _MemoryManager.mainMemory[i + 256 * partitionId] = diskCode[i];
      }

      // remove the old data
      _Disk.rm(fileName);
      _Disk.touch(fileName);
      // add in the new data from memory
      _Disk.echo(fileName, [...memoryCode], true);

      // update GUI
      Control.hostDisplayDisk();
    }
  }
}

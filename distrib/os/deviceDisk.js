var TSOS;
(function (TSOS) {
    class DeviceDisk {
        constructor() {
            this.KEY_SIZE = 255;
        }
        initialize() {
            // setting our keys
            for (let i = 0; i <= this.KEY_SIZE; i++) {
                let j = Number(i).toString(8).padStart(3, "0");
                let key = j.split("").join(":");
                if (key.length === 1) {
                    key = key + ":0:0";
                }
                else {
                    key = key.padEnd(5, "0");
                }
                let value = {
                    bit: 0,
                    chain: "0:0:0",
                    encoded: new Array(60).fill("00"),
                };
                sessionStorage.setItem(key, JSON.stringify(value));
            }
        }
    }
    TSOS.DeviceDisk = DeviceDisk;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=deviceDisk.js.map
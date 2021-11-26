var TSOS;
(function (TSOS) {
    class DeviceDisk {
        constructor() {
            this.KEY_SIZE = 255;
            this.DIRECTORY_LIMIT = 64; // 0:7:7
            this.ENCODED_DATA_LENGTH = 60;
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
                // lets use an object to hold all of the values, simple and cleanest way to do it
                let value = {
                    bit: 0,
                    chain: "0:0:0",
                    encoded: new Array(this.ENCODED_DATA_LENGTH).fill("00"),
                };
                // JSON stringify will store as a string, then we use JSON.parse to make an object again
                sessionStorage.setItem(key, JSON.stringify(value));
            }
        }
        /**
         * Creating a file
         */
        touch(file_name) {
            let available = this.getFirstSlot([0, this.DIRECTORY_LIMIT]);
            // all in use
            if (available === false) {
                return false;
            }
            // encode file name, in our available slot
            let encoded_file_name = this.encodeHex(file_name);
            // parse our json object
            let newSlot = JSON.parse(sessionStorage.getItem(available));
            // putting our ascii numbers, then filling the rest of the array with 0s
            newSlot.encoded = this.encodeData(encoded_file_name, newSlot.encoded);
            newSlot.bit = 1; // now in use
            newSlot.chain = this.getFirstSlot([this.DIRECTORY_LIMIT, this.KEY_SIZE]); // point to first available data slot
            // no data slots available
            if (newSlot.chain === false) {
                return false;
            }
            // update our chain to in use
            this.updateToInUse(newSlot.chain);
            // set our updated object
            sessionStorage.setItem(available, JSON.stringify(newSlot));
            return true;
        }
        /**
         * boundaries will be the section in storage to retrieve,
         * for directory it will be 0 - 0:7:7, data will be 1:0:0 - 3:7:7,
         * therefore this function can be used for retreiving both
         * @param boundaries
         */
        getFirstSlot(boundaries) {
            // sort our keys first, so we get the right ones
            let sessionKeys = Object.keys(sessionStorage)
                .sort()
                .slice(...boundaries);
            for (let key of sessionKeys) {
                let slot = sessionStorage.getItem(key);
                // skip first one or falsey values
                if (!slot || key === "0:0:0") {
                    continue;
                }
                let bit = JSON.parse(slot).bit;
                // found one, return it
                if (bit === 0) {
                    return key;
                }
            }
            return false;
        }
        updateToInUse(key) {
            let dataPointerObj = sessionStorage.getItem(key);
            dataPointerObj = JSON.parse(dataPointerObj);
            dataPointerObj.bit = 1;
            sessionStorage.setItem(key, JSON.stringify(dataPointerObj));
        }
        /**
         * simply return an array of ascii chars
         * @param word
         */
        encodeHex(word) {
            let result = [];
            for (let i = 0; i < word.length; i++) {
                result.push(word.charCodeAt(i).toString(16));
            }
            return result;
        }
        encodeData(newData, oldData) {
            let n = newData.length;
            return newData.concat(oldData.splice(n, this.ENCODED_DATA_LENGTH));
        }
    }
    TSOS.DeviceDisk = DeviceDisk;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=deviceDisk.js.map
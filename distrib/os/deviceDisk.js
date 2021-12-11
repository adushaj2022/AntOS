var TSOS;
(function (TSOS) {
    class DeviceDisk {
        constructor() {
            this.KEY_SIZE = 255;
            this.DIRECTORY_LIMIT = 64; // 0:7:7
            this.ENCODED_DATA_LENGTH = 60;
            this.isFormatted = false;
        }
        // format
        initialize() {
            this.isFormatted = true;
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
            if (this.doesFileExist(file_name)) {
                return "file already exists";
            }
            let available = this.getFirstSlot([0, this.DIRECTORY_LIMIT]);
            // all in use
            if (available === false) {
                return "out of space for files";
            }
            // encode file name, in our available slot
            let encoded_file_name = this.encodeHex(file_name);
            // parse our json object
            let newSlot = JSON.parse(sessionStorage.getItem(available));
            // putting our ascii numbers, then filling the rest of the array with 0s
            newSlot.encoded = this.setSlotData(encoded_file_name, newSlot.encoded);
            newSlot.bit = 1; // now in use
            newSlot.chain = this.getFirstSlot([this.DIRECTORY_LIMIT, this.KEY_SIZE]); // point to first available data slot
            // no data slots available
            if (newSlot.chain === false) {
                return "out of space for data";
            }
            // update our chain to in use
            this.updateToInUse(newSlot.chain);
            // set our updated object
            sessionStorage.setItem(available, JSON.stringify(newSlot));
            return "file created";
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
        /**
         *
         * listing out files
         */
        ls() {
            let res = [];
            let sessionKeys = Object.keys(sessionStorage)
                .sort()
                .slice(0, this.DIRECTORY_LIMIT);
            for (let key of sessionKeys) {
                let val = sessionStorage.getItem(key);
                let serialized = JSON.parse(val);
                if (serialized.bit === 1) {
                    res.push(this.decodeData(serialized.encoded));
                }
            }
            return res;
        }
        /**
         * writing to a file
         * @param file_name
         * @param content
         */
        echo(file_name, content, isEncoded = false) {
            let key = this.doesFileExist(file_name);
            if (!key) {
                return `file '${file_name}' does not exist'`;
            }
            // given string to ascii numbers
            let encodedContent;
            if (isEncoded) {
                encodedContent = content;
            }
            else {
                encodedContent = this.encodeHex(content);
            }
            // directory slot
            let dirSlot = JSON.parse(sessionStorage.getItem(key));
            // data slot, we must write to this one, acquire by the dir slots chain
            let dataSlot = JSON.parse(sessionStorage.getItem(dirSlot.chain));
            // long text given
            if (encodedContent.length > 60) {
                return this.handleMultiLineData(encodedContent, key);
            }
            dataSlot.encoded = this.setSlotData(encodedContent, dataSlot.encoded);
            // set data slot with encoded characcters
            sessionStorage.setItem(dirSlot.chain, JSON.stringify(dataSlot));
            return "data written to file successfully";
        }
        // similar to writing, but we will handle this a bit different
        handleMultiLineData(data, key) {
            const LENGTH_LIMIT = 60;
            let slots = new Array();
            let i = 0;
            // creating multiple 60 or less length arrays out of N length
            while (data.length > 60) {
                slots.push(data.splice(i * LENGTH_LIMIT, Math.min(LENGTH_LIMIT, data.length)));
            }
            // this is the last array to add, we need to fill in the remaining length with 0s if it necessary
            let tempLength = new Number(data.length);
            data.length = 60;
            data.fill("00", tempLength, 60);
            slots.push(data);
            let currKey = JSON.parse(sessionStorage.getItem(key)).chain;
            let nextChain;
            let len = 0;
            for (let slot of slots) {
                let newSlot = JSON.parse(sessionStorage.getItem(currKey)); //parse
                nextChain = this.getFirstSlot([
                    // next available
                    this.DIRECTORY_LIMIT,
                    this.KEY_SIZE,
                ]); // basically add 1
                newSlot.bit = 1; // set to in use
                newSlot.encoded = [...slot]; // set data from above
                newSlot.chain = len === slots.length - 1 ? "0:0:0" : nextChain; // last slot has no chain
                sessionStorage.setItem(currKey, JSON.stringify(newSlot)); // set new slot
                currKey = nextChain;
                len++;
            }
            return "data written to file successfully";
        }
        /**
         * reading from a file
         * @param file_name
         */
        cat(file_name) {
            let key = this.doesFileExist(file_name);
            if (!key) {
                return `file '${file_name}' does not exist'`;
            }
            // directory slot
            let dirSlot = JSON.parse(sessionStorage.getItem(key));
            // data slot, we must read this one, acquire by the dir slots chain
            let dataSlot = JSON.parse(sessionStorage.getItem(dirSlot.chain));
            let decoded = "";
            // decode the ascii
            if (dataSlot.chain === "0:0:0") {
                decoded = this.decodeData(dataSlot.encoded);
            }
            else {
                let curr = dataSlot;
                while (curr.chain !== "0:0:0") {
                    decoded += this.decodeData(curr.encoded);
                    curr = { ...JSON.parse(sessionStorage.getItem(curr.chain)) };
                }
                decoded += this.decodeData(curr.encoded);
            }
            return decoded ? decoded : "no contents for this file";
        }
        rm(file_name) {
            let key = this.doesFileExist(file_name);
            if (!key) {
                return `file '${file_name}' does not exist'`;
            }
            // directory slot
            let dirSlot = JSON.parse(sessionStorage.getItem(key));
            let emptyValue = {
                bit: 0,
                chain: "0:0:0",
                encoded: new Array(this.ENCODED_DATA_LENGTH).fill("00"),
            };
            // remove from dir
            sessionStorage.setItem(key, JSON.stringify(emptyValue));
            // remove from data slot
            sessionStorage.setItem(dirSlot.chain, JSON.stringify(emptyValue));
            return `file '${file_name}' deleted'`;
        }
        // false if does not exist, return key if exists
        doesFileExist(file_name) {
            let ans = false;
            Object.entries(sessionStorage)
                .sort()
                .slice(0, this.DIRECTORY_LIMIT) // only directory data
                .filter(([_, val]) => JSON.parse(val).bit === 1) // filter out ones that arent used
                .forEach(([key, value]) => {
                // look for the same name given
                let serialized = JSON.parse(value);
                if (this.decodeData(serialized.encoded) === file_name) {
                    ans = key;
                }
            });
            return ans;
        }
        updateToInUse(key) {
            let dataPointerObj = sessionStorage.getItem(key);
            dataPointerObj = JSON.parse(dataPointerObj);
            dataPointerObj.bit = 1; // set from 0 to 1;
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
        /*
          encoded will be a string of 0s, we want to add our now data in, and fill in any remainingg 0s with this method
        */
        setSlotData(newData, oldData) {
            let n = newData.length;
            return newData.concat(oldData.splice(n, this.ENCODED_DATA_LENGTH));
        }
        decodeData(encodedData) {
            let ans = "";
            let i = 0;
            while (encodedData[i] !== "00") {
                ans += String.fromCharCode(parseInt(encodedData[i], 16));
                i++;
                if (i === encodedData.length - 1) {
                    break;
                }
            }
            return ans;
        }
    }
    TSOS.DeviceDisk = DeviceDisk;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=deviceDisk.js.map
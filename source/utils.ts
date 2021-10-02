/* --------
   Utils.ts

   Utility functions.
   -------- */

module TSOS {
  export class Utils {
    public static trim(str): string {
      // Use a regular expression to remove leading and trailing spaces.
      return str.replace(/^\s+ | \s+$/g, "");
      /*
            Huh? WTF? Okay... take a breath. Here we go:
            - The "|" separates this into two expressions, as in A or B.
            - "^\s+" matches a sequence of one or more whitespace characters at the beginning of a string.
            - "\s+$" is the same thing, but at the end of the string.
            - "g" makes is global, so we get all the whitespace.
            - "" is nothing, which is what we replace the whitespace with.
            */
    }

    public static rot13(str: string): string {
      /*
               This is an easy-to understand implementation of the famous and common Rot13 obfuscator.
               You can do this in three lines with a complex regular expression, but I'd have
               trouble explaining it in the future.  There's a lot to be said for obvious code.
            */
      var retVal: string = "";
      for (var i in <any>str) {
        // We need to cast the string to any for use in the for...in construct.
        var ch: string = str[i];
        var code: number = 0;
        if ("abcedfghijklmABCDEFGHIJKLM".indexOf(ch) >= 0) {
          code = str.charCodeAt(Number(i)) + 13; // It's okay to use 13.  It's not a magic number, it's called rot13.
          retVal = retVal + String.fromCharCode(code);
        } else if ("nopqrstuvwxyzNOPQRSTUVWXYZ".indexOf(ch) >= 0) {
          code = str.charCodeAt(Number(i)) - 13; // It's okay to use 13.  See above.
          retVal = retVal + String.fromCharCode(code);
        } else {
          retVal = retVal + ch;
        }
      }
      return retVal;
    }

    /**
     *
     * This is a function I wrote to calculate longest common prefix,
     * It will be used when using tab completion and will provide the most relevant
     * command for the user
     */
    public static longestCommonPrefix(strs: string[]): string {
      let str = strs[0];
      let res = "";
      for (let i = 0; i < str.length; i++) {
        let flag = true;
        for (let j = 1; j < strs.length; j++) {
          if (strs[j][i] === str[i]) {
            continue;
          } else {
            flag = false;
          }
        }
        if (flag) res += str[i];
        else return res;
      }
      return res;
    }

    // Way to make our hex look better 0 --> 00 or 9 --> 09
    public static showHexValue(num: number, len: number = 2): string {
      return num.toString(16).toUpperCase().padStart(len, "0");
    }

    public static twos_comp(hex_number: number): number {
      //get twos comp of a number (for branching)

      const flip_bits = (str) =>
        str
          .split("")
          .map((x) => (1 - x).toString())
          .join(""); //flip bits

      let num: string = flip_bits(hex_number.toString(2)); //turn into decimal

      let res: number = parseInt(num, 2) + 1; //add 1

      return res;
    }

    public static instructionSetMap() {
      const map: Map<number, number> = new Map<number, number>(); //hashmap of insctrutions

      map.set(0xa9, 1); // map each instruction to the amount of steps it takes
      map.set(0xad, 2);
      map.set(0x8d, 2);
      map.set(0x8a, 0);
      map.set(0x98, 0);
      map.set(0x6d, 2);
      map.set(0xa2, 1);
      map.set(0xae, 2);
      map.set(0xaa, 0);
      map.set(0xa0, 1);
      map.set(0xac, 2);
      map.set(0xa8, 0);
      map.set(0xea, 0);
      map.set(0x00, 0);
      map.set(0xec, 2);
      map.set(0xd0, 1);
      map.set(0xee, 2);
      map.set(0xff, 0);

      return map;
    }

    // REFERENCE: https://www.javascripttutorial.net/dom/manipulating/remove-all-child-nodes/
    // Helper method to delete all children nodes of an html element
    public static removeAllChildNodes(element: HTMLElement) {
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
    }
  }
}

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

    // REFERENCE: https://www.javascripttutorial.net/dom/manipulating/remove-all-child-nodes/
    // Helper method to delete all children nodes of an html element
    public static removeAllChildNodes(element: HTMLElement) {
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
    }
  }
}

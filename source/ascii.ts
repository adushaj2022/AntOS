module TSOS {
  /**
   * Mini Ascii library, this was apart of Professor Gormanlys project requirements, thought it may be cool to add
   */
  export class Ascii {
    private static Dictionary: Map<number, string> = new Map<number, string>();

    public static fromCharCode(asciNum: number): string {
      Ascii.populateMap();

      for (const [key, value] of Ascii.Dictionary.entries()) {
        if (key === asciNum) {
          return value;
        }
      }

      throw new Error("No Corresponding Asci Char");
    }

    public static fromAsciiCode(char: string): number {
      Ascii.populateMap();
      for (const [key, value] of Ascii.Dictionary.entries()) {
        if (value === char) {
          return key;
        }
      }

      throw new Error("No Corresponding Asci Number");
    }

    private static populateMap(): void {
      Ascii.Dictionary.set(0x0a, "\n");

      Ascii.Dictionary.set(0x20, " ");
      Ascii.Dictionary.set(0x21, "!");
      Ascii.Dictionary.set(0x22, '"');
      Ascii.Dictionary.set(0x23, "#");
      Ascii.Dictionary.set(0x24, "$");
      Ascii.Dictionary.set(0x25, "%");
      Ascii.Dictionary.set(0x26, "&");
      Ascii.Dictionary.set(0x27, "'");
      Ascii.Dictionary.set(0x28, "(");
      Ascii.Dictionary.set(0x29, ")");
      Ascii.Dictionary.set(0x2a, "*");
      Ascii.Dictionary.set(0x2b, "+");
      Ascii.Dictionary.set(0x2c, ",");
      Ascii.Dictionary.set(0x2d, "-");
      Ascii.Dictionary.set(0x2e, ".");
      Ascii.Dictionary.set(0x2f, "/");

      Ascii.Dictionary.set(0x30, "0");
      Ascii.Dictionary.set(0x31, "1");
      Ascii.Dictionary.set(0x32, "2");
      Ascii.Dictionary.set(0x33, "3");
      Ascii.Dictionary.set(0x34, "4");
      Ascii.Dictionary.set(0x35, "5");
      Ascii.Dictionary.set(0x36, "6");
      Ascii.Dictionary.set(0x37, "7");
      Ascii.Dictionary.set(0x38, "8");
      Ascii.Dictionary.set(0x39, "9");

      Ascii.Dictionary.set(0x3a, ":");
      Ascii.Dictionary.set(0x3b, ";");
      Ascii.Dictionary.set(0x3c, "<");
      Ascii.Dictionary.set(0x3d, "=");
      Ascii.Dictionary.set(0x3e, ">");
      Ascii.Dictionary.set(0x3f, "?");
      Ascii.Dictionary.set(0x40, "@");

      Ascii.Dictionary.set(0x41, "A");
      Ascii.Dictionary.set(0x42, "B");
      Ascii.Dictionary.set(0x43, "C");
      Ascii.Dictionary.set(0x44, "D");
      Ascii.Dictionary.set(0x45, "E");
      Ascii.Dictionary.set(0x46, "F");
      Ascii.Dictionary.set(0x47, "G");
      Ascii.Dictionary.set(0x48, "H");
      Ascii.Dictionary.set(0x49, "I");
      Ascii.Dictionary.set(0x4a, "J");
      Ascii.Dictionary.set(0x4b, "K");
      Ascii.Dictionary.set(0x4c, "L");
      Ascii.Dictionary.set(0x4d, "M");
      Ascii.Dictionary.set(0x4e, "N");
      Ascii.Dictionary.set(0x4f, "O");
      Ascii.Dictionary.set(0x50, "P");
      Ascii.Dictionary.set(0x51, "Q");
      Ascii.Dictionary.set(0x52, "R");
      Ascii.Dictionary.set(0x53, "S");
      Ascii.Dictionary.set(0x54, "T");
      Ascii.Dictionary.set(0x55, "U");
      Ascii.Dictionary.set(0x56, "V");
      Ascii.Dictionary.set(0x57, "W");
      Ascii.Dictionary.set(0x58, "X");
      Ascii.Dictionary.set(0x59, "Y");
      Ascii.Dictionary.set(0x5a, "Z");

      Ascii.Dictionary.set(0x5b, "[");
      Ascii.Dictionary.set(0x5d, "]");
      Ascii.Dictionary.set(0x5e, "^");
      Ascii.Dictionary.set(0x5f, "_");
      Ascii.Dictionary.set(0x60, "`");

      Ascii.Dictionary.set(0x61, "a");
      Ascii.Dictionary.set(0x62, "b");
      Ascii.Dictionary.set(0x63, "c");
      Ascii.Dictionary.set(0x64, "d");
      Ascii.Dictionary.set(0x65, "e");
      Ascii.Dictionary.set(0x66, "f");
      Ascii.Dictionary.set(0x67, "g");
      Ascii.Dictionary.set(0x68, "h");
      Ascii.Dictionary.set(0x69, "i");
      Ascii.Dictionary.set(0x6a, "j");
      Ascii.Dictionary.set(0x6b, "k");
      Ascii.Dictionary.set(0x6c, "l");
      Ascii.Dictionary.set(0x6d, "k");
      Ascii.Dictionary.set(0x6e, "n");
      Ascii.Dictionary.set(0x6f, "o");
      Ascii.Dictionary.set(0x70, "p");
      Ascii.Dictionary.set(0x71, "q");
      Ascii.Dictionary.set(0x72, "r");
      Ascii.Dictionary.set(0x73, "s");
      Ascii.Dictionary.set(0x74, "t");
      Ascii.Dictionary.set(0x75, "u");
      Ascii.Dictionary.set(0x76, "v");
      Ascii.Dictionary.set(0x77, "w");
      Ascii.Dictionary.set(0x78, "x");
      Ascii.Dictionary.set(0x79, "y");
      Ascii.Dictionary.set(0x7a, "z");

      Ascii.Dictionary.set(0x7b, "{");
      Ascii.Dictionary.set(0x7c, "|");
      Ascii.Dictionary.set(0x7d, "}");
      Ascii.Dictionary.set(0x7f, "~");
    }
  }
}

/* ------------
   Queue.ts

   A simple Queue, which is really just a dressed-up JavaScript Array.
   See the JavaScript Array documentation at
   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
   Look at the push and shift methods, as they are the least obvious here.

   ------------ */

module TSOS {
  export class Queue<arrType> {
    constructor(public q = new Array<arrType>()) {}

    public getSize() {
      return this.q.length;
    }

    public isEmpty() {
      return this.q.length === 0;
    }

    public enqueue(element) {
      this.q.push(element);
    }

    public peekFirst() {
      return this.q[0];
    }

    public peekLast() {
      return this.q[this.q.length - 1];
    }

    public dequeue() {
      var retVal = null;
      if (this.q.length > 0) {
        retVal = this.q.shift();
      }
      return retVal;
    }

    public pollLast() {
      var retVal = null;
      if (this.q.length > 0) {
        retVal = this.q.pop();
      }
      return retVal;
    }

    public toString() {
      var retVal = "";
      for (var i in this.q) {
        retVal += "[" + this.q[i] + "] ";
      }
      return retVal;
    }
  }
}
